/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Invoice Create Controller
 * Create billing invoice with items
 */

app.controller('InvoiceCreateController', ['$scope', '$rootScope', '$location', '$routeParams',
    'BillingService', 'PatientService', 'DoctorService', 'AuthService',
    function($scope, $rootScope, $location, $routeParams, BillingService, PatientService, DoctorService, AuthService) {
    
    var currentUser = AuthService.getCurrentUser();
    
    // Invoice Data
    $scope.invoice = {
        pinNumber: $routeParams.pinNumber || '',
        appointmentId: $routeParams.appointmentId || '',
        cvrNumber: $routeParams.cvrNumber || '',
        doctorId: '',
        invoiceType: 'OPD',
        discountPercentage: 0,
        taxPercentage: 0,
        isInsuranceClaim: false,
        insuranceProvider: '',
        items: [],
        createdBy: currentUser ? currentUser.username : ''
    };
    
    // Current Item
    $scope.currentItem = {
        itemName: '',
        description: '',
        quantity: 1,
        unitPrice: 0,
        itemType: 'Consultation'
    };
    
    // Calculations
    $scope.calculations = {
        subTotal: 0,
        discountAmount: 0,
        taxAmount: 0,
        totalAmount: 0
    };
    
    $scope.patient = null;
    $scope.loading = false;
    $scope.createdInvoice = null;
    
    // Item Types
    $scope.itemTypes = ['Consultation', 'Medicine', 'Test', 'Procedure', 'Other'];
    
    // Invoice Types
    $scope.invoiceTypes = ['OPD', 'IPD', 'Emergency', 'Pharmacy', 'Laboratory'];
    
    // Common Services with Prices
    $scope.commonServices = [
        { name: 'General Consultation', price: 500, type: 'Consultation' },
        { name: 'Specialist Consultation', price: 1000, type: 'Consultation' },
        { name: 'Follow-up Consultation', price: 300, type: 'Consultation' },
        { name: 'Blood Test - CBC', price: 300, type: 'Test' },
        { name: 'Blood Test - Sugar', price: 150, type: 'Test' },
        { name: 'X-Ray', price: 500, type: 'Test' },
        { name: 'ECG', price: 400, type: 'Test' },
        { name: 'Ultrasound', price: 1200, type: 'Test' },
        { name: 'Dressing', price: 200, type: 'Procedure' },
        { name: 'Injection', price: 150, type: 'Procedure' }
    ];
    
    /**
     * Load Patient
     */
    $scope.loadPatient = function() {
        if (!$scope.invoice.pinNumber) {
            return;
        }
        
        PatientService.getByPin($scope.invoice.pinNumber)
            .then(function(response) {
                if (response.data.success) {
                    $scope.patient = response.data.data;
                    
                    // Check insurance
                    if ($scope.patient.insuranceProvider) {
                        $scope.invoice.isInsuranceClaim = true;
                        $scope.invoice.insuranceProvider = $scope.patient.insuranceProvider;
                    }
                }
            })
            .catch(function(error) {
                console.error('Error loading patient:', error);
            });
    };
    
    /**
     * Search Patient
     */
    $scope.searchPatient = function() {
        if (!$scope.searchQuery) {
            $rootScope.showAlert('warning', 'Please enter PIN or contact number');
            return;
        }
        
        $scope.loading = true;
        
        // Try by PIN
        PatientService.getByPin($scope.searchQuery)
            .then(function(response) {
                handlePatientResponse(response);
            })
            .catch(function(error) {
                // Try by contact
                PatientService.getByContact($scope.searchQuery)
                    .then(function(response) {
                        handlePatientResponse(response);
                    })
                    .catch(function(error) {
                        $scope.loading = false;
                        $rootScope.showAlert('danger', 'Patient not found');
                    });
            });
    };
    
    function handlePatientResponse(response) {
        $scope.loading = false;
        
        if (response.data.success) {
            $scope.patient = response.data.data;
            $scope.invoice.pinNumber = $scope.patient.pinNumber;
            
            // Check insurance
            if ($scope.patient.insuranceProvider) {
                $scope.invoice.isInsuranceClaim = true;
                $scope.invoice.insuranceProvider = $scope.patient.insuranceProvider;
            }
            
            $rootScope.showAlert('success', 'Patient found: ' + $scope.patient.fullName);
        }
    }
    
    /**
     * Select Common Service
     */
    $scope.selectCommonService = function(service) {
        $scope.currentItem.itemName = service.name;
        $scope.currentItem.unitPrice = service.price;
        $scope.currentItem.itemType = service.type;
    };
    
    /**
     * Add Item to Invoice
     */
    $scope.addItem = function() {
        // Validation
        if (!$scope.currentItem.itemName) {
            $rootScope.showAlert('warning', 'Please enter item name');
            return;
        }
        
        if (!$scope.currentItem.unitPrice || $scope.currentItem.unitPrice <= 0) {
            $rootScope.showAlert('warning', 'Please enter valid price');
            return;
        }
        
        // Calculate item total
        var itemTotal = $scope.currentItem.quantity * $scope.currentItem.unitPrice;
        $scope.currentItem.totalPrice = itemTotal;
        
        // Add to items
        $scope.invoice.items.push(angular.copy($scope.currentItem));
        
        // Reset current item
        $scope.resetCurrentItem();
        
        // Recalculate
        $scope.calculateTotals();
        
        $rootScope.showAlert('success', 'Item added to invoice');
    };
    
    /**
     * Remove Item
     */
    $scope.removeItem = function(index) {
        if (confirm('Remove this item from invoice?')) {
            $scope.invoice.items.splice(index, 1);
            $scope.calculateTotals();
            $rootScope.showAlert('info', 'Item removed');
        }
    };
    
    /**
     * Reset Current Item
     */
    $scope.resetCurrentItem = function() {
        $scope.currentItem = {
            itemName: '',
            description: '',
            quantity: 1,
            unitPrice: 0,
            itemType: 'Consultation'
        };
    };
    
    /**
     * Calculate Totals
     */
    $scope.calculateTotals = function() {
        // Calculate subtotal
        $scope.calculations.subTotal = 0;
        $scope.invoice.items.forEach(function(item) {
            $scope.calculations.subTotal += item.quantity * item.unitPrice;
        });
        
        // Calculate discount
        $scope.calculations.discountAmount = 
            ($scope.calculations.subTotal * $scope.invoice.discountPercentage) / 100;
        
        // Calculate tax
        var afterDiscount = $scope.calculations.subTotal - $scope.calculations.discountAmount;
        $scope.calculations.taxAmount = 
            (afterDiscount * $scope.invoice.taxPercentage) / 100;
        
        // Calculate total
        $scope.calculations.totalAmount = 
            afterDiscount + $scope.calculations.taxAmount;
    };
    
    /**
     * Create Invoice
     */
    $scope.createInvoice = function() {
        // Validation
        if (!$scope.patient) {
            $rootScope.showAlert('warning', 'Please select a patient');
            return;
        }
        
        if ($scope.invoice.items.length === 0) {
            $rootScope.showAlert('warning', 'Please add at least one item');
            return;
        }
        
        $scope.loading = true;
        
        BillingService.createInvoice($scope.invoice)
            .then(function(response) {
                $scope.loading = false;
                
                if (response.data.success) {
                    $scope.createdInvoice = response.data.data;
                    $rootScope.showAlert('success', 'Invoice created successfully!\nInvoice Number: ' + 
                                       $scope.createdInvoice.invoiceNumber);
                    
                    // Ask to process payment
                    var processPayment = confirm('Invoice created!\nInvoice Number: ' + 
                                                $scope.createdInvoice.invoiceNumber + 
                                                '\nTotal: ₹' + $scope.createdInvoice.totalAmount +
                                                '\n\nDo you want to process payment now?');
                    
                    if (processPayment) {
                        $location.path('/billing/payment').search({
                            invoiceNumber: $scope.createdInvoice.invoiceNumber
                        });
                    } else {
                        $scope.printInvoice();
                    }
                } else {
                    $rootScope.showAlert('danger', response.data.message || 'Failed to create invoice');
                }
            })
            .catch(function(error) {
                $scope.loading = false;
                $rootScope.showAlert('danger', 'Error creating invoice');
            });
    };
    
    /**
     * Print Invoice
     */
    $scope.printInvoice = function() {
        window.print();
        $location.path('/dashboard');
    };
    
    /**
     * Cancel
     */
    $scope.cancel = function() {
        if (confirm('Cancel invoice creation? All items will be lost.')) {
            $location.path('/dashboard');
        }
    };
    
    // Watch for discount/tax changes
    $scope.$watch('invoice.discountPercentage', function() {
        $scope.calculateTotals();
    });
    
    $scope.$watch('invoice.taxPercentage', function() {
        $scope.calculateTotals();
    });
    
    // Initialize
    if ($scope.invoice.pinNumber) {
        $scope.loadPatient();
    }
}]);
