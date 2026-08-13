'use strict';

/**
 * Controller for User Role Master (RBAC Management)
 * Managed by Clinic Admin
 */
app.controller('RoleMasterController', ['$scope', '$rootScope', 'UserService', 'AuthService', '$timeout', 
    function ($scope, $rootScope, UserService, AuthService, $timeout) {
    
    $scope.rbacMode = 'role'; // 'role' or 'user'
    $scope.roles = [];
    $scope.users = [];
    $scope.modules = [];
    
    $scope.selectedRole = null;
    $scope.selectedUser = null;
    $scope.selectedModules = {};
    
    $scope.loading = false;
    $scope.saving = false;

    /**
     * Initialize data
     */
    $scope.init = function () {
        console.log('RoleMasterController: Initializing...');
        $scope.loadRoles();
        $scope.loadModules();
        $scope.loadUsers();
    };

    /**
     * Switch between Role and User modes
     */
    $scope.setMode = function(mode) {
        $scope.rbacMode = mode;
        $scope.selectedRole = null;
        $scope.selectedUser = null;
        $scope.selectedModules = {};
    };

    /**
     * Load all system roles
     */
    $scope.loadRoles = function () {
        UserService.getRoles()
            .then(function (res) {
                $scope.roles = res.data.data;
            })
            .catch(function (err) {
                console.error('Error loading roles:', err);
            });
    };

    /**
     * Load all clinic users
     */
    $scope.loadUsers = function() {
        UserService.getAll()
            .then(function(res) {
                $scope.users = res.data.data;
            })
            .catch(function(err) {
                console.error('Error loading users:', err);
            });
    };

    /**
     * Load all available modules
     */
    $scope.loadModules = function () {
        UserService.getModules()
            .then(function (res) {
                $scope.modules = res.data.data;
            })
            .catch(function (err) {
                console.error('Error loading modules:', err);
            });
    };

    /**
     * Select a role to view/edit permissions
     */
    $scope.selectRole = function (role) {
        $scope.selectedRole = role;
        $scope.selectedUser = null;
        $scope.selectedModules = {};
        if (!role) return;

        $scope.loading = true;
        UserService.getRolePermissions(role)
            .then(function (res) {
                var perms = res.data.data || [];
                
                // If no permissions set in DB, use system defaults
                if (perms.length === 0) {
                    if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
                        perms = $scope.modules.map(function(m) { return m.module_code; });
                    } else if (role === 'DOCTOR') {
                        perms = ['DASHBOARD', 'PATIENT_LIST', 'OPD_CONSULT', 'APP_LIST', 'REPORTS'];
                    } else if (role === 'RECEPTIONIST') {
                        perms = ['DASHBOARD', 'PATIENT_REG', 'PATIENT_LIST', 'APP_BOOKING', 'APP_LIST', 'OPD_QUEUE', 'BILLING', 'PAYMENTS', 'REPORTS'];
                    }
                }
                
                perms.forEach(function(code) {
                    $scope.selectedModules[code] = true;
                });
            })
            .catch(function (err) {
                console.error('Error loading permissions:', err);
            })
            .finally(function() {
                $scope.loading = false;
            });
    };

    /**
     * Select a user to view/edit custom overrides
     */
    $scope.selectUser = function(user) {
        $scope.selectedUser = user;
        $scope.selectedRole = null;
        $scope.selectedModules = {};
        if (!user) return;

        $scope.loading = true;
        var tenantId = AuthService.getCurrentUser().tenantId;
        UserService.getUserPermissions(tenantId, user.userId)
            .then(function(res) {
                var perms = res.data.data || [];
                
                // If user has no custom overrides, show their Role's permissions
                if (perms.length === 0) {
                    UserService.getRolePermissions(user.role).then(function(roleRes) {
                        var rolePerms = roleRes.data.data || [];
                        if (rolePerms.length === 0) {
                            if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
                                rolePerms = $scope.modules.map(function(m) { return m.module_code; });
                            } else if (user.role === 'DOCTOR') {
                                rolePerms = ['DASHBOARD', 'PATIENT_LIST', 'OPD_CONSULT', 'APP_LIST', 'REPORTS'];
                            } else if (user.role === 'RECEPTIONIST') {
                                rolePerms = ['DASHBOARD', 'PATIENT_REG', 'PATIENT_LIST', 'APP_BOOKING', 'APP_LIST', 'OPD_QUEUE', 'BILLING', 'PAYMENTS', 'REPORTS'];
                            }
                        }
                        rolePerms.forEach(function(code) {
                            $scope.selectedModules[code] = true;
                        });
                    });
                } else {
                    perms.forEach(function(code) {
                        $scope.selectedModules[code] = true;
                    });
                }
            })
            .catch(function(err) {
                console.error('Error loading user permissions:', err);
            })
            .finally(function() {
                $scope.loading = false;
            });
    };

    /**
     * Toggle a module selection
     */
    $scope.toggleModule = function (code) {
        $scope.selectedModules[code] = !$scope.selectedModules[code];
    };

    /**
     * Select all modules
     */
    $scope.selectAll = function() {
        $scope.modules.forEach(mod => {
            $scope.selectedModules[mod.module_code] = true;
        });
    };

    /**
     * Deselect all modules
     */
    $scope.deselectAll = function() {
        $scope.selectedModules = {};
    };

    /**
     * Save updated permissions
     */
    $scope.savePermissions = function () {
        const selectedCodes = Object.keys($scope.selectedModules).filter(k => $scope.selectedModules[k]);
        $scope.saving = true;

        var promise;
        if ($scope.rbacMode === 'role') {
            promise = UserService.updateRolePermissions($scope.selectedRole, selectedCodes);
        } else {
            var tenantId = AuthService.getCurrentUser().tenantId;
            promise = UserService.updateUserPermissions(tenantId, $scope.selectedUser.userId, selectedCodes);
        }

        promise.then(function (res) {
                $rootScope.showPremiumAlert({
                    title: 'Success!',
                    message: 'Permissions have been updated successfully for ' + ($scope.rbacMode === 'role' ? $scope.selectedRole : $scope.selectedUser.fullName) + '.',
                    type: 'success',
                    icon: 'fa-check-circle'
                });
            })
            .catch(function (err) {
                console.error('Error saving permissions:', err);
                $rootScope.showPremiumAlert({
                    title: 'Update Failed',
                    message: 'There was an error while updating permissions. Please try again.',
                    type: 'error',
                    icon: 'fa-times-circle'
                });
            })
            .finally(function() {
                $scope.saving = false;
            });
    };

    // Auto-init
    $scope.init();
}]);
