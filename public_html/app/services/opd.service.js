/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

///**
// * OPD Service - OPD Service (Port 8087)
// * Queue, Consultation, and Prescription Management
// */
//
//app.factory('OPDService', ['$http', '$q', function($http, $q) {
//    
//    var service = {};
//    var baseUrl = API_CONFIG.GATEWAY_URL;
//    
//    // ============ Queue Management ============
//    
//    /**
//     * Add to Queue - POST /opd/queue/add
//     * Request: { appointmentId, cvrNumber, pinNumber, doctorId, tokenNumber, priority }
//     */
//    service.addToQueue = function(queueData) {
//        return $http.post(baseUrl + API_CONFIG.ENDPOINTS.OPD_QUEUE.ADD, queueData);
//    };
//    
//    /**
//     * Get Queue by Doctor and Date - GET /opd/queue/doctor/{doctorId}/date/{date}
//     */
//    service.getQueue = function(doctorId, date) {
//        var url = baseUrl + API_CONFIG.ENDPOINTS.OPD_QUEUE.GET_BY_DOCTOR_DATE
//            .replace('{doctorId}', doctorId)
//            .replace('{date}', date);
//        return $http.get(url);
//    };
//    
//    /**
//     * Start Consultation - PUT /opd/queue/{queueId}/start-consultation
//     */
//    service.startQueueConsultation = function(queueId) {
//        var url = baseUrl + API_CONFIG.ENDPOINTS.OPD_QUEUE.START_CONSULTATION.replace('{queueId}', queueId);
//        return $http.put(url);
//    };
//    
//    /**
//     * Complete Queue - PUT /opd/queue/{queueId}/complete
//     */
//    service.completeQueue = function(queueId) {
//        var url = baseUrl + API_CONFIG.ENDPOINTS.OPD_QUEUE.COMPLETE.replace('{queueId}', queueId);
//        return $http.put(url);
//    };
//    
//    /**
//     * Call Next Patient - PUT /opd/queue/doctor/{doctorId}/date/{date}/call-next
//     */
//    service.callNext = function(doctorId, date) {
//        var url = baseUrl + API_CONFIG.ENDPOINTS.OPD_QUEUE.CALL_NEXT
//            .replace('{doctorId}', doctorId)
//            .replace('{date}', date);
//        return $http.put(url);
//    };
//    
//    // ============ Consultation Management ============
//    
//    /**
//     * Create Consultation - POST /opd/consultations/create
//     * Request: { appointmentId, cvrNumber, pinNumber, doctorId, chiefComplaint, 
//     *            presentIllness, examinationFindings, diagnosis, treatmentPlan, 
//     *            subjective, objective, assessment, plan, followUpRequired, 
//     *            followUpDate, followUpInstructions }
//     */
//    service.createConsultation = function(consultationData) {
//        return $http.post(baseUrl + API_CONFIG.ENDPOINTS.CONSULTATION.CREATE, consultationData);
//    };
//    
//    /**
//     * Get Consultation by ID - GET /opd/consultations/{consultationId}
//     */
//    service.getConsultation = function(consultationId) {
//        var url = baseUrl + API_CONFIG.ENDPOINTS.CONSULTATION.GET_BY_ID.replace('{consultationId}', consultationId);
//        return $http.get(url);
//    };
//    
//    /**
//     * Get Patient Consultations - GET /opd/consultations/patient/{pinNumber}
//     */
//    service.getPatientConsultations = function(pinNumber) {
//        var url = baseUrl + API_CONFIG.ENDPOINTS.CONSULTATION.GET_BY_PATIENT.replace('{pinNumber}', pinNumber);
//        return $http.get(url);
//    };
//    
//    /**
//     * Complete Consultation - PUT /opd/consultations/{consultationId}/complete
//     */
//    service.completeConsultation = function(consultationId) {
//        var url = baseUrl + API_CONFIG.ENDPOINTS.CONSULTATION.COMPLETE.replace('{consultationId}', consultationId);
//        return $http.put(url);
//    };
//    
//    // ============ Prescription Management ============
//    
//    /**
//     * Create Prescription - POST /opd/prescriptions/create
//     * Request: { consultationId, consultationNumber, pinNumber, doctorId, validityDays, 
//     *            instructions, items: [{ medicineName, dosage, frequency, duration, 
//     *            quantity, instructions, morning, afternoon, evening, night, 
//     *            beforeFood, afterFood }] }
//     */
//    service.createPrescription = function(prescriptionData) {
//        return $http.post(baseUrl + API_CONFIG.ENDPOINTS.PRESCRIPTION.CREATE, prescriptionData);
//    };
//    
//    /**
//     * Get Prescription by ID - GET /opd/prescriptions/{prescriptionId}
//     */
//    service.getPrescription = function(prescriptionId) {
//        var url = baseUrl + API_CONFIG.ENDPOINTS.PRESCRIPTION.GET_BY_ID.replace('{prescriptionId}', prescriptionId);
//        return $http.get(url);
//    };
//    
//    /**
//     * Get Patient Prescriptions - GET /opd/prescriptions/patient/{pinNumber}
//     */
//    service.getPatientPrescriptions = function(pinNumber) {
//        var url = baseUrl + API_CONFIG.ENDPOINTS.PRESCRIPTION.GET_BY_PATIENT.replace('{pinNumber}', pinNumber);
//        return $http.get(url);
//    };
//    
//    return service;
//}]);


