/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */



// ============ DOCTOR REGISTRATION CONTROLLER ============
app.controller('DoctorRegistrationController', ['$scope', '$rootScope', '$location', '$routeParams', 'DoctorService', 'AuthService',
    function($scope, $rootScope, $location, $routeParams, DoctorService, AuthService) {
    
    var currentUser = AuthService.getCurrentUser();
    $scope.isEditMode = false;
    $scope.doctorId = $routeParams.doctorId;
    
    $scope.doctor = {
        firstName: '',
        lastName: '',
        specialization: '',
        qualification: '',
        experienceYears: 0,
        department: '',
        contactNumber: '',
        email: '',
        licenseNumber: '',
        registrationNumber: '',
        consultationFee: 0,
        followUpFee: 0,
        availableForOPD: true,
        availableForEmergency: false,
        photoUrl: '',
        bio: '',
        languagesSpoken: '',
        roomNumber: '',
        followUpDaysLimit: 7, // Default 7 days
        createdBy: currentUser ? currentUser.username : ''
    };
    
    $scope.activeTab = 'personal'; // Default tab
    
    $scope.setTab = function(tabName) {
        $scope.activeTab = tabName;
    };
    
    $scope.loading = false;
    $scope.registeredDoctorId = null;
    
    $scope.registerDoctor = function() {
        if (!$scope.doctor.firstName || !$scope.doctor.lastName || !$scope.doctor.contactNumber ||
            !$scope.doctor.department || !$scope.doctor.specialization || !$scope.doctor.qualification ||
            $scope.doctor.experienceYears === undefined || $scope.doctor.experienceYears === null ||
            $scope.doctor.consultationFee === undefined || $scope.doctor.consultationFee === null ||
            $scope.doctor.followUpFee === undefined || $scope.doctor.followUpFee === null ||
            $scope.doctor.followUpDaysLimit === undefined || $scope.doctor.followUpDaysLimit === null) {
            
            $rootScope.showAlert('warning', 'Please fill all required fields (marked with *) across all tabs');
            return;
        }
        
        if (!$scope.isEditMode && (!$scope.doctor.username || !$scope.doctor.password)) {
            $rootScope.showAlert('warning', 'Please provide Username and Password for the new doctor');
            return;
        }
        
        if (!$scope.isEditMode && $scope.doctor.password !== $scope.doctor.confirmPassword) {
            $rootScope.showAlert('warning', 'Passwords do not match');
            return;
        }
        
        $scope.loading = true;
        
        if ($scope.isEditMode) {
            // Edit Mode: Only update Doctor profile
            var updateData = {
                firstName: $scope.doctor.firstName,
                lastName: $scope.doctor.lastName,
                specialization: $scope.doctor.specialization,
                qualification: $scope.doctor.qualification,
                experienceYears: $scope.doctor.experienceYears,
                department: $scope.doctor.department,
                contactNumber: $scope.doctor.contactNumber,
                email: $scope.doctor.email,
                licenseNumber: $scope.doctor.licenseNumber,
                registrationNumber: $scope.doctor.registrationNumber,
                consultationFee: $scope.doctor.consultationFee,
                followUpFee: $scope.doctor.followUpFee,
                followUpDaysLimit: $scope.doctor.followUpDaysLimit,
                availableForOPD: $scope.doctor.availableForOPD,
                availableForEmergency: $scope.doctor.availableForEmergency,
                photoUrl: $scope.doctor.photoUrl,
                bio: $scope.doctor.bio,
                languagesSpoken: $scope.doctor.languagesSpoken,
                roomNumber: $scope.doctor.roomNumber,
                createdBy: $scope.doctor.createdBy
            };
            DoctorService.update($scope.doctorId, updateData)
                .then(function(response) {
                    $scope.loading = false;
                    if (response.data.success) {
                        $rootScope.showAlert('success', 'Doctor updated successfully!');
                        $location.path('/doctor/list');
                    }
                })
                .catch(function(error) {
                    $scope.loading = false;
                    $rootScope.showAlert('danger', 'Update failed');
                });
        } else {
            // New Mode: 1. Register User -> 2. Register Doctor
            var userRegistrationData = {
                username: $scope.doctor.username,
                password: $scope.doctor.password,
                email: $scope.doctor.email || ($scope.doctor.username + '@hospital.com'),
                role: 'DOCTOR',
                firstName: $scope.doctor.firstName,
                lastName: $scope.doctor.lastName,
                contactNumber: $scope.doctor.contactNumber,
                createdBy: $scope.doctor.createdBy
            };
            
            AuthService.register(userRegistrationData)
                .then(function(userResponse) {
                    if (userResponse && userResponse.success) {
                        // User created successfully, now create Doctor profile
                        return DoctorService.register($scope.doctor);
                    } else {
                        // Throw to catch block
                        throw new Error(userResponse ? userResponse.message : 'Failed to create user account');
                    }
                })
                .then(function(docResponse) {
                    $scope.loading = false;
                    if (docResponse && docResponse.data && docResponse.data.success) {
                        $scope.registeredDoctorId = docResponse.data.data.doctorId;
                        $rootScope.showAlert('success', 'Doctor registered! ID: ' + $scope.registeredDoctorId);
                        $location.path('/doctor/schedule/' + $scope.registeredDoctorId);
                    } else if (docResponse) {
                        $rootScope.showAlert('danger', 'User created but doctor profile failed.');
                    }
                })
                .catch(function(error) {
                    $scope.loading = false;
                    var errorMsg = error.message || error;
                    if (error.data && error.data.message) {
                        errorMsg = error.data.message;
                    }
                    $rootScope.showAlert('danger', 'Registration failed: ' + errorMsg);
                });
        }
    };
    
    // Load doctor data if in edit mode
    if ($scope.doctorId) {
        $scope.isEditMode = true;
        $scope.loading = true;
        
        DoctorService.getById($scope.doctorId)
            .then(function(response) {
                $scope.loading = false;
                if (response.data.success) {
                    $scope.doctor = response.data.data;
                    console.log('✅ Doctor data loaded for edit');
                }
            })
            .catch(function(error) {
                $scope.loading = false;
                $rootScope.showAlert('danger', 'Failed to load doctor data');
            });
    }
    
    $scope.cancel = function() {
        $location.path($scope.isEditMode ? '/doctor/list' : '/dashboard');
    };
}]);
