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

        // ── URL-based clinic detection ──
        var clinicCode = $routeParams.clinicCode;
        if (clinicCode) {
            $scope.clinicLoading = true;
            SuperAdminService.getClinicByCode(clinicCode)
                .then(function (response) {
                    var clinic = response.data.data;
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
                        $scope.validatedClinic = response.data.data;
                        $scope.credentials.clinicId = response.data.data.tenantId;
                        $scope.step = 2;
                        console.log('✅ Clinic validated:', response.data.data.clinicName);
                    } else {
                        $scope.error = 'Invalid Clinic ID. Please check and try again.';
                    }
                })
                .catch(function (err) {
                    var msg = (err.data && err.data.message) ? err.data.message : 'Invalid Clinic ID';
                    $scope.error = msg;
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