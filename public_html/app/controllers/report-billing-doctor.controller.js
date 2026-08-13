/**
 * Appointment, Billing & Doctor Report Controllers  (v3.0)
 *
 * FIXES:
 *  - printReport via $rootScope.doPrint()
 *  - alert() removed → errorMsg inline
 *  - Doctor LOV works for Appointment Schedule + Payment Collection + Doctor Reports
 */

// ── Report 7: Appointment Schedule ─────────────────
app.controller('ReportAppointmentScheduleController', ['$scope', '$rootScope', 'ReportService',
    function ($scope, $rootScope, ReportService) {

        $scope.reportTitle = 'Appointment Schedule Report';
        $scope.filter = {
            fromDate: ReportService.today(),
            toDate: ReportService.today(),
            doctorId: '',
            status: ''
        };
        $scope.loading = false;
        $scope.reportData = null;
        $scope.appointments = [];
        $scope.summary = {};
        $scope.errorMsg = '';

        $scope.generateReport = function () {
            if (!$scope.filter.fromDate || !$scope.filter.toDate) {
                $scope.errorMsg = 'Please select a date range.'; return;
            }
            $scope.loading = true;
            $scope.errorMsg = '';
            
            // âœ… EASY FIX: Format dates to yyyy-MM-dd
            var params = {
                fromDate: new Date($scope.filter.fromDate).toISOString().split('T')[0],
                toDate: new Date($scope.filter.toDate).toISOString().split('T')[0]
            };
            
            if ($scope.filter.doctorId) params.doctorId = $scope.filter.doctorId;
            if ($scope.filter.status) params.status = $scope.filter.status;

            ReportService.getAppointmentSchedule(params)
                .then(function (data) {
                    $scope.reportData = data;
                    $scope.appointments = Array.isArray(data.data) ? data.data
                        : (data.data && Array.isArray(data.data.appointments)) ? data.data.appointments : [];
                    $scope.summary = data.summary || data.data && data.data.summary || {};
                    $scope.loading = false;
                }).catch(function (err) {
                    $scope.loading = false;
                    $scope.errorMsg = (err && err.message) ? err.message : 'Failed to load appointment schedule.';
                    console.error('[Appt Schedule Report]', err);
                });
        };

        $scope.printReport = function () {
            if ($rootScope.doPrint) { $rootScope.doPrint(); } else { window.print(); }
        };
        $scope.generateReport();
    }]);


// ── Report 8: Appointment Status Summary ───────────
app.controller('ReportAppointmentStatusController', ['$scope', '$rootScope', 'ReportService',
    function ($scope, $rootScope, ReportService) {

        $scope.reportTitle = 'Appointment Status Summary';
        $scope.filter = {
            fromDate: ReportService.firstOfMonth(),
            toDate: ReportService.today()
        };
        $scope.loading = false;
        $scope.reportData = null;
        $scope.statusArr = [];
        $scope.errorMsg = '';

        $scope.generateReport = function () {
            $scope.loading = true;
            $scope.errorMsg = '';
            
            // âœ… FIX: Format dates to yyyy-MM-dd
            var fromDate = new Date($scope.filter.fromDate).toISOString().split('T')[0];
            var toDate = new Date($scope.filter.toDate).toISOString().split('T')[0];
            
            ReportService.getAppointmentStatusSummary(fromDate, toDate)
                .then(function (data) {
                    $scope.reportData = data;
                    $scope.summary = data.data || {};
                    $scope.statusArr = toArr($scope.summary.statusSummary);
                    $scope.loading = false;
                }).catch(function (err) {
                    $scope.loading = false;
                    $scope.errorMsg = (err && err.message) ? err.message : 'Failed to load status summary.';
                    console.error('[Appt Status Report]', err);
                });
        };

        function toArr(obj) {
            if (!obj) return [];
            return Object.keys(obj).map(function (k) { return { label: k, count: obj[k] }; });
        }

        $scope.printReport = function () {
            if ($rootScope.doPrint) { $rootScope.doPrint(); } else { window.print(); }
        };
        $scope.generateReport();
    }]);


