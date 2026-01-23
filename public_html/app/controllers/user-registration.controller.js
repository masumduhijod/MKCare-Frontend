/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/**
 * User Registration Controller (Admin Only)
 * Register new users for the system
 */

app.controller('UserRegistrationController', ['$scope', '$rootScope', '$location', 'AuthService', 'UserService',
    function($scope, $rootScope, $location, AuthService, UserService) {
    
    // Check if user is admin
    var currentUser = AuthService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
        $rootScope.showAlert('danger', 'Access Denied: Only Admin can register users');
        $location.path('/dashboard');
        return;
    }
    
    // Initialize user object
    $scope.user = {
        username: '',
        password: '',
        email: '',
        role: '',
        firstName: '',
        lastName: '',
        contactNumber: '',
        createdBy: currentUser.username
    };
    
    $scope.confirmPassword = '';
    $scope.loading = false;
    $scope.errors = {};
    $scope.registeredUser = null;
    $scope.users = [];
    
    // Password Reset Modal Data
    $scope.passwordReset = {
        username: '',
        newPassword: '',
        confirmPassword: '',
        loading: false,
        errors: {}
    };
    
    /**
     * Load All Users
     */
    $scope.loadUsers = function() {
        UserService.getAll()
            .then(function(response) {
                if (response.data.success) {
                    $scope.users = response.data.data;
                }
            })
            .catch(function(error) {
                console.error('Error loading users:', error);
            });
    };
    
    /**
     * Check if Username Exists
     */
    $scope.checkUsernameExists = function() {
        if ($scope.user.username && $scope.user.username.length >= 3) {
            UserService.getByUsername($scope.user.username)
                .then(function(response) {
                    if (response.data.success) {
                        $scope.errors.username = 'Username already exists';
                    } else {
                        $scope.errors.username = '';
                    }
                })
                .catch(function(error) {
                    // Username doesn't exist - good!
                    $scope.errors.username = '';
                });
        }
    };
    
    /**
     * Validate Form
     */
    $scope.validateForm = function() {
        $scope.errors = {};
        var isValid = true;
        
        // Required fields
        if (!$scope.user.firstName) {
            $scope.errors.firstName = 'First name is required';
            isValid = false;
        }
        
        if (!$scope.user.lastName) {
            $scope.errors.lastName = 'Last name is required';
            isValid = false;
        }
        
        if (!$scope.user.username || $scope.user.username.length < 3) {
            $scope.errors.username = 'Username must be at least 3 characters';
            isValid = false;
        }
        
        if (!$scope.user.password || $scope.user.password.length < 6) {
            $scope.errors.password = 'Password must be at least 6 characters';
            isValid = false;
        }
        
        if ($scope.user.password !== $scope.confirmPassword) {
            $scope.errors.confirmPassword = 'Passwords do not match';
            isValid = false;
        }
        
        if (!$scope.user.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($scope.user.email)) {
            $scope.errors.email = 'Invalid email format';
            isValid = false;
        }
        
        if (!$scope.user.contactNumber || !/^[0-9]{10}$/.test($scope.user.contactNumber)) {
            $scope.errors.contactNumber = 'Contact number must be 10 digits';
            isValid = false;
        }
        
        if (!$scope.user.role) {
            $scope.errors.role = 'Please select a role';
            isValid = false;
        }
        
        return isValid;
    };
    
    /**
     * Register User
     */
    $scope.registerUser = function() {
        // Validate
        if (!$scope.validateForm()) {
            $rootScope.showAlert('danger', 'Please correct the errors in the form');
            return;
        }
        
        $scope.loading = true;
        
        AuthService.register($scope.user)
            .then(function(response) {
                $scope.loading = false;
                
                if (response.success) {
                    $scope.registeredUser = response.data;
                    $rootScope.showAlert('success', 'User registered successfully!');
                    
                    // Reset form
                    $scope.resetForm();
                    
                    // Reload user list
                    $scope.loadUsers();
                } else {
                    $rootScope.showAlert('danger', response.message || 'Registration failed');
                }
            })
            .catch(function(error) {
                $scope.loading = false;
                var errorMsg = error.data && error.data.message ? error.data.message : 'Registration failed. Please try again.';
                $rootScope.showAlert('danger', errorMsg);
            });
    };
    
    /**
     * Open Reset Password Modal
     */
    $scope.openResetPasswordModal = function(username) {
        $scope.passwordReset = {
            username: username,
            newPassword: '',
            confirmPassword: '',
            loading: false,
            errors: {}
        };
        
        var modal = new bootstrap.Modal(document.getElementById('resetPasswordModal'));
        modal.show();
    };
    
    /**
     * Validate Password Reset Form
     */
    $scope.validatePasswordReset = function() {
        $scope.passwordReset.errors = {};
        var isValid = true;
        
        if (!$scope.passwordReset.newPassword || $scope.passwordReset.newPassword.length < 6) {
            $scope.passwordReset.errors.newPassword = 'Password must be at least 6 characters';
            isValid = false;
        }
        
        if ($scope.passwordReset.newPassword !== $scope.passwordReset.confirmPassword) {
            $scope.passwordReset.errors.confirmPassword = 'Passwords do not match';
            isValid = false;
        }
        
        return isValid;
    };
    
    /**
     * Reset Password (Submit)
     */
    $scope.submitPasswordReset = function() {
        if (!$scope.validatePasswordReset()) {
            return;
        }
        
        $scope.passwordReset.loading = true;
        
        UserService.resetPassword($scope.passwordReset.username, $scope.passwordReset.newPassword)
            .then(function(response) {
                $scope.passwordReset.loading = false;
                
                if (response.data.success) {
                    $rootScope.showAlert('success', 'Password reset successfully for ' + $scope.passwordReset.username);
                    
                    // Close modal
                    var modal = bootstrap.Modal.getInstance(document.getElementById('resetPasswordModal'));
                    modal.hide();
                    
                    // Reset form
                    $scope.passwordReset = {
                        username: '',
                        newPassword: '',
                        confirmPassword: '',
                        loading: false,
                        errors: {}
                    };
                } else {
                    $scope.passwordReset.errors.general = response.data.message || 'Password reset failed';
                }
            })
            .catch(function(error) {
                $scope.passwordReset.loading = false;
                console.error('Password reset error:', error);
                var msg = error.data && error.data.message ? error.data.message : 'Error resetting password';
                $scope.passwordReset.errors.general = msg;
            });
    };
    
    /**
     * Reset Form
     */
    $scope.resetForm = function() {
        $scope.user = {
            username: '',
            password: '',
            email: '',
            role: '',
            firstName: '',
            lastName: '',
            contactNumber: '',
            createdBy: currentUser.username
        };
        $scope.confirmPassword = '';
        $scope.errors = {};
        $scope.registeredUser = null;
    };
    
    /**
     * Cancel
     */
    $scope.cancel = function() {
        if (confirm('Are you sure you want to cancel?')) {
            $location.path('/dashboard');
        }
    };
    
    // Initialize
    $scope.loadUsers();
}]);