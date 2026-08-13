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
    function ($scope, $location, $rootScope) {

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
        $scope.checkAuth = function () {
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
                    // Refresh clinic info on every auth check
                    $scope.clinicName = localStorage.getItem('clinicName') || '';
                    $scope.clinicLogo = localStorage.getItem('clinicLogo') || '';
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

        $scope.clinicName = localStorage.getItem('clinicName') || '';
        $scope.clinicLogo = localStorage.getItem('clinicLogo') || '';

        // Check role
        $scope.hasRole = function (roles) {
            if (!$scope.currentUser) return false;
            return roles.indexOf($scope.currentUser.role) !== -1;
        };

        // ⭐ RBAC: Check if user has access to a specific module
        $scope.hasModule = function(moduleCode) {
            if (!$scope.currentUser) return false;
            
            // 1. Admin and Super Admin always have all access
            if ($scope.currentUser.role === 'ADMIN' || $scope.currentUser.role === 'SUPER_ADMIN') {
                return true;
            }

            // 2. Check permissions list
            var perms = $scope.currentUser.permissions || [];

            // 3. Fallback permissions if backend returns empty
            if (perms.length === 0) {
                if ($scope.currentUser.role === 'DOCTOR') {
                    perms = ['DASHBOARD', 'PATIENT_LIST', 'OPD_CONSULT', 'APP_LIST', 'REPORTS'];
                } else if ($scope.currentUser.role === 'RECEPTIONIST') {
                    perms = ['DASHBOARD', 'PATIENT_REG', 'PATIENT_LIST', 'APP_BOOKING', 'APP_LIST', 'OPD_QUEUE', 'BILLING', 'PAYMENTS', 'REPORTS'];
                }
            }

            return perms.indexOf(moduleCode) !== -1;
        };

        $rootScope.hasRole = $scope.hasRole;
        $rootScope.hasModule = $scope.hasModule;

        /**
         * Logout Function
         * FIXED: Proper cleanup and redirect to login
         */
        $scope.logout = function () {
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
        $rootScope.showAlert = function (type, message) {
            $scope.alert = {
                show: true,
                type: type,
                message: message
            };

            // Auto hide after 5 seconds
            setTimeout(function () {
                $scope.$apply(function () {
                    $scope.alert.show = false;
                });
            }, 5000);
        };

        // Show loading
        $rootScope.showLoading = function () {
            $scope.loading = true;
        };

        // Hide loading
        $rootScope.hideLoading = function () {
            $scope.loading = false;
        };

        // ✅ GLOBAL CONFIRM MODAL LOGIC
        $rootScope.confirmDialog = { show: false };
        
        $rootScope.showGlobalConfirm = function(options) {
            $rootScope.confirmDialog.title = options.title || 'Confirm Action';
            $rootScope.confirmDialog.message = options.message || 'Are you sure?';
            $rootScope.confirmDialog.subMessage = options.subMessage || '';
            $rootScope.confirmDialog.type = options.type || 'info';
            $rootScope.confirmDialog.icon = options.icon || (options.type === 'success' ? 'fas fa-check-circle' : (options.type === 'danger' ? 'fas fa-exclamation-triangle' : 'fas fa-question-circle'));
            $rootScope.confirmDialog.okText = options.okText || 'OK';
            $rootScope.confirmDialog.cancelText = typeof options.cancelText !== 'undefined' ? options.cancelText : 'Cancel';
            
            $rootScope.confirmDialog.confirm = function() {
                $rootScope.confirmDialog.show = false;
                if (typeof options.onConfirm === 'function') {
                    options.onConfirm();
                }
            };
            
            $rootScope.confirmDialog.cancel = function() {
                $rootScope.confirmDialog.show = false;
                if (typeof options.onCancel === 'function') {
                    options.onCancel();
                }
            };
            
            $rootScope.confirmDialog.show = true;
        };

        // ✅ GLOBAL PREMIUM ALERT (Super Admin Style)
        $rootScope.premiumAlert = { show: false };
        $rootScope.showPremiumAlert = function(options) {
            $rootScope.premiumAlert = {
                show: true,
                title: options.title || 'Notification',
                message: options.message || '',
                type: options.type || 'success', // success, warning, error
                icon: options.icon || (options.type === 'error' ? 'fa-times-circle' : 'fa-check-circle')
            };
        };

        // Initialize - Just check auth, don't redirect
        $scope.checkAuth();

        /**
         * Route Change Handler
         * FIXED: Proper authentication check on route change
         */
        $rootScope.$on('$routeChangeStart', function (event, next, current) {
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
        $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
            // Update auth state
            $scope.checkAuth();
        });
    }]);

// Run block - Set up HTTP interceptor for auth token
app.run(['$rootScope', '$location', '$http', function ($rootScope, $location, $http) {
    // Add auth token to all requests
    $http.defaults.headers.common['Content-Type'] = 'application/json';

    // Set initially
    var token = localStorage.getItem('authToken');
    var tenantId = localStorage.getItem('tenantId');
    if (token) $http.defaults.headers.common['Authorization'] = 'Bearer ' + token;
    if (tenantId) $http.defaults.headers.common['X-Tenant-ID'] = tenantId;

    // Interceptor for auth token
    $rootScope.$on('$routeChangeStart', function () {
        var token = localStorage.getItem('authToken');
        var tenantId = localStorage.getItem('tenantId');
        
        if (token) {
            $http.defaults.headers.common['Authorization'] = 'Bearer ' + token;
        } else {
            delete $http.defaults.headers.common['Authorization'];
        }
        
        if (tenantId) {
            $http.defaults.headers.common['X-Tenant-ID'] = tenantId;
        } else {
            delete $http.defaults.headers.common['X-Tenant-ID'];
        }
    });
}]);