/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


///**
// * Queue Management Controller
// * OPD Queue Management - Doctor's Queue Display
// */
//
//app.controller('QueueManagementController', ['$scope', '$rootScope', '$interval', '$location',
//    'OPDService', 'DoctorService', 'AuthService',
//    function($scope, $rootScope, $interval, $location, OPDService, DoctorService, AuthService) {
//    
//    var currentUser = AuthService.getCurrentUser();
//    
//    // Data
//    $scope.selectedDoctorId = '';
//    $scope.selectedDate = new Date().toISOString().split('T')[0];
//    $scope.queue = [];
//    $scope.doctors = [];
//    $scope.loading = false;
//    $scope.autoRefresh = true;
//    $scope.refreshInterval = null;
//    
//    // Statistics
//    $scope.stats = {
//        waiting: 0,
//        inConsultation: 0,
//        completed: 0,
//        total: 0
//    };
//    
//    /**
//     * Load Doctors
//     */
//    $scope.loadDoctors = function() {
//        DoctorService.getAvailable()
//            .then(function(response) {
//                if (response.data.success) {
//                    $scope.doctors = response.data.data;
//                    
//                    // If doctor role, set current doctor
//                    if (currentUser.role === 'DOCTOR') {
//                        // Find doctor by username/email
//                        var currentDoctor = $scope.doctors.find(function(doc) {
//                            return doc.email === currentUser.email;
//                        });
//                        
//                        if (currentDoctor) {
//                            $scope.selectedDoctorId = currentDoctor.doctorId;
//                            $scope.loadQueue();
//                        }
//                    }
//                }
//            })
//            .catch(function(error) {
//                console.error('Error loading doctors:', error);
//            });
//    };
//    
//    /**
//     * Load Queue
//     */
//    $scope.loadQueue = function() {
//        if (!$scope.selectedDoctorId) {
//            $rootScope.showAlert('warning', 'Please select a doctor');
//            return;
//        }
//        
//        $scope.loading = true;
//        
//        OPDService.getQueue($scope.selectedDoctorId, $scope.selectedDate)
//            .then(function(response) {
//                $scope.loading = false;
//                
//                if (response.data.success) {
//                    $scope.queue = response.data.data;
//                    $scope.calculateStats();
//                } else {
//                    $scope.queue = [];
//                    $scope.calculateStats();
//                }
//            })
//            .catch(function(error) {
//                $scope.loading = false;
//                console.error('Error loading queue:', error);
//            });
//    };
//    
//    /**
//     * Calculate Statistics
//     */
//    $scope.calculateStats = function() {
//        $scope.stats = {
//            waiting: 0,
//            inConsultation: 0,
//            completed: 0,
//            total: $scope.queue.length
//        };
//        
//        $scope.queue.forEach(function(item) {
//            if (item.status === 'WAITING') {
//                $scope.stats.waiting++;
//            } else if (item.status === 'IN_CONSULTATION') {
//                $scope.stats.inConsultation++;
//            } else if (item.status === 'COMPLETED') {
//                $scope.stats.completed++;
//            }
//        });
//    };
//    
//    /**
//     * Call Next Patient
//     */
//    $scope.callNextPatient = function() {
//        if (!$scope.selectedDoctorId) {
//            $rootScope.showAlert('warning', 'Please select a doctor');
//            return;
//        }
//        
//        $scope.loading = true;
//        
//        OPDService.callNext($scope.selectedDoctorId, $scope.selectedDate)
//            .then(function(response) {
//                $scope.loading = false;
//                
//                if (response.data.success) {
//                    var patient = response.data.data;
//                    $rootScope.showAlert('success', 'Called: ' + patient.patientName + ' (Token: ' + patient.tokenNumber + ')');
//                    $scope.loadQueue();
//                } else {
//                    $rootScope.showAlert('info', 'No patients waiting in queue');
//                }
//            })
//            .catch(function(error) {
//                $scope.loading = false;
//                $rootScope.showAlert('danger', 'Error calling next patient');
//            });
//    };
//    
//    /**
//     * Start Consultation
//     */
//    $scope.startConsultation = function(queueId) {
//        OPDService.startQueueConsultation(queueId)
//            .then(function(response) {
//                if (response.data.success) {
//                    $rootScope.showAlert('success', 'Consultation started');
//                    $scope.loadQueue();
//                } else {
//                    $rootScope.showAlert('danger', 'Failed to start consultation');
//                }
//            })
//            .catch(function(error) {
//                $rootScope.showAlert('danger', 'Error starting consultation');
//            });
//    };
//    
//    /**
//     * View Patient Details
//     */
//    $scope.viewPatientDetails = function(queueItem) {
//        // Navigate to consultation room with patient info
//        $location.path('/consultation/room').search({
//            queueId: queueItem.queueId,
//            pinNumber: queueItem.pinNumber,
//            cvrNumber: queueItem.cvrNumber
//        });
//    };
//    
//    /**
//     * Get Status Badge Class
//     */
//    $scope.getStatusBadgeClass = function(status) {
//        switch(status) {
//            case 'WAITING':
//                return 'badge bg-warning text-dark';
//            case 'IN_CONSULTATION':
//                return 'badge bg-primary';
//            case 'COMPLETED':
//                return 'badge bg-success';
//            default:
//                return 'badge bg-secondary';
//        }
//    };
//    
//    /**
//     * Get Priority Badge Class
//     */
//    $scope.getPriorityBadgeClass = function(priority) {
//        switch(priority) {
//            case 'HIGH':
//                return 'badge bg-danger';
//            case 'NORMAL':
//                return 'badge bg-info';
//            default:
//                return 'badge bg-secondary';
//        }
//    };
//    
//    /**
//     * Calculate Waiting Time
//     */
//    $scope.calculateWaitingTime = function(checkInTime) {
//        if (!checkInTime) return 'N/A';
//        
//        var checkIn = new Date(checkInTime);
//        var now = new Date();
//        var diffMs = now - checkIn;
//        var diffMins = Math.floor(diffMs / 60000);
//        
//        if (diffMins < 60) {
//            return diffMins + ' mins';
//        } else {
//            var hours = Math.floor(diffMins / 60);
//            var mins = diffMins % 60;
//            return hours + 'h ' + mins + 'm';
//        }
//    };
//    
//    /**
//     * Toggle Auto Refresh
//     */
//    $scope.toggleAutoRefresh = function() {
//        $scope.autoRefresh = !$scope.autoRefresh;
//        
//        if ($scope.autoRefresh) {
//            $scope.startAutoRefresh();
//        } else {
//            $scope.stopAutoRefresh();
//        }
//    };
//    
//    /**
//     * Start Auto Refresh
//     */
//    $scope.startAutoRefresh = function() {
//        if ($scope.refreshInterval) {
//            $interval.cancel($scope.refreshInterval);
//        }
//        
//        $scope.refreshInterval = $interval(function() {
//            if ($scope.selectedDoctorId) {
//                $scope.loadQueue();
//            }
//        }, 10000); // Refresh every 10 seconds
//    };
//    
//    /**
//     * Stop Auto Refresh
//     */
//    $scope.stopAutoRefresh = function() {
//        if ($scope.refreshInterval) {
//            $interval.cancel($scope.refreshInterval);
//            $scope.refreshInterval = null;
//        }
//    };
//    
//    /**
//     * Change Date
//     */
//    $scope.changeDate = function() {
//        $scope.loadQueue();
//    };
//    
//    /**
//     * Cleanup on controller destroy
//     */
//    $scope.$on('$destroy', function() {
//        $scope.stopAutoRefresh();
//    });
//    
//    // Initialize
//    $scope.loadDoctors();
//    
//    // Start auto-refresh if enabled
//    if ($scope.autoRefresh) {
//        $scope.startAutoRefresh();
//    }
//}]);


