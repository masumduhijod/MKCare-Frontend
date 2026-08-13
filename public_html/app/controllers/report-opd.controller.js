/**
 * OPD Reports Controllers  (v3.0)
 * Report 4: OPD Daily
 * Report 5: OPD Department-wise
 * Report 10: CVR Summary
 * Report 11: Prescription Report
 *
 * FIXES:
 *  - printReport via $rootScope.doPrint()
 *  - alert() removed → errorMsg inline
 *  - Doctor LOV properly used in appointment schedule
 */

// ── Report 4: OPD Daily ─────────────────────────────
app.controller('ReportOpdDailyController', ['$scope', '$rootScope', 'ReportService',
    function ($scope, $rootScope, ReportService) {

        $scope.reportTitle = 'OPD Daily Report';
        $scope.filter = { date: ReportService.today() };
        $scope.loading = false;
        $scope.reportData = null;
        $scope.deptArr = [];
        $scope.statusArr = [];
        $scope.errorMsg = '';

        function toArr(obj) {
            if (!obj) return [];
            return Object.keys(obj).map(function (k) { return { label: k, count: obj[k] }; });
        }

        $scope.generateReport = function () {
            $scope.loading = true;
            $scope.reportData = null;
            $scope.errorMsg = '';
            ReportService.getOpdDaily($scope.filter.date)
                .then(function (data) {
                    $scope.reportData = data;
                    $scope.data = data.data || {};
                    $scope.deptArr = toArr($scope.data.departmentWiseCount);
                    $scope.statusArr = toArr($scope.data.statusWiseCount);
                    $scope.loading = false;
                }).catch(function (err) {
                    $scope.loading = false;
                    $scope.errorMsg = (err && err.message) ? err.message : 'Failed to load OPD Daily report.';
                    console.error('[OPD Daily Report]', err);
                });
        };

        $scope.printReport = function () {
            if ($rootScope.doPrint) { $rootScope.doPrint(); } else { window.print(); }
        };
        $scope.generateReport();
    }]);


// ── Report 5: OPD Department-wise ───────────────────
app.controller('ReportOpdDeptController', ['$scope', '$rootScope', 'ReportService',
    function ($scope, $rootScope, ReportService) {

        $scope.reportTitle = 'OPD Department-wise Report';
        $scope.filter = {
            fromDate: ReportService.firstOfMonth(),
            toDate: ReportService.today()
        };
        $scope.loading = false;
        $scope.reportData = null;
        $scope.deptArr = [];
        $scope.errorMsg = '';

        $scope.generateReport = function () {
            if (!$scope.filter.fromDate || !$scope.filter.toDate) {
                $scope.errorMsg = 'Please select From Date and To Date.'; return;
            }
            $scope.loading = true;
            $scope.errorMsg = '';
            ReportService.getOpdDepartmentWise($scope.filter.fromDate, $scope.filter.toDate)
                .then(function (data) {
                    $scope.reportData = data;
                    var dept = (data.data && data.data.departmentWiseData) ? data.data.departmentWiseData : {};
                    $scope.deptArr = Object.keys(dept).map(function (k) {
                        return angular.extend({ dept: k }, dept[k]);
                    });
                    $scope.summary = data.data || {};
                    $scope.loading = false;
                }).catch(function (err) {
                    $scope.loading = false;
                    $scope.errorMsg = (err && err.message) ? err.message : 'Failed to load department report.';
                    console.error('[OPD Dept Report]', err);
                });
        };

        $scope.printReport = function () {
            if ($rootScope.doPrint) { $rootScope.doPrint(); } else { window.print(); }
        };
        $scope.generateReport();
    }]);


// ── Report 10: CVR Summary ──────────────────────────
app.controller('ReportCvrSummaryController', ['$scope', '$rootScope', 'ReportService', 'PatientService', 'DoctorService',
    function ($scope, $rootScope, ReportService, PatientService, DoctorService) {

        $scope.reportTitle = 'CVR Summary Report';
        $scope.filter = {
            searchMode: 'date',
            fromDate: ReportService.today(),
            toDate: ReportService.today(),
            cvrNumber: '',
            pinNumber: ''
        };
        $scope.loading = false;
        $scope.reportData = null;
        $scope.cvrList = [];
        $scope.errorMsg = '';

        $scope.generateReport = function () {
            $scope.loading = true;
            $scope.reportData = null;
            $scope.cvrList = [];
            $scope.errorMsg = '';

            var params = {};
            if ($scope.filter.searchMode === 'cvr' && $scope.filter.cvrNumber) {
                params.cvrNumber = $scope.filter.cvrNumber;
            } else if ($scope.filter.searchMode === 'pin' && $scope.filter.pinNumber) {
                params.pinNumber = $scope.filter.pinNumber;
            } else {
                if ($scope.filter.fromDate) params.fromDate = $scope.filter.fromDate;
                if ($scope.filter.toDate) params.toDate = $scope.filter.toDate;
            }

            ReportService.getCvrSummary(params)
                .then(function (data) {
                    $scope.reportData = data;
                    var d = data.data;
                    if (d && d.cvrNumber) {
                        $scope.cvrList = [d];
                    } else if (d && Array.isArray(d.cvrList)) {
                        $scope.cvrList = d.cvrList;
                    } else if (Array.isArray(d)) {
                        $scope.cvrList = d;
                    } else {
                        $scope.cvrList = [];
                    }
                    
                    DoctorService.getActiveDoctors().then(function(docRes) {
                        var doctors = (docRes.data && docRes.data.data) ? docRes.data.data : [];
                        
                        $scope.cvrList.forEach(function(cvr) {
                            // Map Doctor Name
                            if (!cvr.doctorName && cvr.doctorId) {
                                var doc = doctors.find(function(d) { return d.doctorId === cvr.doctorId; });
                                if (doc) cvr.doctorName = doc.fullName;
                            }
                            
                            // Map Patient Name
                            if (cvr.pinNumber && !cvr.patientName) {
                                PatientService.getByPin(cvr.pinNumber).then(function(res) {
                                    if (res && res.data) {
                                        cvr.patientName = res.data.firstName + ' ' + res.data.lastName;
                                    }
                                });
                            }
                        });
                        $scope.loading = false;
                    }).catch(function() {
                        $scope.loading = false;
                    });
                }).catch(function (err) {
                    $scope.loading = false;
                    $scope.errorMsg = (err && err.message) ? err.message : 'Failed to load CVR report.';
                    console.error('[CVR Summary Report]', err);
                });
        };

        $scope.printReport = function () {
            if ($rootScope.doPrint) { $rootScope.doPrint(); } else { window.print(); }
        };
    }]);


