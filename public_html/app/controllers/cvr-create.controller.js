/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * CVR Create Controller
 * Create Clinical Visit Record
 */

//app.controller('CVRCreateController', ['$scope', '$rootScope', '$location', '$routeParams', 
//    'CVRService', 'PatientService', 'DoctorService', 'AuthService',
//    function($scope, $rootScope, $location, $routeParams, CVRService, PatientService, DoctorService, AuthService) {
//    
//    var currentUser = AuthService.getCurrentUser();
//    
//    // Initialize CVR object
//    $scope.cvr = {
//        pinNumber: $routeParams.pinNumber || '',
//        visitType: 'OPD',
//        chiefComplaint: '',
//        symptoms: '',
//        department: '',
//        doctorId: '',
//        createdBy: currentUser ? currentUser.username : '',
//        visitDate: new Date().toISOString().split('T')[0],
//        visitTime: {
//            hour: new Date().getHours(),
//            minute: new Date().getMinutes(),
//            second: 0,
//            nano: 0
//        }
//    };
//    
//    $scope.patient = null;
//    $scope.doctors = [];
//    $scope.departments = [];
//    $scope.loading = false;
//    $scope.searchingPatient = false;
//    $scope.createdCVR = null;
//    
//    // Visit Type Options
//    $scope.visitTypeOptions = ['OPD', 'Emergency', 'Follow-up', 'Consultation'];
//    
//    /**
//     * Search Patient by PIN
//     */
//    $scope.searchPatient = function() {
//        if (!$scope.cvr.pinNumber) {
//            $rootScope.showAlert('warning', 'Please enter patient PIN number');
//            return;
//        }
//        
//        $scope.searchingPatient = true;
//        
//        PatientService.getByPin($scope.cvr.pinNumber)
//            .then(function(response) {
//                $scope.searchingPatient = false;
//                
//                if (response.data.success) {
//                    $scope.patient = response.data.data;
//                    $rootScope.showAlert('success', 'Patient found: ' + $scope.patient.fullName);
//                } else {
//                    $scope.patient = null;
//                    $rootScope.showAlert('warning', 'Patient not found');
//                }
//            })
//            .catch(function(error) {
//                $scope.searchingPatient = false;
//                $scope.patient = null;
//                $rootScope.showAlert('danger', 'Error finding patient');
//            });
//    };
//    
//    /**
//     * Load Departments
//     */
//    $scope.loadDepartments = function() {
//        DoctorService.getDepartments()
//            .then(function(response) {
//                if (response.data.success) {
//                    $scope.departments = response.data.data;
//                }
//            })
//            .catch(function(error) {
//                console.error('Error loading departments:', error);
//            });
//    };
//    
//    /**
//     * Load Doctors by Department
//     */
//    $scope.loadDoctorsByDepartment = function() {
//        if (!$scope.cvr.department) {
//            return;
//        }
//        
//        DoctorService.getAvailableByDepartment($scope.cvr.department)
//            .then(function(response) {
//                if (response.data.success) {
//                    $scope.doctors = response.data.data;
//                } else {
//                    $scope.doctors = [];
//                }
//            })
//            .catch(function(error) {
//                console.error('Error loading doctors:', error);
//                $scope.doctors = [];
//            });
//    };
//    
//    /**
//     * Create CVR
//     */
//    $scope.createCVR = function() {
//        // Validation
//        if (!$scope.patient) {
//            $rootScope.showAlert('danger', 'Please search and select a patient first');
//            return;
//        }
//        
//        if (!$scope.cvr.visitType) {
//            $rootScope.showAlert('danger', 'Please select visit type');
//            return;
//        }
//        
//        if (!$scope.cvr.chiefComplaint) {
//            $rootScope.showAlert('danger', 'Please enter chief complaint');
//            return;
//        }
//        
//        if (!$scope.cvr.department) {
//            $rootScope.showAlert('danger', 'Please select department');
//            return;
//        }
//        
//        $scope.loading = true;
//        
//        CVRService.create($scope.cvr)
//            .then(function(response) {
//                $scope.loading = false;
//                
//                if (response.data.success) {
//                    $scope.createdCVR = response.data.data;
//                    $rootScope.showAlert('success', 'CVR created successfully! CVR Number: ' + $scope.createdCVR.cvrNumber);
//                    
//                    // Ask if user wants to record vitals
//                    var recordVitals = confirm('CVR created successfully!\nCVR Number: ' + $scope.createdCVR.cvrNumber + 
//                                             '\n\nDo you want to record vitals now?');
//                    
//                    if (recordVitals) {
//                        $location.path('/cvr/vitals/' + $scope.createdCVR.cvrNumber);
//                    } else {
//                        $scope.resetForm();
//                    }
//                } else {
//                    $rootScope.showAlert('danger', response.data.message || 'Failed to create CVR');
//                }
//            })
//            .catch(function(error) {
//                $scope.loading = false;
//                var errorMsg = error.data && error.data.message ? error.data.message : 'Error creating CVR';
//                $rootScope.showAlert('danger', errorMsg);
//            });
//    };
//    
//    /**
//     * Reset Form
//     */
//    $scope.resetForm = function() {
//        $scope.cvr = {
//            pinNumber: '',
//            visitType: 'OPD',
//            chiefComplaint: '',
//            symptoms: '',
//            department: '',
//            doctorId: '',
//            createdBy: currentUser ? currentUser.username : '',
//            visitDate: new Date().toISOString().split('T')[0],
//            visitTime: {
//                hour: new Date().getHours(),
//                minute: new Date().getMinutes(),
//                second: 0,
//                nano: 0
//            }
//        };
//        $scope.patient = null;
//        $scope.createdCVR = null;
//    };
//    
//    /**
//     * Cancel
//     */
//    $scope.cancel = function() {
//        if (confirm('Are you sure you want to cancel?')) {
//            $location.path('/dashboard');
//        }
//    };
//    
//    // Initialize
//    $scope.loadDepartments();
//    
//    // If PIN is provided in URL, search automatically
//    if ($scope.cvr.pinNumber) {
//        $scope.searchPatient();
//    }
//}]);