//// ============ QUEUE MANAGEMENT CONTROLLER ============
//// File: app/controllers/queue-management.controller.js
//
//app.controller('QueueManagementController',
//        ['$scope', '$rootScope', '$location', '$filter', 'OPDService', 'DoctorService',
//            function ($scope, $rootScope, $location, $filter, OPDService, DoctorService) {
//
//    
//    // Initialize
//    $scope.queue = [];
//    $scope.doctors = [];
//    $scope.selectedDoctor = null;
////    $scope.selectedDate = OPDService.getCurrentDate();
//    $scope.selectedDate = new Date(OPDService.getCurrentDate());
//
//    $scope.currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
//    $scope.loading = false;
//    $scope.autoRefresh = true;
//    $scope.refreshInterval = 30000; // 30 seconds
//    
//    // Statistics
//    $scope.stats = {
//        total: 0,
//        waiting: 0,
//        inProgress: 0,
//        completed: 0
//    };
//    
//    /**
//     * Initialize controller
//     */
//    $scope.init = function() {
//        $scope.loadDoctors();
//        
//        // If doctor role, auto-select current doctor
//        if ($scope.currentUser.role === 'DOCTOR') {
//            $scope.selectedDoctor = $scope.currentUser.username; // Assuming username is doctorId
//            $scope.loadQueue();
//        }
//        
//        // Start auto-refresh
//        if ($scope.autoRefresh) {
//            $scope.startAutoRefresh();
//        }
//    };
//    
//    /**
//     * Load available doctors
//     */
//    $scope.loadDoctors = function() {
//        DoctorService.getActiveDoctors().then(
//            function(response) {
//                if (response.data.success) {
//                    $scope.doctors = response.data.data;
//                }
//            },
//            function(error) {
//                console.error('Error loading doctors:', error);
//            }
//        );
//    };
//    
//    $scope.loadQueue = function() {
//
//    if (!$scope.selectedDoctor) {
//        $rootScope.showAlert('warning', 'Please select a doctor');
//        return;
//    }
//
//    if (!$scope.selectedDate) {
//        $rootScope.showAlert('warning', 'Please select a date');
//        return;
//    }
//
//    $scope.loading = true;
//
//    // âœ… STEP-3: Date ko string format me convert karo
//    var formattedDate = $filter('date')(
//        $scope.selectedDate,
//        'yyyy-MM-dd'
//    );
//
//    // âœ… formattedDate backend ko bhejo
//    OPDService.getQueueByDoctorDate(
//        $scope.selectedDoctor,
//        formattedDate
//    ).then(
//        function(response) {
//            $scope.loading = false;
//            if (response.data.success) {
//                $scope.queue = response.data.data;
//                $scope.calculateStatistics();
//            } else {
//                $rootScope.showAlert('danger', response.data.message);
//            }
//        },
//        function(error) {
//            $scope.loading = false;
//            console.error('Error loading queue:', error);
//            $rootScope.showAlert('danger', 'Failed to load queue');
//        }
//    );
//};
//
//    
//    /**
//     * Calculate queue statistics
//     */
//    $scope.calculateStatistics = function() {
//        $scope.stats.total = $scope.queue.length;
//        $scope.stats.waiting = $scope.queue.filter(q => q.status === 'WAITING').length;
//        $scope.stats.inProgress = $scope.queue.filter(q => q.status === 'IN_CONSULTATION').length;
//        $scope.stats.completed = $scope.queue.filter(q => q.status === 'COMPLETED').length;
//    };
//    
//    /**
//     * Call next patient
//     */
//    $scope.callNext = function() {
//        if (!$scope.selectedDoctor) {
//            $rootScope.showAlert('warning', 'Please select a doctor');
//            return;
//        }
//        
//        if (confirm('Call the next patient in queue?')) {
//            $rootScope.showLoading();
//            
//            OPDService.callNextPatient($scope.selectedDoctor, $scope.selectedDate).then(
//                function(response) {
//                    $rootScope.hideLoading();
//                    if (response.data.success) {
//                        $rootScope.showAlert('success', 'Next patient called: ' + response.data.data.patientName);
//                        $scope.loadQueue();
//                    } else {
//                        $rootScope.showAlert('warning', response.data.message);
//                    }
//                },
//                function(error) {
//                    $rootScope.hideLoading();
//                    console.error('Error calling next patient:', error);
//                    $rootScope.showAlert('danger', 'Failed to call next patient');
//                }
//            );
//        }
//    };
//    
//    /**
//     * Start consultation
//     */
//    $scope.startConsultation = function(queueEntry) {
//        if (confirm('Start consultation for ' + queueEntry.patientName + '?')) {
//            $rootScope.showLoading();
//            
//            OPDService.startConsultation(queueEntry.queueId).then(
//                function(response) {
//                    $rootScope.hideLoading();
//                    if (response.data.success) {
//                        $rootScope.showAlert('success', 'Consultation started');
//                        
//                        // Navigate to consultation room
//                        if ($scope.currentUser.role === 'DOCTOR') {
//                            $location.path('/consultation/room').search({
//                                queueId: queueEntry.queueId,
//                                appointmentId: queueEntry.appointmentId,
//                                pinNumber: queueEntry.pinNumber
//                            });
//                        } else {
//                            $scope.loadQueue();
//                        }
//                    } else {
//                        $rootScope.showAlert('danger', response.data.message);
//                    }
//                },
//                function(error) {
//                    $rootScope.hideLoading();
//                    console.error('Error starting consultation:', error);
//                    $rootScope.showAlert('danger', 'Failed to start consultation');
//                }
//            );
//        }
//    };
//    
//    /**
//     * Complete consultation
//     */
//    $scope.completeConsultation = function(queueEntry) {
//        if (confirm('Mark consultation as completed for ' + queueEntry.patientName + '?')) {
//            $rootScope.showLoading();
//            
//            OPDService.completeQueue(queueEntry.queueId).then(
//                function(response) {
//                    $rootScope.hideLoading();
//                    if (response.data.success) {
//                        $rootScope.showAlert('success', 'Consultation completed');
//                        $scope.loadQueue();
//                    } else {
//                        $rootScope.showAlert('danger', response.data.message);
//                    }
//                },
//                function(error) {
//                    $rootScope.hideLoading();
//                    console.error('Error completing consultation:', error);
//                    $rootScope.showAlert('danger', 'Failed to complete consultation');
//                }
//            );
//        }
//    };
//    
//    /**
//     * Get status badge class
//     */
//    $scope.getStatusClass = function(status) {
//        switch(status) {
//            case 'WAITING': return 'badge bg-warning';
//            case 'IN_CONSULTATION': return 'badge bg-primary';
//            case 'COMPLETED': return 'badge bg-success';
//            case 'CANCELLED': return 'badge bg-danger';
//            default: return 'badge bg-secondary';
//        }
//    };
//    
//    /**
//     * Get priority badge class
//     */
//    $scope.getPriorityClass = function(priority) {
//        switch(priority) {
//            case 'URGENT': return 'badge bg-danger';
//            case 'HIGH': return 'badge bg-warning';
//            case 'NORMAL': return 'badge bg-info';
//            default: return 'badge bg-secondary';
//        }
//    };
//    
//    /**
//     * Calculate waiting time
//     */
//    $scope.getWaitingTime = function(checkInTime) {
//        if (!checkInTime) return '0 min';
//        var minutes = OPDService.calculateWaitingTime(checkInTime);
//        if (minutes < 60) {
//            return minutes + ' min';
//        } else {
//            var hours = Math.floor(minutes / 60);
//            var mins = minutes % 60;
//            return hours + 'h ' + mins + 'm';
//        }
//    };
//    
//    /**
//     * Auto-refresh queue
//     */
//    $scope.startAutoRefresh = function() {
//        $scope.refreshTimer = setInterval(function() {
//            if ($scope.autoRefresh && $scope.selectedDoctor) {
//                $scope.$apply(function() {
//                    $scope.loadQueue();
//                });
//            }
//        }, $scope.refreshInterval);
//    };
//    
//    /**
//     * Toggle auto-refresh
//     */
//    $scope.toggleAutoRefresh = function() {
//        $scope.autoRefresh = !$scope.autoRefresh;
//        if ($scope.autoRefresh) {
//            $scope.startAutoRefresh();
//        } else {
//            clearInterval($scope.refreshTimer);
//        }
//    };
//    
//    /**
//     * Refresh queue manually
//     */
//    $scope.refreshQueue = function() {
//        $scope.loadQueue();
//    };
//    
//    /**
//     * Cleanup on destroy
//     */
//    $scope.$on('$destroy', function() {
//        if ($scope.refreshTimer) {
//            clearInterval($scope.refreshTimer);
//        }
//    });
//    
//    // Initialize
//    $scope.init();
//}]);


//Testing 23/12/2025

/**
 * ============================================
 * OPD QUEUE MANAGEMENT CONTROLLER - COMPLETE
 * ============================================
 * Features:
 * âœ… Check-in creates CVR
 * âœ… Queue management
 * âœ… Call next patient
 * âœ… Start consultation
 * âœ… Complete consultation
 */

//app.controller('QueueManagementController',
//    ['$scope', '$rootScope', '$location', '$filter', 'OPDService', 'DoctorService', 'CVRService', 'AppointmentService',
//    function ($scope, $rootScope, $location, $filter, OPDService, DoctorService, CVRService, AppointmentService) {
//
//    // Initialize
//    $scope.queue = [];
//    $scope.doctors = [];
//    $scope.selectedDoctor = null;
//    $scope.selectedDate = new Date(OPDService.getCurrentDate());
//    $scope.currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
//    $scope.loading = false;
//    $scope.autoRefresh = true;
//    $scope.refreshInterval = 30000; // 30 seconds
//    
//    // Statistics
//    $scope.stats = {
//        total: 0,
//        waiting: 0,
//        checkedIn: 0,
//        inProgress: 0,
//        completed: 0
//    };
//    
//    /**
//     * Initialize controller
//     */
//    $scope.init = function() {
//        $scope.loadDoctors();
//        
//        // If doctor role, auto-select current doctor
//        if ($scope.currentUser.role === 'DOCTOR') {
//            $scope.selectedDoctor = $scope.currentUser.username;
//            $scope.loadQueue();
//        }
//        
//        // Start auto-refresh
//        if ($scope.autoRefresh) {
//            $scope.startAutoRefresh();
//        }
//    };
//    
//    /**
//     * Load available doctors
//     */
//    $scope.loadDoctors = function() {
//        DoctorService.getActiveDoctors().then(
//            function(response) {
//                if (response.data.success) {
//                    $scope.doctors = response.data.data;
//                }
//            },
//            function(error) {
//                console.error('Error loading doctors:', error);
//            }
//        );
//    };
//    
//    /**
//     * Load queue for selected doctor and date
//     */
//    $scope.loadQueue = function() {
//        if (!$scope.selectedDoctor) {
//            $rootScope.showAlert('warning', 'Please select a doctor');
//            return;
//        }
//
//        if (!$scope.selectedDate) {
//            $rootScope.showAlert('warning', 'Please select a date');
//            return;
//        }
//
//        $scope.loading = true;
//
//        var formattedDate = $filter('date')($scope.selectedDate, 'yyyy-MM-dd');
//
//        // First, get appointments for the date
//        AppointmentService.getByDoctorDate($scope.selectedDoctor, formattedDate).then(
//            function(response) {
//                if (response.data.success && response.data.data) {
//                    $scope.queue = response.data.data.map(function(apt) {
//                        return {
//                            appointmentId: apt.appointmentId,
//                            tokenNumber: apt.tokenNumber,
//                            patientName: apt.patientName,
//                            pinNumber: apt.pinNumber,
//                            cvrNumber: apt.cvrNumber,
//                            appointmentDate: apt.appointmentDate,
//                            appointmentTime: apt.appointmentTime,
//                            status: apt.status, // SCHEDULED, CHECKED_IN, IN_CONSULTATION, COMPLETED
//                            checkInTime: apt.checkInTime,
//                            priority: apt.priority || 'NORMAL'
//                        };
//                    });
//                    
//                    $scope.calculateStatistics();
//                } else {
//                    $scope.queue = [];
//                    $scope.calculateStatistics();
//                }
//                $scope.loading = false;
//            },
//            function(error) {
//                $scope.loading = false;
//                console.error('Error loading appointments:', error);
//                $rootScope.showAlert('danger', 'Failed to load queue');
//            }
//        );
//    };
//    
//    /**
//     * Calculate queue statistics
//     */
//    $scope.calculateStatistics = function() {
//        $scope.stats.total = $scope.queue.length;
//        $scope.stats.waiting = $scope.queue.filter(q => q.status === 'SCHEDULED').length;
//        $scope.stats.checkedIn = $scope.queue.filter(q => q.status === 'CHECKED_IN').length;
//        $scope.stats.inProgress = $scope.queue.filter(q => q.status === 'IN_CONSULTATION').length;
//        $scope.stats.completed = $scope.queue.filter(q => q.status === 'COMPLETED').length;
//    };
//    
//    /**
//     * âœ… CHECK-IN PATIENT - CREATES CVR
//     */
//    $scope.checkInPatient = function(entry) {
//        if (!entry.appointmentId) {
//            $rootScope.showAlert('danger', 'Invalid appointment');
//            return;
//        }
//        
//        if (confirm('Check-in patient: ' + entry.patientName + '?\n\nThis will create the CVR and record visit time.')) {
//            $rootScope.showLoading();
//            
//            console.log('========== CHECK-IN PROCESS ==========');
//            console.log('Appointment ID:', entry.appointmentId);
//            
//            // Call appointment check-in endpoint
//            AppointmentService.checkin(entry.appointmentId).then(
//                function(response) {
//                    $rootScope.hideLoading();
//                    
//                    console.log('Check-in Response:', response.data);
//                    
//                    if (response.data.success) {
//                        var checkedInData = response.data.data;
//                        
//                        $rootScope.showAlert('success', 
//                            'Patient checked in successfully!\n' +
//                            'CVR Number: ' + checkedInData.cvrNumber);
//                        
//                        // Ask if want to record vitals
//                        setTimeout(function() {
//                            var recordVitals = confirm(
//                                'Patient checked in!\n' +
//                                'CVR: ' + checkedInData.cvrNumber + '\n\n' +
//                                'Do you want to record vitals now?'
//                            );
//                            
//                            if (recordVitals) {
//                                $location.path('/cvr/vitals/' + checkedInData.cvrNumber);
//                                $scope.$apply();
//                            } else {
//                                $scope.loadQueue();
//                            }
//                        }, 1000);
//                        
//                    } else {
//                        $rootScope.showAlert('danger', response.data.message || 'Check-in failed');
//                    }
//                },
//                function(error) {
//                    $rootScope.hideLoading();
//                    console.error('Error during check-in:', error);
//                    
//                    var errorMsg = 'Check-in failed';
//                    if (error.data && error.data.message) {
//                        errorMsg = error.data.message;
//                    }
//                    
//                    $rootScope.showAlert('danger', errorMsg);
//                }
//            );
//        }
//    };
//    
//    /**
//     * Call next patient (first CHECKED_IN patient)
//     */
//    $scope.callNext = function() {
//        if (!$scope.selectedDoctor) {
//            $rootScope.showAlert('warning', 'Please select a doctor');
//            return;
//        }
//        
//        // Find first checked-in patient
//        var nextPatient = $scope.queue.find(function(entry) {
//            return entry.status === 'CHECKED_IN';
//        });
//        
//        if (!nextPatient) {
//            $rootScope.showAlert('info', 'No patients waiting in queue');
//            return;
//        }
//        
//        if (confirm('Call next patient: ' + nextPatient.patientName + '?')) {
//            $rootScope.showAlert('success', 
//                'Calling: ' + nextPatient.patientName + 
//                ' (Token: ' + nextPatient.tokenNumber + ')');
//            
//            // Start consultation automatically
//            setTimeout(function() {
//                $scope.startConsultation(nextPatient);
//            }, 1500);
//        }
//    };
//    
//    /**
//     * Start consultation
//     */
//    $scope.startConsultation = function(entry) {
//        if (entry.status !== 'CHECKED_IN') {
//            $rootScope.showAlert('warning', 'Patient must be checked in first');
//            return;
//        }
//        
//        if (confirm('Start consultation for ' + entry.patientName + '?')) {
//            $rootScope.showLoading();
//            
//            AppointmentService.startConsultation(entry.appointmentId).then(
//                function(response) {
//                    $rootScope.hideLoading();
//                    
//                    if (response.data.success) {
//                        $rootScope.showAlert('success', 'Consultation started');
//                        
//                        // Navigate to consultation room
//                        if ($scope.currentUser.role === 'DOCTOR') {
//                            $location.path('/consultation/room').search({
//                                appointmentId: entry.appointmentId,
//                                pinNumber: entry.pinNumber,
//                                cvrNumber: entry.cvrNumber
//                            });
//                        } else {
//                            $scope.loadQueue();
//                        }
//                    } else {
//                        $rootScope.showAlert('danger', response.data.message);
//                    }
//                },
//                function(error) {
//                    $rootScope.hideLoading();
//                    console.error('Error starting consultation:', error);
//                    $rootScope.showAlert('danger', 'Failed to start consultation');
//                }
//            );
//        }
//    };
//    
//    /**
//     * Complete consultation
//     */
//    $scope.completeConsultation = function(entry) {
//        if (confirm('Mark consultation as completed for ' + entry.patientName + '?')) {
//            $rootScope.showLoading();
//            
//            AppointmentService.completeConsultation(entry.appointmentId).then(
//                function(response) {
//                    $rootScope.hideLoading();
//                    
//                    if (response.data.success) {
//                        $rootScope.showAlert('success', 'Consultation completed');
//                        $scope.loadQueue();
//                    } else {
//                        $rootScope.showAlert('danger', response.data.message);
//                    }
//                },
//                function(error) {
//                    $rootScope.hideLoading();
//                    console.error('Error completing consultation:', error);
//                    $rootScope.showAlert('danger', 'Failed to complete consultation');
//                }
//            );
//        }
//    };
//    
//    /**
//     * Get status badge class
//     */
//    $scope.getStatusClass = function(status) {
//        switch(status) {
//            case 'SCHEDULED': return 'badge bg-secondary';
//            case 'CHECKED_IN': return 'badge bg-warning';
//            case 'IN_CONSULTATION': return 'badge bg-primary';
//            case 'COMPLETED': return 'badge bg-success';
//            case 'CANCELLED': return 'badge bg-danger';
//            case 'NO_SHOW': return 'badge bg-dark';
//            default: return 'badge bg-secondary';
//        }
//    };
//    
//    /**
//     * Get priority badge class
//     */
//    $scope.getPriorityClass = function(priority) {
//        switch(priority) {
//            case 'URGENT': return 'badge bg-danger';
//            case 'HIGH': return 'badge bg-warning';
//            case 'NORMAL': return 'badge bg-info';
//            default: return 'badge bg-secondary';
//        }
//    };
//    
//    /**
//     * Calculate waiting time
//     */
//    $scope.getWaitingTime = function(checkInTime) {
//        if (!checkInTime) return 'Not checked in';
//        
//        var checkIn = new Date(checkInTime);
//        var now = new Date();
//        var diffMs = now - checkIn;
//        var minutes = Math.floor(diffMs / 60000);
//        
//        if (minutes < 60) {
//            return minutes + ' min';
//        } else {
//            var hours = Math.floor(minutes / 60);
//            var mins = minutes % 60;
//            return hours + 'h ' + mins + 'm';
//        }
//    };
//    
//    /**
//     * Auto-refresh queue
//     */
//    $scope.startAutoRefresh = function() {
//        $scope.refreshTimer = setInterval(function() {
//            if ($scope.autoRefresh && $scope.selectedDoctor) {
//                $scope.$apply(function() {
//                    $scope.loadQueue();
//                });
//            }
//        }, $scope.refreshInterval);
//    };
//    
//    /**
//     * Toggle auto-refresh
//     */
//    $scope.toggleAutoRefresh = function() {
//        $scope.autoRefresh = !$scope.autoRefresh;
//        if ($scope.autoRefresh) {
//            $scope.startAutoRefresh();
//        } else {
//            clearInterval($scope.refreshTimer);
//        }
//    };
//    
//    /**
//     * Refresh queue manually
//     */
//    $scope.refreshQueue = function() {
//        $scope.loadQueue();
//    };
//    
//    /**
//     * Cleanup on destroy
//     */
//    $scope.$on('$destroy', function() {
//        if ($scope.refreshTimer) {
//            clearInterval($scope.refreshTimer);
//        }
//    });
//    
//    // Initialize
//    $scope.init();
//}]);



