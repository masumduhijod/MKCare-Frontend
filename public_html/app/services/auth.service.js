/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Authentication Service - User Service (Port 8081)
 * Handles login, register, validation
 */

/**
 * Authentication Service - Multi-Tenant Support
 * Handles login, register, validation with tenant context
 */

app.factory('AuthService', ['$http', '$q', function($http, $q) {
    
    var service = {};
    var baseUrl = API_CONFIG.GATEWAY_URL;
    
    /**
     * Login - POST /api/auth/login
     * Request: { clinicId, username, password }
     * Response: { token, userId, username, email, role, fullName, expiresAt, 
     *             tenantId, clinicName, clinicLogo, clinicAddress, clinicPhone }
     */
    service.login = function(credentials) {
        var deferred = $q.defer();
        
        console.log('AuthService.login called with:', credentials);
        
        $http.post(baseUrl + API_CONFIG.ENDPOINTS.AUTH.LOGIN, credentials)
            .then(function(response) {
                console.log('Login response:', response.data);
                
                if (response.data.success) {
                    var data = response.data.data;
                    
                    // ⭐ Store token
                    localStorage.setItem('authToken', data.token);
                    
                    // ⭐ Store tenant ID (for X-Tenant-ID header)
                    localStorage.setItem('tenantId', data.tenantId);
                    
                    // ⭐ Store clinic info
                    localStorage.setItem('clinicName', data.clinicName);
                    localStorage.setItem('clinicLogo', data.clinicLogo);
                    localStorage.setItem('clinicAddress', data.clinicAddress);
                    localStorage.setItem('clinicPhone', data.clinicPhone);
                    
                    // ⭐ Store user info
                    localStorage.setItem('currentUser', JSON.stringify({
                        userId: data.userId,
                        username: data.username,
                        email: data.email,
                        role: data.role,
                        fullName: data.fullName,
                        expiresAt: data.expiresAt,
                        tenantId: data.tenantId,
                        clinicName: data.clinicName
                    }));
                    
                    console.log('✅ Login successful - Tenant:', data.tenantId, 'Clinic:', data.clinicName);
                    
                    deferred.resolve(response.data);
                } else {
                    deferred.reject(response.data.message);
                }
            })
            .catch(function(error) {
                console.error('Login error:', error);
                var errorMsg = error.data && error.data.message ? error.data.message : 'Login failed';
                deferred.reject(errorMsg);
            });
        
        return deferred.promise;
    };
    
    /**
     * Register - POST /api/auth/register
     */
    service.register = function(userData) {
        var deferred = $q.defer();
        
        $http.post(baseUrl + API_CONFIG.ENDPOINTS.AUTH.REGISTER, userData)
            .then(function(response) {
                if (response.data.success) {
                    deferred.resolve(response.data);
                } else {
                    deferred.reject(response.data.message);
                }
            })
            .catch(function(error) {
                deferred.reject(error.data ? error.data.message : 'Registration failed');
            });
        
        return deferred.promise;
    };
    
    /**
     * Validate Token
     */
    service.validateToken = function() {
        var deferred = $q.defer();
        
        var token = localStorage.getItem('authToken');
        if (!token) {
            deferred.reject('No token found');
            return deferred.promise;
        }
        
        $http.post(baseUrl + API_CONFIG.ENDPOINTS.AUTH.VALIDATE, {}, {
            headers: { 'Authorization': 'Bearer ' + token }
        })
            .then(function(response) {
                if (response.data.success && response.data.data) {
                    deferred.resolve(true);
                } else {
                    deferred.reject('Invalid token');
                }
            })
            .catch(function(error) {
                deferred.reject('Token validation failed');
            });
        
        return deferred.promise;
    };
    
    /**
     * Logout - Clear all storage
     */
    service.logout = function() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('tenantId');
        localStorage.removeItem('clinicName');
        localStorage.removeItem('clinicLogo');
        localStorage.removeItem('clinicAddress');
        localStorage.removeItem('clinicPhone');
    };
    
    /**
     * Get Current User
     */
    service.getCurrentUser = function() {
        var user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    };
    
    /**
     * Get Tenant ID
     */
    service.getTenantId = function() {
        return localStorage.getItem('tenantId');
    };
    
    /**
     * Get Clinic Info
     */
    service.getClinicInfo = function() {
        return {
            tenantId: localStorage.getItem('tenantId'),
            clinicName: localStorage.getItem('clinicName'),
            clinicLogo: localStorage.getItem('clinicLogo'),
            clinicAddress: localStorage.getItem('clinicAddress'),
            clinicPhone: localStorage.getItem('clinicPhone')
        };
    };
    
    /**
     * Check if user is authenticated
     */
    service.isAuthenticated = function() {
        return localStorage.getItem('authToken') !== null;
    };
    
    return service;
}]);