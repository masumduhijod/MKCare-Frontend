/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


//// ============ DOCTOR SCHEDULE CONTROLLER ============
//app.controller('DoctorScheduleController', ['$scope', '$rootScope', '$routeParams', 'DoctorService',
//    function($scope, $rootScope, $routeParams, DoctorService) {
//    
//    var doctorId = $routeParams.doctorId;
//    
//    $scope.doctor = null;
//    $scope.schedules = [];
//    $scope.loading = false;
//    
//    $scope.newSchedule = {
//        doctorId: doctorId,
//        dayOfWeek: '',
//        startTime: { hour: 9, minute: 0, second: 0, nano: 0 },
//        endTime: { hour: 17, minute: 0, second: 0, nano: 0 },
//        slotDurationMinutes: 15,
//        maxPatientsPerSlot: 1,
//        isActive: true,
//        breakStartTime: { hour: 13, minute: 0, second: 0, nano: 0 },
//        breakEndTime: { hour: 14, minute: 0, second: 0, nano: 0 }
//    };
//    
//    $scope.daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
//    
//    $scope.loadDoctor = function() {
//        DoctorService.getById(doctorId)
//            .then(function(response) {
//                if (response.data.success) {
//                    $scope.doctor = response.data.data;
//                    $scope.loadSchedules();
//                }
//            });
//    };
//    
//    $scope.loadSchedules = function() {
//        DoctorService.getAllSchedules(doctorId)
//            .then(function(response) {
//                if (response.data.success) {
//                    $scope.schedules = response.data.data;
//                }
//            });
//    };
//    
//    $scope.addSchedule = function() {
//        DoctorService.createSchedule(doctorId, $scope.newSchedule)
//            .then(function(response) {
//                if (response.data.success) {
//                    $rootScope.showAlert('success', 'Schedule added');
//                    $scope.loadSchedules();
//                }
//            });
//    };
//    
//    $scope.deleteSchedule = function(scheduleId) {
//        if (confirm('Delete this schedule?')) {
//            DoctorService.deleteSchedule(scheduleId)
//                .then(function(response) {
//                    $rootScope.showAlert('info', 'Schedule deleted');
//                    $scope.loadSchedules();
//                });
//        }
//    };
//    
//    $scope.loadDoctor();
//}]);

/**
 * Doctor Schedule Controller
 * Create and manage doctor schedules for slot generation
 */

//app.controller('DoctorScheduleController', ['$scope', '$rootScope', '$location', '$routeParams', 'DoctorService',
//    function($scope, $rootScope, $location, $routeParams, DoctorService) {
//    
//    var doctorId = $routeParams.doctorId;
//    
//    $scope.doctor = null;
//    $scope.schedules = [];
//    $scope.loading = false;
//    
//    // Days of week
//    $scope.daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
//    
//    // New Schedule
//    $scope.newSchedule = {
//        doctorId: doctorId,
//        dayOfWeek: '',
//        startTime: '',
//        endTime: '',
//        slotDurationMinutes: 15,
//        maxPatientsPerSlot: 1,
//        breakStartTime: '',
//        breakEndTime: '',
//        isActive: true
//    };
//    
//    /**
//     * Load Doctor Details
//     */
//    $scope.loadDoctor = function() {
//        DoctorService.getById(doctorId)
//            .then(function(response) {
//                if (response.data.success) {
//                    $scope.doctor = response.data.data;
//                    $scope.loadSchedules();
//                }
//            })
//            .catch(function(error) {
//                $rootScope.showAlert('danger', 'Error loading doctor details');
//                $location.path('/doctor/list');
//            });
//    };
//    
//    /**
//     * Load Doctor Schedules
//     */
//    $scope.loadSchedules = function() {
//        $scope.loading = true;
//        
//        DoctorService.getAllSchedules(doctorId)
//            .then(function(response) {
//                $scope.loading = false;
//                
//                if (response.data.success) {
//                    $scope.schedules = response.data.data;
//                } else {
//                    $scope.schedules = [];
//                }
//            })
//            .catch(function(error) {
//                $scope.loading = false;
//                $scope.schedules = [];
//            });
//    };
//    
//    /**
//     * Create Schedule
//     */
//    $scope.createSchedule = function() {
//        // Validation
//        if (!$scope.newSchedule.dayOfWeek) {
//            $rootScope.showAlert('warning', 'Please select day of week');
//            return;
//        }
//        
//        if (!$scope.newSchedule.startTime || !$scope.newSchedule.endTime) {
//            $rootScope.showAlert('warning', 'Please enter start and end time');
//            return;
//        }
//        
//        // Convert time format HH:mm to LocalTime object
//        var startParts = $scope.newSchedule.startTime.split(':');
//        var endParts = $scope.newSchedule.endTime.split(':');
//        
//        var scheduleData = {
//            doctorId: doctorId,
//            dayOfWeek: $scope.newSchedule.dayOfWeek,
//            startTime: {
//                hour: parseInt(startParts[0]),
//                minute: parseInt(startParts[1]),
//                second: 0,
//                nano: 0
//            },
//            endTime: {
//                hour: parseInt(endParts[0]),
//                minute: parseInt(endParts[1]),
//                second: 0,
//                nano: 0
//            },
//            slotDurationMinutes: parseInt($scope.newSchedule.slotDurationMinutes) || 15,
//            maxPatientsPerSlot: parseInt($scope.newSchedule.maxPatientsPerSlot) || 1,
//            isActive: true
//        };
//        
//        // Add break time if provided
//        if ($scope.newSchedule.breakStartTime && $scope.newSchedule.breakEndTime) {
//            var breakStartParts = $scope.newSchedule.breakStartTime.split(':');
//            var breakEndParts = $scope.newSchedule.breakEndTime.split(':');
//            
//            scheduleData.breakStartTime = {
//                hour: parseInt(breakStartParts[0]),
//                minute: parseInt(breakStartParts[1]),
//                second: 0,
//                nano: 0
//            };
//            
//            scheduleData.breakEndTime = {
//                hour: parseInt(breakEndParts[0]),
//                minute: parseInt(breakEndParts[1]),
//                second: 0,
//                nano: 0
//            };
//        }
//        
//        $scope.loading = true;
//        
//        DoctorService.createSchedule(doctorId, scheduleData)
//            .then(function(response) {
//                $scope.loading = false;
//                
//                if (response.data.success) {
//                    $rootScope.showAlert('success', 'Schedule created successfully!');
//                    $scope.loadSchedules();
//                    $scope.resetForm();
//                } else {
//                    $rootScope.showAlert('danger', response.data.message || 'Failed to create schedule');
//                }
//            })
//            .catch(function(error) {
//                $scope.loading = false;
//                var errorMsg = error.data && error.data.message ? error.data.message : 'Error creating schedule';
//                $rootScope.showAlert('danger', errorMsg);
//            });
//    };
//    
//    /**
//     * Toggle Schedule Active Status
//     */
//    $scope.toggleSchedule = function(schedule) {
//        var newStatus = !schedule.isActive;
//        
//        DoctorService.toggleSchedule(schedule.scheduleId, newStatus)
//            .then(function(response) {
//                if (response.data.success) {
//                    schedule.isActive = newStatus;
//                    $rootScope.showAlert('success', 'Schedule status updated');
//                }
//            })
//            .catch(function(error) {
//                $rootScope.showAlert('danger', 'Error updating schedule status');
//            });
//    };
//    
//    /**
//     * Delete Schedule
//     */
//    $scope.deleteSchedule = function(scheduleId) {
//        if (!confirm('Are you sure you want to delete this schedule?')) {
//            return;
//        }
//        
//        DoctorService.deleteSchedule(scheduleId)
//            .then(function(response) {
//                if (response.data.success) {
//                    $rootScope.showAlert('success', 'Schedule deleted');
//                    $scope.loadSchedules();
//                }
//            })
//            .catch(function(error) {
//                $rootScope.showAlert('danger', 'Error deleting schedule');
//            });
//    };
//    
//    /**
//     * Format Time for Display
//     */
//    $scope.formatTime = function(timeObj) {
//        if (!timeObj) return '';
//        var hour = ('0' + timeObj.hour).slice(-2);
//        var minute = ('0' + timeObj.minute).slice(-2);
//        return hour + ':' + minute;
//    };
//    
//    /**
//     * Reset Form
//     */
//    $scope.resetForm = function() {
//        $scope.newSchedule = {
//            doctorId: doctorId,
//            dayOfWeek: '',
//            startTime: '',
//            endTime: '',
//            slotDurationMinutes: 15,
//            maxPatientsPerSlot: 1,
//            breakStartTime: '',
//            breakEndTime: '',
//            isActive: true
//        };
//    };
//    
//    /**
//     * Create Default Weekly Schedule
//     */
//    $scope.createWeeklySchedule = function() {
//        if (!confirm('Create default schedule for Monday to Friday (9 AM - 5 PM with 1-hour lunch break)?')) {
//            return;
//        }
//        
//        var weekDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
//        var created = 0;
//        
//        weekDays.forEach(function(day) {
//            var scheduleData = {
//                doctorId: doctorId,
//                dayOfWeek: day,
//                startTime: { hour: 9, minute: 0, second: 0, nano: 0 },
//                endTime: { hour: 17, minute: 0, second: 0, nano: 0 },
//                breakStartTime: { hour: 13, minute: 0, second: 0, nano: 0 },
//                breakEndTime: { hour: 14, minute: 0, second: 0, nano: 0 },
//                slotDurationMinutes: 15,
//                maxPatientsPerSlot: 1,
//                isActive: true
//            };
//            
//            DoctorService.createSchedule(doctorId, scheduleData)
//                .then(function(response) {
//                    if (response.data.success) {
//                        created++;
//                        if (created === weekDays.length) {
//                            $rootScope.showAlert('success', 'Weekly schedule created successfully!');
//                            $scope.loadSchedules();
//                        }
//                    }
//                });
//        });
//    };
//    
//    // Initialize
//    $scope.loadDoctor();
//}]);