///**
// * ============================================
// * OPD QUEUE MANAGEMENT CONTROLLER - FIXED
// * ============================================
// * Ã¢Å“â€¦ CVR creates during CHECK-IN (not booking)
// * Ã¢Å“â€¦ Proper error handling
// * Ã¢Å“â€¦ Queue management flow
// */
//
//app.controller('QueueManagementController',
//    ['$scope', '$rootScope', '$location', '$filter', 'OPDService', 'DoctorService', 'CVRService', 'AppointmentService',
//    function ($scope, $rootScope, $location, $filter, OPDService, DoctorService, CVRService, AppointmentService) {
//
//    // Initialize
//    $scope.queue = [];
//    $scope.doctors = [];
//    $scope.selectedDoctor = null;
//    $scope.selectedDate = new Date(OPDService.getCurrentDate());
//    $scope.currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
//    $scope.loading = false;
//    $scope.autoRefresh = true;
//    $scope.refreshInterval = 30000; // 30 seconds
//    
//    // Statistics
//    $scope.stats = {
//        total: 0,
//        waiting: 0,
//        checkedIn: 0,
//        inProgress: 0,
//        completed: 0
//    };
//    
//    /**
//     * Initialize controller
//     */
//    $scope.init = function() {
//        console.log('========== INITIALIZING QUEUE MANAGEMENT ==========');
//        console.log('Current User:', $scope.currentUser);
//        
//        $scope.loadDoctors();
//        
//        // If doctor role, auto-select current doctor
//        if ($scope.currentUser.role === 'DOCTOR') {
//            $scope.selectedDoctor = $scope.currentUser.username;
//            $scope.loadQueue();
//        }
//        
//        // Start auto-refresh
//        if ($scope.autoRefresh) {
//            $scope.startAutoRefresh();
//        }
//    };
//    
//    /**
//     * Load available doctors
//     */
//    $scope.loadDoctors = function() {
//        DoctorService.getActiveDoctors().then(
//            function(response) {
//                if (response.data.success) {
//                    $scope.doctors = response.data.data;
//                    console.log('Loaded doctors:', $scope.doctors.length);
//                }
//            },
//            function(error) {
//                console.error('Error loading doctors:', error);
//            }
//        );
//    };
//    
//    /**
//     * Load queue for selected doctor and date
//     */
//    $scope.loadQueue = function() {
//        if (!$scope.selectedDoctor) {
//            $rootScope.showAlert('warning', 'Please select a doctor');
//            return;
//        }
//
//        if (!$scope.selectedDate) {
//            $rootScope.showAlert('warning', 'Please select a date');
//            return;
//        }
//
//        $scope.loading = true;
//
//        var formattedDate = $filter('date')($scope.selectedDate, 'yyyy-MM-dd');
//        
//        console.log('Loading queue:', {
//            doctor: $scope.selectedDoctor,
//            date: formattedDate
//        });
//
//        AppointmentService.getByDoctorDate($scope.selectedDoctor, formattedDate).then(
//            function(response) {
//                $scope.loading = false;
//                
//                if (response.data.success && response.data.data) {
//                    $scope.queue = response.data.data.map(function(apt) {
//                        return {
//                            appointmentId: apt.appointmentId,
//                            tokenNumber: apt.tokenNumber,
//                            patientName: apt.patientName,
//                            pinNumber: apt.pinNumber,
//                            cvrNumber: apt.cvrNumber,
//                            appointmentDate: apt.appointmentDate,
//                            appointmentTime: apt.appointmentTime,
//                            status: apt.status, // SCHEDULED, CHECKED_IN, IN_CONSULTATION, COMPLETED
//                            checkInTime: apt.checkInTime,
//                            priority: apt.priority || 'NORMAL',
//                            symptoms: apt.symptoms,
//                            doctorId: apt.doctorId,
//                            // Ã¢Å“â€¦ Store doctor details if available
//                            doctorName: apt.doctorName,
//                            department: apt.department
//                        };
//                    });
//                    
//                    console.log('Ã¢Å“â€¦ Loaded queue:', $scope.queue.length, 'appointments');
//                    $scope.calculateStatistics();
//                } else {
//                    $scope.queue = [];
//                    $scope.calculateStatistics();
//                }
//            },
//            function(error) {
//                $scope.loading = false;
//                console.error('Error loading queue:', error);
//                $rootScope.showAlert('danger', 'Failed to load queue');
//            }
//        );
//    };
//    
//    /**
//     * Calculate queue statistics
//     */
//    $scope.calculateStatistics = function() {
//        $scope.stats.total = $scope.queue.length;
//        $scope.stats.waiting = $scope.queue.filter(q => q.status === 'SCHEDULED').length;
//        $scope.stats.checkedIn = $scope.queue.filter(q => q.status === 'CHECKED_IN').length;
//        $scope.stats.inProgress = $scope.queue.filter(q => q.status === 'IN_CONSULTATION').length;
//        $scope.stats.completed = $scope.queue.filter(q => q.status === 'COMPLETED').length;
//        
//        console.log('Queue Stats:', $scope.stats);
//    };
//    
//    /**
//     * Ã¢Å“â€¦ CHECK-IN PATIENT - CREATES CVR IMMEDIATELY
//     * This is the MAIN FIX - CVR creates here, not during booking
//     */
//    $scope.checkInPatient = function(entry) {
//        if (!entry.appointmentId) {
//            $rootScope.showAlert('danger', 'Invalid appointment');
//            return;
//        }
//        
//        if (confirm('Check-in patient: ' + entry.patientName + '?\n\nThis will create CVR and record visit time.')) {
//            $rootScope.showLoading();
//            
//            console.log('========== CHECK-IN + CVR CREATION ==========');
//            console.log('Appointment:', entry.appointmentId);
//            console.log('PIN:', entry.pinNumber);
//            console.log('Original Time:', entry.appointmentTime);
//            console.log('Formatted Time:', appointmentTime);
//            
//            // STEP 1: Create CVR first
//            // Ã¢Å“â€¦ FIX: Convert appointmentTime to HH:mm:ss format
//            var appointmentTime = formatTimeForBackend(entry.appointmentTime);
//            
//            var cvrData = {
//                pinNumber: entry.pinNumber,
//                visitType: 'OPD',
//                chiefComplaint: entry.symptoms || 'General consultation',
//                symptoms: entry.symptoms || '',
//                department: entry.department || 'General', // Ã¢Å“â€¦ Use department from appointment if available
//                doctorId: entry.doctorId || $scope.selectedDoctor,
//                createdBy: $scope.currentUser.username || 'system',
//                appointmentId: entry.appointmentId,
//                appointmentDate: entry.appointmentDate,
//                appointmentTime: appointmentTime // Ã¢Å“â€¦ Now in HH:mm:ss format
//            };
//            
//            console.log('Creating CVR with data:', JSON.stringify(cvrData, null, 2));
//            
//            CVRService.create(cvrData).then(
//                function(cvrResponse) {
//                    console.log('CVR Response:', cvrResponse.data);
//                    
//                    if (cvrResponse.data.success && cvrResponse.data.data) {
//                        var cvr = cvrResponse.data.data;
//                        console.log('Ã¢Å“â€¦ CVR Created:', cvr.cvrNumber);
//                        
//                        // STEP 2: Update appointment status to CHECKED_IN
//                        AppointmentService.checkin(entry.appointmentId).then(
//                            function(checkinResponse) {
//                                $rootScope.hideLoading();
//                                
//                                if (checkinResponse.data.success) {
//                                    console.log('Ã¢Å“â€¦ Appointment checked in');
//                                    handleCheckInSuccess(entry, cvr.cvrNumber);
//                                } else {
//                                    // CVR created but check-in failed
//                                    $rootScope.showAlert('warning', 
//                                        'CVR created: ' + cvr.cvrNumber + 
//                                        '\nBut check-in update failed. Please refresh.');
//                                    $scope.loadQueue();
//                                }
//                            },
//                            function(checkinError) {
//                                $rootScope.hideLoading();
//                                console.error('Check-in update failed:', checkinError);
//                                
//                                // CVR is created, just show warning
//                                $rootScope.showAlert('warning',
//                                    'CVR created: ' + cvr.cvrNumber + 
//                                    '\nBut status update failed. Please refresh queue.');
//                                $scope.loadQueue();
//                            }
//                        );
//                        
//                    } else {
//                        $rootScope.hideLoading();
//                        $rootScope.showAlert('danger', 
//                            'Failed to create CVR: ' + (cvrResponse.data.message || 'Unknown error'));
//                    }
//                },
//                function(cvrError) {
//                    $rootScope.hideLoading();
//                    console.error('CVR Creation Error:', cvrError);
//                    
//                    var errorMsg = 'Failed to create CVR';
//                    if (cvrError.data && cvrError.data.message) {
//                        errorMsg = cvrError.data.message;
//                    } else if (cvrError.status === 503) {
//                        errorMsg = 'CVR Service unavailable. Please check if service is running on port 8085.';
//                    } else if (cvrError.status === -1) {
//                        errorMsg = 'Cannot connect to CVR Service. Please verify the service is running.';
//                    }
//                    
//                    $rootScope.showAlert('danger', errorMsg);
//                }
//            );
//        }
//    };
//    
//    /**
//     * Handle successful check-in with CVR
//     */
//    function handleCheckInSuccess(entry, cvrNumber) {
//        console.log('========== CHECK-IN SUCCESS ==========');
//        console.log('CVR Number:', cvrNumber);
//        
//        // Update entry in queue
//        entry.cvrNumber = cvrNumber;
//        entry.status = 'CHECKED_IN';
//        entry.checkInTime = new Date();
//        
//        $rootScope.showAlert('success', 
//            'Patient checked in successfully!\n' +
//            'CVR Number: ' + cvrNumber);
//        
//        // Ask if want to record vitals
//        setTimeout(function() {
//            var recordVitals = confirm(
//                'Patient checked in!\n' +
//                'CVR: ' + cvrNumber + '\n\n' +
//                'Do you want to record vitals now?'
//            );
//            
//            if (recordVitals) {
//                $location.path('/cvr/vitals/' + cvrNumber);
//                $scope.$apply();
//            } else {
//                $scope.loadQueue();
//            }
//        }, 1000);
//    }
//    
//    /**
//     * Call next patient (first CHECKED_IN patient)
//     */
//    $scope.callNext = function() {
//        if (!$scope.selectedDoctor) {
//            $rootScope.showAlert('warning', 'Please select a doctor');
//            return;
//        }
//        
//        // Find first checked-in patient
//        var nextPatient = $scope.queue.find(function(entry) {
//            return entry.status === 'CHECKED_IN';
//        });
//        
//        if (!nextPatient) {
//            $rootScope.showAlert('info', 'No patients waiting in queue');
//            return;
//        }
//        
//        if (confirm('Call next patient: ' + nextPatient.patientName + '?')) {
//            $rootScope.showAlert('success', 
//                'Calling: ' + nextPatient.patientName + 
//                ' (Token: ' + nextPatient.tokenNumber + ')');
//            
//            // Start consultation automatically
//            setTimeout(function() {
//                $scope.startConsultation(nextPatient);
//            }, 1500);
//        }
//    };
//    
//    /**
//     * Start consultation
//     */
//    $scope.startConsultation = function(entry) {
//        if (entry.status !== 'CHECKED_IN') {
//            $rootScope.showAlert('warning', 'Patient must be checked in first');
//            return;
//        }
//        
//        if (!entry.cvrNumber) {
//            $rootScope.showAlert('danger', 'CVR not found. Please check-in patient first.');
//            return;
//        }
//        
//        if (confirm('Start consultation for ' + entry.patientName + '?')) {
//            $rootScope.showLoading();
//            
//            AppointmentService.startConsultation(entry.appointmentId).then(
//                function(response) {
//                    $rootScope.hideLoading();
//                    
//                    if (response.data.success) {
//                        $rootScope.showAlert('success', 'Consultation started');
//                        
//                        // Navigate to consultation room
//                        if ($scope.currentUser.role === 'DOCTOR') {
//                            $location.path('/consultation/room').search({
//                                appointmentId: entry.appointmentId,
//                                pinNumber: entry.pinNumber,
//                                cvrNumber: entry.cvrNumber
//                            });
//                        } else {
//                            $scope.loadQueue();
//                        }
//                    } else {
//                        $rootScope.showAlert('danger', response.data.message);
//                    }
//                },
//                function(error) {
//                    $rootScope.hideLoading();
//                    console.error('Error starting consultation:', error);
//                    $rootScope.showAlert('danger', 'Failed to start consultation');
//                }
//            );
//        }
//    };
//    
//    /**
//     * Complete consultation
//     */
//    $scope.completeConsultation = function(entry) {
//        if (confirm('Mark consultation as completed for ' + entry.patientName + '?')) {
//            $rootScope.showLoading();
//            
//            AppointmentService.completeConsultation(entry.appointmentId).then(
//                function(response) {
//                    $rootScope.hideLoading();
//                    
//                    if (response.data.success) {
//                        $rootScope.showAlert('success', 'Consultation completed');
//                        $scope.loadQueue();
//                    } else {
//                        $rootScope.showAlert('danger', response.data.message);
//                    }
//                },
//                function(error) {
//                    $rootScope.hideLoading();
//                    console.error('Error completing consultation:', error);
//                    $rootScope.showAlert('danger', 'Failed to complete consultation');
//                }
//            );
//        }
//    };
//    
//    /**
//     * Get status badge class
//     */
//    $scope.getStatusClass = function(status) {
//        switch(status) {
//            case 'SCHEDULED': return 'badge bg-secondary';
//            case 'CHECKED_IN': return 'badge bg-warning';
//            case 'IN_CONSULTATION': return 'badge bg-primary';
//            case 'COMPLETED': return 'badge bg-success';
//            case 'CANCELLED': return 'badge bg-danger';
//            case 'NO_SHOW': return 'badge bg-dark';
//            default: return 'badge bg-secondary';
//        }
//    };
//    
//    /**
//     * Get priority badge class
//     */
//    $scope.getPriorityClass = function(priority) {
//        switch(priority) {
//            case 'URGENT': return 'badge bg-danger';
//            case 'HIGH': return 'badge bg-warning';
//            case 'NORMAL': return 'badge bg-info';
//            default: return 'badge bg-secondary';
//        }
//    };
//    
//    /**
//     * Calculate waiting time
//     */
//    $scope.getWaitingTime = function(checkInTime) {
//        if (!checkInTime) return 'Not checked in';
//        
//        var checkIn = new Date(checkInTime);
//        var now = new Date();
//        var diffMs = now - checkIn;
//        var minutes = Math.floor(diffMs / 60000);
//        
//        if (minutes < 60) {
//            return minutes + ' min';
//        } else {
//            var hours = Math.floor(minutes / 60);
//            var mins = minutes % 60;
//            return hours + 'h ' + mins + 'm';
//        }
//    };
//    
//    /**
//     * Ã¢Å“â€¦ FORMAT TIME FOR BACKEND (HH:mm:ss)
//     * Backend expects LocalTime in HH:mm:ss format
//     */
//    function formatTimeForBackend(timeValue) {
//        if (!timeValue) return null;
//        
//        // If already HH:mm:ss format, return as is
//        if (typeof timeValue === 'string' && timeValue.match(/^\d{2}:\d{2}:\d{2}$/)) {
//            return timeValue;
//        }
//        
//        // If HH:mm format, add :00 seconds
//        if (typeof timeValue === 'string' && timeValue.match(/^\d{2}:\d{2}$/)) {
//            return timeValue + ':00';
//        }
//        
//        // If it's a time object with hour/minute
//        if (typeof timeValue === 'object' && timeValue.hour !== undefined) {
//            var hour = ('0' + timeValue.hour).slice(-2);
//            var minute = ('0' + (timeValue.minute || 0)).slice(-2);
//            var second = ('0' + (timeValue.second || 0)).slice(-2);
//            return hour + ':' + minute + ':' + second;
//        }
//        
//        // If it's a Date object
//        if (timeValue instanceof Date) {
//            var h = ('0' + timeValue.getHours()).slice(-2);
//            var m = ('0' + timeValue.getMinutes()).slice(-2);
//            var s = ('0' + timeValue.getSeconds()).slice(-2);
//            return h + ':' + m + ':' + s;
//        }
//        
//        // Default: assume HH:mm and add :00
//        return timeValue.toString() + ':00';
//    }
//    
//    /**
//     * Auto-refresh queue
//     */
//    $scope.startAutoRefresh = function() {
//        $scope.refreshTimer = setInterval(function() {
//            if ($scope.autoRefresh && $scope.selectedDoctor) {
//                $scope.$apply(function() {
//                    $scope.loadQueue();
//                });
//            }
//        }, $scope.refreshInterval);
//    };
//    
//    /**
//     * Toggle auto-refresh
//     */
//    $scope.toggleAutoRefresh = function() {
//        $scope.autoRefresh = !$scope.autoRefresh;
//        if ($scope.autoRefresh) {
//            $scope.startAutoRefresh();
//        } else {
//            clearInterval($scope.refreshTimer);
//        }
//    };
//    
//    /**
//     * Refresh queue manually
//     */
//    $scope.refreshQueue = function() {
//        $scope.loadQueue();
//    };
//    
//    /**
//     * Cleanup on destroy
//     */
//    $scope.$on('$destroy', function() {
//        if ($scope.refreshTimer) {
//            clearInterval($scope.refreshTimer);
//        }
//    });
//    
//    // Initialize
//    $scope.init();
//}]);