// ── Report 9: Doctor Availability ──────────────────
app.controller('ReportDoctorAvailabilityController', ['$scope', '$rootScope', 'ReportService',
    function ($scope, $rootScope, ReportService) {

        $scope.reportTitle = 'Doctor Availability Report';
        $scope.filter = { date: ReportService.today() };
        $scope.loading = false;
        $scope.doctors = [];
        $scope.errorMsg = '';

        $scope.generateReport = function () {
            $scope.loading = true;
            $scope.errorMsg = '';
            
            // âœ… FIX: Format date to yyyy-MM-dd
            var formattedDate = new Date($scope.filter.date).toISOString().split('T')[0];
            
            ReportService.getDoctorAvailability(formattedDate)
                .then(function (data) {
                    $scope.reportData = data;
                    $scope.summary = data.data || {};
                    $scope.doctors = $scope.summary.doctorAvailability || $scope.summary.doctors || [];
                    $scope.loading = false;
                }).catch(function (err) {
                    $scope.loading = false;
                    $scope.errorMsg = (err && err.message) ? err.message : 'Failed to load doctor availability.';
                    console.error('[Doctor Availability Report]', err);
                });
        };

        $scope.printReport = function () {
            if ($rootScope.doPrint) { $rootScope.doPrint(); } else { window.print(); }
        };
        $scope.generateReport();
    }]);


// ══════════════════════════════════════════════════════
// BILLING REPORTS
// ══════════════════════════════════════════════════════

// ── Report 12: Invoice Summary ──────────────────────
app.controller('ReportInvoiceSummaryController', ['$scope', '$rootScope', 'ReportService', 'PatientService',
    function ($scope, $rootScope, ReportService, PatientService) {

        $scope.reportTitle = 'Invoice Summary Report';
        $scope.filter = {
            searchMode: 'daterange',
            pinNumber: '',
            invoiceNumber: '',
            fromDate: ReportService.firstOfMonth(),
            toDate: ReportService.today()
        };
        $scope.loading = false;
        $scope.reportData = null;
        $scope.invoices = [];
        $scope.summary = {};
        $scope.errorMsg = '';

        $scope.generateReport = function () {
            $scope.loading = true;
            $scope.errorMsg = '';
            $scope.reportData = null;
            $scope.invoices = [];
            var params = {};
            if ($scope.filter.searchMode === 'pin' && $scope.filter.pinNumber) {
                params.pinNumber = $scope.filter.pinNumber;
            } else if ($scope.filter.searchMode === 'invoice' && $scope.filter.invoiceNumber) {
                params.invoiceNumber = $scope.filter.invoiceNumber;
            } else {
                // âœ… ADD THIS: Format dates to yyyy-MM-dd
                if ($scope.filter.fromDate) {
                    var fromDate = new Date($scope.filter.fromDate);
                    params.fromDate = fromDate.getFullYear() + '-' + 
                                     String(fromDate.getMonth() + 1).padStart(2, '0') + '-' + 
                                     String(fromDate.getDate()).padStart(2, '0');
            }
                if ($scope.filter.toDate) {
                    var toDate = new Date($scope.filter.toDate);
                    params.toDate = toDate.getFullYear() + '-' + 
                                   String(toDate.getMonth() + 1).padStart(2, '0') + '-' + 
                                   String(toDate.getDate()).padStart(2, '0');
                }
            }

            console.log('Invoice params:', params); // Debug log

            ReportService.getInvoiceSummary(params)
                .then(function (data) {
                    console.log('Invoice response:', data); // Debug log
                    
                    $scope.reportData = data;
                    var d = data.data || {};
                    if (d.invoiceNumber) {
                        $scope.invoices = [d];
                    } else {
                        $scope.invoices = d.invoices || (Array.isArray(d) ? d : []);
                    }
                    // Compute summary locally if not returned
                    $scope.summary = {
                        totalInvoices: d.totalInvoices || $scope.invoices.length,
                        totalAmount: d.totalAmount || $scope.invoices.reduce(function (a, i) { return a + (i.totalAmount || 0); }, 0),
                        paidAmount: d.paidAmount || $scope.invoices.reduce(function (a, i) { return a + (i.paidAmount || 0); }, 0),
                        outstandingAmount: d.outstandingAmount || $scope.invoices.reduce(function (a, i) { return a + (i.outstandingAmount || 0); }, 0)
                    };
                    $scope.loading = false;
                    
                    // Fetch patient names if missing
                    $scope.invoices.forEach(function(inv) {
                        if (inv.pinNumber && !inv.patientName) {
                            PatientService.getByPin(inv.pinNumber).then(function(res) {
                                if (res && res.data) {
                                    inv.patientName = res.data.firstName + ' ' + res.data.lastName;
                                }
                            });
                        }
                    });
                    
                    if ($scope.invoices.length === 0) {
                        $scope.errorMsg = 'No invoices found for the selected criteria.';
                    }
                }).catch(function (err) {
                    $scope.loading = false;
                    $scope.errorMsg = (err && err.message) ? err.message : 'Failed to load invoice summary.';
                    console.error('[Invoice Summary Report]', err);
                });
        };

        $scope.printReport = function () {
            if ($rootScope.doPrint) { $rootScope.doPrint(); } else { window.print(); }
        };
    }]);