//updated code*****

//app.controller('DoctorScheduleController', [
//    '$scope', '$rootScope', '$location', '$routeParams', 'DoctorService',
//    function ($scope, $rootScope, $location, $routeParams, DoctorService) {
//
//        var doctorId = $routeParams.doctorId;
//
//        $scope.doctor = null;
//        $scope.schedules = [];
//        $scope.loading = false;
//
//        $scope.daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
//
//        // New schedule form
//        $scope.newSchedule = {
//            doctorId: doctorId,
//            dayOfWeek: '',
//            startTime: '',
//            endTime: '',
//            slotDurationMinutes: 15,
//            maxPatientsPerSlot: 1,
//            breakStartTime: '',
//            breakEndTime: '',
//            isActive: true
//        };
//
//        /* -----------------------------------------------------------
//           SAFE TIME TO STRING ("HH:mm")
//           ----------------------------------------------------------- */
//        function toTimeString(time) {
//            if (!time) return "";
//
//            if (typeof time === "string") return time;
//
//            if (time instanceof Date) {
//                return time.toISOString().substring(11, 16);
//            }
//
//            return "";
//        }
//
//        /* -----------------------------------------------------------
//           Load doctor
//           ----------------------------------------------------------- */
//        $scope.loadDoctor = function () {
//            DoctorService.getById(doctorId)
//                .then(function (response) {
//                    if (response.data.success) {
//                        $scope.doctor = response.data.data;
//                        $scope.loadSchedules();
//                    }
//                })
//                .catch(function () {
//                    $rootScope.showAlert('danger', 'Error loading doctor details');
//                    $location.path('/doctor/list');
//                });
//        };
//
//        /* -----------------------------------------------------------
//           Load schedules
//           ----------------------------------------------------------- */
//        $scope.loadSchedules = function () {
//            $scope.loading = true;
//
//            DoctorService.getAllSchedules(doctorId)
//                .then(function (response) {
//                    $scope.loading = false;
//                    $scope.schedules = response.data.success ? response.data.data : [];
//                })
//                .catch(function () {
//                    $scope.loading = false;
//                    $scope.schedules = [];
//                });
//        };
//
//        /* -----------------------------------------------------------
//           Create schedule (FINAL FIX)
//           ----------------------------------------------------------- */
//        $scope.createSchedule = function () {
//
//            if (!$scope.newSchedule.dayOfWeek) {
//                $rootScope.showAlert("warning", "Please select day of week");
//                return;
//            }
//
//            if (!$scope.newSchedule.startTime || !$scope.newSchedule.endTime) {
//                $rootScope.showAlert("warning", "Please enter start and end time");
//                return;
//            }
//
//            var startStr = toTimeString($scope.newSchedule.startTime);
//            var endStr = toTimeString($scope.newSchedule.endTime);
//            var breakStartStr = toTimeString($scope.newSchedule.breakStartTime);
//            var breakEndStr = toTimeString($scope.newSchedule.breakEndTime);
//
//            // Backend expects "HH:mm" — NOT object
//            var scheduleData = {
//                doctorId: doctorId,
//                dayOfWeek: $scope.newSchedule.dayOfWeek,
//                startTime: startStr,
//                endTime: endStr,
//                slotDurationMinutes: parseInt($scope.newSchedule.slotDurationMinutes) || 15,
//                maxPatientsPerSlot: parseInt($scope.newSchedule.maxPatientsPerSlot) || 1,
//                isActive: true
//            };
//
//            if (breakStartStr && breakEndStr) {
//                scheduleData.breakStartTime = breakStartStr;
//                scheduleData.breakEndTime = breakEndStr;
//            }
//
//            $scope.loading = true;
//
//            DoctorService.createSchedule(doctorId, scheduleData)
//                .then(function (response) {
//                    $scope.loading = false;
//
//                    if (response.data.success) {
//                        $rootScope.showAlert("success", "Schedule created successfully!");
//                        $scope.loadSchedules();
//                        $scope.resetForm();
//                    } else {
//                        $rootScope.showAlert("danger", response.data.message || "Failed to create schedule");
//                    }
//                })
//                .catch(function () {
//                    $scope.loading = false;
//                    $rootScope.showAlert("danger", "Error creating schedule");
//                });
//        };
//
//        /* -----------------------------------------------------------
//           Toggle schedule
//           ----------------------------------------------------------- */
//        $scope.toggleSchedule = function (schedule) {
//            var newStatus = !schedule.isActive;
//
//            DoctorService.toggleSchedule(schedule.scheduleId, newStatus)
//                .then(function (response) {
//                    if (response.data.success) {
//                        schedule.isActive = newStatus;
//                        $rootScope.showAlert('success', 'Schedule status updated');
//                    }
//                })
//                .catch(function () {
//                    $rootScope.showAlert("danger", "Error updating schedule");
//                });
//        };
//
//        /* -----------------------------------------------------------
//           Delete schedule
//           ----------------------------------------------------------- */
//        $scope.deleteSchedule = function (scheduleId) {
//
//            if (!confirm("Are you sure you want to delete this schedule?")) return;
//
//            DoctorService.deleteSchedule(scheduleId)
//                .then(function (response) {
//                    if (response.data.success) {
//                        $rootScope.showAlert("success", "Schedule deleted");
//                        $scope.loadSchedules();
//                    }
//                })
//                .catch(function () {
//                    $rootScope.showAlert("danger", "Error deleting schedule");
//                });
//        };
//
//        /* -----------------------------------------------------------
//           Format time for display ("HH:mm")
//           ----------------------------------------------------------- */
//        $scope.formatTime = function (timeString) {
//            return timeString || "";
//        };
//
//        /* -----------------------------------------------------------
//           Reset form
//           ----------------------------------------------------------- */
//        $scope.resetForm = function () {
//            $scope.newSchedule = {
//                doctorId: doctorId,
//                dayOfWeek: '',
//                startTime: '',
//                endTime: '',
//                slotDurationMinutes: 15,
//                maxPatientsPerSlot: 1,
//                breakStartTime: '',
//                breakEndTime: '',
//                isActive: true
//            };
//        };
//
//        /* -----------------------------------------------------------
//           Create default weekly schedule
//           ----------------------------------------------------------- */
//        $scope.createWeeklySchedule = function () {
//
//            if (!confirm("Create default Mon–Fri (9 AM - 5 PM) schedule?")) return;
//
//            var days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
//            var done = 0;
//
//            days.forEach(function (day) {
//
//                var scheduleData = {
//                    doctorId: doctorId,
//                    dayOfWeek: day,
//                    startTime: "09:00",
//                    endTime: "17:00",
//                    breakStartTime: "13:00",
//                    breakEndTime: "14:00",
//                    slotDurationMinutes: 15,
//                    maxPatientsPerSlot: 1,
//                    isActive: true
//                };
//
//                DoctorService.createSchedule(doctorId, scheduleData)
//                    .then(function (response) {
//                        if (response.data.success) {
//                            done++;
//                            if (done === days.length) {
//                                $rootScope.showAlert("success", "Weekly schedule created!");
//                                $scope.loadSchedules();
//                            }
//                        }
//                    });
//            });
//        };
//
//        /* Initialize controller */
//        $scope.loadDoctor();
//    }
//]);


