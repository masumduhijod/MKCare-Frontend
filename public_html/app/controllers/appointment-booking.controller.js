/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */



/**
 * Appointment Booking Controller - FIXED
 * ✅ No CVR creation during booking
 * ✅ CVR will be created only during check-in
 */

app.controller('AppointmentBookingController', ['$scope', '$rootScope', '$location', '$routeParams',
    'PatientService', 'DoctorService', 'AppointmentService', 'AuthService',
    function($scope, $rootScope, $location, $routeParams, PatientService, DoctorService, 
             AppointmentService, AuthService) {
    
    var currentUser = AuthService.getCurrentUser();
    
    // Booking Steps
    $scope.currentStep = 1;
    
    // Data
    $scope.patient = null;
    $scope.recentPatients = [];
    $scope.departments = [];
    $scope.doctors = [];
    $scope.selectedDoctor = null;
    $scope.selectedDepartment = '';
    $scope.availableDates = [];
    
    $scope.selectedDate = null;
    $scope.minDate = getTodayString();
    
    $scope.slots = [];
    $scope.selectedSlot = null;
    
    // Appointment Data
    $scope.appointment = {
        pinNumber: $routeParams.pinNumber || '',
        doctorId: '',
        appointmentDate: null,
        appointmentTime: null,
        slotId: null,
        appointmentType: 'Consultation',
        symptoms: '',
        notes: '',
        createdBy: currentUser ? currentUser.username : ''
    };
    
    $scope.loading = false;
    $scope.searchQuery = '';
    $scope.bookedAppointment = null;
    $scope.lovPatients = [];
    $scope.lovSearchQuery = '';
    $scope.lovCurrentPage = 1;
    $scope.lovPageSize = 5;
    $scope.lovTotalPages = 1;
    $scope.isLovLoading = false;
    
    $scope.appointmentTypes = ['Consultation', 'Follow-up', 'Emergency', 'Routine Checkup'];
    
    /* ============================================================
       HELPER FUNCTIONS
       ============================================================ */
    function getTodayString() {
        var d = new Date();
        return d.getFullYear() + '-' + 
               ('0' + (d.getMonth() + 1)).slice(-2) + '-' + 
               ('0' + d.getDate()).slice(-2);
    }
    
    function getDayName(dateStr) {
        if (!dateStr) return '';
        var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        var d = new Date(dateStr + 'T00:00:00');
        return days[d.getDay()];
    }
    
    $scope.getDayName = getDayName;
    
    function formatDateDisplay(dateStr) {
        if (!dateStr) return '';
        var d = new Date(dateStr + 'T00:00:00');
        var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return days[d.getDay()] + ', ' + d.getDate() + ' ' + months[d.getMonth()];
    }
    
    /**
     * Check if slot time has expired
     */
    $scope.isSlotExpired = function(slotTime) {
        if (!$scope.selectedDate || !slotTime) return false;
        
        var today = getTodayString();
        
        if ($scope.selectedDate > today) return false;
        if ($scope.selectedDate < today) return true;
        
        // Today - check time
        var now = new Date();
        var currentHours = now.getHours();
        var currentMinutes = now.getMinutes();
        
        var slotTimeStr = $scope.formatSlotTime(slotTime);
        var timeParts = slotTimeStr.split(':');
        var slotHours = parseInt(timeParts[0], 10);
        var slotMinutes = parseInt(timeParts[1], 10);
        
        if (slotHours < currentHours) {
            return true;
        } else if (slotHours === currentHours && slotMinutes <= currentMinutes) {
            return true;
        }
        
        return false;
    };
    
    /* ============================================================
       STEP 1: PATIENT SELECTION
       ============================================================ */
    
    $scope.loadRecentPatients = function() {
        $scope.loading = true;
        
        PatientService.getRecent(50)
            .then(function(response) {
                $scope.loading = false;
                if (response.data.success) {
                    $scope.recentPatients = response.data.data;
                } else {
                    $scope.recentPatients = [];
                }
            })
            .catch(function(error) {
                $scope.loading = false;
                $scope.recentPatients = [];
                console.error('Error loading patients:', error);
            });
    };
    
    $scope.searchPatient = function() {
        if (!$scope.searchQuery || $scope.searchQuery.trim() === '') {
            $rootScope.showAlert && $rootScope.showAlert('warning', 'Please enter PIN or contact number');
            return;
        }
        
        $scope.loading = true;
        var query = $scope.searchQuery.trim();
        
        if (query.toUpperCase().indexOf('PIN') === 0) {
            PatientService.getByPin(query)
                .then(handlePatientResponse)
                .catch(function() { tryByContact(query); });
        } else if (/^\d+$/.test(query)) {
            tryByContact(query);
        } else {
            // Might be a name search, route to search if neither PIN nor CONTACT matched
             PatientService.search(query)
                .then(function(res) {
                    if (res.data && res.data.success && res.data.data && res.data.data.length > 0) {
                        // Got a list, ideally open LOV or pick the first one
                        $scope.openPatientLov(query);
                    } else {
                         handlePatientResponse(res);
                    }
                })
                .catch(function() {
                    $scope.loading = false;
                    $rootScope.showAlert && $rootScope.showAlert('danger', 'Patient not found');
                });
        }
    };
    
    $scope.onSearchQueryChange = function() {
        var query = $scope.searchQuery;
        if (!query || query.trim() === '') {
            if ($scope.patient) {
                // Don't auto-clear if they are just backspacing a little, 
                // but let's clear if completely empty to reset state.
                $scope.clearPatientSelection();
            }
            return;
        }
        query = query.trim();
        // If it looks like a full PIN (e.g. PIN2025... usually > 10 chars) or precisely 10 digit mobile
        if ((query.toUpperCase().indexOf('PIN') === 0 && query.length >= 10) || (/^\d+$/.test(query) && query.length === 10)) {
            $scope.searchPatient();
        }
    };
    
    function tryByContact(query) {
        PatientService.getByContact(query)
            .then(handlePatientResponse)
            .catch(function(error) {
                $scope.loading = false;
                $rootScope.showAlert('danger', 'Patient not found');
            });
    }
    
    function handlePatientResponse(response) {
        $scope.loading = false;
        // The endpoint could be getByPin (returns single Object directly in data) or search (returns Array in data)
        var data = response.data ? response.data.data : null;
        if (response.data && response.data.success && data) {
            // if array and not empty
            if (Array.isArray(data)) {
                 if(data.length > 0) {
                     $scope.patient = data[0];
                 } else {
                     $rootScope.showAlert && $rootScope.showAlert('warning', 'Patient not found');
                     return;
                 }
            } else {
                 $scope.patient = data;
            }
            $scope.appointment.pinNumber = $scope.patient.pinNumber;
            $rootScope.showAlert && $rootScope.showAlert('success', 'Patient found: ' + $scope.patient.fullName);
        } else {
            $rootScope.showAlert && $rootScope.showAlert('warning', 'Patient not found');
        }
    }
    
    $scope.selectPatientFromList = function(patient) {
        $scope.patient = patient;
        $scope.appointment.pinNumber = patient.pinNumber;
        $scope.searchQuery = patient.pinNumber;
        $rootScope.showAlert('success', 'Patient selected: ' + patient.fullName);
    };

    $scope.openPatientLov = function(paramQuery) {
        $scope.lovSearchQuery = paramQuery || $scope.searchQuery || '';
        $scope.lovPatients = [];
        $scope.lovCurrentPage = 1;
        $scope.lovTotalPages = 1;
        $scope.searchLovPatients();
        // The modal is triggered by Bootstrap's data-bs-target, so we just initialize state here.
        // If triggered programmatically, show it.
        var modalEl = document.getElementById('patientLovModal');
        if (modalEl && paramQuery) {
            var modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
            modal.show();
        }
    };
    
    $scope.searchLovPatients = function() {
        $scope.isLovLoading = true;
        var query = $scope.lovSearchQuery.trim();
        
        var request;
        if (!query) {
            request = PatientService.getRecent(50);
        } else if (query.toUpperCase().indexOf('PIN') === 0) {
            request = PatientService.getByPin(query);
        } else if (/^\d+$/.test(query)) {
            request = PatientService.getByContact(query);
        } else {
            request = PatientService.search(query);
        }
        
        request.then(function(response) {
            $scope.isLovLoading = false;
            if (response.data && response.data.success && response.data.data) {
                var data = response.data.data;
                $scope.lovPatients = Array.isArray(data) ? data : [data];
                $scope.updateLovPagination();
            } else {
                $scope.lovPatients = [];
                $scope.updateLovPagination();
            }
        }).catch(function(error) {
            $scope.isLovLoading = false;
            $scope.lovPatients = [];
            $scope.updateLovPagination();
        });
    };
    
    $scope.updateLovPagination = function() {
        $scope.lovCurrentPage = 1;
        $scope.lovTotalPages = Math.ceil($scope.lovPatients.length / $scope.lovPageSize) || 1;
    };
    
    $scope.prevLovPage = function() {
        if ($scope.lovCurrentPage > 1) $scope.lovCurrentPage--;
    };
    
    $scope.nextLovPage = function() {
        if ($scope.lovCurrentPage < $scope.lovTotalPages) $scope.lovCurrentPage++;
    };
    
    $scope.selectPatientFromModal = function(patient) {
        $scope.patient = patient;
        $scope.appointment.pinNumber = patient.pinNumber;
        $scope.searchQuery = patient.pinNumber;
        $rootScope.showAlert('success', 'Patient selected: ' + patient.fullName);
        
        // Hide Bootstrap 5 modal
        var modalEl = document.getElementById('patientLovModal');
        if (modalEl) {
            var modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) {
                modal.hide();
            } else {
                // jQuery fallback or native hide
                if(window.jQuery) { $('#patientLovModal').modal('hide'); }
            }
            // fix backdrop if needed
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open').css('padding-right', '');
        }
    };
    
    $scope.clearPatientSelection = function() {
        $scope.patient = null;
        $scope.appointment.pinNumber = '';
        $scope.searchQuery = '';
    };
    
    /* ============================================================
       NAVIGATION
       ============================================================ */
    $scope.nextStep = function() {
        if ($scope.currentStep === 1) {
            if (!$scope.patient) {
                $rootScope.showAlert('warning', 'Please select a patient first');
                return;
            }
            $scope.loadDepartments();
        } else if ($scope.currentStep === 2) {
            if (!$scope.selectedDoctor) {
                $rootScope.showAlert('warning', 'Please select a doctor');
                return;
            }
            $scope.loadDoctorSchedules();
        } else if ($scope.currentStep === 3) {
            if (!$scope.selectedSlot) {
                $rootScope.showAlert('warning', 'Please select a time slot');
                return;
            }
        }
        
        $scope.currentStep++;
    };
    
    $scope.prevStep = function() {
        $scope.currentStep--;
    };
    
    /* ============================================================
       STEP 2: DOCTOR SELECTION
       ============================================================ */
    $scope.loadDepartments = function() {
        DoctorService.getDepartments()
            .then(function(response) {
                if (response.data.success) {
                    $scope.departments = response.data.data;
                }
            })
            .catch(function(error) {
                console.error('Error loading departments:', error);
            });
    };
    
    $scope.loadDoctors = function(department) {
        if (!department) return;
        
        $scope.loading = true;
        $scope.selectedDoctor = null;
        
        DoctorService.getAvailableByDepartment(department)
            .then(function(response) {
                $scope.loading = false;
                if (response.data.success) {
                    $scope.doctors = response.data.data;
                            //display doctor name and Contact No on appointment booking
                            $scope.doctors.forEach(function (doctor) {
                                DoctorService.getById(doctor.doctorId)
                                        .then(function (res) {
                                            if (res.data.success && res.data.data) {
                                                var d = res.data.data;

                                                doctor.firstName = d.firstName;
                                                doctor.lastName = d.lastName;
                                                doctor.contactNumber = d.contactNumber;
                                            }
                                        });
                            });
                } else {
                    $scope.doctors = [];
                }
            })
            .catch(function(error) {
                $scope.loading = false;
                $scope.doctors = [];
            });
    };
    
    $scope.selectDoctor = function(doctor) {
        $scope.selectedDoctor = doctor;
        $scope.appointment.doctorId = doctor.doctorId;
    };
    
    /* ============================================================
       STEP 3: DATE & SLOT SELECTION
       ============================================================ */
    
    $scope.loadDoctorSchedules = function() {
        $scope.loading = true;
        
        console.log('Loading doctor schedules for:', $scope.appointment.doctorId);
        
        $scope.selectedDate = null;
        $scope.slots = [];
        $scope.selectedSlot = null;
        
        DoctorService.getUpcomingSchedules($scope.appointment.doctorId, 30)
            .then(function(response) {
                $scope.loading = false;
                
                if (response.data.success && response.data.data && response.data.data.length > 0) {
                    var schedules = response.data.data;
                    
                    $scope.availableDates = schedules
                        .filter(function(schedule) {
                            return schedule.isActive && schedule.scheduleDate;
                        })
                        .map(function(schedule) {
                            return {
                                date: schedule.scheduleDate,
                                displayDate: formatDateDisplay(schedule.scheduleDate),
                                dayName: getDayName(schedule.scheduleDate),
                                schedule: schedule
                            };
                        });
                    
                    console.log('✅ Available Dates:', $scope.availableDates.length);
                    
                } else {
                    $scope.availableDates = [];
                    $rootScope.showAlert('warning', 'Doctor has no scheduled dates!');
                }
            })
            .catch(function(error) {
                $scope.loading = false;
                console.error('Error loading schedules:', error);
                $scope.availableDates = [];
                $rootScope.showAlert('danger', 'Error loading doctor schedules');
            });
    };
    
    $scope.selectDate = function(dateStr) {
        console.log('Date selected:', dateStr);
        
        if (!dateStr || !dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
            $rootScope.showAlert('danger', 'Invalid date format');
            return;
        }
        
        $scope.selectedDate = dateStr;
        $scope.appointment.appointmentDate = dateStr;
        $scope.selectedSlot = null;
        $scope.slots = [];
        
        $scope.loadSlotsForDate(dateStr);
    };
    
    $scope.loadSlotsForDate = function(dateStr) {
        $scope.loading = true;
        
        console.log('Loading slots for:', dateStr);
        
        AppointmentService.getAvailableSlots($scope.appointment.doctorId, dateStr)
            .then(function(response) {
                $scope.loading = false;
                
                if (response.data.success && response.data.data && response.data.data.length > 0) {
                    $scope.slots = response.data.data;
                    console.log('✅ Loaded slots:', $scope.slots.length);
                } else {
                    $scope.slots = [];
                    
                    var generate = confirm(
                        'No slots generated for ' + formatDateDisplay(dateStr) + 
                        '\n\nGenerate slots now?'
                    );
                    
                    if (generate) {
                        $scope.generateSlots();
                    }
                }
            })
            .catch(function(error) {
                $scope.loading = false;
                $scope.slots = [];
                console.error('Error loading slots:', error);
                
                var generate = confirm('Error loading slots.\n\nGenerate new slots?');
                if (generate) {
                    $scope.generateSlots();
                }
            });
    };
    
    $scope.generateSlots = function() {
        if (!$scope.selectedDate) {
            $rootScope.showAlert('warning', 'Please select a date first');
            return;
        }
        
        $scope.loading = true;
        
        var slotData = {
            doctorId: $scope.appointment.doctorId,
            date: $scope.selectedDate
        };
        
        console.log('Generating slots:', slotData);
        
        AppointmentService.generateSlots(slotData)
            .then(function(response) {
                $scope.loading = false;
                
                if (response.data.success && response.data.data) {
                    $scope.slots = response.data.data;
                    
                    $rootScope.showAlert(
                        'success', 
                        'Generated ' + $scope.slots.length + ' slots!'
                    );
                } else {
                    $rootScope.showAlert('danger', 'Failed to generate slots');
                }
            })
            .catch(function(error) {
                $scope.loading = false;
                console.error('Error generating slots:', error);
                $rootScope.showAlert('danger', 'Error generating slots');
            });
    };
    
    $scope.syncMissingSlots = function() {
        if (!$scope.selectedDate || !$scope.appointment.doctorId) return;
        
        $scope.loading = true;
        var slotData = {
            doctorId: $scope.appointment.doctorId,
            date: $scope.selectedDate
        };
        
        console.log('Syncing slots for new schedules:', slotData);
        
        AppointmentService.generateSlots(slotData)
            .then(function(response) {
                $scope.loading = false;
                if (response.data.success && response.data.data) {
                    $scope.slots = response.data.data;
                    $rootScope.showAlert('success', 'Slots synced! Newly added slots should now be visible.');
                } else {
                    $rootScope.showAlert('danger', 'No slots returned or sync failed.');
                }
            })
            .catch(function(error) {
                $scope.loading = false;
                console.error('Error syncing missing slots:', error);
                $rootScope.showAlert('danger', 'Error syncing schedules to slots.');
            });
    };
    
    $scope.selectSlot = function(slot) {
        if (!slot.isAvailable) {
            $rootScope.showAlert('warning', 'This slot is already booked');
            return;
        }
        
        if ($scope.isSlotExpired(slot.slotTime)) {
            $rootScope.showAlert('warning', 'This slot time has already passed');
            return;
        }
        
        $scope.selectedSlot = slot;
        $scope.appointment.slotId = slot.slotId;
        $scope.appointment.appointmentTime = slot.slotTime;
        $scope.appointment.appointmentDate = $scope.selectedDate;
        
        console.log('✅ Slot selected:', slot);
    };
    
    $scope.formatSlotTime = function(slotTime) {
        if (!slotTime) return '';
        
        if (typeof slotTime === 'string') {
            return slotTime.length > 5 ? slotTime.substring(0, 5) : slotTime;
        }
        
        if (typeof slotTime === 'object' && slotTime.hour !== undefined) {
            return ('0' + slotTime.hour).slice(-2) + ':' + ('0' + slotTime.minute).slice(-2);
        }
        
        return '';
    };
    
    /* ============================================================
       STEP 4: BOOK APPOINTMENT
       ✅ CRITICAL FIX: NO CVR CREATION HERE
       ============================================================ */
    
    $scope.bookAppointment = function() {
        if (!$scope.appointment.appointmentType) {
            $rootScope.showAlert('warning', 'Please select appointment type');
            return;
        }
        
        if (!$scope.appointment.symptoms || $scope.appointment.symptoms.trim() === '') {
            $rootScope.showAlert('warning', 'Please enter symptoms');
            return;
        }
        
        console.log('========== BOOKING APPOINTMENT ==========');
        console.log('Appointment Data:', JSON.stringify($scope.appointment, null, 2));
        
        $scope.loading = true;
        
        AppointmentService.book($scope.appointment)
            .then(function(response) {
                $scope.loading = false;
                
                console.log('Appointment Response:', response.data);
                
                if (response.data.success) {
                    $scope.bookedAppointment = response.data.data;
                    
                    console.log('✅ Appointment Booked:', $scope.bookedAppointment);
                    
                    $rootScope.showAlert(
                        'success', 
                        'Appointment booked successfully! Token: ' + $scope.bookedAppointment.tokenNumber
                    );
                    
                    // ✅ NO CVR CREATION - It will be created during check-in
                    
                } else {
                    var errorMsg = response.data.message || 'Booking failed';
                    console.error('❌ Booking failed:', errorMsg);
                    $rootScope.showAlert('danger', errorMsg);
                }
            })
            .catch(function(error) {
                $scope.loading = false;
                console.error('❌ Error booking:', error);
                
                var errorMsg = 'Error booking appointment';
                if (error.data && error.data.message) {
                    errorMsg = error.data.message;
                } else if (error.status) {
                    errorMsg += ' (HTTP ' + error.status + ')';
                }
                
                $rootScope.showAlert('danger', errorMsg);
            });
    };
    
    /* ============================================================
       UTILITY
       ============================================================ */
    
    $scope.bookAnother = function() {
        if (confirm('Start booking another appointment?')) {
            $scope.currentStep = 1;
            $scope.patient = null;
            $scope.selectedDoctor = null;
            $scope.selectedDepartment = '';
            $scope.selectedDate = null;
            $scope.selectedSlot = null;
            $scope.bookedAppointment = null;
            $scope.searchQuery = '';
            $scope.slots = [];
            $scope.availableDates = [];

            $scope.appointment = {
                pinNumber: '',
                doctorId: '',
                appointmentDate: null,
                appointmentTime: null,
                slotId: null,
                appointmentType: 'Consultation',
                symptoms: '',
                notes: '',
                createdBy: currentUser ? currentUser.username : ''
            };

            $rootScope.showAlert('info', 'Form reset');
            $scope.loadRecentPatients();
        }
    };
    
    $scope.printAppointmentCard = function() {
        window.print();
    };
    
    $scope.cancel = function() {
        if (confirm('Cancel booking?')) {
            $location.path('/dashboard');
        }
    };
    
    // Initialize
    $scope.loadRecentPatients();
    
    if ($scope.appointment.pinNumber) {
        $scope.searchQuery = $scope.appointment.pinNumber;
        $scope.searchPatient();
    }
}]);