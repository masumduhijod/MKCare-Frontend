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

app.controller('PrescriptionCreateController', ['$scope', '$rootScope', '$location', '$routeParams', '$window', '$q', '$timeout',
    'OPDService', 'AppointmentService', 'CVRService', 'PatientService',
    function ($scope, $rootScope, $location, $routeParams, $window, $q, $timeout, OPDService, AppointmentService, CVRService, PatientService) {

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

                            // FETCH PATIENT DATA FOR UI AND PRINT
                            if ($scope.consultation.pinNumber) {
                                PatientService.getByPin($scope.consultation.pinNumber).then(function(pRes) {
                                    if (pRes.data && pRes.data.success && pRes.data.data) {
                                        var p = pRes.data.data;
                                        $scope.consultation.patientName = p.firstName + (p.lastName ? ' ' + p.lastName : '');
                                        $scope.consultation.patientAge = p.age || '';
                                        $scope.consultation.patientGender = p.gender || '';
                                    }
                                });
                            }

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
            // Quick defaults to save clicks
            $scope.currentItem.morning = true;
            $scope.currentItem.afternoon = false;
            $scope.currentItem.evening = false;
            $scope.currentItem.night = true;
            $scope.currentItem.frequency = 'Twice daily';
            $scope.currentItem.duration = '5 days';
            $scope.currentItem.afterFood = true;
            $scope.currentItem.beforeFood = false;
            $scope.calculateQuantity();
        };

        /**
         * ✅ ON MEDICINE SELECT FROM LOV
         */
        $scope.onMedicineSelect = function(medicine) {
            console.log("Selected Medicine from LOV:", medicine);
            $scope.currentItem.medicineName = medicine.medicineName;
            
            // Format dosage from strength and unit
            if (medicine.strength && medicine.unit) {
                $scope.currentItem.dosage = medicine.strength + ' ' + medicine.unit;
            } else if (medicine.strength) {
                $scope.currentItem.dosage = medicine.strength;
            } else {
                $scope.currentItem.dosage = '';
            }

            // Set default timing based on type if needed, or just defaults
            $scope.currentItem.morning = true;
            $scope.currentItem.afternoon = false;
            $scope.currentItem.evening = false;
            $scope.currentItem.night = true;
            $scope.currentItem.frequency = 'Twice daily';
            $scope.currentItem.duration = '5 days';
            $scope.currentItem.afterFood = true;
            $scope.currentItem.beforeFood = false;
            
            // If medicine has composition, add it to instructions or log it
            if (medicine.composition) {
                $scope.currentItem.instructions = medicine.composition;
            }
            
            $scope.calculateQuantity();
        };

        /**
         * ✅ UPDATE FREQUENCY BASED ON TIMING
         */
        $scope.calculateQuantity = function () {
            var days = 0;
            if ($scope.currentItem.duration) {
                if ($scope.currentItem.duration.includes('day')) {
                    days = parseInt($scope.currentItem.duration);
                } else if ($scope.currentItem.duration.includes('month')) {
                    days = 30 * parseInt($scope.currentItem.duration);
                } else if ($scope.currentItem.duration.includes('week')) {
                    days = 7 * parseInt($scope.currentItem.duration);
                }
            }

            var daily = 0;
            if ($scope.currentItem.morning) daily++;
            if ($scope.currentItem.afternoon) daily++;
            if ($scope.currentItem.evening) daily++;
            if ($scope.currentItem.night) daily++;

            if (days > 0 && daily > 0) {
                $scope.currentItem.quantity = days * daily;
            } else if ($scope.currentItem.duration && $scope.currentItem.frequency) {
               // Fallback if timings aren't checked
               var f = $scope.currentItem.frequency;
               if (f === 'Once daily') daily = 1;
               else if (f === 'Twice daily' || f === 'Every 12 hours') daily = 2;
               else if (f === 'Three times daily' || f === 'Every 8 hours') daily = 3;
               else if (f === 'Four times daily') daily = 4;
               
               if (days > 0 && daily > 0) $scope.currentItem.quantity = days * daily;
            }
        };

        $scope.updateFrequency = function () {
            var count = 0;
            if ($scope.currentItem.morning) count++;
            if ($scope.currentItem.afternoon) count++;
            if ($scope.currentItem.evening) count++;
            if ($scope.currentItem.night) count++;

            if (count === 1) $scope.currentItem.frequency = 'Once daily';
            else if (count === 2) $scope.currentItem.frequency = 'Twice daily';
            else if (count === 3) $scope.currentItem.frequency = 'Three times daily';
            else if (count === 4) $scope.currentItem.frequency = 'Four times daily';
            
            $scope.calculateQuantity();
        };

        $scope.updateTimingsFromFrequency = function () {
            var f = $scope.currentItem.frequency;
            $scope.currentItem.morning = false;
            $scope.currentItem.afternoon = false;
            $scope.currentItem.evening = false;
            $scope.currentItem.night = false;
            
            if (f === 'Once daily') {
                $scope.currentItem.morning = true;
            } else if (f === 'Twice daily' || f === 'Every 12 hours') {
                $scope.currentItem.morning = true;
                $scope.currentItem.night = true;
            } else if (f === 'Three times daily' || f === 'Every 8 hours') {
                $scope.currentItem.morning = true;
                $scope.currentItem.afternoon = true;
                $scope.currentItem.night = true;
            } else if (f === 'Four times daily') {
                $scope.currentItem.morning = true;
                $scope.currentItem.afternoon = true;
                $scope.currentItem.evening = true;
                $scope.currentItem.night = true;
            }
            $scope.calculateQuantity();
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

            // ✅ DUPLICATE CHECK
            var medicineExists = $scope.prescription.items.some(function(item) {
                return item.medicineName.trim().toLowerCase() === $scope.currentItem.medicineName.trim().toLowerCase();
            });

            if (medicineExists) {
                $scope.addMedicineError = 'This medicine is already added!';
                $rootScope.showAlert('warning', 'This medicine is already added to the prescription.');
                
                // Clear error after 3 seconds
                setTimeout(function() {
                    $scope.addMedicineError = '';
                    $scope.$apply();
                }, 3000);
                return;
            }

            $scope.addMedicineError = '';
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
            
            // ✅ Add creator/modifier info for auditing
            var currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            $scope.prescription.createdBy = currentUser.username || 'System';
            
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

                            // ✅ COMPLETE THE CONSULTATION FLOW
                            $scope.completeConsultation().then(function() {
                                console.log("✅ All completion steps finished. Redirecting in 1s...");
                                
                                // ✅ REDIRECT TO OPD QUEUE AFTER SAVE / EDIT
                                $timeout(function () {
                                    console.log("👉 NOW GOING TO /opd/queue");
                                    $location.path('/opd/queue').replace();
                                }, 1000);
                            });

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
            var deferred = $q.defer();
            
            if (!$scope.consultation || !$scope.consultation.consultationId) {
                console.warn('⚠️ No consultation data found for completion');
                deferred.resolve();
                return deferred.promise;
            }

            console.log('🚀 Finalizing consultation:', $scope.consultation.consultationId);
            console.log('📦 Linked Appointment ID:', $scope.consultation.appointmentId);
            console.log('📦 Linked CVR Number:', $scope.consultation.cvrNumber);

            OPDService.completeConsultation($scope.consultation.consultationId).then(
                    function (response) {
                        console.log('✅ Consultation marked as COMPLETED in backend');

                        var promises = [];

                        // ✅ 1. UPDATE CVR STATUS TO COMPLETED
                        if ($scope.consultation.cvrNumber) {
                            console.log('🔄 Triggering CVR completion for:', $scope.consultation.cvrNumber);
                            promises.push($scope.completeCVR($scope.consultation.cvrNumber));
                        }

                        // ✅ 2. UPDATE APPOINTMENT STATUS TO COMPLETED
                        if ($scope.consultation.appointmentId) {
                            console.log('🔄 Triggering Appointment completion for:', $scope.consultation.appointmentId);
                            promises.push($scope.completeAppointment($scope.consultation.appointmentId));
                        }

                        // ✅ Wait for all updates
                        $q.all(promises).finally(function() {
                            console.log('🏁 All completion triggers sent');
                            deferred.resolve();
                        });
                    },
                    function (error) {
                        console.error('❌ Failed to complete consultation:', error);
                        deferred.resolve(); // Still resolve to allow redirect
                    }
            );
            
            return deferred.promise;
        };

        /**
         * ✅ COMPLETE CVR
         */
        $scope.completeCVR = function (cvrNumber) {
            return CVRService.completeConsultation(cvrNumber).then(
                    function (response) {
                        console.log('✅ CVR marked as COMPLETED');
                    },
                    function (error) {
                        console.error('❌ Failed to complete CVR:', error);
                    }
            );
        };

        /**
         * ✅ COMPLETE APPOINTMENT
         */
        $scope.completeAppointment = function (appointmentId) {
            return AppointmentService.completeConsultation(appointmentId).then(
                    function (response) {
                        console.log('✅ Appointment marked as COMPLETED');
                    },
                    function (error) {
                        console.error('❌ Failed to complete Appointment:', error);
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

            // Prepare data for printing
            var printData = {
                clinicName: localStorage.getItem('clinicName') || 'Hospital Management System',
                clinicLogo: localStorage.getItem('clinicLogo') || '',
                clinicAddress: localStorage.getItem('clinicAddress') || 'N/A',
                clinicPhone: localStorage.getItem('clinicPhone') || 'N/A',
                loginName: currentUser ? currentUser.fullName : 'Admin',
                role: currentUser ? currentUser.role : '',
                patientName: $scope.consultation ? $scope.consultation.patientName : '',
                patientAge: $scope.consultation ? $scope.consultation.patientAge : '',
                patientGender: $scope.consultation ? $scope.consultation.patientGender : '',
                pinNumber: $scope.consultation ? $scope.consultation.pinNumber : '',
                cvrNumber: $scope.consultation ? $scope.consultation.cvrNumber : '',
                prescriptionNo: $scope.prescription ? $scope.prescription.consultationNumber : '',
                dateTime: new Date().toLocaleString(),
                items: $scope.prescription.items || [],
                instructions: $scope.prescription.instructions || '',
                validityDays: $scope.prescription.validityDays || 0
            };

            // Save to localStorage
            localStorage.setItem('printPrescriptionData', JSON.stringify(printData));

            // Open print preview in new tab
            $window.open('print-prescription.html', '_blank');
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