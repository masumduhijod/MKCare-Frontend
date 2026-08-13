/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * User List Controller (Admin Only)
 * View, Edit, Delete Users
 */

app.controller('UserListController', ['$scope', '$rootScope', '$location', 'UserService', 'AuthService',
    function($scope, $rootScope, $location, UserService, AuthService) {
    
    // Check if user is admin
    var currentUser = AuthService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
        $rootScope.showAlert('danger', 'Access Denied: Only Admin can manage users');
        $location.path('/dashboard');
        return;
    }
    
    // Initialize
    $scope.users = [];
    $scope.filteredUsers = [];
    $scope.loading = false;
    $scope.filterRole = '';
    $scope.filterStatus = '';
    $scope.searchQuery = '';
    $scope.editingUser = null;
    $scope.viewingUser = null;
    
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
        $scope.loading = true;
        
        UserService.getAll()
            .then(function(response) {
                $scope.loading = false;
                console.log('Users loaded:', response.data);
                
                if (response.data.success) {
                    $scope.users = response.data.data;
                    $scope.applyFilters(); // Apply filters after loading
                    $rootScope.showAlert('success', 'Users loaded: ' + $scope.users.length);
                } else {
                    $rootScope.showAlert('warning', 'No users found');
                }
            })
            .catch(function(error) {
                $scope.loading = false;
                console.error('Error loading users:', error);
                $rootScope.showAlert('danger', 'Error loading users');
            });
    };
    
    /**
     * Apply All Filters (Role, Status, Search)
     */
    $scope.applyFilters = function() {
        $scope.filteredUsers = $scope.users;
        
        // Filter by Role
        if ($scope.filterRole) {
            $scope.filteredUsers = $scope.filteredUsers.filter(function(user) {
                return user.role === $scope.filterRole;
            });
        }
        
        // Filter by Status
        if ($scope.filterStatus) {
            $scope.filteredUsers = $scope.filteredUsers.filter(function(user) {
                return user.status === $scope.filterStatus;
            });
        }
        
        // Filter by Search Query (username, fullName, email)
        if ($scope.searchQuery && $scope.searchQuery.trim() !== '') {
            var query = $scope.searchQuery.toLowerCase();
            $scope.filteredUsers = $scope.filteredUsers.filter(function(user) {
                return (user.username && user.username.toLowerCase().indexOf(query) > -1) ||
                       (user.fullName && user.fullName.toLowerCase().indexOf(query) > -1) ||
                       (user.email && user.email.toLowerCase().indexOf(query) > -1);
            });
        }
    };
    
    /**
     * View User Details
     */
    $scope.viewUser = function(user) {
        $scope.viewingUser = angular.copy(user);
        var modal = new bootstrap.Modal(document.getElementById('viewUserModal'));
        modal.show();
    };
    
    /**
     * Edit User
     */
    $scope.editUser = function(user) {
        $scope.editingUser = angular.copy(user);
        var modal = new bootstrap.Modal(document.getElementById('editUserModal'));
        modal.show();
    };
    
    /**
     * Save User Changes
     */
    $scope.saveUser = function() {
        if (!$scope.editingUser.firstName || !$scope.editingUser.email) {
            $rootScope.showAlert('warning', 'Please fill required fields');
            return;
        }
        
        // Update fullName
        $scope.editingUser.fullName = $scope.editingUser.firstName + ' ' + ($scope.editingUser.lastName || '');
        
        UserService.update($scope.editingUser.username, $scope.editingUser)
            .then(function(response) {
                if (response.data.success) {
                    $rootScope.showAlert('success', 'User updated successfully');
                    $scope.loadUsers();
                    
                    var modal = bootstrap.Modal.getInstance(document.getElementById('editUserModal'));
                    modal.hide();
                } else {
                    $rootScope.showAlert('danger', response.data.message || 'Failed to update user');
                }
            })
            .catch(function(error) {
                console.error('Update error:', error);
                $rootScope.showAlert('danger', 'Error updating user');
            });
    };
    
    /**
     * Open Reset Password Modal
     */
    $scope.openResetPasswordModal = function(user) {
        $scope.passwordReset = {
            username: user.username,
            fullName: user.fullName,
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
     * Submit Password Reset
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
     * Delete User
     */
    $scope.deleteUser = function(user) {
        if (user.username === 'admin') {
            $rootScope.showAlert('danger', 'Cannot delete admin user');
            return;
        }
        
        if (confirm('Are you sure you want to delete user "' + user.username + '"?\n\nThis action cannot be undone!')) {
            UserService.delete(user.username)
                .then(function(response) {
                    if (response.data.success) {
                        $rootScope.showAlert('success', 'User deleted successfully');
                        $scope.loadUsers();
                    } else {
                        $rootScope.showAlert('danger', response.data.message || 'Failed to delete user');
                    }
                })
                .catch(function(error) {
                    console.error('Delete error:', error);
                    $rootScope.showAlert('danger', 'Error deleting user');
                });
        }
    };
    
    /**
     * Go to Register Page
     */
    $scope.goToRegister = function() {
        $location.path('/user/register');
    };

    // =====================================================================
    // ⭐ RBAC: User Specific Permissions
    // =====================================================================
    $scope.modules = [];
    $scope.permUser = null;
    $scope.userPerms = {};

    $scope.loadModules = function() {
        UserService.getModules().then(function(res) {
            $scope.modules = res.data.data;
        });
    };

    $scope.manageUserPermissions = function(user) {
        $scope.permUser = user;
        $scope.userPerms = {};
        $scope.loadModules();

        var tenantId = AuthService.getCurrentUser().tenantId;
        UserService.getUserPermissions(tenantId, user.userId)
            .then(function(res) {
                var perms = res.data.data || [];
                perms.forEach(function(code) {
                    $scope.userPerms[code] = true;
                });
                var modal = new bootstrap.Modal(document.getElementById('userPermissionsModal'));
                modal.show();
            });
    };

    $scope.resetToRoleDefault = function() {
        if (confirm('Resetting will remove all custom overrides for this user. Continue?')) {
            $scope.userPerms = {};
            $scope.saveUserPermissions();
        }
    };

    $scope.saveUserPermissions = function() {
        var selectedCodes = Object.keys($scope.userPerms).filter(k => $scope.userPerms[k]);
        var tenantId = AuthService.getCurrentUser().tenantId;

        UserService.updateUserPermissions(tenantId, $scope.permUser.userId, selectedCodes)
            .then(function(res) {
                $rootScope.showAlert('success', 'Permissions updated for ' + $scope.permUser.username);
                bootstrap.Modal.getInstance(document.getElementById('userPermissionsModal')).hide();
            })
            .catch(function(err) {
                $rootScope.showAlert('danger', 'Failed to update permissions');
            });
    };
    
    // Initialize
    console.log('User List Controller initialized');
    $scope.loadUsers();
    $scope.loadModules();
}]);