// ── Report 13: Payment Collection ──────────────────
app.controller('ReportPaymentCollectionController', ['$scope', '$rootScope', 'ReportService',
    function ($scope, $rootScope, ReportService) {

        $scope.reportTitle = 'Payment Collection Report';
        $scope.filter = {
            fromDate: ReportService.firstOfMonth(),
            toDate: ReportService.today(),
            doctorId: ''
        };
        $scope.loading = false;
        $scope.reportData = null;
        $scope.payments = [];
        $scope.modeArr = [];
        $scope.summary = {};
        $scope.errorMsg = '';

        $scope.generateReport = function () {
            if (!$scope.filter.fromDate || !$scope.filter.toDate) {
                $scope.errorMsg = 'Please select both From Date and To Date.';
                return;
            }
            
            $scope.loading = true;
            $scope.errorMsg = '';
            
            // âœ… FIX: Format dates to yyyy-MM-dd
            var fromDate = new Date($scope.filter.fromDate);
            var toDate = new Date($scope.filter.toDate);
            
            var params = {
                fromDate: fromDate.getFullYear() + '-' + 
                          String(fromDate.getMonth() + 1).padStart(2, '0') + '-' + 
                          String(fromDate.getDate()).padStart(2, '0'),
                toDate: toDate.getFullYear() + '-' + 
                        String(toDate.getMonth() + 1).padStart(2, '0') + '-' + 
                        String(toDate.getDate()).padStart(2, '0')
            };

            if ($scope.filter.doctorId) {
                params.doctorId = $scope.filter.doctorId;
            }

            console.log('Payment Collection Params:', params);

            ReportService.getPaymentCollection(params)
                .then(function (data) {
                    console.log('Payment Collection Response:', data);
                    
                    $scope.reportData = data;
                    $scope.summary = data.data || {};
                    $scope.payments = $scope.summary.payments || [];
                    $scope.modeArr = toArr($scope.summary.paymentModeWise);
                    
                    if ($scope.payments.length === 0) {
                        $scope.errorMsg = 'No payments found for the selected date range.';
                    }
                    
                    $scope.loading = false;
                }).catch(function (err) {
                    $scope.loading = false;
                    $scope.errorMsg = (err && err.message) ? err.message : 'Failed to load payment collection.';
                    console.error('[Payment Collection Report] Error:', err);
                });
        };

        function toArr(obj) {
            if (!obj) return [];
            return Object.keys(obj).map(function (k) { 
                return { mode: k, amount: obj[k] }; 
            });
        }

        $scope.printReport = function () {
            if ($rootScope.doPrint) { $rootScope.doPrint(); } else { window.print(); }
        };
        
        // Auto-generate on load
        $scope.generateReport();
    }]);


// ── Report 14: Outstanding Dues ─────────────────────
app.controller('ReportOutstandingDuesController', ['$scope', '$rootScope', 'ReportService',
    function ($scope, $rootScope, ReportService) {

        $scope.reportTitle = 'Outstanding Dues Report';
        $scope.loading = false;
        $scope.reportData = null;
        $scope.invoices = [];
        $scope.summary = {};
        $scope.errorMsg = '';

        $scope.generateReport = function () {
            $scope.loading = true;
            $scope.errorMsg = '';
            ReportService.getOutstandingDues()
                .then(function (data) {
                    $scope.reportData = data;
                    $scope.summary = data.data || {};
                    $scope.invoices = $scope.summary.pendingInvoices || [];
                    $scope.loading = false;
                }).catch(function (err) {
                    $scope.loading = false;
                    $scope.errorMsg = (err && err.message) ? err.message : 'Failed to load outstanding dues.';
                    console.error('[Outstanding Dues Report]', err);
                });
        };

        $scope.printReport = function () {
            if ($rootScope.doPrint) { $rootScope.doPrint(); } else { window.print(); }
        };
        $scope.generateReport();
    }]);