/**
 * CVR Create Controller - FIXED
 * Key fix: visitTime format changed from object to string
 */

app.controller('CVRCreateController', ['$scope', '$rootScope', '$location', '$routeParams', 
    'CVRService', 'PatientService', 'DoctorService', 'AuthService',
    function($scope, $rootScope, $location, $routeParams, CVRService, PatientService, DoctorService, AuthService) {
    
    var currentUser = AuthService.getCurrentUser();
    
    // Helper function to get current time as string
    function getCurrentTimeString() {
        var now = new Date();
        return ('0' + now.getHours()).slice(-2) + ':' + 
               ('0' + now.getMinutes()).slice(-2) + ':' + 
               ('0' + now.getSeconds()).slice(-2);
    }
    
    // Initialize CVR object
    $scope.cvr = {
        pinNumber: $routeParams.pinNumber || '',
        visitType: 'OPD',
        chiefComplaint: '',
        symptoms: '',
        department: '',
        doctorId: '',
        createdBy: currentUser ? currentUser.username : '',
        visitDate: new Date().toISOString().split('T')[0],
        // FIX: Use string format instead of object
        visitTime: getCurrentTimeString()
    };
    
    $scope.patient = null;
    $scope.doctors = [];
    $scope.departments = [];
    $scope.loading = false;
    $scope.searchingPatient = false;
    $scope.createdCVR = null;
    
    // Visit Type Options
    $scope.visitTypeOptions = ['OPD', 'Emergency', 'Follow-up', 'Consultation'];
    
    /**
     * Search Patient by PIN
     */
    $scope.searchPatient = function() {
        if (!$scope.cvr.pinNumber) {
            $rootScope.showAlert('warning', 'Please enter patient PIN number');
            return;
        }
        
        $scope.searchingPatient = true;
        
        PatientService.getByPin($scope.cvr.pinNumber)
            .then(function(response) {
                $scope.searchingPatient = false;
                
                if (response.data.success) {
                    $scope.patient = response.data.data;
                    $rootScope.showAlert('success', 'Patient found: ' + $scope.patient.fullName);
                } else {
                    $scope.patient = null;
                    $rootScope.showAlert('warning', 'Patient not found');
                }
            })
            .catch(function(error) {
                $scope.searchingPatient = false;
                $scope.patient = null;
                $rootScope.showAlert('danger', 'Error finding patient');
            });
    };
    
    /**
     * Load Departments
     */
    $scope.loadDepartments = function() {
        DoctorService.getDepartments()
            .then(function(response) {
                if (response.data.success) {
                    $scope.departments = response.data.data;
                }
            })
            .catch(function(error) {
                console.error('Error loading departments:', error);
            });
    };
    
    /**
     * Load Doctors by Department
     */
    $scope.loadDoctorsByDepartment = function() {
        if (!$scope.cvr.department) {
            return;
        }
        
        DoctorService.getAvailableByDepartment($scope.cvr.department)
            .then(function(response) {
                if (response.data.success) {
                    $scope.doctors = response.data.data;
                } else {
                    $scope.doctors = [];
                }
            })
            .catch(function(error) {
                console.error('Error loading doctors:', error);
                $scope.doctors = [];
            });
    };
    
    /**
     * Create CVR
     */
    $scope.createCVR = function() {
        // Validation
        if (!$scope.patient) {
            $rootScope.showAlert('danger', 'Please search and select a patient first');
            return;
        }
        
        if (!$scope.cvr.visitType) {
            $rootScope.showAlert('danger', 'Please select visit type');
            return;
        }
        
        if (!$scope.cvr.chiefComplaint) {
            $rootScope.showAlert('danger', 'Please enter chief complaint');
            return;
        }
        
        if (!$scope.cvr.department) {
            $rootScope.showAlert('danger', 'Please select department');
            return;
        }
        
        $scope.loading = true;
        
        // Update visitTime to current time before sending
        $scope.cvr.visitTime = getCurrentTimeString();
        
        console.log('Creating CVR with data:', $scope.cvr);
        
        CVRService.create($scope.cvr)
            .then(function(response) {
                $scope.loading = false;
                
                console.log('CVR Response:', response.data);
                
                if (response.data.success) {
                    $scope.createdCVR = response.data.data;
                    $rootScope.showAlert('success', 'CVR created successfully! CVR Number: ' + $scope.createdCVR.cvrNumber);
                    
                    // Ask if user wants to record vitals
                    var recordVitals = confirm('CVR created successfully!\nCVR Number: ' + $scope.createdCVR.cvrNumber + 
                                             '\n\nDo you want to record vitals now?');
                    
                    if (recordVitals) {
                        $location.path('/cvr/vitals/' + $scope.createdCVR.cvrNumber);
                    } else {
                        $scope.resetForm();
                    }
                } else {
                    var errorMsg = response.data.message || 'Failed to create CVR';
                    console.error('CVR creation failed:', errorMsg);
                    $rootScope.showAlert('danger', errorMsg);
                }
            })
            .catch(function(error) {
                $scope.loading = false;
                
                console.error('Error creating CVR:', error);
                
                var errorMsg = 'Error creating CVR';
                if (error.data && error.data.message) {
                    errorMsg = error.data.message;
                } else if (error.status) {
                    errorMsg += ' (HTTP ' + error.status + ')';
                }
                
                $rootScope.showAlert('danger', errorMsg);
            });
    };
    
    /**
     * Reset Form
     */
    $scope.resetForm = function() {
        $scope.cvr = {
            pinNumber: '',
            visitType: 'OPD',
            chiefComplaint: '',
            symptoms: '',
            department: '',
            doctorId: '',
            createdBy: currentUser ? currentUser.username : '',
            visitDate: new Date().toISOString().split('T')[0],
            visitTime: getCurrentTimeString()
        };
        $scope.patient = null;
        $scope.createdCVR = null;
    };
    
    /**
     * Cancel
     */
    $scope.cancel = function() {
        if (confirm('Are you sure you want to cancel?')) {
            $location.path('/dashboard');
        }
    };
    
    // Initialize
    $scope.loadDepartments();
    
    // If PIN is provided in URL, search automatically
    if ($scope.cvr.pinNumber) {
        $scope.searchPatient();
    }
}]);
