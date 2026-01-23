/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


///**
// * Appointment Booking Controller - SCHEDULE-BASED VERSION
// * Shows only dates where doctor has schedule
// */
//
//app.controller('AppointmentBookingController', ['$scope', '$rootScope', '$location', '$routeParams',
//    'PatientService', 'CVRService', 'DoctorService', 'AppointmentService', 'AuthService',
//    function($scope, $rootScope, $location, $routeParams, PatientService, CVRService, DoctorService, 
//             AppointmentService, AuthService) {
//    
//    var currentUser = AuthService.getCurrentUser();
//    
//    // Booking Steps
//    $scope.currentStep = 1;
//    
//    // Data
//    $scope.patient = null;
//    $scope.recentPatients = [];
//    $scope.departments = [];
//    $scope.doctors = [];
//    $scope.selectedDoctor = null;
//    $scope.selectedDepartment = '';
//    $scope.doctorSchedules = []; // Doctor's weekly schedules
//    $scope.availableDates = []; // Dates where slots can be generated
//    
//    // Selected date as string (YYYY-MM-DD)
//    $scope.selectedDate = null;
//    $scope.minDate = getTodayString();
//    
//    $scope.slots = [];
//    $scope.selectedSlot = null;
//    
//    // Appointment Data
//    $scope.appointment = {
//        pinNumber: $routeParams.pinNumber || '',
//        doctorId: '',
//        appointmentDate: null,
//        appointmentTime: null,
//        slotId: null,
//        appointmentType: 'Consultation',
//        symptoms: '',
//        notes: '',
//        createdBy: currentUser ? currentUser.username : ''
//    };
//    
//    $scope.loading = false;
//    $scope.searchQuery = '';
//    $scope.bookedAppointment = null;
//    $scope.createdCVR = null;
//    
//    $scope.appointmentTypes = ['Consultation', 'Follow-up', 'Emergency', 'Routine Checkup'];
//    
//    // Helper functions
//    function getTodayString() {
//        var d = new Date();
//        return d.getFullYear() + '-' + 
//               ('0' + (d.getMonth() + 1)).slice(-2) + '-' + 
//               ('0' + d.getDate()).slice(-2);
//    }
//    
//    function getDayName(dateStr) {
//        var days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
//        var d = new Date(dateStr + 'T00:00:00');
//        return days[d.getDay()];
//    }
//    
//    function addDays(dateStr, days) {
//        var d = new Date(dateStr + 'T00:00:00');
//        d.setDate(d.getDate() + days);
//        return d.getFullYear() + '-' + 
//               ('0' + (d.getMonth() + 1)).slice(-2) + '-' + 
//               ('0' + d.getDate()).slice(-2);
//    }
//    
//    /**
//     * ==================== STEP 1: PATIENT SELECTION ====================
//     */
//    
//    $scope.loadRecentPatients = function() {
//        $scope.loading = true;
//        
//        PatientService.getRecent(50)
//            .then(function(response) {
//                $scope.loading = false;
//                if (response.data.success) {
//                    $scope.recentPatients = response.data.data;
//                } else {
//                    $scope.recentPatients = [];
//                }
//            })
//            .catch(function(error) {
//                $scope.loading = false;
//                $scope.recentPatients = [];
//                console.error('Error loading patients:', error);
//            });
//    };
//    
//    $scope.searchPatient = function() {
//        if (!$scope.searchQuery || $scope.searchQuery.trim() === '') {
//            $rootScope.showAlert('warning', 'Please enter PIN or contact number');
//            return;
//        }
//        
//        $scope.loading = true;
//        var query = $scope.searchQuery.trim();
//        
//        if (query.toUpperCase().startsWith('PIN')) {
//            PatientService.getByPin(query)
//                .then(handlePatientResponse)
//                .catch(function() { tryByContact(query); });
//        } else {
//            tryByContact(query);
//        }
//    };
//    
//    function tryByContact(query) {
//        PatientService.getByContact(query)
//            .then(handlePatientResponse)
//            .catch(function(error) {
//                $scope.loading = false;
//                $rootScope.showAlert('danger', 'Patient not found');
//            });
//    }
//    
//    function handlePatientResponse(response) {
//        $scope.loading = false;
//        if (response.data && response.data.success && response.data.data) {
//            $scope.patient = response.data.data;
//            $scope.appointment.pinNumber = $scope.patient.pinNumber;
//            $rootScope.showAlert('success', 'Patient found: ' + $scope.patient.fullName);
//        } else {
//            $rootScope.showAlert('warning', 'Patient not found');
//        }
//    }
//    
//    $scope.selectPatientFromList = function(patient) {
//        $scope.patient = patient;
//        $scope.appointment.pinNumber = patient.pinNumber;
//        $scope.searchQuery = patient.pinNumber;
//        $rootScope.showAlert('success', 'Patient selected: ' + patient.fullName);
//    };
//    
//    $scope.clearPatientSelection = function() {
//        $scope.patient = null;
//        $scope.appointment.pinNumber = '';
//        $scope.searchQuery = '';
//    };
//    
//    /**
//     * ==================== NAVIGATION ====================
//     */
//    $scope.nextStep = function() {
//        if ($scope.currentStep === 1) {
//            if (!$scope.patient) {
//                $rootScope.showAlert('warning', 'Please select a patient first');
//                return;
//            }
//            $scope.loadDepartments();
//        } else if ($scope.currentStep === 2) {
//            if (!$scope.selectedDoctor) {
//                $rootScope.showAlert('warning', 'Please select a doctor');
//                return;
//            }
//            // Load doctor schedules
//            $scope.loadDoctorSchedules();
//        } else if ($scope.currentStep === 3) {
//            if (!$scope.selectedSlot) {
//                $rootScope.showAlert('warning', 'Please select a time slot');
//                return;
//            }
//        }
//        
//        $scope.currentStep++;
//    };
//    
//    $scope.prevStep = function() {
//        $scope.currentStep--;
//    };
//    
//    /**
//     * ==================== STEP 2: DOCTOR SELECTION ====================
//     */
//    $scope.loadDepartments = function() {
//        DoctorService.getDepartments()
//            .then(function(response) {
//                if (response.data.success) {
//                    $scope.departments = response.data.data;
//                }
//            })
//            .catch(function(error) {
//                console.error('Error loading departments:', error);
//            });
//    };
//    
//    $scope.loadDoctors = function(department) {
//        if (!department) return;
//        
//        $scope.loading = true;
//        $scope.selectedDoctor = null;
//        
//        DoctorService.getAvailableByDepartment(department)
//            .then(function(response) {
//                $scope.loading = false;
//                if (response.data.success) {
//                    $scope.doctors = response.data.data;
//                } else {
//                    $scope.doctors = [];
//                }
//            })
//            .catch(function(error) {
//                $scope.loading = false;
//                $scope.doctors = [];
//            });
//    };
//    
//    $scope.selectDoctor = function(doctor) {
//        $scope.selectedDoctor = doctor;
//        $scope.appointment.doctorId = doctor.doctorId;
//    };
//    
//    /**
//     * ==================== STEP 3: SCHEDULE & SLOT SELECTION ====================
//     */
//    
//    /**
//     * Load Doctor's Active Schedules
//     */
//    $scope.loadDoctorSchedules = function() {
//        $scope.loading = true;
//        
//        DoctorService.getActiveSchedules($scope.appointment.doctorId)
//            .then(function(response) {
//                $scope.loading = false;
//                
//                if (response.data.success && response.data.data && response.data.data.length > 0) {
//                    $scope.doctorSchedules = response.data.data;
//                    $scope.generateAvailableDates();
//                    
//                    // Auto-select today if available
//                    var today = getTodayString();
//                    if ($scope.isDateAvailable(today)) {
//                        $scope.selectDate(today);
//                    }
//                } else {
//                    $scope.doctorSchedules = [];
//                    $scope.availableDates = [];
//                    $rootScope.showAlert('warning', 'Doctor has no active schedule!\n\nPlease create schedule first in Doctor Schedule Management.');
//                }
//            })
//            .catch(function(error) {
//                $scope.loading = false;
//                console.error('Error loading schedules:', error);
//                $rootScope.showAlert('danger', 'Error loading doctor schedules');
//            });
//    };
//    
//    /**
//     * Generate next 30 days where doctor has schedule
//     */
//    $scope.generateAvailableDates = function() {
//        $scope.availableDates = [];
//        var today = getTodayString();
//        
//        for (var i = 0; i < 30; i++) {
//            var dateStr = addDays(today, i);
//            var dayName = getDayName(dateStr);
//            
//            // Check if doctor has schedule for this day
//            var hasSchedule = $scope.doctorSchedules.some(function(s) {
//                return s.dayOfWeek === dayName && s.isActive;
//            });
//            
//            if (hasSchedule) {
//                $scope.availableDates.push({
//                    date: dateStr,
//                    dayName: dayName,
//                    displayDate: formatDateDisplay(dateStr)
//                });
//            }
//        }
//        
//        console.log('Available dates:', $scope.availableDates.length);
//    };
//    
//    function formatDateDisplay(dateStr) {
//        var d = new Date(dateStr + 'T00:00:00');
//        var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
//        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
//        return days[d.getDay()] + ', ' + d.getDate() + ' ' + months[d.getMonth()];
//    }
//    
//    $scope.isDateAvailable = function(dateStr) {
//        return $scope.availableDates.some(function(d) { return d.date === dateStr; });
//    };
//    
//    /**
//     * Select Date and Load Slots
//     */
//    $scope.selectDate = function(dateStr) {
//        console.log('========== DATE SELECTED ==========');
//        console.log('Selected date:', dateStr);
//        
//        $scope.selectedDate = dateStr;
//        $scope.appointment.appointmentDate = dateStr;
//        $scope.selectedSlot = null;
//        $scope.slots = [];
//        
//        // Load slots for this date
//        $scope.loadSlotsForDate(dateStr);
//    };
//    
//    /**
//     * Load Slots for Selected Date
//     */
//    $scope.loadSlotsForDate = function(dateStr) {
//        $scope.loading = true;
//        
//        console.log('========== LOADING SLOTS ==========');
//        console.log('Doctor:', $scope.appointment.doctorId);
//        console.log('Date:', dateStr);
//        
//        AppointmentService.getAvailableSlots($scope.appointment.doctorId, dateStr)
//            .then(function(response) {
//                $scope.loading = false;
//                
//                console.log('API Response:', response.data);
//                
//                if (response.data.success && response.data.data && response.data.data.length > 0) {
//                    // Filter slots for exact date
//                    $scope.slots = response.data.data.filter(function(slot) {
//                        return slot.slotDate === dateStr;
//                    });
//                    
//                    console.log('Filtered slots:', $scope.slots.length);
//                    
//                    if ($scope.slots.length === 0) {
//                        var generate = confirm('No slots generated for ' + dateStr + '\n\nGenerate slots now?');
//                        if (generate) {
//                            $scope.generateSlots();
//                        }
//                    }
//                } else {
//                    $scope.slots = [];
//                    var generate = confirm('No slots found for ' + dateStr + '\n\nGenerate slots now?');
//                    if (generate) {
//                        $scope.generateSlots();
//                    }
//                }
//            })
//            .catch(function(error) {
//                $scope.loading = false;
//                $scope.slots = [];
//                console.error('Error loading slots:', error);
//                
//                var generate = confirm('Error loading slots.\n\nGenerate new slots?');
//                if (generate) {
//                    $scope.generateSlots();
//                }
//            });
//    };
//    
//    $scope.generateSlots = function() {
//        $scope.loading = true;
//        
//        var slotData = {
//            doctorId: $scope.appointment.doctorId,
//            date: $scope.selectedDate
//        };
//        
//        console.log('Generating slots:', slotData);
//        
//        AppointmentService.generateSlots(slotData)
//            .then(function(response) {
//                $scope.loading = false;
//                
//                if (response.data.success && response.data.data) {
//                    $scope.slots = response.data.data;
//                    $rootScope.showAlert('success', 'Generated ' + $scope.slots.length + ' slots!');
//                } else {
//                    $rootScope.showAlert('danger', 'Failed to generate slots');
//                }
//            })
//            .catch(function(error) {
//                $scope.loading = false;
//                console.error('Error generating slots:', error);
//                $rootScope.showAlert('danger', 'Error generating slots');
//            });
//    };
//    
//    $scope.selectSlot = function(slot) {
//        if (!slot.isAvailable) {
//            $rootScope.showAlert('warning', 'This slot is already booked');
//            return;
//        }
//        
//        $scope.selectedSlot = slot;
//        $scope.appointment.slotId = slot.slotId;
//        $scope.appointment.appointmentTime = slot.slotTime;
//        $scope.appointment.appointmentDate = $scope.selectedDate;
//        
//        console.log('✅ Slot selected:', slot);
//    };
//    
//    $scope.formatSlotTime = function(slotTime) {
//        if (!slotTime) return '';
//        
//        if (typeof slotTime === 'string') {
//            return slotTime.length > 5 ? slotTime.substring(0, 5) : slotTime;
//        }
//        
//        if (typeof slotTime === 'object' && slotTime.hour !== undefined) {
//            return ('0' + slotTime.hour).slice(-2) + ':' + ('0' + slotTime.minute).slice(-2);
//        }
//        
//        return '';
//    };
//    
//    /**
//     * ==================== STEP 4: BOOK APPOINTMENT ====================
//     */
//    $scope.bookAppointment = function() {
//        if (!$scope.appointment.appointmentType) {
//            $rootScope.showAlert('warning', 'Please select appointment type');
//            return;
//        }
//        
//        if (!$scope.appointment.symptoms || $scope.appointment.symptoms.trim() === '') {
//            $rootScope.showAlert('warning', 'Please enter symptoms');
//            return;
//        }
//        
//        $scope.loading = true;
//        
//        AppointmentService.book($scope.appointment)
//            .then(function(response) {
//                if (response.data.success) {
//                    $scope.bookedAppointment = response.data.data;
//                    $rootScope.showAlert('success', 'Appointment booked! Token: ' + $scope.bookedAppointment.tokenNumber);
//                    $scope.createCVRAfterAppointment();
//                } else {
//                    $scope.loading = false;
//                    $rootScope.showAlert('danger', response.data.message || 'Booking failed');
//                }
//            })
//            .catch(function(error) {
//                $scope.loading = false;
//                console.error('Error booking:', error);
//                $rootScope.showAlert('danger', 'Error booking appointment');
//            });
//    };
//    
//    $scope.createCVRAfterAppointment = function() {
//        var cvrData = {
//            pinNumber: $scope.appointment.pinNumber,
//            visitType: $scope.appointment.appointmentType === 'Emergency' ? 'Emergency' : 'OPD',
//            chiefComplaint: $scope.appointment.symptoms,
//            symptoms: $scope.appointment.notes || $scope.appointment.symptoms,
//            department: $scope.selectedDoctor.department,
//            doctorId: $scope.appointment.doctorId,
//            createdBy: currentUser ? currentUser.username : '',
//            visitDate: $scope.appointment.appointmentDate,
//            visitTime: $scope.appointment.appointmentTime
//        };
//        
//        CVRService.create(cvrData)
//            .then(function(response) {
//                $scope.loading = false;
//                if (response.data.success) {
//                    $scope.createdCVR = response.data.data;
//                    $rootScope.showAlert('success', 'CVR created: ' + $scope.createdCVR.cvrNumber);
//                }
//            })
//            .catch(function(error) {
//                $scope.loading = false;
//                console.error('Error creating CVR:', error);
//            });
//    };
//    
//    /**
//     * ==================== UTILITY ====================
//     */
//    $scope.printAppointmentCard = function() {
//        window.print();
//    };
//    
//    $scope.cancel = function() {
//        if (confirm('Cancel booking?')) {
//            $location.path('/dashboard');
//        }
//    };
//    
//    // Initialize
//    $scope.loadRecentPatients();
//    
//    if ($scope.appointment.pinNumber) {
//        $scope.searchQuery = $scope.appointment.pinNumber;
//        $scope.searchPatient();
//    }
//}]);