// ── Report 15: Revenue Analysis ─────────────────────
app.controller('ReportRevenueAnalysisController', ['$scope', '$rootScope', 'ReportService',
    function ($scope, $rootScope, ReportService) {

        $scope.reportTitle = 'Revenue Analysis Report';
        
        // Helper function to convert string to Date object
        function toDateObject(dateStr) {
            if (!dateStr) return null;
            if (dateStr instanceof Date) return dateStr;
            var parts = dateStr.split('-');
            return new Date(parts[0], parts[1] - 1, parts[2]);
        }
        
        $scope.filter = {
            fromDate: toDateObject(ReportService.firstOfMonth()),
            toDate: toDateObject(ReportService.today())
        };
        
        $scope.loading = false;
        $scope.reportData = null;
        $scope.typeArr = [];
        $scope.errorMsg = '';

        // Helper function to format date
        function formatDate(dateValue) {
            if (!dateValue) return null;
            var date = new Date(dateValue);
            return date.getFullYear() + '-' + 
                   String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                   String(date.getDate()).padStart(2, '0');
        }

        $scope.generateReport = function () {
            if (!$scope.filter.fromDate || !$scope.filter.toDate) {
                $scope.errorMsg = 'Please select both From Date and To Date.';
                return;
            }
            
            $scope.loading = true;
            $scope.errorMsg = '';
            
            // Format dates before sending
            var formattedFromDate = formatDate($scope.filter.fromDate);
            var formattedToDate = formatDate($scope.filter.toDate);
            
            console.log('Revenue Analysis - Sending:', {
                fromDate: formattedFromDate,
                toDate: formattedToDate
            });
            
            ReportService.getRevenueAnalysis(formattedFromDate, formattedToDate)
                .then(function (data) {
                    console.log('Revenue Analysis Response:', data);
                    
                    $scope.reportData = data;
                    $scope.data = data.data || {};
                    $scope.typeArr = toArr($scope.data.invoiceTypeWiseRevenue);
                    $scope.loading = false;
                    
                    if ($scope.data.totalInvoices === 0 || !$scope.data.totalInvoices) {
                        $scope.errorMsg = 'No revenue data found for selected dates.';
                    }
                }).catch(function (err) {
                    $scope.loading = false;
                    $scope.errorMsg = (err && err.message) ? err.message : 'Failed to load revenue analysis.';
                    console.error('[Revenue Analysis Report] Error:', err);
                });
        };

        function toArr(obj) {
            if (!obj) return [];
            return Object.keys(obj).map(function (k) { 
                return { type: k, amount: obj[k] }; 
            });
        }

        $scope.printReport = function () {
            if ($rootScope.doPrint) { $rootScope.doPrint(); } else { window.print(); }
        };
        
        // Auto-generate on load
        $scope.generateReport();
    }]);


// ══════════════════════════════════════════════════════
// DOCTOR REPORTS
// ══════════════════════════════════════════════════════

// ── Report 16: Doctor Consultation ─────────────────
app.controller('ReportDoctorConsultationController', ['$scope', '$rootScope', 'ReportService',
    function ($scope, $rootScope, ReportService) {

        $scope.reportTitle = 'Doctor Consultation Report';
        $scope.filter = {
            doctorId: '',
            fromDate: ReportService.firstOfMonth(),
            toDate: ReportService.today()
        };
        $scope.loading = false;
        $scope.reportData = null;
        $scope.consultations = [];
        $scope.docData = {};
        $scope.errorMsg = '';

        $scope.generateReport = function () {
            if (!$scope.filter.doctorId) {
                $scope.errorMsg = 'Please select a Doctor using the search button.';
                return;
            }
            $scope.loading = true;
            $scope.errorMsg = '';
            ReportService.getDoctorConsultations(
                $scope.filter.doctorId,
                $scope.filter.fromDate,
                $scope.filter.toDate
            ).then(function (data) {
                $scope.reportData = data;
                $scope.docData = data.data || {};
                $scope.consultations = $scope.docData.consultations || [];
                $scope.loading = false;
            }).catch(function (err) {
                $scope.loading = false;
                $scope.errorMsg = (err && err.message) ? err.message : 'Failed to load doctor consultations.';
                console.error('[Doctor Consultation Report]', err);
            });
        };

        $scope.printReport = function () {
            if ($rootScope.doPrint) { $rootScope.doPrint(); } else { window.print(); }
        };
    }]);


