/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


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
    $scope.consultationId = $routeParams.consultationId;
$scope.isEditMode = false;

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

    if ($scope.consultationId) {
        console.log('✏️ Edit Mode Activated');
        $scope.isEditMode = true;
        $scope.loadConsultationForEdit();
    }

    if (!$scope.pinNumber && !$scope.isEditMode) {
        $rootScope.showAlert('danger', 'Patient PIN is required');
        $location.path('/opd/queue');
        return;
    }

    if (!$scope.isEditMode) {
        $scope.loadPatientDetails();
        $scope.loadCVRDetails();
        $scope.loadPatientHistory();
        $scope.loadDraft();
    }
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
    
    $scope.saveConsultation = function() {
        if (!$scope.validateForm()) {
            return;
        }

        $rootScope.showGlobalConfirm({
            title: $scope.isEditMode ? 'Update Consultation' : 'Save Consultation',
            message: $scope.isEditMode ? 'Update this consultation record?' : 'Save this consultation record?',
            type: 'info',
            okText: 'Yes, ' + ($scope.isEditMode ? 'Update' : 'Save'),
            cancelText: 'Cancel',
            onConfirm: function() {
                $scope.executeSaveConsultation();
            }
        });
    };

    $scope.executeSaveConsultation = function() {

        $scope.savingConsultation = true;

        var savePromise;

        if ($scope.isEditMode) {
            // ✅ UPDATE MODE
            savePromise = OPDService.updateConsultation(
                $scope.consultationId,
                $scope.consultation
            );
        } else {
            // ✅ CREATE MODE
            savePromise = OPDService.createConsultation(
                $scope.consultation
            );
        }

        savePromise.then(
            function(response) {

                $scope.savingConsultation = false;

                if (response.data.success) {

                    $scope.createdConsultation = response.data.data;

                    $rootScope.showAlert('success',
                        $scope.isEditMode ?
                        '✅ Consultation updated successfully!' :
                        '✅ Consultation saved successfully!'
                    );

                    if (!$scope.isEditMode) {
                        $scope.showConsultationSuccessOptions();
                    } else {
//                        $location.path('/consultation/manage');
                          $location.path('/opd/list');
                    }

                } else {
                    $rootScope.showAlert('danger', response.data.message);
                }
            },
            function(error) {
                $scope.savingConsultation = false;
                $rootScope.showAlert('danger', 'Failed to save consultation');
            }
        );
    };

    /**
     * ✅ NEW: SHOW CONSULTATION SUCCESS OPTIONS
     */
    $scope.showConsultationSuccessOptions = function() {
        $timeout(function() {
            $rootScope.showGlobalConfirm({
                title: 'Consultation Saved!',
                message: 'Consultation record saved successfully.',
                subMessage: 'ID: ' + $scope.createdConsultation.consultationId + '. Would you like to create a prescription?',
                type: 'success',
                icon: 'fas fa-check-circle',
                okText: 'Create Prescription',
                cancelText: 'Return to Queue',
                onConfirm: function() {
                    console.log('📋 Redirecting to prescription creation...');
                    $location.path('/prescription/create/' + $scope.createdConsultation.consultationId);
                },
                onCancel: function() {
                    console.log('📋 Returning to queue...');
                    $location.path('/opd/queue');
                }
            });
        }, 300);
    };
    
    /**
     * Cancel consultation
     */
    $scope.cancelConsultation = function() {
        $rootScope.showGlobalConfirm({
            title: 'Leave Consultation?',
            message: 'Are you sure you want to leave?',
            subMessage: 'You can save your current progress as a draft.',
            type: 'warning',
            okText: 'Save Draft & Leave',
            cancelText: 'Discard & Leave',
            onConfirm: function() {
                $scope.saveDraft();
                $location.path('/opd/queue');
            },
            onCancel: function() {
                $location.path('/opd/queue');
            }
        });
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
    $scope.loadConsultationForEdit = function() {

    OPDService.getConsultationById($scope.consultationId).then(
        function(response) {
            if (response.data.success) {

                $scope.consultation = response.data.data;
$scope.consultation.consultationId = $scope.consultationId;

                $scope.pinNumber = $scope.consultation.pinNumber;
                $scope.cvrNumber = $scope.consultation.cvrNumber;

                $scope.loadPatientDetails();
                $scope.loadPatientHistory();

                console.log('✅ Consultation loaded for edit');
            }
        },
        function(error) {
            console.error('Error loading consultation:', error);
            $rootScope.showAlert('danger', 'Failed to load consultation');
        }
    );
};

    // Initialize
    $scope.init();
}]);