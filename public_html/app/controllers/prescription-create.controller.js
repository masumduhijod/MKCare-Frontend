/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

///**
// * Prescription Create Controller
// * Create prescription with medicines
// */
//
//app.controller('PrescriptionCreateController', ['$scope', '$rootScope', '$location', '$routeParams',
//    'OPDService', 'AuthService',
//    function($scope, $rootScope, $location, $routeParams, OPDService, AuthService) {
//    
//    var currentUser = AuthService.getCurrentUser();
//    var consultationId = $routeParams.consultationId;
//    
//    // Consultation Details
//    $scope.consultation = null;
//    
//    // Prescription Data
//    $scope.prescription = {
//        consultationId: consultationId,
//        consultationNumber: '',
//        pinNumber: '',
//        doctorId: currentUser ? currentUser.userId : '',
//        validityDays: 30,
//        instructions: '',
//        items: []
//    };
//    
//    // Current Medicine being added
//    $scope.currentMedicine = {
//        medicineName: '',
//        dosage: '',
//        frequency: '',
//        duration: '',
//        quantity: 1,
//        instructions: '',
//        morning: false,
//        afternoon: false,
//        evening: false,
//        night: false,
//        beforeFood: false,
//        afterFood: true
//    };
//    
//    $scope.loading = false;
//    $scope.createdPrescription = null;
//    
//    // Common Medicines List (for autocomplete)
//    $scope.commonMedicines = [
//        'Paracetamol 500mg',
//        'Amoxicillin 500mg',
//        'Azithromycin 500mg',
//        'Ibuprofen 400mg',
//        'Omeprazole 20mg',
//        'Cetirizine 10mg',
//        'Metformin 500mg',
//        'Aspirin 75mg',
//        'Atorvastatin 10mg',
//        'Levothyroxine 50mcg'
//    ];
//    
//    // Frequency Options
//    $scope.frequencyOptions = [
//        'Once daily',
//        'Twice daily',
//        'Three times daily',
//        'Four times daily',
//        'Every 8 hours',
//        'Every 12 hours',
//        'As needed',
//        'Before sleep'
//    ];
//    
//    // Duration Options
//    $scope.durationOptions = [
//        '3 days',
//        '5 days',
//        '7 days',
//        '10 days',
//        '15 days',
//        '1 month',
//        '3 months',
//        'Continuous'
//    ];
//    
//    /**
//     * Load Consultation Details
//     */
//    $scope.loadConsultation = function() {
//        if (!consultationId) {
//            $rootScope.showAlert('danger', 'Consultation ID not provided');
//            $location.path('/dashboard');
//            return;
//        }
//        
//        $scope.loading = true;
//        
//        OPDService.getConsultation(consultationId)
//            .then(function(response) {
//                $scope.loading = false;
//                
//                if (response.data.success) {
//                    $scope.consultation = response.data.data;
//                    $scope.prescription.consultationNumber = $scope.consultation.consultationId;
//                    $scope.prescription.pinNumber = $scope.consultation.pinNumber;
//                } else {
//                    $rootScope.showAlert('danger', 'Consultation not found');
//                    $location.path('/dashboard');
//                }
//            })
//            .catch(function(error) {
//                $scope.loading = false;
//                $rootScope.showAlert('danger', 'Error loading consultation');
//                $location.path('/dashboard');
//            });
//    };
//    
//    /**
//     * Add Medicine to Prescription
//     */
//    $scope.addMedicine = function() {
//        // Validation
//        if (!$scope.currentMedicine.medicineName) {
//            $rootScope.showAlert('warning', 'Please enter medicine name');
//            return;
//        }
//        
//        if (!$scope.currentMedicine.dosage) {
//            $rootScope.showAlert('warning', 'Please enter dosage');
//            return;
//        }
//        
//        if (!$scope.currentMedicine.frequency) {
//            $rootScope.showAlert('warning', 'Please select frequency');
//            return;
//        }
//        
//        if (!$scope.currentMedicine.duration) {
//            $rootScope.showAlert('warning', 'Please select duration');
//            return;
//        }
//        
//        // Check if at least one timing is selected
//        if (!$scope.currentMedicine.morning && !$scope.currentMedicine.afternoon && 
//            !$scope.currentMedicine.evening && !$scope.currentMedicine.night) {
//            $rootScope.showAlert('warning', 'Please select at least one timing (Morning/Afternoon/Evening/Night)');
//            return;
//        }
//        
//        // Add to items
//        $scope.prescription.items.push(angular.copy($scope.currentMedicine));
//        
//        // Reset current medicine
//        $scope.resetCurrentMedicine();
//        
//        $rootScope.showAlert('success', 'Medicine added to prescription');
//    };
//    
//    /**
//     * Remove Medicine
//     */
//    $scope.removeMedicine = function(index) {
//        if (confirm('Remove this medicine from prescription?')) {
//            $scope.prescription.items.splice(index, 1);
//            $rootScope.showAlert('info', 'Medicine removed');
//        }
//    };
//    
//    /**
//     * Reset Current Medicine
//     */
//    $scope.resetCurrentMedicine = function() {
//        $scope.currentMedicine = {
//            medicineName: '',
//            dosage: '',
//            frequency: '',
//            duration: '',
//            quantity: 1,
//            instructions: '',
//            morning: false,
//            afternoon: false,
//            evening: false,
//            night: false,
//            beforeFood: false,
//            afterFood: true
//        };
//    };
//    
//    /**
//     * Get Medicine Timing Display
//     */
//    $scope.getMedicineTiming = function(medicine) {
//        var timing = [];
//        if (medicine.morning) timing.push('M');
//        if (medicine.afternoon) timing.push('A');
//        if (medicine.evening) timing.push('E');
//        if (medicine.night) timing.push('N');
//        
//        var food = medicine.beforeFood ? 'Before Food' : 'After Food';
//        
//        return timing.join('-') + ' (' + food + ')';
//    };
//    
//    /**
//     * Create Prescription
//     */
//    $scope.createPrescription = function() {
//        // Validation
//        if ($scope.prescription.items.length === 0) {
//            $rootScope.showAlert('warning', 'Please add at least one medicine');
//            return;
//        }
//        
//        $scope.loading = true;
//        
//        OPDService.createPrescription($scope.prescription)
//            .then(function(response) {
//                $scope.loading = false;
//                
//                if (response.data.success) {
//                    $scope.createdPrescription = response.data.data;
//                    $rootScope.showAlert('success', 'Prescription created successfully!');
//                    
//                    // Ask to print
//                    var print = confirm('Prescription created!\nPrescription ID: ' + 
//                                      $scope.createdPrescription.prescriptionId + 
//                                      '\n\nDo you want to print prescription?');
//                    
//                    if (print) {
//                        $scope.printPrescription();
//                    } else {
//                        $scope.completeAndNext();
//                    }
//                } else {
//                    $rootScope.showAlert('danger', response.data.message || 'Failed to create prescription');
//                }
//            })
//            .catch(function(error) {
//                $scope.loading = false;
//                $rootScope.showAlert('danger', 'Error creating prescription');
//            });
//    };
//    
//    /**
//     * Print Prescription
//     */
//    $scope.printPrescription = function() {
//        window.print();
//        $scope.completeAndNext();
//    };
//    
//    /**
//     * Complete and Next
//     */
//    $scope.completeAndNext = function() {
//        // Navigate to billing or queue
//        var nextAction = confirm('What do you want to do next?\n\nOK - Go to billing\nCancel - Return to queue');
//        
//        if (nextAction) {
//            $location.path('/billing/invoice/create').search({
//                pinNumber: $scope.consultation.pinNumber,
//                consultationId: consultationId
//            });
//        } else {
//            $location.path('/opd/queue');
//        }
//    };
//    
//    /**
//     * Cancel
//     */
//    $scope.cancel = function() {
//        if (confirm('Cancel prescription creation? All medicines will be lost.')) {
//            $location.path('/consultation/room').search({
//                pinNumber: $scope.consultation.pinNumber,
//                cvrNumber: $scope.consultation.cvrNumber
//            });
//        }
//    };
//    
//    // Initialize
//    $scope.loadConsultation();
//}]);