// ============ OPD SERVICE ============
// File: app/services/opd.service.js

app.service('OPDService', ['$http', function($http) {
    var baseUrl = API_CONFIG.GATEWAY_URL;
    
    // ============ QUEUE MANAGEMENT ============
    
    /**
     * Add patient to OPD queue
     */
    this.addToQueue = function(queueData) {
        return $http.post(baseUrl + API_CONFIG.ENDPOINTS.OPD_QUEUE.ADD, queueData);
    };
    
    /**
     * Get queue for doctor on specific date
     */
    this.getQueueByDoctorDate = function(doctorId, date) {
        var url = API_CONFIG.ENDPOINTS.OPD_QUEUE.GET_BY_DOCTOR_DATE
            .replace('{doctorId}', doctorId)
            .replace('{date}', date);
        return $http.get(baseUrl + url);
    };
    
    /**
     * Start consultation for queue entry
     */
    this.startConsultation = function(queueId) {
        var url = API_CONFIG.ENDPOINTS.OPD_QUEUE.START_CONSULTATION
            .replace('{queueId}', queueId);
        return $http.put(baseUrl + url);
    };
    
    /**
     * Complete consultation for queue entry
     */
    this.completeQueue = function(queueId) {
        var url = API_CONFIG.ENDPOINTS.OPD_QUEUE.COMPLETE
            .replace('{queueId}', queueId);
        return $http.put(baseUrl + url);
    };
    
    /**
     * Call next patient in queue
     */
    this.callNextPatient = function(doctorId, date) {
        var url = API_CONFIG.ENDPOINTS.OPD_QUEUE.CALL_NEXT
            .replace('{doctorId}', doctorId)
            .replace('{date}', date);
        return $http.put(baseUrl + url);
    };
    
    // ============ CONSULTATION MANAGEMENT ============
    
    /**
     * Create new consultation
     */
    this.createConsultation = function(consultationData) {
        return $http.post(baseUrl + API_CONFIG.ENDPOINTS.CONSULTATION.CREATE, consultationData);
    };
    
    /**
     * Get consultation by ID
     */
    this.getConsultationById = function(consultationId) {
        var url = API_CONFIG.ENDPOINTS.CONSULTATION.GET_BY_ID
            .replace('{consultationId}', consultationId);
        return $http.get(baseUrl + url);
    };
    
    /**
     * Get consultations by patient PIN
     */
    this.getConsultationsByPatient = function(pinNumber) {
        var url = API_CONFIG.ENDPOINTS.CONSULTATION.GET_BY_PATIENT
            .replace('{pinNumber}', pinNumber);
        return $http.get(baseUrl + url);
    };
    
    /**
     * Complete consultation
     */
    this.completeConsultation = function(consultationId) {
        var url = API_CONFIG.ENDPOINTS.CONSULTATION.COMPLETE
            .replace('{consultationId}', consultationId);
        return $http.put(baseUrl + url);
    };
    
    // ============ PRESCRIPTION MANAGEMENT ============
    
    /**
     * Create prescription
     */
    this.createPrescription = function(prescriptionData) {
        return $http.post(baseUrl + API_CONFIG.ENDPOINTS.PRESCRIPTION.CREATE, prescriptionData);
    };
    
    /**
     * Get prescription by ID
     */
    this.getPrescriptionById = function(prescriptionId) {
        var url = API_CONFIG.ENDPOINTS.PRESCRIPTION.GET_BY_ID
            .replace('{prescriptionId}', prescriptionId);
        return $http.get(baseUrl + url);
    };
    
    /**
     * Get prescriptions by patient PIN
     */
    this.getPrescriptionsByPatient = function(pinNumber) {
        var url = API_CONFIG.ENDPOINTS.PRESCRIPTION.GET_BY_PATIENT
            .replace('{pinNumber}', pinNumber);
        return $http.get(baseUrl + url);
    };
    
    // ============ UTILITY FUNCTIONS ============
    
    /**
     * Get current date in YYYY-MM-DD format
     */
    this.getCurrentDate = function() {
        var today = new Date();
        var year = today.getFullYear();
        var month = ('0' + (today.getMonth() + 1)).slice(-2);
        var day = ('0' + today.getDate()).slice(-2);
        return year + '-' + month + '-' + day;
    };
    
    /**
     * Format time object to HH:MM string
     */
    this.formatTime = function(timeObj) {
        if (!timeObj) return '';
        var hour = ('0' + timeObj.hour).slice(-2);
        var minute = ('0' + timeObj.minute).slice(-2);
        return hour + ':' + minute;
    };
    
    /**
     * Calculate waiting time in minutes
     */
    this.calculateWaitingTime = function(checkInTime) {
        if (!checkInTime) return 0;
        var checkIn = new Date(checkInTime);
        var now = new Date();
        var diff = now - checkIn;
        return Math.floor(diff / 60000); // Convert to minutes
    };
}]);