// ── Report 11: Prescription Report ─────────────────
app.controller('ReportPrescriptionController', ['$scope', '$rootScope', '$timeout', 'ReportService', 'PatientService',
    function ($scope, $rootScope, $timeout, ReportService, PatientService) {

        $scope.reportTitle = 'Prescription Report';
        $scope.filter = {
            searchMode: 'pin',
            pinNumber: '',
            prescriptionId: '',
            date: ReportService.today()
        };
        $scope.loading = false;
        $scope.reportData = null;
        $scope.prescriptions = [];
        $scope.selectedPrescriptions = [];
        $scope.allSelected = false;
        $scope.errorMsg = '';

        $scope.generateReport = function () {
            $scope.loading = true;
            $scope.reportData = null;
            $scope.selectedPrescriptions = [];
            $scope.allSelected = false;
            $scope.errorMsg = '';
            var params = {};
            if ($scope.filter.searchMode === 'pin' && $scope.filter.pinNumber) {
                params.pinNumber = $scope.filter.pinNumber;
            } else if ($scope.filter.searchMode === 'prescription' && $scope.filter.prescriptionId) {
                params.prescriptionId = $scope.filter.prescriptionId;
            } else if ($scope.filter.date) {
                params.date = $scope.filter.date;
            }

            ReportService.getPrescriptions(params)
                .then(function (data) {
                    $scope.reportData = data;
                    $scope.prescriptions = (data.data && data.data.prescriptions) ? data.data.prescriptions
                        : Array.isArray(data.data) ? data.data : [];

                    // Initialize checkbox state
                    $scope.prescriptions.forEach(function(p) {
                        p.$selected = false;
                    });

                    // Fetch patient names if missing
                    $scope.prescriptions.forEach(function(p) {
                        if (p.pinNumber && !p.patientName) {
                            PatientService.getByPin(p.pinNumber).then(function(res) {
                                if (res && res.data && res.data.data) {
                                    var pt = res.data.data;
                                    p.patientName = (pt.firstName || '') + ' ' + (pt.lastName || '');
                                } else if (res && res.data && res.data.fullName) {
                                    p.patientName = res.data.fullName;
                                }
                            });
                        }
                    });

                    $scope.loading = false;
                }).catch(function (err) {
                    $scope.loading = false;
                    $scope.errorMsg = (err && err.message) ? err.message : 'Failed to load prescription report.';
                    console.error('[Prescription Report]', err);
                });
        };

        // ── Multi-select helpers ──────────────────────
        $scope.toggleSelectAll = function () {
            $scope.prescriptions.forEach(function(p) {
                p.$selected = $scope.allSelected;
            });
        };

        $scope.updateAllSelected = function () {
            $scope.allSelected = $scope.prescriptions.every(function(p) { return p.$selected; });
        };

        $scope.selectedCount = function () {
            return $scope.prescriptions.filter(function(p) { return p.$selected; }).length;
        };

        // ── Print helpers ─────────────────────────────
        $scope.printSelected = function () {
            $scope.selectedPrescriptions = $scope.prescriptions.filter(function(p) { return p.$selected; });
            if ($scope.selectedPrescriptions.length === 0) return;
            $timeout(function() {
                if ($rootScope.doPrint) { $rootScope.doPrint(); } else { window.print(); }
            }, 200);
        };

        $scope.printSingle = function (rx) {
            $scope.selectedPrescriptions = [rx];
            $timeout(function() {
                if ($rootScope.doPrint) { $rootScope.doPrint(); } else { window.print(); }
            }, 200);
        };

        $scope.printReport = function () {
            $scope.selectedPrescriptions = angular.copy($scope.prescriptions);
            $timeout(function() {
                if ($rootScope.doPrint) { $rootScope.doPrint(); } else { window.print(); }
            }, 200);
        };
    }]);