/**
 * Appointment Booking Controller - WITH TIME VALIDATION
 * Shows slots only after date selection
 * Disables expired slots based on current time
 */

//app.controller('AppointmentBookingController', ['$scope', '$rootScope', '$location', '$routeParams',
//    'PatientService', 'CVRService', 'DoctorService', 'AppointmentService', 'AuthService',
//    function($scope, $rootScope, $location, $routeParams, PatientService, CVRService, DoctorService, 
//             AppointmentService, AuthService) {
//    
//    var currentUser = AuthService.getCurrentUser();
//    
//    // Booking Steps
//    $scope.currentStep = 1;
//    
//    // Data
//    $scope.patient = null;
//    $scope.recentPatients = [];
//    $scope.departments = [];
//    $scope.doctors = [];
//    $scope.selectedDoctor = null;
//    $scope.selectedDepartment = '';
//    $scope.availableDates = [];
//    
//    // Selected date as string (YYYY-MM-DD)
//    $scope.selectedDate = null;
//    $scope.minDate = getTodayString();
//    
//    $scope.slots = [];
//    $scope.selectedSlot = null;
//    
//    // Appointment Data
//    $scope.appointment = {
//        pinNumber: $routeParams.pinNumber || '',
//        doctorId: '',
//        appointmentDate: null,
//        appointmentTime: null,
//        slotId: null,
//        appointmentType: 'Consultation',
//        symptoms: '',
//        notes: '',
//        createdBy: currentUser ? currentUser.username : ''
//    };
//    
//    $scope.loading = false;
//    $scope.searchQuery = '';
//    $scope.bookedAppointment = null;
//    $scope.createdCVR = null;
//    
//    $scope.appointmentTypes = ['Consultation', 'Follow-up', 'Emergency', 'Routine Checkup'];
//    
//    /* -----------------------------------------------------------
//       HELPER FUNCTIONS
//       ----------------------------------------------------------- */
//    function getTodayString() {
//        var d = new Date();
//        return d.getFullYear() + '-' + 
//               ('0' + (d.getMonth() + 1)).slice(-2) + '-' + 
//               ('0' + d.getDate()).slice(-2);
//    }
//    
//    function getDayName(dateStr) {
//        if (!dateStr) return '';
//        var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
//        var d = new Date(dateStr + 'T00:00:00');
//        return days[d.getDay()];
//    }
//    
//    $scope.getDayName = getDayName;
//    
//    function formatDateDisplay(dateStr) {
//        if (!dateStr) return '';
//        var d = new Date(dateStr + 'T00:00:00');
//        var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
//        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
//        return days[d.getDay()] + ', ' + d.getDate() + ' ' + months[d.getMonth()];
//    }
//    
//    /**
//     * Check if slot time has expired (current time check)
//     * Returns true if slot is in the past
//     */
//    $scope.isSlotExpired = function(slotTime) {
//        if (!$scope.selectedDate || !slotTime) return false;
//        
//        var today = getTodayString();
//        
//        // If selected date is in the future, slot is not expired
//        if ($scope.selectedDate > today) {
//            return false;
//        }
//        
//        // If selected date is in the past, all slots are expired
//        if ($scope.selectedDate < today) {
//            return true;
//        }
//        
//        // Selected date is today - check time
//        var now = new Date();
//        var currentHours = now.getHours();
//        var currentMinutes = now.getMinutes();
//        
//        // Parse slot time
//        var slotTimeStr = $scope.formatSlotTime(slotTime);
//        var timeParts = slotTimeStr.split(':');
//        var slotHours = parseInt(timeParts[0], 10);
//        var slotMinutes = parseInt(timeParts[1], 10);
//        
//        // Compare time
//        if (slotHours < currentHours) {
//            return true; // Slot hour has passed
//        } else if (slotHours === currentHours && slotMinutes <= currentMinutes) {
//            return true; // Slot time has passed
//        }
//        
//        return false; // Slot is in the future
//    };
//    
//    /**
//     * ==================== STEP 1: PATIENT SELECTION ====================
//     */
//    
//    $scope.loadRecentPatients = function() {
//        $scope.loading = true;
//        
//        PatientService.getRecent(50)
//            .then(function(response) {
//                $scope.loading = false;
//                if (response.data.success) {
//                    $scope.recentPatients = response.data.data;
//                } else {
//                    $scope.recentPatients = [];
//                }
//            })
//            .catch(function(error) {
//                $scope.loading = false;
//                $scope.recentPatients = [];
//                console.error('Error loading patients:', error);
//            });
//    };
//    
//    $scope.searchPatient = function() {
//        if (!$scope.searchQuery || $scope.searchQuery.trim() === '') {
//            $rootScope.showAlert('warning', 'Please enter PIN or contact number');
//            return;
//        }
//        
//        $scope.loading = true;
//        var query = $scope.searchQuery.trim();
//        
//        if (query.toUpperCase().startsWith('PIN')) {
//            PatientService.getByPin(query)
//                .then(handlePatientResponse)
//                .catch(function() { tryByContact(query); });
//        } else {
//            tryByContact(query);
//        }
//    };
//    
//    function tryByContact(query) {
//        PatientService.getByContact(query)
//            .then(handlePatientResponse)
//            .catch(function(error) {
//                $scope.loading = false;
//                $rootScope.showAlert('danger', 'Patient not found');
//            });
//    }
//    
//    function handlePatientResponse(response) {
//        $scope.loading = false;
//        if (response.data && response.data.success && response.data.data) {
//            $scope.patient = response.data.data;
//            $scope.appointment.pinNumber = $scope.patient.pinNumber;
//            $rootScope.showAlert('success', 'Patient found: ' + $scope.patient.fullName);
//        } else {
//            $rootScope.showAlert('warning', 'Patient not found');
//        }
//    }
//    
//    $scope.selectPatientFromList = function(patient) {
//        $scope.patient = patient;
//        $scope.appointment.pinNumber = patient.pinNumber;
//        $scope.searchQuery = patient.pinNumber;
//        $rootScope.showAlert('success', 'Patient selected: ' + patient.fullName);
//    };
//    
//    $scope.clearPatientSelection = function() {
//        $scope.patient = null;
//        $scope.appointment.pinNumber = '';
//        $scope.searchQuery = '';
//    };
//    
//    /**
//     * ==================== NAVIGATION ====================
//     */
//    $scope.nextStep = function() {
//        if ($scope.currentStep === 1) {
//            if (!$scope.patient) {
//                $rootScope.showAlert('warning', 'Please select a patient first');
//                return;
//            }
//            $scope.loadDepartments();
//        } else if ($scope.currentStep === 2) {
//            if (!$scope.selectedDoctor) {
//                $rootScope.showAlert('warning', 'Please select a doctor');
//                return;
//            }
//            $scope.loadDoctorSchedules();
//        } else if ($scope.currentStep === 3) {
//            if (!$scope.selectedSlot) {
//                $rootScope.showAlert('warning', 'Please select a time slot');
//                return;
//            }
//        }
//        
//        $scope.currentStep++;
//    };
//    
//    $scope.prevStep = function() {
//        $scope.currentStep--;
//    };
//    
//    /**
//     * ==================== STEP 2: DOCTOR SELECTION ====================
//     */
//    $scope.loadDepartments = function() {
//        DoctorService.getDepartments()
//            .then(function(response) {
//                if (response.data.success) {
//                    $scope.departments = response.data.data;
//                }
//            })
//            .catch(function(error) {
//                console.error('Error loading departments:', error);
//            });
//    };
//    
//    $scope.loadDoctors = function(department) {
//        if (!department) return;
//        
//        $scope.loading = true;
//        $scope.selectedDoctor = null;
//        
//        DoctorService.getAvailableByDepartment(department)
//            .then(function(response) {
//                $scope.loading = false;
//                if (response.data.success) {
//                    $scope.doctors = response.data.data;
//                } else {
//                    $scope.doctors = [];
//                }
//            })
//            .catch(function(error) {
//                $scope.loading = false;
//                $scope.doctors = [];
//            });
//    };
//    
//    $scope.selectDoctor = function(doctor) {
//        $scope.selectedDoctor = doctor;
//        $scope.appointment.doctorId = doctor.doctorId;
//    };
//    
//    /**
//     * ==================== STEP 3: DATE & SLOT SELECTION ====================
//     */
//    
//    /**
//     * Load Doctor's Upcoming Schedules
//     */
//    $scope.loadDoctorSchedules = function() {
//        $scope.loading = true;
//        
//        console.log('========== LOADING DOCTOR SCHEDULES ==========');
//        console.log('Doctor ID:', $scope.appointment.doctorId);
//        
//        // Reset selections
//        $scope.selectedDate = null;
//        $scope.slots = [];
//        $scope.selectedSlot = null;
//        
//        DoctorService.getUpcomingSchedules($scope.appointment.doctorId, 30)
//            .then(function(response) {
//                $scope.loading = false;
//                
//                console.log('Schedules Response:', response.data);
//                
//                if (response.data.success && response.data.data && response.data.data.length > 0) {
//                    var schedules = response.data.data;
//                    
//                    $scope.availableDates = schedules
//                        .filter(function(schedule) {
//                            return schedule.isActive && schedule.scheduleDate;
//                        })
//                        .map(function(schedule) {
//                            return {
//                                date: schedule.scheduleDate,
//                                displayDate: formatDateDisplay(schedule.scheduleDate),
//                                dayName: getDayName(schedule.scheduleDate),
//                                schedule: schedule
//                            };
//                        });
//                    
//                    console.log('✅ Available Dates:', $scope.availableDates.length);
//                    
//                } else {
//                    $scope.availableDates = [];
//                    console.log('❌ No schedules found');
//                    $rootScope.showAlert('warning', 'Doctor has no scheduled dates!\n\nPlease create schedules first in Doctor Schedule Management.');
//                }
//            })
//            .catch(function(error) {
//                $scope.loading = false;
//                console.error('❌ Error loading schedules:', error);
//                $scope.availableDates = [];
//                
//                var errorMsg = 'Error loading doctor schedules';
//                if (error.data && error.data.message) {
//                    errorMsg = error.data.message;
//                }
//                $rootScope.showAlert('danger', errorMsg);
//            });
//    };
//    
//    /**
//     * Select Date and Load Slots
//     */
//    $scope.selectDate = function(dateStr) {
//        console.log('========== DATE SELECTED ==========');
//        console.log('Selected date:', dateStr);
//        
//        if (!dateStr || !dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
//            console.error('❌ Invalid date format:', dateStr);
//            $rootScope.showAlert('danger', 'Invalid date format');
//            return;
//        }
//        
//        $scope.selectedDate = dateStr;
//        $scope.appointment.appointmentDate = dateStr;
//        $scope.selectedSlot = null;
//        $scope.slots = [];
//        
//        // Load slots for this date
//        $scope.loadSlotsForDate(dateStr);
//    };
//    
//    /**
//     * Load Slots for Selected Date
//     */
//    $scope.loadSlotsForDate = function(dateStr) {
//        $scope.loading = true;
//        
//        console.log('========== LOADING SLOTS ==========');
//        console.log('Doctor:', $scope.appointment.doctorId);
//        console.log('Date:', dateStr);
//        
//        AppointmentService.getAvailableSlots($scope.appointment.doctorId, dateStr)
//            .then(function(response) {
//                $scope.loading = false;
//                
//                console.log('Slots API Response:', response.data);
//                
//                if (response.data.success && response.data.data && response.data.data.length > 0) {
//                    $scope.slots = response.data.data;
//                    
//                    console.log('✅ Loaded slots:', $scope.slots.length);
//                } else {
//                    $scope.slots = [];
//                    console.log('⚠️ No slots found for date:', dateStr);
//                    
//                    var generate = confirm(
//                        'No slots generated for ' + formatDateDisplay(dateStr) + 
//                        '\n\nGenerate slots now based on doctor\'s schedule?'
//                    );
//                    
//                    if (generate) {
//                        $scope.generateSlots();
//                    }
//                }
//            })
//            .catch(function(error) {
//                $scope.loading = false;
//                $scope.slots = [];
//                
//                console.error('❌ Error loading slots:', error);
//                
//                var errorMsg = 'Error loading slots';
//                if (error.data && error.data.message) {
//                    errorMsg = error.data.message;
//                }
//                
//                var generate = confirm(
//                    errorMsg + '\n\nGenerate new slots for ' + 
//                    formatDateDisplay(dateStr) + '?'
//                );
//                
//                if (generate) {
//                    $scope.generateSlots();
//                }
//            });
//    };
//    
//    /**
//     * Generate Slots for Selected Date
//     */
//    $scope.generateSlots = function() {
//        if (!$scope.selectedDate) {
//            $rootScope.showAlert('warning', 'Please select a date first');
//            return;
//        }
//        
//        $scope.loading = true;
//        
//        var slotData = {
//            doctorId: $scope.appointment.doctorId,
//            date: $scope.selectedDate
//        };
//        
//        console.log('========== GENERATING SLOTS ==========');
//        console.log('Slot Data:', slotData);
//        
//        AppointmentService.generateSlots(slotData)
//            .then(function(response) {
//                $scope.loading = false;
//                
//                console.log('Generate Slots Response:', response.data);
//                
//                if (response.data.success && response.data.data) {
//                    $scope.slots = response.data.data;
//                    
//                    console.log('✅ Generated slots:', $scope.slots.length);
//                    
//                    $rootScope.showAlert(
//                        'success', 
//                        'Generated ' + $scope.slots.length + ' slots for ' + 
//                        formatDateDisplay($scope.selectedDate) + '!'
//                    );
//                } else {
//                    var errorMsg = response.data.message || 'Failed to generate slots';
//                    console.error('❌ Failed:', errorMsg);
//                    $rootScope.showAlert('danger', errorMsg);
//                }
//            })
//            .catch(function(error) {
//                $scope.loading = false;
//                
//                console.error('❌ Error generating slots:', error);
//                
//                var errorMsg = 'Error generating slots';
//                if (error.data && error.data.message) {
//                    errorMsg = error.data.message;
//                }
//                
//                $rootScope.showAlert('danger', errorMsg);
//            });
//    };
//    
//    /**
//     * Select Slot
//     */
//    $scope.selectSlot = function(slot) {
//        if (!slot.isAvailable) {
//            $rootScope.showAlert('warning', 'This slot is already booked');
//            return;
//        }
//        
//        if ($scope.isSlotExpired(slot.slotTime)) {
//            $rootScope.showAlert('warning', 'This slot time has already passed');
//            return;
//        }
//        
//        $scope.selectedSlot = slot;
//        $scope.appointment.slotId = slot.slotId;
//        $scope.appointment.appointmentTime = slot.slotTime;
//        $scope.appointment.appointmentDate = $scope.selectedDate;
//        
//        console.log('✅ Slot selected:', {
//            slotId: slot.slotId,
//            time: slot.slotTime,
//            date: $scope.selectedDate
//        });
//    };
//    
//    /**
//     * Format Slot Time for Display
//     */
//    $scope.formatSlotTime = function(slotTime) {
//        if (!slotTime) return '';
//        
//        if (typeof slotTime === 'string') {
//            return slotTime.length > 5 ? slotTime.substring(0, 5) : slotTime;
//        }
//        
//        if (typeof slotTime === 'object' && slotTime.hour !== undefined) {
//            return ('0' + slotTime.hour).slice(-2) + ':' + ('0' + slotTime.minute).slice(-2);
//        }
//        
//        return '';
//    };
//    
//    /**
//     * ==================== STEP 4: BOOK APPOINTMENT ====================
//     */
////    $scope.bookAppointment = function() {
////        if (!$scope.appointment.appointmentType) {
////            $rootScope.showAlert('warning', 'Please select appointment type');
////            return;
////        }
////        
////        if (!$scope.appointment.symptoms || $scope.appointment.symptoms.trim() === '') {
////            $rootScope.showAlert('warning', 'Please enter symptoms');
////            return;
////        }
////        
////        console.log('========== BOOKING APPOINTMENT ==========');
////        console.log('Appointment Data:', $scope.appointment);
////        
////        $scope.loading = true;
////        
////        AppointmentService.book($scope.appointment)
////            .then(function(response) {
////                if (response.data.success) {
////                    $scope.bookedAppointment = response.data.data;
////                    
////                    console.log('✅ Appointment Booked:', $scope.bookedAppointment);
////                    
////                    $rootScope.showAlert(
////                        'success', 
////                        'Appointment booked! Token: ' + $scope.bookedAppointment.tokenNumber
////                    );
////                    
////                    $scope.createCVRAfterAppointment();
////                } else {
////                    $scope.loading = false;
////                    var errorMsg = response.data.message || 'Booking failed';
////                    console.error('❌ Booking failed:', errorMsg);
////                    $rootScope.showAlert('danger', errorMsg);
////                }
////            })
////            .catch(function(error) {
////                $scope.loading = false;
////                console.error('❌ Error booking:', error);
////                
////                var errorMsg = 'Error booking appointment';
////                if (error.data && error.data.message) {
////                    errorMsg = error.data.message;
////                }
////                
////                $rootScope.showAlert('danger', errorMsg);
////            });
////    };
////    
////    $scope.createCVRAfterAppointment = function() {
////        var cvrData = {
////            pinNumber: $scope.appointment.pinNumber,
////            visitType: $scope.appointment.appointmentType === 'Emergency' ? 'Emergency' : 'OPD',
////            chiefComplaint: $scope.appointment.symptoms,
////            symptoms: $scope.appointment.notes || $scope.appointment.symptoms,
////            department: $scope.selectedDoctor.department,
////            doctorId: $scope.appointment.doctorId,
////            createdBy: currentUser ? currentUser.username : '',
////            visitDate: $scope.appointment.appointmentDate,
////            visitTime: $scope.appointment.appointmentTime
////        };
////        
////        CVRService.create(cvrData)
////            .then(function(response) {
////                $scope.loading = false;
////                if (response.data.success) {
////                    $scope.createdCVR = response.data.data;
////                    console.log('✅ CVR Created:', $scope.createdCVR);
////                    $rootScope.showAlert('success', 'CVR created: ' + $scope.createdCVR.cvrNumber);
////                }
////            })
////            .catch(function(error) {
////                $scope.loading = false;
////                console.error('Error creating CVR:', error);
////            });
////    };
//    
//        /**
// * FIXED: CVR Creation After Appointment Booking
// * Key Changes:
// * 1. Remove visitDate and visitTime from CVR request (per implementation guide)
// * 2. Add appointmentId, appointmentDate, appointmentTime instead
// * 3. Fixed $scope.$apply() digest cycle errors
// * 4. Improved error handling
// */
//
//$scope.createCVRAfterAppointment = function () {
//    console.log('========== CREATING CVR ==========');
//    
//    // ✅ CORRECT: Use appointment details, NOT visit details
//    var cvrData = {
//        pinNumber: $scope.appointment.pinNumber,
//        visitType: $scope.appointment.appointmentType === 'Emergency' ? 'Emergency' : 'OPD',
//        chiefComplaint: $scope.appointment.symptoms,
//        symptoms: $scope.appointment.notes || $scope.appointment.symptoms,
//        department: $scope.selectedDoctor.department,
//        doctorId: $scope.appointment.doctorId,
//        createdBy: currentUser ? currentUser.username : 'system',
//        
//        // ✅ CRITICAL FIX: Send appointment details, NOT visit details
//        appointmentId: $scope.bookedAppointment.appointmentId,
//        appointmentDate: $scope.appointment.appointmentDate,
//        appointmentTime: $scope.appointment.appointmentTime
//        
//        // ❌ DO NOT SEND: visitDate and visitTime
//        // These will be set automatically during check-in
//    };
//
//    console.log('CVR Request Data:', JSON.stringify(cvrData, null, 2));
//
//    CVRService.create(cvrData)
//        .then(function (response) {
//            console.log('========== CVR RESPONSE ==========');
//            console.log('Response:', response.data);
//
//            // ✅ FIX: Check if we're already in $digest cycle
//            if ($scope.$$phase || $scope.$root.$$phase) {
//                // Already in digest, just update directly
//                handleCVRSuccess(response);
//            } else {
//                // Not in digest, safe to use $apply
//                $scope.$apply(function () {
//                    handleCVRSuccess(response);
//                });
//            }
//        })
//        .catch(function (error) {
//            console.error('========== CVR ERROR ==========');
//            console.error('Error:', error);
//
//            // ✅ FIX: Same digest cycle check for error case
//            if ($scope.$$phase || $scope.$root.$$phase) {
//                handleCVRError(error);
//            } else {
//                $scope.$apply(function () {
//                    handleCVRError(error);
//                });
//            }
//        });
//};
//
//// Separate handler functions to avoid duplicate code
//function handleCVRSuccess(response) {
//    if (response.data && response.data.success && response.data.data) {
//        $scope.createdCVR = response.data.data;
//        $scope.loading = false;
//
//        console.log('✅ CVR Created Successfully:', $scope.createdCVR);
//        console.log('CVR Number:', $scope.createdCVR.cvrNumber);
//        
//        // Update appointment with CVR details
//        if ($scope.bookedAppointment) {
//            $scope.bookedAppointment.cvrId = $scope.createdCVR.cvrId;
//            $scope.bookedAppointment.cvrNumber = $scope.createdCVR.cvrNumber;
//        }
//
//        $rootScope.showAlert('success', 'CVR created: ' + $scope.createdCVR.cvrNumber);
//    } else {
//        console.warn('⚠️ CVR Response not successful:', response.data);
//        $scope.loading = false;
//        $rootScope.showAlert('warning', 
//            'Appointment booked but CVR creation returned error: ' +
//            (response.data.message || 'Unknown error'));
//    }
//}
//
//function handleCVRError(error) {
//    $scope.loading = false;
//
//    var errorMsg = 'CVR creation failed';
//    
//    if (error.status === 503) {
//        errorMsg = 'CVR Service is currently unavailable. Please check if the service is running.';
//    } else if (error.data && error.data.message) {
//        errorMsg += ': ' + error.data.message;
//    } else if (error.status) {
//        errorMsg += ' (HTTP ' + error.status + ')';
//    }
//
//    console.error('Final Error Message:', errorMsg);
//
//    $rootScope.showAlert('warning',
//        'Appointment booked successfully! However, CVR creation failed. ' +
//        'Please create CVR manually from CVR Create page. Error: ' + errorMsg);
//}
//
//// ✅ ALSO UPDATE: The main booking function
//$scope.bookAppointment = function () {
//    if (!$scope.appointment.appointmentType) {
//        $rootScope.showAlert('warning', 'Please select appointment type');
//        return;
//    }
//
//    if (!$scope.appointment.symptoms || $scope.appointment.symptoms.trim() === '') {
//        $rootScope.showAlert('warning', 'Please enter symptoms');
//        return;
//    }
//
//    console.log('========== BOOKING APPOINTMENT ==========');
//    console.log('Appointment Data:', JSON.stringify($scope.appointment, null, 2));
//
//    $scope.loading = true;
//
//    AppointmentService.book($scope.appointment)
//        .then(function (response) {
//            console.log('========== APPOINTMENT RESPONSE ==========');
//            console.log('Response:', response.data);
//
//            if (response.data.success) {
//                $scope.bookedAppointment = response.data.data;
//
//                console.log('✅ Appointment Booked:', $scope.bookedAppointment);
//                console.log('Token Number:', $scope.bookedAppointment.tokenNumber);
//
//                $rootScope.showAlert(
//                    'success',
//                    'Appointment booked successfully! Token: ' + $scope.bookedAppointment.tokenNumber
//                );
//
//                // Check if backend already created CVR
//                if ($scope.bookedAppointment.cvrNumber) {
//                    console.log('✅ Backend already created CVR:', $scope.bookedAppointment.cvrNumber);
//                    $scope.createdCVR = {
//                        cvrNumber: $scope.bookedAppointment.cvrNumber,
//                        cvrId: $scope.bookedAppointment.cvrId
//                    };
//                    $scope.loading = false;
//                } else {
//                    // Try to create CVR from frontend
//                    console.log('Now creating CVR from frontend...');
//                    $scope.createCVRAfterAppointment();
//                }
//
//            } else {
//                $scope.loading = false;
//                var errorMsg = response.data.message || 'Booking failed';
//                console.error('❌ Booking failed:', errorMsg);
//                $rootScope.showAlert('danger', errorMsg);
//            }
//        })
//        .catch(function (error) {
//            $scope.loading = false;
//            console.error('========== APPOINTMENT ERROR ==========');
//            console.error('Error:', error);
//
//            var errorMsg = 'Error booking appointment';
//            if (error.data && error.data.message) {
//                errorMsg = error.data.message;
//            } else if (error.status) {
//                errorMsg += ' (HTTP ' + error.status + ')';
//            }
//
//            $rootScope.showAlert('danger', errorMsg);
//        });
//};
//
//// Manual CVR creation function
//$scope.createCVRManually = function () {
//    if (!$scope.bookedAppointment) {
//        $rootScope.showAlert('warning', 'No appointment data found');
//        return;
//    }
//
//    if (confirm('Create CVR for this appointment?\n\nAppointment Token: ' +
//            $scope.bookedAppointment.tokenNumber)) {
//        $scope.loading = true;
//        $scope.createCVRAfterAppointment();
//    }
//};
//
//// Book another appointment
//$scope.bookAnother = function () {
//    if (confirm('Start booking another appointment?\n\nCurrent booking details will be cleared.')) {
//        // Reset all form data
//        $scope.currentStep = 1;
//        $scope.patient = null;
//        $scope.selectedDoctor = null;
//        $scope.selectedDepartment = '';
//        $scope.selectedDate = null;
//        $scope.selectedSlot = null;
//        $scope.bookedAppointment = null;
//        $scope.createdCVR = null;
//        $scope.searchQuery = '';
//        $scope.slots = [];
//        $scope.availableDates = [];
//
//        $scope.appointment = {
//            pinNumber: '',
//            doctorId: '',
//            appointmentDate: null,
//            appointmentTime: null,
//            slotId: null,
//            appointmentType: 'Consultation',
//            symptoms: '',
//            notes: '',
//            createdBy: currentUser ? currentUser.username : ''
//        };
//
//        $rootScope.showAlert('info', 'Form reset. You can book another appointment.');
//        $scope.loadRecentPatients();
//    }
//};
//
//// Debug function
//$scope.debugState = function () {
//    console.log('========== DEBUG STATE ==========');
//    console.log('Current Step:', $scope.currentStep);
//    console.log('Patient:', $scope.patient);
//    console.log('Selected Doctor:', $scope.selectedDoctor);
//    console.log('Selected Date:', $scope.selectedDate);
//    console.log('Selected Slot:', $scope.selectedSlot);
//    console.log('Appointment Data:', $scope.appointment);
//    console.log('Booked Appointment:', $scope.bookedAppointment);
//    console.log('Created CVR:', $scope.createdCVR);
//    console.log('Loading:', $scope.loading);
//};
//
//
//    
//    
//    
//    /**
//     * ==================== UTILITY ====================
//     */
//    $scope.printAppointmentCard = function() {
//        window.print();
//    };
//    
//    $scope.cancel = function() {
//        if (confirm('Cancel booking?')) {
//            $location.path('/dashboard');
//        }
//    };
//    
//    // Initialize
//    $scope.loadRecentPatients();
//    
//    if ($scope.appointment.pinNumber) {
//        $scope.searchQuery = $scope.appointment.pinNumber;
//        $scope.searchPatient();
//    }
//}]);


//Testing 23/12/2025 

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
            $rootScope.showAlert('warning', 'Please enter PIN or contact number');
            return;
        }
        
        $scope.loading = true;
        var query = $scope.searchQuery.trim();
        
        if (query.toUpperCase().startsWith('PIN')) {
            PatientService.getByPin(query)
                .then(handlePatientResponse)
                .catch(function() { tryByContact(query); });
        } else {
            tryByContact(query);
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
        if (response.data && response.data.success && response.data.data) {
            $scope.patient = response.data.data;
            $scope.appointment.pinNumber = $scope.patient.pinNumber;
            $rootScope.showAlert('success', 'Patient found: ' + $scope.patient.fullName);
        } else {
            $rootScope.showAlert('warning', 'Patient not found');
        }
    }
    
    $scope.selectPatientFromList = function(patient) {
        $scope.patient = patient;
        $scope.appointment.pinNumber = patient.pinNumber;
        $scope.searchQuery = patient.pinNumber;
        $rootScope.showAlert('success', 'Patient selected: ' + patient.fullName);
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