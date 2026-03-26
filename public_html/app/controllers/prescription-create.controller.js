/**
 * ============================================
 * PRESCRIPTION CREATE CONTROLLER - FIXED
 * ============================================
 * ✅ Separate Save and Print buttons
 * ✅ Redirect to OPD Queue after save
 * ✅ Prevent back button after save
 * ✅ Update completed count
 * ✅ Better error handling
 * ============================================
 */

app.controller('PrescriptionCreateController', ['$scope', '$rootScope', '$location', '$routeParams', '$window',
    'OPDService', 'AppointmentService', 'CVRService',
    function ($scope, $rootScope, $location, $routeParams, $window, OPDService, AppointmentService, CVRService) {

        var consultationId = $routeParams.consultationId;
        var currentUser = $rootScope.currentUser;
        $scope.consultationId = $routeParams.consultationId;
        $scope.isEditMode = $location.search().edit === 'true';

        console.log("Edit Mode:", $scope.isEditMode);


        console.log('========== PRESCRIPTION CREATE ==========');
        console.log('Consultation ID:', consultationId);

        // Initialize
        $scope.loading = false;
        $scope.consultation = null;
        $scope.savedPrescription = null;
        $scope.prescriptionSaved = false; // Track if prescription is saved

        // Prescription Data
        $scope.prescription = {
            consultationId: consultationId,
            consultationNumber: '',
            pinNumber: '',
            doctorId: currentUser ? currentUser.userId : '',
            validityDays: 30,
            instructions: '',
            items: []
        };

        // Current Medicine
        $scope.currentItem = {
            medicineName: '',
            dosage: '',
            frequency: '',
            duration: '',
            quantity: 1,
            instructions: '',
            morning: false,
            afternoon: false,
            evening: false,
            night: false,
            beforeFood: false,
            afterFood: true
        };

        // Common Medicines
        $scope.commonMedicines = [
            {name: 'Paracetamol', dosage: '500mg'},
            {name: 'Amoxicillin', dosage: '500mg'},
            {name: 'Azithromycin', dosage: '500mg'},
            {name: 'Ibuprofen', dosage: '400mg'},
            {name: 'Omeprazole', dosage: '20mg'},
            {name: 'Cetirizine', dosage: '10mg'},
            {name: 'Metformin', dosage: '500mg'},
            {name: 'Pantoprazole', dosage: '40mg'},
            {name: 'Diclofenac', dosage: '50mg'},
            {name: 'Levocetrizine', dosage: '5mg'}
        ];

        // Dropdown Options
        $scope.frequencies = [
            'Once daily',
            'Twice daily',
            'Three times daily',
            'Four times daily',
            'Every 8 hours',
            'Every 12 hours',
            'As needed'
        ];

        $scope.durations = [
            '3 days',
            '5 days',
            '7 days',
            '10 days',
            '15 days',
            '1 month',
            '3 months',
            '6 months'
        ];

        /**
         * ✅ INITIALIZE
         */
        $scope.init = function () {

            if (!consultationId) {
                $rootScope.showAlert('danger', 'Consultation ID not provided');
                $location.path('/opd/list');
                return;
            }

            $scope.loadConsultation();
        };


        /**
         * ✅ LOAD CONSULTATION DETAILS
         */
        $scope.loadConsultation = function () {
            $scope.loading = true;

            OPDService.getConsultationById(consultationId).then(
                    function (response) {
                        $scope.loading = false;

                        if (response.data.success && response.data.data) {
                            $scope.consultation = response.data.data;

                            // Pre-fill basic data
                            $scope.prescription.consultationNumber = $scope.consultation.consultationNumber;
                            $scope.prescription.pinNumber = $scope.consultation.pinNumber;

                            console.log('✅ Consultation loaded:', $scope.consultation);

                            // 🔥 NOW load prescription AFTER consultation
                            if ($scope.isEditMode) {
                                $scope.loadExistingPrescription();
                            }

                        } else {
                            $rootScope.showAlert('danger', 'Consultation not found');
                            $location.path('/opd/list');
                        }
                    },
                    function (error) {
                        $scope.loading = false;
                        console.error('Error loading consultation:', error);
                        $rootScope.showAlert('danger', 'Failed to load consultation details');
                        $location.path('/opd/list');
                    }
            );
        };


        /**
         * ✅ LOAD EXISTING PRESCRIPTION (EDIT MODE)
         */
        $scope.loadExistingPrescription = function () {

            console.log('✏️ Edit Prescription Mode. Consultation ID:',
                    $scope.consultationId);

            $scope.loading = true;

            OPDService.getPrescriptionByConsultationId($scope.consultationId)
                    .then(function (res) {

                        $scope.loading = false;

                        if (res.data && res.data.success && res.data.data) {

                            $scope.prescription = res.data.data;

                            // Safety checks
                            $scope.prescription.items =
                                    $scope.prescription.items || [];

                            $rootScope.showAlert(
                                    'info',
                                    'Editing existing prescription'
                                    );

                        } else {
                            console.log('ℹ️ No existing prescription found');
                        }
                    })
                    .catch(function (err) {
                        $scope.loading = false;
                        console.error(err);
                        $rootScope.showAlert(
                                'danger',
                                'Failed to load existing prescription'
                                );
                    });
        };

        /**
         * ✅ SELECT MEDICINE FROM QUICK SELECT
         */
        $scope.selectMedicine = function (medicine) {
            $scope.currentItem.medicineName = medicine.name;
            $scope.currentItem.dosage = medicine.dosage;
        };

        /**
         * ✅ UPDATE FREQUENCY BASED ON TIMING
         */
        $scope.updateFrequency = function () {
            var count = 0;
            if ($scope.currentItem.morning)
                count++;
            if ($scope.currentItem.afternoon)
                count++;
            if ($scope.currentItem.evening)
                count++;
            if ($scope.currentItem.night)
                count++;

            if (count === 1) {
                $scope.currentItem.frequency = 'Once daily';
            } else if (count === 2) {
                $scope.currentItem.frequency = 'Twice daily';
            } else if (count === 3) {
                $scope.currentItem.frequency = 'Three times daily';
            } else if (count === 4) {
                $scope.currentItem.frequency = 'Four times daily';
            }
        };

        /**
         * ✅ ADD MEDICINE TO PRESCRIPTION
         */
        $scope.addMedicine = function () {
            // Validation
            if (!$scope.currentItem.medicineName) {
                $rootScope.showAlert('warning', 'Please enter medicine name');
                return;
            }

            if (!$scope.currentItem.dosage) {
                $rootScope.showAlert('warning', 'Please enter dosage');
                return;
            }

            if (!$scope.currentItem.frequency) {
                $rootScope.showAlert('warning', 'Please select frequency');
                return;
            }

            if (!$scope.currentItem.duration) {
                $rootScope.showAlert('warning', 'Please select duration');
                return;
            }

            // Add to items
            $scope.prescription.items.push(angular.copy($scope.currentItem));

            console.log('✅ Medicine added:', $scope.currentItem.medicineName);

            // Reset current item
            $scope.currentItem = {
                medicineName: '',
                dosage: '',
                frequency: '',
                duration: '',
                quantity: 1,
                instructions: '',
                morning: false,
                afternoon: false,
                evening: false,
                night: false,
                beforeFood: false,
                afterFood: true
            };

            $rootScope.showAlert('success', 'Medicine added to prescription');
        };

        /**
         * ✅ REMOVE MEDICINE
         */
        $scope.removeMedicine = function (index) {
            $rootScope.showGlobalConfirm({
                title: 'Remove Medicine',
                message: 'Remove this medicine from prescription?',
                type: 'warning',
                okText: 'Yes, Remove',
                onConfirm: function() {
                    $scope.prescription.items.splice(index, 1);
                    $rootScope.showAlert('info', 'Medicine removed');
                }
            });
        };

        /**
         * ✅ SAVE PRESCRIPTION (Main Function)
         */
        $scope.savePrescription = function () {
            console.log('========== SAVING PRESCRIPTION ==========');

            // Validation
            if ($scope.prescription.items.length === 0) {
                $rootScope.showAlert('warning', 'Please add at least one medicine');
                return;
            }

            if (!$scope.prescription.validityDays || $scope.prescription.validityDays < 1) {
                $rootScope.showAlert('warning', 'Please enter valid validity days');
                return;
            }

            $rootScope.showGlobalConfirm({
                title: 'Save Prescription',
                message: 'Save prescription with ' + $scope.prescription.items.length + ' medicine(s)?',
                type: 'info',
                okText: 'Yes, Save',
                onConfirm: function() {
                    $scope.executeSavePrescription();
                }
            });
        };

        $scope.executeSavePrescription = function() {
            $scope.loading = true;
            var request;

            if ($scope.isEditMode) {
                request = OPDService.updatePrescription($scope.prescription);
            } else {
                request = OPDService.createPrescription($scope.prescription);
            }
            
            request.then(
                    function (response) {
                        $scope.loading = false;

                        if (response.data.success) {
                            $scope.savedPrescription = response.data.data;
                            $scope.prescriptionSaved = true;

                            console.log('✅ Prescription saved successfully:', $scope.savedPrescription);

                            $rootScope.showAlert('success', '✅ Prescription saved successfully!');

                            // ✅ COMPLETE THE CONSULTATION
                            $scope.completeConsultation();

                            // ✅ REDIRECT TO INVOICE LIST AFTER SAVE / EDIT
                            setTimeout(function () {
                                console.log("👉 NOW GOING TO /billing/invoice/list");
                                $scope.$apply(function () {
                                    $location.path('/billing/invoice/list').replace();
                                });
                            }, 600);

                        } else {
                            $rootScope.showAlert('danger', response.data.message || 'Failed to save prescription');
                        }
                    },
                    function (error) {
                        $scope.loading = false;
                        console.error('Error saving prescription:', error);

                        var errorMsg = 'Failed to save prescription';
                        if (error.data && error.data.message) {
                            errorMsg = error.data.message;
                        }

                        $rootScope.showAlert('danger', errorMsg);
                    }
            );
        };

        /**
         * ✅ COMPLETE CONSULTATION (Update status)
         */
        $scope.completeConsultation = function () {
            if (!$scope.consultation || !$scope.consultation.consultationId) {
                return;
            }

            OPDService.completeConsultation($scope.consultation.consultationId).then(
                    function (response) {
                        console.log('✅ Consultation marked as completed');

                        // ✅ UPDATE CVR STATUS TO COMPLETED
                        if ($scope.consultation.cvrNumber) {
                            $scope.completeCVR($scope.consultation.cvrNumber);
                        }

                        // ✅ UPDATE APPOINTMENT STATUS TO COMPLETED
                        if ($scope.consultation.appointmentId) {
                            $scope.completeAppointment($scope.consultation.appointmentId);
                        }
                    },
                    function (error) {
                        console.error('Error completing consultation:', error);
                    }
            );
        };

        /**
         * ✅ COMPLETE CVR
         */
        $scope.completeCVR = function (cvrNumber) {
            CVRService.completeConsultation(cvrNumber).then(
                    function (response) {
                        console.log('✅ CVR marked as completed');
                    },
                    function (error) {
                        console.error('Error completing CVR:', error);
                    }
            );
        };

        /**
         * ✅ COMPLETE APPOINTMENT
         */
        $scope.completeAppointment = function (appointmentId) {
            AppointmentService.completeConsultation(appointmentId).then(
                    function (response) {
                        console.log('✅ Appointment marked as completed');
                    },
                    function (error) {
                        console.error('Error completing appointment:', error);
                    }
            );
        };

        /**
         * ✅ PRINT PRESCRIPTION
         */
        $scope.printPrescription = function () {
            if ($scope.prescription.items.length === 0) {
                $rootScope.showAlert('warning', 'Please add medicines before printing');
                return;
            }

            // Open print preview
            $window.print();
        };

        /**
         * ✅ CANCEL PRESCRIPTION
         */
        $scope.cancelPrescription = function () {
            if ($scope.prescriptionSaved) {
                $location.path('/opd/list');
                return;
            }

            if ($scope.prescription.items.length > 0) {
                $rootScope.showGlobalConfirm({
                    title: 'Discard Prescription?',
                    message: 'All added medicines will be lost.',
                    type: 'danger',
                    okText: 'Yes, Discard',
                    onConfirm: function() {
                        $location.path('/opd/list');
                    }
                });
            } else {
                $location.path('/opd/list');
            }
        };

        // Initialize
        $scope.init();
    }]);