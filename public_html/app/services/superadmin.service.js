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
        }
    };
}]);
