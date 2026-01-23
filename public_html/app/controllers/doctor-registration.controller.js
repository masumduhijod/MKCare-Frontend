/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */



// ============ DOCTOR REGISTRATION CONTROLLER ============
app.controller('DoctorRegistrationController', ['$scope', '$rootScope', '$location', 'DoctorService', 'AuthService',
    function($scope, $rootScope, $location, DoctorService, AuthService) {
    
    var currentUser = AuthService.getCurrentUser();
    
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
        createdBy: currentUser ? currentUser.username : ''
    };
    
    $scope.loading = false;
    $scope.registeredDoctorId = null;
    
    $scope.registerDoctor = function() {
        if (!$scope.doctor.firstName || !$scope.doctor.contactNumber) {
            $rootScope.showAlert('warning', 'Please fill required fields');
            return;
        }
        
        $scope.loading = true;
        
        DoctorService.register($scope.doctor)
            .then(function(response) {
                $scope.loading = false;
                if (response.data.success) {
                    $scope.registeredDoctorId = response.data.data.doctorId;
                    $rootScope.showAlert('success', 'Doctor registered! ID: ' + $scope.registeredDoctorId);
                    $location.path('/doctor/schedule/' + $scope.registeredDoctorId);
                }
            })
            .catch(function(error) {
                $scope.loading = false;
                $rootScope.showAlert('danger', 'Registration failed');
            });
    };
    
    $scope.cancel = function() {
        $location.path('/dashboard');
    };
}]);