/**
 * ============================================
 * PRESCRIPTION CREATE CONTROLLER - COMPLETE
 * ============================================
 * ✅ Full prescription workflow
 * ✅ Medicine management
 * ✅ Print functionality
 * ✅ Complete flow redirect
 */

app.controller('PrescriptionCreateController',
        ['$scope', '$rootScope', '$location', '$routeParams', '$window',
            'OPDService', 'AppointmentService', 'AuthService',
            function ($scope, $rootScope, $location, $routeParams, $window,
                    OPDService, AppointmentService, AuthService) {

                // Initialize
                $scope.consultationId = $routeParams.consultationId;
                $scope.currentUser = AuthService.getCurrentUser();

                $scope.consultation = null;
                $scope.prescription = {
                    consultationId: $scope.consultationId,
                    consultationNumber: '',
                    pinNumber: '',
                    doctorId: $scope.currentUser ? $scope.currentUser.username : '',
                    validityDays: 30,
                    instructions: 'Take medicines as prescribed. Complete the full course.',
                    items: []
                };

                $scope.currentItem = {
                    medicineName: '',
                    dosage: '',
                    frequency: 'BD',
                    duration: '5 days',
                    quantity: 0,
                    instructions: '',
                    morning: false,
                    afternoon: false,
                    evening: false,
                    night: false,
                    beforeFood: false,
                    afterFood: true
                };

                $scope.loading = false;

                /**
                 * ✅ COMMON MEDICINES DATABASE
                 */
                $scope.commonMedicines = [
                    {name: 'Paracetamol', dosage: '500mg', frequency: 'TDS'},
                    {name: 'Ibuprofen', dosage: '400mg', frequency: 'BD'},
                    {name: 'Amoxicillin', dosage: '500mg', frequency: 'TDS'},
                    {name: 'Azithromycin', dosage: '500mg', frequency: 'OD'},
                    {name: 'Cetirizine', dosage: '10mg', frequency: 'OD'},
                    {name: 'Omeprazole', dosage: '20mg', frequency: 'OD'},
                    {name: 'Pantoprazole', dosage: '40mg', frequency: 'OD'},
                    {name: 'Metformin', dosage: '500mg', frequency: 'BD'},
                    {name: 'Amlodipine', dosage: '5mg', frequency: 'OD'},
                    {name: 'Atorvastatin', dosage: '10mg', frequency: 'OD'},
                    {name: 'Levothyroxine', dosage: '50mcg', frequency: 'OD'},
                    {name: 'Aspirin', dosage: '75mg', frequency: 'OD'},
                    {name: 'Salbutamol', dosage: '100mcg', frequency: 'SOS'},
                    {name: 'Prednisolone', dosage: '5mg', frequency: 'OD'},
                    {name: 'Domperidone', dosage: '10mg', frequency: 'TDS'}
                ];

                $scope.frequencies = ['OD', 'BD', 'TDS', 'QID', 'SOS', 'STAT', 'HS', 'PRN'];
                $scope.durations = ['3 days', '5 days', '7 days', '10 days', '15 days', '21 days', '1 month', '3 months', 'Continuous'];

                /**
                 * Initialize controller
                 */
                $scope.init = function () {
                    console.log('========== PRESCRIPTION CREATION ==========');
                    console.log('Consultation ID:', $scope.consultationId);

                    if (!$scope.consultationId) {
                        $rootScope.showAlert('danger', 'Consultation ID is required');
                        $location.path('/opd/queue');
                        return;
                    }

                    $scope.loadConsultation();
                };

                /**
                 * ✅ FIX #2: LOAD CONSULTATION - Convert consultationId to integer
                 */
                $scope.loadConsultation = function () {
                    $scope.loading = true;

                    // ✅ Convert consultationId string to integer by extracting number
                    var consultationIdNumber = parseInt($scope.consultationId.replace(/[^\d]/g, ''));

                    console.log('Original ID:', $scope.consultationId);
                    console.log('Converted ID:', consultationIdNumber);

                    OPDService.getConsultationById(consultationIdNumber).then(
                            function (response) {
                                $scope.loading = false;

                                if (response.data.success) {
                                    $scope.consultation = response.data.data;
                                    // ✅ Use numeric ID for prescription
                                    $scope.prescription.consultationId = consultationIdNumber;
                                    $scope.prescription.consultationNumber = $scope.consultation.consultationId;
                                    $scope.prescription.pinNumber = $scope.consultation.pinNumber;

                                    console.log('✅ Consultation loaded');
                                } else {
                                    $rootScope.showAlert('danger', 'Consultation not found');
                                    $location.path('/opd/queue');
                                }
                            },
                            function (error) {
                                $scope.loading = false;
                                console.error('Error loading consultation:', error);
                                $rootScope.showAlert('danger', 'Failed to load consultation');
                            }
                    );
                };

                /**
                 * ✅ SELECT MEDICINE FROM COMMON LIST
                 */
                $scope.selectMedicine = function (medicine) {
                    $scope.currentItem.medicineName = medicine.name;
                    $scope.currentItem.dosage = medicine.dosage;
                    $scope.currentItem.frequency = medicine.frequency;

                    // Auto-set timing based on frequency
                    $scope.setTimingFromFrequency(medicine.frequency);
                };

                /**
                 * ✅ SET TIMING CHECKBOXES FROM FREQUENCY
                 */
                $scope.setTimingFromFrequency = function (frequency) {
                    // Reset all
                    $scope.currentItem.morning = false;
                    $scope.currentItem.afternoon = false;
                    $scope.currentItem.evening = false;
                    $scope.currentItem.night = false;

                    switch (frequency) {
                        case 'OD':
                            $scope.currentItem.morning = true;
                            break;
                        case 'BD':
                            $scope.currentItem.morning = true;
                            $scope.currentItem.evening = true;
                            break;
                        case 'TDS':
                            $scope.currentItem.morning = true;
                            $scope.currentItem.afternoon = true;
                            $scope.currentItem.evening = true;
                            break;
                        case 'QID':
                            $scope.currentItem.morning = true;
                            $scope.currentItem.afternoon = true;
                            $scope.currentItem.evening = true;
                            $scope.currentItem.night = true;
                            break;
                        case 'HS':
                            $scope.currentItem.night = true;
                            break;
                    }
                };

                /**
                 * ✅ UPDATE FREQUENCY FROM CHECKBOXES
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
                        $scope.currentItem.frequency = 'OD';
                    } else if (count === 2) {
                        $scope.currentItem.frequency = 'BD';
                    } else if (count === 3) {
                        $scope.currentItem.frequency = 'TDS';
                    } else if (count === 4) {
                        $scope.currentItem.frequency = 'QID';
                    }
                };

                /**
                 * ✅ ADD MEDICINE TO PRESCRIPTION
                 */
                $scope.addMedicine = function () {
                    // Validate
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

                    // Check at least one timing selected
                    if (!$scope.currentItem.morning && !$scope.currentItem.afternoon &&
                            !$scope.currentItem.evening && !$scope.currentItem.night) {
                        $rootScope.showAlert('warning', 'Please select at least one timing (M/A/E/N)');
                        return;
                    }

                    // Add to items list
                    $scope.prescription.items.push(angular.copy($scope.currentItem));

                    console.log('✅ Medicine added:', $scope.currentItem.medicineName);

                    // Reset form
                    $scope.resetItemForm();

                    $rootScope.showAlert('success', '✅ Medicine added to prescription');
                };

                /**
                 * ✅ REMOVE MEDICINE FROM PRESCRIPTION
                 */
                $scope.removeMedicine = function (index) {
                    if (confirm('Remove this medicine from prescription?')) {
                        var removed = $scope.prescription.items.splice(index, 1);
                        console.log('❌ Medicine removed:', removed[0].medicineName);
                        $rootScope.showAlert('info', 'Medicine removed');
                    }
                };

                /**
                 * ✅ RESET ITEM FORM
                 */
                $scope.resetItemForm = function () {
                    $scope.currentItem = {
                        medicineName: '',
                        dosage: '',
                        frequency: 'BD',
                        duration: '5 days',
                        quantity: 0,
                        instructions: '',
                        morning: false,
                        afternoon: false,
                        evening: false,
                        night: false,
                        beforeFood: false,
                        afterFood: true
                    };
                };

                /**
                 * ✅ VALIDATE PRESCRIPTION
                 */
                $scope.validatePrescription = function () {
                    if ($scope.prescription.items.length === 0) {
                        $rootScope.showAlert('warning', 'Please add at least one medicine');
                        return false;
                    }

                    if (!$scope.prescription.validityDays || $scope.prescription.validityDays < 1) {
                        $rootScope.showAlert('warning', 'Please enter valid validity days (minimum 1)');
                        return false;
                    }

                    return true;
                };

                /**
                 * ✅ CREATE PRESCRIPTION
                 */
                $scope.createPrescription = function () {
                    if (!$scope.validatePrescription()) {
                        return;
                    }

                    if (confirm('Create prescription with ' + $scope.prescription.items.length + ' medicines?')) {
                        $scope.loading = true;

                        console.log('💊 Creating prescription...');

                        OPDService.createPrescription($scope.prescription).then(
                                function (response) {
                                    $scope.loading = false;

                                    if (response.data.success) {
                                        var createdPrescription = response.data.data;

                                        console.log('✅ Prescription created:', createdPrescription.prescriptionId);

                                        $rootScope.showAlert('success',
                                                '✅ Prescription created successfully!\n\n' +
                                                'Prescription ID: ' + createdPrescription.prescriptionId);

                                        // ✅ ASK IF WANT TO PRINT
                                        setTimeout(function () {
                                            if (confirm(
                                                    'Prescription created!\n\n' +
                                                    'Do you want to print the prescription?\n\n' +
                                                    'Click OK to print\n' +
                                                    'Click Cancel to return to queue'
                                                    )) {
                                                $scope.printPrescription(createdPrescription);
                                            } else {
                                                $scope.completeAndReturnToQueue();
                                            }

                                        }, 1000);
                                    } else {
                                        $rootScope.showAlert('danger', response.data.message);
                                    }
                                },
                                function (error) {
                                    $scope.loading = false;
                                    console.error('Error creating prescription:', error);
                                    $rootScope.showAlert('danger', 'Failed to create prescription');
                                }
                        );
                    }
                };

                /**
                 * ✅ PRINT PRESCRIPTION
                 */
                $scope.printPrescription = function (prescription) {
                    var printWindow = $window.open('', '_blank', 'width=800,height=600');
                    var printContent = $scope.generatePrintContent(prescription);

                    printWindow.document.write(printContent);
                    printWindow.document.close();
                    printWindow.focus();

                    setTimeout(function () {
                        printWindow.print();
                        printWindow.close();

                        // Return to queue after printing
                        $scope.completeAndReturnToQueue();
                    }, 1000);
                };

                /**
                 * ✅ GENERATE PRINT CONTENT
                 */
                $scope.generatePrintContent = function (prescription) {
                    var html = `
<!DOCTYPE html>
<html>
<head>
    <title>Prescription - ${prescription.prescriptionId}</title>
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
        .patient-info { 
            margin-bottom: 25px; 
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
        }
        .patient-info p { 
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
        .footer { 
            margin-top: 50px; 
            text-align: right; 
        }
        .instructions {
            margin-top: 30px;
            padding: 15px;
            background: #fff3cd;
            border-left: 4px solid #ffc107;
        }
        @media print { 
            button { display: none; }
            body { margin: 0; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>🏥 HOSPITAL NAME</h2>
        <p>Address Line 1, City - PIN</p>
        <p>Phone: +91-XXXXXXXXXX | Email: hospital@example.com</p>
    </div>
    
    <div class="patient-info">
        <div style="display: flex; justify-content: space-between;">
            <div>
                <p><strong>Prescription ID:</strong> ${prescription.prescriptionId}</p>
                <p><strong>Patient Name:</strong> ${prescription.patientName || 'N/A'}</p>
                <p><strong>PIN:</strong> ${prescription.pinNumber}</p>
                <p><strong>Age/Gender:</strong> ${prescription.patientAge || 'N/A'} / ${prescription.patientGender || 'N/A'}</p>
            </div>
            <div style="text-align: right;">
                <p><strong>Doctor:</strong> Dr. ${prescription.doctorName || $scope.currentUser.fullName}</p>
                <p><strong>Date:</strong> ${new Date(prescription.prescriptionDate).toLocaleDateString('en-IN')}</p>
                <p><strong>Valid Till:</strong> ${new Date(prescription.expiryDate).toLocaleDateString('en-IN')}</p>
            </div>
        </div>
    </div>
    
    <h3 style="color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 5px;">℞ Medicines Prescribed:</h3>
    <table>
        <thead>
            <tr>
                <th style="width: 5%;">#</th>
                <th style="width: 25%;">Medicine</th>
                <th style="width: 12%;">Dosage</th>
                <th style="width: 10%;">Frequency</th>
                <th style="width: 18%;">Timing</th>
                <th style="width: 12%;">Duration</th>
                <th style="width: 18%;">Instructions</th>
            </tr>
        </thead>
        <tbody>`;

                    prescription.items.forEach(function (item, index) {
                        var timing = [];
                        if (item.morning)
                            timing.push('🌅 Morning');
                        if (item.afternoon)
                            timing.push('☀️ Afternoon');
                        if (item.evening)
                            timing.push('🌆 Evening');
                        if (item.night)
                            timing.push('🌙 Night');

                        var foodTiming = '';
                        if (item.beforeFood)
                            foodTiming = '🍽️ Before Food';
                        else if (item.afterFood)
                            foodTiming = '🍽️ After Food';

                        html += `
            <tr>
                <td style="text-align: center;">${index + 1}</td>
                <td><strong>${item.medicineName}</strong></td>
                <td>${item.dosage}</td>
                <td>${item.frequency}</td>
                <td>${timing.join('<br>')}</td>
                <td>${item.duration}</td>
                <td>${foodTiming}<br>${item.instructions || '-'}</td>
            </tr>`;
                    });

                    html += `
        </tbody>
    </table>
    
    <div class="instructions">
        <p><strong>⚠️ General Instructions:</strong></p>
        <p>${prescription.instructions || 'Take medicines as prescribed. Complete the full course.'}</p>
    </div>
    
    <div class="footer">
        <p>____________________________</p>
        <p><strong>Doctor's Signature</strong></p>
        <p>Dr. ${prescription.doctorName || $scope.currentUser.fullName}</p>
        <p style="font-size: 12px; color: #666;">This is a computer-generated prescription</p>
    </div>
</body>
</html>`;

                    return html;
                };

                /**
                 * ✅ COMPLETE APPOINTMENT AND RETURN TO QUEUE
                 */
                $scope.completeAndReturnToQueue = function () {
                    if ($scope.consultation && $scope.consultation.appointmentId) {
                        console.log('✅ Completing appointment...');

                        AppointmentService.completeConsultation($scope.consultation.appointmentId).then(
                                function (response) {
                                    if (response.data.success) {
                                        console.log('✅ Appointment completed');
                                    }
                                },
                                function (error) {
                                    console.error('Error completing appointment:', error);
                                }
                        ).finally(function () {
                            // Return to queue regardless of completion result
                            $location.path('/opd/queue');
                            $scope.$apply();
                        });
                    } else {
                        $location.path('/opd/queue');
                    }
                };

                /**
                 * ✅ CANCEL PRESCRIPTION
                 */
                $scope.cancelPrescription = function () {
                    if (confirm('Are you sure you want to cancel?\n\nAll medicines will be lost.')) {
                        $location.path('/opd/queue');
                    }
                };

                // Initialize
                $scope.init();
            }]);