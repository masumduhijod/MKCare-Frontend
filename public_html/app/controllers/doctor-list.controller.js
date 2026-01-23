/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


// ============ DOCTOR LIST CONTROLLER ============
app.controller('DoctorListController', ['$scope', '$rootScope', '$location', 'DoctorService',
    function($scope, $rootScope, $location, DoctorService) {
    
    $scope.doctors = [];
    $scope.loading = false;
    
    $scope.loadDoctors = function() {
        $scope.loading = true;
        DoctorService.getActive()
            .then(function(response) {
                $scope.loading = false;
                if (response.data.success) {
                    $scope.doctors = response.data.data;
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
    
    $scope.loadDoctors();
}]);
