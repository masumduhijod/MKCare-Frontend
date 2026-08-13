/**
 * Patient Reports Controllers  (v3.0)
 * Report 1: Patient Registration
 * Report 2: Patient Demographics
 * Report 3: Patient Visit History
 *
 * FIXES:
 *  - printReport uses $rootScope.doPrint() (shows preview first)
 *  - errorMsg shown inline (no alert())
 *  - setQuick: added 'year' option
 *  - patients array extraction improved
 *  - activeCount / maleCount / femaleCount computed locally if backend doesn't return summary
 */

// ── Report 1: Patient Registration ──────────────────
app.controller('ReportPatientRegistrationController', ['$scope', '$rootScope', 'ReportService',
    function ($scope, $rootScope, ReportService) {

        $scope.reportTitle = 'Patient Registration Report';
        $scope.filter = {
            fromDate: ReportService.firstOfMonth(),
            toDate: ReportService.today(),
            status: ''
        };
        $scope.loading = false;
        $scope.reportData = null;
        $scope.patients = [];
        $scope.errorMsg = '';
        $scope.printDate = new Date().toLocaleString('en-IN');

        // clinicName for print footer
        $scope.clinicName = localStorage.getItem('clinicName') || 'HMIS';

        $scope.setQuick = function (type) {
            var d = new Date();
            switch (type) {
                case 'today':
                    $scope.filter.fromDate = $scope.filter.toDate = ReportService.today(); break;
                case 'week':
                    var s = new Date(d); s.setDate(d.getDate() - 6);
                    $scope.filter.fromDate = s.toISOString().split('T')[0];
                    $scope.filter.toDate = ReportService.today(); break;
                case 'month':
                    $scope.filter.fromDate = ReportService.firstOfMonth();
                    $scope.filter.toDate = ReportService.today(); break;
                case 'year':
                    $scope.filter.fromDate = d.getFullYear() + '-01-01';
                    $scope.filter.toDate = ReportService.today(); break;
            }
        };

        $scope.generateReport = function () {
            $scope.loading = true;
            $scope.reportData = null;
            $scope.errorMsg = '';
            $scope.patients = [];

            var params = {};
            if ($scope.filter.fromDate) params.fromDate = $scope.filter.fromDate;
            if ($scope.filter.toDate) params.toDate = $scope.filter.toDate;
            if ($scope.filter.status) params.status = $scope.filter.status;

            ReportService.getPatientRegistration(params)
                .then(function (data) {
                    $scope.reportData = data;
                    var d = data.data;
                    $scope.patients = Array.isArray(d) ? d
                        : (d && Array.isArray(d.patients)) ? d.patients
                            : (d && Array.isArray(d.content)) ? d.content
                                : [];
                    // Compute summary locally if backend doesn't return it
                    if (!data.summary) {
                        data.summary = {
                            activeCount: $scope.patients.filter(function (p) { return p.status === 'ACTIVE'; }).length,
                            maleCount: $scope.patients.filter(function (p) { return p.gender === 'MALE'; }).length,
                            femaleCount: $scope.patients.filter(function (p) { return p.gender === 'FEMALE'; }).length
                        };
                    }
                    $scope.printDate = new Date().toLocaleString('en-IN');
                    $scope.loading = false;
                })
                .catch(function (err) {
                    $scope.loading = false;
                    $scope.errorMsg = (err && err.message) ? err.message : 'Failed to load Patient Registration report. Check if Report-Service is running.';
                    console.error('[PatientReg Report]', err);
                });
        };

        $scope.printReport = function () {
            $scope.printDate = new Date().toLocaleString('en-IN');
            if ($rootScope.doPrint) { $rootScope.doPrint(); } else { window.print(); }
        };
    }]);


