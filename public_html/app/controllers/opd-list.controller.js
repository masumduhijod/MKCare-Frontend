/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * ============================================
 * OPD LIST CONTROLLER - COMPLETE MANAGEMENT
 * ============================================
 * Features:
 * - View all OPD records (Vitals, Consultations, Prescriptions)
 * - Date range filtering
 * - Edit/Update/Delete functionality
 * - Beautiful UI with modals
 * - Search by PIN, CVR, Patient Name
 * ============================================
 */

app.controller('OPDListController', ['$scope', '$rootScope', '$location', '$http', '$filter',
    'OPDService', 'CVRService', 'PatientService', 'AuthService', 'AppointmentService', 'DoctorService',
    function ($scope, $rootScope, $location, $http, $filter, OPDService, CVRService, PatientService, AuthService, AppointmentService, DoctorService) {

        var currentUser = AuthService.getCurrentUser();

        console.log('========== OPD LIST INITIALIZED ==========');

        // Initialize
        $scope.loading = false;
        $scope.records = [];
        $scope.filteredRecords = [];
        // Doctor dropdown
        $scope.doctorList = [];
//    $scope.selectedDoctorId = "";
        $scope.selectedDoctorId = null;
        $scope.cvrList = [];
        $scope.selectedDate = new Date();  // ADD THIS LINE
// Filters
        $scope.filters = {
            searchType: 'ALL',
            searchQuery: '',
            status: 'ALL'
        };

////     Date Filters
//    $scope.filters = {
//        fromDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
//        toDate: new Date().toISOString().split('T')[0],
//        searchType: 'ALL', // ALL, PIN, CVR, NAME
//        searchQuery: '',
//        status: 'ALL' // ALL, PENDING, COMPLETED
//    };

        // Pagination
        $scope.pagination = {
            currentPage: 1,
            itemsPerPage: 10,
            totalItems: 0,
            totalPages: 0
        };

        // Statistics
        $scope.stats = {
            total: 0,
            withVitals: 0,
            withConsultation: 0,
            withPrescription: 0,
            completed: 0
        };

        // Modals
        $scope.showVitalsModal = false;
        $scope.showConsultationModal = false;
        $scope.showPrescriptionModal = false;
        $scope.showLOVModal = false;

        // Selected Records
        $scope.selectedVitals = null;
        $scope.selectedConsultation = null;
        $scope.selectedPrescription = null;
        $scope.lovResults = [];

        // ✅ BEAUTIFUL CONFIRM DIALOG SETUP
        $scope.confirmDialog = {
            show: false,
            type: 'info', // info, warning, danger, success
            title: '',
            message: '',
            subMessage: '',
            icon: 'fa-question-circle',
            okText: 'OK',
            cancelText: 'Cancel',
            confirm: function () {},
            cancel: function () {
                $scope.confirmDialog.show = false;
            }
        };

        /**
         * 💎 Helper to show beautiful confirmation
         */
        $scope.showConfirm = function (options) {
            $scope.confirmDialog.show = true;
            $scope.confirmDialog.type = options.type || 'info';
            $scope.confirmDialog.title = options.title || 'Are you sure?';
            $scope.confirmDialog.message = options.message || '';
            $scope.confirmDialog.subMessage = options.subMessage || '';
            $scope.confirmDialog.icon = options.icon || 'fa-question-circle';
            $scope.confirmDialog.okText = options.okText || 'Yes';
            $scope.confirmDialog.cancelText = options.cancelText || 'No';
            $scope.confirmDialog.confirm = function () {
                $scope.confirmDialog.show = false;
                if (options.onConfirm)
                    options.onConfirm();
            };
        };

        /**
         * 💎 Helper to show beautiful alert / notification
         */
        $scope.showNotify = function (type, title, msg) {
            $scope.confirmDialog.show = true;
            $scope.confirmDialog.type = type;
            $scope.confirmDialog.title = title;
            $scope.confirmDialog.message = msg;
            $scope.confirmDialog.subMessage = '';
            $scope.confirmDialog.icon = type === 'danger' ? 'fa-exclamation-circle' : 'fa-info-circle';
            $scope.confirmDialog.okText = 'OK';
            $scope.confirmDialog.cancelText = ''; // Hide cancel button
            $scope.confirmDialog.confirm = function () {
                $scope.confirmDialog.show = false;
            };
            // Override cancel to also close
            $scope.confirmDialog.cancel = function () {
                $scope.confirmDialog.show = false;
            };
        };



        /**
         * ✅ PROCESS CVR RECORDS TO GET COMPLETE DATA
         */
        $scope.processRecords = function (cvrs) {
            $scope.records = [];

            if (!cvrs || cvrs.length === 0) {
                $scope.filteredRecords = [];
                $scope.updatePagination();
                $scope.calculateStats();
                return;
            }

            let pendingAsync = cvrs.length;

            cvrs.forEach(function (cvr) {

                let record = {
                    cvrNumber: cvr.cvrNumber,
                    pinNumber: cvr.pinNumber,
                    patientName: cvr.patientName || 'Unknown',
                    visitType: cvr.visitType,
                    visitDate: cvr.createdAt,
                    doctorId: cvr.doctorId,

                    vitals: null,
                    consultation: null,
                    prescription: null,

                    hasVitals: false,
                    hasConsultation: false,
                    hasPrescription: false,

                    status: 'PENDING'
                };

                // 🔹 VITALS
                CVRService.getVitals(cvr.cvrNumber).then(res => {
                    if (res.data.success && res.data.data.length) {
                        record.vitals = res.data.data[0];
                        record.hasVitals = true;
                    }
                });

                // 🔹 CONSULTATION + PRESCRIPTION
                $http.get(API_CONFIG.GATEWAY_URL +
                        API_CONFIG.ENDPOINTS.CONSULTATION.GET_BY_CVR.replace('{cvrNumber}', cvr.cvrNumber)
                        ).then(res => {
                    if (res.data.success && res.data.data) {
                        record.consultation = res.data.data;
                        record.hasConsultation = true;

                    }
                }).finally(() => {
                    pendingAsync--;
                    if (pendingAsync === 0) {
                        record.status = normalizeStatus(cvr.status, record);
                        $scope.$applyAsync(() => {
                            $scope.applyFilters();
                        });
                    }
                });

                $scope.records.push(record);
            });
        };

        /**
         * ✅ SEARCH FUNCTIONALITY
         */
        $scope.search = function () {
            if ($scope.filters.searchType === 'NAME' && $scope.filters.searchQuery.length >= 2) {
                // Search patients by name
                $scope.loading = true;

                PatientService.searchPatients($scope.filters.searchQuery).then(
                        function (response) {
                            $scope.loading = false;

                            if (response.data.success && response.data.data.length > 0) {
                                $scope.lovResults = response.data.data;
                                $scope.showLOVModal = true;
                            } else {
                                $rootScope.showAlert('info', 'No patients found');
                            }
                        },
                        function (error) {
                            $scope.loading = false;
                            console.error('Search error:', error);
                            $rootScope.showAlert('danger', 'Search failed');
                        }
                );
            } else {
                $scope.applyFilters();
            }
        };

        /**
         * ✅ SELECT PATIENT FROM LOV
         */
        $scope.selectPatientFromLOV = function (patient) {
            $scope.filters.searchType = 'PIN';
            $scope.filters.searchQuery = patient.pinNumber;
            $scope.showLOVModal = false;
            $scope.applyFilters();
        };

        /**
         * ✅ APPLY FILTERS
         */
        $scope.applyFilters = function () {
            console.log('Applying filters...', $scope.filters);

            $scope.filteredRecords = $scope.records.filter(function (record) {


                // Search filter
                if ($scope.filters.searchType === 'PIN' && $scope.filters.searchQuery) {
                    if (!record.pinNumber.toLowerCase().includes($scope.filters.searchQuery.toLowerCase())) {
                        return false;
                    }
                } else if ($scope.filters.searchType === 'CVR' && $scope.filters.searchQuery) {
                    if (!record.cvrNumber.toLowerCase().includes($scope.filters.searchQuery.toLowerCase())) {
                        return false;
                    }
                }

                // Status filter
                if ($scope.filters.status !== 'ALL') {
                    if ($scope.filters.status === 'COMPLETED' && record.status !== 'Completed') {
                        return false;
                    }
                    if ($scope.filters.status === 'PENDING' && record.status === 'Completed') {
                        return false;
                    }
                }

                return true;
            });

            $scope.updatePagination();
            $scope.calculateStats();

            console.log('✅ Filtered records:', $scope.filteredRecords.length);
        };


        /**
         * ✅ UPDATE PAGINATION
         */
        $scope.updatePagination = function () {
            $scope.pagination.totalItems = $scope.filteredRecords.length;
            $scope.pagination.totalPages = Math.ceil(
                    $scope.pagination.totalItems / $scope.pagination.itemsPerPage
                    );

            // Reset to first page if current page is out of range
            if ($scope.pagination.currentPage > $scope.pagination.totalPages) {
                $scope.pagination.currentPage = 1;
            }
        };

        /**
         * ✅ CALCULATE STATISTICS
         */
        $scope.calculateStats = function () {
            $scope.stats = {
                total: $scope.filteredRecords.length,
                withVitals: 0,
                withConsultation: 0,
                withPrescription: 0,
                completed: 0
            };

            $scope.filteredRecords.forEach(function (record) {
                if (record.hasVitals)
                    $scope.stats.withVitals++;
                if (record.hasConsultation)
                    $scope.stats.withConsultation++;
                if (record.hasPrescription)
                    $scope.stats.withPrescription++;
                if (record.status === 'Completed')
                    $scope.stats.completed++;
            });
        };

        /**
         * ✅ GET PAGED RECORDS
         */
        $scope.getPagedRecords = function () {
            var start = ($scope.pagination.currentPage - 1) * $scope.pagination.itemsPerPage;
            var end = start + $scope.pagination.itemsPerPage;
            return $scope.filteredRecords.slice(start, end);
        };

        /**
         * ✅ PAGINATION NAVIGATION
         */
        $scope.goToPage = function (page) {
            if (page >= 1 && page <= $scope.pagination.totalPages) {
                $scope.pagination.currentPage = page;
            }
        };

        $scope.previousPage = function () {
            if ($scope.pagination.currentPage > 1) {
                $scope.pagination.currentPage--;
            }
        };

        $scope.nextPage = function () {
            if ($scope.pagination.currentPage < $scope.pagination.totalPages) {
                $scope.pagination.currentPage++;
            }
        };

        /**
         * ✅ VIEW/EDIT VITALS
         */
        $scope.viewVitals = function (record) {

            if (!record.vitals) {
                $rootScope.showAlert('info', 'No vitals recorded for this visit');
                return;
            }

            $scope.selectedVitals = angular.copy(record.vitals);
            $scope.selectedVitals.cvrNumber = record.cvrNumber;

            // 👉 disable editing
            $scope.isVitalsEditMode = false;

            $scope.showVitalsModal = true;
        };

        /**
         * ✅ UPDATE VITALS
         */
        $scope.updateVitals = function () {
            $scope.showConfirm({
                type: 'warning',
                title: 'Update Vitals?',
                message: 'Update vitals for CVR: ' + $scope.selectedVitals.cvrNumber + '?',
                icon: 'fa-heartbeat',
                onConfirm: function () {
                    $scope.loading = true;
                    CVRService.recordVitals($scope.selectedVitals).then(
                            function (response) {
                                $scope.loading = false;
                                if (response.data.success) {
                                    $rootScope.showAlert('success', '✅ Vitals updated successfully');
                                    $scope.closeVitalsModal();
                                    $scope.loadRecords();
                                } else {
                                    $rootScope.showAlert('danger', response.data.message || 'Failed to update vitals');
                                }
                            },
                            function (error) {
                                $scope.loading = false;
                                $rootScope.showAlert('danger', 'Failed to update vitals');
                            }
                    );
                }
            });
        };

        /**
         * ✅ VIEW/EDIT CONSULTATION
         */
        $scope.viewConsultation = function (record) {

            if (!record.consultation) {
                $rootScope.showAlert('info', 'No consultation recorded for this visit');
                return;
            }

            $scope.selectedConsultation = angular.copy(record.consultation);

            // 👇 ADD THIS LINE
            $scope.isConsultationEditMode = false;

            $scope.showConsultationModal = true;
        };


        /**
         * ✅ UPDATE CONSULTATION
         */
        $scope.updateConsultation = function () {
            $scope.showConfirm({
                type: 'info',
                title: 'Update Consultation?',
                message: 'Are you sure you want to save these changes?',
                icon: 'fa-save',
                onConfirm: function () {
                    $scope.loading = true;
                    var url = API_CONFIG.GATEWAY_URL + API_CONFIG.ENDPOINTS.CONSULTATION.UPDATE
                            .replace('{consultationId}', $scope.selectedConsultation.consultationId);
                    
                    $http.put(url, $scope.selectedConsultation).then(
                            function (response) {
                                $scope.loading = false;
                                if (response.data.success) {
                                    $rootScope.showAlert('success', '✅ Consultation updated successfully');
                                    $scope.closeConsultationModal();
                                    $scope.loadRecords();
                                } else {
                                    $rootScope.showAlert('danger', response.data.message || 'Failed to update consultation');
                                }
                            },
                            function (error) {
                                $scope.loading = false;
                                $rootScope.showAlert('danger', 'Failed to update consultation');
                            }
                    );
                }
            });
        };

        /**
         * ✅ DELETE CONSULTATION
         */
        // ✅ DELETE CONSULTATION
$scope.deleteConsultation = function(record) {
            if (!record.consultation) {
                $rootScope.showAlert('warning', 'No consultation to delete');
                return;
            }

            $scope.showConfirm({
                type: 'danger',
                title: 'Delete Consultation?',
                message: 'Are you sure you want to delete this consultation?',
                subMessage: 'Patient: ' + record.patientName + ' (ID: ' + record.consultation.consultationId + ')',
                icon: 'fa-trash-alt',
                okText: 'Delete Now',
                onConfirm: function () {
                    $scope.loading = true;
                    var url = API_CONFIG.GATEWAY_URL + API_CONFIG.ENDPOINTS.CONSULTATION.DELETE
                            .replace('{consultationId}', record.consultation.consultationId);

                    $http.delete(url).then(
                            function (response) {
                                $scope.loading = false;
                                if (response.data.success) {
                                    $rootScope.showAlert('success', '✅ Consultation deleted successfully');
                                    $scope.loadRecords();
                                } else {
                                    $rootScope.showAlert('danger', response.data.message || 'Failed to delete consultation');
                                }
                            },
                            function (error) {
                                $scope.loading = false;
                                $rootScope.showAlert('danger', 'Failed to delete consultation');
                            }
                    );
                }
            });
        };

        /**
         * ✅ VIEW PRESCRIPTION
         */
        $scope.viewPrescription = function (record) {

            console.log('🖱 View Prescription clicked for CVR:', record.cvrNumber);

            if (!record.consultation || !record.consultation.consultationId) {
                alert('Prescriptions not available for this visit');
                return;
            }

            var consultationId = record.consultation.consultationId;

            $scope.loading = true;

            $http.get(
                    API_CONFIG.GATEWAY_URL +
                    '/opd/prescriptions/consultation/' + consultationId
                    ).then(function (res) {

                $scope.loading = false;

                if (res.data && res.data.success && res.data.data) {

                    $scope.selectedPrescription = res.data.data;
                    $scope.showPrescriptionModal = true;

                } else {
                    alert('No prescription found for this visit');
                }

            }).catch(function (err) {

                $scope.loading = false;
                console.error(err);
                alert('Error loading prescription');

            });
        };



        /**
         * ✅ PRINT PRESCRIPTION
         */
        $scope.printPrescription = function () {
            window.print();
        };

        /**
         * ✅ CLOSE MODALS
         */
        $scope.closeVitalsModal = function () {
            $scope.showVitalsModal = false;
            $scope.selectedVitals = null;
        };

        $scope.closeConsultationModal = function () {
            $scope.showConsultationModal = false;
            $scope.selectedConsultation = null;
        };

        $scope.closePrescriptionModal = function () {
            $scope.showPrescriptionModal = false;
            $scope.selectedPrescription = null;
        };

        $scope.closeLOVModal = function () {
            $scope.showLOVModal = false;
            $scope.lovResults = [];
        };

        /**
         * ✅ REFRESH RECORDS
         */
        $scope.refresh = function () {
            $scope.loadRecords();
            $rootScope.showAlert('info', 'Refreshing records...');
        };

//    /**
//     * ✅ RESET FILTERS
//     */
//    $scope.resetFilters = function() {
//        $scope.filters = {
//            fromDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
//            toDate: new Date().toISOString().split('T')[0],
//            searchType: 'ALL',
//            searchQuery: '',
//            status: 'ALL'
//        };
//        $scope.loadRecords();
//    };

        /**
         * ✅ GET STATUS BADGE CLASS
         */
        $scope.getStatusClass = function (status) {
            switch (status) {
                case 'COMPLETED':
                    return 'bg-success';
                case 'IN_PROGRESS':
                    return 'bg-primary';
                case 'CHECKED_IN':
                    return 'bg-warning';
                case 'PENDING':
                    return 'bg-secondary';
                default:
                    return 'bg-dark';
            }
        };

// ================= DOCTOR DROPDOWN (QUEUE REFER) =================


        $scope.getDoctorList = function () {
            DoctorService.getActiveDoctors().then(
                    function (res) {
                        if (res.data && res.data.success) {
                            $scope.doctorList = res.data.data;
                        } else {
                            $scope.doctorList = [];
                        }
                        console.log("Doctor List :", $scope.doctorList);
                    },
                    function () {
                        $scope.doctorList = [];
                        console.log("Doctor API failed");
                    }
            );
        };
        /**
         * ✅ INITIALIZE
         */
        $scope.init = function () {
            console.log('========== INITIALIZING OPD RECORDS ==========');
            $scope.getDoctorList();
        };

// Initialize on load
        $scope.init();

        $scope.loadConsultationByPin = function (record) {

            record.hasConsultation = false;
            record.consultation = null;

            if (!record.pinNumber || !record.cvrNumber)
                return;

            $http.get(
                    API_CONFIG.GATEWAY_URL +
                    API_CONFIG.ENDPOINTS.CONSULTATION.GET_BY_PATIENT
                    .replace('{pinNumber}', record.pinNumber)
                    ).then(function (res) {

                if (!res.data || !res.data.data)
                    return;

                var consultation = res.data.data.find(function (c) {
                    return c.cvrNumber === record.cvrNumber;
                });

                if (!consultation)
                    return;

                record.consultation = consultation;
                record.hasConsultation = true;

            }).catch(function (err) {
                console.error('Consultation load failed', err);
            });
        };


//    /**
//     * ✅ LOAD OPD RECORDS BY DATE RANGE
//     */
        $scope.loadRecords = function () {

            if (!$scope.selectedDoctorId) {
                $rootScope.showAlert('warning', 'Please select doctor');
                return;
            }

            if (!$scope.selectedDate) {
                $rootScope.showAlert('warning', 'Please select date');
                return;
            }

            $scope.loading = true;
            var date = $filter('date')($scope.selectedDate, 'yyyy-MM-dd');

            console.log('📋 OPD LIST → Appointment Flow');
            console.log('Doctor:', $scope.selectedDoctorId, 'Date:', date);

            AppointmentService.getByDoctorDate($scope.selectedDoctorId, date)
                    .then(function (res) {

                        $scope.loading = false;

                        if (res.data.success && res.data.data.length > 0) {

                            var records = res.data.data
                                    .filter(function (apt) {
                                        // ✅ SHOW ONLY QUEUE-ACTION-DONE RECORDS
                                        return apt.cvrNumber && apt.cvrNumber !== '';
                                    })
                                    .map(function (apt) {
                                        return {
                                            appointmentId: apt.appointmentId,
                                            tokenNumber: apt.tokenNumber,
                                            pinNumber: apt.pinNumber,
                                            cvrNumber: apt.cvrNumber,
                                            patientName: apt.patientName || 'Unknown',
                                            doctorId: apt.doctorId,

                                            visitType: 'OPD',

                                            // ✅ SAME AS OPD QUEUE
                                            visitDate: apt.createdAt,

                                            status: 'COMPLETED',

                                            vitals: null,
                                            consultation: null,
                                            prescription: null,

                                            hasVitals: false,
                                            hasConsultation: false,
                                            hasPrescription: false
                                        };
                                    });


                            console.log('✅ OPD LIST loaded:', records.length, 'records');

                            $scope.records = records;
                            $scope.records.forEach(function (rec) {
                                $scope.loadConsultationByPin(rec);
                                $scope.loadVitalsForRecord(rec);
                            });
                            $scope.applyFilters();
                            $scope.fillPatientNames();

                        } else {
                            $scope.records = [];
                            $scope.filteredRecords = [];
                            $scope.updatePagination();
                            $scope.calculateStats();
                            $rootScope.showAlert('info', 'No OPD records found');
                        }
                    })
                    .catch(function (err) {
                        $scope.loading = false;
                        console.error(err);
                        $rootScope.showAlert('danger', 'Failed to load OPD list');
                    });
        };


        /**
         * ✅ REFRESH RECORDS
         */
        $scope.refreshQueue = function () {
            console.log('🔄 Manual refresh...');
            $scope.loadRecords();
        };
        $scope.fillPatientNames = function () {
            $scope.records.forEach(function (rec) {

                if ((!rec.patientName || rec.patientName === 'Unknown') && rec.pinNumber) {

                    PatientService.getByPin(rec.pinNumber)
                            .then(function (res) {
                                if (res.data && res.data.success && res.data.data) {
                                    rec.patientName = res.data.data.fullName;
                                } else {
                                    rec.patientName = 'Unknown';
                                }
                            })
                            .catch(function () {
                                rec.patientName = 'Unknown';
                            });
                }

            });
        };
        $scope.editConsultation = function (record) {

            if (!record.consultation || !record.consultation.consultationId) {
                alert("Consultation not available");
                return;
            }

            var consultationId = record.consultation.consultationId;

            console.log("Redirecting to edit page:", consultationId);

            $location.path('/consultation/room/' + consultationId);
        };



        $scope.editPrescription = function (record) {

            console.log("🖱 Edit Prescription clicked");

            if (!record.consultation || !record.consultation.consultationId) {
                alert("prescription not available");
                return;
            }

            var consultationId = record.consultation.consultationId;

            console.log("Redirecting with edit=true", consultationId);

            $location.path('/prescription/create/' + consultationId)
                    .search({edit: 'true'});   // IMPORTANT: use STRING
        };
        $scope.deletePrescription = function (record) {

            if (!record.consultation || !record.consultation.consultationId) {
                $rootScope.showAlert('warning', 'No prescription available for this visit');
                return;
            }

            if (!confirm("⚠️ DELETE PRESCRIPTION?\n\nPatient: "
                    + record.patientName +
                    "\nCVR: " + record.cvrNumber +
                    "\n\nThis action CANNOT be undone!\n\nAre you sure?")) {
                return;
            }

            $scope.loading = true;

            // 1️⃣ Get prescription by consultation
            $http.get(
                    API_CONFIG.GATEWAY_URL +
                    '/opd/prescriptions/consultation/' +
                    record.consultation.consultationId
                    ).then(function (res) {

                if (res.data && res.data.success && res.data.data) {

                    var prescriptionId = res.data.data.prescriptionId;

                    // 2️⃣ Delete prescription directly
                    return $http.delete(
                            API_CONFIG.GATEWAY_URL +
                            '/opd/prescriptions/' + prescriptionId
                            );

                } else {
                    throw "Prescription not found";
                }

            }).then(function (deleteRes) {

                $scope.loading = false;

                if (deleteRes.data.success) {
                    $rootScope.showAlert('success', '✅ Prescription deleted successfully');
                    $scope.loadRecords();
                } else {
                    $rootScope.showAlert('danger', 'Failed to delete prescription');
                }

            }).catch(function (err) {

                $scope.loading = false;
                console.error(err);
                $rootScope.showAlert('danger', 'Error deleting prescription');

            });
        };

        $scope.goToVitals = function (record) {
            if (!record.vitals) {
                $rootScope.showAlert('info', 'No vitals recorded for this visit');
                return;
            }
            $location.path('/cvr/vitals/' + record.cvrNumber);
        };
        // ✅ DELETE VITALS
$scope.deleteVitals = function(record) {
    if (!record.vitals) {
        $rootScope.showAlert('warning', 'No vitals to delete');
        return;
    }
    $scope.openConfirm({
        title: 'Delete Vitals?',
        message: 'Patient: ' + record.patientName,
        subMessage: 'CVR: ' + record.cvrNumber + ' — This cannot be undone!',
        type: 'danger',
        icon: 'fas fa-heartbeat',
        okText: 'Delete',
        onConfirm: function() {
            $scope.loading = true;
            CVRService.deleteVitals(record.cvrNumber).then(
                function(response) {
                    $scope.loading = false;
                    if (response.data.success) {
                        $rootScope.showAlert('success', '✅ Vitals deleted');
                        record.vitals = null;
                        record.hasVitals = false;
                        $scope.calculateStats();
                    } else {
                        $rootScope.showAlert('danger', 'Failed to delete vitals');
                    }
                },
                function() {
                    $scope.loading = false;
                    $rootScope.showAlert('danger', 'Failed to delete vitals');
                }
            );
        }
    });
};


// ✅ DELETE VITALS - with confirmation
//        $scope.deleteVitals = function (record) {
//            if (!record.vitals) {
//                $rootScope.showAlert('warning', 'No vitals to delete for this visit');
//                return;
//            }
//
//            // ✅ No confirm() - use rootScope alert pattern instead
//            var confirmDelete = window.confirm(
//                    '⚠️ Delete vitals for:\nPatient: ' + record.patientName +
//                    '\nCVR: ' + record.cvrNumber +
//                    '\n\nThis cannot be undone!'
//                    );
//
//            if (!confirmDelete)
//                return;
//
//            $scope.loading = true;
//
//            CVRService.deleteVitals(record.cvrNumber).then(
//                    function (response) {
//                        $scope.loading = false;
//                        if (response.data.success) {
//                            $rootScope.showAlert('success', '✅ Vitals deleted for CVR: ' + record.cvrNumber);
//                            // ✅ Clear vitals locally without full reload
//                            record.vitals = null;
//                            record.hasVitals = false;
//                            $scope.calculateStats();
//                        } else {
//                            $rootScope.showAlert('danger', response.data.message || 'Failed to delete vitals');
//                        }
//                    },
//                    function (error) {
//                        $scope.loading = false;
//                        console.error('Delete vitals error:', error);
//                        $rootScope.showAlert('danger', 'Failed to delete vitals');
//                    }
//            );
//        };
        $scope.viewVitals = function (record) {
            if (!record.vitals) {
                $rootScope.showAlert('info', 'No vitals recorded for this visit');
                return;
            }
            $scope.selectedVitals = angular.copy(record.vitals);
            $scope.selectedVitals.cvrNumber = record.cvrNumber;
            $scope.isVitalsEditMode = false;  // ← read only
            $scope.showVitalsModal = true;
        };

// ✅ UPDATE VITALS - called from modal Save button
        $scope.updateVitals = function () {
            if (!$scope.selectedVitals || !$scope.selectedVitals.cvrNumber) {
                $rootScope.showAlert('danger', 'No vitals selected');
                return;
            }

            $scope.loading = true;

            CVRService.recordVitals($scope.selectedVitals).then(
                    function (response) {
                        $scope.loading = false;
                        if (response.data.success) {
                            $rootScope.showAlert('success', '✅ Vitals updated successfully');
                            $scope.closeVitalsModal();
                            $scope.loadRecords();  // refresh table
                        } else {
                            $rootScope.showAlert('danger', response.data.message || 'Failed to update vitals');
                        }
                    },
                    function (error) {
                        $scope.loading = false;
                        console.error('Error updating vitals:', error);
                        $rootScope.showAlert('danger', 'Failed to update vitals');
                    }
            );
        };

        $scope.loadVitalsForRecord = function (record) {
            if (!record.cvrNumber)
                return;

            CVRService.getVitals(record.cvrNumber).then(
                    function (response) {
                        if (response.data.success &&
                                response.data.data &&
                                response.data.data.length > 0) {
                            record.vitals = response.data.data[0];
                            record.hasVitals = true;
                            console.log('✅ Vitals loaded for CVR:', record.cvrNumber);
                        } else {
                            record.vitals = null;
                            record.hasVitals = false;
                        }
                    },
                    function (error) {
                        record.vitals = null;
                        record.hasVitals = false;
                    }
            );
        };
        $scope.confirmDialog = {
            show: false
        };

        $scope.openConfirm = function (options) {

            $scope.confirmDialog = {
                show: true,
                title: options.title || "Confirm Action",
                message: options.message || "Are you sure?",
                subMessage: options.subMessage || "",
                type: options.type || "info",
                icon: options.icon || "fas fa-question-circle",
                okText: options.okText || "Yes",
                cancelText: options.cancelText || "Cancel",

                confirm: function () {
                    $scope.confirmDialog.show = false;
                    if (options.onConfirm)
                        options.onConfirm();
                },

                cancel: function () {
                    $scope.confirmDialog.show = false;
                    if (options.onCancel)
                        options.onCancel();
                }
            };
        };
    }]);
