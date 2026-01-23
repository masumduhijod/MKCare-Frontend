/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


///**
// * Doctor Service - Doctor Service (Port 8086)
// * Doctor and Schedule Management
// */
//
//app.factory('DoctorService', ['$http', '$q', function($http, $q) {
//    
//    var service = {};
//    var baseUrl = API_CONFIG.GATEWAY_URL;
//    
//    // ============ Doctor Management ============
//    
//    /**
//     * Register Doctor - POST /doctors/register
//     * Request: { firstName, lastName, specialization, qualification, experienceYears, 
//     *            department, contactNumber, email, licenseNumber, registrationNumber, 
//     *            consultationFee, followUpFee, availableForOPD, availableForEmergency, 
//     *            photoUrl, bio, languagesSpoken, roomNumber, createdBy }
//     */
//    service.register = function(doctorData) {
//        return $http.post(baseUrl + API_CONFIG.ENDPOINTS.DOCTOR.REGISTER, doctorData);
//    };
//    
//    /**
//     * Get Doctor by ID - GET /doctors/{doctorId}
//     */
//    service.getById = function(doctorId) {
//        var url = baseUrl + API_CONFIG.ENDPOINTS.DOCTOR.GET_BY_ID.replace('{doctorId}', doctorId);
//        return $http.get(url);
//    };
//    
//    /**
//     * Update Doctor - PUT /doctors/{doctorId}
//     */
//    service.update = function(doctorId, doctorData) {
//        var url = baseUrl + API_CONFIG.ENDPOINTS.DOCTOR.UPDATE.replace('{doctorId}', doctorId);
//        return $http.put(url, doctorData);
//    };
//    
//    /**
//     * Delete Doctor - DELETE /doctors/{doctorId}
//     */
//    service.delete = function(doctorId) {
//        var url = baseUrl + API_CONFIG.ENDPOINTS.DOCTOR.DELETE.replace('{doctorId}', doctorId);
//        return $http.delete(url);
//    };
//    
//    /**
//     * Update Status - PUT /doctors/{doctorId}/status?status=
//     */
//    service.updateStatus = function(doctorId, status) {
//        var url = baseUrl + API_CONFIG.ENDPOINTS.DOCTOR.UPDATE_STATUS.replace('{doctorId}', doctorId);
//        url += '?status=' + status;
//        return $http.put(url);
//    };
//    
//    /**
//     * Set On Leave - PUT /doctors/{doctorId}/on-leave
//     */
//    service.setOnLeave = function(doctorId) {
//        var url = baseUrl + API_CONFIG.ENDPOINTS.DOCTOR.SET_ON_LEAVE.replace('{doctorId}', doctorId);
//        return $http.put(url);
//    };
//    
//    /**
//     * Set Available - PUT /doctors/{doctorId}/available
//     */
//    service.setAvailable = function(doctorId) {
//        var url = baseUrl + API_CONFIG.ENDPOINTS.DOCTOR.SET_AVAILABLE.replace('{doctorId}', doctorId);
//        return $http.put(url);
//    };
//    
//    /**
//     * Search Doctors - GET /doctors/search?name=
//     */
//    service.search = function(name) {
//        var url = baseUrl + API_CONFIG.ENDPOINTS.DOCTOR.SEARCH + '?name=' + name;
//        return $http.get(url);
//    };
//    
//    /**
//     * Get Active Doctors - GET /doctors/active
//     */
//    service.getActive = function() {
//        return $http.get(baseUrl + API_CONFIG.ENDPOINTS.DOCTOR.GET_ACTIVE);
//    };
//    
//    /**
//     * Get Available Doctors - GET /doctors/available
//     */
//    service.getAvailable = function() {
//        return $http.get(baseUrl + API_CONFIG.ENDPOINTS.DOCTOR.GET_AVAILABLE);
//    };
//    
//    /**
//     * Get Doctors by Specialization - GET /doctors/specialization/{specialization}
//     */
//    service.getBySpecialization = function(specialization) {
//        var url = baseUrl + API_CONFIG.ENDPOINTS.DOCTOR.GET_BY_SPECIALIZATION.replace('{specialization}', specialization);
//        return $http.get(url);
//    };
//    
//    /**
//     * Get Doctors by Department - GET /doctors/department/{department}
//     */
//    service.getByDepartment = function(department) {
//        var url = baseUrl + API_CONFIG.ENDPOINTS.DOCTOR.GET_BY_DEPARTMENT.replace('{department}', department);
//        return $http.get(url);
//    };
//    
//    /**
//     * Get Available Doctors by Specialization - GET /doctors/available/specialization/{specialization}
//     */
//    service.getAvailableBySpecialization = function(specialization) {
//        var url = baseUrl + API_CONFIG.ENDPOINTS.DOCTOR.GET_AVAILABLE_BY_SPECIALIZATION.replace('{specialization}', specialization);
//        return $http.get(url);
//    };
//    
//    /**
//     * Get Available Doctors by Department - GET /doctors/available/department/{department}
//     */
//    service.getAvailableByDepartment = function(department) {
//        var url = baseUrl + API_CONFIG.ENDPOINTS.DOCTOR.GET_AVAILABLE_BY_DEPARTMENT.replace('{department}', department);
//        return $http.get(url);
//    };
//    
//    /**
//     * Get Emergency Doctors - GET /doctors/emergency
//     */
//    service.getEmergency = function() {
//        return $http.get(baseUrl + API_CONFIG.ENDPOINTS.DOCTOR.GET_EMERGENCY);
//    };
//    
//    /**
//     * Get All Specializations - GET /doctors/specializations
//     */
//    service.getSpecializations = function() {
//        return $http.get(baseUrl + API_CONFIG.ENDPOINTS.DOCTOR.GET_SPECIALIZATIONS);
//    };
//    
//    /**
//     * Get All Departments - GET /doctors/departments
//     */
//    service.getDepartments = function() {
//        return $http.get(baseUrl + API_CONFIG.ENDPOINTS.DOCTOR.GET_DEPARTMENTS);
//    };
//    
//    /**
//     * Get Doctor Count - GET /doctors/count
//     */
//    service.getCount = function() {
//        return $http.get(baseUrl + API_CONFIG.ENDPOINTS.DOCTOR.COUNT);
//    };
//    
//    /**
//     * Check if Doctor Exists - GET /doctors/exists/{doctorId}
//     */
//    service.exists = function(doctorId) {
//        var url = baseUrl + API_CONFIG.ENDPOINTS.DOCTOR.EXISTS.replace('{doctorId}', doctorId);
//        return $http.get(url);
//    };
//    
//    // ============ Schedule Management ============
//    
//    /**
//     * Create Schedule - POST /doctors/{doctorId}/schedules
//     * Request: { doctorId, dayOfWeek, startTime, endTime, slotDurationMinutes, 
//     *            maxPatientsPerSlot, isActive, breakStartTime, breakEndTime }
//     */
//    service.createSchedule = function(doctorId, scheduleData) {
//        var url = baseUrl + API_CONFIG.ENDPOINTS.DOCTOR_SCHEDULE.CREATE.replace('{doctorId}', doctorId);
//        return $http.post(url, scheduleData);
//    };
//    
//    /**
//     * Get All Schedules - GET /doctors/{doctorId}/schedules
//     */
//    service.getAllSchedules = function(doctorId) {
//        var url = baseUrl + API_CONFIG.ENDPOINTS.DOCTOR_SCHEDULE.GET_ALL.replace('{doctorId}', doctorId);
//        return $http.get(url);
//    };
//    
//    /**
//     * Get Schedule by Day - GET /doctors/{doctorId}/schedules/{dayOfWeek}
//     */
//    service.getScheduleByDay = function(doctorId, dayOfWeek) {
//        var url = baseUrl + API_CONFIG.ENDPOINTS.DOCTOR_SCHEDULE.GET_BY_DAY
//            .replace('{doctorId}', doctorId)
//            .replace('{dayOfWeek}', dayOfWeek);
//        return $http.get(url);
//    };
//    
//    /**
//     * Get Active Schedules - GET /doctors/{doctorId}/schedules/active
//     */
//    service.getActiveSchedules = function(doctorId) {
//        var url = baseUrl + API_CONFIG.ENDPOINTS.DOCTOR_SCHEDULE.GET_ACTIVE.replace('{doctorId}', doctorId);
//        return $http.get(url);
//    };
//    
//    /**
//     * Update Schedule - PUT /doctors/schedules/{scheduleId}
//     */
//    service.updateSchedule = function(scheduleId, scheduleData) {
//        var url = baseUrl + API_CONFIG.ENDPOINTS.DOCTOR_SCHEDULE.UPDATE.replace('{scheduleId}', scheduleId);
//        return $http.put(url, scheduleData);
//    };
//    
//    /**
//     * Delete Schedule - DELETE /doctors/schedules/{scheduleId}
//     */
//    service.deleteSchedule = function(scheduleId) {
//        var url = baseUrl + API_CONFIG.ENDPOINTS.DOCTOR_SCHEDULE.DELETE.replace('{scheduleId}', scheduleId);
//        return $http.delete(url);
//    };
//    
//    /**
//     * Toggle Schedule - PUT /doctors/schedules/{scheduleId}/toggle?isActive=
//     */
//    service.toggleSchedule = function(scheduleId, isActive) {
//        var url = baseUrl + API_CONFIG.ENDPOINTS.DOCTOR_SCHEDULE.TOGGLE.replace('{scheduleId}', scheduleId);
//        url += '?isActive=' + isActive;
//        return $http.put(url);
//    };
//    
//    /**
//     * Get Schedules by Day (All Doctors) - GET /doctors/schedules/day/{dayOfWeek}
//     */
//    service.getSchedulesByDayAll = function(dayOfWeek) {
//        var url = baseUrl + API_CONFIG.ENDPOINTS.DOCTOR_SCHEDULE.GET_BY_DAY_ALL.replace('{dayOfWeek}', dayOfWeek);
//        return $http.get(url);
//    };
//    
//    /**
//     * Check Availability - GET /doctors/{doctorId}/availability/{dayOfWeek}
//     */
//    service.checkAvailability = function(doctorId, dayOfWeek) {
//        var url = baseUrl + API_CONFIG.ENDPOINTS.DOCTOR_SCHEDULE.CHECK_AVAILABILITY
//            .replace('{doctorId}', doctorId)
//            .replace('{dayOfWeek}', dayOfWeek);
//        return $http.get(url);
//    };
//    
//    return service;
//}]);

