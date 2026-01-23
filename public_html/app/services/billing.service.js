/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/**
 * Billing Service - Billing Service (Port 8088)
 * Invoice and Payment Management
 */

app.factory('BillingService', ['$http', '$q', function($http, $q) {
    
    var service = {};
    var baseUrl = API_CONFIG.GATEWAY_URL;
    
    // ============ Invoice Management ============
    
    /**
     * Create Invoice - POST /billing/invoices/create
     * Request: { pinNumber, appointmentId, cvrNumber, doctorId, invoiceType, 
     *            discountPercentage, taxPercentage, isInsuranceClaim, insuranceProvider, 
     *            items: [{ itemName, description, quantity, unitPrice, itemType }], 
     *            createdBy }
     */
    service.createInvoice = function(invoiceData) {
        return $http.post(baseUrl + API_CONFIG.ENDPOINTS.INVOICE.CREATE, invoiceData);
    };
    
    /**
     * Get Invoice by Number - GET /billing/invoices/{invoiceNumber}
     */
    service.getInvoice = function(invoiceNumber) {
        var url = baseUrl + API_CONFIG.ENDPOINTS.INVOICE.GET_BY_NUMBER.replace('{invoiceNumber}', invoiceNumber);
        return $http.get(url);
    };
    
    /**
     * Get Pending Invoices - GET /billing/invoices/pending
     */
    service.getPendingInvoices = function() {
        return $http.get(baseUrl + API_CONFIG.ENDPOINTS.INVOICE.GET_PENDING);
    };
    
    /**
     * Get Patient Invoices - GET /billing/invoices/patient/{pinNumber}
     */
    service.getPatientInvoices = function(pinNumber) {
        var url = baseUrl + API_CONFIG.ENDPOINTS.INVOICE.GET_BY_PATIENT.replace('{pinNumber}', pinNumber);
        return $http.get(url);
    };
    
    // ============ Payment Management ============
    
    /**
     * Process Payment - POST /billing/payments/process/{invoiceNumber}
     * Request: { paymentId, invoiceNumber, amount, paymentMode, transactionId, 
     *            paymentDate, receivedBy }
     */
    service.processPayment = function(invoiceNumber, paymentData) {
        var url = baseUrl + API_CONFIG.ENDPOINTS.PAYMENT.PROCESS.replace('{invoiceNumber}', invoiceNumber);
        return $http.post(url, paymentData);
    };
    
    /**
     * Get Payments by Invoice - GET /billing/payments/invoice/{invoiceNumber}
     */
    service.getPaymentsByInvoice = function(invoiceNumber) {
        var url = baseUrl + API_CONFIG.ENDPOINTS.PAYMENT.GET_BY_INVOICE.replace('{invoiceNumber}', invoiceNumber);
        return $http.get(url);
    };
    
    return service;
}]);