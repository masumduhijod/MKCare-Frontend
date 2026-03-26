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
            var params = {
                fromDate: $scope.filter.fromDate,
                toDate: $scope.filter.toDate
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
            ReportService.getAppointmentStatusSummary($scope.filter.fromDate, $scope.filter.toDate)
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
            ReportService.getDoctorAvailability($scope.filter.date)
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
app.controller('ReportInvoiceSummaryController', ['$scope', '$rootScope', 'ReportService',
    function ($scope, $rootScope, ReportService) {

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
                if ($scope.filter.fromDate) params.fromDate = $scope.filter.fromDate;
                if ($scope.filter.toDate) params.toDate = $scope.filter.toDate;
            }

            ReportService.getInvoiceSummary(params)
                .then(function (data) {
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
            $scope.loading = true;
            $scope.errorMsg = '';
            var params = {
                fromDate: $scope.filter.fromDate,
                toDate: $scope.filter.toDate
            };
            if ($scope.filter.doctorId) params.doctorId = $scope.filter.doctorId;

            ReportService.getPaymentCollection(params)
                .then(function (data) {
                    $scope.reportData = data;
                    $scope.summary = data.data || {};
                    $scope.payments = $scope.summary.payments || [];
                    $scope.modeArr = toArr($scope.summary.paymentModeWise);
                    $scope.loading = false;
                }).catch(function (err) {
                    $scope.loading = false;
                    $scope.errorMsg = (err && err.message) ? err.message : 'Failed to load payment collection.';
                    console.error('[Payment Collection Report]', err);
                });
        };

        function toArr(obj) {
            if (!obj) return [];
            return Object.keys(obj).map(function (k) { return { mode: k, amount: obj[k] }; });
        }

        $scope.printReport = function () {
            if ($rootScope.doPrint) { $rootScope.doPrint(); } else { window.print(); }
        };
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
        $scope.filter = {
            fromDate: ReportService.firstOfMonth(),
            toDate: ReportService.today()
        };
        $scope.loading = false;
        $scope.reportData = null;
        $scope.typeArr = [];
        $scope.errorMsg = '';

        $scope.generateReport = function () {
            $scope.loading = true;
            $scope.errorMsg = '';
            ReportService.getRevenueAnalysis($scope.filter.fromDate, $scope.filter.toDate)
                .then(function (data) {
                    $scope.reportData = data;
                    $scope.data = data.data || {};
                    $scope.typeArr = toArr($scope.data.invoiceTypeWiseRevenue);
                    $scope.loading = false;
                }).catch(function (err) {
                    $scope.loading = false;
                    $scope.errorMsg = (err && err.message) ? err.message : 'Failed to load revenue analysis.';
                    console.error('[Revenue Analysis Report]', err);
                });
        };

        function toArr(obj) {
            if (!obj) return [];
            return Object.keys(obj).map(function (k) { return { type: k, amount: obj[k] }; });
        }

        $scope.printReport = function () {
            if ($rootScope.doPrint) { $rootScope.doPrint(); } else { window.print(); }
        };
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
            if ($scope.filter.doctorId) params.doctorId = $scope.filter.doctorId;
            if ($scope.filter.fromDate) params.fromDate = $scope.filter.fromDate;
            if ($scope.filter.toDate) params.toDate = $scope.filter.toDate;

            ReportService.getDoctorSchedule(params)
                .then(function (data) {
                    $scope.reportData = data;
                    $scope.summary = data.data || {};
                    $scope.doctors = $scope.summary.doctorSchedules || [];
                    $scope.loading = false;
                }).catch(function (err) {
                    $scope.loading = false;
                    $scope.errorMsg = (err && err.message) ? err.message : 'Failed to load doctor schedule.';
                    console.error('[Doctor Schedule Report]', err);
                });
        };

        $scope.printReport = function () {
            if ($rootScope.doPrint) { $rootScope.doPrint(); } else { window.print(); }
        };
        $scope.generateReport();
    }]);