/**
 * Doctor Service - UPDATED FOR DATE-BASED SCHEDULING
 * Doctor and Schedule Management
 */

//app.factory('DoctorService', ['$http', '$q', function($http, $q) {
//    
//    var service = {};
//    var baseUrl = API_CONFIG.GATEWAY_URL;
//    
//    // ============ Doctor Management ============
//    
//    service.register = function(doctorData) {
//        return $http.post(baseUrl + API_CONFIG.ENDPOINTS.DOCTOR.REGISTER, doctorData);
//    };
//    
//    service.getById = function(doctorId) {
//        var url = baseUrl + API_CONFIG.ENDPOINTS.DOCTOR.GET_BY_ID.replace('{doctorId}', doctorId);
//        return $http.get(url);
//    };
//    
//    service.update = function(doctorId, doctorData) {
//        var url = baseUrl + API_CONFIG.ENDPOINTS.DOCTOR.UPDATE.replace('{doctorId}', doctorId);
//        return $http.put(url, doctorData);
//    };
//    
//    service.delete = function(doctorId) {
//        var url = baseUrl + API_CONFIG.ENDPOINTS.DOCTOR.DELETE.replace('{doctorId}', doctorId);
//        return $http.delete(url);
//    };
//    
//    service.updateStatus = function(doctorId, status) {
//        var url = baseUrl + API_CONFIG.ENDPOINTS.DOCTOR.UPDATE_STATUS.replace('{doctorId}', doctorId);
//        url += '?status=' + status;
//        return $http.put(url);
//    };
//    
//    service.setOnLeave = function(doctorId) {
//        var url = baseUrl + API_CONFIG.ENDPOINTS.DOCTOR.SET_ON_LEAVE.replace('{doctorId}', doctorId);
//        return $http.put(url);
//    };
//    
//    service.setAvailable = function(doctorId) {
//        var url = baseUrl + API_CONFIG.ENDPOINTS.DOCTOR.SET_AVAILABLE.replace('{doctorId}', doctorId);
//        return $http.put(url);
//    };
//    
//    service.search = function(name) {
//        var url = baseUrl + API_CONFIG.ENDPOINTS.DOCTOR.SEARCH + '?name=' + name;
//        return $http.get(url);
//    };
//    
//    service.getActive = function() {
//        return $http.get(baseUrl + API_CONFIG.ENDPOINTS.DOCTOR.GET_ACTIVE);
//    };
//    
//    service.getAvailable = function() {
//        return $http.get(baseUrl + API_CONFIG.ENDPOINTS.DOCTOR.GET_AVAILABLE);
//    };
//    
//    service.getBySpecialization = function(specialization) {
//        var url = baseUrl + API_CONFIG.ENDPOINTS.DOCTOR.GET_BY_SPECIALIZATION.replace('{specialization}', specialization);
//        return $http.get(url);
//    };
//    
//    service.getByDepartment = function(department) {
//        var url = baseUrl + API_CONFIG.ENDPOINTS.DOCTOR.GET_BY_DEPARTMENT.replace('{department}', department);
//        return $http.get(url);
//    };
//    
//    service.getAvailableBySpecialization = function(specialization) {
//        var url = baseUrl + API_CONFIG.ENDPOINTS.DOCTOR.GET_AVAILABLE_BY_SPECIALIZATION.replace('{specialization}', specialization);
//        return $http.get(url);
//    };
//    
//    service.getAvailableByDepartment = function(department) {
//        var url = baseUrl + API_CONFIG.ENDPOINTS.DOCTOR.GET_AVAILABLE_BY_DEPARTMENT.replace('{department}', department);
//        return $http.get(url);
//    };
//    
//    service.getEmergency = function() {
//        return $http.get(baseUrl + API_CONFIG.ENDPOINTS.DOCTOR.GET_EMERGENCY);
//    };
//    
//    service.getSpecializations = function() {
//        return $http.get(baseUrl + API_CONFIG.ENDPOINTS.DOCTOR.GET_SPECIALIZATIONS);
//    };
//    
//    service.getDepartments = function() {
//        return $http.get(baseUrl + API_CONFIG.ENDPOINTS.DOCTOR.GET_DEPARTMENTS);
//    };
//    
//    service.getCount = function() {
//        return $http.get(baseUrl + API_CONFIG.ENDPOINTS.DOCTOR.COUNT);
//    };
//    
//    service.exists = function(doctorId) {
//        var url = baseUrl + API_CONFIG.ENDPOINTS.DOCTOR.EXISTS.replace('{doctorId}', doctorId);
//        return $http.get(url);
//    };
//    
//    // ============ Schedule Management - DATE-BASED ============
//    
//    /**
//     * Create Schedule - POST /doctors/{doctorId}/schedules
//     * UPDATED: Now expects scheduleDate instead of dayOfWeek
//     * Request: { doctorId, scheduleDate, startTime, endTime, slotDurationMinutes, 
//     *            maxPatientsPerSlot, isActive, breakStartTime, breakEndTime }
//     */
//    service.createSchedule = function(doctorId, scheduleData) {
//        var url = baseUrl + API_CONFIG.ENDPOINTS.DOCTOR_SCHEDULE.CREATE.replace('{doctorId}', doctorId);
//        return $http.post(url, scheduleData);
//    };
//    
//    /**
//     * Get All Schedules - GET /doctors/{doctorId}/schedules
//     */
//    service.getAllSchedules = function(doctorId) {
//        var url = baseUrl + API_CONFIG.ENDPOINTS.DOCTOR_SCHEDULE.GET_ALL.replace('{doctorId}', doctorId);
//        return $http.get(url);
//    };
//    
//    /**
//     * Get Schedule by Date - GET /doctors/{doctorId}/schedules/{scheduleDate}
//     * UPDATED: Now uses scheduleDate parameter instead of dayOfWeek
//     */
//    service.getScheduleByDate = function(doctorId, scheduleDate) {
//        var url = baseUrl + API_CONFIG.ENDPOINTS.DOCTOR_SCHEDULE.GET_BY_DATE
//            .replace('{doctorId}', doctorId)
//            .replace('{scheduleDate}', scheduleDate);
//        return $http.get(url);
//    };
//    
//    /**
//     * Get Active Schedules - GET /doctors/{doctorId}/schedules/active
//     */
//    service.getActiveSchedules = function(doctorId) {
//        var url = baseUrl + API_CONFIG.ENDPOINTS.DOCTOR_SCHEDULE.GET_ACTIVE.replace('{doctorId}', doctorId);
//        return $http.get(url);
//    };
//    
//    /**
//     * Get Upcoming Schedules - GET /doctors/{doctorId}/schedules/upcoming?days=30
//     * NEW: Get schedules for next N days
//     */
//    service.getUpcomingSchedules = function(doctorId, days) {
//        var url = baseUrl + API_CONFIG.ENDPOINTS.DOCTOR_SCHEDULE.GET_UPCOMING.replace('{doctorId}', doctorId);
//        url += '?days=' + (days || 30);
//        return $http.get(url);
//    };
//    
//    /**
//     * Get Schedules by Date Range - GET /doctors/{doctorId}/schedules/range?startDate=&endDate=
//     * NEW: Get schedules between two dates
//     */
//    service.getSchedulesByRange = function(doctorId, startDate, endDate) {
//        var url = baseUrl + API_CONFIG.ENDPOINTS.DOCTOR_SCHEDULE.GET_BY_RANGE.replace('{doctorId}', doctorId);
//        url += '?startDate=' + startDate + '&endDate=' + endDate;
//        return $http.get(url);
//    };
//    
//    /**
//     * Update Schedule - PUT /doctors/schedules/{scheduleId}
//     */
//    service.updateSchedule = function(scheduleId, scheduleData) {
//        var url = baseUrl + API_CONFIG.ENDPOINTS.DOCTOR_SCHEDULE.UPDATE.replace('{scheduleId}', scheduleId);
//        return $http.put(url, scheduleData);
//    };
//    
//    /**
//     * Delete Schedule - DELETE /doctors/schedules/{scheduleId}
//     */
//    service.deleteSchedule = function(scheduleId) {
//        var url = baseUrl + API_CONFIG.ENDPOINTS.DOCTOR_SCHEDULE.DELETE.replace('{scheduleId}', scheduleId);
//        return $http.delete(url);
//    };
//    
//    /**
//     * Toggle Schedule - PUT /doctors/schedules/{scheduleId}/toggle?isActive=
//     */
//    service.toggleSchedule = function(scheduleId, isActive) {
//        var url = baseUrl + API_CONFIG.ENDPOINTS.DOCTOR_SCHEDULE.TOGGLE.replace('{scheduleId}', scheduleId);
//        url += '?isActive=' + isActive;
//        return $http.put(url);
//    };
//    
//    /**
//     * Check Availability by Date - GET /doctors/{doctorId}/availability/{scheduleDate}
//     * UPDATED: Now uses scheduleDate instead of dayOfWeek
//     */
//    service.checkAvailability = function(doctorId, scheduleDate) {
//        var url = baseUrl + API_CONFIG.ENDPOINTS.DOCTOR_SCHEDULE.CHECK_AVAILABILITY
//            .replace('{doctorId}', doctorId)
//            .replace('{scheduleDate}', scheduleDate);
//        return $http.get(url);
//    };
//    
//    return service;
//}]);

