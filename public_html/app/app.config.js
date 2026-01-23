/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


// ============ APP CONFIG ============
// File: app/app.config.js
app.config(['$httpProvider', function($httpProvider) {
    
    // Add Authorization Header Interceptor
    $httpProvider.interceptors.push(['$q', '$location', '$rootScope', function($q, $location, $rootScope) {
        return {
            'request': function(config) {
                // Add auth token to all requests
                var token = localStorage.getItem('authToken');
                if (token) {
                    config.headers = config.headers || {};
                    config.headers.Authorization = 'Bearer ' + token;
                }
                
                // Show loading
                if ($rootScope.showLoading) {
                    $rootScope.showLoading();
                }
                
                return config;
            },
            
            'response': function(response) {
                // Hide loading
                if ($rootScope.hideLoading) {
                    $rootScope.hideLoading();
                }
                
                return response;
            },
            
            'responseError': function(rejection) {
                // Hide loading
                if ($rootScope.hideLoading) {
                    $rootScope.hideLoading();
                }
                
                // Handle 401 Unauthorized
                if (rejection.status === 401) {
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('currentUser');
                    $location.path('/login');
                }
                
                // Handle 403 Forbidden
                if (rejection.status === 403) {
                    if ($rootScope.showAlert) {
                        $rootScope.showAlert('danger', 'Access Denied: You do not have permission to perform this action');
                    }
                }
                
                return $q.reject(rejection);
            }
        };
    }]);
}]);
