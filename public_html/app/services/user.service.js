/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/**
 * User Service - User Service (Port 8081)
 * User Management
 */

app.factory('UserService', ['$http', '$q', function($http, $q) {
    
    var service = {};
    var baseUrl = API_CONFIG.GATEWAY_URL;
    
    /**
     * Get All Users - GET /users
     */
    service.getAll = function() {
        return $http.get(baseUrl + API_CONFIG.ENDPOINTS.USER.GET_ALL);
    };
    
    /**
     * Get User by Username - GET /users/{username}
     */
    service.getByUsername = function(username) {
        var url = baseUrl + API_CONFIG.ENDPOINTS.USER.GET_BY_USERNAME.replace('{username}', username);
        return $http.get(url);
    };
    
    /**
     * Get Users by Role - GET /users/role/{role}
     */
    service.getByRole = function(role) {
        var url = baseUrl + API_CONFIG.ENDPOINTS.USER.GET_BY_ROLE.replace('{role}', role);
        return $http.get(url);
    };
    
    /**
     * Change Password - PUT /users/{username}/change-password
     * Request: { currentPassword, newPassword }
     */
    service.changePassword = function(username, passwordData) {
        var url = baseUrl + API_CONFIG.ENDPOINTS.USER.CHANGE_PASSWORD.replace('{username}', username);
        return $http.put(url, passwordData);
    };
    
        /**
         * Update User - PUT /users/{username}
         */
        service.update = function (username, userData) {
            var url = baseUrl + '/users/' + username;
            return $http.put(url, userData);
        };

        /**
         * Reset Password - PUT /users/{username}/reset-password
         */
        service.resetPassword = function (username, newPassword) {
            var url = baseUrl + '/users/' + username + '/reset-password';
            return $http.put(url, {newPassword: newPassword});
        };

        /**
         * Delete User - DELETE /users/{username}
         */
        service.delete = function (username) {
            var url = baseUrl + '/users/' + username;
            return $http.delete(url);
        };
    
    return service;
}]);