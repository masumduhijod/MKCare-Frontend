/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/**
 * ============================================
 * APPOINTMENT LIST CONTROLLER - FIXED
 * ============================================
 */

app.controller('AppointmentListController',
        ['$scope', '$rootScope', '$location', 'AppointmentService', 'AuthService', 'PatientService', 'DoctorService', '$window',
            function ($scope, $rootScope, $location, AppointmentService, AuthService, PatientService, DoctorService, $window) {

                $scope.Math = $window.Math;
                $scope.appointments = [];
                $scope.filteredAppointments = [];
                $scope.loading = false;
                $scope.filterStatus = '';
                $scope.searchQuery = '';
                $scope.filterDate = null;

                $scope.currentPage = 1;
                $scope.pageSize = 10;
                $scope.Math = window.Math;

                $scope.getNumber = function(num) {
                    if(!num || num < 0) return [];
                    return new Array(num);   
                };

                // Watch search query to reset pagination
                $scope.$watch('searchQuery', function() {
                    $scope.currentPage = 1;
                });

                var currentUser = AuthService.getCurrentUser();

                /**
                 * Load all appointments
                 */
                $scope.loadAppointments = function () {
                    $scope.loading = true;

                    console.log('Loading appointments...');

                    AppointmentService.getToday()
                            .then(function (response) {
                                $scope.loading = false;

                                console.log('Appointments Response:', response.data);

                                if (response.data.success && response.data.data) {
                                    $scope.appointments = response.data.data;
                                    $scope.filteredAppointments = $scope.appointments;
                                    $scope.fillNames();
                                    console.log('✅ Loaded', $scope.appointments.length, 'appointments');
                                } else {
                                    $scope.appointments = [];
                                    $scope.filteredAppointments = [];
                                }
                            })
                            .catch(function (error) {
                                $scope.loading = false;
                                console.error('Error loading appointments:', error);
                                $rootScope.showAlert('danger', 'Error loading appointments');
                            });
                };

                /**
                 * Load appointments by specific date
                 */
                $scope.loadAppointmentsByDate = function () {
                    if (!$scope.filterDate) {
                        $scope.loadAppointments();
                        return;
                    }

                    $scope.loading = true;

                    // You can implement date range filtering here
                    // For now, filter from loaded appointments
                    $scope.filteredAppointments = $scope.appointments.filter(function (appt) {
                        return appt.appointmentDate === $scope.filterDate;
                    });

                    $scope.loading = false;
                };

                /**
                 * Filter appointments by status
                 */
                $scope.filterAppointments = function () {
                    if (!$scope.filterStatus) {
                        $scope.filteredAppointments = $scope.appointments;
                    } else {
                        $scope.filteredAppointments = $scope.appointments.filter(function (appt) {
                            return appt.status === $scope.filterStatus;
                        });
                    }
                };

                /**
                 * Clear all filters
                 */
                $scope.clearFilters = function () {
                    $scope.filterStatus = '';
                    $scope.searchQuery = '';
                    $scope.filterDate = null;
                    $scope.filteredAppointments = $scope.appointments;
                };

                /**
                 * Check-in appointment
                 */
                $scope.checkinAppointment = function (appt) {
                    if (confirm('Check-in patient: ' + appt.patientName + '?')) {
                        $rootScope.showLoading();

                        AppointmentService.checkin(appt.appointmentId)
                                .then(function (response) {
                                    $rootScope.hideLoading();

                                    if (response.data.success) {
                                        $rootScope.showAlert('success', 'Patient checked in');
                                        $scope.loadAppointments();
                                    } else {
                                        $rootScope.showAlert('danger', response.data.message);
                                    }
                                })
                                .catch(function (error) {
                                    $rootScope.hideLoading();
                                    $rootScope.showAlert('danger', 'Check-in failed');
                                });
                    }
                };

                /**
                 * Cancel appointment
                 */
                $scope.cancelAppointment = function (appt) {
                    var reason = prompt('Enter cancellation reason:');

                    if (reason && reason.trim() !== '') {
                        $rootScope.showLoading();

                        AppointmentService.cancel({
                            appointmentId: appt.appointmentId,
                            reason: reason,
                            cancelledBy: currentUser ? currentUser.username : 'User'
                        }).then(function (response) {
                            $rootScope.hideLoading();

                            if (response.data.success) {
                                $rootScope.showAlert('info', 'Appointment cancelled');
                                $scope.loadAppointments();
                            } else {
                                $rootScope.showAlert('danger', response.data.message);
                            }
                        }).catch(function (error) {
                            $rootScope.hideLoading();
                            $rootScope.showAlert('danger', 'Cancellation failed');
                        });
                    }
                };

                /**
                 * Format time helper
                 */
                $scope.formatTime = function (timeObj) {
                    if (!timeObj)
                        return 'N/A';

                    if (typeof timeObj === 'string') {
                        if (timeObj.indexOf('T') !== -1) {
                            var d = new Date(timeObj);
                            return d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                        }
                        return timeObj.substring(0, 5);
                    }

                    if (Array.isArray(timeObj)) {
                        var hIdx = timeObj.length > 3 ? 3 : 0;
                        var mIdx = timeObj.length > 3 ? 4 : 1;
                        if(timeObj[hIdx] !== undefined) {
                            var hour = ('0' + timeObj[hIdx]).slice(-2);
                            var minute = ('0' + (timeObj[mIdx] || 0)).slice(-2);
                            return hour + ':' + minute;
                        }
                    }

                    if (typeof timeObj === 'object' && timeObj.hour !== undefined) {
                        var hour = ('0' + timeObj.hour).slice(-2);
                        var minute = ('0' + (timeObj.minute || 0)).slice(-2);
                        return hour + ':' + minute;
                    }

                    return 'N/A';
                };

                /**
                 * View CVR Model Popup
                 */
                $scope.viewCVR = function (appt) {
                    $scope.selectedCvrAppt = appt;
                    // Using Bootstrap 5 Modal
                    var modalElement = document.getElementById('cvrModal');
                    if (modalElement) {
                        var myModal = new window.bootstrap.Modal(modalElement);
                        myModal.show();
                    }
                };

                // Initialize
                console.log('Appointment List Controller Initialized');
                $scope.loadAppointments();
                //display pateint name and doctor name on   appointmenet list
                $scope.fillNames = function () {
                    $scope.filteredAppointments.forEach(function (appt) {
                        // Fill patient name
                        if (!appt.patientName && appt.pinNumber) {
                            PatientService.getByPin(appt.pinNumber)
                                    .then(function (res) {
                                        appt.patientName = res.data.success && res.data.data ? res.data.data.fullName : 'Unknown';
                                    })
                                    .catch(function () {
                                        appt.patientName = 'Unknown';
                                    });
                        }

                        // Fill doctor name
                        if (!appt.doctorName && appt.doctorId) {
                            DoctorService.getById(appt.doctorId)
                                    .then(function (res) {
                                        if (res.data.success && res.data.data) {
                                            var d = res.data.data;
                                            appt.doctorName = 'Dr. ' + d.firstName + ' ' + d.lastName;
                                        } else {
                                            appt.doctorName = 'Unknown';
                                        }
                                    })
                                    .catch(function () {
                                        appt.doctorName = 'Unknown';
                                    });
                        }
                    });
                };
            }]);