// ── Report 17: Doctor Schedule ──────────────────────
app.controller('ReportDoctorScheduleController', ['$scope', '$rootScope', 'ReportService',
    function ($scope, $rootScope, ReportService) {

        $scope.reportTitle = 'Doctor Schedule Report';
        $scope.filter = {
            doctorId: '',
            fromDate: ReportService.today(),
            toDate: ''
        };
        $scope.loading = false;
        $scope.reportData = null;
        $scope.doctors = [];
        $scope.errorMsg = '';

        $scope.generateReport = function () {
            $scope.loading = true;
            $scope.errorMsg = '';
            var params = {};

            if ($scope.filter.doctorId) {
                params.doctorId = $scope.filter.doctorId;
            }
            
            // Format dates
            if ($scope.filter.fromDate) {
                var fromDate = new Date($scope.filter.fromDate);
                params.fromDate = fromDate.getFullYear() + '-' + 
                                 String(fromDate.getMonth() + 1).padStart(2, '0') + '-' + 
                                 String(fromDate.getDate()).padStart(2, '0');
            }
            
            if ($scope.filter.toDate) {
                var toDate = new Date($scope.filter.toDate);
                params.toDate = toDate.getFullYear() + '-' + 
                               String(toDate.getMonth() + 1).padStart(2, '0') + '-' + 
                               String(toDate.getDate()).padStart(2, '0');
            }

            console.log('Doctor Schedule Params:', params);

            ReportService.getDoctorSchedule(params)
                .then(function (data) {
                    console.log('Doctor Schedule Response:', data);
                    
                    $scope.reportData = data;
                    
                    if (data.data) {
                        var schedulesData = data.data;
                        
                        // âœ… FIX: Map schedules to upcomingSchedules for the template
                        if (schedulesData.schedules && Array.isArray(schedulesData.schedules)) {
                            // Create doctor object with upcomingSchedules
                            var doctorObj = {
                                doctorId: schedulesData.doctorId,
                                doctorName: schedulesData.doctorName,
                                specialization: schedulesData.specialization,
                                department: schedulesData.department,
                                upcomingSchedules: schedulesData.schedules  // Map to upcomingSchedules
                            };
                            $scope.doctors = [doctorObj];
                        } 
                        // Handle multiple doctors case
                        else if (schedulesData.doctorSchedules && Array.isArray(schedulesData.doctorSchedules)) {
                            $scope.doctors = schedulesData.doctorSchedules.map(function(doc) {
                                return {
                                    doctorId: doc.doctorId,
                                    doctorName: doc.doctorName,
                                    specialization: doc.specialization,
                                    department: doc.department,
                                    upcomingSchedules: doc.schedules || doc.upcomingSchedules || []
                                };
                            });
                        }
                        else {
                            $scope.doctors = [];
                        }
                    }
                    
                    console.log('Final doctors with upcomingSchedules:', $scope.doctors);
                    console.log('Number of doctors:', $scope.doctors.length);
                    
                    if ($scope.doctors.length === 0) {
                        $scope.errorMsg = 'No schedules found for the selected criteria.';
                    }
                    
                    $scope.loading = false;
                }).catch(function (err) {
                    $scope.loading = false;
                    $scope.errorMsg = (err && err.message) ? err.message : 'Failed to load doctor schedule.';
                    console.error('[Doctor Schedule Report] Error:', err);
                });
        };

        $scope.printReport = function () {
            if ($rootScope.doPrint) { $rootScope.doPrint(); } else { window.print(); }
        };
        
        $scope.generateReport();
    }]);
