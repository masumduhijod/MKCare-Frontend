/**
 * Patient Case File Controller (v1.0)
 * Aggregates entire patient history for clinical viewing and printing.
 */
app.controller('ReportPatientCaseFileController', ['$scope', '$rootScope', '$q', 'PatientService', 'CVRService', 'OPDService', 'DoctorService',
    function ($scope, $rootScope, $q, PatientService, CVRService, OPDService, DoctorService) {

    $scope.reportTitle = 'Comprehensive Patient Case File';
    $scope.loading = false;
    $scope.errorMsg = '';
    
    // Selection state
    $scope.filter = { pinNumber: '' };
    $scope.patient = null;
    $scope.medicalHistory = null;
    
    // Data sections
    $scope.visits = [];
    $scope.vitals = [];
    $scope.consultations = [];
    $scope.prescriptions = [];
    
    $scope.printDate = new Date().toLocaleString('en-IN');
    $scope.clinicName = localStorage.getItem('clinicName') || 'HMIS Hospital';

    /**
     * Called when patient is selected from LOV
     */
    $scope.onPatientSelect = function(patient) {
        $scope.filter.pinNumber = patient.pinNumber;
        $scope.generateFile();
    };

    /**
     * Aggregate all data for the selected PIN
     */
    $scope.generateFile = function() {
        if (!$scope.filter.pinNumber) {
            $scope.errorMsg = 'Please select a Patient PIN first.';
            return;
        }

        $scope.loading = true;
        $scope.errorMsg = '';
        $scope.patient = null;
        
        // Reset data
        $scope.visits = [];
        $scope.vitals = [];
        $scope.consultations = [];
        $scope.prescriptions = [];

        // 1. Fetch Patient Basic Info & Medical History
        PatientService.getByPin($scope.filter.pinNumber)
            .then(function(res) {
                if (res.data && res.data.success) {
                    $scope.patient = res.data.data;
                    
                    // Fetch Medical History separately
                    PatientService.getMedicalHistory($scope.patient.pinNumber)
                        .then(function(hist) {
                            if (hist.data && hist.data.success) {
                                $scope.medicalHistory = hist.data.data;
                            }
                        });

                    // Start fetching clinical data
                    return $q.all([
                        CVRService.getPatientHistory($scope.filter.pinNumber),
                        OPDService.getPrescriptionsByPatient($scope.filter.pinNumber)
                    ]);
                } else {
                    throw new Error('Patient not found');
                }
            })
            .then(function(results) {
                // results[0] = CVRs
                // results[1] = Prescriptions
                
                var cvrRes = results[0];
                var prescRes = results[1];

                // Helper to extract list from common HMIS API response formats
                function extractData(res) {
                    if (!res || !res.data) return [];
                    var d = res.data.data || res.data.content || res.data;
                    return Array.isArray(d) ? d : (d ? [d] : []);
                }

                var visitsData = extractData(cvrRes);
                var prescriptionsData = extractData(prescRes);

                if (visitsData.length > 0) {
                    $scope.visits = visitsData;
                    
                    // Fetch details for each visit (Vitals & Consultations)
                    var detailPromises = [];
                    $scope.visits.forEach(function(visit) {
                        // Vitals
                        if (visit.cvrNumber) {
                            detailPromises.push(CVRService.getVitals(visit.cvrNumber).then(function(v) {
                                if (v.data && v.data.success) {
                                    visit.vitals = v.data.data;
                                    // Also collect in global vitals list for trend
                                    if (visit.vitals) {
                                        visit.vitals.visitDate = visit.visitDate || visit.appointmentDate;
                                        $scope.vitals.push(visit.vitals);
                                    }
                                }
                            }));
                        }

                        // Consultation Record (OPD Note)
                        if (visit.cvrNumber) {
                            detailPromises.push(OPDService.getConsultationByCvr(visit.cvrNumber).then(function(c) {
                                if (c.data && c.data.success) {
                                    visit.consultation = c.data.data;
                                }
                            }));
                        }
                    });
                    
                    return $q.all(detailPromises);
                }
                
                if (prescriptionsData.length > 0) {
                    $scope.prescriptions = prescriptionsData;
                }
            })
            .then(function() {
                // Post-processing: Map doctors names
                return DoctorService.getActiveDoctors();
            })
            .then(function(docRes) {
                var doctors = (docRes.data && docRes.data.data) ? docRes.data.data : [];
                
                $scope.visits.forEach(function(v) {
                    if (!v.doctorName && v.doctorId) {
                        var doc = doctors.find(function(d) { return d.doctorId === v.doctorId; });
                        if (doc) v.doctorName = doc.fullName || (doc.firstName + ' ' + doc.lastName);
                    }
                });
                
                $scope.loading = false;
                $scope.printDate = new Date().toLocaleString('en-IN');
            })
            .catch(function(err) {
                $scope.loading = false;
                $scope.errorMsg = 'Error loading patient file: ' + (err.message || 'Server error');
                console.error('[Case File]', err);
            });
    };

    $scope.printFile = function() {
        if (!$scope.patient) return;
        if ($rootScope.doPrint) {
            $rootScope.doPrint();
        } else {
            window.print();
        }
    };
    
    // Auto-load if PIN is in route (future enhancement)
}]);
