// ============================================
// INVOICE LIST CONTROLLER (ENHANCED)
// File: app/controllers/billing/invoice-list.controller.js
// Show only completed consultations for billing
// ============================================

app.controller('InvoiceListController', ['$scope', '$rootScope', '$location', '$http', '$filter',
    'BillingService', 'PatientService', 'DoctorService',
    function ($scope, $rootScope, $location, $http, $filter, BillingService, PatientService, DoctorService) {

        // Initialize
        $scope.loading = false;
        $scope.invoices = [];
        $scope.filteredInvoices = [];
        $scope.completedConsultations = [];
        $scope.activeTab = 'invoices'; // 'invoices' or 'pending-consultations'
        $scope.doctorList = [];
        $scope.selectedDoctorId = null;
        $scope.selectedDate = new Date();
        $scope.filteredConsultations = [];



        // Filter options
        $scope.filter = {
            searchText: '',
            searchType: 'ALL', // ✅ ADD THIS
            status: 'ALL',
            invoiceType: 'ALL',
            dateFrom: new Date().toISOString().split('T')[0],
            dateTo: new Date().toISOString().split('T')[0]
        };


        // Pagination
        $scope.pagination = {
            currentPage: 1,
            itemsPerPage: 10,
            totalItems: 0,
            totalPages: 0
        };

        // Dropdown options
        $scope.statusOptions = ['ALL', 'PENDING', 'PARTIAL', 'PAID'];
        $scope.invoiceTypeOptions = ['ALL', 'OPD', 'IPD', 'PHARMACY', 'EMERGENCY'];
        $scope.loadDoctors = function () {
            DoctorService.getActiveDoctors().then(
                    function (response) {
                        if (response.data.success) {
                            $scope.doctorList = response.data.data;
                        } else {
                            $scope.doctorList = [];
                        }
                    },
                    function (error) {
                        console.error("Error loading doctors:", error);
                        $scope.doctorList = [];
                    }
            );
        };


        /**
         * Initialize
         */
        $scope.init = function () {
            $scope.activeTab = 'consultations';
            $scope.loadDoctors();

//        $scope.loadInvoices();
//        $scope.loadCompletedConsultations();

        };

        /**
         * Load invoices
         */
        $scope.loadInvoices = function () {

            if (!$scope.selectedDoctorId) {
                console.warn("⚠️ Doctor not selected");
                return;
            }

            if (!$scope.selectedDate) {
                console.warn("⚠️ Date not selected");
                return;
            }

            $scope.loading = true;

            var formattedDate = $filter('date')($scope.selectedDate, 'yyyy-MM-dd');

            var url = 'http://localhost:8088/billing/invoices/doctor/' +
                    $scope.selectedDoctorId +
                    '/date/' + formattedDate;

            console.log("==================================");
            console.log("📤 BILLING API CALL (8088)");
            console.log("Doctor ID:", $scope.selectedDoctorId);
            console.log("Date:", formattedDate);
            console.log("URL:", url);

            $http.get(url).then(
                    function (response) {

                        console.log("📥 BILLING RESPONSE SUCCESS");
                        console.log("Status:", response.status);
                        console.log("Full Response:", response);
                        console.log("Data:", response.data);

                        $scope.loading = false;

                        if (response.data.success) {
                            $scope.invoices = response.data.data || [];
                            console.log("Invoices Count:", $scope.invoices.length);
                            $scope.applyFilters();
                        } else {
                            console.warn("Billing success = false");
                            $scope.invoices = [];
                            $scope.filteredInvoices = [];
                            $scope.updatePagination();
                        }
                    },
                    function (error) {

                        console.error("❌ BILLING API ERROR");
                        console.error("Status:", error.status);
                        console.error("Error Object:", error);

                        $scope.loading = false;
                    }
            );

        };




        /**
         * Load completed consultations without invoices
         */
//    $scope.loadCompletedConsultations = function() {
//
//    if (!$scope.selectedDoctorId) {
//        console.warn("⚠️ Doctor not selected for consultations");
//        return;
//    }
//
//    var formattedDate = $filter('date')($scope.selectedDate, 'yyyy-MM-dd');
//
// var url = API_CONFIG.GATEWAY_URL +
//          API_CONFIG.ENDPOINTS.CONSULTATION.GET_BY_DOCTOR_DATE
//            .replace('{doctorId}', $scope.selectedDoctorId)
//            .replace('{date}', formattedDate);
//
//    console.log("==================================");
//    console.log("📤 OPD API CALL (8087)");
//    console.log("Doctor ID:", $scope.selectedDoctorId);
//    console.log("Date:", formattedDate);
//    console.log("URL:", url);
//
//    $http.get(url).then(
//        function(response) {
//
//            console.log("📥 OPD RESPONSE SUCCESS");
//            console.log("Status:", response.status);
//            console.log("Full Response:", response);
//            console.log("Data:", response.data);
//
//            if (response.data.success) {
//                $scope.completedConsultations = response.data.data || [];
//    console.log("Loaded Consultations:", $scope.completedConsultations);
//                    // ✅ Easy check: log all consultations to console
//                    // Add displayStatus for debugging
//   // After fillConsultationNames() completes
//$scope.completedConsultations.forEach(c => {
//    console.log('Patient:', c.patientName, 
//                'Payment:', c.paymentStatus, 
//                'Display:', c.displayStatus);
//});
//
//
//                console.log("Consultations Count:", $scope.completedConsultations.length);
//                    $scope.filteredConsultations = angular.copy($scope.completedConsultations);
//                    $scope.applyFilters();
//                    // Fill patient and doctor names
//    $scope.fillConsultationNames();
// 
//            }
//        },
//        function(error) {
//
//            console.error("❌ OPD API ERROR");
//            console.error("Status:", error.status);
//            console.error("Error Object:", error);
//        }
//    );
//};
//
//
// 

        $scope.loadCompletedConsultations = function () {

            if (!$scope.selectedDoctorId) {
                console.warn("⚠️ Doctor not selected for consultations");
                return;
            }

            var formattedDate = $filter('date')($scope.selectedDate, 'yyyy-MM-dd');

            var url = API_CONFIG.GATEWAY_URL +
                    API_CONFIG.ENDPOINTS.CONSULTATION.GET_BY_DOCTOR_DATE
                    .replace('{doctorId}', $scope.selectedDoctorId)
                    .replace('{date}', formattedDate);

            console.log("📤 OPD API CALL", "Doctor ID:", $scope.selectedDoctorId, "Date:", formattedDate, "URL:", url);

            $http.get(url).then(function (response) {
                console.log("📥 OPD RESPONSE SUCCESS", response.data);

                if (response.data.success) {
                    $scope.completedConsultations = response.data.data || [];

                    // Initialize payment status and displayStatus immediately
                    // ✅ CHECK LOCALSTORAGE FOR PAID INVOICES
// ✅ GET PAID INVOICES AND CVR MAPPING FROM LOCALSTORAGE
                    var paidInvoices = JSON.parse(localStorage.getItem('paidInvoices') || '[]');
                    var cvrMapping = JSON.parse(localStorage.getItem('cvrInvoiceMapping') || '{}');
                    console.log('📋 Paid invoices from localStorage:', paidInvoices);
                    console.log('📋 CVR to Invoice mapping:', cvrMapping);

// Initialize payment status and displayStatus immediately
                    $scope.completedConsultations.forEach(function (c) {

                        // ✅ PRIORITY 1: Check CVR number in mapping (most reliable)
                        if (c.cvrNumber && cvrMapping[c.cvrNumber]) {
                            var mapping = cvrMapping[c.cvrNumber];
                            
                            // Prevent stale mapping during testing (DB resets causing CVR reuse)
                            let isMappingStale = false;
                            if (mapping.paidAt && c.consultationDate) {
                                let paidTime = new Date(mapping.paidAt).getTime();
                                // Parse consultation date (pattern: yyyy-MM-dd HH:mm:ss string or iso)
                                let consultTime = new Date(c.consultationDate).getTime();
                                if (consultTime > paidTime) {
                                    isMappingStale = true;
                                    console.log('⚠️ Ignoring stale CVR mapping (reused CVR):', c.cvrNumber);
                                }
                            }
                            
                            if (!isMappingStale) {
                                c.invoiceNumber = mapping.invoiceNumber;
                                if (mapping.paid === true) {
                                    c.paymentStatus = 'PAID';
                                    c.displayStatus = 'Done';
                                } else {
                                    c.paymentStatus = 'INVOICED';
                                    c.displayStatus = 'INVOICED';
                                }
                                console.log('✅ Marked via CVR mapping:', c.cvrNumber, '→', c.invoiceNumber);
                            }
                        }
                        // ✅ PRIORITY 2: Check if invoice number exists and is in paid list
                        else if (c.invoiceNumber && paidInvoices.includes(c.invoiceNumber)) {
                            c.paymentStatus = 'PAID';
                            c.displayStatus = 'Done';
                            console.log('✅ Marked as PAID (from localStorage):', c.invoiceNumber);
                        }
                        // PRIORITY 3: Check existing in-memory data
                        else {
                            let existing = $scope.filteredConsultations.find(f => f.consultationId === c.consultationId);

                            if (existing && existing.paymentStatus === 'PAID') {
                                c.paymentStatus = 'PAID';
                                c.displayStatus = 'Done';
                                c.invoiceNumber = existing.invoiceNumber;
                            } else if (existing && existing.paymentStatus === 'INVOICED') {
                                c.paymentStatus = 'INVOICED';
                                c.displayStatus = 'INVOICED';
                                c.invoiceNumber = existing.invoiceNumber;
                            } else if (c.invoiceNumber) {
                                c.paymentStatus = (c.paymentStatus === 'PAID') ? 'PAID' : 'INVOICED';
                                c.displayStatus = (c.paymentStatus === 'PAID') ? 'Done' : 'INVOICED';
                            } else {
                                c.paymentStatus = 'NOT INVOICED';
                                c.displayStatus = 'NOT INVOICED';
                            }
                        }
                    });


                    console.log("Before patient fetch:", $scope.completedConsultations);

                    // Fill patient names asynchronously
                    $scope.fillConsultationNames();

                    $scope.filteredConsultations = angular.copy($scope.completedConsultations);
                    $scope.applyFilters();

                    console.log("Consultations Count:", $scope.completedConsultations.length);
                }
            }, function (error) {
                console.error("❌ OPD API ERROR", error);
            });
        };

        /**
         * Search patient and load invoices
         */
        $scope.searchPatientInvoices = function () {
            if (!$scope.filter.searchText || $scope.filter.searchText.length < 3) {
                $rootScope.showAlert('warning', 'Please enter at least 3 characters to search');
                return;
            }

            $scope.loading = true;

            PatientService.searchPatients($scope.filter.searchText).then(
                    function (response) {
                        if (response.data.success && response.data.data.length > 0) {
                            var patient = response.data.data[0];

                            // Load patient invoices
                            BillingService.getPatientInvoices(patient.pinNumber).then(
                                    function (response) {
                                        $scope.loading = false;

                                        if (response.data.success) {
                                            $scope.invoices = response.data.data;
                                            $scope.applyFilters();
                                        }
                                    },
                                    function (error) {
                                        $scope.loading = false;
                                        console.error('Error loading patient invoices:', error);
                                        $rootScope.showAlert('danger', 'Failed to load invoices');
                                    }
                            );
                        } else {
                            $scope.loading = false;
                            $rootScope.showAlert('info', 'No patient found with that search');
                        }
                    },
                    function (error) {
                        $scope.loading = false;
                        console.error('Error searching patients:', error);
                    }
            );
        };

        /**
         * Apply filters
         */
        $scope.applyFilters = function () {

            var text = ($scope.filter.searchText || '').toLowerCase();
            var type = $scope.filter.searchType;

            // ======================
            // INVOICE FILTERING
            // ======================
            if ($scope.activeTab === 'invoices') {

                $scope.filteredInvoices = $scope.invoices.filter(function (invoice) {

                    if (!text || type === 'ALL')
                        return true;

                    switch (type) {
                        case 'PIN':
                            return invoice.pinNumber &&
                                    invoice.pinNumber.toLowerCase().includes(text);

                        case 'NAME':
                            return invoice.patientName &&
                                    invoice.patientName.toLowerCase().includes(text);

                        case 'INVOICE':
                            return invoice.invoiceNumber &&
                                    invoice.invoiceNumber.toLowerCase().includes(text);

                        default:
                            return true;
                    }
                });

                $scope.updatePagination();
                return;
            }

            // ======================
            // CONSULTATION FILTERING
            // ======================
            if ($scope.activeTab === 'consultations') {

                $scope.filteredConsultations = $scope.completedConsultations.filter(function (c) {

                    if (!text || type === 'ALL')
                        return true;

                    switch (type) {
                        case 'PIN':
                            return c.pinNumber &&
                                    c.pinNumber.toLowerCase().includes(text);

                        case 'NAME':
                            return c.patientName &&
                                    c.patientName.toLowerCase().includes(text);

                            // consultations don’t have invoice no
                        case 'INVOICE':
                            return false;

                        default:
                            return true;
                    }
                });

                $scope.updatePagination();
            }
        };



        /**
         * Update pagination
         */
        $scope.updatePagination = function () {

            if ($scope.activeTab === 'consultations') {
                $scope.pagination.totalItems = $scope.filteredConsultations.length;
            } else {
                $scope.pagination.totalItems = $scope.filteredInvoices.length;
            }

            $scope.pagination.totalPages = Math.ceil(
                    $scope.pagination.totalItems / $scope.pagination.itemsPerPage
                    );

            if ($scope.pagination.currentPage > $scope.pagination.totalPages) {
                $scope.pagination.currentPage = 1;
            }
        };


        /**
         * Get paged invoices
         */
        $scope.getPagedInvoices = function () {
            var start = ($scope.pagination.currentPage - 1) * $scope.pagination.itemsPerPage;
            var end = start + $scope.pagination.itemsPerPage;
            return $scope.filteredInvoices.slice(start, end);
        };

        /**
         * Get paged consultations
         */
        $scope.getPagedConsultations = function () {
            var start = ($scope.pagination.currentPage - 1) * $scope.pagination.itemsPerPage;
            var end = start + $scope.pagination.itemsPerPage;
            return $scope.filteredConsultations.slice(start, end);
        };


        /**
         * Change page
         */
        $scope.goToPage = function (page) {
            if (page >= 1 && page <= $scope.pagination.totalPages) {
                $scope.pagination.currentPage = page;
            }
        };

        /**
         * Get page numbers
         */
        $scope.getPageNumbers = function () {
            var pages = [];
            var start = Math.max(1, $scope.pagination.currentPage - 2);
            var end = Math.min($scope.pagination.totalPages, $scope.pagination.currentPage + 2);

            for (var i = start; i <= end; i++) {
                pages.push(i);
            }

            return pages;
        };

        /**
         * View invoice details
         */
        $scope.viewInvoice = function (invoiceNumber) {
            $location.path('/billing/invoice/' + invoiceNumber);
        };

        /**
         * Make payment
         */
        $scope.makePayment = function (invoiceNumber) {
            $location.path('/billing/payment/' + invoiceNumber);
        };

        /**
         * Create invoice for consultation
         */
        $scope.createInvoiceForConsultation = function (consultation) {
            consultation.invoiceNumber = 'TEMP-' + consultation.consultationId;
            consultation.paymentStatus = 'INVOICED';
            consultation.displayStatus = 'INVOICED';

            // Update filtered list so Angular immediately reflects changes
            $scope.filteredConsultations = angular.copy($scope.completedConsultations);

            // Store consultation data for invoice creation
            var invoiceData = {
                pinNumber: consultation.pinNumber,
                appointmentId: consultation.appointmentId,
                cvrNumber: consultation.cvrNumber,
                doctorId: consultation.doctorId,
                patientName: consultation.patientName,
                consultationId: consultation.consultationId
            };
            localStorage.setItem('pendingInvoiceData', JSON.stringify(invoiceData));

            $location.path('/billing/invoice/create/' + consultation.consultationId);
        };

        /**
         * Mark consultation as PAID in the list
         */
        $scope.updateConsultationPaymentStatus = function (invoiceNumber) {
            let consult = $scope.completedConsultations.find(c => c.invoiceNumber === invoiceNumber);
            if (consult) {
                consult.paymentStatus = 'PAID';
                consult.displayStatus = 'Done'; // always show Done when paid
                console.log('Consultation updated to PAID:', consult);
                $scope.$applyAsync(); // refresh Angular view
            }
        };



        /**
         * Switch tab
         */
        $scope.switchTab = function (tab) {
            $scope.activeTab = tab;
            $scope.pagination.currentPage = 1;
            $scope.applyFilters();
        };


        /**
         * Get status badge class
         */
        $scope.getStatusBadgeClass = function (status) {
            return BillingService.getStatusBadgeClass(status);
        };

        /**
         * Format currency
         */
        $scope.formatCurrency = function (amount) {
            return BillingService.formatCurrency(amount);
        };

        /**
         * Reset filters
         */
        $scope.resetFilters = function () {
            $scope.filter = {
                searchText: '',
                status: 'ALL',
                invoiceType: 'ALL',
                dateFrom: new Date().toISOString().split('T')[0],
                dateTo: new Date().toISOString().split('T')[0]
            };

            $scope.loadInvoices();
            $scope.loadCompletedConsultations();
        };

        /**
         * Refresh data
         */
        $scope.refreshData = function () {
            if ($scope.activeTab === 'invoices') {
                $scope.loadInvoices();
            } else {
                $scope.loadCompletedConsultations();
            }
        };

        /**
         * Create new invoice
         */
        $scope.createNewInvoice = function () {
            $location.path('/billing/invoice/create');
        };

        /**
         * Export to CSV
         */
        $scope.exportToCSV = function () {
            if ($scope.filteredInvoices.length === 0) {
                $rootScope.showAlert('warning', 'No invoices to export');
                return;
            }

            var csv = 'Date,Invoice Number,Patient,PIN,Type,Amount,Paid,Outstanding,Status\n';

            $scope.filteredInvoices.forEach(function (invoice) {
                csv += '"' + new Date(invoice.invoiceDate).toLocaleDateString() + '",';
                csv += '"' + invoice.invoiceNumber + '",';
                csv += '"' + invoice.patientName + '",';
                csv += '"' + invoice.pinNumber + '",';
                csv += '"' + invoice.invoiceType + '",';
                csv += '"' + invoice.totalAmount.toFixed(2) + '",';
                csv += '"' + invoice.paidAmount.toFixed(2) + '",';
                csv += '"' + invoice.outstandingAmount.toFixed(2) + '",';
                csv += '"' + invoice.paymentStatus + '"\n';
            });

            var blob = new Blob([csv], {type: 'text/csv'});
            var url = window.URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'invoices_' + new Date().toISOString().split('T')[0] + '.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        };

        // Initialize
        $scope.init();
        $scope.refreshInvoices = function () {
            $scope.loadInvoices();
            $scope.loadCompletedConsultations();
        };
// Auto load when doctor changes
        $scope.$watch('selectedDoctorId', function (newVal) {
            if (newVal) {
//        $scope.loadInvoices();
                $scope.loadCompletedConsultations();
            }
        });

// Auto load when date changes
        $scope.$watch('selectedDate', function (newVal) {
            if (newVal && $scope.selectedDoctorId) {
//        $scope.loadInvoices();
                $scope.loadCompletedConsultations();
            }
        });

        $scope.fillConsultationNames = function () {
            $scope.completedConsultations.forEach(function (c) {
                if (!c.patientName && c.pinNumber) {
                    PatientService.getByPin(c.pinNumber)
                            .then(function (res) {
                                c.patientName = res.data.success && res.data.data
                                        ? res.data.data.fullName
                                        : 'Unknown';
                                $scope.$applyAsync(); // ensures Angular updates view
                                console.log("Patient name loaded:", c.pinNumber, "→", c.patientName);
                            })
                            .catch(function () {
                                c.patientName = 'Unknown';
                                $scope.$applyAsync();
                            });
                }
            });
        };
      // ==========================================
// ✅ LISTEN FOR INVOICE CREATED EVENT
// ==========================================
        $scope.$on('invoiceCreated', function (event, invoice) {
    let consult = $scope.completedConsultations.find(
        c => c.consultationId === invoice.consultationId
    );
            if (consult) {
                consult.invoiceNumber = invoice.invoiceNumber;
        consult.paymentStatus = (invoice.paidAmount >= invoice.totalAmount)
            ? 'PAID'
            : 'INVOICED';
        consult.displayStatus =
            (consult.paymentStatus === 'PAID')
            ? 'Done'
            : 'INVOICED';

        $scope.filteredConsultations =
            angular.copy($scope.completedConsultations);

                $scope.$applyAsync();
            }
        });
        $scope.$on('consultationPaid', function (event, invoiceNumber) {
            console.log('=================================');
            console.log('💰 PAYMENT EVENT RECEIVED');
            console.log('Invoice Number:', invoiceNumber);

            // Update localStorage
            var paidInvoices = JSON.parse(localStorage.getItem('paidInvoices') || '[]');
            if (!paidInvoices.includes(invoiceNumber)) {
                paidInvoices.push(invoiceNumber);
                localStorage.setItem('paidInvoices', JSON.stringify(paidInvoices));
            }

            // Find consultation by invoice number OR by CVR
            let consult = $scope.completedConsultations.find(c => c.invoiceNumber === invoiceNumber);

            // If not found by invoice number, try CVR mapping
            if (!consult) {
                var cvrMapping = JSON.parse(localStorage.getItem('cvrInvoiceMapping') || '{}');
                for (var cvr in cvrMapping) {
                    if (cvrMapping[cvr].invoiceNumber === invoiceNumber) {
                        consult = $scope.completedConsultations.find(c => c.cvrNumber === cvr);
                        if (consult) {
                            consult.invoiceNumber = invoiceNumber;
                            break;
                        }
                    }
                }
            }

            if (consult) {
                console.log('✅ Found consultation:', consult);
                consult.paymentStatus = 'PAID';
                consult.displayStatus = 'Done';
                $scope.filteredConsultations = angular.copy($scope.completedConsultations);
                $scope.$applyAsync();
                console.log('✅ Updated consultation to PAID');
            } else {
                console.log('⚠️ Consultation not found (will update on next load)');
            }
            console.log('=================================');
        });
        $scope.markConsultationPaid = function (consultation) {
            consultation.paymentStatus = 'PAID';
            consultation.displayStatus = 'Done';   // This will show in the UI
            $scope.$applyAsync();                  // Refresh view immediately
        };

// Navigate to Vitals Recording page for a consultation
$scope.editVitals = function(consultation) {
            if (!consultation.cvrNumber) {
                $rootScope.showAlert('warning', 'CVR not available for this consultation');
                return;
            }

            // Save consultation/CVR info in localStorage or pass via route param
            localStorage.setItem('currentVitalsConsultation', JSON.stringify(consultation));

            // Navigate to Vitals Recording page
            $location.path('/vitals/record/' + consultation.cvrNumber);
        };



    }]);