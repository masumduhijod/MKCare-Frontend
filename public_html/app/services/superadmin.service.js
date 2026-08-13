/**
 * ============================================
 * SUPER ADMIN SERVICE
 * Handles Super Admin API calls
 * ============================================
 */
app.factory('SuperAdminService', ['$http', function ($http) {

    var BASE_URL = API_CONFIG.GATEWAY_URL; // e.g. http://<host>:8080/api

    return {
        // Super Admin Login
        login: function (credentials) {
            return $http.post(BASE_URL + '/auth/superadmin/login', credentials);
        },

        // Get Clinic by Code (for URL-based login)
        getClinicByCode: function (code) {
            return $http.get(BASE_URL + '/auth/clinic-info', { params: { code: code } });
        },

        // Validate Clinic by Tenant ID (for 2-step login)
        validateClinicId: function (tenantId) {
            return $http.get(BASE_URL + '/auth/validate-clinic', { params: { tenantId: tenantId } });
        },

        // List all clinics
        getClinics: function () {
            return $http.get(BASE_URL + '/superadmin/clinics', {
                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('authToken') }
            });
        },

        // Get single clinic
        getClinic: function (tenantId) {
            return $http.get(BASE_URL + '/superadmin/clinics/' + tenantId, {
                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('authToken') }
            });
        },

        // Create clinic
        createClinic: function (clinicData) {
            return $http.post(BASE_URL + '/superadmin/clinics', clinicData, {
                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('authToken') }
            });
        },

        // Update clinic
        updateClinic: function (tenantId, clinicData) {
            return $http.put(BASE_URL + '/superadmin/clinics/' + tenantId, clinicData, {
                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('authToken') }
            });
        },

        // Toggle clinic status
        toggleClinicStatus: function (tenantId, active) {
            return $http.put(BASE_URL + '/superadmin/clinics/' + tenantId + '/status', null, {
                params: { active: active },
                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('authToken') }
            });
        },

        // Create admin for a clinic
        createClinicAdmin: function (tenantId, adminData) {
            return $http.post(BASE_URL + '/superadmin/clinics/' + tenantId + '/admin', adminData, {
                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('authToken') }
            });
        },

        // Renew clinic subscription
        renewClinicSubscription: function (tenantId, renewalData) {
            // using local mock logic if API does not exist, but let's assume API is called
            return $http.post(BASE_URL + '/superadmin/clinics/' + tenantId + '/renew', renewalData, {
                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('authToken') }
            });
        },

        // Send broadcast alert
        sendBroadcastAlert: function (alertData) {
            return $http.post(BASE_URL + '/superadmin/alerts/broadcast', alertData, {
                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('authToken') }
            });
        },

        // RBAC: Get all roles
        getRoles: function () {
            return $http.get(BASE_URL + '/superadmin/roles', {
                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('authToken') }
            });
        },

        // RBAC: Get all modules
        getModules: function () {
            return $http.get(BASE_URL + '/superadmin/modules', {
                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('authToken') }
            });
        },

        // RBAC: Get permissions for a role
        getRolePermissions: function (roleName) {
            return $http.get(BASE_URL + '/superadmin/role-permissions/' + roleName, {
                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('authToken') }
            });
        },

        // RBAC: Update permissions for a role
        updateRolePermissions: function (roleName, moduleCodes) {
            return $http.post(BASE_URL + '/superadmin/role-permissions/' + roleName, moduleCodes, {
                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('authToken') }
            });
        },

        // RBAC: Get users for a clinic
        getClinicUsers: function (tenantId) {
            return $http.get(BASE_URL + '/superadmin/clinics/' + tenantId + '/users', {
                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('authToken') }
            });
        },

        // RBAC: Get permissions for a specific user
        getUserPermissions: function (tenantId, userId) {
            return $http.get(BASE_URL + '/superadmin/clinics/' + tenantId + '/users/' + userId + '/permissions', {
                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('authToken') }
            });
        },

        // RBAC: Update permissions for a specific user
        updateUserPermissions: function (tenantId, userId, moduleCodes) {
            return $http.post(BASE_URL + '/superadmin/clinics/' + tenantId + '/users/' + userId + '/permissions', moduleCodes, {
                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('authToken') }
            });
        }
    };
}]);
