/**
 * ============================================
 * SUPER ADMIN LOGIN CONTROLLER
 * ============================================
 */
app.controller('SuperAdminLoginController', ['$scope', '$location', 'SuperAdminService',
    function ($scope, $location, SuperAdminService) {

        $scope.credentials = { username: '', password: '' };
        $scope.loading = false;
        $scope.error = null;
        $scope.showPassword = false;

        $scope.login = function () {
            if (!$scope.credentials.username || !$scope.credentials.password) {
                $scope.error = 'Please enter username and password';
                return;
            }

            $scope.loading = true;
            $scope.error = null;

            SuperAdminService.login($scope.credentials)
                .then(function (response) {
                    var data = response.data.data;
                    localStorage.setItem('authToken', data.token);
                    localStorage.setItem('currentUser', JSON.stringify({
                        username: data.username,
                        fullName: data.fullName,
                        email: data.email,
                        role: data.role
                    }));
                    localStorage.setItem('isSuperAdmin', 'true');
                    $location.path('/superadmin/dashboard');
                })
                .catch(function (error) {
                    $scope.error = error.data && error.data.message
                        ? error.data.message
                        : 'Login failed. Please check your credentials.';
                })
                .finally(function () {
                    $scope.loading = false;
                });
        };

        $scope.clearError = function () {
            $scope.error = null;
        };

        $scope.goToClinicLogin = function () {
            $location.path('/login');
        };
    }]);

/**
 * ============================================
 * SUPER ADMIN DASHBOARD CONTROLLER
 * ============================================
 */
