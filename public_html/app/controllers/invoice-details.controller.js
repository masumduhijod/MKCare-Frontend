/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

// ============================================
// INVOICE DETAILS CONTROLLER
// File: app/controllers/billing/invoice-details.controller.js
// View invoice summary and payment history
// ============================================

app.controller('InvoiceDetailsController', ['$scope', '$rootScope', '$location', '$routeParams', '$window',
    'BillingService',
    function($scope, $rootScope, $location, $routeParams, $window, BillingService) {
    
    var invoiceNumber = $routeParams.invoiceNumber;
    
    // Initialize
    $scope.loading = false;
    $scope.invoice = null;
    $scope.paymentHistory = [];
    
    /**
     * Initialize
     */
    $scope.init = function() {
        if (!invoiceNumber) {
            $rootScope.showAlert('danger', 'Invoice number not provided');
            $location.path('/billing/invoice/list');
            return;
        }
        
        $scope.loadInvoice();
        $scope.loadPaymentHistory();
    };
    
    /**
     * Load invoice details
     */
    $scope.loadInvoice = function() {
        $scope.loading = true;
        
        BillingService.getInvoiceByNumber(invoiceNumber).then(
            function(response) {
                $scope.loading = false;
                
                if (response.data.success) {
                    $scope.invoice = response.data.data;
                    console.log('Invoice loaded:', $scope.invoice);
                } else {
                    $rootScope.showAlert('danger', response.data.message);
                    $location.path('/billing/invoice/list');
                }
            },
            function(error) {
                $scope.loading = false;
                console.error('Error loading invoice:', error);
                $rootScope.showAlert('danger', 'Failed to load invoice');
            }
        );
    };
    
    /**
     * Load payment history
     */
    $scope.loadPaymentHistory = function() {
        BillingService.getPaymentHistory(invoiceNumber).then(
            function(response) {
                if (response.data.success) {
                    $scope.paymentHistory = response.data.data;
                    console.log('Payment history loaded:', $scope.paymentHistory);
                }
            },
            function(error) {
                console.error('Error loading payment history:', error);
            }
        );
    };
    
    /**
     * Make payment
     */
    $scope.makePayment = function() {
        if ($scope.invoice.paymentStatus === 'PAID') {
            $rootScope.showAlert('info', 'Invoice is already fully paid');
            return;
        }
        
        $location.path('/billing/payment/' + invoiceNumber);
    };
    
    /**
     * Print invoice
     */
    $scope.printInvoice = function() {
        var printWindow = $window.open('', '_blank', 'width=800,height=600');
        var printContent = $scope.generateInvoiceHtml();
        
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        
        setTimeout(function() {
            printWindow.print();
        }, 500);
    };
    
    /**
     * Generate invoice HTML for printing
     */
    $scope.generateInvoiceHtml = function() {
        var html = `
<!DOCTYPE html>
<html>
<head>
    <title>Invoice - ${$scope.invoice.invoiceNumber}</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 20px;
            line-height: 1.6;
        }
        .header { 
            text-align: center; 
            border-bottom: 3px solid #007bff; 
            padding-bottom: 15px; 
            margin-bottom: 25px; 
        }
        .header h2 { 
            margin: 0; 
            color: #007bff; 
        }
        .invoice-info { 
            margin-bottom: 25px; 
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
        }
        .invoice-info p { 
            margin: 5px 0; 
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px; 
        }
        th, td { 
            border: 1px solid #ddd; 
            padding: 12px; 
            text-align: left; 
        }
        th { 
            background-color: #007bff; 
            color: white;
            font-weight: bold;
        }
        .text-right { 
            text-align: right; 
        }
        .summary { 
            margin-top: 20px; 
            float: right;
            width: 300px;
        }
        .summary-row { 
            display: flex; 
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #ddd;
        }
        .summary-total { 
            font-size: 18px;
            font-weight: bold;
            color: #007bff;
            border-top: 2px solid #007bff;
            margin-top: 10px;
            padding-top: 10px;
        }
        .footer { 
            margin-top: 100px; 
            clear: both;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
        .status-badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 15px;
            font-weight: bold;
            font-size: 14px;
        }
        .status-paid { background: #28a745; color: white; }
        .status-partial { background: #17a2b8; color: white; }
        .status-pending { background: #ffc107; color: #000; }
        @media print { 
            button { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>🏥 HOSPITAL MANAGEMENT SYSTEM</h2>
        <p>Hospital Address Line 1, City - PIN Code</p>
        <p>Phone: +91-XXXXXXXXXX | Email: hospital@example.com</p>
    </div>
    
    <div style="text-align: center; margin-bottom: 20px;">
        <h3 style="margin: 0;">TAX INVOICE</h3>
        <span class="status-badge status-${$scope.invoice.paymentStatus.toLowerCase()}">
            ${$scope.invoice.paymentStatus}
        </span>
    </div>
    
    <div class="invoice-info">
        <div style="display: flex; justify-content: space-between;">
            <div>
                <p><strong>Invoice Number:</strong> ${$scope.invoice.invoiceNumber}</p>
                <p><strong>Invoice Date:</strong> ${new Date($scope.invoice.invoiceDate).toLocaleDateString('en-IN')}</p>
                <p><strong>Invoice Type:</strong> ${$scope.invoice.invoiceType}</p>
            </div>
            <div>
                <p><strong>Patient Name:</strong> ${$scope.invoice.patientName}</p>
                <p><strong>Patient PIN:</strong> ${$scope.invoice.pinNumber}</p>
                ${$scope.invoice.appointmentId ? 
                    '<p><strong>Appointment ID:</strong> ' + $scope.invoice.appointmentId + '</p>' : ''}
            </div>
        </div>
    </div>
    
    <h4 style="color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 5px;">
        Invoice Items
    </h4>
    <table>
        <thead>
            <tr>
                <th style="width: 5%;">#</th>
                <th style="width: 35%;">Item Name</th>
                <th style="width: 25%;">Description</th>
                <th style="width: 10%;">Type</th>
                <th style="width: 8%;" class="text-right">Qty</th>
                <th style="width: 12%;" class="text-right">Unit Price</th>
                <th style="width: 12%;" class="text-right">Amount</th>
            </tr>
        </thead>
        <tbody>`;
        
        $scope.invoice.items.forEach(function(item, index) {
            var itemTotal = item.quantity * item.unitPrice;
            html += `
            <tr>
                <td style="text-align: center;">${index + 1}</td>
                <td><strong>${item.itemName}</strong></td>
                <td>${item.description || '-'}</td>
                <td>${item.itemType}</td>
                <td class="text-right">${item.quantity}</td>
                <td class="text-right">₹${item.unitPrice.toFixed(2)}</td>
                <td class="text-right">₹${itemTotal.toFixed(2)}</td>
            </tr>`;
        });
        
        html += `
        </tbody>
    </table>
    
    <div class="summary">
        <div class="summary-row">
            <span>Sub Total:</span>
            <span>₹${$scope.invoice.subTotal.toFixed(2)}</span>
        </div>
        ${$scope.invoice.discountAmount > 0 ? `
        <div class="summary-row">
            <span>Discount:</span>
            <span>- ₹${$scope.invoice.discountAmount.toFixed(2)}</span>
        </div>` : ''}
        ${$scope.invoice.taxAmount > 0 ? `
        <div class="summary-row">
            <span>Tax:</span>
            <span>₹${$scope.invoice.taxAmount.toFixed(2)}</span>
        </div>` : ''}
        <div class="summary-row summary-total">
            <span>Total Amount:</span>
            <span>₹${$scope.invoice.totalAmount.toFixed(2)}</span>
        </div>
        <div class="summary-row">
            <span>Paid Amount:</span>
            <span>₹${$scope.invoice.paidAmount.toFixed(2)}</span>
        </div>
        <div class="summary-row" style="font-weight: bold; color: #dc3545;">
            <span>Outstanding:</span>
            <span>₹${$scope.invoice.outstandingAmount.toFixed(2)}</span>
        </div>
    </div>
    
    <div class="footer">
        <p>Thank you for choosing our services!</p>
        <p>This is a computer-generated invoice</p>
    </div>
    
    <div style="text-align: center; margin-top: 20px;">
        <button onclick="window.print()" style="padding: 10px 30px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Print Invoice
        </button>
    </div>
</body>
</html>`;
        
        return html;
    };
    
    /**
     * Get status badge class
     */
    $scope.getStatusBadgeClass = function(status) {
        return BillingService.getStatusBadgeClass(status);
    };
    
    /**
     * Format currency
     */
    $scope.formatCurrency = function(amount) {
        return BillingService.formatCurrency(amount);
    };
    
    /**
     * Back to list
     */
    $scope.backToList = function() {
        $location.path('/billing/invoice/list');
    };
    
    // Initialize
    $scope.init();
}]);
