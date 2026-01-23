/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/**
 * Payment Processing Controller
 * Process payments for invoices
 */

app.controller('PaymentProcessingController', ['$scope', '$rootScope', '$location', '$routeParams',
    'BillingService', 'AuthService',
    function($scope, $rootScope, $location, $routeParams, BillingService, AuthService) {
    
    var currentUser = AuthService.getCurrentUser();
    
    // Invoice
    $scope.invoice = null;
    $scope.invoiceNumber = $routeParams.invoiceNumber || '';
    
    // Payment Data
    $scope.payment = {
        paymentId: '',
        invoiceNumber: $scope.invoiceNumber,
        amount: 0,
        paymentMode: 'Cash',
        transactionId: '',
        paymentDate: new Date().toISOString(),
        receivedBy: currentUser ? currentUser.username : ''
    };
    
    $scope.loading = false;
    $scope.processingPayment = false;
    $scope.paymentCompleted = false;
    
    // Payment Modes
    $scope.paymentModes = ['Cash', 'Card', 'UPI', 'Net Banking', 'Insurance', 'Cheque'];
    
    /**
     * Search Invoice
     */
    $scope.searchInvoice = function() {
        if (!$scope.invoiceNumber) {
            $rootScope.showAlert('warning', 'Please enter invoice number');
            return;
        }
        
        $scope.loadInvoice();
    };
    
    /**
     * Load Invoice
     */
    $scope.loadInvoice = function() {
        if (!$scope.invoiceNumber) {
            return;
        }
        
        $scope.loading = true;
        
        BillingService.getInvoice($scope.invoiceNumber)
            .then(function(response) {
                $scope.loading = false;
                
                if (response.data.success) {
                    $scope.invoice = response.data.data;
                    $scope.payment.invoiceNumber = $scope.invoice.invoiceNumber;
                    
                    // Set payment amount to outstanding amount
                    $scope.payment.amount = $scope.invoice.outstandingAmount;
                    
                    // Check if fully paid
                    if ($scope.invoice.outstandingAmount === 0) {
                        $rootScope.showAlert('info', 'This invoice is already fully paid');
                    }
                } else {
                    $rootScope.showAlert('danger', 'Invoice not found');
                }
            })
            .catch(function(error) {
                $scope.loading = false;
                $rootScope.showAlert('danger', 'Error loading invoice');
            });
    };
    
    /**
     * Validate Payment Amount
     */
    $scope.validateAmount = function() {
        if ($scope.payment.amount > $scope.invoice.outstandingAmount) {
            $rootScope.showAlert('warning', 'Payment amount cannot exceed outstanding amount');
            $scope.payment.amount = $scope.invoice.outstandingAmount;
        }
        
        if ($scope.payment.amount <= 0) {
            $rootScope.showAlert('warning', 'Payment amount must be greater than 0');
            $scope.payment.amount = $scope.invoice.outstandingAmount;
        }
    };
    
    /**
     * Generate Payment ID
     */
    $scope.generatePaymentId = function() {
        var timestamp = new Date().getTime();
        $scope.payment.paymentId = 'PAY' + timestamp;
    };
    
    /**
     * Process Payment
     */
    $scope.processPayment = function() {
        // Validation
        if (!$scope.invoice) {
            $rootScope.showAlert('warning', 'Please load invoice first');
            return;
        }
        
        if (!$scope.payment.amount || $scope.payment.amount <= 0) {
            $rootScope.showAlert('warning', 'Please enter valid payment amount');
            return;
        }
        
        if ($scope.payment.amount > $scope.invoice.outstandingAmount) {
            $rootScope.showAlert('warning', 'Payment amount cannot exceed outstanding amount');
            return;
        }
        
        if (!$scope.payment.paymentMode) {
            $rootScope.showAlert('warning', 'Please select payment mode');
            return;
        }
        
        // Generate payment ID if not set
        if (!$scope.payment.paymentId) {
            $scope.generatePaymentId();
        }
        
        // For Card/UPI/Net Banking, transaction ID is required
        if (['Card', 'UPI', 'Net Banking'].indexOf($scope.payment.paymentMode) !== -1) {
            if (!$scope.payment.transactionId) {
                $rootScope.showAlert('warning', 'Transaction ID is required for ' + $scope.payment.paymentMode);
                return;
            }
        }
        
        $scope.processingPayment = true;
        
        BillingService.processPayment($scope.payment.invoiceNumber, $scope.payment)
            .then(function(response) {
                $scope.processingPayment = false;
                
                if (response.data.success) {
                    $scope.paymentCompleted = true;
                    $rootScope.showAlert('success', 'Payment processed successfully!\nPayment ID: ' + 
                                       response.data.data.paymentId);
                    
                    // Reload invoice to update outstanding amount
                    $scope.loadInvoice();
                    
                    // Ask to print receipt
                    var printReceipt = confirm('Payment successful!\n\nDo you want to print receipt?');
                    
                    if (printReceipt) {
                        $scope.printReceipt();
                    } else {
                        $scope.resetForm();
                    }
                } else {
                    $rootScope.showAlert('danger', response.data.message || 'Payment processing failed');
                }
            })
            .catch(function(error) {
                $scope.processingPayment = false;
                $rootScope.showAlert('danger', 'Error processing payment');
            });
    };
    
    /**
     * Print Receipt
     */
    $scope.printReceipt = function() {
        window.print();
        $scope.resetForm();
    };
    
    /**
     * Reset Form
     */
    $scope.resetForm = function() {
        $scope.invoiceNumber = '';
        $scope.invoice = null;
        $scope.payment = {
            paymentId: '',
            invoiceNumber: '',
            amount: 0,
            paymentMode: 'Cash',
            transactionId: '',
            paymentDate: new Date().toISOString(),
            receivedBy: currentUser ? currentUser.username : ''
        };
        $scope.paymentCompleted = false;
    };
    
    /**
     * Cancel
     */
    $scope.cancel = function() {
        if (confirm('Cancel payment processing?')) {
            $location.path('/dashboard');
        }
    };
    
    // Initialize
    if ($scope.invoiceNumber) {
        $scope.loadInvoice();
    }
}]);