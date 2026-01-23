/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */



//// ============ PATIENT DETAILS CONTROLLER ============
//app.controller('PatientDetailsController', ['$scope', '$rootScope', '$routeParams', '$location',
//    'PatientService', 'CVRService', 'AppointmentService',
//    function($scope, $rootScope, $routeParams, $location, PatientService, CVRService, AppointmentService) {
//    
//    var pinNumber = $routeParams.pinNumber;
//    
//    $scope.patient = null;
//    $scope.medicalHistory = null;
//    $scope.visitHistory = [];
//    $scope.appointments = [];
//    $scope.loading = false;
//    
//    $scope.loadPatient = function() {
//        $scope.loading = true;
//        PatientService.getByPin(pinNumber)
//            .then(function(response) {
//                $scope.loading = false;
//                if (response.data.success) {
//                    $scope.patient = response.data.data;
//                    $scope.loadMedicalHistory();
//                    $scope.loadVisitHistory();
//                    $scope.loadAppointments();
//                }
//            });
//    };
//    
//    $scope.loadMedicalHistory = function() {
//        PatientService.getMedicalHistory(pinNumber)
//            .then(function(response) {
//                if (response.data.success) {
//                    $scope.medicalHistory = response.data.data;
//                }
//            });
//    };
//    
//    $scope.loadVisitHistory = function() {
//        CVRService.getPatientHistory(pinNumber)
//            .then(function(response) {
//                if (response.data.success) {
//                    $scope.visitHistory = response.data.data.recentVisits || [];
//                }
//            });
//    };
//    
//    $scope.loadAppointments = function() {
//        AppointmentService.getByPatient(pinNumber)
//            .then(function(response) {
//                if (response.data.success) {
//                    $scope.appointments = response.data.data;
//                }
//            });
//    };
//    
//    $scope.createCVR = function() {
//        $location.path('/cvr/create').search({pinNumber: pinNumber});
//    };
//    
//    $scope.bookAppointment = function() {
//        $location.path('/appointment/book').search({pinNumber: pinNumber});
//    };
//    
//    $scope.loadPatient();
//}]);


/**
 * Patient Details Controller
 * Display complete patient information
 */

app.controller('PatientDetailsController', ['$scope', '$rootScope', '$location', '$routeParams', 'PatientService',
    function($scope, $rootScope, $location, $routeParams, PatientService) {
    
    // Initialize variables
    $scope.patient = null;
    $scope.medicalHistory = null;
    $scope.loading = false;
    $scope.loadingHistory = false;
    $scope.error = null;
    $scope.pinNumber = $routeParams.pinNumber;
    
    console.log('PatientDetailsController initialized with PIN:', $scope.pinNumber);
    
    /**
     * Load Patient Details
     */
    $scope.loadPatient = function() {
        if (!$scope.pinNumber) {
            $scope.error = 'Patient PIN number is required';
            return;
        }
        
        $scope.loading = true;
        $scope.error = null;
        
        console.log('Loading patient details for PIN:', $scope.pinNumber);
        
        PatientService.getByPin($scope.pinNumber)
            .then(function(response) {
                $scope.loading = false;
                
                console.log('Patient details response:', response.data);
                
                if (response.data && response.data.success) {
                    $scope.patient = response.data.data;
                    
                    // Show success message
                    if ($rootScope.showAlert) {
                        $rootScope.showAlert('success', 'Patient details loaded successfully');
                    }
                } else {
                    $scope.error = response.data.message || 'Patient not found';
                }
            })
            .catch(function(error) {
                $scope.loading = false;
                
                console.error('Error loading patient details:', error);
                
                if (error.status === 404) {
                    $scope.error = 'Patient not found with PIN: ' + $scope.pinNumber;
                } else if (error.status === 401) {
                    $scope.error = 'Unauthorized. Please login again';
                    setTimeout(function() {
                        $location.path('/login');
                        $scope.$apply();
                    }, 2000);
                } else if (error.status === 0) {
                    $scope.error = 'Cannot connect to server. Please check your connection';
                } else {
                    $scope.error = error.data?.message || 'Error loading patient details';
                }
            });
    };
    
    /**
     * Load Medical History
     */
    $scope.loadMedicalHistory = function() {
        if (!$scope.pinNumber) {
            return;
        }
        
        $scope.loadingHistory = true;
        
        console.log('Loading medical history for PIN:', $scope.pinNumber);
        
        PatientService.getMedicalHistory($scope.pinNumber)
            .then(function(response) {
                $scope.loadingHistory = false;
                
                console.log('Medical history response:', response.data);
                
                if (response.data && response.data.success) {
                    $scope.medicalHistory = response.data.data;
                } else {
                    console.log('No medical history found');
                    $scope.medicalHistory = null;
                }
            })
            .catch(function(error) {
                $scope.loadingHistory = false;
                
                console.error('Error loading medical history:', error);
                
                // Don't show error for medical history - it's optional
                if (error.status !== 404) {
                    console.log('Medical history error:', error.data?.message);
                }
            });
    };
    
    /**
     * Go Back to Patient List
     */
    $scope.goBack = function() {
        $location.path('/patient/list');
    };
    
    /**
     * Create CVR
     */
    $scope.createCVR = function() {
        if (!$scope.pinNumber) {
            if ($rootScope.showAlert) {
                $rootScope.showAlert('warning', 'Invalid patient PIN');
            }
            return;
        }
        
        console.log('Creating CVR for patient:', $scope.pinNumber);
        $location.path('/cvr/create').search({pinNumber: $scope.pinNumber});
    };
    
    /**
     * Book Appointment
     */
    $scope.bookAppointment = function() {
        if (!$scope.pinNumber) {
            if ($rootScope.showAlert) {
                $rootScope.showAlert('warning', 'Invalid patient PIN');
            }
            return;
        }
        
        console.log('Booking appointment for patient:', $scope.pinNumber);
        $location.path('/appointment/book').search({pinNumber: $scope.pinNumber});
    };
    
    /**
     * Edit Patient
     */
    $scope.editPatient = function() {
        if (!$scope.pinNumber) {
            if ($rootScope.showAlert) {
                $rootScope.showAlert('warning', 'Invalid patient PIN');
            }
            return;
        }
        
        console.log('Editing patient:', $scope.pinNumber);
        
        // Store patient data in localStorage for edit form
        if ($scope.patient) {
            localStorage.setItem('editPatient', JSON.stringify($scope.patient));
        }
        
        $location.path('/patient/edit/' + $scope.pinNumber);
    };
    
    /**
     * Initialize
     */
    $scope.init = function() {
        // Load patient details
        $scope.loadPatient();
        
        // Load medical history (optional)
        setTimeout(function() {
            $scope.loadMedicalHistory();
        }, 500);
    };
    
    // Start initialization
    $scope.init();
}]);