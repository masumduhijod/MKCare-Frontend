/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


// ============ APP CONFIG - Multi-Tenant Support ============
app.config(['$httpProvider', function($httpProvider) {
    
    // Add Authorization Header + X-Tenant-ID Interceptor
    $httpProvider.interceptors.push(['$q', '$location', '$rootScope', function($q, $location, $rootScope) {
        return {
            'request': function(config) {
                // ⭐ Add auth token to all requests
                var token = localStorage.getItem('authToken');
                if (token) {
                    config.headers = config.headers || {};
                    config.headers.Authorization = 'Bearer ' + token;
                }
                
                // ⭐⭐⭐ Add X-Tenant-ID header to all requests (except login)
                var tenantId = localStorage.getItem('tenantId');
                if (tenantId && !config.url.includes('/auth/login')) {
                    config.headers = config.headers || {};
                    config.headers['X-Tenant-ID'] = tenantId;
                    console.log('🏥 Request to:', config.url, '| Tenant:', tenantId);
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
                    localStorage.clear();
                    $location.path('/login');
                }
                
                // Handle 403 Forbidden
                if (rejection.status === 403) {
                    if ($rootScope.showAlert) {
                        $rootScope.showAlert('danger', 'Access Denied: You do not have permission to perform this action');
                    }
                }
                
                // Handle 400 Bad Request (for debugging)
                if (rejection.status === 400) {
                    console.error('❌ Bad Request:', rejection.data);
                }
                
                return $q.reject(rejection);
            }
        };
    }]);
}]);