///* 
// * Doctor Schedule Controller - UPDATED WITH DATE PREVIEW
// */
//
//app.controller('DoctorScheduleController', [
//    '$scope', '$rootScope', '$location', '$routeParams', 'DoctorService',
//    function ($scope, $rootScope, $location, $routeParams, DoctorService) {
//
//        var doctorId = $routeParams.doctorId;
//
//        $scope.doctor = null;
//        $scope.schedules = [];
//        $scope.loading = false;
//        $scope.editMode = false;
//        $scope.editingSchedule = null;
//        $scope.selectedScheduleForPreview = null;
//        $scope.upcomingDatesForSchedule = [];
//
//        $scope.daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
//
//        // New schedule form
//        $scope.newSchedule = {
//            doctorId: doctorId,
//            dayOfWeek: '',
//            startTime: '',
//            endTime: '',
//            slotDurationMinutes: 15,
//            maxPatientsPerSlot: 1,
//            breakStartTime: '',
//            breakEndTime: '',
//            isActive: true
//        };
//
//        /* -----------------------------------------------------------
//           TIME CONVERSION UTILITY
//           ----------------------------------------------------------- */
//        function toTimeString(time) {
//            if (!time) return "";
//
//            if (typeof time === "string") {
//                if (time.match(/^\d{2}:\d{2}$/)) {
//                    return time;
//                }
//                if (time.match(/^\d{2}:\d{2}:\d{2}$/)) {
//                    return time.substring(0, 5);
//                }
//                return time;
//            }
//
//            if (time instanceof Date) {
//                var hours = ('0' + time.getHours()).slice(-2);
//                var minutes = ('0' + time.getMinutes()).slice(-2);
//                return hours + ':' + minutes;
//            }
//
//            return "";
//        }
//
//        /* -----------------------------------------------------------
//           TIME VALIDATION
//           ----------------------------------------------------------- */
//        function validateTimes(startTime, endTime, breakStart, breakEnd) {
//            function timeToMinutes(timeStr) {
//                var parts = timeStr.split(':');
//                return parseInt(parts[0]) * 60 + parseInt(parts[1]);
//            }
//
//            var start = timeToMinutes(startTime);
//            var end = timeToMinutes(endTime);
//
//            if (end <= start) {
//                return "End time must be after start time";
//            }
//
//            if (breakStart && breakEnd) {
//                var bStart = timeToMinutes(breakStart);
//                var bEnd = timeToMinutes(breakEnd);
//
//                if (bStart >= bEnd) {
//                    return "Break end time must be after break start time";
//                }
//
//                if (bStart < start || bEnd > end) {
//                    return "Break time must be within schedule time";
//                }
//            }
//
//            return null;
//        }
//
//        /* -----------------------------------------------------------
//           CALCULATE SLOT COUNT
//           ----------------------------------------------------------- */
//        $scope.calculateSlotCount = function(schedule) {
//            if (!schedule || !schedule.startTime || !schedule.endTime) return 0;
//            
//            var startParts = schedule.startTime.split(':');
//            var endParts = schedule.endTime.split(':');
//            
//            var startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
//            var endMinutes = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
//            
//            var totalMinutes = endMinutes - startMinutes;
//            
//            // Subtract break time
//            if (schedule.breakStartTime && schedule.breakEndTime) {
//                var breakStartParts = schedule.breakStartTime.split(':');
//                var breakEndParts = schedule.breakEndTime.split(':');
//                
//                var breakStartMinutes = parseInt(breakStartParts[0]) * 60 + parseInt(breakStartParts[1]);
//                var breakEndMinutes = parseInt(breakEndParts[0]) * 60 + parseInt(breakEndParts[1]);
//                
//                totalMinutes -= (breakEndMinutes - breakStartMinutes);
//            }
//            
//            return Math.floor(totalMinutes / schedule.slotDurationMinutes);
//        };
//
//        /* -----------------------------------------------------------
//           VIEW SCHEDULE DATES - NEW FUNCTION
//           ----------------------------------------------------------- */
//        $scope.viewScheduleDates = function(schedule) {
//            $scope.selectedScheduleForPreview = schedule;
//            $scope.upcomingDatesForSchedule = generateUpcomingDates(schedule.dayOfWeek, 15);
//            
//            // Open Bootstrap modal
//            var modalElement = document.getElementById('datePreviewModal');
//            if (modalElement) {
//                var modal = new bootstrap.Modal(modalElement);
//                modal.show();
//            }
//        };
//
//        /* -----------------------------------------------------------
//           GENERATE UPCOMING DATES FOR A DAY
//           ----------------------------------------------------------- */
//        function generateUpcomingDates(dayOfWeek, count) {
//            var daysMap = {
//                'SUNDAY': 0,
//                'MONDAY': 1,
//                'TUESDAY': 2,
//                'WEDNESDAY': 3,
//                'THURSDAY': 4,
//                'FRIDAY': 5,
//                'SATURDAY': 6
//            };
//            
//            var targetDay = daysMap[dayOfWeek];
//            var dates = [];
//            var today = new Date();
//            
//            for (var i = 0; i < 90 && dates.length < count; i++) {
//                var checkDate = new Date(today);
//                checkDate.setDate(today.getDate() + i);
//                
//                if (checkDate.getDay() === targetDay) {
//                    var dateStr = checkDate.toLocaleDateString('en-IN', {
//                        day: '2-digit',
//                        month: 'short',
//                        year: 'numeric'
//                    });
//                    
//                    dates.push({
//                        date: checkDate,
//                        display: dateStr
//                    });
//                }
//            }
//            
//            return dates;
//        }
//
//        /* -----------------------------------------------------------
//           LOAD DOCTOR
//           ----------------------------------------------------------- */
//        $scope.loadDoctor = function () {
//            DoctorService.getById(doctorId)
//                .then(function (response) {
//                    if (response.data.success) {
//                        $scope.doctor = response.data.data;
//                        $scope.loadSchedules();
//                    } else {
//                        $rootScope.showAlert('danger', 'Doctor not found');
//                        $location.path('/doctor/list');
//                    }
//                })
//                .catch(function (error) {
//                    console.error('Error loading doctor:', error);
//                    $rootScope.showAlert('danger', 'Error loading doctor details');
//                    $location.path('/doctor/list');
//                });
//        };
//
//        /* -----------------------------------------------------------
//           LOAD SCHEDULES
//           ----------------------------------------------------------- */
//        $scope.loadSchedules = function () {
//            $scope.loading = true;
//
//            DoctorService.getAllSchedules(doctorId)
//                .then(function (response) {
//                    $scope.loading = false;
//                    if (response.data.success) {
//                        $scope.schedules = response.data.data || [];
//                    } else {
//                        $scope.schedules = [];
//                    }
//                })
//                .catch(function (error) {
//                    $scope.loading = false;
//                    $scope.schedules = [];
//                    console.error('Error loading schedules:', error);
//                });
//        };
//
//        /* -----------------------------------------------------------
//           CREATE SCHEDULE
//           ----------------------------------------------------------- */
//        $scope.createSchedule = function () {
//
//            if (!$scope.newSchedule.dayOfWeek) {
//                $rootScope.showAlert("warning", "Please select day of week");
//                return;
//            }
//
//            if (!$scope.newSchedule.startTime || !$scope.newSchedule.endTime) {
//                $rootScope.showAlert("warning", "Please enter start and end time");
//                return;
//            }
//
//            var startStr = toTimeString($scope.newSchedule.startTime);
//            var endStr = toTimeString($scope.newSchedule.endTime);
//            var breakStartStr = toTimeString($scope.newSchedule.breakStartTime);
//            var breakEndStr = toTimeString($scope.newSchedule.breakEndTime);
//
//            // Validate time format
//            if (!startStr.match(/^\d{2}:\d{2}$/) || !endStr.match(/^\d{2}:\d{2}$/)) {
//                $rootScope.showAlert("warning", "Invalid time format");
//                return;
//            }
//
//            // Validate time logic
//            var validationError = validateTimes(startStr, endStr, breakStartStr, breakEndStr);
//            if (validationError) {
//                $rootScope.showAlert("warning", validationError);
//                return;
//            }
//
//            // Check if schedule already exists for this day
//            var existingSchedule = $scope.schedules.find(function(s) {
//                return s.dayOfWeek === $scope.newSchedule.dayOfWeek && s.isActive;
//            });
//
//            if (existingSchedule) {
//                if (!confirm('A schedule already exists for ' + $scope.newSchedule.dayOfWeek + '. Do you want to create another one?')) {
//                    return;
//                }
//            }
//
//            var scheduleData = {
//                doctorId: doctorId,
//                dayOfWeek: $scope.newSchedule.dayOfWeek,
//                startTime: startStr,
//                endTime: endStr,
//                slotDurationMinutes: parseInt($scope.newSchedule.slotDurationMinutes) || 15,
//                maxPatientsPerSlot: parseInt($scope.newSchedule.maxPatientsPerSlot) || 1,
//                isActive: true
//            };
//
//            if (breakStartStr && breakEndStr && 
//                breakStartStr.match(/^\d{2}:\d{2}$/) && 
//                breakEndStr.match(/^\d{2}:\d{2}$/)) {
//                scheduleData.breakStartTime = breakStartStr;
//                scheduleData.breakEndTime = breakEndStr;
//            }
//
//            console.log('Creating schedule:', scheduleData);
//
//            $scope.loading = true;
//
//            DoctorService.createSchedule(doctorId, scheduleData)
//                .then(function (response) {
//                    $scope.loading = false;
//
//                    if (response.data.success) {
//                        $rootScope.showAlert("success", "Schedule created successfully!");
//                        $scope.loadSchedules();
//                        $scope.resetForm();
//                    } else {
//                        $rootScope.showAlert("danger", response.data.message || "Failed to create schedule");
//                    }
//                })
//                .catch(function (error) {
//                    $scope.loading = false;
//                    console.error('Error creating schedule:', error);
//                    var errorMsg = error.data && error.data.message ? error.data.message : "Error creating schedule";
//                    $rootScope.showAlert("danger", errorMsg);
//                });
//        };
//
//        /* -----------------------------------------------------------
//           EDIT SCHEDULE
//           ----------------------------------------------------------- */
//        $scope.editSchedule = function (schedule) {
//            $scope.editMode = true;
//            $scope.editingSchedule = schedule;
//
//            $scope.newSchedule = {
//                doctorId: doctorId,
//                dayOfWeek: schedule.dayOfWeek,
//                startTime: $scope.formatTime(schedule.startTime),
//                endTime: $scope.formatTime(schedule.endTime),
//                slotDurationMinutes: schedule.slotDurationMinutes,
//                maxPatientsPerSlot: schedule.maxPatientsPerSlot,
//                breakStartTime: schedule.breakStartTime ? $scope.formatTime(schedule.breakStartTime) : '',
//                breakEndTime: schedule.breakEndTime ? $scope.formatTime(schedule.breakEndTime) : '',
//                isActive: schedule.isActive
//            };
//
//            window.scrollTo({ top: 0, behavior: 'smooth' });
//            $rootScope.showAlert('info', 'Editing schedule for ' + schedule.dayOfWeek);
//        };
//
//        /* -----------------------------------------------------------
//           UPDATE SCHEDULE
//           ----------------------------------------------------------- */
//        $scope.updateSchedule = function () {
//            if (!$scope.editingSchedule) return;
//
//            if (!$scope.newSchedule.startTime || !$scope.newSchedule.endTime) {
//                $rootScope.showAlert("warning", "Please enter start and end time");
//                return;
//            }
//
//            var startStr = toTimeString($scope.newSchedule.startTime);
//            var endStr = toTimeString($scope.newSchedule.endTime);
//            var breakStartStr = toTimeString($scope.newSchedule.breakStartTime);
//            var breakEndStr = toTimeString($scope.newSchedule.breakEndTime);
//
//            // Validate
//            var validationError = validateTimes(startStr, endStr, breakStartStr, breakEndStr);
//            if (validationError) {
//                $rootScope.showAlert("warning", validationError);
//                return;
//            }
//
//            var scheduleData = {
//                doctorId: doctorId,
//                dayOfWeek: $scope.newSchedule.dayOfWeek,
//                startTime: startStr,
//                endTime: endStr,
//                slotDurationMinutes: parseInt($scope.newSchedule.slotDurationMinutes) || 15,
//                maxPatientsPerSlot: parseInt($scope.newSchedule.maxPatientsPerSlot) || 1,
//                isActive: $scope.newSchedule.isActive
//            };
//
//            if (breakStartStr && breakEndStr) {
//                scheduleData.breakStartTime = breakStartStr;
//                scheduleData.breakEndTime = breakEndStr;
//            }
//
//            console.log('Updating schedule:', $scope.editingSchedule.scheduleId, scheduleData);
//
//            $scope.loading = true;
//
//            DoctorService.updateSchedule($scope.editingSchedule.scheduleId, scheduleData)
//                .then(function (response) {
//                    $scope.loading = false;
//
//                    if (response.data.success) {
//                        $rootScope.showAlert("success", "Schedule updated successfully!");
//                        $scope.loadSchedules();
//                        $scope.cancelEdit();
//                    } else {
//                        $rootScope.showAlert("danger", response.data.message || "Failed to update schedule");
//                    }
//                })
//                .catch(function (error) {
//                    $scope.loading = false;
//                    console.error('Error updating schedule:', error);
//                    var errorMsg = error.data && error.data.message ? error.data.message : "Error updating schedule";
//                    $rootScope.showAlert("danger", errorMsg);
//                });
//        };
//
//        /* -----------------------------------------------------------
//           CANCEL EDIT MODE
//           ----------------------------------------------------------- */
//        $scope.cancelEdit = function () {
//            $scope.editMode = false;
//            $scope.editingSchedule = null;
//            $scope.resetForm();
//        };
//
//        /* -----------------------------------------------------------
//           TOGGLE SCHEDULE STATUS
//           ----------------------------------------------------------- */
//        $scope.toggleSchedule = function (schedule) {
//            var newStatus = !schedule.isActive;
//            var action = newStatus ? 'activate' : 'deactivate';
//
//            if (!confirm('Are you sure you want to ' + action + ' this schedule?')) {
//                return;
//            }
//
//            DoctorService.toggleSchedule(schedule.scheduleId, newStatus)
//                .then(function (response) {
//                    if (response.data.success) {
//                        schedule.isActive = newStatus;
//                        $rootScope.showAlert('success', 'Schedule ' + (newStatus ? 'activated' : 'deactivated'));
//                    } else {
//                        $rootScope.showAlert('danger', response.data.message || 'Failed to update status');
//                    }
//                })
//                .catch(function (error) {
//                    console.error('Error toggling schedule:', error);
//                    $rootScope.showAlert("danger", "Error updating schedule status");
//                });
//        };
//
//        /* -----------------------------------------------------------
//           DELETE SCHEDULE
//           ----------------------------------------------------------- */
//        $scope.deleteSchedule = function (scheduleId, dayOfWeek) {
//
//            if (!confirm("Are you sure you want to delete the schedule for " + dayOfWeek + "?\n\nThis will affect future slot generation.")) {
//                return;
//            }
//
//            $scope.loading = true;
//
//            DoctorService.deleteSchedule(scheduleId)
//                .then(function (response) {
//                    $scope.loading = false;
//
//                    if (response.data.success) {
//                        $rootScope.showAlert("success", "Schedule deleted successfully");
//                        $scope.loadSchedules();
//                        
//                        if ($scope.editingSchedule && $scope.editingSchedule.scheduleId === scheduleId) {
//                            $scope.cancelEdit();
//                        }
//                    } else {
//                        $rootScope.showAlert("danger", response.data.message || "Failed to delete schedule");
//                    }
//                })
//                .catch(function (error) {
//                    $scope.loading = false;
//                    console.error('Error deleting schedule:', error);
//                    var errorMsg = error.data && error.data.message ? error.data.message : "Error deleting schedule";
//                    $rootScope.showAlert("danger", errorMsg);
//                });
//        };
//
//        /* -----------------------------------------------------------
//           FORMAT TIME FOR DISPLAY
//           ----------------------------------------------------------- */
//        $scope.formatTime = function (timeString) {
//            if (!timeString) return "";
//            
//            if (typeof timeString === 'string') {
//                if (timeString.match(/^\d{2}:\d{2}$/)) {
//                    return timeString;
//                }
//                if (timeString.match(/^\d{2}:\d{2}:\d{2}$/)) {
//                    return timeString.substring(0, 5);
//                }
//            }
//            
//            return timeString;
//        };
//
//        /* -----------------------------------------------------------
//           RESET FORM
//           ----------------------------------------------------------- */
//        $scope.resetForm = function () {
//            $scope.newSchedule = {
//                doctorId: doctorId,
//                dayOfWeek: '',
//                startTime: '',
//                endTime: '',
//                slotDurationMinutes: 15,
//                maxPatientsPerSlot: 1,
//                breakStartTime: '',
//                breakEndTime: '',
//                isActive: true
//            };
//            $scope.editMode = false;
//            $scope.editingSchedule = null;
//        };
//
//        /* -----------------------------------------------------------
//           CREATE DEFAULT WEEKLY SCHEDULE
//           ----------------------------------------------------------- */
//        $scope.createWeeklySchedule = function () {
//
//            if (!confirm("Create default Mon–Fri (9 AM - 5 PM) schedule?\n\nThis will create schedules for all weekdays with 1-hour lunch break.")) {
//                return;
//            }
//
//            var days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
//            var successCount = 0;
//            var failCount = 0;
//
//            $scope.loading = true;
//
//            var promises = [];
//
//            days.forEach(function (day) {
//                var scheduleData = {
//                    doctorId: doctorId,
//                    dayOfWeek: day,
//                    startTime: "09:00",
//                    endTime: "17:00",
//                    breakStartTime: "13:00",
//                    breakEndTime: "14:00",
//                    slotDurationMinutes: 15,
//                    maxPatientsPerSlot: 1,
//                    isActive: true
//                };
//
//                var promise = DoctorService.createSchedule(doctorId, scheduleData)
//                    .then(function (response) {
//                        if (response.data.success) {
//                            successCount++;
//                        } else {
//                            failCount++;
//                        }
//                    })
//                    .catch(function () {
//                        failCount++;
//                    });
//
//                promises.push(promise);
//            });
//
//            Promise.all(promises).then(function () {
//                $scope.loading = false;
//                
//                if (successCount > 0) {
//                    $rootScope.showAlert("success", successCount + " schedule(s) created successfully!");
//                    $scope.loadSchedules();
//                }
//                
//                if (failCount > 0) {
//                    $rootScope.showAlert("warning", failCount + " schedule(s) failed (may already exist)");
//                }
//
//                $scope.$apply();
//            });
//        };
//
//        /* -----------------------------------------------------------
//           BULK DELETE SCHEDULES
//           ----------------------------------------------------------- */
//        $scope.deleteAllSchedules = function () {
//            if (!$scope.schedules || $scope.schedules.length === 0) {
//                $rootScope.showAlert('info', 'No schedules to delete');
//                return;
//            }
//
//            if (!confirm('Are you sure you want to delete ALL ' + $scope.schedules.length + ' schedule(s)?\n\nThis action cannot be undone!')) {
//                return;
//            }
//
//            $scope.loading = true;
//            var deleteCount = 0;
//            var totalSchedules = $scope.schedules.length;
//
//            $scope.schedules.forEach(function (schedule) {
//                DoctorService.deleteSchedule(schedule.scheduleId)
//                    .then(function (response) {
//                        if (response.data.success) {
//                            deleteCount++;
//                        }
//                        
//                        if (deleteCount === totalSchedules) {
//                            $scope.loading = false;
//                            $rootScope.showAlert('success', 'All schedules deleted');
//                            $scope.loadSchedules();
//                        }
//                    })
//                    .catch(function () {
//                        deleteCount++;
//                        if (deleteCount === totalSchedules) {
//                            $scope.loading = false;
//                            $scope.loadSchedules();
//                        }
//                    });
//            });
//        };
//
//        /* Initialize controller */
//        $scope.loadDoctor();
//    }
//]);