/**
 * ============================================
 * COMPLETE FIXED QUEUE MANAGEMENT CONTROLLER
 * ============================================
 * ✅ No $digest errors
 * ✅ CVR number properly updates and persists
 * ✅ Modern Bootstrap modals
 * ✅ Full workflow working
 */

//app.controller('QueueManagementController',
//    ['$scope', '$rootScope', '$location', '$filter', '$timeout', '$q', 
//     'OPDService', 'DoctorService', 'CVRService', 'AppointmentService', 'PatientService',
//    function ($scope, $rootScope, $location, $filter, $timeout, $q, 
//              OPDService, DoctorService, CVRService, AppointmentService, PatientService) {
//
//    // Initialize
//    $scope.queue = [];
//    $scope.doctors = [];
//    $scope.selectedDoctor = null;
//    $scope.selectedDate = new Date();
//    $scope.currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
//    $scope.loading = false;
//    $scope.autoRefresh = true;
//    $scope.refreshInterval = 30000;
//    
//    // Modal data
//    $scope.modalData = {
//        selectedEntry: null,
//        cvrNumber: null
//    };
//    
//    // Statistics
//    $scope.stats = {
//        total: 0,
//        waiting: 0,
//        checkedIn: 0,
//        inProgress: 0,
//        completed: 0
//    };
//    
//    /**
//     * Initialize controller
//     */
//    $scope.init = function() {
//        console.log('========== INITIALIZING QUEUE MANAGEMENT ==========');
//        
//        $scope.loadDoctors();
//        
//        if ($scope.currentUser.role === 'DOCTOR') {
//            $scope.selectedDoctor = $scope.currentUser.username;
//            $scope.loadQueue();
//        }
//        
//        if ($scope.autoRefresh) {
//            $scope.startAutoRefresh();
//        }
//    };
//    
//    /**
//     * Load available doctors
//     */
//    $scope.loadDoctors = function() {
//        DoctorService.getActiveDoctors().then(
//            function(response) {
//                if (response.data.success) {
//                    $scope.doctors = response.data.data;
//                    console.log('✅ Loaded doctors:', $scope.doctors.length);
//                }
//            },
//            function(error) {
//                console.error('Error loading doctors:', error);
//            }
//        );
//    };
//    
//    /**
//     * ✅ LOAD QUEUE WITH PATIENT NAMES
//     */
//    $scope.loadQueue = function() {
//        if (!$scope.selectedDoctor) {
//            $rootScope.showAlert('warning', 'Please select a doctor');
//            return;
//        }
//
//        if (!$scope.selectedDate) {
//            $rootScope.showAlert('warning', 'Please select a date');
//            return;
//        }
//
//        $scope.loading = true;
//        var formattedDate = $filter('date')($scope.selectedDate, 'yyyy-MM-dd');
//
//        console.log('📋 Loading queue for:', $scope.selectedDoctor, 'Date:', formattedDate);
//
//        AppointmentService.getByDoctorDate($scope.selectedDoctor, formattedDate).then(
//            function(response) {
//                if (response.data.success && response.data.data) {
//                    var appointments = response.data.data;
//                    
//                    // Load patient names for all appointments
//                    var promises = appointments.map(function(apt) {
//                        return PatientService.getByPin(apt.pinNumber).then(
//                            function(patientResponse) {
//                                if (patientResponse.data.success) {
//                                    var patient = patientResponse.data.data;
//                                    apt.patientName = patient.firstName + ' ' + patient.lastName;
//                                } else {
//                                    apt.patientName = 'Unknown Patient';
//                                }
//                                return apt;
//                            },
//                            function(error) {
//                                apt.patientName = 'Error Loading';
//                                return apt;
//                            }
//                        );
//                    });
//                    
//                    $q.all(promises).then(function(appointmentsWithNames) {
//                        $scope.queue = appointmentsWithNames.map(function(apt) {
//                            return {
//                                appointmentId: apt.appointmentId,
//                                tokenNumber: apt.tokenNumber,
//                                patientName: apt.patientName,
//                                pinNumber: apt.pinNumber,
//                                cvrNumber: apt.cvrNumber || null,
//                                cvrId: apt.cvrId,
//                                appointmentDate: apt.appointmentDate,
//                                appointmentTime: apt.appointmentTime,
//                                status: apt.status,
//                                checkInTime: apt.checkInTime,
//                                priority: apt.priority || 'NORMAL',
//                                symptoms: apt.symptoms,
//                                doctorId: apt.doctorId,
//                                doctorName: apt.doctorName,
//                                department: apt.department
//                            };
//                        });
//                        
//                        console.log('✅ Queue loaded:', $scope.queue.length, 'appointments');
//                        
//                        // Log CVR numbers
//                        $scope.queue.forEach(function(entry) {
//                            if (entry.cvrNumber) {
//                                console.log('  → Patient:', entry.patientName, '| CVR:', entry.cvrNumber, '| Status:', entry.status);
//                            }
//                        });
//                        
//                        $scope.calculateStatistics();
//                        $scope.loading = false;
//                    });
//                    
//                } else {
//                    $scope.queue = [];
//                    $scope.calculateStatistics();
//                    $scope.loading = false;
//                }
//            },
//            function(error) {
//                $scope.loading = false;
//                console.error('Error loading queue:', error);
//                $rootScope.showAlert('danger', 'Failed to load queue');
//            }
//        );
//    };
//    
//    /**
//     * Calculate queue statistics
//     */
//    $scope.calculateStatistics = function() {
//        $scope.stats.total = $scope.queue.length;
//        $scope.stats.waiting = $scope.queue.filter(q => q.status === 'SCHEDULED').length;
//        $scope.stats.checkedIn = $scope.queue.filter(q => q.status === 'CHECKED_IN').length;
//        $scope.stats.inProgress = $scope.queue.filter(q => q.status === 'IN_CONSULTATION').length;
//        $scope.stats.completed = $scope.queue.filter(q => q.status === 'COMPLETED').length;
//        
//        console.log('📊 Queue Stats:', $scope.stats);
//    };
//    
//    /**
//     * ✅ CHECK-IN PATIENT - SHOW CONFIRMATION MODAL
//     */
//    $scope.checkInPatient = function(entry) {
//        if (!entry.appointmentId) {
//            $rootScope.showAlert('danger', 'Invalid appointment ID');
//            return;
//        }
//        
//        console.log('🔔 Opening check-in confirmation for:', entry.patientName);
//        
//        $scope.modalData.selectedEntry = entry;
//        
//        // Show confirmation modal
//        var modal = new bootstrap.Modal(document.getElementById('checkInConfirmModal'));
//        modal.show();
//    };
//    
//    /**
//     * ✅ CONFIRM CHECK-IN FROM MODAL
//     */
//    $scope.confirmCheckIn = function() {
//        var entry = $scope.modalData.selectedEntry;
//        
//        // Close confirmation modal
//        var confirmModal = bootstrap.Modal.getInstance(document.getElementById('checkInConfirmModal'));
//        confirmModal.hide();
//        
//        // Perform check-in
//        $scope.performCheckIn(entry);
//    };
//    
//    /**
//     * ✅ PERFORM CHECK-IN WITH CVR CREATION - FIXED
//     */
//    $scope.performCheckIn = function(entry) {
//        $scope.loading = true;
//        
//        console.log('========== CHECK-IN + CVR CREATION ==========');
//        console.log('Appointment:', entry.appointmentId);
//        console.log('Patient:', entry.patientName);
//        console.log('PIN:', entry.pinNumber);
//        
//        var appointmentTime = formatTimeForBackend(entry.appointmentTime);
//        
//        var cvrData = {
//            pinNumber: entry.pinNumber,
//            visitType: 'OPD',
//            chiefComplaint: entry.symptoms || 'General consultation',
//            symptoms: entry.symptoms || '',
//            department: entry.department || 'General',
//            doctorId: entry.doctorId || $scope.selectedDoctor,
//            createdBy: $scope.currentUser.username || 'system',
//            appointmentId: entry.appointmentId,
//            appointmentDate: entry.appointmentDate,
//            appointmentTime: appointmentTime
//        };
//        
//        console.log('Creating CVR with data:', JSON.stringify(cvrData, null, 2));
//        
//        CVRService.create(cvrData).then(
//            function(cvrResponse) {
//                console.log('CVR Response:', cvrResponse.data);
//                
//                if (cvrResponse.data.success && cvrResponse.data.data) {
//                    var cvr = cvrResponse.data.data;
//                    console.log('✅ CVR Created:', cvr.cvrNumber);
//                    
//                    // Update appointment to CHECKED_IN
//                    AppointmentService.checkin(entry.appointmentId).then(
//                        function(checkinResponse) {
//                            $scope.loading = false;
//                            
//                            if (checkinResponse.data.success) {
//                                console.log('✅ Appointment checked in');
//                                
//                                // ✅ UPDATE QUEUE ENTRY - THE KEY FIX!
//                                updateQueueEntry(entry.appointmentId, cvr.cvrNumber, 'CHECKED_IN');
//                                
//                                // ✅ SHOW SUCCESS MODAL WITHOUT $apply
//                                $timeout(function() {
//                                    $scope.showCheckInSuccessModal(entry, cvr.cvrNumber);
//                                }, 500);
//                                
//                            } else {
//                                console.warn('Check-in update failed, but CVR is created');
//                                updateQueueEntry(entry.appointmentId, cvr.cvrNumber, 'CHECKED_IN');
//                                
//                                $timeout(function() {
//                                    $scope.showCheckInSuccessModal(entry, cvr.cvrNumber);
//                                }, 500);
//                            }
//                        },
//                        function(checkinError) {
//                            $scope.loading = false;
//                            console.error('Check-in update failed:', checkinError);
//                            
//                            updateQueueEntry(entry.appointmentId, cvr.cvrNumber, 'CHECKED_IN');
//                            
//                            $timeout(function() {
//                                $scope.showCheckInSuccessModal(entry, cvr.cvrNumber);
//                            }, 500);
//                        }
//                    );
//                } else {
//                    $scope.loading = false;
//                    $rootScope.showAlert('danger', 
//                        'Failed to create CVR: ' + (cvrResponse.data.message || 'Unknown error'));
//                }
//            },
//            function(cvrError) {
//                $scope.loading = false;
//                console.error('CVR Creation Error:', cvrError);
//                
//                var errorMsg = 'Failed to create CVR';
//                if (cvrError.status === 503) {
//                    errorMsg = 'CVR Service unavailable.\nPlease check if service is running on port 8085.';
//                } else if (cvrError.data && cvrError.data.message) {
//                    errorMsg = cvrError.data.message;
//                }
//                
//                $rootScope.showAlert('danger', errorMsg);
//            }
//        );
//    };
//    
//    /**
//     * ✅ UPDATE QUEUE ENTRY - HELPER FUNCTION
//     * This updates the entry in place without losing reference
//     */
//    function updateQueueEntry(appointmentId, cvrNumber, status) {
//        console.log('🔄 Updating queue entry...');
//        console.log('   Appointment ID:', appointmentId);
//        console.log('   CVR Number:', cvrNumber);
//        console.log('   New Status:', status);
//        
//        // Find entry in queue
//        for (var i = 0; i < $scope.queue.length; i++) {
//            if ($scope.queue[i].appointmentId === appointmentId) {
//                console.log('✅ Found entry at index:', i);
//                
//                // Update properties directly on existing object
//                $scope.queue[i].cvrNumber = cvrNumber;
//                $scope.queue[i].cvrId = cvrNumber; // Also set cvrId
//                $scope.queue[i].status = status;
//                $scope.queue[i].checkInTime = new Date();
//                
//                console.log('✅ Entry updated:', $scope.queue[i]);
//                console.log('   CVR Number now:', $scope.queue[i].cvrNumber);
//                
//                $scope.calculateStatistics();
//                
//                return $scope.queue[i];
//            }
//        }
//        
//        console.error('❌ Entry not found in queue!');
//        return null;
//    }
//    
//    /**
//     * ✅ SHOW CHECK-IN SUCCESS MODAL (Modern UI)
//     */
//    $scope.showCheckInSuccessModal = function(entry, cvrNumber) {
//        console.log('🎉 Showing success modal');
//        console.log('   CVR Number:', cvrNumber);
//        console.log('   Entry CVR:', entry.cvrNumber);
//        
//        // Get the updated entry from queue
//        var updatedEntry = $scope.queue.find(function(q) {
//            return q.appointmentId === entry.appointmentId;
//        });
//        
//        if (updatedEntry) {
//            console.log('✅ Found updated entry:', updatedEntry);
//            $scope.modalData.selectedEntry = updatedEntry;
//            $scope.modalData.cvrNumber = updatedEntry.cvrNumber || cvrNumber;
//        } else {
//            console.warn('⚠️ Using original entry');
//            $scope.modalData.selectedEntry = entry;
//            $scope.modalData.cvrNumber = cvrNumber;
//        }
//        
//        console.log('Modal Data:', $scope.modalData);
//        
//        // Show modal
//        var modal = new bootstrap.Modal(document.getElementById('checkInSuccessModal'));
//        modal.show();
//    };
//    
//    /**
//     * ✅ NAVIGATE TO VITALS FROM SUCCESS MODAL
//     */
//    $scope.goToVitals = function() {
//        var cvrNumber = $scope.modalData.cvrNumber;
//        
//        console.log('📋 Navigating to vitals for CVR:', cvrNumber);
//        
//        // Close modal
//        var modal = bootstrap.Modal.getInstance(document.getElementById('checkInSuccessModal'));
//        if (modal) {
//            modal.hide();
//        }
//        
//        // Navigate to vitals page
//        $timeout(function() {
//            $location.path('/cvr/vitals/' + cvrNumber);
//        }, 300);
//    };
//    
//    /**
//     * ✅ START CONSULTATION FROM SUCCESS MODAL
//     */
//    $scope.startConsultationFromModal = function() {
//        var entry = $scope.modalData.selectedEntry;
//        
//        console.log('🩺 Starting consultation from modal');
//        console.log('Entry:', entry);
//        
//        // Close modal
//        var modal = bootstrap.Modal.getInstance(document.getElementById('checkInSuccessModal'));
//        if (modal) {
//            modal.hide();
//        }
//        
//        // Start consultation
//        $timeout(function() {
//            $scope.startConsultation(entry);
//        }, 300);
//    };
//    
//    /**
//     * ✅ CLOSE SUCCESS MODAL AND STAY IN QUEUE
//     */
//    $scope.closeSuccessModal = function() {
//        var modal = bootstrap.Modal.getInstance(document.getElementById('checkInSuccessModal'));
//        if (modal) {
//            modal.hide();
//        }
//    };
//    
//    /**
//     * ✅ CALL NEXT PATIENT
//     */
//    $scope.callNext = function() {
//        if (!$scope.selectedDoctor) {
//            $rootScope.showAlert('warning', 'Please select a doctor');
//            return;
//        }
//        
//        var nextPatient = $scope.queue.find(function(entry) {
//            return entry.status === 'CHECKED_IN';
//        });
//        
//        if (!nextPatient) {
//            $rootScope.showAlert('info', 'No patients waiting in queue');
//            return;
//        }
//        
//        $scope.modalData.selectedEntry = nextPatient;
//        
//        // Show call next modal
//        var modal = new bootstrap.Modal(document.getElementById('callNextModal'));
//        modal.show();
//    };
//    
//    /**
//     * ✅ CONFIRM CALL NEXT
//     */
//    $scope.confirmCallNext = function() {
//        var entry = $scope.modalData.selectedEntry;
//        
//        // Close modal
//        var modal = bootstrap.Modal.getInstance(document.getElementById('callNextModal'));
//        if (modal) {
//            modal.hide();
//        }
//        
//        // Show success message
//        $rootScope.showAlert('success', 
//            '📢 Calling: ' + entry.patientName + ' (Token: ' + entry.tokenNumber + ')');
//        
//        // Auto-start consultation after 2 seconds
//        $timeout(function() {
//            $scope.startConsultation(entry);
//        }, 2000);
//    };
//    
//    /**
//     * ✅ START CONSULTATION
//     */
//    $scope.startConsultation = function(entry) {
//        console.log('🩺 Starting consultation...');
//        console.log('Entry:', entry);
//        console.log('CVR Number:', entry.cvrNumber);
//        
//        if (entry.status !== 'CHECKED_IN') {
//            $rootScope.showAlert('warning', 'Patient must be checked in first');
//            return;
//        }
//        
//        if (!entry.cvrNumber) {
//            console.error('❌ CVR Number missing in entry:', entry);
//            
//            // Try to find in queue
//            var queueEntry = $scope.queue.find(function(q) {
//                return q.appointmentId === entry.appointmentId;
//            });
//            
//            if (queueEntry && queueEntry.cvrNumber) {
//                console.log('✅ Found CVR in queue:', queueEntry.cvrNumber);
//                entry.cvrNumber = queueEntry.cvrNumber;
//            } else {
//                $rootScope.showAlert('danger', 'CVR not found. Please check-in patient first.');
//                return;
//            }
//        }
//        
//        $scope.loading = true;
//        
//        AppointmentService.startConsultation(entry.appointmentId).then(
//            function(response) {
//                $scope.loading = false;
//                
//                if (response.data.success) {
//                    // Update entry in queue
//                    updateQueueEntry(entry.appointmentId, entry.cvrNumber, 'IN_CONSULTATION');
//                    
//                    console.log('✅ Redirecting to consultation room...');
//                    console.log('Parameters:', {
//                        appointmentId: entry.appointmentId,
//                        pinNumber: entry.pinNumber,
//                        cvrNumber: entry.cvrNumber
//                    });
//                    
//                    // Navigate to consultation room
//                    $location.path('/consultation/room').search({
//                        appointmentId: entry.appointmentId,
//                        pinNumber: entry.pinNumber,
//                        cvrNumber: entry.cvrNumber
//                    });
//                } else {
//                    $rootScope.showAlert('danger', response.data.message);
//                }
//            },
//            function(error) {
//                $scope.loading = false;
//                console.error('Error starting consultation:', error);
//                $rootScope.showAlert('danger', 'Failed to start consultation');
//            }
//        );
//    };
//    
//    /**
//     * ✅ VIEW/RECORD VITALS
//     */
//    $scope.viewVitals = function(entry) {
//        console.log('📋 Opening vitals page...');
//        console.log('Entry:', entry);
//        console.log('CVR Number:', entry.cvrNumber);
//        
//        if (!entry.cvrNumber) {
//            console.error('❌ CVR Number missing in entry:', entry);
//            
//            // Try to find in queue
//            var queueEntry = $scope.queue.find(function(q) {
//                return q.appointmentId === entry.appointmentId;
//            });
//            
//            if (queueEntry && queueEntry.cvrNumber) {
//                console.log('✅ Found CVR in queue:', queueEntry.cvrNumber);
//                entry.cvrNumber = queueEntry.cvrNumber;
//            } else {
//                $rootScope.showAlert('warning', 'No CVR found. Please check-in patient first.');
//                return;
//            }
//        }
//        
//        console.log('✅ Navigating to vitals page for CVR:', entry.cvrNumber);
//        $location.path('/cvr/vitals/' + entry.cvrNumber);
//    };
//    
//    /**
//     * ✅ COMPLETE CONSULTATION
//     */
//    $scope.completeConsultation = function(entry) {
//        $scope.modalData.selectedEntry = entry;
//        
//        // Show completion modal
//        var modal = new bootstrap.Modal(document.getElementById('completeConsultationModal'));
//        modal.show();
//    };
//    
//    /**
//     * ✅ CONFIRM COMPLETE CONSULTATION
//     */
//    $scope.confirmComplete = function() {
//        var entry = $scope.modalData.selectedEntry;
//        
//        // Close modal
//        var modal = bootstrap.Modal.getInstance(document.getElementById('completeConsultationModal'));
//        if (modal) {
//            modal.hide();
//        }
//        
//        $scope.loading = true;
//        
//        AppointmentService.completeConsultation(entry.appointmentId).then(
//            function(response) {
//                $scope.loading = false;
//                
//                if (response.data.success) {
//                    updateQueueEntry(entry.appointmentId, entry.cvrNumber, 'COMPLETED');
//                    
//                    $rootScope.showAlert('success', 
//                        '✅ Consultation completed successfully for ' + entry.patientName);
//                } else {
//                    $rootScope.showAlert('danger', response.data.message);
//                }
//            },
//            function(error) {
//                $scope.loading = false;
//                console.error('Error completing consultation:', error);
//                $rootScope.showAlert('danger', 'Failed to complete consultation');
//            }
//        );
//    };
//    
//    /**
//     * Helper functions
//     */
//    $scope.getStatusClass = function(status) {
//        switch(status) {
//            case 'SCHEDULED': return 'badge bg-secondary';
//            case 'CHECKED_IN': return 'badge bg-warning text-dark';
//            case 'IN_CONSULTATION': return 'badge bg-primary';
//            case 'COMPLETED': return 'badge bg-success';
//            case 'CANCELLED': return 'badge bg-danger';
//            default: return 'badge bg-secondary';
//        }
//    };
//    
//    $scope.getWaitingTime = function(checkInTime) {
//        if (!checkInTime) return 'Not checked in';
//        
//        var minutes = $scope.getWaitingMinutes(checkInTime);
//        
//        if (minutes < 60) {
//            return minutes + ' min';
//        } else {
//            var hours = Math.floor(minutes / 60);
//            var mins = minutes % 60;
//            return hours + 'h ' + mins + 'm';
//        }
//    };
//    
//    $scope.getWaitingMinutes = function(checkInTime) {
//        if (!checkInTime) return 0;
//        
//        var checkIn = new Date(checkInTime);
//        var now = new Date();
//        var diffMs = now - checkIn;
//        return Math.floor(diffMs / 60000);
//    };
//    
//    /**
//     * Format time for backend (HH:mm:ss)
//     */
//    function formatTimeForBackend(timeValue) {
//        if (!timeValue) return null;
//        
//        if (typeof timeValue === 'string' && timeValue.match(/^\d{2}:\d{2}:\d{2}$/)) {
//            return timeValue;
//        }
//        
//        if (typeof timeValue === 'string' && timeValue.match(/^\d{2}:\d{2}$/)) {
//            return timeValue + ':00';
//        }
//        
//        if (timeValue instanceof Date) {
//            var h = ('0' + timeValue.getHours()).slice(-2);
//            var m = ('0' + timeValue.getMinutes()).slice(-2);
//            var s = ('0' + timeValue.getSeconds()).slice(-2);
//            return h + ':' + m + ':' + s;
//        }
//        
//        return timeValue.toString() + ':00';
//    }
//    
//    /**
//     * Auto-refresh
//     */
//    $scope.startAutoRefresh = function() {
//        $scope.refreshTimer = setInterval(function() {
//            if ($scope.autoRefresh && $scope.selectedDoctor) {
//                $scope.$apply(function() {
//                    console.log('🔄 Auto-refreshing queue...');
//                    $scope.loadQueue();
//                });
//            }
//        }, $scope.refreshInterval);
//    };
//    
//    $scope.toggleAutoRefresh = function() {
//        $scope.autoRefresh = !$scope.autoRefresh;
//        if ($scope.autoRefresh) {
//            $scope.startAutoRefresh();
//        } else {
//            clearInterval($scope.refreshTimer);
//        }
//    };
//    
//    $scope.refreshQueue = function() {
//        console.log('🔄 Manual refresh...');
//        $scope.loadQueue();
//    };
//    
//    $scope.$on('$destroy', function() {
//        if ($scope.refreshTimer) {
//            clearInterval($scope.refreshTimer);
//        }
//    });
//    
//    // Initialize
//    $scope.init();
//}]);