app.controller('SuperAdminDashboardController', ['$scope', '$location', 'SuperAdminService',
    function ($scope, $location, SuperAdminService) {

        $scope.clinics = [];
        $scope.loading = false;
        $scope.showCreateModal = false;
        $scope.showAdminModal = false;
        $scope.error = null;
        $scope.success = null;

        // ── Stylish Popup State (Matched with Login) ──
        $scope.subPopup = { show: false, title: '', message: '', time: '', icon: '', type: 'error' };

        var showPopup = function (type, title, message, time, icon) {
            $scope.subPopup = {
                show: true,
                type: type || 'error',
                title: title || 'Alert',
                message: message || 'Something went wrong.',
                time: time || '',
                icon: icon || (type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle')
            };
        };

        var showExpiredPopup = function (expiredAt) {
            showPopup('error', 'Subscription Expired', 
                'This clinic\'s subscription plan has ended. Renewal is required to regain access.', 
                'Expired on: ' + expiredAt, 'fa-calendar-times');
        };

        var showInactivePopup = function () {
            showPopup('warning', 'Clinic is Turned OFF', 
                'This clinic is currently disabled. You must turn it ON before you can log in.', 
                '', 'fa-power-off');
        };

        // New clinic form
        $scope.newClinic = {
            clinicCode: '',
            clinicName: '',
            organizationId: '',
            operationalId: '',
            dbName: '',
            address: '',
            phone: '',
            email: '',
            adminUsername: '',
            adminPassword: '',
            adminEmail: '',
            adminFirstName: '',
            adminLastName: ''
        };

        // Admin form
        $scope.adminForm = {
            tenantId: '',
            adminUsername: '',
            adminPassword: '',
            adminEmail: '',
            adminFirstName: '',
            adminLastName: ''
        };

        // Broadcast and Renew forms
        $scope.broadcast = { title: '', message: '', targetClinic: '' };
        $scope.showRenewModal = false;
        $scope.renewForm = { 
            tenantId: '', clinicName: '', planType: 'Basic', duration: '1', currentExpiry: null, customDate: new Date()
        };

        // ── RBAC State ──
        $scope.showRbacModal = false;
        $scope.rbacMode = 'role'; // 'role' or 'user'
        $scope.rbac = {
            roles: [],
            modules: [],
            selectedRole: '',
            selectedClinic: '',
            selectedUser: '',
            clinicUsers: [],
            selectedModules: {} // moduleCode -> true/false
        };

        $scope.openRbacModal = function(mode) {
            $scope.rbacMode = mode || 'role';
            $scope.loading = true;
            $scope.showRbacModal = true;
            $scope.rbac.selectedRole = '';
            $scope.rbac.selectedClinic = '';
            $scope.rbac.selectedUser = '';
            $scope.rbac.clinicUsers = [];
            $scope.rbac.selectedModules = {};

            // Load Roles and Modules
            var p1 = SuperAdminService.getRoles();
            var p2 = SuperAdminService.getModules();

            Promise.all([p1, p2]).then(function(results) {
                $scope.rbac.roles = results[0].data.data;
                $scope.rbac.modules = results[1].data.data;
                $scope.$apply();
            }).catch(function(err) {
                $scope.error = "Failed to load RBAC data";
                $scope.$apply();
            }).finally(function() {
                $scope.loading = false;
                $scope.$apply();
            });
        };

        $scope.onRoleChange = function() {
            if (!$scope.rbac.selectedRole) return;
            $scope.loading = true;
            $scope.rbac.selectedModules = {};

            SuperAdminService.getRolePermissions($scope.rbac.selectedRole)
                .then(function(res) {
                    var perms = res.data.data || [];
                    perms.forEach(function(code) {
                        $scope.rbac.selectedModules[code] = true;
                    });
                })
                .finally(function() {
                    $scope.loading = false;
                });
        };

        // Clinic Wise RBAC
        $scope.onClinicChange = function() {
            if (!$scope.rbac.selectedClinic) {
                $scope.rbac.clinicUsers = [];
                return;
            }
            $scope.loading = true;
            SuperAdminService.getClinicUsers($scope.rbac.selectedClinic)
                .then(function(res) {
                    $scope.rbac.clinicUsers = res.data.data || [];
                })
                .finally(function() {
                    $scope.loading = false;
                });
        };

        $scope.onUserChange = function() {
            if (!$scope.rbac.selectedUser) return;
            $scope.loading = true;
            $scope.rbac.selectedModules = {};

            // 1. Find the user's role from the list
            var user = $scope.rbac.clinicUsers.find(function(u) { return u.user_id == $scope.rbac.selectedUser; });
            var userRole = user ? user.role : null;

            if (userRole) {
                // 2. Load Role-based permissions first (as baseline)
                SuperAdminService.getRolePermissions(userRole)
                    .then(function(res) {
                        var rolePerms = res.data.data || [];
                        rolePerms.forEach(function(code) {
                            $scope.rbac.selectedModules[code] = true;
                        });

                        // 3. Then load User-specific overrides
                        return SuperAdminService.getUserPermissions($scope.rbac.selectedClinic, $scope.rbac.selectedUser);
                    })
                    .then(function(res) {
                        var userPerms = res.data.data || [];
                        if (userPerms.length > 0) {
                            // If user-specific perms exist, they override the baseline
                            $scope.rbac.selectedModules = {};
                            userPerms.forEach(function(code) {
                                $scope.rbac.selectedModules[code] = true;
                            });
                        }
                    })
                    .finally(function() {
                        $scope.loading = false;
                    });
            } else {
                $scope.loading = false;
            }
        };

        $scope.toggleModule = function(code) {
            $scope.rbac.selectedModules[code] = !$scope.rbac.selectedModules[code];
        };

        $scope.savePermissions = function() {
            var selectedCodes = Object.keys($scope.rbac.selectedModules).filter(function(k) {
                return $scope.rbac.selectedModules[k];
            });

            $scope.loading = true;
            
            var promise;
            if ($scope.rbacMode === 'role') {
                if (!$scope.rbac.selectedRole) return;
                promise = SuperAdminService.updateRolePermissions($scope.rbac.selectedRole, selectedCodes);
            } else {
                if (!$scope.rbac.selectedClinic || !$scope.rbac.selectedUser) return;
                promise = SuperAdminService.updateUserPermissions($scope.rbac.selectedClinic, $scope.rbac.selectedUser, selectedCodes);
            }

            promise.then(function() {
                    $scope.success = "Permissions updated successfully";
                    $scope.showRbacModal = false;
                })
                .catch(function(err) {
                    $scope.error = "Failed to update permissions";
                })
                .finally(function() {
                    $scope.loading = false;
                });
        };

        // Load clinics on init
        $scope.loadClinics = function () {
            $scope.loading = true;
            SuperAdminService.getClinics()
                .then(function (response) {
                    $scope.clinics = response.data.data || [];
                })
                .catch(function (error) {
                    $scope.error = 'Failed to load clinics: ' + (error.data ? error.data.message : error.statusText);
                })
                .finally(function () {
                    $scope.loading = false;
                });
        };

        // Create or Update clinic (handles both operations from modal)
        $scope.saveClinic = function () {
            if (!$scope.newClinic.clinicCode || !$scope.newClinic.clinicName) {
                $scope.error = 'Please fill in all required fields';
                return;
            }

            $scope.loading = true;
            $scope.error = null;

            var currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            $scope.newClinic.createdBy = currentUser.username || 'mkadmin';
            
            // Fix timezone for dates before sending
            if ($scope.newClinic.subscriptionStartDate instanceof Date) {
               $scope.newClinic.subscriptionStartDate = $scope.newClinic.subscriptionStartDate.toISOString();
            }
            if ($scope.newClinic.subscriptionExpiry instanceof Date) {
               $scope.newClinic.subscriptionExpiry = $scope.newClinic.subscriptionExpiry.toISOString();
            }

            if ($scope.isEditMode) {
                // UPDATE logic
                SuperAdminService.updateClinic($scope.newClinic.tenantId, $scope.newClinic)
                    .then(function (response) {
                        $scope.success = 'Clinic "' + $scope.newClinic.clinicName + '" updated successfully!';
                        $scope.showCreateModal = false;
                        $scope.resetNewClinicForm();
                        $scope.loadClinics();
                    })
                    .catch(function (error) {
                        $scope.error = 'Failed to update clinic: ' + (error.data ? error.data.message : error.statusText);
                    })
                    .finally(function () {
                        $scope.loading = false;
                    });
            } else {
                // CREATE logic
                if (!$scope.newClinic.dbName) {
                    $scope.error = 'Database Name is required for new clinic';
                    $scope.loading = false;
                    return;
                }
                SuperAdminService.createClinic($scope.newClinic)
                    .then(function (response) {
                        $scope.success = 'Clinic "' + $scope.newClinic.clinicName + '" created successfully!';
                        $scope.showCreateModal = false;
                        $scope.resetNewClinicForm();
                        $scope.loadClinics();
                    })
                    .catch(function (error) {
                        $scope.error = 'Failed to create clinic: ' + (error.data ? error.data.message : error.statusText);
                    })
                    .finally(function () {
                        $scope.loading = false;
                    });
            }
        };

        // Open modal for editing existing clinic
        $scope.openEditModal = function (clinic) {
            $scope.isEditMode = true;
            $scope.newClinic = angular.copy(clinic);
            // Convert strings back to Date objects for input[type="date"] binding if needed
            if ($scope.newClinic.subscriptionStartDate) {
               $scope.newClinic.subscriptionStartDate = new Date($scope.newClinic.subscriptionStartDate);
            }
            if ($scope.newClinic.subscriptionExpiry) {
               $scope.newClinic.subscriptionExpiry = new Date($scope.newClinic.subscriptionExpiry);
            }
            $scope.showCreateModal = true;
        };


        // Toggle clinic status with Confirm Popup
        $scope.toggleStatus = function (clinic) {
            var newStatus = clinic.active; // ng-model has set it already
            var actionText = newStatus ? "activate" : "deactivate (terminate)";
            
            if (!confirm("Are you sure you want to " + actionText + " the subscription for " + clinic.clinicName + "?")) {
                // User cancelled, revert ng-model back to old status
                clinic.active = !newStatus;
                return;
            }

            $scope.loading = true;
            SuperAdminService.toggleClinicStatus(clinic.tenantId, newStatus)
                .then(function () {
                    $scope.success = 'Clinic ' + (newStatus ? 'activated' : 'terminated') + ' successfully';
                    
                    // If terminating, forcefully expire the date too 
                    if (!newStatus) {
                        var payload = {
                            tenantId: clinic.tenantId,
                            clinicName: clinic.clinicName,
                            subscriptionExpiry: new Date().toISOString()
                        };
                        SuperAdminService.renewClinicSubscription(clinic.tenantId, payload).then(function() {
                            clinic.subscriptionExpiry = payload.subscriptionExpiry;
                        }).catch(function() {
                            clinic.subscriptionExpiry = payload.subscriptionExpiry;
                        });
                    }
                })
                .catch(function (error) {
                    // API Failed, revert
                    clinic.active = !newStatus;
                    $scope.error = 'Failed to update status: ' + (error.data ? error.data.message : error.statusText);
                })
                .finally(function() {
                    $scope.loading = false;
                });
        };

        // Create admin for clinic
        $scope.openAdminModal = function (clinic) {
            $scope.adminForm.tenantId = clinic.tenantId;
            $scope.adminForm.clinicName = clinic.clinicName;
            $scope.showAdminModal = true;
        };

        $scope.createAdmin = function () {
            if (!$scope.adminForm.adminUsername || !$scope.adminForm.adminPassword) {
                $scope.error = 'Username and password are required';
                return;
            }

            $scope.loading = true;
            SuperAdminService.createClinicAdmin($scope.adminForm.tenantId, $scope.adminForm)
                .then(function () {
                    $scope.success = 'Admin "' + $scope.adminForm.adminUsername + '" created successfully!';
                    $scope.showAdminModal = false;
                    $scope.resetAdminForm();
                })
                .catch(function (error) {
                    $scope.error = 'Failed to create admin: ' + (error.data ? error.data.message : error.statusText);
                })
                .finally(function () {
                    $scope.loading = false;
                });
        };

        // Subscription logic
        $scope.isSubExpired = function (clinic) {
            if (!clinic.subscriptionExpiry) return true;
            return new Date(clinic.subscriptionExpiry) < new Date();
        };

        $scope.openRenewModal = function (clinic) {
            $scope.renewForm.tenantId = clinic.tenantId;
            $scope.renewForm.clinicName = clinic.clinicName;
            $scope.renewForm.currentExpiry = clinic.subscriptionExpiry;
            $scope.renewForm.planType = 'Pro';
            $scope.renewForm.duration = '12';
            $scope.showRenewModal = true;
        };

        $scope.endSubscription = function (clinic) {
            if (!confirm('Are you sure you want to end the subscription for ' + clinic.clinicName + ' immediately?')) {
                return;
            }
            $scope.loading = true;
            
            var payload = {
                tenantId: clinic.tenantId,
                clinicName: clinic.clinicName,
                subscriptionExpiry: new Date().toISOString() // End it right now
            };
            
            SuperAdminService.renewClinicSubscription(clinic.tenantId, payload)
                .then(function (response) {
                    $scope.success = 'Subscription ended successfully for ' + clinic.clinicName;
                    $scope.loadClinics();
                })
                .catch(function (error) {
                    if (error.status === 404 || error.status === -1 || error.status === 400) {
                         clinic.subscriptionExpiry = payload.subscriptionExpiry;
                         $scope.success = '(Mock) Subscription ended successfully for ' + clinic.clinicName;
                    } else {
                         $scope.error = 'Failed to end subscription: ' + (error.data && error.data.message ? error.data.message : error.statusText);
                    }
                })
                .finally(function () {
                    $scope.loading = false;
                });
        };

        $scope.renewSubscription = function () {
            $scope.loading = true;
            
            // Calculate new expiry date before sending to backend
            var clinic = $scope.clinics.find(function(c) { return c.tenantId === $scope.renewForm.tenantId; });
            var newExpiry = new Date();
            
            if ($scope.renewForm.duration === 'custom' && $scope.renewForm.customDate) {
                newExpiry = new Date($scope.renewForm.customDate);
            } else {
                newExpiry = clinic && clinic.subscriptionExpiry ? new Date(clinic.subscriptionExpiry) : new Date();
                if(newExpiry < new Date()) newExpiry = new Date(); // Start from today if expired
                newExpiry.setMonth(newExpiry.getMonth() + parseInt($scope.renewForm.duration));
            }
            // Send subscriptionExpiry to backend formatted properly
            $scope.renewForm.subscriptionExpiry = newExpiry.toISOString();
            
            SuperAdminService.renewClinicSubscription($scope.renewForm.tenantId, $scope.renewForm)
                .then(function (response) {
                    $scope.success = 'Subscription renewed successfully for ' + $scope.renewForm.clinicName;
                    $scope.showRenewModal = false;
                    $scope.loadClinics();
                })
                .catch(function (error) {
                    // Fallback to local mock if API fails/does not exist yet
                    if(error.status === 404 || error.status === -1 || error.status === 400) {
                         if(clinic) {
                             clinic.subscriptionExpiry = newExpiry.toISOString();
                         }
                         $scope.success = '(Mock) Subscription renewed successfully for ' + $scope.renewForm.clinicName;
                         $scope.showRenewModal = false;
                    } else {
                         $scope.error = 'Failed to renew: ' + (error.data && error.data.message ? error.data.message : error.statusText);
                    }
                })
                .finally(function () {
                    $scope.loading = false;
                });
        };

        // Broadcast alert logic
        $scope.sendAlert = function () {
            if (!$scope.broadcast.title || !$scope.broadcast.message) return;
            $scope.loading = true;
            
            SuperAdminService.sendBroadcastAlert($scope.broadcast)
                .then(function (response) {
                    $scope.success = 'Alert "' + $scope.broadcast.title + '" sent successfully!';
                    $scope.broadcast = { title: '', message: '', targetClinic: '' };
                })
                .catch(function (error) {
                    // Fallback to local mock
                    if(error.status === 404 || error.status === -1) {
                        $scope.success = '(Mock) Alert "' + $scope.broadcast.title + '" sent successfully!';
                        $scope.broadcast = { title: '', message: '', targetClinic: '' };
                    } else {
                        $scope.error = 'Failed to send alert: ' + (error.data && error.data.message ? error.data.message : error.statusText);
                    }
                })
                .finally(function () {
                    $scope.loading = false;
                });
        };

        // Login to a clinic as super admin
        $scope.loginToClinic = function (clinic) {
            if (!clinic.active) {
                showInactivePopup();
                return;
            }
            if (clinic.subscriptionExpiry && new Date(clinic.subscriptionExpiry) < new Date()) {
                var d = new Date(clinic.subscriptionExpiry);
                showExpiredPopup(d.toLocaleDateString() + ' ' + d.toLocaleTimeString());
                return;
            }
            $location.path('/clinic/' + clinic.clinicCode);
        };

        // Reset forms
        $scope.resetNewClinicForm = function () {
            $scope.isEditMode = false;
            $scope.newClinic = {
                clinicCode: '', clinicName: '', organizationId: '', operationalId: '',
                dbName: '', address: '', phone: '', email: '',
                adminUsername: '', adminPassword: '', adminEmail: '', adminFirstName: '', adminLastName: '',
                subscriptionStartDate: new Date(), subscriptionExpiry: new Date(new Date().setMonth(new Date().getMonth() + 1))
            };
        };

        $scope.resetAdminForm = function () {
            $scope.adminForm = {
                tenantId: '', adminUsername: '', adminPassword: '', adminEmail: '',
                adminFirstName: '', adminLastName: ''
            };
        };

        $scope.clearMessages = function () {
            $scope.error = null;
            $scope.success = null;
        };

        $scope.logout = function () {
            localStorage.clear();
            $location.path('/superadmin/login');
        };

        // Auto-fill dbName when clinicCode changes
        $scope.$watch('newClinic.clinicCode', function (newVal) {
            if (newVal) {
                $scope.newClinic.dbName = 'clinic_' + newVal.toLowerCase().replace(/[^a-z0-9]/g, '_');
            }
        });

        // Initialize
        $scope.loadClinics();
    }]);
