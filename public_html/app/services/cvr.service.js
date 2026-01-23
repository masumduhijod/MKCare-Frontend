/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/**
 * CVR Service - CVR Service (Port 8085)
 * Clinical Visit Record Management
 */

app.factory('CVRService', ['$http', '$q', function($http, $q) {
    
    var service = {};
    var baseUrl = API_CONFIG.GATEWAY_URL;
    
    /**
     * Create CVR - POST /cvr/create
     * Request: { pinNumber, visitType, chiefComplaint, symptoms, department, 
     *            doctorId, createdBy, visitDate, visitTime }
     */
    service.create = function(cvrData) {
        return $http.post(baseUrl + API_CONFIG.ENDPOINTS.CVR.CREATE, cvrData);
    };
    
    /**
     * Get CVR by CVR Number - GET /cvr/{cvrNumber}
     */
    service.getByCVRNumber = function(cvrNumber) {
        var url = baseUrl + API_CONFIG.ENDPOINTS.CVR.GET_BY_CVR_NUMBER.replace('{cvrNumber}', cvrNumber);
        return $http.get(url);
    };
    
    /**
     * Delete CVR - DELETE /cvr/{cvrNumber}?reason=
     */
    service.delete = function(cvrNumber, reason) {
        var url = baseUrl + API_CONFIG.ENDPOINTS.CVR.DELETE.replace('{cvrNumber}', cvrNumber);
        if (reason) {
            url += '?reason=' + encodeURIComponent(reason);
        }
        return $http.delete(url);
    };
    
    /**
     * Update Status - PUT /cvr/{cvrNumber}/status?status=
     */
    service.updateStatus = function(cvrNumber, status) {
        var url = baseUrl + API_CONFIG.ENDPOINTS.CVR.UPDATE_STATUS.replace('{cvrNumber}', cvrNumber);
        url += '?status=' + status;
        return $http.put(url);
    };
    
    /**
     * Check-in - PUT /cvr/{cvrNumber}/checkin
     */
    service.checkin = function(cvrNumber) {
        var url = baseUrl + API_CONFIG.ENDPOINTS.CVR.CHECKIN.replace('{cvrNumber}', cvrNumber);
        return $http.put(url);
    };
    
    /**
     * Assign Doctor - PUT /cvr/{cvrNumber}/assign-doctor?doctorId=
     */
    service.assignDoctor = function(cvrNumber, doctorId) {
        var url = baseUrl + API_CONFIG.ENDPOINTS.CVR.ASSIGN_DOCTOR.replace('{cvrNumber}', cvrNumber);
        url += '?doctorId=' + doctorId;
        return $http.put(url);
    };
    
    /**
     * Start Consultation - PUT /cvr/{cvrNumber}/start-consultation
     */
    service.startConsultation = function(cvrNumber) {
        var url = baseUrl + API_CONFIG.ENDPOINTS.CVR.START_CONSULTATION.replace('{cvrNumber}', cvrNumber);
        return $http.put(url);
    };
    
    /**
     * Complete Consultation - PUT /cvr/{cvrNumber}/complete-consultation
     */
    service.completeConsultation = function(cvrNumber) {
        var url = baseUrl + API_CONFIG.ENDPOINTS.CVR.COMPLETE_CONSULTATION.replace('{cvrNumber}', cvrNumber);
        return $http.put(url);
    };
    
    /**
     * Get Today's CVRs - GET /cvr/today
     */
//    service.getToday = function() {
//        return $http.get(baseUrl + API_CONFIG.ENDPOINTS.CVR.GET_TODAY);
//    };
    
    /**
     * Search CVRs - GET /cvr/search?query=
     */
    service.search = function(query) {
        var url = baseUrl + API_CONFIG.ENDPOINTS.CVR.SEARCH + '?query=' + query;
        return $http.get(url);
    };
    
    /**
     * Get Recent CVRs - GET /cvr/recent?limit=
     */
    service.getRecent = function(limit) {
        limit = limit || 10;
        var url = baseUrl + API_CONFIG.ENDPOINTS.CVR.GET_RECENT + '?limit=' + limit;
        return $http.get(url);
    };
    
    /**
     * Get CVRs by Date - GET /cvr/date/{date}
     */
    service.getByDate = function(date) {
        var url = baseUrl + API_CONFIG.ENDPOINTS.CVR.GET_BY_DATE.replace('{date}', date);
        return $http.get(url);
    };
    
    /**
     * Get CVRs by Doctor and Date - GET /cvr/doctor/{doctorId}/date/{date}
     */
    service.getByDoctorDate = function(doctorId, date) {
        var url = baseUrl + API_CONFIG.ENDPOINTS.CVR.GET_BY_DOCTOR_DATE
            .replace('{doctorId}', doctorId)
            .replace('{date}', date);
        return $http.get(url);
    };
    
//    /**
//     * Get Patient History - GET /cvr/patient/{pinNumber}/history
//     */
//    service.getPatientHistory = function(pinNumber) {
//        var url = baseUrl + API_CONFIG.ENDPOINTS.CVR.GET_PATIENT_HISTORY.replace('{pinNumber}', pinNumber);
//        return $http.get(url);
//    };
    
    /**
     * Get Patient Visit Count - GET /cvr/patient/{pinNumber}/count
     */
    service.getPatientCount = function(pinNumber) {
        var url = baseUrl + API_CONFIG.ENDPOINTS.CVR.GET_PATIENT_COUNT.replace('{pinNumber}', pinNumber);
        return $http.get(url);
    };
    
    /**
     * Check if CVR Exists - GET /cvr/exists/{cvrNumber}
     */
    service.exists = function(cvrNumber) {
        var url = baseUrl + API_CONFIG.ENDPOINTS.CVR.EXISTS.replace('{cvrNumber}', cvrNumber);
        return $http.get(url);
    };
    
    /**
     * Record Vitals - POST /cvr/vitals/record
     * Request: { cvrNumber, temperatureF, bloodPressure, pulseRate, respiratoryRate, 
     *            spo2Percentage, weightKg, heightCm, recordedBy }
     */
    service.recordVitals = function(vitalsData) {
        return $http.post(baseUrl + API_CONFIG.ENDPOINTS.CVR.RECORD_VITALS, vitalsData);
    };
    
        // Get patient CVR history
        service.getPatientHistory = function (pinNumber) {
            var url = baseUrl + API_CONFIG.ENDPOINTS.CVR.GET_PATIENT_HISTORY
                    .replace('{pinNumber}', pinNumber);
            return $http.get(url);
        };

// Get today's CVRs
        service.getToday = function () {
            var url = baseUrl + API_CONFIG.ENDPOINTS.CVR.GET_TODAY;
            return $http.get(url);
        };
    
    /**
     * Get Vitals - GET /cvr/{cvrNumber}/vitals
     */
    service.getVitals = function(cvrNumber) {
        var url = baseUrl + API_CONFIG.ENDPOINTS.CVR.GET_VITALS.replace('{cvrNumber}', cvrNumber);
        return $http.get(url);
    };
    
        /**
         * Get CVR by Appointment ID - GET /cvr/by-appointment/{appointmentId}
         */
        service.getByAppointmentId = function (appointmentId) {
            var url = baseUrl + API_CONFIG.ENDPOINTS.CVR.GET_BY_APPOINTMENT_ID
                    .replace('{appointmentId}', appointmentId);
            return $http.get(url);
        };

    
    return service;
}]);