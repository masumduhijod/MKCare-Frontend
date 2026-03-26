/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/**
 * Patient Registration Controller
 * Complete patient registration with all fields
 */

app.controller('PatientRegistrationController', ['$scope', '$rootScope', '$location', '$routeParams', 'PatientService', 'AuthService',
    function($scope, $rootScope, $location, $routeParams, PatientService, AuthService) {
    
    // Get current user
    var currentUser = AuthService.getCurrentUser();
    
    // Initialize patient object with all fields from Patient Service
    $scope.patient = {
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: '',
        bloodGroup: '',
        contactNumber: '',
        alternateContact: '',
        email: '',
        aadharNumber: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        emergencyContactName: '',
        emergencyContactNumber: '',
        emergencyContactRelation: '',
        insuranceProvider: '',
        insuranceId: '',
        insuranceExpiryDate: '',
        photoUrl: '',
        remarks: '',
        registeredBy: currentUser ? currentUser.username : ''
    };
    
    $scope.loading = false;
    $scope.errors = {};
    $scope.registeredPIN = null;
    
    // Dropdown options
    $scope.genderOptions = ['MALE', 'FEMALE', 'OTHER'];
    $scope.bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    $scope.stateOptions = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Rajasthan', 
                           'Uttar Pradesh', 'West Bengal', 'Madhya Pradesh', 'Other'];

    $scope.isEditMode = false;

    // Initialization check for Edit Mode
    $scope.init = function() {
        if ($routeParams.pinNumber) {
            $scope.isEditMode = true;
            var editPin = $routeParams.pinNumber;
            
            // Check localStorage first
            var storedData = localStorage.getItem('editPatient');
            if (storedData) {
                var parsedData = JSON.parse(storedData);
                if (parsedData.pinNumber === editPin) {
                    $scope.patient = parsedData;
                    if ($scope.patient.dateOfBirth) {
                         $scope.patient.dateOfBirth = new Date($scope.patient.dateOfBirth);
                    }
                    localStorage.removeItem('editPatient');
                } else {
                    $scope.loadPatientData(editPin);
                }
            } else {
                $scope.loadPatientData(editPin);
            }
        }
    };

    $scope.loadPatientData = function(pin) {
        $scope.loading = true;
        PatientService.getByPin(pin).then(function(res) {
            $scope.loading = false;
            if (res.data && res.data.success) {
                $scope.patient = res.data.data;
                // Bind to date element
                if ($scope.patient.dateOfBirth) {
                     $scope.patient.dateOfBirth = new Date($scope.patient.dateOfBirth);
                }
            } else {
                if ($rootScope.showAlert) {
                    $rootScope.showAlert('danger', 'Failed to load patient: ' + res.data.message);
                }
            }
        }).catch(function(error) {
            $scope.loading = false;
            if ($rootScope.showAlert) {
                $rootScope.showAlert('danger', 'Error loading patient details for edit.');
            }
        });
    };
    
    /**
     * Validate Form
     */
    $scope.validateForm = function() {
        $scope.errors = {};
        var isValid = true;
        
        // Required fields
        if (!$scope.patient.firstName) {
            $scope.errors.firstName = 'First name is required';
            isValid = false;
        }
        
        if (!$scope.patient.lastName) {
            $scope.errors.lastName = 'Last name is required';
            isValid = false;
        }
        
        if (!$scope.patient.dateOfBirth) {
            $scope.errors.dateOfBirth = 'Date of birth is required';
            isValid = false;
        }
        
        if (!$scope.patient.gender) {
            $scope.errors.gender = 'Gender is required';
            isValid = false;
        }
        
        if (!$scope.patient.contactNumber) {
            $scope.errors.contactNumber = 'Contact number is required';
            isValid = false;
        } else if (!/^[0-9]{10}$/.test($scope.patient.contactNumber)) {
            $scope.errors.contactNumber = 'Contact number must be 10 digits';
            isValid = false;
        }
        
        // Aadhar validation (12 digits)
        if ($scope.patient.aadharNumber && !/^[0-9]{12}$/.test($scope.patient.aadharNumber)) {
            $scope.errors.aadharNumber = 'Aadhar number must be 12 digits';
            isValid = false;
        }
        
        // Email validation
        if ($scope.patient.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($scope.patient.email)) {
            $scope.errors.email = 'Invalid email format';
            isValid = false;
        }
        
        return isValid;
    };
    
    /**
     * Check if contact already exists
     */
    $scope.checkContactExists = function() {
        if ($scope.patient.contactNumber && $scope.patient.contactNumber.length === 10) {
            PatientService.existsByContact($scope.patient.contactNumber)
                .then(function(response) {
                    if (response.data.success && response.data.data === true) {
                        $scope.errors.contactNumber = 'Contact number already registered';
                    }
                })
                .catch(function(error) {
                    console.error('Error checking contact:', error);
                });
        }
    };
    
    /**
     * Register Patient
     */
    $scope.registerPatient = function() {
        // Validate
        if (!$scope.validateForm()) {
            $rootScope.showAlert('danger', 'Please correct the errors in the form');
            return;
        }
            // ✅ FIX: Convert DOB to LocalDate format
            if ($scope.patient.dateOfBirth) {
                var dob = new Date($scope.patient.dateOfBirth);
                $scope.patient.dateOfBirth = dob.toISOString().split('T')[0];
            }
        
        $scope.loading = true;
        
        if ($scope.isEditMode) {
            PatientService.update($scope.patient.pinNumber, $scope.patient)
                .then(function(response) {
                    $scope.loading = false;
                    if (response.data.success) {
                        $rootScope.showAlert('success', 'Patient updated successfully!');
                        $location.path('/patient/details/' + $scope.patient.pinNumber);
                    } else {
                        $rootScope.showAlert('danger', response.data.message || 'Update failed');
                    }
                })
                .catch(function(error) {
                    $scope.loading = false;
                    var errorMsg = error.data && error.data.message ? error.data.message : 'Update failed. Please try again.';
                    $rootScope.showAlert('danger', errorMsg);
                });
        } else {
            PatientService.register($scope.patient)
                .then(function(response) {
                    $scope.loading = false;
                    
                    if (response.data.success) {
                        $scope.registeredPIN = response.data.data.pinNumber;
                        $rootScope.showAlert('success', 'Patient registered successfully! PIN: ' + $scope.registeredPIN);
                        
                        // Ask if user wants to create appointment or view profile
                        var viewProfile = confirm('Patient registered successfully!\nPIN: ' + $scope.registeredPIN + 
                                            '\n\nDo you want to book an appointment for this patient?');
                        
                        if (viewProfile) {
                            $location.path('/appointment/book').search({pinNumber: $scope.registeredPIN});
                        } else {
                            // Reset form
                            $scope.resetForm();
                        }
                    } else {
                        $rootScope.showAlert('danger', response.data.message || 'Registration failed');
                    }
                })
                .catch(function(error) {
                    $scope.loading = false;
                    var errorMsg = error.data && error.data.message ? error.data.message : 'Registration failed. Please try again.';
                    $rootScope.showAlert('danger', errorMsg);
                });
        }
    };
    
    /**
     * Reset Form
     */
    $scope.resetForm = function() {
        $scope.patient = {
            firstName: '',
            lastName: '',
            dateOfBirth: '',
            gender: '',
            bloodGroup: '',
            contactNumber: '',
            alternateContact: '',
            email: '',
            aadharNumber: '',
            addressLine1: '',
            addressLine2: '',
            city: '',
            state: '',
            pincode: '',
            emergencyContactName: '',
            emergencyContactNumber: '',
            emergencyContactRelation: '',
            insuranceProvider: '',
            insuranceId: '',
            insuranceExpiryDate: '',
            photoUrl: '',
            remarks: '',
            registeredBy: currentUser ? currentUser.username : ''
        };
        $scope.errors = {};
        $scope.registeredPIN = null;
    };
    
    /**
     * Cancel Registration/Edit
     */
    $scope.cancel = function() {
        if (confirm('Are you sure you want to cancel? Unsaved changes will be lost.')) {
            if ($scope.isEditMode) {
                $location.path('/patient/details/' + $scope.patient.pinNumber);
            } else {
                $location.path('/dashboard');
            }
        }
    };

    // Run Init
    $scope.init();
}]);