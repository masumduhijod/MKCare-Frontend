/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/**
 * Appointment Service - Appointment Service (Port 8083)
 * Appointment and Slot Management
 */

app.factory('AppointmentService', ['$http', '$q', function($http, $q) {
    
    var service = {};
    var baseUrl = API_CONFIG.GATEWAY_URL;
    
    // ============ Appointment Management ============
    
    /**
     * Book Appointment - POST /appointments/book
     * Request: { cvrNumber, pinNumber, doctorId, appointmentDate, appointmentTime, 
     *            slotId, appointmentType, symptoms, notes, createdBy }
     */
    service.book = function(appointmentData) {
        return $http.post(baseUrl + API_CONFIG.ENDPOINTS.APPOINTMENT.BOOK, appointmentData);
    };
    
    /**
     * Get Appointment by ID - GET /appointments/{appointmentId}
     */
    service.getById = function(appointmentId) {
        var url = baseUrl + API_CONFIG.ENDPOINTS.APPOINTMENT.GET_BY_ID.replace('{appointmentId}', appointmentId);
        return $http.get(url);
    };
    
    /**
     * Cancel Appointment - POST /appointments/cancel
     * Request: { appointmentId, reason, cancelledBy }
     */
    service.cancel = function(cancelData) {
        return $http.post(baseUrl + API_CONFIG.ENDPOINTS.APPOINTMENT.CANCEL, cancelData);
    };
    
    /**
     * Reschedule Appointment - POST /appointments/reschedule
     * Request: { appointmentId, newDate, newTime, newSlotId, reason, rescheduledBy }
     */
    service.reschedule = function(rescheduleData) {
        return $http.post(baseUrl + API_CONFIG.ENDPOINTS.APPOINTMENT.RESCHEDULE, rescheduleData);
    };
    
    /**
     * Check-in - PUT /appointments/{appointmentId}/checkin
     */
    service.checkin = function(appointmentId) {
        var url = baseUrl + API_CONFIG.ENDPOINTS.APPOINTMENT.CHECKIN.replace('{appointmentId}', appointmentId);
        return $http.put(url);
    };
    
    /**
     * Start Consultation - PUT /appointments/{appointmentId}/start-consultation
     */
    service.startConsultation = function(appointmentId) {
        var url = baseUrl + API_CONFIG.ENDPOINTS.APPOINTMENT.START_CONSULTATION.replace('{appointmentId}', appointmentId);
        return $http.put(url);
    };
    
    /**
     * Complete Consultation - PUT /appointments/{appointmentId}/complete-consultation
     */
    service.completeConsultation = function(appointmentId) {
        var url = baseUrl + API_CONFIG.ENDPOINTS.APPOINTMENT.COMPLETE_CONSULTATION.replace('{appointmentId}', appointmentId);
        return $http.put(url);
    };
    
    /**
     * Mark No-Show - PUT /appointments/{appointmentId}/no-show
     */
    service.noShow = function(appointmentId) {
        var url = baseUrl + API_CONFIG.ENDPOINTS.APPOINTMENT.NO_SHOW.replace('{appointmentId}', appointmentId);
        return $http.put(url);
    };
    
    /**
     * Get Today's Appointments - GET /appointments/today
     */
    service.getToday = function() {
        return $http.get(baseUrl + API_CONFIG.ENDPOINTS.APPOINTMENT.GET_TODAY);
    };
    
    /**
     * Get Appointments by Status - GET /appointments/status/{status}
     */
    service.getByStatus = function(status) {
        var url = baseUrl + API_CONFIG.ENDPOINTS.APPOINTMENT.GET_BY_STATUS.replace('{status}', status);
        return $http.get(url);
    };
    
    /**
     * Search Appointments - GET /appointments/search?query=
     */
    service.search = function(query) {
        var url = baseUrl + API_CONFIG.ENDPOINTS.APPOINTMENT.SEARCH + '?query=' + query;
        return $http.get(url);
    };
    
    /**
     * Get Appointments by Date Range - GET /appointments/range?startDate=&endDate=
     */
    service.getByDateRange = function(startDate, endDate) {
        var url = baseUrl + API_CONFIG.ENDPOINTS.APPOINTMENT.GET_BY_DATE_RANGE + 
                  '?startDate=' + startDate + '&endDate=' + endDate;
        return $http.get(url);
    };
    
    /**
     * Get Patient Appointments - GET /appointments/patient/{pinNumber}
     */
    service.getByPatient = function(pinNumber) {
        var url = baseUrl + API_CONFIG.ENDPOINTS.APPOINTMENT.GET_BY_PATIENT.replace('{pinNumber}', pinNumber);
        return $http.get(url);
    };
    
    /**
     * Get Upcoming Appointments - GET /appointments/patient/{pinNumber}/upcoming
     */
    service.getUpcoming = function(pinNumber) {
        var url = baseUrl + API_CONFIG.ENDPOINTS.APPOINTMENT.GET_UPCOMING.replace('{pinNumber}', pinNumber);
        return $http.get(url);
    };
    
    /**
     * Get Appointments by Doctor and Date - GET /appointments/doctor/{doctorId}/date/{date}
     */
    service.getByDoctorDate = function(doctorId, date) {
        var url = baseUrl + API_CONFIG.ENDPOINTS.APPOINTMENT.GET_BY_DOCTOR_DATE
            .replace('{doctorId}', doctorId)
            .replace('{date}', date);
        return $http.get(url);
    };
    
    /**
     * Check if Appointment Exists - GET /appointments/exists/{appointmentId}
     */
    service.exists = function(appointmentId) {
        var url = baseUrl + API_CONFIG.ENDPOINTS.APPOINTMENT.EXISTS.replace('{appointmentId}', appointmentId);
        return $http.get(url);
    };
    
    // ============ Slot Management ============
    
    /**
     * Generate Slots - POST /slots/generate
     * Request: { doctorId, date }
     */
    service.generateSlots = function(slotData) {
        return $http.post(baseUrl + API_CONFIG.ENDPOINTS.SLOT.GENERATE, slotData);
    };
    
    /**
     * Get Slots by Doctor and Date - GET /slots/doctor/{doctorId}/date/{date}
     */
    service.getSlots = function(doctorId, date) {
        var url = baseUrl + API_CONFIG.ENDPOINTS.SLOT.GET_BY_DOCTOR_DATE
            .replace('{doctorId}', doctorId)
            .replace('{date}', date);
        return $http.get(url);
    };
    
    /**
     * Get Available Slots - GET /slots/doctor/{doctorId}/date/{date}/available
     */
    service.getAvailableSlots = function(doctorId, date) {
        var url = baseUrl + API_CONFIG.ENDPOINTS.SLOT.GET_AVAILABLE
            .replace('{doctorId}', doctorId)
            .replace('{date}', date);
        return $http.get(url);
    };
    
    /**
     * Get Slot Availability Summary - GET /slots/doctor/{doctorId}/date/{date}/availability
     */
    service.getSlotAvailability = function(doctorId, date) {
        var url = baseUrl + API_CONFIG.ENDPOINTS.SLOT.GET_AVAILABILITY
            .replace('{doctorId}', doctorId)
            .replace('{date}', date);
        return $http.get(url);
    };
    
    /**
     * Mark Slot Unavailable - PUT /slots/{slotId}/unavailable
     */
    service.markSlotUnavailable = function(slotId) {
        var url = baseUrl + API_CONFIG.ENDPOINTS.SLOT.MARK_UNAVAILABLE.replace('{slotId}', slotId);
        return $http.put(url);
    };
    
    /**
     * Release Slot - PUT /slots/{slotId}/release
     */
    service.releaseSlot = function(slotId) {
        var url = baseUrl + API_CONFIG.ENDPOINTS.SLOT.RELEASE.replace('{slotId}', slotId);
        return $http.put(url);
    };
    
    return service;
}]);