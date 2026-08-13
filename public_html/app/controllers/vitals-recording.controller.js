/**
 * ============================================
 * FIXED VITALS RECORDING CONTROLLER
 * ============================================
 * ✅ Better workflow after recording vitals
 * ✅ Options: Return to Queue OR Start Consultation
 */

app.controller('VitalsRecordingController', 
    ['$scope', '$rootScope', '$location', '$routeParams', 
     'CVRService', 'AuthService', 'AppointmentService', 'PatientService',
    function($scope, $rootScope, $location, $routeParams, CVRService, AuthService, AppointmentService, PatientService) {
    
    var currentUser = AuthService.getCurrentUser();
    var cvrNumber = $routeParams.cvrNumber;
    
    console.log('========== VITALS RECORDING ==========');
    console.log('CVR Number:', cvrNumber);
    $scope.isEditMode = false;
    // Initialize vitals object
    $scope.vitals = {
        cvrNumber: cvrNumber,
        temperatureF: '',
        bloodPressure: '',
        pulseRate: '',
        respiratoryRate: '',
        spo2Percentage: '',
        weightKg: '',
        heightCm: '',
        recordedBy: currentUser ? currentUser.username : ''
    };
    
    $scope.cvr = null;
    $scope.loading = false;
    $scope.bmi = null;
    $scope.bmiCategory = '';
    $scope.bmiClass = '';
    $scope.bpError = '';
    
    /**
     * ✅ LOAD CVR DETAILS
     */
    $scope.loadCVR = function() {
        if (!cvrNumber) {
            $rootScope.showAlert('danger', 'CVR Number is required');
            $location.path('/opd/queue');
            return;
        }
        
        $scope.loading = true;
        
        CVRService.getByCVRNumber(cvrNumber).then(
            function(response) {
                $scope.loading = false;
                
                if (response.data.success && response.data.data) {
                    $scope.cvr = response.data.data;
                    console.log('✅ CVR Loaded:', $scope.cvr);
                    
                    // Fetch patient name if missing or if it has the backend placeholder "Patient Name"
                    if ((!$scope.cvr.patientName || $scope.cvr.patientName === 'Patient Name' || $scope.cvr.patientName === 'Unknown') && $scope.cvr.pinNumber) {
                        PatientService.getByPin($scope.cvr.pinNumber).then(
                            function(pRes) {
                                if (pRes.data && pRes.data.success && pRes.data.data) {
                                    let pData = pRes.data.data;
                                    // Some APIs return array, others object
                                    let patient = Array.isArray(pData) ? pData[0] : pData;
                                    if (patient) {
                                        $scope.cvr.patientName = patient.fullName || (patient.firstName + ' ' + patient.lastName);
                                        $scope.$applyAsync();
                                    }
                                }
                            }
                        ).catch(function(err){
                            console.error('Error fetching patient details:', err);
                        });
                    }
                    
                    // Check if vitals already recorded
                    $scope.checkExistingVitals();
                } else {
                    $rootScope.showAlert('danger', 'CVR not found: ' + cvrNumber);
                    $location.path('/opd/queue');
                }
            },
            function(error) {
                $scope.loading = false;
                console.error('Error loading CVR:', error);
                
                var errorMsg = 'Failed to load CVR';
                if (error.status === 404) {
                    errorMsg = 'CVR not found. It may not have been created yet.';
                } else if (error.data && error.data.message) {
                    errorMsg = error.data.message;
                }
                
                $rootScope.showAlert('danger', errorMsg);
                $location.path('/opd/queue');
            }
        );
    };
    
    /**
     * ✅ CHECK IF VITALS ALREADY RECORDED
     */
//    $scope.checkExistingVitals = function() {
//        CVRService.getVitals(cvrNumber).then(
//            function(response) {
//                if (response.data.success && response.data.data && response.data.data.length > 0) {
//                    var existingVitals = response.data.data[0];
//                    
//                    var loadExisting = confirm(
//                        '⚠️ Vitals already recorded for this CVR!\n\n' +
//                        'Do you want to view/update existing vitals?\n\n' +
//                        'Click OK to load existing vitals\n' +
//                        'Click Cancel to enter new vitals'
//                    );
//                    
//                    if (loadExisting) {
//                        $scope.vitals = {
//                            cvrNumber: cvrNumber,
//                            temperatureF: existingVitals.temperatureF,
//                            bloodPressure: existingVitals.bloodPressure,
//                            pulseRate: existingVitals.pulseRate,
//                            respiratoryRate: existingVitals.respiratoryRate,
//                            spo2Percentage: existingVitals.spo2Percentage,
//                            weightKg: existingVitals.weightKg,
//                            heightCm: existingVitals.heightCm,
//                            recordedBy: currentUser ? currentUser.username : ''
//                        };
//                        
//                        $scope.calculateBMI();
//                    }
//                }
//            },
//            function(error) {
//                console.log('No existing vitals found - ready for new entry');
//            }
//        );
//    };
//    
// ✅ REPLACE checkExistingVitals - auto fills without confirm()
$scope.checkExistingVitals = function() {
    CVRService.getVitals(cvrNumber).then(
        function(response) {
            if (response.data.success && 
                response.data.data && 
                response.data.data.length > 0) {
                
                var existing = response.data.data[0];
                
                $scope.isEditMode = true;  // ← EXISTING vitals = edit mode
                
                $scope.vitals.temperatureF    = existing.temperatureF;
                $scope.vitals.bloodPressure   = existing.bloodPressure;
                $scope.vitals.pulseRate       = existing.pulseRate;
                $scope.vitals.respiratoryRate = existing.respiratoryRate;
                $scope.vitals.spo2Percentage  = existing.spo2Percentage;
                $scope.vitals.weightKg        = existing.weightKg;
                $scope.vitals.heightCm        = existing.heightCm;
                
                $scope.calculateBMI();
                $rootScope.showAlert('info', '📋 Existing vitals loaded. Update and save.');
            }
            // else isEditMode stays false = new entry
        },
        function(error) {
            console.log('No existing vitals - fresh entry');
        }
    );
};    /**
     * ✅ CALCULATE BMI
     */
    $scope.calculateBMI = function() {
        if ($scope.vitals.weightKg && $scope.vitals.heightCm) {
            var heightM = $scope.vitals.heightCm / 100;
            var bmi = $scope.vitals.weightKg / (heightM * heightM);
            $scope.bmi = bmi.toFixed(2);
            
            if (bmi < 18.5) {
                $scope.bmiCategory = 'Underweight';
                $scope.bmiClass = 'text-warning';
            } else if (bmi >= 18.5 && bmi < 25) {
                $scope.bmiCategory = 'Normal';
                $scope.bmiClass = 'text-success';
            } else if (bmi >= 25 && bmi < 30) {
                $scope.bmiCategory = 'Overweight';
                $scope.bmiClass = 'text-warning';
            } else {
                $scope.bmiCategory = 'Obese';
                $scope.bmiClass = 'text-danger';
            }
        } else {
            $scope.bmi = null;
            $scope.bmiCategory = '';
        }
    };
    
    /**
     * ✅ VALIDATE BLOOD PRESSURE FORMAT
     */
    $scope.validateBloodPressure = function() {
        if ($scope.vitals.bloodPressure) {
            var bpPattern = /^\d{2,3}\/\d{2,3}$/;
            if (!bpPattern.test($scope.vitals.bloodPressure)) {
                $scope.bpError = 'Format should be: 120/80';
            } else {
                var parts = $scope.vitals.bloodPressure.split('/');
                var systolic = parseInt(parts[0]);
                var diastolic = parseInt(parts[1]);
                
                if (systolic < 70 || systolic > 250) {
                    $scope.bpError = 'Systolic should be between 70-250';
                } else if (diastolic < 40 || diastolic > 150) {
                    $scope.bpError = 'Diastolic should be between 40-150';
                } else if (systolic <= diastolic) {
                    $scope.bpError = 'Systolic must be greater than Diastolic';
                } else {
                    $scope.bpError = '';
                }
            }
        }
    };
    
    /**
     * ✅ RECORD VITALS WITH IMPROVED WORKFLOW
     */
    $scope.recordVitals = function() {
        console.log('========== RECORDING VITALS ==========');
        
        $scope.validateBloodPressure(); // Ensure BP is validated even if blur didn't fire
        
        // Validation
        if (!$scope.vitals.temperatureF || $scope.vitals.temperatureF < 90 || $scope.vitals.temperatureF > 110) {
            $rootScope.showAlert('warning', 'Please enter valid temperature (90-110°F)');
            return;
        }
        
        if (!$scope.vitals.bloodPressure) {
            $rootScope.showAlert('warning', 'Please enter blood pressure');
            return;
        }
        
        if ($scope.bpError) {
            $rootScope.showAlert('warning', 'Please enter valid blood pressure format');
            return;
        }
        
        if (!$scope.vitals.pulseRate || $scope.vitals.pulseRate < 40 || $scope.vitals.pulseRate > 200) {
            $rootScope.showAlert('warning', 'Please enter valid pulse rate (40-200 bpm)');
            return;
        }
        
        if (!$scope.vitals.spo2Percentage || $scope.vitals.spo2Percentage < 50 || $scope.vitals.spo2Percentage > 100) {
            $rootScope.showAlert('warning', 'Please enter valid SpO2 (50-100%)');
            return;
        }
        
        $scope.loading = true;
        
        CVRService.recordVitals($scope.vitals).then(
            function(response) {
                $scope.loading = false;
                
                if (response.data.success) {
                    console.log('✅ Vitals recorded successfully');
                    
                    // ✅ SHOW SUCCESS AND REDIRECT (1-CLICK WORKFLOW)
                    $scope.showVitalsSuccessOptions();
                    
                } else {
                    $rootScope.showAlert('danger', 
                        response.data.message || 'Failed to record vitals');
                }
            },
            function(error) {
                $scope.loading = false;
                console.error('Error recording vitals:', error);
                
                var errorMsg = 'Error recording vitals';
                if (error.data && error.data.message) {
                    errorMsg = error.data.message;
                }
                
                $rootScope.showAlert('danger', errorMsg);
            }
        );
    };
    
    /**
     * ✅ NEW: SHOW VITALS SUCCESS AND REDIRECT (1-CLICK)
     */
    $scope.showVitalsSuccessOptions = function() {
        $rootScope.showAlert('success', '✅ Vitals saved successfully!');
        
        setTimeout(function() {
            if ($scope.isEditMode) {
                $location.path('/opd/list');
            } else {
                $location.path('/opd/queue');
            }
            $scope.$apply();
        }, 1000);
    };
    
    /**
     * ✅ NEW: START CONSULTATION FROM VITALS PAGE
     */
    $scope.startConsultationFromVitals = function() {
        if (!$scope.cvr || !$scope.cvr.appointmentId) {
            $rootScope.showAlert('danger', 'Appointment ID not found');
            $location.path('/opd/queue');
            return;
        }
        
        $scope.loading = true;
        
        AppointmentService.startConsultation($scope.cvr.appointmentId).then(
            function(response) {
                $scope.loading = false;
                
                if (response.data.success) {
                    console.log('✅ Starting consultation...');
                    
                    // Redirect to consultation room
                    $location.path('/consultation/room').search({
                        appointmentId: $scope.cvr.appointmentId,
                        pinNumber: $scope.cvr.pinNumber,
                        cvrNumber: cvrNumber
                    });
                } else {
                    $rootScope.showAlert('danger', 'Failed to start consultation');
                    $location.path('/opd/queue');
                }
            },
            function(error) {
                $scope.loading = false;
                console.error('Error starting consultation:', error);
                $rootScope.showAlert('danger', 'Failed to start consultation');
                $location.path('/opd/queue');
            }
        );
    };
    
    /**
     * ✅ CANCEL AND RETURN TO QUEUE
     */
   $scope.cancel = function() {
    if ($scope.isEditMode) {
        $location.path('/opd/list');   // ← came from OPD list
    } else {
        $location.path('/opd/queue'); // ← came from queue
    }
};
    
    // Initialize
    $scope.loadCVR();
}]);