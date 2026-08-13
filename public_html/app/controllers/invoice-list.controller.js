// ============================================
// INVOICE LIST CONTROLLER (ENHANCED)
// File: app/controllers/billing/invoice-list.controller.js
// Show only completed consultations for billing
// ============================================

app.controller('InvoiceListController', ['$scope', '$rootScope', '$location', '$http', '$filter',
    'BillingService', 'PatientService', 'DoctorService',
    function ($scope, $rootScope, $location, $http, $filter, BillingService, PatientService, DoctorService) {

        // Initialize
        $scope.currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
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
                            
                            if ($scope.currentUser.role === 'DOCTOR') {
                                var myDoctor = $scope.doctorList.find(function(d) {
                                    return (d.userId && d.userId == $scope.currentUser.userId) ||
                                           (d.email && d.email === $scope.currentUser.email) || 
                                           (d.username && d.username === $scope.currentUser.username) ||
                                           (d.contactNumber && d.contactNumber === $scope.currentUser.contactNumber) ||
                                           (d.doctorId === $scope.currentUser.username) ||
                                           (d.fullName && $scope.currentUser.fullName && d.fullName.toLowerCase() === $scope.currentUser.fullName.toLowerCase());
                                });
                                
                                if (myDoctor) {
                                    $scope.selectedDoctorId = myDoctor.doctorId;
                                } else {
                                    $scope.selectedDoctorId = $scope.currentUser.username;
                                }
                            }
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
         * Load invoices + consultations via API Gateway (fixes CORS & Tenant ID)
         */
        $scope.loadInvoicesAndConsultations = function () {
            if (!$scope.selectedDoctorId) return;

            var formattedDate = $filter('date')($scope.selectedDate, 'yyyy-MM-dd');
            $scope.loading = true;

            // 1. First load consultations for the doctor/date
            var consultUrl = API_CONFIG.GATEWAY_URL +
                API_CONFIG.ENDPOINTS.CONSULTATION.GET_BY_DOCTOR_DATE
                    .replace('{doctorId}', $scope.selectedDoctorId)
                    .replace('{date}', formattedDate);

            $http.get(consultUrl).then(function (response) {
                if (response && response.data && response.data.success) {
                    $scope.completedConsultations = response.data.data || [];
                    
                    if ($scope.completedConsultations.length === 0) {
                        $scope.loading = false;
                        $scope.filteredConsultations = [];
                        $scope.applyFilters();
                        return;
                    }

                    // 2. Collect all CVR numbers to check their invoice status
                    var cvrList = $scope.completedConsultations
                        .map(c => c.cvrNumber)
                        .filter(cvr => !!cvr);

                    // 3. Fetch invoices for these specific consultations
                    return BillingService.getInvoicesByCvrs(cvrList);
                } else {
                    throw new Error("Failed to load consultations");
                }
            }).then(function (response) {
                $scope.loading = false;
                if (response && response.data && response.data.success) {
                    $scope.invoices = response.data.data || [];

                    // 4. Map real payment status from backend invoices to consultations
                    $scope.completedConsultations.forEach(function (c) {
                        var matchedInvoice = $scope.invoices.find(function(inv) {
                            return (c.cvrNumber && inv.cvrNumber === c.cvrNumber) ||
                                   (c.appointmentId && inv.appointmentId === c.appointmentId);
                        });

                        if (matchedInvoice) {
                            c.invoiceNumber = matchedInvoice.invoiceNumber;
                            // Check if fully paid
                            if (matchedInvoice.paymentStatus === 'PAID') {
                                c.paymentStatus = 'PAID';
                                c.displayStatus = 'Done';
                            } else {
                                c.paymentStatus = 'INVOICED';
                                c.displayStatus = 'INVOICED';
                            }
                        } else {
                            c.paymentStatus = 'NOT INVOICED';
                            c.displayStatus = 'NOT INVOICED';
                        }
                    });

                    $scope.fillConsultationNames();
                    $scope.applyFilters();
                }
            }).catch(function (error) {
                $scope.loading = false;
                console.error('❌ Billing/Consultation load error:', error);
                if (error.status === 403) {
                    $rootScope.showAlert && $rootScope.showAlert('danger', 'Access denied. Please check your permissions.');
                }
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

            $scope.loadInvoicesAndConsultations();
        };

        /**
         * Refresh data
         */
        $scope.refreshData = function () {
            $scope.loadInvoicesAndConsultations();
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

        /**
         * Load records (alias for loadInvoicesAndConsultations to match HTML)
         */
        $scope.loadCompletedConsultations = function() {
            $scope.loadInvoicesAndConsultations();
        };

        /**
         * Apply local filters and handle pagination
         */
        $scope.applyFilters = function() {
            let filtered = $scope.completedConsultations || [];

            // Filter by search text
            if ($scope.filter.searchText) {
                let search = $scope.filter.searchText.toLowerCase();
                filtered = filtered.filter(function(c) {
                    return (c.pinNumber && c.pinNumber.toLowerCase().includes(search)) ||
                           (c.patientName && c.patientName.toLowerCase().includes(search)) ||
                           (c.cvrNumber && c.cvrNumber.toLowerCase().includes(search)) ||
                           (c.invoiceNumber && c.invoiceNumber.toLowerCase().includes(search));
                });
            }

            $scope.filteredConsultations = filtered;
            $scope.pagination.totalItems = filtered.length;
            $scope.pagination.totalPages = Math.ceil(filtered.length / $scope.pagination.itemsPerPage);
            $scope.pagination.currentPage = 1;
        };

        /**
         * Get current page of consultations
         */
        $scope.getPagedConsultations = function() {
            let start = ($scope.pagination.currentPage - 1) * $scope.pagination.itemsPerPage;
            let end = start + $scope.pagination.itemsPerPage;
            return $scope.filteredConsultations.slice(start, end);
        };

        /**
         * Page navigation
         */
        $scope.goToPage = function(page) {
            if (page >= 1 && page <= $scope.pagination.totalPages) {
                $scope.pagination.currentPage = page;
            }
        };

        $scope.getPageNumbers = function() {
            let pages = [];
            for (let i = 1; i <= $scope.pagination.totalPages; i++) {
                pages.push(i);
            }
            return pages;
        };

        /**
         * Action: Create Invoice for a consultation
         */
        $scope.createInvoiceForConsultation = function(consultation) {
            // Store consultation info for the create invoice page (using the key expected by InvoiceCreateController)
            localStorage.setItem('pendingInvoiceData', JSON.stringify(consultation));
            
            // Navigate to create invoice page with consultationId in the route
            // This prevents the InvoiceCreateController from clearing the localStorage data
            let id = consultation.consultationId || consultation.cvrNumber || 'new';
            $location.path('/billing/invoice/create/' + id);
        };

        /**
         * Action: Process Payment
         */
        $scope.makePayment = function(invoiceNumber) {
            if (!invoiceNumber) return;
            $location.path('/billing/payment/process/' + invoiceNumber);
        };

        // Initialize
        $scope.init();

        $scope.refreshInvoices = function () {
            $scope.loadInvoicesAndConsultations();
        };

        // Auto load when doctor changes
        $scope.$watch('selectedDoctorId', function (newVal) {
            if (newVal) {
                $scope.loadInvoicesAndConsultations();
            }
        });

        // Auto load when date changes
        $scope.$watch('selectedDate', function (newVal) {
            if (newVal && $scope.selectedDoctorId) {
                $scope.loadInvoicesAndConsultations();
            }
        });

        $scope.fillConsultationNames = function () {
            $scope.completedConsultations.forEach(function (c) {
                if (!c.patientName && c.pinNumber) {
                    PatientService.getByPin(c.pinNumber)
                            .then(function (res) {
                                if (res.data && res.data.data) {
                                    let pt = res.data.data;
                                    c.patientName = pt.fullName || (pt.firstName + ' ' + pt.lastName);
                                } else {
                                    c.patientName = 'Unknown';
                                }
                                $scope.$applyAsync();
                            })
                            .catch(function () {
                                c.patientName = 'Unknown';
                                $scope.$applyAsync();
                            });
                }
            });
        };

        // Event listeners
        $scope.$on('invoiceCreated', function (event, invoice) {
             $scope.loadInvoicesAndConsultations();
        });

        $scope.$on('consultationPaid', function (event, invoiceNumber) {
             $scope.loadInvoicesAndConsultations();
        });

    }]);