///Testing 22/11/2025

/* 
 * Doctor Service - Doctor Service (Port 8086)
 * Doctor Management and Schedule Operations
 */

app.service('DoctorService', ['$http', function($http) {
    var baseUrl = API_CONFIG.GATEWAY_URL;
    
    // ============ DOCTOR MANAGEMENT ============
    
    /**
     * Register new doctor
     */
    this.register = function(doctorData) {
        return $http.post(baseUrl + API_CONFIG.ENDPOINTS.DOCTOR.REGISTER, doctorData);
    };
    
    /**
     * Get doctor by ID
     */
    this.getById = function(doctorId) {
        var url = API_CONFIG.ENDPOINTS.DOCTOR.GET_BY_ID.replace('{doctorId}', doctorId);
        return $http.get(baseUrl + url);
    };
    
    /**
     * Update doctor details
     */
    this.update = function(doctorId, doctorData) {
        var url = API_CONFIG.ENDPOINTS.DOCTOR.UPDATE.replace('{doctorId}', doctorId);
        return $http.put(baseUrl + url, doctorData);
    };
    
    /**
     * Delete doctor
     */
    this.delete = function(doctorId) {
        var url = API_CONFIG.ENDPOINTS.DOCTOR.DELETE.replace('{doctorId}', doctorId);
        return $http.delete(baseUrl + url);
    };
    
    /**
     * Get all active doctors
     */
    this.getActive = function() {
        return $http.get(baseUrl + API_CONFIG.ENDPOINTS.DOCTOR.GET_ACTIVE);
    };
    
    /**
     * Alias for getActive (used by queue-management.controller.js)
     */
    this.getActiveDoctors = function() {
        return this.getActive();
    };
    
    /**
     * Get all available doctors
     */
    this.getAvailable = function() {
        return $http.get(baseUrl + API_CONFIG.ENDPOINTS.DOCTOR.GET_AVAILABLE);
    };
    
    /**
     * Get doctors by department
     */
    this.getByDepartment = function(department) {
        var url = API_CONFIG.ENDPOINTS.DOCTOR.GET_BY_DEPARTMENT.replace('{department}', department);
        return $http.get(baseUrl + url);
    };
    
    /**
     * Get available doctors by department
     */
    this.getAvailableByDepartment = function(department) {
        var url = API_CONFIG.ENDPOINTS.DOCTOR.GET_AVAILABLE_BY_DEPARTMENT.replace('{department}', department);
        return $http.get(baseUrl + url);
    };
    
    /**
     * Get doctors by specialization
     */
    this.getBySpecialization = function(specialization) {
        var url = API_CONFIG.ENDPOINTS.DOCTOR.GET_BY_SPECIALIZATION.replace('{specialization}', specialization);
        return $http.get(baseUrl + url);
    };
    
    /**
     * Get available doctors by specialization
     */
    this.getAvailableBySpecialization = function(specialization) {
        var url = API_CONFIG.ENDPOINTS.DOCTOR.GET_AVAILABLE_BY_SPECIALIZATION.replace('{specialization}', specialization);
        return $http.get(baseUrl + url);
    };
    
    /**
     * Get all departments
     */
    this.getDepartments = function() {
        return $http.get(baseUrl + API_CONFIG.ENDPOINTS.DOCTOR.GET_DEPARTMENTS);
    };
    
    /**
     * Get all specializations
     */
    this.getSpecializations = function() {
        return $http.get(baseUrl + API_CONFIG.ENDPOINTS.DOCTOR.GET_SPECIALIZATIONS);
    };
    
    /**
     * Search doctors
     */
    this.search = function(query) {
        return $http.get(baseUrl + API_CONFIG.ENDPOINTS.DOCTOR.SEARCH + '?query=' + query);
    };
    
    /**
     * Update doctor status
     */
    this.updateStatus = function(doctorId, status) {
        var url = API_CONFIG.ENDPOINTS.DOCTOR.UPDATE_STATUS.replace('{doctorId}', doctorId);
        return $http.put(baseUrl + url, { status: status });
    };
    
    /**
     * Set doctor on leave
     */
    this.setOnLeave = function(doctorId) {
        var url = API_CONFIG.ENDPOINTS.DOCTOR.SET_ON_LEAVE.replace('{doctorId}', doctorId);
        return $http.put(baseUrl + url);
    };
    
    /**
     * Set doctor available
     */
    this.setAvailable = function(doctorId) {
        var url = API_CONFIG.ENDPOINTS.DOCTOR.SET_AVAILABLE.replace('{doctorId}', doctorId);
        return $http.put(baseUrl + url);
    };
    
    // ============ DOCTOR SCHEDULE MANAGEMENT (DATE-BASED) ============
    
    /**
     * Create doctor schedule for a specific date
     */
    this.createSchedule = function(doctorId, scheduleData) {
        var url = API_CONFIG.ENDPOINTS.DOCTOR_SCHEDULE.CREATE.replace('{doctorId}', doctorId);
        return $http.post(baseUrl + url, scheduleData);
    };
    
    /**
     * Get all schedules for a doctor
     */
    this.getAllSchedules = function(doctorId) {
        var url = API_CONFIG.ENDPOINTS.DOCTOR_SCHEDULE.GET_ALL.replace('{doctorId}', doctorId);
        return $http.get(baseUrl + url);
    };
    
    /**
     * Get active schedules for a doctor
     */
    this.getActiveSchedules = function(doctorId) {
        var url = API_CONFIG.ENDPOINTS.DOCTOR_SCHEDULE.GET_ACTIVE.replace('{doctorId}', doctorId);
        return $http.get(baseUrl + url);
    };
    
    /**
     * Get upcoming schedules for a doctor (next N days)
     * @param {string} doctorId - Doctor ID
     * @param {number} days - Number of days to fetch (default 30)
     */
    this.getUpcomingSchedules = function(doctorId, days) {
        var url = API_CONFIG.ENDPOINTS.DOCTOR_SCHEDULE.GET_UPCOMING
            .replace('{doctorId}', doctorId);
        
        // Add days parameter if provided
        if (days) {
            url += '?days=' + days;
        }
        
        return $http.get(baseUrl + url);
    };
    
    /**
     * Get schedule for a specific date
     */
    this.getScheduleByDate = function(doctorId, date) {
        var url = API_CONFIG.ENDPOINTS.DOCTOR_SCHEDULE.GET_BY_DATE
            .replace('{doctorId}', doctorId)
            .replace('{scheduleDate}', date);
        return $http.get(baseUrl + url);
    };
    
    /**
     * Get schedules in date range
     */
    this.getSchedulesByRange = function(doctorId, startDate, endDate) {
        var url = API_CONFIG.ENDPOINTS.DOCTOR_SCHEDULE.GET_BY_RANGE
            .replace('{doctorId}', doctorId);
        return $http.get(baseUrl + url, {
            params: {
                startDate: startDate,
                endDate: endDate
            }
        });
    };
    
    /**
     * Update schedule
     */
    this.updateSchedule = function(scheduleId, scheduleData) {
        var url = API_CONFIG.ENDPOINTS.DOCTOR_SCHEDULE.UPDATE.replace('{scheduleId}', scheduleId);
        return $http.put(baseUrl + url, scheduleData);
    };
    
    /**
     * Delete schedule
     */
    this.deleteSchedule = function(scheduleId) {
        var url = API_CONFIG.ENDPOINTS.DOCTOR_SCHEDULE.DELETE.replace('{scheduleId}', scheduleId);
        return $http.delete(baseUrl + url);
    };
    
    /**
     * Toggle schedule active status
     */
    this.toggleSchedule = function(scheduleId) {
        var url = API_CONFIG.ENDPOINTS.DOCTOR_SCHEDULE.TOGGLE.replace('{scheduleId}', scheduleId);
        return $http.put(baseUrl + url);
    };
    
    /**
     * Check if doctor is available on a specific date
     */
    this.checkAvailability = function(doctorId, date) {
        var url = API_CONFIG.ENDPOINTS.DOCTOR_SCHEDULE.CHECK_AVAILABILITY
            .replace('{doctorId}', doctorId)
            .replace('{scheduleDate}', date);
        return $http.get(baseUrl + url);
    };
    
    // ============ STATISTICS & UTILITIES ============
    
    /**
     * Get total doctor count
     */
    this.getCount = function() {
        return $http.get(baseUrl + API_CONFIG.ENDPOINTS.DOCTOR.COUNT);
    };
    
    /**
     * Check if doctor exists
     */
    this.exists = function(doctorId) {
        var url = API_CONFIG.ENDPOINTS.DOCTOR.EXISTS.replace('{doctorId}', doctorId);
        return $http.get(baseUrl + url);
    };
    
    /**
     * Get emergency doctors
     */
    this.getEmergency = function() {
        return $http.get(baseUrl + API_CONFIG.ENDPOINTS.DOCTOR.GET_EMERGENCY);
    };
}]);

