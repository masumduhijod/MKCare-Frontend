/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/**
 * Application Routes Configuration
 */

/**
 * Application Routes Configuration
 * UPDATED: Added User Registration Route
 */

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    
    $routeProvider
        // ============ Authentication ============
        .when('/login', {
            templateUrl: 'app/views/login.html',
            controller: 'LoginController'
        })
        
        .when('/logout', {
            template: '',
            controller: ['$scope', '$location', function($scope, $location) {
                // Clear auth
                localStorage.removeItem('authToken');
                localStorage.removeItem('currentUser');
                $location.path('/login');
            }]
        })
        
        // ============ Dashboard ============
        .when('/dashboard', {
            templateUrl: 'app/views/dashboard.html',
            controller: 'DashboardController',
            requireAuth: true
        })
        
        // ============ User Management (Admin Only) ============
        .when('/user/register', {
            templateUrl: 'app/views/user/user-registration.html',
            controller: 'UserRegistrationController',
            requireAuth: true,
            roles: ['ADMIN']
        })
        .when('/user/list', {
            templateUrl: 'app/views/user/user-list.html',
            controller: 'UserListController',
            requireAuth: true,
            roles: ['ADMIN']
        })
        
        // ============ Patient Management ============
        .when('/patient/register', {
            templateUrl: 'app/views/patient/patient-registration.html',
            controller: 'PatientRegistrationController',
            requireAuth: true,
            roles: ['RECEPTIONIST', 'ADMIN']
        })
        .when('/patient/list', {
            templateUrl: 'app/views/patient/patient-list.html',
            controller: 'PatientListController',
            requireAuth: true,
            roles: ['RECEPTIONIST', 'DOCTOR', 'ADMIN']
        })
        .when('/patient/details/:pinNumber', {
            templateUrl: 'app/views/patient/patient-details.html',
            controller: 'PatientDetailsController',
            requireAuth: true
        })
        
        // ============ CVR Management ============
        .when('/cvr/create', {
            templateUrl: 'app/views/cvr/cvr-create.html',
            controller: 'CVRCreateController',
            requireAuth: true,
            roles: ['RECEPTIONIST', 'NURSE', 'ADMIN']
        })
        .when('/cvr/vitals/:cvrNumber', {
            templateUrl: 'app/views/cvr/vitals-recording.html',
            controller: 'VitalsRecordingController',
            requireAuth: true,
            roles: ['NURSE', 'RECEPTIONIST', 'ADMIN']
        })
        
        // ============ Doctor Management ============
        .when('/doctor/register', {
            templateUrl: 'app/views/doctor/doctor-registration.html',
            controller: 'DoctorRegistrationController',
            requireAuth: true,
            roles: ['ADMIN']
        })
        .when('/doctor/list', {
            templateUrl: 'app/views/doctor/doctor-list.html',
            controller: 'DoctorListController',
            requireAuth: true
        })
        .when('/doctor/schedule/:doctorId', {
            templateUrl: 'app/views/doctor/doctor-schedule.html',
            controller: 'DoctorScheduleController',
            requireAuth: true,
            roles: ['ADMIN', 'DOCTOR']
        })
        
        // ============ Appointment Management ============
        .when('/appointment/book', {
            templateUrl: 'app/views/appointment/appointment-booking.html',
            controller: 'AppointmentBookingController',
            requireAuth: true,
            roles: ['RECEPTIONIST', 'ADMIN']
        })
        .when('/appointment/list', {
            templateUrl: 'app/views/appointment/appointment-list.html',
            controller: 'AppointmentListController',
            requireAuth: true
        })
        
        // ============ OPD Management ============
        .when('/opd/queue', {
            templateUrl: 'app/views/opd/queue-management.html',
            controller: 'QueueManagementController',
            requireAuth: true,
            roles: ['DOCTOR', 'RECEPTIONIST', 'ADMIN']
        })
        .when('/consultation/room', {
            templateUrl: 'app/views/opd/consultation-room.html',
            controller: 'ConsultationRoomController',
            requireAuth: true,
            roles: ['DOCTOR']
        })
        .when('/prescription/create/:consultationId', {
            templateUrl: 'app/views/opd/prescription-create.html',
            controller: 'PrescriptionCreateController',
            requireAuth: true,
            roles: ['DOCTOR']
        })
        
        // ============ Billing Management ============
        .when('/billing/invoice/create', {
            templateUrl: 'app/views/billing/invoice-create.html',
            controller: 'InvoiceCreateController',
            requireAuth: true,
            roles: ['BILLING', 'ADMIN']
        })
        .when('/billing/payment', {
            templateUrl: 'app/views/billing/payment-processing.html',
            controller: 'PaymentProcessingController',
            requireAuth: true,
            roles: ['BILLING', 'ADMIN']
        })
        
        // ============ Default Route ============
        .otherwise({
            redirectTo: '/login'
        });
}]);

// Route change listener for authentication check
app.run(['$rootScope', '$location', function($rootScope, $location) {
    $rootScope.$on('$routeChangeStart', function(event, next, current) {
        // Check if route requires authentication
        if (next.requireAuth) {
            var token = localStorage.getItem('authToken');
            if (!token) {
                event.preventDefault();
                $location.path('/login');
            }
        }
        
        // Check if user has required role
        if (next.roles && next.roles.length > 0) {
            var currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            if (!currentUser.role || next.roles.indexOf(currentUser.role) === -1) {
                event.preventDefault();
                alert('Access Denied: You do not have permission to access this page.');
                $location.path('/dashboard');
            }
        }
    });
}]);