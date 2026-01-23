/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

//// ============ APPOINTMENT LIST CONTROLLER ============
//app.controller('AppointmentListController', ['$scope', '$rootScope', '$location', 'AppointmentService',
//    function($scope, $rootScope, $location, AppointmentService) {
//    
//    $scope.appointments = [];
//    $scope.loading = false;
//    $scope.filterStatus = '';
//    
//    $scope.loadAppointments = function() {
//        $scope.loading = true;
//        AppointmentService.getToday()
//            .then(function(response) {
//                $scope.loading = false;
//                if (response.data.success) {
//                    $scope.appointments = response.data.data;
//                }
//            })
//            .catch(function(error) {
//                $scope.loading = false;
//                $rootScope.showAlert('danger', 'Error loading appointments');
//            });
//    };
//    
//    $scope.checkinAppointment = function(appointmentId) {
//        AppointmentService.checkin(appointmentId)
//            .then(function(response) {
//                if (response.data.success) {
//                    $rootScope.showAlert('success', 'Patient checked in');
//                    $scope.loadAppointments();
//                }
//            });
//    };
//    
//    $scope.cancelAppointment = function(appointmentId) {
//        var reason = prompt('Enter cancellation reason:');
//        if (reason) {
//            AppointmentService.cancel({
//                appointmentId: appointmentId,
//                reason: reason,
//                cancelledBy: 'User'
//            }).then(function(response) {
//                $rootScope.showAlert('info', 'Appointment cancelled');
//                $scope.loadAppointments();
//            });
//        }
//    };
//    
//    $scope.loadAppointments();
//}]);



/**
 * ============================================
 * APPOINTMENT LIST CONTROLLER - FIXED
 * ============================================
 */

app.controller('AppointmentListController', 
    ['$scope', '$rootScope', '$location', 'AppointmentService', 'AuthService',
    function($scope, $rootScope, $location, AppointmentService, AuthService) {
    
    $scope.appointments = [];
    $scope.filteredAppointments = [];
    $scope.loading = false;
    $scope.filterStatus = '';
    $scope.searchQuery = '';
    $scope.filterDate = null;
    
    var currentUser = AuthService.getCurrentUser();
    
    /**
     * Load all appointments
     */
    $scope.loadAppointments = function() {
        $scope.loading = true;
        
        console.log('Loading appointments...');
        
        AppointmentService.getToday()
            .then(function(response) {
                $scope.loading = false;
                
                console.log('Appointments Response:', response.data);
                
                if (response.data.success && response.data.data) {
                    $scope.appointments = response.data.data;
                    $scope.filteredAppointments = $scope.appointments;
                    
                    console.log('✅ Loaded', $scope.appointments.length, 'appointments');
                } else {
                    $scope.appointments = [];
                    $scope.filteredAppointments = [];
                }
            })
            .catch(function(error) {
                $scope.loading = false;
                console.error('Error loading appointments:', error);
                $rootScope.showAlert('danger', 'Error loading appointments');
            });
    };
    
    /**
     * Load appointments by specific date
     */
    $scope.loadAppointmentsByDate = function() {
        if (!$scope.filterDate) {
            $scope.loadAppointments();
            return;
        }
        
        $scope.loading = true;
        
        // You can implement date range filtering here
        // For now, filter from loaded appointments
        $scope.filteredAppointments = $scope.appointments.filter(function(appt) {
            return appt.appointmentDate === $scope.filterDate;
        });
        
        $scope.loading = false;
    };
    
    /**
     * Filter appointments by status
     */
    $scope.filterAppointments = function() {
        if (!$scope.filterStatus) {
            $scope.filteredAppointments = $scope.appointments;
        } else {
            $scope.filteredAppointments = $scope.appointments.filter(function(appt) {
                return appt.status === $scope.filterStatus;
            });
        }
    };
    
    /**
     * Clear all filters
     */
    $scope.clearFilters = function() {
        $scope.filterStatus = '';
        $scope.searchQuery = '';
        $scope.filterDate = null;
        $scope.filteredAppointments = $scope.appointments;
    };
    
    /**
     * Check-in appointment
     */
    $scope.checkinAppointment = function(appt) {
        if (confirm('Check-in patient: ' + appt.patientName + '?')) {
            $rootScope.showLoading();
            
            AppointmentService.checkin(appt.appointmentId)
                .then(function(response) {
                    $rootScope.hideLoading();
                    
                    if (response.data.success) {
                        $rootScope.showAlert('success', 'Patient checked in');
                        $scope.loadAppointments();
                    } else {
                        $rootScope.showAlert('danger', response.data.message);
                    }
                })
                .catch(function(error) {
                    $rootScope.hideLoading();
                    $rootScope.showAlert('danger', 'Check-in failed');
                });
        }
    };
    
    /**
     * Cancel appointment
     */
    $scope.cancelAppointment = function(appt) {
        var reason = prompt('Enter cancellation reason:');
        
        if (reason && reason.trim() !== '') {
            $rootScope.showLoading();
            
            AppointmentService.cancel({
                appointmentId: appt.appointmentId,
                reason: reason,
                cancelledBy: currentUser ? currentUser.username : 'User'
            }).then(function(response) {
                $rootScope.hideLoading();
                
                if (response.data.success) {
                    $rootScope.showAlert('info', 'Appointment cancelled');
                    $scope.loadAppointments();
                } else {
                    $rootScope.showAlert('danger', response.data.message);
                }
            }).catch(function(error) {
                $rootScope.hideLoading();
                $rootScope.showAlert('danger', 'Cancellation failed');
            });
        }
    };
    
    /**
     * Format time helper
     */
    $scope.formatTime = function(timeObj) {
        if (!timeObj) return 'N/A';
        
        if (typeof timeObj === 'string') {
            return timeObj.substring(0, 5);
        }
        
        if (typeof timeObj === 'object' && timeObj.hour !== undefined) {
            var hour = ('0' + timeObj.hour).slice(-2);
            var minute = ('0' + (timeObj.minute || 0)).slice(-2);
            return hour + ':' + minute;
        }
        
        return 'N/A';
    };
    
    // Initialize
    console.log('Appointment List Controller Initialized');
    $scope.loadAppointments();
}]);