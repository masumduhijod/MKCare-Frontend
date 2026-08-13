/* 
 * Login Controller - 2-Step Login Flow
 * Step 1: Enter Clinic ID → validate → fetch clinic info
 * Step 2: Show clinic-branded login form (username + password)
 */

app.controller('LoginController', ['$scope', '$location', '$rootScope', '$routeParams', 'AuthService', 'SuperAdminService',
    function ($scope, $location, $rootScope, $routeParams, AuthService, SuperAdminService) {

        // ── Step management ──
        $scope.step = 1;   // 1 = Enter Clinic ID,  2 = Username/Password

        // ── Credentials ──
        $scope.credentials = {
            clinicId: '',
            username: '',
            password: ''
        };

        $scope.clinicInput = { id: '' };  // Object to survive ng-if child scope
        $scope.validatedClinic = null;  // Clinic details after validation
        $scope.loading = false;
        $scope.error = '';
        $scope.clinicLoading = false;

        // ── Stylish Popup State ──
        $scope.subPopup = { show: false, title: '', message: '', time: '', icon: '' };

        var showExpiredPopup = function (expiredAt) {
            $scope.subPopup = {
                show: true,
                icon: 'fa-calendar-times',
                title: 'Subscription Expired',
                message: 'This clinic\'s subscription plan has ended. Please contact your Super Admin to renew and regain access.',
                time: 'Expired on: ' + expiredAt
            };
        };

        var showInactivePopup = function () {
            $scope.subPopup = {
                show: true,
                icon: 'fa-power-off',
                title: 'Clinic is Turned OFF',
                message: 'This clinic is currently disabled by the Super Admin. Please contact them to restore access.',
                time: ''
            };
        };

        // ── URL-based clinic detection ──
        var clinicCode = $routeParams.clinicCode;
        if (clinicCode) {
            $scope.clinicLoading = true;
            SuperAdminService.getClinicByCode(clinicCode)
                .then(function (response) {
                    var clinic = response.data.data;
                    
                    if (clinic.subscriptionExpiry && new Date(clinic.subscriptionExpiry) < new Date()) {
                        var d = new Date(clinic.subscriptionExpiry);
                        showExpiredPopup(d.toLocaleDateString() + ' ' + d.toLocaleTimeString());
                        return;
                    }
                    if (!clinic.active) {
                        showInactivePopup();
                        return;
                    }

                    $scope.validatedClinic = clinic;
                    $scope.credentials.clinicId = clinic.tenantId;
                    $scope.clinicInput.id = clinic.tenantId;
                    $scope.step = 2; // Go directly to login
                    console.log('✅ Clinic auto-detected:', clinic.clinicName);
                })
                .catch(function () {
                    $scope.error = 'Clinic not found for code: ' + clinicCode;
                })
                .finally(function () {
                    $scope.clinicLoading = false;
                });
        }

        // Check if already logged in
        if (AuthService.isAuthenticated()) {
            $location.path('/dashboard');
        }

        /**
         * Step 1 → Validate Clinic ID
         */
        $scope.validateClinic = function () {
            $scope.error = '';
            var id = ($scope.clinicInput.id || '').trim().toUpperCase();

            if (!id) {
                $scope.error = 'Please enter a Clinic ID';
                return;
            }

            $scope.clinicLoading = true;

            SuperAdminService.validateClinicId(id)
                .then(function (response) {
                    if (response.data.success && response.data.data) {
                        var clinic = response.data.data;
                        
                        // Frontend double-check (even though backend already blocks)
                        if (clinic.subscriptionExpiry && new Date(clinic.subscriptionExpiry) < new Date()) {
                            var d = new Date(clinic.subscriptionExpiry);
                            showExpiredPopup(d.toLocaleDateString() + ' ' + d.toLocaleTimeString());
                            return;
                        }
                        if (!clinic.active) {
                            showInactivePopup();
                            return;
                        }

                        $scope.validatedClinic = clinic;
                        $scope.credentials.clinicId = clinic.tenantId;
                        $scope.step = 2;
                        console.log('\u2705 Clinic validated:', clinic.clinicName);
                    } else {
                        $scope.error = 'Invalid Clinic ID. Please check and try again.';
                    }
                })
                .catch(function (err) {
                    var backendMsg = (err.data && err.data.message) ? err.data.message : null;
                    if (err.status === 403) {
                        showInactivePopup();
                    } else if (err.status === 402) {
                        showExpiredPopup(backendMsg || 'Check with Super Admin');
                    } else {
                        $scope.error = backendMsg || 'Invalid Clinic ID. Please check and try again.';
                    }
                })
                .finally(function () {
                    $scope.clinicLoading = false;
                });
        };

        /**
         * Go back to Step 1
         */
        $scope.changeClinic = function () {
            $scope.step = 1;
            $scope.validatedClinic = null;
            $scope.clinicInput.id = '';
            $scope.credentials.clinicId = '';
            $scope.credentials.username = '';
            $scope.credentials.password = '';
            $scope.error = '';
        };

        /**
         * Step 2 → Login
         */
        $scope.login = function () {
            $scope.error = '';

            if (!$scope.credentials.username || !$scope.credentials.password) {
                $scope.error = 'Please enter username and password';
                return;
            }

            $scope.loading = true;

            AuthService.login($scope.credentials)
                .then(function (response) {
                    $scope.loading = false;
                    $rootScope.showAlert('success', 'Login successful! Welcome to ' + response.data.clinicName);
                    $location.path('/dashboard');
                })
                .catch(function (error) {
                    $scope.loading = false;
                    $scope.error = error || 'Login failed. Please try again.';
                });
        };

        /**
         * Navigate to Super Admin Login
         */
        $scope.goToSuperAdmin = function () {
            $location.path('/superadmin/login');
        };

        /**
         * Clear Error
         */
        $scope.clearError = function () {
            $scope.error = '';
        };
    }]);