/**
 * Report Service - HMIS Report Service (Port 8089)
 * Calls all 17 report endpoints via API Gateway
 * Header: X-Tenant-ID added automatically via app.config.js interceptor
 */

app.factory('ReportService', ['$http', '$q', function($http, $q) {

    var service = {};
    // Report service runs on 8089, via gateway at /reports
    var baseUrl = API_CONFIG.GATEWAY_URL; // http://localhost:8080/api

    /**
     * Get tenant ID from localStorage
     */
    function getTenantHeaders() {
        return {
            'X-Tenant-ID': localStorage.getItem('tenantId') || '',
            'Authorization': 'Bearer ' + (localStorage.getItem('authToken') || '')
        };
    }

    function doGet(url, params) {
        var deferred = $q.defer();
        $http.get(url, {
            params: params,
            headers: getTenantHeaders()
        }).then(function(res) {
            deferred.resolve(res.data);
        }).catch(function(err) {
            deferred.reject(err.data || { message: 'Request failed' });
        });
        return deferred.promise;
    }

    // ═══════════════════════════════════════
    // PATIENT REPORTS
    // ═══════════════════════════════════════

    /** Report 1: Patient Registration */
    service.getPatientRegistration = function(params) {
        return doGet(baseUrl + '/reports/patients/registration', params);
    };

    /** Report 2: Patient Demographics */
    service.getPatientDemographics = function() {
        return doGet(baseUrl + '/reports/patients/demographics', {});
    };

    /** Report 3: Patient Visit History */
    service.getPatientVisitHistory = function(pinNumber) {
        return doGet(baseUrl + '/reports/patients/visit-history/' + pinNumber, {});
    };

    /** Patient Search (LOV helper) */
    service.searchPatients = function(query, searchType) {
        return doGet(baseUrl + '/reports/patients/search', {
            query: query,
            searchType: searchType || 'NAME'
        });
    };

    // ═══════════════════════════════════════
    // OPD REPORTS
    // ═══════════════════════════════════════

    /** Report 4: OPD Daily */
    service.getOpdDaily = function(date) {
        return doGet(baseUrl + '/reports/opd/daily', date ? { date: date } : {});
    };

    /** Report 5: OPD Department-wise */
    service.getOpdDepartmentWise = function(fromDate, toDate) {
        return doGet(baseUrl + '/reports/opd/department-wise', { fromDate: fromDate, toDate: toDate });
    };

    /** Report 6: OPD Revenue */
    service.getOpdRevenue = function(fromDate, toDate) {
        return doGet(baseUrl + '/reports/opd/revenue', { fromDate: fromDate, toDate: toDate });
    };

    /** Report 10: CVR Summary */
    service.getCvrSummary = function(params) {
        return doGet(baseUrl + '/reports/opd/cvr-summary', params);
    };

    /** Report 11: Prescription Report */
    service.getPrescriptions = function(params) {
        return doGet(baseUrl + '/reports/opd/prescriptions', params);
    };

    // ═══════════════════════════════════════
    // APPOINTMENT REPORTS
    // ═══════════════════════════════════════

    /** Report 7: Appointment Schedule */
    service.getAppointmentSchedule = function(params) {
        return doGet(baseUrl + '/reports/appointments/schedule', params);
    };

    /** Report 8: Appointment Status Summary */
    service.getAppointmentStatusSummary = function(fromDate, toDate) {
        return doGet(baseUrl + '/reports/appointments/status-summary', { fromDate: fromDate, toDate: toDate });
    };

    /** Report 9: Doctor Availability */
    service.getDoctorAvailability = function(date) {
        return doGet(baseUrl + '/reports/appointments/doctor-availability', date ? { date: date } : {});
    };

    // ═══════════════════════════════════════
    // BILLING REPORTS
    // ═══════════════════════════════════════

    /** Report 12: Invoice Summary */
    service.getInvoiceSummary = function(params) {
        return doGet(baseUrl + '/reports/billing/invoices', params);
    };

    /** Report 13: Payment Collection */
    service.getPaymentCollection = function(params) {
        return doGet(baseUrl + '/reports/billing/payment-collection', params);
    };

    /** Report 14: Outstanding Dues */
    service.getOutstandingDues = function() {
        return doGet(baseUrl + '/reports/billing/outstanding-dues', {});
    };

    /** Report 15: Revenue Analysis */
    service.getRevenueAnalysis = function(fromDate, toDate) {
        return doGet(baseUrl + '/reports/billing/revenue-analysis', { fromDate: fromDate, toDate: toDate });
    };

    // ═══════════════════════════════════════
    // DOCTOR REPORTS
    // ═══════════════════════════════════════

    /** Report 16: Doctor Consultation */
    service.getDoctorConsultations = function(doctorId, fromDate, toDate) {
        var params = { fromDate: fromDate };
        if (toDate) params.toDate = toDate;
        return doGet(baseUrl + '/reports/doctors/' + doctorId + '/consultations', params);
    };

    /** Report 17: Doctor Schedule */
    service.getDoctorSchedule = function(params) {
        return doGet(baseUrl + '/reports/doctors/schedule', params);
    };

    // ═══════════════════════════════════════
    // LOV HELPERS - for PIN / CVR / Invoice search
    // ═══════════════════════════════════════

    /** Search patients for PIN LOV */
    service.searchPatientLov = function(query) {
        var gatewayBase = API_CONFIG.GATEWAY_URL;
        var deferred = $q.defer();
        $http.get(gatewayBase + '/patients/search', {
            params: { query: query || '', page: 0, size: 20 },
            headers: getTenantHeaders()
        }).then(function(res) {
            deferred.resolve(res.data);
        }).catch(function() {
            // Fallback: try report search endpoint
            service.searchPatients(query || 'a', 'NAME')
                .then(function(data) { deferred.resolve(data); })
                .catch(function(e) { deferred.reject(e); });
        });
        return deferred.promise;
    };

    /** Search CVR records for CVR LOV */
    service.searchCvrLov = function(query) {
        var deferred = $q.defer();
        $http.get(API_CONFIG.GATEWAY_URL + '/cvr/search', {
            params: { query: query || '', page: 0, size: 20 },
            headers: getTenantHeaders()
        }).then(function(res) {
            deferred.resolve(res.data);
        }).catch(function(err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    /** Search invoices for Invoice LOV */
    service.searchInvoiceLov = function(query) {
        var deferred = $q.defer();
        $http.get(API_CONFIG.GATEWAY_URL + '/invoices/search', {
            params: { query: query || '', page: 0, size: 20 },
            headers: getTenantHeaders()
        }).then(function(res) {
            deferred.resolve(res.data);
        }).catch(function(err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    /** Get today's date in yyyy-MM-dd */
    service.today = function() {
        return new Date().toISOString().split('T')[0];
    };

    /** First day of current month */
    service.firstOfMonth = function() {
        var d = new Date();
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-01';
    };

    return service;
}]);
