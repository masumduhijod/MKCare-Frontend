// ============================================
// INVOICE CREATE CONTROLLER
// File: app/controllers/billing/invoice-create.controller.js
// Create invoice after consultation/prescription
// ============================================

app.controller('InvoiceCreateController', ['$scope', '$rootScope', '$location', '$routeParams',
    'BillingService', 'OPDService', 'DoctorService', 'AppointmentService', '$route',
    function ($scope, $rootScope, $location, $routeParams, BillingService, OPDService, DoctorService, AppointmentService, $route, ) {
        if (!$routeParams.consultationId) {
            localStorage.removeItem('pendingInvoiceData');
        }
        var storedData = localStorage.getItem('pendingInvoiceData');
        var consultationData = null;

        if (!$routeParams.consultationId) {
            localStorage.removeItem('pendingInvoiceData');
        }

        if ($routeParams.consultationId && storedData) {
            consultationData = JSON.parse(storedData);
            $scope.consultation = consultationData;

        }


        // Initialize
        $scope.loading = false;
        $scope.consultation = consultationData;
        $scope.doctor = null;

        // Invoice Data
        $scope.invoice = {
            pinNumber: consultationData ? consultationData.pinNumber : '',
            appointmentId: consultationData ? consultationData.appointmentId : '',
            cvrNumber: consultationData ? consultationData.cvrNumber : '',
            doctorId: consultationData ? consultationData.doctorId : '',
            invoiceType: 'OPD',
            discountPercentage: 0,
            taxPercentage: 0,
            isInsuranceClaim: false,
            insuranceProvider: '',
            items: [],
            createdBy: $rootScope.currentUser ? $rootScope.currentUser.username : ''
        };
        $scope.invoice.items = [];
        $scope.consultationFeeAdded = false;

        // Current Item
        $scope.currentItem = {
            itemName: '',
            description: '',
            quantity: 1,
            unitPrice: 0,
            itemType: 'CONSULTATION'
        };

        // Totals
        $scope.totals = {
            subTotal: 0,
            discountAmount: 0,
            taxAmount: 0,
            totalAmount: 0
        };

        // Dropdown Options
        $scope.invoiceTypes = BillingService.getInvoiceTypes();
        $scope.itemTypes = BillingService.getItemTypes();


        $scope.init = function () {
            console.log('Invoice Create initialized');
            $scope.invoice.items = [];
            // Only reset totals and consultation fee flag, DO NOT CLEAR ITEMS HERE
            $scope.consultationFeeAdded = false;

            $scope.totals = {
                subTotal: 0,
                discountAmount: 0,
                taxAmount: 0,
                totalAmount: 0
            };

            // Load doctor details if doctorId available
            if ($scope.invoice.doctorId) {
                $scope.loadDoctorDetails();
            }
        };

        $scope.$watch(function () {
            return $routeParams.consultationId;
        }, function (newVal, oldVal) {

            if (!newVal || newVal === oldVal)
                return;

            console.log('Consultation changed from', oldVal, 'to', newVal);

            // Only reset totals and doctor — do NOT clear items
            $scope.totals = {
                subTotal: 0,
                discountAmount: 0,
                taxAmount: 0,
                totalAmount: 0
            };

            $scope.doctor = null;

            // Reset consultation fee flag so it can be re-added if necessary
            $scope.consultationFeeAdded = false;

            // Reload fresh consultation data
            var storedData = localStorage.getItem('pendingInvoiceData');
            if (storedData) {
                $scope.consultation = JSON.parse(storedData);

                if ($scope.consultation && $scope.consultation.appointmentId) {
                    $scope.loadDoctorDetails();
                }
            }
        });


// Load doctor details from appointment instead of consultation
        $scope.loadDoctorDetails = function () {
            if (!$scope.consultation || !$scope.consultation.appointmentId) {
                console.error('Missing consultation or appointmentId');
                return;
            }

            $scope.loading = true;

            AppointmentService.getById($scope.consultation.appointmentId)
                    .then(function (response) {
                        if (response.data.success) {
                            var doctorId = response.data.data.doctorId;
                            if (doctorId) {
                                DoctorService.getById(doctorId).then(function (res) {
                                    if (res.data.success) {
                                        $scope.doctor = res.data.data;

                                        // 🔹 Remove old consultation fee first
                                        $scope.invoice.items = $scope.invoice.items.filter(function (item) {
                                            return item.itemType !== 'CONSULTATION';
                                        });

                                        // 🔹 Add new consultation fee
//                            $scope.addConsultationFee();
                                    }
                                });
                            }
                        }
                        $scope.loading = false;
                    })
                    .catch(function (err) {
                        console.error('Error fetching appointment/doctor:', err);
                        $scope.loading = false;
                    });
        };

        /**
         * Add item to invoice
         */
        $scope.addItem = function () {
            if (!$scope.currentItem.itemName || !$scope.currentItem.unitPrice) {
                $rootScope.showAlert('warning', 'Please enter item name and price');
                return;
            }

            if ($scope.currentItem.quantity < 1) {
                $rootScope.showAlert('warning', 'Quantity must be at least 1');
                return;
            }

            // Add to items array
            $scope.invoice.items.push(angular.copy($scope.currentItem));

            // Reset current item
            $scope.currentItem = {
                itemName: '',
                description: '',
                quantity: 1,
                unitPrice: 0,
                itemType: 'CONSULTATION'
            };

            // Recalculate totals
            $scope.calculateTotals();
        };

        /**
         * Remove item from invoice
         */
        $scope.removeItem = function (index) {
            if (confirm('Remove this item from invoice?')) {
                $scope.invoice.items.splice(index, 1);
                $scope.calculateTotals();
            }
        };

        /**
         * Calculate totals
         */
        $scope.calculateTotals = function () {
            var result = BillingService.calculateTotals(
                    $scope.invoice.items,
                    $scope.invoice.discountPercentage,
                    $scope.invoice.taxPercentage
                    );

            $scope.totals = result;
        };

        /**
         * Create invoice
         */
        $scope.createInvoice = function () {
            // Validation
            if (!$scope.invoice.pinNumber) {
                $rootScope.showAlert('warning', 'Patient PIN is required');
                return;
            }

            if ($scope.invoice.items.length === 0) {
                $rootScope.showAlert('warning', 'Please add at least one item to the invoice');
                return;
            }
            $scope.calculateTotals();
            // Copy totals into invoice object        
            $scope.invoice.subTotal = $scope.totals.subTotal;
            $scope.invoice.discountAmount = $scope.totals.discountAmount;
            $scope.invoice.taxAmount = $scope.totals.taxAmount;
            $scope.invoice.totalAmount = $scope.totals.totalAmount;

            $scope.showConfirmCreateModal = true;
        };

        $scope.confirmCreateInvoice = function () {
            $scope.showConfirmCreateModal = false;
            $scope.loading = true;

            BillingService.createInvoice($scope.invoice).then(
                    function (response) {
                        $scope.loading = false;

                        if (response.data.success) {
                            var invoice = response.data.data;
                            // ==========================================
                            // ✅ SAVE CVR → INVOICE MAPPING (VERY IMPORTANT)
                            // ==========================================
                            var mapping = JSON.parse(localStorage.getItem('cvrInvoiceMapping') || '{}');

                            if (invoice.cvrNumber) {
                                mapping[invoice.cvrNumber] = {
                                    invoiceNumber: invoice.invoiceNumber,
                                    paid: false
                                };
                                localStorage.setItem('cvrInvoiceMapping', JSON.stringify(mapping));
                                console.log("✅ CVR mapping saved:", invoice.cvrNumber, mapping[invoice.cvrNumber]);
                            }

                            $rootScope.showAlert('success',
                                    'Invoice created successfully!\n' +
                                    'Invoice Number: ' + invoice.invoiceNumber);
                            $rootScope.$broadcast('invoiceCreated', invoice);

                            // Clear pending invoice data
                            localStorage.removeItem('pendingInvoiceData');

                            // Trigger custom modal for payment
                            $scope.createdInvoiceAmount = $scope.totals.totalAmount.toFixed(2);
                            $scope.createdInvoiceNumber = invoice.invoiceNumber;
                            $scope.showConfirmPaymentModal = true;

                        } else {
                            $rootScope.showAlert('danger', response.data.message);
                        }
                    },
                    function (error) {
                        $scope.loading = false;
                        console.error('Error creating invoice:', error);
                        $rootScope.showAlert('danger', 'Failed to create invoice');
                    }
            );
        };
        
        $scope.proceedToPayment = function(proceed) {
            $scope.showConfirmPaymentModal = false;
            if (proceed) {
                $location.path('/billing/payment/' + $scope.createdInvoiceNumber);
            } else {
                $location.path('/billing/invoice/' + $scope.createdInvoiceNumber);
            }
        };

        /**
         * Cancel invoice creation
         */
        $scope.cancelInvoice = function () {
            if (confirm('Cancel invoice creation?\n\nAll data will be lost.')) {
                localStorage.removeItem('pendingInvoiceData');
                $location.path('/dashboard');
            }
        };

        // Initialize
        $scope.init();
    }]);