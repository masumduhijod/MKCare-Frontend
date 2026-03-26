// ============================================
// PAYMENT PROCESSING CONTROLLER
// File: app/controllers/billing/payment-processing.controller.js
// Process payments for invoices
// ============================================

app.controller('PaymentProcessingController', ['$scope', '$rootScope', '$location', '$routeParams',
    'BillingService','PatientService',
    function($scope, $rootScope, $location, $routeParams, BillingService,PatientService,) {
    
    var invoiceNumber = $routeParams.invoiceNumber;
    
    // Initialize
    $scope.loading = false;
    $scope.invoice = null;
    $scope.paymentHistory = [];
    
    // Payment Data
    $scope.payment = {
        invoiceNumber: invoiceNumber,
        amount: 0,
        paymentMode: 'CASH',
        transactionId: '',
        paymentDate: new Date(),
        receivedBy: $rootScope.currentUser ? $rootScope.currentUser.username : ''
    };
    
    // Dropdown Options
    $scope.paymentModes = BillingService.getPaymentModes();
    
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
                    // ✅ FORCE CALCULATED OUTSTANDING (do NOT trust backend blindly)
$scope.invoice.totalAmount = Number($scope.invoice.totalAmount || 0);
$scope.invoice.paidAmount  = Number($scope.invoice.paidAmount || 0);
$scope.invoice.outstandingAmount = 
    $scope.invoice.totalAmount - $scope.invoice.paidAmount;
                    
if ($scope.invoice.outstandingAmount < 0) {
    $scope.invoice.outstandingAmount = 0;
}
                    // =======================================
// ✅ FORCE STATUS BASED ON OUTSTANDING
// =======================================
// ✅ CORRECT PAYMENT STATUS CHECK
if ($scope.invoice.paidAmount >= $scope.invoice.totalAmount && $scope.invoice.totalAmount > 0) {
    $scope.invoice.paymentStatus = 'PAID';
} else {
    $scope.invoice.paymentStatus = 'PENDING';
}

                    // Set default payment amount to outstanding amount
                    $scope.payment.amount = $scope.invoice.outstandingAmount;
                    
                    console.log('Invoice loaded:', $scope.invoice);
                    // ✅ Ensure patient name and PIN never show as null
$scope.invoice.patientName = $scope.invoice.patientName || 'Unknown Patient';
$scope.invoice.pinNumber   = $scope.invoice.pinNumber   || '';

if ($scope.invoice.pinNumber) {
    // replace PatientService with whatever service you use for patients
    PatientService.getByPin($scope.invoice.pinNumber)
        .then(function(res) {
            if (res.data.success && res.data.data) {
                // update patient name if real value exists
                $scope.invoice.patientName = res.data.data.fullName || $scope.invoice.patientName;
            }
        })
        .catch(function(err) {
            console.warn('Could not load patient details', err);
        });
}
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
     * Validate payment amount
     */
    $scope.validateAmount = function() {
        if ($scope.payment.amount <= 0) {
            $rootScope.showAlert('warning', 'Payment amount must be greater than 0');
            return false;
        }
        
        if ($scope.payment.amount > $scope.invoice.outstandingAmount) {
            $rootScope.showAlert('warning', 
                'Payment amount cannot exceed outstanding amount of ₹' + 
                $scope.invoice.outstandingAmount.toFixed(2));
            return false;
        }
        
        return true;
    };
    
    /**
     * Process payment
     */
    $scope.processPayment = function() {
        // Validation
        if (!$scope.validateAmount()) {
            return;
        }
        
        // Transaction ID validation for non-cash payments
        if ($scope.payment.paymentMode !== 'CASH' && !$scope.payment.transactionId) {
            $rootScope.showAlert('warning', 'Transaction ID is required for ' + $scope.payment.paymentMode);
            return;
        }
        
        // For cash, set transaction ID
        if ($scope.payment.paymentMode === 'CASH') {
            $scope.payment.transactionId = 'CASH-' + new Date().getTime();
        }
        
        $scope.showConfirmProcessModal = true;
    };
    
    $scope.confirmProcessPayment = function() {
        $scope.showConfirmProcessModal = false;
        $scope.loading = true;
        
        BillingService.processPayment(invoiceNumber, $scope.payment).then(
            function(response) {
                $scope.loading = false;
                
                if (response.data.success) {
                    var payment = response.data.data;
                    $scope.completedPayment = payment;
                    
                    $rootScope.showAlert('success', 
                        'Payment processed successfully!\n' +
                        'Payment ID: ' + payment.paymentId + '\n' +
                        'Amount: ₹' + payment.amount.toFixed(2));
                    $rootScope.$broadcast('consultationPaid', invoiceNumber);

                    // ✅ STORE INVOICE NUMBER AND CVR MAPPING
                    var paidInvoices = JSON.parse(localStorage.getItem('paidInvoices') || '[]');
                    var cvrMapping = JSON.parse(localStorage.getItem('cvrInvoiceMapping') || '{}');

                    // Store invoice as paid
                    if (!paidInvoices.includes(invoiceNumber)) {
                        paidInvoices.push(invoiceNumber);
                        localStorage.setItem('paidInvoices', JSON.stringify(paidInvoices));
                    }
                    if ($scope.invoice.cvrNumber) {
                        // keep existing mapping if present
                        var existing = cvrMapping[$scope.invoice.cvrNumber] || {};
                        cvrMapping[$scope.invoice.cvrNumber] = {
                            invoiceNumber: invoiceNumber,
                            paid: true,                         // ✅ THIS IS WHAT LIST EXPECTS
                            paidAt: new Date().toISOString()
                        };
                        localStorage.setItem('cvrInvoiceMapping', JSON.stringify(cvrMapping));
                        console.log('✅ Payment marked PAID for CVR:', $scope.invoice.cvrNumber);
                    }

                    console.log('✅ Stored paid invoice in localStorage:', invoiceNumber);
                    
                    // Reload invoice and payment history
                    $scope.loadInvoice();
                    $scope.loadPaymentHistory();
                    
                    // Reset payment form
                    $scope.payment = {
                        invoiceNumber: invoiceNumber,
                        amount: 0,
                        paymentMode: 'CASH',
                        transactionId: '',
                        paymentDate: new Date(),
                        receivedBy: $rootScope.currentUser.username
                    };
                    
                    // Show custom print receipt modal
                    $scope.showConfirmReceiptModal = true;
                } else {
                    $rootScope.showAlert('danger', response.data.message);
                }
            },
            function(error) {
                $scope.loading = false;
                console.error('Error processing payment:', error);
                $rootScope.showAlert('danger', 'Failed to process payment');
            }
        );
    };

    $scope.proceedToReceipt = function(print) {
        $scope.showConfirmReceiptModal = false;
        if (print && $scope.completedPayment) {
            $scope.printReceipt($scope.completedPayment);
        }
    };
    
    /**
     * Print receipt
     */


    $scope.printReceipt = function(payment) {
        console.log("Payment object from API:", payment);
        var printWindow = window.open('', '_blank', 'width=800,height=900');
        if (!printWindow) {
            alert("Popup blocked! Please allow popups for this site.");
            return;
        }
        
        var cvrNumberHtml = $scope.invoice.cvrNumber ? 
            `<div class="info-item"><span class="info-label">CVR No.</span><span class="info-value fw-bold">${$scope.invoice.cvrNumber}</span></div>` : '';
            
        var receiptHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Payment Receipt - ${payment.invoiceNumber}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        :root {
            --primary: #2a5298;
            --primary-dark: #1e3c72;
            --success: #10b981;
            --text-dark: #1f2937;
            --text-muted: #6b7280;
            --border-light: #e5e7eb;
            --bg-light: #f9fafb;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body { 
            font-family: 'Inter', system-ui, -apple-system, sans-serif; 
            color: var(--text-dark);
            line-height: 1.5;
            background: #e2e8f0;
            padding: 2rem;
            -webkit-font-smoothing: antialiased;
        }
        
        .receipt-container {
            max-width: 750px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .receipt-header {
            background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%);
            padding: 2rem;
            color: white;
            text-align: center;
            border-bottom: 5px solid var(--success);
        }
        
        .clinic-name {
            font-size: 1.75rem;
            font-weight: 800;
            margin-bottom: 0.25rem;
            letter-spacing: 0.5px;
        }
        
        .clinic-tagline {
            font-size: 0.9rem;
            opacity: 0.85;
            margin-bottom: 1.5rem;
        }
        
        .receipt-title {
            text-transform: uppercase;
            font-size: 1.25rem;
            font-weight: 700;
            letter-spacing: 2px;
            background: rgba(255, 255, 255, 0.2);
            padding: 0.5rem 1.5rem;
            border-radius: 50px;
            display: inline-block;
        }
        
        .receipt-body {
            padding: 2.5rem 3rem;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
            margin-bottom: 2.5rem;
        }
        
        .info-item {
            display: flex;
            flex-direction: column;
        }
        
        .info-label {
            font-size: 0.75rem;
            text-transform: uppercase;
            color: var(--text-muted);
            font-weight: 600;
            letter-spacing: 0.5px;
            margin-bottom: 0.2rem;
        }
        
        .info-value {
            font-size: 1rem;
            font-weight: 500;
            color: var(--text-dark);
        }
        
        .fw-bold { font-weight: 700 !important; }
        .text-primary { color: var(--primary); }
        .text-success { color: var(--success); }
        
        .amount-section {
            background: var(--bg-light);
            border-radius: 12px;
            padding: 2rem;
            margin-bottom: 2.5rem;
            border: 1px solid var(--border-light);
        }
        
        .amount-row {
            display: flex;
            justify-content: space-between;
            padding: 0.75rem 0;
            border-bottom: 1px dashed var(--border-light);
        }
        
        .amount-row:last-child {
            border-bottom: none;
            padding-bottom: 0;
        }
        
        .amount-label {
            color: var(--text-muted);
            font-weight: 500;
        }
        
        .amount-value {
            font-weight: 600;
        }
        
        .total-paid {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 8px;
            padding: 1.25rem 1.5rem;
            margin-top: 1rem;
        }
        
        .total-paid-label {
            font-size: 1.1rem;
            font-weight: 700;
            color: var(--success);
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .total-paid-amount {
            font-size: 2rem;
            font-weight: 800;
            color: var(--success);
        }
        
        .payment-details {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
            background: #fff;
            padding: 1.5rem;
            border-radius: 8px;
            border: 1px solid var(--border-light);
            margin-top: -1rem;
            margin-bottom: 2.5rem;
        }
        
        .detail-col {
            text-align: center;
        }
        
        .detail-label {
            font-size: 0.7rem;
            text-transform: uppercase;
            color: var(--text-muted);
            font-weight: 600;
            margin-bottom: 0.25rem;
        }
        
        .detail-value {
            font-size: 0.95rem;
            font-weight: 600;
        }
        
        .footer {
            text-align: center;
            color: var(--text-muted);
            font-size: 0.85rem;
            margin-top: 2rem;
            padding-top: 1.5rem;
            border-top: 1px solid var(--border-light);
        }
        
        .signature-box {
            display: flex;
            justify-content: space-between;
            margin-top: 3rem;
            padding: 0 2rem;
        }
        
        .sig-line {
            width: 200px;
            border-top: 1px solid #9ca3af;
            text-align: center;
            padding-top: 0.5rem;
            font-size: 0.8rem;
            color: var(--text-muted);
        }
        
        .action-buttons {
            text-align: center;
            margin-top: 2rem;
            display: flex;
            justify-content: center;
            gap: 1rem;
        }
        
        .btn {
            background: var(--primary);
            color: white;
            border: none;
            padding: 0.75rem 2rem;
            font-size: 1rem;
            font-weight: 600;
            border-radius: 50px;
            cursor: pointer;
            box-shadow: 0 4px 6px rgba(42, 82, 152, 0.2);
            transition: transform 0.2s, box-shadow 0.2s;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            outline: none;
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(42, 82, 152, 0.3);
        }
        
        @media print {
            body { 
                background: white; 
                padding: 0;
                margin: 0;
            }
            .receipt-container { 
                box-shadow: none; 
                border-radius: 0;
                max-width: 100%;
            }
            .action-buttons { 
                display: none; 
            }
        }
    </style>
</head>
<body>
    
    <div class="receipt-container">
        <!-- HEADER -->
        <div class="receipt-header">
            <div class="clinic-name">APOLLO CLINIC</div>
            <div class="clinic-tagline">Advanced Healthcare & Diagnostic Center</div>
            <div class="receipt-title">Payment Receipt</div>
        </div>
        
        <div class="receipt-body">
            <!-- PATIENT INFO GRID -->
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Patient Name</span>
                    <span class="info-value fw-bold text-primary">${$scope.invoice.patientName}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Patient PIN</span>
                    <span class="info-value fw-bold">${$scope.invoice.pinNumber}</span>
                </div>
                <!-- CVR INFO injected dynamically -->
                ${cvrNumberHtml}
                <div class="info-item">
                    <span class="info-label">Invoice / Receipt No.</span>
                    <span class="info-value">${payment.invoiceNumber} / ${payment.paymentId}</span>
                </div>
            </div>
            
            <!-- AMOUNT SECTION -->
            <h4 style="margin-bottom: 1rem; color: var(--primary-dark); border-bottom: 2px solid var(--border-light); padding-bottom: 0.5rem;">Payment Summary</h4>
            <div class="amount-section">
                <div class="amount-row">
                    <span class="amount-label">Total Invoice Amount</span>
                    <span class="amount-value">₹${$scope.invoice.totalAmount.toFixed(2)}</span>
                </div>
                <div class="amount-row">
                    <span class="amount-label">Previously Paid</span>
                    <span class="amount-value">₹${($scope.invoice.paidAmount - payment.amount).toFixed(2)}</span>
                </div>
                
                <div class="total-paid">
                    <div class="total-paid-label">Amount Paid Now</div>
                    <div class="total-paid-amount">₹${payment.amount.toFixed(2)}</div>
                </div>
                
                <div class="amount-row" style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-light);">
                    <span class="amount-label fw-bold">Outstanding Balance</span>
                    <span class="amount-value fw-bold text-primary">₹${($scope.invoice.outstandingAmount).toFixed(2)}</span>
                </div>
            </div>
            
            <!-- PAYMENT DETAILS -->
            <div class="payment-details">
                <div class="detail-col" style="border-right: 1px solid var(--border-light);">
                    <div class="detail-label">Payment Date & Time</div>
                    <div class="detail-value">${new Date(payment.paymentDate).toLocaleString('en-IN', {day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit'})}</div>
                </div>
                <div class="detail-col" style="border-right: 1px solid var(--border-light);">
                    <div class="detail-label">Payment Mode</div>
                    <div class="detail-value">${payment.paymentMode}</div>
                </div>
                <div class="detail-col">
                    <div class="detail-label">Transaction ID</div>
                    <div class="detail-value">${payment.transactionId || 'N/A'}</div>
                </div>
            </div>
            
            <!-- SIGNATURES -->
            <div class="signature-box">
                <div class="sig-line">
                    <br>Patient's Signature
                </div>
                <div class="sig-line">
                    <strong>${payment.receivedBy || 'Authorized Signatory'}</strong><br>
                    Received By
                </div>
            </div>
            
            <!-- FOOTER -->
            <div class="footer">
                <p>Thank you for choosing Apollo Clinic for your healthcare needs.</p>
                <p style="margin-top: 0.25rem; font-size: 0.75rem;">This is a computer-generated receipt and does not require a physical signature.</p>
            </div>
        </div>
    </div>
    
    <!-- ACTION BUTTONS (Hidden in print) -->
    <div class="action-buttons">
        <button class="btn" onclick="window.print()">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            Print Receipt
        </button>
        <button class="btn" style="background: #4b5563;" onclick="window.close()">
            Close Window
        </button>
    </div>
    
    <script>
        // Optional: auto-trigger print when loaded
        // window.onload = function() { setTimeout(window.print, 500); };
    </script>
</body>
</html>`;
        
        printWindow.document.write(receiptHtml);
        printWindow.document.close();
        printWindow.focus();
    };
    
    /**
     * View invoice details
     */
    $scope.viewInvoice = function() {
        $location.path('/billing/invoice/' + invoiceNumber);
    };
    
    /**
     * Back to invoice list
     */
    $scope.backToList = function() {
        $location.path('/billing/invoice/list');
    };
    
    // Initialize
    $scope.init();
}]);