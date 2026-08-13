/**
 * ============================================
 * APPLICATION ROUTES - UPDATED WITH REPORTS
 * ============================================
 * ✅ Added Reports Module route
 * ✅ Admin access to all modules
 * ✅ Better role management
 * ============================================
 */

app.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {

    $routeProvider
        // ============ Authentication ============
        .when('/login', {
            templateUrl: 'app/views/login.html',
            controller: 'LoginController'
        })

        // ============ Clinic-Specific Login (URL-based) ============
        .when('/clinic/:clinicCode', {
            templateUrl: 'app/views/login.html',
            controller: 'LoginController'
        })

        // ============ Super Admin ============
        .when('/superadmin/login', {
            templateUrl: 'app/views/superadmin/superadmin-login.html',
            controller: 'SuperAdminLoginController'
        })
        .when('/superadmin/dashboard', {
            templateUrl: 'app/views/superadmin/superadmin-dashboard.html',
            controller: 'SuperAdminDashboardController',
            requireAuth: true,
            roles: ['SUPER_ADMIN']
        })

        .when('/logout', {
            template: '',
            controller: ['$scope', '$location', function ($scope, $location) {
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
        .when('/user/role-master', {
            templateUrl: 'app/views/user/role-master.html',
            controller: 'RoleMasterController',
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
        .when('/patient/edit/:pinNumber', {
            templateUrl: 'app/views/patient/patient-registration.html',
            controller: 'PatientRegistrationController',
            requireAuth: true,
            roles: ['RECEPTIONIST', 'ADMIN']
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
            roles: ['NURSE', 'RECEPTIONIST', 'ADMIN', 'DOCTOR']
        })

        // ============ Doctor Management ============
        .when('/doctor/register', {
            templateUrl: 'app/views/doctor/doctor-registration.html',
            controller: 'DoctorRegistrationController',
            requireAuth: true,
            roles: ['ADMIN']
        })
        .when('/doctor/edit/:doctorId', {
            templateUrl: 'app/views/doctor/doctor-registration.html',
            controller: 'DoctorRegistrationController',
            requireAuth: true,
            roles: ['ADMIN', 'DOCTOR']
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

        .when('/opd/list', {
            templateUrl: 'app/views/opd/opd-list.html',
            controller: 'OPDListController',
            requireAuth: true,
            roles: ['DOCTOR', 'ADMIN']
        })

        .when('/consultation/room', {
            templateUrl: 'app/views/opd/consultation-room.html',
            controller: 'ConsultationRoomController',
            requireAuth: true,
            roles: ['DOCTOR', 'ADMIN']
        })

        .when('/consultation/room/:consultationId', {
            templateUrl: 'app/views/opd/consultation-room.html',
            controller: 'ConsultationRoomController',
            requireAuth: true,
            roles: ['DOCTOR', 'ADMIN']
        })

        .when('/prescription/create/:consultationId', {
            templateUrl: 'app/views/opd/prescription-create.html',
            controller: 'PrescriptionCreateController',
            requireAuth: true,
            roles: ['DOCTOR', 'ADMIN']
        })

        .when('/consultation/manage', {
            templateUrl: 'app/views/opd/consultation-management.html',
            controller: 'ConsultationManagementController',
            requireAuth: true,
            roles: ['DOCTOR', 'ADMIN']
        })

        // ============ Master Data ============
        .when('/master/medicine', {
            templateUrl: 'app/views/master/medicine-master.html',
            controller: 'MedicineMasterController',
            requireAuth: true,
            roles: ['ADMIN', 'DOCTOR']
        })

        // ============ Billing ============
        .when('/billing/invoice/create', {
            templateUrl: 'app/views/billing/invoice-create.html',
            controller: 'InvoiceCreateController',
            requireAuth: true,
            roles: ['DOCTOR', 'BILLING', 'RECEPTIONIST', 'ADMIN']
        })

        .when('/billing/invoice/create/:consultationId', {
            templateUrl: 'app/views/billing/invoice-create.html',
            controller: 'InvoiceCreateController',
            requireAuth: true,
            roles: ['DOCTOR', 'BILLING', 'RECEPTIONIST', 'ADMIN']
        })

        .when('/billing/invoice/list', {
            templateUrl: 'app/views/billing/invoice-list.html',
            controller: 'InvoiceListController',
            requireAuth: true,
            roles: ['BILLING', 'RECEPTIONIST', 'ADMIN', 'DOCTOR']
        })

        .when('/billing/invoice/:invoiceNumber', {
            templateUrl: 'app/views/billing/invoice-details.html',
            controller: 'InvoiceDetailsController',
            requireAuth: true
        })
                 // Change this path to avoid conflict
                .when('/billing/payment-history', {
                    templateUrl: 'app/views/billing/payment-history.html',
                    controller: 'PaymentHistoryController',
                    requireAuth: true,
                    roles: ['BILLING', 'RECEPTIONIST', 'ADMIN', 'DOCTOR']
                })
        .when('/billing/payment/:invoiceNumber', {
            templateUrl: 'app/views/billing/payment-processing.html',
            controller: 'PaymentProcessingController',
            requireAuth: true,
            roles: ['DOCTOR', 'BILLING', 'RECEPTIONIST', 'ADMIN']
        })

        // ============ Default Route ============

        // ============ Reports Module ============
        .when('/reports', {
            templateUrl: 'app/views/reports/reports-dashboard.html',
            controller: 'ReportsDashboardController',
            requireAuth: true,
            roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST', 'BILLING', 'NURSE']
        })
        // Patient Reports
        .when('/reports/patient-registration', {
            templateUrl: 'app/views/reports/patient-registration.html',
            controller: 'ReportPatientRegistrationController',
            requireAuth: true,
            roles: ['ADMIN', 'RECEPTIONIST']
        })
        .when('/reports/patient-demographics', {
            templateUrl: 'app/views/reports/patient-demographics.html',
            controller: 'ReportPatientDemographicsController',
            requireAuth: true,
            roles: ['ADMIN', 'DOCTOR']
        })
        .when('/reports/patient-visit-history', {
            templateUrl: 'app/views/reports/patient-visit-history.html',
            controller: 'ReportPatientVisitHistoryController',
            requireAuth: true,
            roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST']
        })
        .when('/reports/patient-case-file', {
            templateUrl: 'app/views/reports/patient-case-file.html',
            controller: 'ReportPatientCaseFileController',
            requireAuth: true,
            roles: ['ADMIN', 'DOCTOR']
        })
        // OPD Reports
        .when('/reports/opd-daily', {
            templateUrl: 'app/views/reports/opd-daily.html',
            controller: 'ReportOpdDailyController',
            requireAuth: true,
            roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST']
        })
        .when('/reports/opd-department', {
            templateUrl: 'app/views/reports/opd-department.html',
            controller: 'ReportOpdDeptController',
            requireAuth: true,
            roles: ['ADMIN', 'DOCTOR']
        })
        .when('/reports/cvr-summary', {
            templateUrl: 'app/views/reports/cvr-summary.html',
            controller: 'ReportCvrSummaryController',
            requireAuth: true,
            roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST', 'NURSE']
        })
        .when('/reports/prescriptions', {
            templateUrl: 'app/views/reports/prescriptions.html',
            controller: 'ReportPrescriptionController',
            requireAuth: true,
            roles: ['ADMIN', 'DOCTOR']
        })
        // Appointment Reports
        .when('/reports/appointment-schedule', {
            templateUrl: 'app/views/reports/appointment-schedule.html',
            controller: 'ReportAppointmentScheduleController',
            requireAuth: true,
            roles: ['ADMIN', 'RECEPTIONIST', 'DOCTOR']
        })
        .when('/reports/appointment-status', {
            templateUrl: 'app/views/reports/appointment-status.html',
            controller: 'ReportAppointmentStatusController',
            requireAuth: true,
            roles: ['ADMIN']
        })
        .when('/reports/doctor-availability', {
            templateUrl: 'app/views/reports/doctor-availability.html',
            controller: 'ReportDoctorAvailabilityController',
            requireAuth: true,
            roles: ['ADMIN', 'RECEPTIONIST', 'DOCTOR']
        })
        // Billing Reports
        .when('/reports/invoice-summary', {
            templateUrl: 'app/views/reports/invoice-summary.html',
            controller: 'ReportInvoiceSummaryController',
            requireAuth: true,
            roles: ['ADMIN', 'BILLING', 'RECEPTIONIST']
        })
        .when('/reports/payment-collection', {
            templateUrl: 'app/views/reports/payment-collection.html',
            controller: 'ReportPaymentCollectionController',
            requireAuth: true,
            roles: ['ADMIN', 'BILLING']
        })
        .when('/reports/outstanding-dues', {
            templateUrl: 'app/views/reports/outstanding-dues.html',
            controller: 'ReportOutstandingDuesController',
            requireAuth: true,
            roles: ['ADMIN', 'BILLING']
        })
        .when('/reports/revenue-analysis', {
            templateUrl: 'app/views/reports/revenue-analysis.html',
            controller: 'ReportRevenueAnalysisController',
            requireAuth: true,
            roles: ['ADMIN']
        })
        // Doctor Reports
        .when('/reports/doctor-consultation', {
            templateUrl: 'app/views/reports/doctor-consultation.html',
            controller: 'ReportDoctorConsultationController',
            requireAuth: true,
            roles: ['ADMIN', 'DOCTOR']
        })
        .when('/reports/doctor-schedule', {
            templateUrl: 'app/views/reports/doctor-schedule.html',
            controller: 'ReportDoctorScheduleController',
            requireAuth: true,
            roles: ['ADMIN', 'DOCTOR']
        })

        // ============ Default Route ============
        .otherwise({
            redirectTo: '/login'
        });
}]);

// ✅ ROUTE CHANGE LISTENER - BETTER ROLE MANAGEMENT
app.run(['$rootScope', '$location', function ($rootScope, $location) {
    $rootScope.$on('$routeChangeStart', function (event, next, current) {
        // Check if route requires authentication
        if (next.requireAuth) {
            var token = localStorage.getItem('authToken');
            if (!token) {
                event.preventDefault();
                $location.path('/login');
                return;
            }
        }

        // ✅ IMPROVED ROLE CHECK - ADMIN HAS ACCESS TO EVERYTHING
        if (next.roles && next.roles.length > 0) {
            var currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

            // ✅ ADMIN and SUPER_ADMIN have access to all routes
            if (currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN') {
                return; // Allow access
            }

            // Check if user's role is in allowed roles
            if (!currentUser.role || next.roles.indexOf(currentUser.role) === -1) {
                event.preventDefault();
                alert('⛔ Access Denied!\n\nYou do not have permission to access this page.\n\nRequired roles: ' + next.roles.join(', '));
                $location.path('/dashboard');
            }
        }
    });
}]);