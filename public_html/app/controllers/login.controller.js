/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/**
 * Login Controller
 * Handles user authentication
 */

app.controller('LoginController', ['$scope', '$location', '$rootScope', 'AuthService', 
    function($scope, $location, $rootScope, AuthService) {
    
    // Initialize
    $scope.credentials = {
        username: '',
        password: ''
    };
    
    $scope.loading = false;
    $scope.error = '';
    
    // Check if already logged in
    if (AuthService.isAuthenticated()) {
        $location.path('/dashboard');
    }
    
    /**
     * Login Function
     */
    $scope.login = function() {
        $scope.error = '';
        
        // Validation
        if (!$scope.credentials.username || !$scope.credentials.password) {
            $scope.error = 'Please enter username and password';
            return;
        }
        
        $scope.loading = true;
        
        AuthService.login($scope.credentials)
            .then(function(response) {
                $scope.loading = false;
                
                // Success - redirect to dashboard
                $scope.showAlert('success', 'Login successful! Welcome ' + response.data.fullName);
                $location.path('/dashboard');
            })
            .catch(function(error) {
                $scope.loading = false;
                $scope.error = error || 'Login failed. Please try again.';
            });
    };
    
    /**
     * Clear Error
     */
    $scope.clearError = function() {
        $scope.error = '';
    };
}]);

