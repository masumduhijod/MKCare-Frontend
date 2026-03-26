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

        // Create clinic
        $scope.createClinic = function () {
            if (!$scope.newClinic.clinicCode || !$scope.newClinic.clinicName || !$scope.newClinic.dbName) {
                $scope.error = 'Please fill in all required fields';
                return;
            }

            $scope.loading = true;
            $scope.error = null;

            var currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            $scope.newClinic.createdBy = currentUser.username || 'mkadmin';

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
        };

        // Toggle clinic status
        $scope.toggleStatus = function (clinic) {
            var newStatus = !clinic.active;
            SuperAdminService.toggleClinicStatus(clinic.tenantId, newStatus)
                .then(function () {
                    clinic.active = newStatus;
                    $scope.success = 'Clinic ' + (newStatus ? 'activated' : 'deactivated') + ' successfully';
                })
                .catch(function (error) {
                    $scope.error = 'Failed to update status: ' + (error.data ? error.data.message : error.statusText);
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

        // Login to a clinic as super admin
        $scope.loginToClinic = function (clinic) {
            $location.path('/clinic/' + clinic.clinicCode);
        };

        // Reset forms
        $scope.resetNewClinicForm = function () {
            $scope.newClinic = {
                clinicCode: '', clinicName: '', organizationId: '', operationalId: '',
                dbName: '', address: '', phone: '', email: '',
                adminUsername: '', adminPassword: '', adminEmail: '', adminFirstName: '', adminLastName: ''
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
