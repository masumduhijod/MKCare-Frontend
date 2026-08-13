// ============================================
// BILLING SERVICE
// File: app/services/billing.service.js
// Invoice & Payment Management
// ============================================

app.service('BillingService', ['$http', function($http) {
    var baseUrl = API_CONFIG.GATEWAY_URL;
    
    // ============ INVOICE MANAGEMENT ============
    
    /**
     * Create new invoice
     * @param {Object} invoiceData - Invoice details with items
     */
    this.createInvoice = function(invoiceData) {
        return $http.post(baseUrl + API_CONFIG.ENDPOINTS.INVOICE.CREATE, invoiceData);
    };
    
    /**
     * Get invoice by invoice number
     * @param {String} invoiceNumber - Invoice number
     */
    this.getInvoiceByNumber = function(invoiceNumber) {
        var url = API_CONFIG.ENDPOINTS.INVOICE.GET_BY_NUMBER
            .replace('{invoiceNumber}', invoiceNumber);
        return $http.get(baseUrl + url);
    };
    
    /**
     * Get all pending invoices
     */
    this.getPendingInvoices = function() {
        return $http.get(baseUrl + API_CONFIG.ENDPOINTS.INVOICE.GET_PENDING);
    };
    
    /**
     * Get patient invoices by PIN
     * @param {String} pinNumber - Patient PIN
     */
    this.getPatientInvoices = function(pinNumber) {
        var url = API_CONFIG.ENDPOINTS.INVOICE.GET_BY_PATIENT
            .replace('{pinNumber}', pinNumber);
        return $http.get(baseUrl + url);
    };
    
    // ============ PAYMENT MANAGEMENT ============
    
    /**
     * Process payment for invoice
     * @param {String} invoiceNumber - Invoice number
     * @param {Object} paymentData - Payment details
     */
    this.processPayment = function(invoiceNumber, paymentData) {
        var url = API_CONFIG.ENDPOINTS.PAYMENT.PROCESS
            .replace('{invoiceNumber}', invoiceNumber);
        return $http.post(baseUrl + url, paymentData);
    };
    
    /**
     * Get payment history for invoice
     * @param {String} invoiceNumber - Invoice number
     */
    this.getPaymentHistory = function(invoiceNumber) {
        var url = API_CONFIG.ENDPOINTS.PAYMENT.GET_BY_INVOICE
            .replace('{invoiceNumber}', invoiceNumber);
        return $http.get(baseUrl + url);
    };
    
    // ============ UTILITY FUNCTIONS ============
    
    /**
     * Calculate invoice totals
     * @param {Array} items - Invoice items
     * @param {Number} discountPercentage
     * @param {Number} taxPercentage
     */
    this.calculateTotals = function(items, discountPercentage, taxPercentage) {
        var subTotal = 0;
        
        items.forEach(function(item) {
            subTotal += (item.quantity * item.unitPrice);
        });
        
        var discountAmount = (subTotal * (discountPercentage || 0)) / 100;
        var taxableAmount = subTotal - discountAmount;
        var taxAmount = (taxableAmount * (taxPercentage || 0)) / 100;
        var totalAmount = taxableAmount + taxAmount;
        
        return {
            subTotal: subTotal,
            discountAmount: discountAmount,
            taxAmount: taxAmount,
            totalAmount: totalAmount
        };
    };
    
    /**
     * Get payment status badge class
     * @param {String} status - Payment status
     */
    this.getStatusBadgeClass = function(status) {
        switch(status) {
            case 'PAID':
                return 'badge bg-success';
            case 'PENDING':
                return 'badge bg-warning text-dark';
            case 'PARTIAL':
                return 'badge bg-info';
            case 'CANCELLED':
                return 'badge bg-danger';
            default:
                return 'badge bg-secondary';
        }
    };
    
    /**
     * Format currency
     * @param {Number} amount
     */
    this.formatCurrency = function(amount) {
        return '₹' + (amount || 0).toFixed(2);
    };
    
    /**
     * Get invoice type options
     */
    this.getInvoiceTypes = function() {
        return ['OPD', 'IPD', 'PHARMACY', 'EMERGENCY'];
    };
    
    /**
     * Get item type options
     */
    this.getItemTypes = function() {
        return ['CONSULTATION', 'MEDICINE', 'TEST', 'PROCEDURE', 'OTHER'];
    };
    
    /**
     * Get payment mode options
     */
    this.getPaymentModes = function() {
        return ['CASH', 'UPI', 'CARD', 'NET_BANKING', 'CHEQUE'];
    };
    /**
     * Get invoice by consultation ID
     * @param {Number} consultationId
     */
    this.getInvoiceByConsultation = function(consultationId) {
        var url = API_CONFIG.ENDPOINTS.INVOICE.GET_BY_CONSULTATION
            .replace('{consultationId}', consultationId);
        return $http.get(baseUrl + url);
    };

    /**
     * Get invoices by doctor and date — routes via Gateway (has X-Tenant-ID)
     * @param {String} doctorId
     * @param {String} date  - yyyy-MM-dd
     */
    this.getInvoicesByDoctorDate = function(doctorId, date) {
        var url = API_CONFIG.ENDPOINTS.INVOICE.GET_BY_DOCTOR_DATE
            .replace('{doctorId}', doctorId)
            .replace('{date}', date);
        return $http.get(baseUrl + url);
    };

    /**
     * Get invoices for a list of CVR numbers
     * @param {Array} cvrNumbers
     */
    this.getInvoicesByCvrs = function(cvrNumbers) {
        var url = API_CONFIG.ENDPOINTS.INVOICE.GET_BY_CVRS;
        return $http.post(baseUrl + url, cvrNumbers);
    };

}]);