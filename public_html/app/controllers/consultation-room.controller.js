/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

///**
// * Consultation Room Controller
// * Doctor's consultation interface with SOAP notes
// */
//
//app.controller('ConsultationRoomController', ['$scope', '$rootScope', '$location', '$routeParams',
//    'OPDService', 'PatientService', 'CVRService', 'AuthService',
//    function($scope, $rootScope, $location, $routeParams, OPDService, PatientService, CVRService, AuthService) {
//    
//    var currentUser = AuthService.getCurrentUser();
//    
//    // Patient Info
//    $scope.patient = null;
//    $scope.cvr = null;
//    $scope.medicalHistory = null;
//    $scope.vitals = [];
//    $scope.previousConsultations = [];
//    
//    // Consultation Data
//    $scope.consultation = {
//        appointmentId: $routeParams.appointmentId || '',
//        cvrNumber: $routeParams.cvrNumber || '',
//        pinNumber: $routeParams.pinNumber || '',
//        doctorId: currentUser ? currentUser.userId : '',
//        
//        // SOAP Notes
//        subjective: '',
//        objective: '',
//        assessment: '',
//        plan: '',
//        
//        // Additional Fields
//        chiefComplaint: '',
//        presentIllness: '',
//        examinationFindings: '',
//        diagnosis: '',
//        treatmentPlan: '',
//        
//        // Follow-up
//        followUpRequired: false,
//        followUpDate: '',
//        followUpInstructions: ''
//    };
//    
//    $scope.loading = false;
//    $scope.savingConsultation = false;
//    $scope.createdConsultation = null;
//    
//    /**
//     * Load Patient Details
//     */
//    $scope.loadPatient = function() {
//        if (!$scope.consultation.pinNumber) {
//            $rootScope.showAlert('danger', 'Patient PIN not provided');
//            return;
//        }
//        
//        $scope.loading = true;
//        
//        PatientService.getByPin($scope.consultation.pinNumber)
//            .then(function(response) {
//                if (response.data.success) {
//                    $scope.patient = response.data.data;
//                    $scope.loadMedicalHistory();
//                    $scope.loadPreviousConsultations();
//                }
//            })
//            .catch(function(error) {
//                console.error('Error loading patient:', error);
//            });
//    };
//    
//    /**
//     * Load CVR Details
//     */
//    $scope.loadCVR = function() {
//        if (!$scope.consultation.cvrNumber) {
//            return;
//        }
//        
//        CVRService.getByCVRNumber($scope.consultation.cvrNumber)
//            .then(function(response) {
//                if (response.data.success) {
//                    $scope.cvr = response.data.data;
//                    
//                    // Pre-fill from CVR
//                    $scope.consultation.chiefComplaint = $scope.cvr.chiefComplaint;
//                    $scope.consultation.subjective = $scope.cvr.symptoms;
//                    
//                    // Load vitals
//                    $scope.loadVitals();
//                }
//                $scope.loading = false;
//            })
//            .catch(function(error) {
//                $scope.loading = false;
//                console.error('Error loading CVR:', error);
//            });
//    };
//    
//    /**
//     * Load Vitals
//     */
//    $scope.loadVitals = function() {
//        CVRService.getVitals($scope.consultation.cvrNumber)
//            .then(function(response) {
//                if (response.data.success) {
//                    $scope.vitals = response.data.data;
//                    
//                    // Pre-fill objective with vitals
//                    if ($scope.vitals.length > 0) {
//                        var latestVitals = $scope.vitals[0];
//                        $scope.consultation.objective = 
//                            'Temp: ' + latestVitals.temperatureF + '°F, ' +
//                            'BP: ' + latestVitals.bloodPressure + ', ' +
//                            'Pulse: ' + latestVitals.pulseRate + ' bpm, ' +
//                            'SpO2: ' + latestVitals.spo2Percentage + '%';
//                    }
//                }
//            })
//            .catch(function(error) {
//                console.error('Error loading vitals:', error);
//            });
//    };
//    
//    /**
//     * Load Medical History
//     */
//    $scope.loadMedicalHistory = function() {
//        PatientService.getMedicalHistory($scope.consultation.pinNumber)
//            .then(function(response) {
//                if (response.data.success) {
//                    $scope.medicalHistory = response.data.data;
//                }
//            })
//            .catch(function(error) {
//                console.error('Error loading medical history:', error);
//            });
//    };
//    
//    /**
//     * Load Previous Consultations
//     */
//    $scope.loadPreviousConsultations = function() {
//        OPDService.getPatientConsultations($scope.consultation.pinNumber)
//            .then(function(response) {
//                if (response.data.success) {
//                    $scope.previousConsultations = response.data.data;
//                }
//            })
//            .catch(function(error) {
//                console.error('Error loading previous consultations:', error);
//            });
//    };
//    
//    /**
//     * View Previous Consultation
//     */
//    $scope.viewPreviousConsultation = function(consultationId) {
//        OPDService.getConsultation(consultationId)
//            .then(function(response) {
//                if (response.data.success) {
//                    var prevConsult = response.data.data;
//                    
//                    // Show in modal or alert
//                    var info = 'Previous Consultation\n' +
//                              'Date: ' + new Date(prevConsult.consultationDate).toLocaleDateString() + '\n' +
//                              'Doctor: ' + prevConsult.doctorName + '\n\n' +
//                              'Diagnosis: ' + prevConsult.diagnosis + '\n' +
//                              'Treatment: ' + prevConsult.treatmentPlan;
//                    
//                    alert(info);
//                }
//            })
//            .catch(function(error) {
//                $rootScope.showAlert('danger', 'Error loading consultation details');
//            });
//    };
//    
//    /**
//     * Save as Draft
//     */
//    $scope.saveDraft = function() {
//        localStorage.setItem('consultation_draft_' + $scope.consultation.pinNumber, 
//                           JSON.stringify($scope.consultation));
//        $rootScope.showAlert('success', 'Draft saved locally');
//    };
//    
//    /**
//     * Load Draft
//     */
//    $scope.loadDraft = function() {
//        var draft = localStorage.getItem('consultation_draft_' + $scope.consultation.pinNumber);
//        if (draft) {
//            var loadDraft = confirm('A draft exists for this patient. Do you want to load it?');
//            if (loadDraft) {
//                $scope.consultation = JSON.parse(draft);
//                $rootScope.showAlert('info', 'Draft loaded');
//            }
//        }
//    };
//    
//    /**
//     * Create Consultation
//     */
//    $scope.createConsultation = function() {
//        // Validation
//        if (!$scope.consultation.subjective) {
//            $rootScope.showAlert('warning', 'Please enter subjective findings');
//            return;
//        }
//        
//        if (!$scope.consultation.assessment) {
//            $rootScope.showAlert('warning', 'Please enter assessment');
//            return;
//        }
//        
//        if (!$scope.consultation.diagnosis) {
//            $rootScope.showAlert('warning', 'Please enter diagnosis');
//            return;
//        }
//        
//        $scope.savingConsultation = true;
//        
//        OPDService.createConsultation($scope.consultation)
//            .then(function(response) {
//                $scope.savingConsultation = false;
//                
//                if (response.data.success) {
//                    $scope.createdConsultation = response.data.data;
//                    $rootScope.showAlert('success', 'Consultation saved successfully!');
//                    
//                    // Clear draft
//                    localStorage.removeItem('consultation_draft_' + $scope.consultation.pinNumber);
//                    
//                    // Ask for prescription
//                    var createPrescription = confirm('Consultation saved!\n\nDo you want to create prescription now?');
//                    
//                    if (createPrescription) {
//                        $location.path('/prescription/create/' + $scope.createdConsultation.consultationId);
//                    } else {
//                        // Complete consultation
//                        $scope.completeConsultation();
//                    }
//                } else {
//                    $rootScope.showAlert('danger', response.data.message || 'Failed to save consultation');
//                }
//            })
//            .catch(function(error) {
//                $scope.savingConsultation = false;
//                $rootScope.showAlert('danger', 'Error saving consultation');
//            });
//    };
//    
//    /**
//     * Complete Consultation
//     */
//    $scope.completeConsultation = function() {
//        if (!$scope.createdConsultation) {
//            $rootScope.showAlert('warning', 'Please save consultation first');
//            return;
//        }
//        
//        OPDService.completeConsultation($scope.createdConsultation.consultationId)
//            .then(function(response) {
//                if (response.data.success) {
//                    $rootScope.showAlert('success', 'Consultation completed!');
//                    
//                    // Navigate to queue or billing
//                    var nextAction = confirm('Consultation completed!\n\nOK - Go to billing\nCancel - Return to queue');
//                    
//                    if (nextAction) {
//                        $location.path('/billing/invoice/create').search({
//                            pinNumber: $scope.consultation.pinNumber,
//                            cvrNumber: $scope.consultation.cvrNumber
//                        });
//                    } else {
//                        $location.path('/opd/queue');
//                    }
//                }
//            })
//            .catch(function(error) {
//                $rootScope.showAlert('danger', 'Error completing consultation');
//            });
//    };
//    
//    /**
//     * Cancel
//     */
//    $scope.cancel = function() {
//        if (confirm('Are you sure? Unsaved changes will be lost.')) {
//            $location.path('/opd/queue');
//        }
//    };
//    
//    // Initialize
//    $scope.loadPatient();
//    $scope.loadCVR();
//    $scope.loadDraft();
//}]);


