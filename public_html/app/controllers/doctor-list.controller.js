/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


// ============ DOCTOR LIST CONTROLLER ============
app.controller('DoctorListController', ['$scope', '$rootScope', '$location', 'DoctorService', 'AuthService',
    function($scope, $rootScope, $location, DoctorService, AuthService) {
    
    $scope.doctors = [];
    $scope.loading = false;
    $scope.currentUser = AuthService.getCurrentUser();
    
    $scope.loadDoctors = function() {
        $scope.loading = true;
        DoctorService.getActive()
            .then(function(response) {
                $scope.loading = false;
                if (response.data.success) {
                    var allDoctors = response.data.data;
                    if ($scope.currentUser && $scope.currentUser.role === 'DOCTOR') {
                        $scope.doctors = allDoctors.filter(function(doc) {
                            return (doc.doctorId && doc.doctorId === $scope.currentUser.username) || 
                                   (doc.userId && doc.userId === $scope.currentUser.userId) ||
                                   (doc.email && doc.email === $scope.currentUser.email);
                        });
                    } else {
                        $scope.doctors = allDoctors;
                    }
                }
            })
            .catch(function(error) {
                $scope.loading = false;
                $rootScope.showAlert('danger', 'Error loading doctors');
            });
    };
    
    $scope.viewSchedule = function(doctorId) {
        $location.path('/doctor/schedule/' + doctorId);
    };

    $scope.editDoctor = function(doctorId) {
        $location.path('/doctor/edit/' + doctorId);
    };

    $scope.canEditDoctor = function(doctor) {
        if (!$scope.currentUser) return false;
        
        // ADMIN and SUPER_ADMIN can edit any doctor
        if ($scope.currentUser.role === 'ADMIN' || $scope.currentUser.role === 'SUPER_ADMIN') {
            return true;
        }
        
        // DOCTOR can edit their own profile
        if ($scope.currentUser.role === 'DOCTOR' && $scope.currentUser.username === doctor.doctorId) {
            return true;
        }
        
        return false;
    };
    
    $scope.loadDoctors();
}]);
