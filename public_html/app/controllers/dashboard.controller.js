///* 
// * To change this license header, choose License Headers in Project Properties.
// * To change this template file, choose Tools | Templates
// * and open the template in the editor.
// */
//
///**
// * Dashboard Controller
// * Role-based dashboard display
// */
//
///**
// * Dashboard Controller
// * FIXED: Statistics showing correctly now
// */
//
//app.controller('DashboardController', ['$scope', '$rootScope', 'PatientService', 'DoctorService', 
//    'AppointmentService', 'CVRService', 'AuthService',
//    function($scope, $rootScope, PatientService, DoctorService, AppointmentService, CVRService, AuthService) {
//    
//    // Get current user
//    $scope.currentUser = AuthService.getCurrentUser();
//    $scope.userRole = $scope.currentUser ? $scope.currentUser.role : '';
//    
//    // Statistics
//    $scope.stats = {
//        totalPatients: 0,
//        totalDoctors: 0,
//        todayAppointments: 0,
//        todayCVRs: 0,
//        pendingConsultations: 0
//    };
//    
//    $scope.loading = true;
//    $scope.todayAppointments = [];
//    $scope.todayCVRs = [];
//    
//    /**
//     * Load Dashboard Statistics
//     */
//    $scope.loadStatistics = function() {
//        $scope.loading = true;
//        
//        // Counter for completed requests
//        var completedRequests = 0;
//        var totalRequests = 4;
//        
//        function checkAllLoaded() {
//            completedRequests++;
//            if (completedRequests >= totalRequests) {
//                $scope.loading = false;
//                console.log('All statistics loaded:', $scope.stats);
//            }
//        }
//        
//        // Get Total Patients
//        PatientService.getCount()
//            .then(function(response) {
//                console.log('Patient count response:', response.data);
//                if (response.data.success) {
//                    $scope.stats.totalPatients = response.data.data;
//                }
//                checkAllLoaded();
//            })
//            .catch(function(error) {
//                console.error('Error loading patient count:', error);
//                checkAllLoaded();
//            });
//        
//        // Get Total Doctors
//        DoctorService.getCount()
//            .then(function(response) {
//                console.log('Doctor count response:', response.data);
//                if (response.data.success) {
//                    $scope.stats.totalDoctors = response.data.data;
//                }
//                checkAllLoaded();
//            })
//            .catch(function(error) {
//                console.error('Error loading doctor count:', error);
//                checkAllLoaded();
//            });
//        
//        // Get Today's Appointments
//        AppointmentService.getToday()
//            .then(function(response) {
//                console.log('Today appointments response:', response.data);
//                if (response.data.success) {
//                    $scope.todayAppointments = response.data.data;
//                    $scope.stats.todayAppointments = response.data.data.length;
//                }
//                checkAllLoaded();
//            })
//            .catch(function(error) {
//                console.error('Error loading today appointments:', error);
//                checkAllLoaded();
//            });
//        
//        // Get Today's CVRs
//        CVRService.getToday()
//            .then(function(response) {
//                console.log('Today CVRs response:', response.data);
//                if (response.data.success) {
//                    $scope.todayCVRs = response.data.data;
//                    $scope.stats.todayCVRs = response.data.data.length;
//                }
//                checkAllLoaded();
//            })
//            .catch(function(error) {
//                console.error('Error loading today CVRs:', error);
//                checkAllLoaded();
//            });
//        
//        // Get Pending Consultations (Checked-In status) - Only for Doctor/Admin
//        if ($scope.userRole === 'DOCTOR' || $scope.userRole === 'ADMIN') {
//            totalRequests = 5;
//            AppointmentService.getByStatus('Checked-In')
//                .then(function(response) {
//                    console.log('Pending consultations response:', response.data);
//                    if (response.data.success) {
//                        $scope.stats.pendingConsultations = response.data.data.length;
//                    }
//                    checkAllLoaded();
//                })
//                .catch(function(error) {
//                    console.error('Error loading pending consultations:', error);
//                    checkAllLoaded();
//                });
//        }
//    };
//    
//    /**
//     * Quick Action - Register Patient
//     */
//    $scope.registerPatient = function() {
//        window.location.href = '#!/patient/register';
//    };
//    
//    /**
//     * Quick Action - Book Appointment
//     */
//    $scope.bookAppointment = function() {
//        window.location.href = '#!/appointment/book';
//    };
//    
//    /**
//     * Quick Action - Create CVR
//     */
//    $scope.createCVR = function() {
//        window.location.href = '#!/cvr/create';
//    };
//    
//    /**
//     * Quick Action - View Queue
//     */
//    $scope.viewQueue = function() {
//        window.location.href = '#!/opd/queue';
//    };
//    
//    /**
//     * Check if user has role
//     */
//    $scope.hasRole = function(roles) {
//        return roles.indexOf($scope.userRole) !== -1;
//    };
//    
//    /**
//     * Refresh Statistics
//     */
//    $scope.refreshStats = function() {
//        $scope.loadStatistics();
//        $rootScope.showAlert('info', 'Statistics refreshed');
//    };
//    
//    // Initialize
//    console.log('Dashboard initialized for user:', $scope.currentUser);
//    $scope.loadStatistics();
//}]);