// ── Report 2: Patient Demographics ──────────────────
app.controller('ReportPatientDemographicsController', ['$scope', '$rootScope', 'ReportService',
    function ($scope, $rootScope, ReportService) {

        $scope.reportTitle = 'Patient Demographics Report';
        $scope.loading = false;
        $scope.reportData = null;
        $scope.errorMsg = '';
        $scope.genderArr = [];
        $scope.ageArr = [];
        $scope.bloodArr = [];
        $scope.cityArr = [];

        $scope.generateReport = function () {
            $scope.loading = true;
            $scope.reportData = null;
            $scope.errorMsg = '';

            ReportService.getPatientDemographics()
                .then(function (data) {
                    $scope.reportData = data;
                    $scope.data = data.data || {};
                    $scope.genderArr = objToArr($scope.data.genderDistribution);
                    $scope.ageArr = objToArr($scope.data.ageGroupDistribution);
                    $scope.bloodArr = objToArr($scope.data.bloodGroupDistribution);
                    $scope.cityArr = objToArr($scope.data.cityDistribution);
                    $scope.loading = false;
                })
                .catch(function (err) {
                    $scope.loading = false;
                    $scope.errorMsg = (err && err.message) ? err.message : 'Failed to load demographics report.';
                    console.error('[Demographics Report]', err);
                });
        };

        function objToArr(obj) {
            if (!obj) return [];
            return Object.keys(obj).map(function (k) { return { label: k, count: obj[k] }; });
        }

        $scope.printReport = function () {
            if ($rootScope.doPrint) { $rootScope.doPrint(); } else { window.print(); }
        };

        $scope.generateReport();
    }]);


// ── Report 3: Patient Visit History ─────────────────
app.controller('ReportPatientVisitHistoryController', ['$scope', '$rootScope', 'ReportService', 'DoctorService', 'PatientService', 'BillingService',
    function ($scope, $rootScope, ReportService, DoctorService, PatientService, BillingService) {

        $scope.reportTitle = 'Patient Visit History Report';
        $scope.filter = { pinNumber: '' };
        $scope.loading = false;
        $scope.reportData = null;
        $scope.visits = [];
        $scope.errorMsg = '';
        $scope.patientInfo = null;

        $scope.generateReport = function () {
            if (!$scope.filter.pinNumber) {
                $scope.errorMsg = 'Please select a Patient PIN using the search button.';
                return;
            }
            $scope.loading = true;
            $scope.reportData = null;
            $scope.errorMsg = '';
            $scope.visits = [];

            ReportService.getPatientVisitHistory($scope.filter.pinNumber)
                .then(function (data) {
                    $scope.reportData = data;
                    $scope.visitData = data.data || {};
                    $scope.patientInfo = $scope.visitData.patient || $scope.visitData.patientInfo || null;
                    $scope.visits = $scope.visitData.recentVisits || $scope.visitData.visits || [];
                    
                    // Fetch Patient Info if missing
                    if (!$scope.patientInfo && $scope.filter.pinNumber) {
                        PatientService.getByPin($scope.filter.pinNumber).then(function(res) {
                            if (res.data && res.data.success) {
                                $scope.patientInfo = res.data.data;
                            }
                        });
                    }

                    // Map missing details
                    DoctorService.getActiveDoctors().then(function(docRes) {
                        var doctors = (docRes.data && docRes.data.data) ? docRes.data.data : [];
                        
                        BillingService.getPatientInvoices($scope.filter.pinNumber).then(function(invRes) {
                            var invoices = (invRes.data && invRes.data.data) ? invRes.data.data : [];
                            
                            $scope.visits.forEach(function(v) {
                                // Map Visit Date fallback
                                if (!v.visitDate && v.appointmentDate) v.visitDate = v.appointmentDate;
                                
                                // Map Doctor
                                if (!v.doctorName && v.doctorId) {
                                    var doc = doctors.find(function(d) { return d.doctorId === v.doctorId; });
                                    if (doc) v.doctorName = doc.fullName;
                                }
                                
                                // Map Amount from invoice
                                if (v.cvrNumber) {
                                    var inv = invoices.find(function(i) { return i.cvrNumber === v.cvrNumber; });
                                    if (inv) v.amount = inv.totalAmount;
                                }
                            });
                            $scope.loading = false;
                        }).catch(function() {
                            $scope.loading = false;
                        });
                    }).catch(function() {
                        $scope.loading = false;
                    });
                })
                .catch(function (err) {
                    $scope.loading = false;
                    $scope.errorMsg = (err && err.message) ? err.message : 'Failed to load visit history. Check if patient PIN is correct.';
                    console.error('[Visit History Report]', err);
                });
        };

        // Called by pin-lov on-select
        $scope.onPatientSelect = function (patient) {
            $scope.filter.pinNumber = patient.pinNumber;
        };

        $scope.printReport = function () {
            if ($rootScope.doPrint) { $rootScope.doPrint(); } else { window.print(); }
        };
    }]);