/* 
 * Doctor Schedule Controller - DATE-BASED VERSION - FIXED
 */

app.controller('DoctorScheduleController', [
    '$scope', '$rootScope', '$location', '$routeParams', 'DoctorService',
    function ($scope, $rootScope, $location, $routeParams, DoctorService) {

        var doctorId = $routeParams.doctorId;

        $scope.doctor = null;
        $scope.schedules = [];
        $scope.loading = false;
        $scope.editMode = false;
        $scope.editingSchedule = null;

        // Min date = today
        $scope.minDate = getTodayString();

        $scope.newSchedule = {
            doctorId: doctorId,
            scheduleDate: '',
            startTime: '',
            endTime: '',
            slotDurationMinutes: 15,
            maxPatientsPerSlot: 1,
            breakStartTime: '',
            breakEndTime: '',
            isActive: true
        };

        /* -----------------------------------------------------------
           UTILITY FUNCTIONS
           ----------------------------------------------------------- */
        function getTodayString() {
            var d = new Date();
            return d.getFullYear() + '-' + 
                   ('0' + (d.getMonth() + 1)).slice(-2) + '-' + 
                   ('0' + d.getDate()).slice(-2);
        }

        // **NEW: Convert date to YYYY-MM-DD format**
        function toDateString(date) {
            if (!date) return "";
            
            // If already a string in correct format
            if (typeof date === "string" && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                return date;
            }
            
            // If it's a Date object or string that needs conversion
            var d = new Date(date);
            if (isNaN(d.getTime())) return "";
            
            return d.getFullYear() + '-' + 
                   ('0' + (d.getMonth() + 1)).slice(-2) + '-' + 
                   ('0' + d.getDate()).slice(-2);
        }

        function toTimeString(time) {
            if (!time) return "";
            if (typeof time === "string") {
                if (time.match(/^\d{2}:\d{2}$/)) return time;
                if (time.match(/^\d{2}:\d{2}:\d{2}$/)) return time.substring(0, 5);
                return time;
            }
            if (time instanceof Date) {
                var hours = ('0' + time.getHours()).slice(-2);
                var minutes = ('0' + time.getMinutes()).slice(-2);
                return hours + ':' + minutes;
            }
            return "";
        }

        function validateTimes(startTime, endTime, breakStart, breakEnd) {
            function timeToMinutes(timeStr) {
                var parts = timeStr.split(':');
                return parseInt(parts[0]) * 60 + parseInt(parts[1]);
            }

            var start = timeToMinutes(startTime);
            var end = timeToMinutes(endTime);

            if (end <= start) {
                return "End time must be after start time";
            }

            if (breakStart && breakEnd) {
                var bStart = timeToMinutes(breakStart);
                var bEnd = timeToMinutes(breakEnd);

                if (bStart >= bEnd) {
                    return "Break end time must be after break start time";
                }

                if (bStart < start || bEnd > end) {
                    return "Break time must be within schedule time";
                }
            }

            return null;
        }

        /* -----------------------------------------------------------
           GET DAY NAME FROM DATE
           ----------------------------------------------------------- */
        $scope.getDayName = function(dateStr) {
            if (!dateStr) return '';
            var days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
            var d = new Date(dateStr + 'T00:00:00');
            return days[d.getDay()];
        };

        /* -----------------------------------------------------------
           FORMAT DATE FOR DISPLAY
           ----------------------------------------------------------- */
        $scope.formatDate = function(dateStr) {
            if (!dateStr) return '';
            var d = new Date(dateStr + 'T00:00:00');
            var day = ('0' + d.getDate()).slice(-2);
            var month = ('0' + (d.getMonth() + 1)).slice(-2);
            var year = d.getFullYear();
            return day + '-' + month + '-' + year;
        };

        /* -----------------------------------------------------------
           CALCULATE SLOT COUNT
           ----------------------------------------------------------- */
        $scope.calculateSlotCount = function(schedule) {
            if (!schedule || !schedule.startTime || !schedule.endTime) return 0;
            
            var startParts = schedule.startTime.split(':');
            var endParts = schedule.endTime.split(':');
            
            var startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
            var endMinutes = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
            
            var totalMinutes = endMinutes - startMinutes;
            
            if (schedule.breakStartTime && schedule.breakEndTime) {
                var breakStartParts = schedule.breakStartTime.split(':');
                var breakEndParts = schedule.breakEndTime.split(':');
                
                var breakStartMinutes = parseInt(breakStartParts[0]) * 60 + parseInt(breakStartParts[1]);
                var breakEndMinutes = parseInt(breakEndParts[0]) * 60 + parseInt(breakEndParts[1]);
                
                totalMinutes -= (breakEndMinutes - breakStartMinutes);
            }
            
            return Math.floor(totalMinutes / schedule.slotDurationMinutes);
        };

        /* -----------------------------------------------------------
           LOAD DOCTOR
           ----------------------------------------------------------- */
        $scope.loadDoctor = function () {
            DoctorService.getById(doctorId)
                .then(function (response) {
                    if (response.data.success) {
                        $scope.doctor = response.data.data;
                        $scope.loadSchedules();
                    } else {
                        $rootScope.showAlert('danger', 'Doctor not found');
                        $location.path('/doctor/list');
                    }
                })
                .catch(function (error) {
                    console.error('Error loading doctor:', error);
                    $rootScope.showAlert('danger', 'Error loading doctor details');
                    $location.path('/doctor/list');
                });
        };

        /* -----------------------------------------------------------
           LOAD SCHEDULES
           ----------------------------------------------------------- */
        $scope.loadSchedules = function () {
            $scope.loading = true;

            DoctorService.getAllSchedules(doctorId)
                .then(function (response) {
                    $scope.loading = false;
                    if (response.data.success) {
                        $scope.schedules = response.data.data || [];
                    } else {
                        $scope.schedules = [];
                    }
                })
                .catch(function (error) {
                    $scope.loading = false;
                    $scope.schedules = [];
                    console.error('Error loading schedules:', error);
                });
        };

        /* -----------------------------------------------------------
           CREATE SCHEDULE - FIXED
           ----------------------------------------------------------- */
        $scope.createSchedule = function () {

            if (!$scope.newSchedule.scheduleDate) {
                $rootScope.showAlert("warning", "Please select schedule date");
                return;
            }

            if (!$scope.newSchedule.startTime || !$scope.newSchedule.endTime) {
                $rootScope.showAlert("warning", "Please enter start and end time");
                return;
            }

            // **FIX: Convert date to proper string format**
            var dateStr = toDateString($scope.newSchedule.scheduleDate);
            if (!dateStr) {
                $rootScope.showAlert("warning", "Invalid date format");
                return;
            }

            var startStr = toTimeString($scope.newSchedule.startTime);
            var endStr = toTimeString($scope.newSchedule.endTime);
            var breakStartStr = toTimeString($scope.newSchedule.breakStartTime);
            var breakEndStr = toTimeString($scope.newSchedule.breakEndTime);

            if (!startStr.match(/^\d{2}:\d{2}$/) || !endStr.match(/^\d{2}:\d{2}$/)) {
                $rootScope.showAlert("warning", "Invalid time format");
                return;
            }

            var validationError = validateTimes(startStr, endStr, breakStartStr, breakEndStr);
            if (validationError) {
                $rootScope.showAlert("warning", validationError);
                return;
            }

            // Check if schedule already exists for this date
            var existingSchedule = $scope.schedules.find(function(s) {
                return s.scheduleDate === dateStr && s.isActive;
            });

            if (existingSchedule) {
                if (!confirm('A schedule already exists for ' + $scope.formatDate(dateStr) + '. Do you want to create another one?')) {
                    return;
                }
            }

            // **CRITICAL FIX: Send dateStr (string) not date object**
            var scheduleData = {
                doctorId: doctorId,
                scheduleDate: dateStr,  // String format: "2025-12-15"
                startTime: startStr,
                endTime: endStr,
                slotDurationMinutes: parseInt($scope.newSchedule.slotDurationMinutes) || 15,
                maxPatientsPerSlot: parseInt($scope.newSchedule.maxPatientsPerSlot) || 1,
                isActive: true
            };

            if (breakStartStr && breakEndStr && 
                breakStartStr.match(/^\d{2}:\d{2}$/) && 
                breakEndStr.match(/^\d{2}:\d{2}$/)) {
                scheduleData.breakStartTime = breakStartStr;
                scheduleData.breakEndTime = breakEndStr;
            }

            console.log('Creating schedule:', scheduleData);

            $scope.loading = true;

            DoctorService.createSchedule(doctorId, scheduleData)
                .then(function (response) {
                    $scope.loading = false;

                    if (response.data.success) {
                        $rootScope.showAlert("success", "Schedule created successfully for " + $scope.formatDate(scheduleData.scheduleDate) + "!");
                        $scope.loadSchedules();
                        $scope.resetForm();
                    } else {
                        $rootScope.showAlert("danger", response.data.message || "Failed to create schedule");
                    }
                })
                .catch(function (error) {
                    $scope.loading = false;
                    console.error('Error creating schedule:', error);
                    var errorMsg = error.data && error.data.message ? error.data.message : "Error creating schedule";
                    $rootScope.showAlert("danger", errorMsg);
                });
        };

        /* -----------------------------------------------------------
           EDIT SCHEDULE
           ----------------------------------------------------------- */
        $scope.editSchedule = function (schedule) {
            $scope.editMode = true;
            $scope.editingSchedule = schedule;

            $scope.newSchedule = {
                doctorId: doctorId,
                scheduleDate: schedule.scheduleDate,
                startTime: $scope.formatTime(schedule.startTime),
                endTime: $scope.formatTime(schedule.endTime),
                slotDurationMinutes: schedule.slotDurationMinutes,
                maxPatientsPerSlot: schedule.maxPatientsPerSlot,
                breakStartTime: schedule.breakStartTime ? $scope.formatTime(schedule.breakStartTime) : '',
                breakEndTime: schedule.breakEndTime ? $scope.formatTime(schedule.breakEndTime) : '',
                isActive: schedule.isActive
            };

            window.scrollTo({ top: 0, behavior: 'smooth' });
            $rootScope.showAlert('info', 'Editing schedule for ' + $scope.formatDate(schedule.scheduleDate));
        };

        /* -----------------------------------------------------------
           UPDATE SCHEDULE - FIXED
           ----------------------------------------------------------- */
        $scope.updateSchedule = function () {
            if (!$scope.editingSchedule) return;

            if (!$scope.newSchedule.startTime || !$scope.newSchedule.endTime) {
                $rootScope.showAlert("warning", "Please enter start and end time");
                return;
            }

            // **FIX: Convert date to proper string format**
            var dateStr = toDateString($scope.newSchedule.scheduleDate);

            var startStr = toTimeString($scope.newSchedule.startTime);
            var endStr = toTimeString($scope.newSchedule.endTime);
            var breakStartStr = toTimeString($scope.newSchedule.breakStartTime);
            var breakEndStr = toTimeString($scope.newSchedule.breakEndTime);

            var validationError = validateTimes(startStr, endStr, breakStartStr, breakEndStr);
            if (validationError) {
                $rootScope.showAlert("warning", validationError);
                return;
            }

            var scheduleData = {
                doctorId: doctorId,
                scheduleDate: dateStr,  // String format
                startTime: startStr,
                endTime: endStr,
                slotDurationMinutes: parseInt($scope.newSchedule.slotDurationMinutes) || 15,
                maxPatientsPerSlot: parseInt($scope.newSchedule.maxPatientsPerSlot) || 1,
                isActive: $scope.newSchedule.isActive
            };

            if (breakStartStr && breakEndStr) {
                scheduleData.breakStartTime = breakStartStr;
                scheduleData.breakEndTime = breakEndStr;
            }

            console.log('Updating schedule:', $scope.editingSchedule.scheduleId, scheduleData);

            $scope.loading = true;

            DoctorService.updateSchedule($scope.editingSchedule.scheduleId, scheduleData)
                .then(function (response) {
                    $scope.loading = false;

                    if (response.data.success) {
                        $rootScope.showAlert("success", "Schedule updated successfully!");
                        $scope.loadSchedules();
                        $scope.cancelEdit();
                    } else {
                        $rootScope.showAlert("danger", response.data.message || "Failed to update schedule");
                    }
                })
                .catch(function (error) {
                    $scope.loading = false;
                    console.error('Error updating schedule:', error);
                    var errorMsg = error.data && error.data.message ? error.data.message : "Error updating schedule";
                    $rootScope.showAlert("danger", errorMsg);
                });
        };

        /* -----------------------------------------------------------
           DUPLICATE SCHEDULE
           ----------------------------------------------------------- */
        $scope.duplicateSchedule = function (schedule) {
            $scope.newSchedule = {
                doctorId: doctorId,
                scheduleDate: '',
                startTime: $scope.formatTime(schedule.startTime),
                endTime: $scope.formatTime(schedule.endTime),
                slotDurationMinutes: schedule.slotDurationMinutes,
                maxPatientsPerSlot: schedule.maxPatientsPerSlot,
                breakStartTime: schedule.breakStartTime ? $scope.formatTime(schedule.breakStartTime) : '',
                breakEndTime: schedule.breakEndTime ? $scope.formatTime(schedule.breakEndTime) : '',
                isActive: true
            };

            window.scrollTo({ top: 0, behavior: 'smooth' });
            $rootScope.showAlert('info', 'Schedule settings copied! Please select a date and create.');
        };

        /* -----------------------------------------------------------
           CANCEL EDIT MODE
           ----------------------------------------------------------- */
        $scope.cancelEdit = function () {
            $scope.editMode = false;
            $scope.editingSchedule = null;
            $scope.resetForm();
        };

        /* -----------------------------------------------------------
           TOGGLE SCHEDULE STATUS
           ----------------------------------------------------------- */
        $scope.toggleSchedule = function (schedule) {
            var newStatus = !schedule.isActive;
            var action = newStatus ? 'activate' : 'deactivate';

            if (!confirm('Are you sure you want to ' + action + ' this schedule?')) {
                return;
            }

            DoctorService.toggleSchedule(schedule.scheduleId, newStatus)
                .then(function (response) {
                    if (response.data.success) {
                        schedule.isActive = newStatus;
                        $rootScope.showAlert('success', 'Schedule ' + (newStatus ? 'activated' : 'deactivated'));
                    } else {
                        $rootScope.showAlert('danger', response.data.message || 'Failed to update status');
                    }
                })
                .catch(function (error) {
                    console.error('Error toggling schedule:', error);
                    $rootScope.showAlert("danger", "Error updating schedule status");
                });
        };

        /* -----------------------------------------------------------
           DELETE SCHEDULE
           ----------------------------------------------------------- */
        $scope.deleteSchedule = function (scheduleId, scheduleDate) {

            if (!confirm("Are you sure you want to delete the schedule for " + $scope.formatDate(scheduleDate) + "?")) {
                return;
            }

            $scope.loading = true;

            DoctorService.deleteSchedule(scheduleId)
                .then(function (response) {
                    $scope.loading = false;

                    if (response.data.success) {
                        $rootScope.showAlert("success", "Schedule deleted successfully");
                        $scope.loadSchedules();
                        
                        if ($scope.editingSchedule && $scope.editingSchedule.scheduleId === scheduleId) {
                            $scope.cancelEdit();
                        }
                    } else {
                        $rootScope.showAlert("danger", response.data.message || "Failed to delete schedule");
                    }
                })
                .catch(function (error) {
                    $scope.loading = false;
                    console.error('Error deleting schedule:', error);
                    var errorMsg = error.data && error.data.message ? error.data.message : "Error deleting schedule";
                    $rootScope.showAlert("danger", errorMsg);
                });
        };

        /* -----------------------------------------------------------
           FORMAT TIME FOR DISPLAY
           ----------------------------------------------------------- */
        $scope.formatTime = function (timeString) {
            if (!timeString) return "";
            
            if (typeof timeString === 'string') {
                if (timeString.match(/^\d{2}:\d{2}$/)) {
                    return timeString;
                }
                if (timeString.match(/^\d{2}:\d{2}:\d{2}$/)) {
                    return timeString.substring(0, 5);
                }
            }
            
            return timeString;
        };

        /* -----------------------------------------------------------
           RESET FORM
           ----------------------------------------------------------- */
        $scope.resetForm = function () {
            $scope.newSchedule = {
                doctorId: doctorId,
                scheduleDate: '',
                startTime: '',
                endTime: '',
                slotDurationMinutes: 15,
                maxPatientsPerSlot: 1,
                breakStartTime: '',
                breakEndTime: '',
                isActive: true
            };
            $scope.editMode = false;
            $scope.editingSchedule = null;
        };

        /* -----------------------------------------------------------
           CREATE BULK SCHEDULES (Next 7 Days) - FIXED
           ----------------------------------------------------------- */
        $scope.createBulkSchedules = function () {

            if (!confirm("Create schedules for next 7 days (9 AM - 5 PM with 1-hour lunch break)?")) {
                return;
            }

            var today = new Date();
            var successCount = 0;
            var failCount = 0;
            var promises = [];

            $scope.loading = true;

            for (var i = 0; i < 7; i++) {
                var date = new Date(today);
                date.setDate(today.getDate() + i);
                
                // **FIX: Use toDateString helper**
                var dateStr = toDateString(date);

                var scheduleData = {
                    doctorId: doctorId,
                    scheduleDate: dateStr,  // String format
                    startTime: "09:00",
                    endTime: "17:00",
                    breakStartTime: "13:00",
                    breakEndTime: "14:00",
                    slotDurationMinutes: 15,
                    maxPatientsPerSlot: 1,
                    isActive: true
                };

                var promise = DoctorService.createSchedule(doctorId, scheduleData)
                    .then(function (response) {
                        if (response.data.success) {
                            successCount++;
                        } else {
                            failCount++;
                        }
                    })
                    .catch(function () {
                        failCount++;
                    });

                promises.push(promise);
            }

            Promise.all(promises).then(function () {
                $scope.loading = false;
                
                if (successCount > 0) {
                    $rootScope.showAlert("success", successCount + " schedule(s) created successfully!");
                    $scope.loadSchedules();
                }
                
                if (failCount > 0) {
                    $rootScope.showAlert("warning", failCount + " schedule(s) failed (may already exist)");
                }

                $scope.$apply();
            });
        };

        /* -----------------------------------------------------------
           BULK DELETE SCHEDULES
           ----------------------------------------------------------- */
        $scope.deleteAllSchedules = function () {
            if (!$scope.schedules || $scope.schedules.length === 0) {
                $rootScope.showAlert('info', 'No schedules to delete');
                return;
            }

            if (!confirm('Are you sure you want to delete ALL ' + $scope.schedules.length + ' schedule(s)?\n\nThis action cannot be undone!')) {
                return;
            }

            $scope.loading = true;
            var deleteCount = 0;
            var totalSchedules = $scope.schedules.length;

            $scope.schedules.forEach(function (schedule) {
                DoctorService.deleteSchedule(schedule.scheduleId)
                    .then(function (response) {
                        if (response.data.success) {
                            deleteCount++;
                        }
                        
                        if (deleteCount === totalSchedules) {
                            $scope.loading = false;
                            $rootScope.showAlert('success', 'All schedules deleted');
                            $scope.loadSchedules();
                        }
                    })
                    .catch(function () {
                        deleteCount++;
                        if (deleteCount === totalSchedules) {
                            $scope.loading = false;
                            $scope.loadSchedules();
                        }
                    });
            });
        };

        /* Initialize controller */
        $scope.loadDoctor();
    }
]);