/**
 * Dashboard Controller - FIXED
 * ✅ Proper data extraction for appointments
 * ✅ Shows patient and doctor names correctly
 */

app.controller('DashboardController', ['$scope', '$rootScope', 'PatientService', 'DoctorService', 
    'AppointmentService', 'CVRService', 'AuthService',
    function($scope, $rootScope, PatientService, DoctorService, AppointmentService, CVRService, AuthService) {
    
    // Get current user
    $scope.currentUser = AuthService.getCurrentUser();
    $scope.userRole = $scope.currentUser ? $scope.currentUser.role : '';
    
    // Statistics
    $scope.stats = {
        totalPatients: 0,
        totalDoctors: 0,
        todayAppointments: 0,
        todayCVRs: 0,
        pendingConsultations: 0
    };
    
    $scope.loading = true;
    $scope.todayAppointments = [];
    $scope.todayCVRs = [];
    
    /**
     * Load Dashboard Statistics
     */
    $scope.loadStatistics = function() {
        $scope.loading = true;
        
        var completedRequests = 0;
        var totalRequests = 4;
        
        function checkAllLoaded() {
            completedRequests++;
            if (completedRequests >= totalRequests) {
                $scope.loading = false;
                console.log('✅ All statistics loaded:', $scope.stats);
                console.log('✅ Today Appointments:', $scope.todayAppointments);
            }
        }
        
        // Get Total Patients
        PatientService.getCount()
            .then(function(response) {
                console.log('Patient count response:', response.data);
                if (response.data.success) {
                    $scope.stats.totalPatients = response.data.data;
                }
                checkAllLoaded();
            })
            .catch(function(error) {
                console.error('Error loading patient count:', error);
                checkAllLoaded();
            });
        
        // Get Total Doctors
        DoctorService.getCount()
            .then(function(response) {
                console.log('Doctor count response:', response.data);
                if (response.data.success) {
                    $scope.stats.totalDoctors = response.data.data;
                }
                checkAllLoaded();
            })
            .catch(function(error) {
                console.error('Error loading doctor count:', error);
                checkAllLoaded();
            });
        
        // ✅ FIXED: Get Today's Appointments with proper data extraction
        AppointmentService.getToday()
            .then(function(response) {
                console.log('========== TODAY APPOINTMENTS ==========');
                console.log('Raw Response:', response.data);
                
                if (response.data.success && response.data.data) {
                    // ✅ Process each appointment to ensure all fields are present
                    $scope.todayAppointments = response.data.data.map(function(appt) {
                        console.log('Processing appointment:', appt);
                        
                        return {
                            appointmentId: appt.appointmentId,
                            tokenNumber: appt.tokenNumber,
                            pinNumber: appt.pinNumber || 'N/A',
                            patientName: appt.patientName || 'Unknown Patient',
                            doctorName: appt.doctorName || 'Dr. ' + (appt.doctorId || 'Unknown'),
                            appointmentDate: appt.appointmentDate,
                            appointmentTime: formatTime(appt.appointmentTime),
                            status: appt.status || 'Unknown',
                            appointmentType: appt.appointmentType || 'Consultation',
                            cvrNumber: appt.cvrNumber || null,
                            symptoms: appt.symptoms
                        };
                    });
                    
                    $scope.stats.todayAppointments = $scope.todayAppointments.length;
                    
                    console.log('✅ Processed Appointments:', $scope.todayAppointments);
                } else {
                    $scope.todayAppointments = [];
                    $scope.stats.todayAppointments = 0;
                }
                checkAllLoaded();
            })
            .catch(function(error) {
                console.error('❌ Error loading today appointments:', error);
                $scope.todayAppointments = [];
                checkAllLoaded();
            });
        
        // Get Today's CVRs
        CVRService.getToday()
            .then(function(response) {
                console.log('Today CVRs response:', response.data);
                if (response.data.success && response.data.data) {
                    $scope.todayCVRs = response.data.data;
                    $scope.stats.todayCVRs = response.data.data.length;
                } else {
                    $scope.todayCVRs = [];
                    $scope.stats.todayCVRs = 0;
                }
                checkAllLoaded();
            })
            .catch(function(error) {
                console.error('Error loading today CVRs:', error);
                $scope.todayCVRs = [];
                checkAllLoaded();
            });
        
        // Get Pending Consultations
        if ($scope.userRole === 'DOCTOR' || $scope.userRole === 'ADMIN') {
            totalRequests = 5;
            AppointmentService.getByStatus('CHECKED_IN')
                .then(function(response) {
                    if (response.data.success) {
                        $scope.stats.pendingConsultations = response.data.data.length;
                    }
                    checkAllLoaded();
                })
                .catch(function(error) {
                    console.error('Error loading pending consultations:', error);
                    checkAllLoaded();
                });
        }
    };
    
    /**
     * ✅ Format Time Helper
     */
    function formatTime(timeObj) {
        if (!timeObj) return 'N/A';
        
        // If it's already a string
        if (typeof timeObj === 'string') {
            return timeObj.substring(0, 5); // HH:mm
        }
        
        // If it's an object with hour/minute
        if (typeof timeObj === 'object' && timeObj.hour !== undefined) {
            var hour = ('0' + timeObj.hour).slice(-2);
            var minute = ('0' + (timeObj.minute || 0)).slice(-2);
            return hour + ':' + minute;
        }
        
        return 'N/A';
    }
    
    /**
     * ✅ Get Status Badge Class
     */
    $scope.getStatusClass = function(status) {
        switch(status) {
            case 'SCHEDULED':
                return 'bg-secondary';
            case 'CHECKED_IN':
                return 'bg-warning';
            case 'IN_CONSULTATION':
                return 'bg-primary';
            case 'COMPLETED':
                return 'bg-success';
            case 'CANCELLED':
                return 'bg-danger';
            default:
                return 'bg-secondary';
        }
    };
    
    /**
     * Quick Actions
     */
    $scope.registerPatient = function() {
        window.location.href = '#!/patient/register';
    };
    
    $scope.bookAppointment = function() {
        window.location.href = '#!/appointment/book';
    };
    
    $scope.createCVR = function() {
        window.location.href = '#!/cvr/create';
    };
    
    $scope.viewQueue = function() {
        window.location.href = '#!/opd/queue';
    };
    
    $scope.hasRole = function(roles) {
        return roles.indexOf($scope.userRole) !== -1;
    };
    
    $scope.refreshStats = function() {
        $scope.loadStatistics();
        $rootScope.showAlert('info', 'Statistics refreshed');
    };
    
    // Initialize
    console.log('Dashboard initialized for user:', $scope.currentUser);
    $scope.loadStatistics();
}]);