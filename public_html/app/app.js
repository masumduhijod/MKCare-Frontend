/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/**
 * Hospital Management System - Main AngularJS Module
 * All microservices integration
 */

/**
 * Hospital Management System - Main AngularJS Module
 * FIXED: Auto-login issue resolved
 */

var app = angular.module('hospitalApp', ['ngRoute']);

// Root Controller for Navigation & Auth State
app.controller('RootController', ['$scope', '$location', '$rootScope', 
    function($scope, $location, $rootScope) {
    
    // Initialize variables
    $scope.loading = false;
    $scope.isLoggedIn = false;
    $scope.currentUser = null;
    $scope.alert = {
        show: false,
        type: 'info',
        message: ''
    };

    /**
     * Check Authentication Status
     * FIXED: Only check token validity, don't auto-redirect
     */
    $scope.checkAuth = function() {
        var token = localStorage.getItem('authToken');
        var user = localStorage.getItem('currentUser');
        
        if (token && user) {
            try {
                var parsedUser = JSON.parse(user);
                
                // Check token expiry
                if (parsedUser.expiresAt) {
                    var expiryDate = new Date(parsedUser.expiresAt);
                    var now = new Date();
                    
                    if (now > expiryDate) {
                        // Token expired - clear and redirect
                        console.log('Token expired');
                        $scope.logout();
                        return false;
                    }
                }
                
                $scope.isLoggedIn = true;
                $scope.currentUser = parsedUser;
                $rootScope.isLoggedIn = true;
                $rootScope.currentUser = $scope.currentUser;
                return true;
            } catch (e) {
                console.error('Error parsing user data:', e);
                $scope.logout();
                return false;
            }
        } else {
            $scope.isLoggedIn = false;
            $scope.currentUser = null;
            $rootScope.isLoggedIn = false;
            $rootScope.currentUser = null;
            return false;
        }
    };

    // Check role
    $scope.hasRole = function(roles) {
        if (!$scope.currentUser) return false;
        return roles.indexOf($scope.currentUser.role) !== -1;
    };
    
    $rootScope.hasRole = $scope.hasRole;

    /**
     * Logout Function
     * FIXED: Proper cleanup and redirect to login
     */
    $scope.logout = function() {
        // Clear all auth data
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        
        // Clear scope
        $scope.isLoggedIn = false;
        $scope.currentUser = null;
        $rootScope.isLoggedIn = false;
        $rootScope.currentUser = null;
        
        // Redirect to login
        $location.path('/login');
        
        // Show message
        $rootScope.showAlert('info', 'You have been logged out successfully');
    };

    // Show alert
    $rootScope.showAlert = function(type, message) {
        $scope.alert = {
            show: true,
            type: type,
            message: message
        };
        
        // Auto hide after 5 seconds
        setTimeout(function() {
            $scope.$apply(function() {
                $scope.alert.show = false;
            });
        }, 5000);
    };

    // Show loading
    $rootScope.showLoading = function() {
        $scope.loading = true;
    };

    // Hide loading
    $rootScope.hideLoading = function() {
        $scope.loading = false;
    };

    // Initialize - Just check auth, don't redirect
    $scope.checkAuth();

    /**
     * Route Change Handler
     * FIXED: Proper authentication check on route change
     */
    $rootScope.$on('$routeChangeStart', function(event, next, current) {
        var isAuthenticated = $scope.checkAuth();
        
        // If route requires auth and user not authenticated
        if (next.requireAuth && !isAuthenticated) {
            event.preventDefault();
            $location.path('/login');
            $rootScope.showAlert('warning', 'Please login to continue');
        }
        
        // If trying to access login page while already logged in
        if (next.originalPath === '/login' && isAuthenticated) {
            // Allow access to login page - user might want to switch accounts
            // Don't redirect automatically
        }
    });
    
    /**
     * Route Change Success Handler
     */
    $rootScope.$on('$routeChangeSuccess', function(event, current, previous) {
        // Update auth state
        $scope.checkAuth();
    });
}]);

// Run block - Set up HTTP interceptor for auth token
app.run(['$rootScope', '$location', '$http', function($rootScope, $location, $http) {
    // Add auth token to all requests
    $http.defaults.headers.common['Content-Type'] = 'application/json';
    
    // Interceptor for auth token
    $rootScope.$on('$routeChangeStart', function() {
        var token = localStorage.getItem('authToken');
        if (token) {
            $http.defaults.headers.common['Authorization'] = 'Bearer ' + token;
        } else {
            delete $http.defaults.headers.common['Authorization'];
        }
    });
}]);