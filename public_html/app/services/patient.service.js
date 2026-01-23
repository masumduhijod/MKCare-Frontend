/**
 * ============================================
 * PATIENT SERVICE - COMPLETE
 * ============================================
 * All patient-related API calls
 */

app.factory('PatientService', ['$http', function($http) {
    
    var service = {};
    var baseUrl = API_CONFIG.GATEWAY_URL;
    
    /**
     * Register new patient
     */
    service.register = function(patientData) {
        return $http.post(baseUrl + API_CONFIG.ENDPOINTS.PATIENT.REGISTER, patientData);
    };
    
    /**
     * Get patient by PIN - ✅ USED IN QUEUE FOR PATIENT NAMES
     */
    service.getByPin = function(pinNumber) {
        var url = baseUrl + API_CONFIG.ENDPOINTS.PATIENT.GET_BY_PIN
            .replace('{pinNumber}', pinNumber);
        return $http.get(url);
    };
    
    /**
     * Get patient by ID
     */
    service.getById = function(patientId) {
        var url = baseUrl + API_CONFIG.ENDPOINTS.PATIENT.GET_BY_ID
            .replace('{patientId}', patientId);
        return $http.get(url);
    };
    
    /**
     * Get patient by contact number
     */
    service.getByContact = function(contactNumber) {
        var url = baseUrl + API_CONFIG.ENDPOINTS.PATIENT.GET_BY_CONTACT
            .replace('{contactNumber}', contactNumber);
        return $http.get(url);
    };
    
    /**
     * Update patient
     */
    service.update = function(pinNumber, patientData) {
        var url = baseUrl + API_CONFIG.ENDPOINTS.PATIENT.UPDATE
            .replace('{pinNumber}', pinNumber);
        return $http.put(url, patientData);
    };
    
    /**
     * Delete patient
     */
    service.delete = function(pinNumber, reason) {
        var url = baseUrl + API_CONFIG.ENDPOINTS.PATIENT.DELETE
            .replace('{pinNumber}', pinNumber);
        if (reason) {
            url += '?reason=' + encodeURIComponent(reason);
        }
        return $http.delete(url);
    };
    
    /**
     * Search patients
     */
    service.search = function(query) {
        var url = baseUrl + API_CONFIG.ENDPOINTS.PATIENT.SEARCH + '?query=' + query;
        return $http.get(url);
    };
    
    /**
     * Get recent patients
     */
    service.getRecent = function(limit) {
        limit = limit || 10;
        var url = baseUrl + API_CONFIG.ENDPOINTS.PATIENT.GET_RECENT + '?limit=' + limit;
        return $http.get(url);
    };
    
    /**
     * Get active patients
     */
    service.getActive = function() {
        return $http.get(baseUrl + API_CONFIG.ENDPOINTS.PATIENT.GET_ACTIVE);
    };
    
    /**
     * Get patient count
     */
    service.getCount = function() {
        return $http.get(baseUrl + API_CONFIG.ENDPOINTS.PATIENT.COUNT);
    };
    
    /**
     * Check if PIN exists
     */
    service.existsByPin = function(pinNumber) {
        var url = baseUrl + API_CONFIG.ENDPOINTS.PATIENT.EXISTS_BY_PIN
            .replace('{pinNumber}', pinNumber);
        return $http.get(url);
    };
    
    /**
     * Check if contact exists
     */
    service.existsByContact = function(contactNumber) {
        var url = baseUrl + API_CONFIG.ENDPOINTS.PATIENT.EXISTS_BY_CONTACT
            .replace('{contactNumber}', contactNumber);
        return $http.get(url);
    };
    
    /**
     * Get medical history
     */
    service.getMedicalHistory = function(pinNumber) {
        var url = baseUrl + API_CONFIG.ENDPOINTS.PATIENT.GET_MEDICAL_HISTORY
            .replace('{pinNumber}', pinNumber);
        return $http.get(url);
    };
    
    /**
     * Update medical history
     */
    service.updateMedicalHistory = function(pinNumber, historyData) {
        var url = baseUrl + API_CONFIG.ENDPOINTS.PATIENT.UPDATE_MEDICAL_HISTORY
            .replace('{pinNumber}', pinNumber);
        return $http.put(url, historyData);
    };
    
    /**
     * ✅ ALIAS FOR getByPin - FOR COMPATIBILITY
     */
    service.getPatientByPIN = function(pinNumber) {
        return service.getByPin(pinNumber);
    };
    
    return service;
}]);