/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Authentication Service - User Service (Port 8081)
 * Handles login, register, validation
 */

app.factory('AuthService', ['$http', '$q', function($http, $q) {
    
    var service = {};
    var baseUrl = API_CONFIG.GATEWAY_URL;
    
    /**
     * Login - POST /api/auth/login
     * Request: { username, password }
     * Response: { token, tokenType, userId, username, email, role, fullName, expiresAt }
     */
    service.login = function(credentials) {
        var deferred = $q.defer();
        
        $http.post(baseUrl + API_CONFIG.ENDPOINTS.AUTH.LOGIN, credentials)
            .then(function(response) {
                if (response.data.success) {
                    // Store token and user info
                    var data = response.data.data;
                    localStorage.setItem('authToken', data.token);
                    localStorage.setItem('currentUser', JSON.stringify({
                        userId: data.userId,
                        username: data.username,
                        email: data.email,
                        role: data.role,
                        fullName: data.fullName,
                        expiresAt: data.expiresAt
                    }));
                    deferred.resolve(response.data);
                } else {
                    deferred.reject(response.data.message);
                }
            })
            .catch(function(error) {
                deferred.reject(error.data ? error.data.message : 'Login failed');
            });
        
        return deferred.promise;
    };
    
    /**
     * Register - POST /api/auth/register
     * Request: { username, password, email, role, firstName, lastName, contactNumber, createdBy }
     * Response: { userId, username, email, role, status, firstName, lastName, fullName, contactNumber, lastLogin, createdAt }
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
     * Validate Token - POST /api/auth/validate
     * Headers: Authorization: Bearer <token>
     * Response: { success, message, data: true/false }
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
     * Logout - Clear local storage
     */
    service.logout = function() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
    };
    
    /**
     * Get Current User
     */
    service.getCurrentUser = function() {
        var user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    };
    
    /**
     * Check if user is authenticated
     */
    service.isAuthenticated = function() {
        return localStorage.getItem('authToken') !== null;
    };
    
    return service;
}]);