/**
 * ============================================
 * FIXED CONSULTATION ROOM CONTROLLER
 * ============================================
 * ✅ Proper redirect to prescription after saving
 * ✅ Clear workflow options
 */

app.controller('ConsultationRoomController', 
    ['$scope', '$rootScope', '$location', '$routeParams', '$timeout', 
     'OPDService', 'PatientService', 'CVRService', 'AuthService',
    function($scope, $rootScope, $location, $routeParams, $timeout, 
             OPDService, PatientService, CVRService, AuthService) {
    
    // Initialize
    $scope.appointmentId = $location.search().appointmentId;
    $scope.pinNumber = $location.search().pinNumber;
    $scope.cvrNumber = $location.search().cvrNumber;
    $scope.currentUser = AuthService.getCurrentUser();
    
    $scope.patient = null;
    $scope.cvr = null;
    $scope.vitals = null;
    $scope.consultation = {
        appointmentId: $scope.appointmentId || '',
        cvrNumber: $scope.cvrNumber || '',
        pinNumber: $scope.pinNumber || '',
        doctorId: $scope.currentUser ? $scope.currentUser.username : '',
        
        // SOAP Format
        subjective: '',
        objective: '',
        assessment: '',
        plan: '',
        
        // Traditional Format
        chiefComplaint: '',
        presentIllness: '',
        examinationFindings: '',
        diagnosis: '',
        treatmentPlan: '',
        
        // Follow-up
        followUpRequired: false,
        followUpDate: '',
        followUpInstructions: ''
    };
    
    $scope.patientHistory = [];
    $scope.showHistory = false;
    $scope.activeTab = 'soap';
    $scope.loading = false;
    $scope.savingConsultation = false;
    $scope.createdConsultation = null;
    
    /**
     * Quick Templates
     */
    $scope.templates = {
        commonComplaints: [
            'Fever', 'Cough', 'Cold', 'Headache', 'Body Pain', 
            'Stomach Pain', 'Vomiting', 'Diarrhea', 'Chest Pain',
            'Breathing Difficulty', 'Weakness', 'Dizziness'
        ],
        commonDiagnoses: [
            'Viral Fever', 'Upper Respiratory Tract Infection', 
            'Gastritis', 'Hypertension', 'Diabetes Mellitus',
            'Migraine', 'Allergic Rhinitis', 'Gastroenteritis',
            'Bronchitis', 'Urinary Tract Infection'
        ]
    };
    
    /**
     * Initialize controller
     */
    $scope.init = function() {
        console.log('========== CONSULTATION ROOM ==========');
        console.log('PIN:', $scope.pinNumber);
        console.log('CVR:', $scope.cvrNumber);
        console.log('Appointment:', $scope.appointmentId);
        
        if (!$scope.pinNumber) {
            $rootScope.showAlert('danger', 'Patient PIN is required');
            $location.path('/opd/queue');
            return;
        }
        
        $scope.loadPatientDetails();
        $scope.loadCVRDetails();
        $scope.loadPatientHistory();
        $scope.loadDraft();
    };
    
    /**
     * Load patient details
     */
    $scope.loadPatientDetails = function() {
        $scope.loading = true;
        
        PatientService.getByPin($scope.pinNumber).then(
            function(response) {
                $scope.loading = false;
                
                if (response.data.success) {
                    $scope.patient = response.data.data;
                    console.log('✅ Patient loaded:', $scope.patient.firstName);
                } else {
                    $rootScope.showAlert('danger', 'Patient not found');
                    $location.path('/opd/queue');
                }
            },
            function(error) {
                $scope.loading = false;
                console.error('Error loading patient:', error);
                $rootScope.showAlert('danger', 'Failed to load patient details');
            }
        );
    };
    
    /**
     * Load CVR and vitals
     */
    $scope.loadCVRDetails = function() {
        if (!$scope.cvrNumber) {
            console.log('⚠️ No CVR number provided');
            return;
        }
        
        CVRService.getByCVRNumber($scope.cvrNumber).then(
            function(response) {
                if (response.data.success) {
                    $scope.cvr = response.data.data;
                    console.log('✅ CVR loaded:', $scope.cvr.cvrNumber);
                    
                    // Pre-fill from CVR
                    $scope.consultation.chiefComplaint = $scope.cvr.chiefComplaint;
                    $scope.consultation.subjective = $scope.cvr.symptoms;
                    
                    // Load vitals
                    $scope.loadVitals();
                }
            },
            function(error) {
                console.error('Error loading CVR:', error);
            }
        );
    };
    
    /**
     * Load vitals
     */
    $scope.loadVitals = function() {
        CVRService.getVitals($scope.cvrNumber).then(
            function(response) {
                if (response.data.success && response.data.data && response.data.data.length > 0) {
                    $scope.vitals = response.data.data[0];
                    console.log('✅ Vitals loaded');
                    
                    // Pre-fill objective with vitals
                    $scope.consultation.objective = 
                        'Temperature: ' + $scope.vitals.temperatureF + '°F, ' +
                        'BP: ' + $scope.vitals.bloodPressure + ', ' +
                        'Pulse: ' + $scope.vitals.pulseRate + ' bpm, ' +
                        'SpO2: ' + $scope.vitals.spo2Percentage + '%';
                        
                    if ($scope.vitals.weightKg && $scope.vitals.heightCm) {
                        var bmi = $scope.calculateBMI($scope.vitals.weightKg, $scope.vitals.heightCm);
                        $scope.consultation.objective += ', BMI: ' + bmi;
                    }
                }
            },
            function(error) {
                console.log('No vitals recorded yet');
            }
        );
    };
    
    /**
     * Calculate BMI
     */
    $scope.calculateBMI = function(weightKg, heightCm) {
        var heightM = heightCm / 100;
        var bmi = weightKg / (heightM * heightM);
        return bmi.toFixed(2);
    };
    
    /**
     * Load patient history
     */
    $scope.loadPatientHistory = function() {
        OPDService.getConsultationsByPatient($scope.pinNumber).then(
            function(response) {
                if (response.data.success) {
                    $scope.patientHistory = response.data.data;
                    console.log('✅ Loaded', $scope.patientHistory.length, 'previous consultations');
                }
            },
            function(error) {
                console.error('Error loading history:', error);
            }
        );
    };
    
    /**
     * Toggle history panel
     */
    $scope.toggleHistory = function() {
        $scope.showHistory = !$scope.showHistory;
    };
    
    /**
     * Switch tabs
     */
    $scope.switchTab = function(tab) {
        $scope.activeTab = tab;
    };
    
    /**
     * Add template text
     */
    $scope.addTemplate = function(field, text) {
        if ($scope.consultation[field]) {
            $scope.consultation[field] += ', ' + text;
        } else {
            $scope.consultation[field] = text;
        }
    };
    
    /**
     * Load previous consultation
     */
    $scope.loadPreviousConsultation = function(consultation) {
        if (confirm('Load data from previous consultation (dated ' + 
                    new Date(consultation.consultationDate).toLocaleDateString() + ')?')) {
            
            $scope.consultation.chiefComplaint = consultation.chiefComplaint || '';
            $scope.consultation.presentIllness = consultation.presentIllness || '';
            $scope.consultation.examinationFindings = consultation.examinationFindings || '';
            $scope.consultation.diagnosis = consultation.diagnosis || '';
            $scope.consultation.treatmentPlan = consultation.treatmentPlan || '';
            $scope.consultation.subjective = consultation.subjective || '';
            $scope.consultation.objective = consultation.objective || '';
            $scope.consultation.assessment = consultation.assessment || '';
            $scope.consultation.plan = consultation.plan || '';
            
            $rootScope.showAlert('info', 'Previous consultation data loaded');
            $scope.showHistory = false;
        }
    };
    
    /**
     * Save draft
     */
    $scope.saveDraft = function() {
        var draftKey = 'consultation_draft_' + $scope.pinNumber;
        localStorage.setItem(draftKey, JSON.stringify($scope.consultation));
        $rootScope.showAlert('success', '💾 Draft saved locally');
    };
    
    /**
     * Load draft
     */
    $scope.loadDraft = function() {
        var draftKey = 'consultation_draft_' + $scope.pinNumber;
        var draft = localStorage.getItem(draftKey);
        
        if (draft) {
            var loadDraft = confirm('A draft exists for this patient. Do you want to load it?');
            if (loadDraft) {
                $scope.consultation = JSON.parse(draft);
                $rootScope.showAlert('info', '📄 Draft loaded');
            }
        }
    };
    
    /**
     * Validate form
     */
    $scope.validateForm = function() {
        if ($scope.activeTab === 'soap') {
            if (!$scope.consultation.subjective || !$scope.consultation.objective || 
                !$scope.consultation.assessment || !$scope.consultation.plan) {
                $rootScope.showAlert('warning', 'Please fill all SOAP fields (Subjective, Objective, Assessment, Plan)');
                return false;
            }
        } else {
            if (!$scope.consultation.chiefComplaint || !$scope.consultation.diagnosis) {
                $rootScope.showAlert('warning', 'Please fill Chief Complaint and Diagnosis');
                return false;
            }
        }
        
        if ($scope.consultation.followUpRequired && !$scope.consultation.followUpDate) {
            $rootScope.showAlert('warning', 'Please select follow-up date');
            return false;
        }
        
        return true;
    };
    
    /**
     * ✅ IMPROVED: SAVE CONSULTATION WITH CLEAR WORKFLOW
     */
    $scope.saveConsultation = function() {
        if (!$scope.validateForm()) {
            return;
        }
        
        if (confirm('Save consultation record?')) {
            $scope.savingConsultation = true;
            
            console.log('💾 Saving consultation...');
            
            OPDService.createConsultation($scope.consultation).then(
                function(response) {
                    $scope.savingConsultation = false;
                    
                    if (response.data.success) {
                        $scope.createdConsultation = response.data.data;
                        
                        console.log('✅ Consultation saved:', $scope.createdConsultation.consultationId);
                        
                        // Clear draft
                        var draftKey = 'consultation_draft_' + $scope.pinNumber;
                        localStorage.removeItem(draftKey);
                        
                        $rootScope.showAlert('success', '✅ Consultation saved successfully!');
                        
                        // ✅ IMPROVED: SHOW OPTIONS WITH CUSTOM MODAL
                        $scope.showConsultationSuccessOptions();
                        
                    } else {
                        $rootScope.showAlert('danger', response.data.message);
                    }
                },
                function(error) {
                    $scope.savingConsultation = false;
                    console.error('Error saving consultation:', error);
                    $rootScope.showAlert('danger', 'Failed to save consultation');
                }
            );
        }
    };
    
    /**
     * ✅ NEW: SHOW CONSULTATION SUCCESS OPTIONS
     */
    $scope.showConsultationSuccessOptions = function() {
        $timeout(function() {
            var createPrescription = confirm(
                '✅ Consultation Saved Successfully!\n\n' +
                'Consultation ID: ' + $scope.createdConsultation.consultationId + '\n\n' +
                'What would you like to do next?\n\n' +
                'Click OK to CREATE PRESCRIPTION\n' +
                'Click Cancel to RETURN TO QUEUE'
            );
            
            if (createPrescription) {
                // ✅ REDIRECT TO PRESCRIPTION
                console.log('📋 Redirecting to prescription creation...');
                $location.path('/prescription/create/' + $scope.createdConsultation.consultationId);
            } else {
                // Return to queue
                console.log('📋 Returning to queue...');
                $location.path('/opd/queue');
            }
        }, 1000);
    };
    
    /**
     * Cancel consultation
     */
    $scope.cancelConsultation = function() {
        var saveFirst = confirm(
            'Are you sure you want to leave?\n\n' +
            'Click OK to SAVE DRAFT and leave\n' +
            'Click Cancel to discard and leave'
        );
        
        if (saveFirst) {
            $scope.saveDraft();
        }
        
        $location.path('/opd/queue');
    };
    
    // Auto-save draft every 2 minutes
    var autoSaveInterval = setInterval(function() {
        if ($scope.consultation.subjective || $scope.consultation.chiefComplaint) {
            console.log('📄 Auto-saving draft...');
            $scope.saveDraft();
        }
    }, 120000);
    
    /**
     * Cleanup on destroy
     */
    $scope.$on('$destroy', function() {
        if (autoSaveInterval) {
            clearInterval(autoSaveInterval);
        }
    });
    
    // Initialize
    $scope.init();
}]);