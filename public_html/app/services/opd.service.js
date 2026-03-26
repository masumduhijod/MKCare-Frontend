/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */



// ============ OPD SERVICE ============
// File: app/services/opd.service.js

app.service('OPDService', ['$http', function ($http) {
        var baseUrl = API_CONFIG.GATEWAY_URL;

        // ============ QUEUE MANAGEMENT ============

        /**
         * Add patient to OPD queue
         */
        this.addToQueue = function (queueData) {
            return $http.post(baseUrl + API_CONFIG.ENDPOINTS.OPD_QUEUE.ADD, queueData);
        };

        /**
         * Get queue for doctor on specific date
         */
        this.getQueueByDoctorDate = function (doctorId, date) {
            var url = API_CONFIG.ENDPOINTS.OPD_QUEUE.GET_BY_DOCTOR_DATE
                    .replace('{doctorId}', doctorId)
                    .replace('{date}', date);
            return $http.get(baseUrl + url);
        };

        /**
         * Start consultation for queue entry
         */
        this.startConsultation = function (queueId) {
            var url = API_CONFIG.ENDPOINTS.OPD_QUEUE.START_CONSULTATION
                    .replace('{queueId}', queueId);
            return $http.put(baseUrl + url);
        };

        /**
         * Complete consultation for queue entry
         */
        this.completeQueue = function (queueId) {
            var url = API_CONFIG.ENDPOINTS.OPD_QUEUE.COMPLETE
                    .replace('{queueId}', queueId);
            return $http.put(baseUrl + url);
        };

        /**
         * Call next patient in queue
         */
        this.callNextPatient = function (doctorId, date) {
            var url = API_CONFIG.ENDPOINTS.OPD_QUEUE.CALL_NEXT
                    .replace('{doctorId}', doctorId)
                    .replace('{date}', date);
            return $http.put(baseUrl + url);
        };

        // ============ CONSULTATION MANAGEMENT ============

        /**
         * Create new consultation
         */
        this.createConsultation = function (consultationData) {
            return $http.post(baseUrl + API_CONFIG.ENDPOINTS.CONSULTATION.CREATE, consultationData);
        };
        /**
         * Update consultation
         */
this.updateConsultation = function(consultationId, consultationData) {
            var url = API_CONFIG.ENDPOINTS.CONSULTATION.UPDATE
                    .replace('{consultationId}', consultationId);
            return $http.put(baseUrl + url, consultationData);
        };

        /**
         * Get consultation by ID
         */
        this.getConsultationById = function (consultationId) {
            var url = API_CONFIG.ENDPOINTS.CONSULTATION.GET_BY_ID
                    .replace('{consultationId}', consultationId);
            return $http.get(baseUrl + url);
        };

        /**
         * Get consultations by patient PIN
         */
        this.getConsultationsByPatient = function (pinNumber) {
            var url = API_CONFIG.ENDPOINTS.CONSULTATION.GET_BY_PATIENT
                    .replace('{pinNumber}', pinNumber);
            return $http.get(baseUrl + url);
        };

        /**
         * Complete consultation
         */
        this.completeConsultation = function (consultationId) {
            var url = API_CONFIG.ENDPOINTS.CONSULTATION.COMPLETE
                    .replace('{consultationId}', consultationId);
            return $http.put(baseUrl + url);
        };

        // ============ PRESCRIPTION MANAGEMENT ============

        /**
         * Create prescription
         */
        this.createPrescription = function (prescriptionData) {
            return $http.post(baseUrl + API_CONFIG.ENDPOINTS.PRESCRIPTION.CREATE, prescriptionData);
        };

        /**
         * Get prescription by ID
         */
        this.getPrescriptionById = function (prescriptionId) {
            var url = API_CONFIG.ENDPOINTS.PRESCRIPTION.GET_BY_ID
                    .replace('{prescriptionId}', prescriptionId);
            return $http.get(baseUrl + url);
        };

        /**
         * Get prescriptions by patient PIN
         */
        this.getPrescriptionsByPatient = function (pinNumber) {
            var url = API_CONFIG.ENDPOINTS.PRESCRIPTION.GET_BY_PATIENT
                    .replace('{pinNumber}', pinNumber);
            return $http.get(baseUrl + url);
        };

        // ============ UTILITY FUNCTIONS ============

        /**
         * Get current date in YYYY-MM-DD format
         */
        this.getCurrentDate = function () {
            var today = new Date();
            var year = today.getFullYear();
            var month = ('0' + (today.getMonth() + 1)).slice(-2);
            var day = ('0' + today.getDate()).slice(-2);
            return year + '-' + month + '-' + day;
        };

        /**
         * Format time object to HH:MM string
         */
        this.formatTime = function (timeObj) {
            if (!timeObj)
                return '';
            var hour = ('0' + timeObj.hour).slice(-2);
            var minute = ('0' + timeObj.minute).slice(-2);
            return hour + ':' + minute;
        };

        /**
         * Calculate waiting time in minutes
         */
        this.calculateWaitingTime = function (checkInTime) {
            if (!checkInTime)
                return 0;
            var checkIn = new Date(checkInTime);
            var now = new Date();
            var diff = now - checkIn;
            return Math.floor(diff / 60000); // Convert to minutes
        };
        /**
         * Get prescription by Consultation ID
         */
this.getPrescriptionByConsultationId = function(consultationId) {
            var url = API_CONFIG.ENDPOINTS.PRESCRIPTION.GET_BY_CONSULTATION
                    .replace('{consultationId}', consultationId);
            return $http.get(baseUrl + url);
        };
        /**
         * Update prescription
         */
        this.updatePrescription = function (prescriptionData) {
            return $http.put(
                    baseUrl + '/opd/prescriptions/update/' + prescriptionData.prescriptionId,
                    prescriptionData
                    );
        };


    }]);