/**
 * ============================================
 * FIXED QUEUE MANAGEMENT - WITH RESUME CONSULTATION
 * ============================================
 * ✅ FIX #2: Doctors can resume IN_CONSULTATION patients
 * ✅ Shows "Resume" button for IN_CONSULTATION status
 * ✅ Complete workflow support
 */

app.controller('QueueManagementController',
    ['$scope', '$rootScope', '$location', '$filter', '$timeout', '$q', 
     'OPDService', 'DoctorService', 'CVRService', 'AppointmentService', 'PatientService',
    function ($scope, $rootScope, $location, $filter, $timeout, $q, 
              OPDService, DoctorService, CVRService, AppointmentService, PatientService) {

    // Initialize
    $scope.queue = [];
    $scope.doctors = [];
    $scope.selectedDoctor = null;
    $scope.selectedDate = new Date();
    $scope.currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    $scope.loading = false;
    $scope.autoRefresh = true;
    $scope.refreshInterval = 30000;
    
    // Modal data
    $scope.modalData = {
        selectedEntry: null,
        cvrNumber: null
    };
    
    // Statistics
    $scope.stats = {
        total: 0,
        waiting: 0,
        checkedIn: 0,
        inProgress: 0,
        completed: 0
    };
    
    /**
     * Initialize controller
     */
    $scope.init = function() {
        console.log('========== INITIALIZING QUEUE MANAGEMENT ==========');
        
        $scope.loadDoctors();
        
        if ($scope.currentUser.role === 'DOCTOR') {
            $scope.selectedDoctor = $scope.currentUser.username;
            $scope.loadQueue();
        }
        
        if ($scope.autoRefresh) {
            $scope.startAutoRefresh();
        }
    };
    
    /**
     * Load available doctors
     */
    $scope.loadDoctors = function() {
        DoctorService.getActiveDoctors().then(
            function(response) {
                if (response.data.success) {
                    $scope.doctors = response.data.data;
                    console.log('✅ Loaded doctors:', $scope.doctors.length);
                }
            },
            function(error) {
                console.error('Error loading doctors:', error);
            }
        );
    };
    
    /**
     * Load queue with patient names
     */
    $scope.loadQueue = function() {
        if (!$scope.selectedDoctor) {
            $rootScope.showAlert('warning', 'Please select a doctor');
            return;
        }

        if (!$scope.selectedDate) {
            $rootScope.showAlert('warning', 'Please select a date');
            return;
        }

        $scope.loading = true;
        var formattedDate = $filter('date')($scope.selectedDate, 'yyyy-MM-dd');

        console.log('📋 Loading queue for:', $scope.selectedDoctor, 'Date:', formattedDate);

        AppointmentService.getByDoctorDate($scope.selectedDoctor, formattedDate).then(
            function(response) {
                if (response.data.success && response.data.data) {
                    var appointments = response.data.data;
                    
                    // Load patient names for all appointments
                    var promises = appointments.map(function(apt) {
                        return PatientService.getByPin(apt.pinNumber).then(
                            function(patientResponse) {
                                if (patientResponse.data.success) {
                                    var patient = patientResponse.data.data;
                                    apt.patientName = patient.firstName + ' ' + patient.lastName;
                                } else {
                                    apt.patientName = 'Unknown Patient';
                                }
                                return apt;
                            },
                            function(error) {
                                apt.patientName = 'Error Loading';
                                return apt;
                            }
                        );
                    });
                    
                    $q.all(promises).then(function(appointmentsWithNames) {
                        $scope.queue = appointmentsWithNames.map(function(apt) {
                            return {
                                appointmentId: apt.appointmentId,
                                tokenNumber: apt.tokenNumber,
                                patientName: apt.patientName,
                                pinNumber: apt.pinNumber,
                                cvrNumber: apt.cvrNumber || null,
                                cvrId: apt.cvrId,
                                appointmentDate: apt.appointmentDate,
                                appointmentTime: apt.appointmentTime,
                                status: apt.status,
                                checkInTime: apt.checkInTime,
                                priority: apt.priority || 'NORMAL',
                                symptoms: apt.symptoms,
                                doctorId: apt.doctorId,
                                doctorName: apt.doctorName,
                                department: apt.department
                            };
                        });
                        
                        console.log('✅ Queue loaded:', $scope.queue.length, 'appointments');
                        
                        // Log CVR numbers
                        $scope.queue.forEach(function(entry) {
                            if (entry.cvrNumber) {
                                console.log('  → Patient:', entry.patientName, '| CVR:', entry.cvrNumber, '| Status:', entry.status);
                            }
                        });
                        
                        $scope.calculateStatistics();
                        $scope.loading = false;
                    });
                    
                } else {
                    $scope.queue = [];
                    $scope.calculateStatistics();
                    $scope.loading = false;
                }
            },
            function(error) {
                $scope.loading = false;
                console.error('Error loading queue:', error);
                $rootScope.showAlert('danger', 'Failed to load queue');
            }
        );
    };
    
    /**
     * Calculate queue statistics
     */
    $scope.calculateStatistics = function() {
        $scope.stats.total = $scope.queue.length;
        $scope.stats.waiting = $scope.queue.filter(q => q.status === 'SCHEDULED').length;
        $scope.stats.checkedIn = $scope.queue.filter(q => q.status === 'CHECKED_IN').length;
        $scope.stats.inProgress = $scope.queue.filter(q => q.status === 'IN_CONSULTATION' || q.status === 'CONSULTING').length;
        $scope.stats.completed = $scope.queue.filter(q => q.status === 'COMPLETED').length;
        
        console.log('📊 Queue Stats:', $scope.stats);
    };
    
    /**
     * Check-in patient
     */
    $scope.checkInPatient = function(entry) {
        if (!entry.appointmentId) {
            $rootScope.showAlert('danger', 'Invalid appointment ID');
            return;
        }
        
        console.log('🔔 Opening check-in confirmation for:', entry.patientName);
        
        $scope.modalData.selectedEntry = entry;
        
        var modal = new bootstrap.Modal(document.getElementById('checkInConfirmModal'));
        modal.show();
    };
    
    /**
     * Confirm check-in
     */
    $scope.confirmCheckIn = function() {
        var entry = $scope.modalData.selectedEntry;
        
        var confirmModal = bootstrap.Modal.getInstance(document.getElementById('checkInConfirmModal'));
        confirmModal.hide();
        
        $scope.performCheckIn(entry);
    };
    
    /**
     * Perform check-in with CVR creation
     */
    $scope.performCheckIn = function(entry) {
        $scope.loading = true;
        
        console.log('========== CHECK-IN + CVR CREATION ==========');
        console.log('Appointment:', entry.appointmentId);
        console.log('Patient:', entry.patientName);
        console.log('PIN:', entry.pinNumber);
        
        var appointmentTime = formatTimeForBackend(entry.appointmentTime);
        
        var cvrData = {
            pinNumber: entry.pinNumber,
            visitType: 'OPD',
            chiefComplaint: entry.symptoms || 'General consultation',
            symptoms: entry.symptoms || '',
            department: entry.department || 'General',
            doctorId: entry.doctorId || $scope.selectedDoctor,
            createdBy: $scope.currentUser.username || 'system',
            appointmentId: entry.appointmentId,
            appointmentDate: entry.appointmentDate,
            appointmentTime: appointmentTime
        };
        
        console.log('Creating CVR with data:', JSON.stringify(cvrData, null, 2));
        
        CVRService.create(cvrData).then(
            function(cvrResponse) {
                console.log('CVR Response:', cvrResponse.data);
                
                if (cvrResponse.data.success && cvrResponse.data.data) {
                    var cvr = cvrResponse.data.data;
                    console.log('✅ CVR Created:', cvr.cvrNumber);
                    
                    AppointmentService.checkin(entry.appointmentId).then(
                        function(checkinResponse) {
                            $scope.loading = false;
                            
                            if (checkinResponse.data.success) {
                                console.log('✅ Appointment checked in');
                                updateQueueEntry(entry.appointmentId, cvr.cvrNumber, 'CHECKED_IN');
                                
                                $timeout(function() {
                                    $scope.showCheckInSuccessModal(entry, cvr.cvrNumber);
                                }, 500);
                                
                            } else {
                                console.warn('Check-in update failed, but CVR is created');
                                updateQueueEntry(entry.appointmentId, cvr.cvrNumber, 'CHECKED_IN');
                                
                                $timeout(function() {
                                    $scope.showCheckInSuccessModal(entry, cvr.cvrNumber);
                                }, 500);
                            }
                        },
                        function(checkinError) {
                            $scope.loading = false;
                            console.error('Check-in update failed:', checkinError);
                            
                            updateQueueEntry(entry.appointmentId, cvr.cvrNumber, 'CHECKED_IN');
                            
                            $timeout(function() {
                                $scope.showCheckInSuccessModal(entry, cvr.cvrNumber);
                            }, 500);
                        }
                    );
                } else {
                    $scope.loading = false;
                    $rootScope.showAlert('danger', 
                        'Failed to create CVR: ' + (cvrResponse.data.message || 'Unknown error'));
                }
            },
            function(cvrError) {
                $scope.loading = false;
                console.error('CVR Creation Error:', cvrError);
                
                var errorMsg = 'Failed to create CVR';
                if (cvrError.status === 503) {
                    errorMsg = 'CVR Service unavailable.\nPlease check if service is running on port 8085.';
                } else if (cvrError.data && cvrError.data.message) {
                    errorMsg = cvrError.data.message;
                }
                
                $rootScope.showAlert('danger', errorMsg);
            }
        );
    };
    
    /**
     * Update queue entry helper
     */
    function updateQueueEntry(appointmentId, cvrNumber, status) {
        console.log('🔄 Updating queue entry...');
        console.log('   Appointment ID:', appointmentId);
        console.log('   CVR Number:', cvrNumber);
        console.log('   New Status:', status);
        
        for (var i = 0; i < $scope.queue.length; i++) {
            if ($scope.queue[i].appointmentId === appointmentId) {
                console.log('✅ Found entry at index:', i);
                
                $scope.queue[i].cvrNumber = cvrNumber;
                $scope.queue[i].cvrId = cvrNumber;
                $scope.queue[i].status = status;
                $scope.queue[i].checkInTime = new Date();
                
                console.log('✅ Entry updated:', $scope.queue[i]);
                console.log('   CVR Number now:', $scope.queue[i].cvrNumber);
                
                $scope.calculateStatistics();
                
                return $scope.queue[i];
            }
        }
        
        console.error('❌ Entry not found in queue!');
        return null;
    }
    
    /**
     * Show check-in success modal
     */
    $scope.showCheckInSuccessModal = function(entry, cvrNumber) {
        console.log('🎉 Showing success modal');
        
        var updatedEntry = $scope.queue.find(function(q) {
            return q.appointmentId === entry.appointmentId;
        });
        
        if (updatedEntry) {
            console.log('✅ Found updated entry:', updatedEntry);
            $scope.modalData.selectedEntry = updatedEntry;
            $scope.modalData.cvrNumber = updatedEntry.cvrNumber || cvrNumber;
        } else {
            console.warn('⚠️ Using original entry');
            $scope.modalData.selectedEntry = entry;
            $scope.modalData.cvrNumber = cvrNumber;
        }
        
        var modal = new bootstrap.Modal(document.getElementById('checkInSuccessModal'));
        modal.show();
    };
    
    /**
     * Navigate to vitals
     */
    $scope.goToVitals = function() {
        var cvrNumber = $scope.modalData.cvrNumber;
        
        console.log('📋 Navigating to vitals for CVR:', cvrNumber);
        
        var modal = bootstrap.Modal.getInstance(document.getElementById('checkInSuccessModal'));
        if (modal) {
            modal.hide();
        }
        
        $timeout(function() {
            $location.path('/cvr/vitals/' + cvrNumber);
        }, 300);
    };
    
    /**
     * Start consultation from modal
     */
    $scope.startConsultationFromModal = function() {
        var entry = $scope.modalData.selectedEntry;
        
        console.log('🩺 Starting consultation from modal');
        
        var modal = bootstrap.Modal.getInstance(document.getElementById('checkInSuccessModal'));
        if (modal) {
            modal.hide();
        }
        
        $timeout(function() {
            $scope.startConsultation(entry);
        }, 300);
    };
    
    /**
     * Close success modal
     */
    $scope.closeSuccessModal = function() {
        var modal = bootstrap.Modal.getInstance(document.getElementById('checkInSuccessModal'));
        if (modal) {
            modal.hide();
        }
    };
    
    /**
     * Call next patient
     */
    $scope.callNext = function() {
        if (!$scope.selectedDoctor) {
            $rootScope.showAlert('warning', 'Please select a doctor');
            return;
        }
        
        var nextPatient = $scope.queue.find(function(entry) {
            return entry.status === 'CHECKED_IN';
        });
        
        if (!nextPatient) {
            $rootScope.showAlert('info', 'No patients waiting in queue');
            return;
        }
        
        $scope.modalData.selectedEntry = nextPatient;
        
        var modal = new bootstrap.Modal(document.getElementById('callNextModal'));
        modal.show();
    };
    
    /**
     * Confirm call next
     */
    $scope.confirmCallNext = function() {
        var entry = $scope.modalData.selectedEntry;
        
        var modal = bootstrap.Modal.getInstance(document.getElementById('callNextModal'));
        if (modal) {
            modal.hide();
        }
        
        $rootScope.showAlert('success', 
            '📢 Calling: ' + entry.patientName + ' (Token: ' + entry.tokenNumber + ')');
        
        $timeout(function() {
            $scope.startConsultation(entry);
        }, 2000);
    };
    
    /**
     * ✅ FIX #2: START CONSULTATION (Works for both CHECKED_IN and IN_CONSULTATION)
     */
    $scope.startConsultation = function(entry) {
        console.log('🩺 Starting/Resuming consultation...');
        console.log('Entry:', entry);
        console.log('CVR Number:', entry.cvrNumber);
        console.log('Status:', entry.status);
        
        // ✅ Allow both CHECKED_IN and IN_CONSULTATION status
        if (entry.status !== 'CHECKED_IN' && entry.status !== 'IN_CONSULTATION' && entry.status !== 'CONSULTING') {
            $rootScope.showAlert('warning', 'Patient must be checked in first');
            return;
        }
        
        if (!entry.cvrNumber) {
            console.error('❌ CVR Number missing in entry:', entry);
            
            var queueEntry = $scope.queue.find(function(q) {
                return q.appointmentId === entry.appointmentId;
            });
            
            if (queueEntry && queueEntry.cvrNumber) {
                console.log('✅ Found CVR in queue:', queueEntry.cvrNumber);
                entry.cvrNumber = queueEntry.cvrNumber;
            } else {
                $rootScope.showAlert('danger', 'CVR not found. Please check-in patient first.');
                return;
            }
        }
        
        $scope.loading = true;
        
        // ✅ Only update status if not already IN_CONSULTATION
        if (entry.status === 'CHECKED_IN') {
            AppointmentService.startConsultation(entry.appointmentId).then(
                function(response) {
                    $scope.loading = false;
                    
                    if (response.data.success) {
                        updateQueueEntry(entry.appointmentId, entry.cvrNumber, 'IN_CONSULTATION');
                        navigateToConsultationRoom(entry);
                    } else {
                        $rootScope.showAlert('danger', response.data.message);
                    }
                },
                function(error) {
                    $scope.loading = false;
                    console.error('Error starting consultation:', error);
                    $rootScope.showAlert('danger', 'Failed to start consultation');
                }
            );
        } else {
            // ✅ Already IN_CONSULTATION, just navigate
            $scope.loading = false;
            navigateToConsultationRoom(entry);
        }
    };
    
    /**
     * ✅ HELPER: Navigate to consultation room OR prescription room based on progress
     */
    function navigateToConsultationRoom(entry) {
        console.log('✅ Checking if consultation already exists...');
        
        $scope.loading = true;
        // Check if consultation exists
        var apiUrl = API_CONFIG.GATEWAY_URL + API_CONFIG.ENDPOINTS.CONSULTATION.GET_BY_CVR.replace('{cvrNumber}', entry.cvrNumber);
        
        $.ajax({
            url: apiUrl,
            type: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('authToken')
            },
            success: function(response) {
                $scope.$apply(function() {
                    $scope.loading = false;
                    if (response && response.success && response.data) {
                        // Consultation already done! Go to prescription.
                        console.log('✅ Consultation already exists. Navigating to prescription room...', response.data.consultationId);
                        $location.path('/prescription/create/' + response.data.consultationId).search({edit: 'true'});
                    } else {
                        // No consultation yet. Go to consultation room.
                        console.log('✅ No consultation yet. Redirecting to consultation room...');
                        $location.path('/consultation/room').search({
                            appointmentId: entry.appointmentId,
                            pinNumber: entry.pinNumber,
                            cvrNumber: entry.cvrNumber
                        });
                    }
                });
            },
            error: function() {
                $scope.$apply(function() {
                    $scope.loading = false;
                    console.log('✅ Redirecting to consultation room...');
                    $location.path('/consultation/room').search({
                        appointmentId: entry.appointmentId,
                        pinNumber: entry.pinNumber,
                        cvrNumber: entry.cvrNumber
                    });
                });
            }
        });
    }
    
    /**
     * View/Record vitals
     */
    $scope.viewVitals = function(entry) {
        console.log('📋 Opening vitals page...');
        
        if (!entry.cvrNumber) {
            console.error('❌ CVR Number missing');
            
            var queueEntry = $scope.queue.find(function(q) {
                return q.appointmentId === entry.appointmentId;
            });
            
            if (queueEntry && queueEntry.cvrNumber) {
                entry.cvrNumber = queueEntry.cvrNumber;
            } else {
                $rootScope.showAlert('warning', 'No CVR found. Please check-in patient first.');
                return;
            }
        }
        
        console.log('✅ Navigating to vitals page for CVR:', entry.cvrNumber);
        $location.path('/cvr/vitals/' + entry.cvrNumber);
    };
    
    /**
     * Complete consultation
     */
    $scope.completeConsultation = function(entry) {
        $scope.modalData.selectedEntry = entry;
        
        var modal = new bootstrap.Modal(document.getElementById('completeConsultationModal'));
        modal.show();
    };
    
    /**
     * Confirm complete consultation
     */
    $scope.confirmComplete = function() {
        var entry = $scope.modalData.selectedEntry;
        
        var modal = bootstrap.Modal.getInstance(document.getElementById('completeConsultationModal'));
        if (modal) {
            modal.hide();
        }
        
        $scope.loading = true;
        
        AppointmentService.completeConsultation(entry.appointmentId).then(
            function(response) {
                $scope.loading = false;
                
                if (response.data.success) {
                    updateQueueEntry(entry.appointmentId, entry.cvrNumber, 'COMPLETED');
                    
                    $rootScope.showAlert('success', 
                        '✅ Consultation completed successfully for ' + entry.patientName);
                } else {
                    $rootScope.showAlert('danger', response.data.message);
                }
            },
            function(error) {
                $scope.loading = false;
                console.error('Error completing consultation:', error);
                $rootScope.showAlert('danger', 'Failed to complete consultation');
            }
        );
    };
    
    /**
     * Helper functions
     */
    $scope.getStatusClass = function(status) {
        switch(status) {
            case 'SCHEDULED': return 'badge bg-secondary';
            case 'CHECKED_IN': return 'badge bg-warning text-dark';
            case 'IN_CONSULTATION': return 'badge bg-primary';
            case 'COMPLETED': return 'badge bg-success';
            case 'CANCELLED': return 'badge bg-danger';
            default: return 'badge bg-secondary';
        }
    };
    
    $scope.getWaitingTime = function(checkInTime) {
        if (!checkInTime) return 'Not checked in';
        
        var minutes = $scope.getWaitingMinutes(checkInTime);
        
        if (minutes < 60) {
            return minutes + ' min';
        } else {
            var hours = Math.floor(minutes / 60);
            var mins = minutes % 60;
            return hours + 'h ' + mins + 'm';
        }
    };
    
    $scope.getWaitingMinutes = function(checkInTime) {
        if (!checkInTime) return 0;
        
        var checkIn = new Date(checkInTime);
        var now = new Date();
        var diffMs = now - checkIn;
        return Math.floor(diffMs / 60000);
    };
    
    /**
     * Format time for backend
     */
    function formatTimeForBackend(timeValue) {
        if (!timeValue) return null;
        
        if (typeof timeValue === 'string' && timeValue.match(/^\d{2}:\d{2}:\d{2}$/)) {
            return timeValue;
        }
        
        if (typeof timeValue === 'string' && timeValue.match(/^\d{2}:\d{2}$/)) {
            return timeValue + ':00';
        }
        
        if (timeValue instanceof Date) {
            var h = ('0' + timeValue.getHours()).slice(-2);
            var m = ('0' + timeValue.getMinutes()).slice(-2);
            var s = ('0' + timeValue.getSeconds()).slice(-2);
            return h + ':' + m + ':' + s;
        }
        
        return timeValue.toString() + ':00';
    }
    
    /**
     * Auto-refresh
     */
    $scope.startAutoRefresh = function() {
        $scope.refreshTimer = setInterval(function() {
            if ($scope.autoRefresh && $scope.selectedDoctor) {
                $scope.$apply(function() {
                    console.log('🔄 Auto-refreshing queue...');
                    $scope.loadQueue();
                });
            }
        }, $scope.refreshInterval);
    };
    
    $scope.toggleAutoRefresh = function() {
        $scope.autoRefresh = !$scope.autoRefresh;
        if ($scope.autoRefresh) {
            $scope.startAutoRefresh();
        } else {
            clearInterval($scope.refreshTimer);
        }
    };
    
    $scope.refreshQueue = function() {
        console.log('🔄 Manual refresh...');
        $scope.loadQueue();
    };
    
    $scope.$on('$destroy', function() {
        if ($scope.refreshTimer) {
            clearInterval($scope.refreshTimer);
        }
    });
    
    // Initialize
    $scope.init();
    
    /**
 * Resume consultation after logout / crash / power fail
 */

$scope.resumeConsultation = function(entry) {

    console.log('♻️ Resuming consultation...');
    console.log('Entry:', entry);

    if (!entry.cvrNumber) {
        $rootScope.showAlert('danger', 
            'CVR missing. Cannot resume consultation.');
        return;
    }

    // DO NOT change status again
    // Just reopen consultation room

    navigateToConsultationRoom(entry);
};

}]);