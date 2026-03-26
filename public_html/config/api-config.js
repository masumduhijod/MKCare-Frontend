//// API Configuration for all Microservices
//var API_CONFIG = {
//    // Gateway URL (All requests will go through this)
//    GATEWAY_URL: 'http://localhost:8080/api',
//    
//    // Individual Service URLs (for reference)
//    SERVICES: {
//        USER_SERVICE: 'http://localhost:8081',      // Port 8081
//        PATIENT_SERVICE: 'http://localhost:8084',   // Port 8084
//        CVR_SERVICE: 'http://localhost:8085',       // Port 8085
//        DOCTOR_SERVICE: 'http://localhost:8086',    // Port 8086
//        APPOINTMENT_SERVICE: 'http://localhost:8083', // Port 8083
//        OPD_SERVICE: 'http://localhost:8087',       // Port 8087
//        BILLING_SERVICE: 'http://localhost:8088'    // Port 8088
//    },
//    
//    // API Endpoints
//    ENDPOINTS: {
//        // ============ USER SERVICE (Port 8081) ============
//        AUTH: {
//            LOGIN: '/auth/login',
//            REGISTER: '/auth/register',
//            VALIDATE: '/auth/validate'
//        },
//        USER: {
//            GET_ALL: '/users',
//            GET_BY_USERNAME: '/users/{username}',
//            GET_BY_ROLE: '/users/role/{role}',
//            CHANGE_PASSWORD: '/users/{username}/change-password'
//        },
//        
//        // ============ PATIENT SERVICE (Port 8084) ============
//        PATIENT: {
//            REGISTER: '/patients/register',
//            GET_BY_ID: '/patients/{patientId}',
//            GET_BY_PIN: '/patients/pin/{pinNumber}',
//            GET_BY_CONTACT: '/patients/contact/{contactNumber}',
//            UPDATE: '/patients/{pinNumber}',
//            DELETE: '/patients/{pinNumber}',
//            SEARCH: '/patients/search',
//            GET_RECENT: '/patients/recent',
//            GET_ACTIVE: '/patients/active',
//            COUNT: '/patients/count',
//            EXISTS_BY_PIN: '/patients/exists/pin/{pinNumber}',
//            EXISTS_BY_CONTACT: '/patients/exists/contact/{contactNumber}',
//            GET_MEDICAL_HISTORY: '/patients/{pinNumber}/medical-history',
//            UPDATE_MEDICAL_HISTORY: '/patients/{pinNumber}/medical-history'
//        },
//        
//        // ============ CVR SERVICE (Port 8085) ============
//        CVR: {
//            CREATE: '/cvr/create',
//            GET_BY_CVR_NUMBER: '/cvr/{cvrNumber}',
//            DELETE: '/cvr/{cvrNumber}',
//            UPDATE_STATUS: '/cvr/{cvrNumber}/status',
//            CHECKIN: '/cvr/{cvrNumber}/checkin',
//            ASSIGN_DOCTOR: '/cvr/{cvrNumber}/assign-doctor',
//            START_CONSULTATION: '/cvr/{cvrNumber}/start-consultation',
//            COMPLETE_CONSULTATION: '/cvr/{cvrNumber}/complete-consultation',
//            GET_TODAY: '/cvr/today',
//            SEARCH: '/cvr/search',
//            GET_RECENT: '/cvr/recent',
//            GET_BY_DATE: '/cvr/date/{date}',
//            GET_BY_DOCTOR_DATE: '/cvr/doctor/{doctorId}/date/{date}',
//            GET_PATIENT_HISTORY: '/cvr/patient/{pinNumber}/history',
//            GET_PATIENT_COUNT: '/cvr/patient/{pinNumber}/count',
//            EXISTS: '/cvr/exists/{cvrNumber}',
//            RECORD_VITALS: '/cvr/vitals/record',
//            GET_VITALS: '/cvr/{cvrNumber}/vitals'
//        },
//        
//        // ============ DOCTOR SERVICE (Port 8086) ============
//        DOCTOR: {
//            REGISTER: '/doctors/register',
//            GET_BY_ID: '/doctors/{doctorId}',
//            UPDATE: '/doctors/{doctorId}',
//            DELETE: '/doctors/{doctorId}',
//            UPDATE_STATUS: '/doctors/{doctorId}/status',
//            SET_ON_LEAVE: '/doctors/{doctorId}/on-leave',
//            SET_AVAILABLE: '/doctors/{doctorId}/available',
//            SEARCH: '/doctors/search',
//            GET_ACTIVE: '/doctors/active',
//            GET_AVAILABLE: '/doctors/available',
//            GET_BY_SPECIALIZATION: '/doctors/specialization/{specialization}',
//            GET_BY_DEPARTMENT: '/doctors/department/{department}',
//            GET_AVAILABLE_BY_SPECIALIZATION: '/doctors/available/specialization/{specialization}',
//            GET_AVAILABLE_BY_DEPARTMENT: '/doctors/available/department/{department}',
//            GET_EMERGENCY: '/doctors/emergency',
//            GET_SPECIALIZATIONS: '/doctors/specializations',
//            GET_DEPARTMENTS: '/doctors/departments',
//            COUNT: '/doctors/count',
//            EXISTS: '/doctors/exists/{doctorId}'
//        },
//        DOCTOR_SCHEDULE: {
//            CREATE: '/doctors/{doctorId}/schedules',
//            GET_ALL: '/doctors/{doctorId}/schedules',
//            GET_BY_DAY: '/doctors/{doctorId}/schedules/{dayOfWeek}',
//            GET_ACTIVE: '/doctors/{doctorId}/schedules/active',
//            UPDATE: '/doctors/schedules/{scheduleId}',
//            DELETE: '/doctors/schedules/{scheduleId}',
//            TOGGLE: '/doctors/schedules/{scheduleId}/toggle',
//            GET_BY_DAY_ALL: '/doctors/schedules/day/{dayOfWeek}',
//            CHECK_AVAILABILITY: '/doctors/{doctorId}/availability/{dayOfWeek}'
//        },
//        
//        // ============ APPOINTMENT SERVICE (Port 8083) ============
//        APPOINTMENT: {
//            BOOK: '/appointments/book',
//            GET_BY_ID: '/appointments/{appointmentId}',
//            CANCEL: '/appointments/cancel',
//            RESCHEDULE: '/appointments/reschedule',
//            CHECKIN: '/appointments/{appointmentId}/checkin',
//            START_CONSULTATION: '/appointments/{appointmentId}/start-consultation',
//            COMPLETE_CONSULTATION: '/appointments/{appointmentId}/complete-consultation',
//            NO_SHOW: '/appointments/{appointmentId}/no-show',
//            GET_TODAY: '/appointments/today',
//            GET_BY_STATUS: '/appointments/status/{status}',
//            SEARCH: '/appointments/search',
//            GET_BY_DATE_RANGE: '/appointments/range',
//            GET_BY_PATIENT: '/appointments/patient/{pinNumber}',
//            GET_UPCOMING: '/appointments/patient/{pinNumber}/upcoming',
//            GET_BY_DOCTOR_DATE: '/appointments/doctor/{doctorId}/date/{date}',
//            EXISTS: '/appointments/exists/{appointmentId}'
//        },
//        SLOT: {
//            GENERATE: '/slots/generate',
//            GET_BY_DOCTOR_DATE: '/slots/doctor/{doctorId}/date/{date}',
//            GET_AVAILABLE: '/slots/doctor/{doctorId}/date/{date}/available',
//            GET_AVAILABILITY: '/slots/doctor/{doctorId}/date/{date}/availability',
//            MARK_UNAVAILABLE: '/slots/{slotId}/unavailable',
//            RELEASE: '/slots/{slotId}/release'
//        },
//        
//        // ============ OPD SERVICE (Port 8087) ============
//        OPD_QUEUE: {
//            ADD: '/opd/queue/add',
//            GET_BY_DOCTOR_DATE: '/opd/queue/doctor/{doctorId}/date/{date}',
//            START_CONSULTATION: '/opd/queue/{queueId}/start-consultation',
//            COMPLETE: '/opd/queue/{queueId}/complete',
//            CALL_NEXT: '/opd/queue/doctor/{doctorId}/date/{date}/call-next'
//        },
//        CONSULTATION: {
//            CREATE: '/opd/consultations/create',
//            GET_BY_ID: '/opd/consultations/{consultationId}',
//            GET_BY_PATIENT: '/opd/consultations/patient/{pinNumber}',
//            COMPLETE: '/opd/consultations/{consultationId}/complete'
//        },
//        PRESCRIPTION: {
//            CREATE: '/opd/prescriptions/create',
//            GET_BY_ID: '/opd/prescriptions/{prescriptionId}',
//            GET_BY_PATIENT: '/opd/prescriptions/patient/{pinNumber}'
//        },
//        
//        // ============ BILLING SERVICE (Port 8088) ============
//        INVOICE: {
//            CREATE: '/billing/invoices/create',
//            GET_BY_NUMBER: '/billing/invoices/{invoiceNumber}',
//            GET_PENDING: '/billing/invoices/pending',
//            GET_BY_PATIENT: '/billing/invoices/patient/{pinNumber}'
//        },
//        PAYMENT: {
//            PROCESS: '/billing/payments/process/{invoiceNumber}',
//            GET_BY_INVOICE: '/billing/payments/invoice/{invoiceNumber}'
//        }
//    }
//};

// API Configuration for all Microservices - DATE-BASED SCHEDULING
// Auto-detect server host: works on localhost AND network IP (mobile, other PCs)
var API_HOST = window.location.hostname; // e.g. 'localhost' or '192.168.1.11'
var API_GATEWAY_PORT = '8080';
var API_BASE = 'http://' + API_HOST + ':' + API_GATEWAY_PORT + '/api';

var API_CONFIG = {
    // Gateway URL (auto-detected from browser hostname)
    GATEWAY_URL: API_BASE,

    // Individual Service URLs (for reference)
    SERVICES: {
        USER_SERVICE: 'http://localhost:8081',
        PATIENT_SERVICE: 'http://localhost:8084',
        CVR_SERVICE: 'http://localhost:8085',
        DOCTOR_SERVICE: 'http://localhost:8086',
        APPOINTMENT_SERVICE: 'http://localhost:8083',
        OPD_SERVICE: 'http://localhost:8087',
        BILLING_SERVICE: 'http://localhost:8088'
    },

    // API Endpoints
    ENDPOINTS: {
        // ============ USER SERVICE (Port 8081) ============
        AUTH: {
            LOGIN: '/auth/login',
            REGISTER: '/auth/register',
            VALIDATE: '/auth/validate'
        },
        USER: {
            GET_ALL: '/users',
            GET_BY_USERNAME: '/users/{username}',
            GET_BY_ROLE: '/users/role/{role}',
            CHANGE_PASSWORD: '/users/{username}/change-password'
        },

        // ============ PATIENT SERVICE (Port 8084) ============
        PATIENT: {
            REGISTER: '/patients/register',
            GET_BY_ID: '/patients/{patientId}',
            GET_BY_PIN: '/patients/pin/{pinNumber}',
            GET_BY_CONTACT: '/patients/contact/{contactNumber}',
            UPDATE: '/patients/{pinNumber}',
            DELETE: '/patients/{pinNumber}',
            SEARCH: '/patients/search',
            GET_RECENT: '/patients/recent',
            GET_ACTIVE: '/patients/active',
            COUNT: '/patients/count',
            EXISTS_BY_PIN: '/patients/exists/pin/{pinNumber}',
            EXISTS_BY_CONTACT: '/patients/exists/contact/{contactNumber}',
            GET_MEDICAL_HISTORY: '/patients/{pinNumber}/medical-history',
            UPDATE_MEDICAL_HISTORY: '/patients/{pinNumber}/medical-history'
        },

        // ============ CVR SERVICE (Port 8085) ============
        CVR: {
            CREATE: '/cvr/create',
            GET_BY_CVR_NUMBER: '/cvr/{cvrNumber}',
            GET_BY_APPOINTMENT_ID: '/cvr/by-appointment/{appointmentId}',
            DELETE: '/cvr/{cvrNumber}',
            UPDATE_STATUS: '/cvr/{cvrNumber}/status',
            DELETE: '/cvr/{cvrNumber}',
            UPDATE_STATUS: '/cvr/{cvrNumber}/status',
            CHECKIN: '/cvr/{cvrNumber}/checkin',
            ASSIGN_DOCTOR: '/cvr/{cvrNumber}/assign-doctor',
            START_CONSULTATION: '/cvr/{cvrNumber}/start-consultation',
            COMPLETE_CONSULTATION: '/cvr/{cvrNumber}/complete-consultation',
            GET_TODAY: '/cvr/today',
            SEARCH: '/cvr/search',
            GET_RECENT: '/cvr/recent',
            GET_BY_DATE: '/cvr/date/{date}',
            GET_BY_DOCTOR_DATE: '/cvr/doctor/{doctorId}/date/{date}',
            GET_PATIENT_HISTORY: '/cvr/patient/{pinNumber}/history',
            GET_PATIENT_COUNT: '/cvr/patient/{pinNumber}/count',
            EXISTS: '/cvr/exists/{cvrNumber}',
            RECORD_VITALS: '/cvr/vitals/record',
            GET_VITALS: '/cvr/{cvrNumber}/vitals'
        },

        // ============ DOCTOR SERVICE (Port 8086) ============
        DOCTOR: {
            REGISTER: '/doctors/register',
            GET_BY_ID: '/doctors/{doctorId}',
            UPDATE: '/doctors/{doctorId}',
            DELETE: '/doctors/{doctorId}',
            UPDATE_STATUS: '/doctors/{doctorId}/status',
            SET_ON_LEAVE: '/doctors/{doctorId}/on-leave',
            SET_AVAILABLE: '/doctors/{doctorId}/available',
            SEARCH: '/doctors/search',
            GET_ACTIVE: '/doctors/active',
            GET_AVAILABLE: '/doctors/available',
            GET_BY_SPECIALIZATION: '/doctors/specialization/{specialization}',
            GET_BY_DEPARTMENT: '/doctors/department/{department}',
            GET_AVAILABLE_BY_SPECIALIZATION: '/doctors/available/specialization/{specialization}',
            GET_AVAILABLE_BY_DEPARTMENT: '/doctors/available/department/{department}',
            GET_EMERGENCY: '/doctors/emergency',
            GET_SPECIALIZATIONS: '/doctors/specializations',
            GET_DEPARTMENTS: '/doctors/departments',
            COUNT: '/doctors/count',
            EXISTS: '/doctors/exists/{doctorId}'
        },

        // ============ DOCTOR SCHEDULE - DATE-BASED (UPDATED) ============
        DOCTOR_SCHEDULE: {
            CREATE: '/doctors/{doctorId}/schedules',
            GET_ALL: '/doctors/{doctorId}/schedules',
            // UPDATED: Now uses scheduleDate instead of dayOfWeek
            GET_BY_DATE: '/doctors/{doctorId}/schedules/{scheduleDate}',
            GET_ACTIVE: '/doctors/{doctorId}/schedules/active',
            // NEW: Get upcoming schedules
            GET_UPCOMING: '/doctors/{doctorId}/schedules/upcoming',
            // NEW: Get schedules in date range
            GET_BY_RANGE: '/doctors/{doctorId}/schedules/range',
            UPDATE: '/doctors/schedules/{scheduleId}',
            DELETE: '/doctors/schedules/{scheduleId}',
            TOGGLE: '/doctors/schedules/{scheduleId}/toggle',
            // UPDATED: Check availability by date instead of day
            CHECK_AVAILABILITY: '/doctors/{doctorId}/availability/{scheduleDate}'
        },

        // ============ APPOINTMENT SERVICE (Port 8083) ============
        APPOINTMENT: {
            BOOK: '/appointments/book',
            GET_BY_ID: '/appointments/{appointmentId}',
            CANCEL: '/appointments/cancel',
            RESCHEDULE: '/appointments/reschedule',
            CHECKIN: '/appointments/{appointmentId}/checkin',
            START_CONSULTATION: '/appointments/{appointmentId}/start-consultation',
            COMPLETE_CONSULTATION: '/appointments/{appointmentId}/complete-consultation',
            NO_SHOW: '/appointments/{appointmentId}/no-show',
            GET_TODAY: '/appointments/today',
            GET_BY_STATUS: '/appointments/status/{status}',
            SEARCH: '/appointments/search',
            GET_BY_DATE_RANGE: '/appointments/range',
            GET_BY_PATIENT: '/appointments/patient/{pinNumber}',
            GET_UPCOMING: '/appointments/patient/{pinNumber}/upcoming',
            GET_BY_DOCTOR_DATE: '/appointments/doctor/{doctorId}/date/{date}',
            EXISTS: '/appointments/exists/{appointmentId}'
        },
        SLOT: {
            GENERATE: '/slots/generate',
            GET_BY_DOCTOR_DATE: '/slots/doctor/{doctorId}/date/{date}',
            GET_AVAILABLE: '/slots/doctor/{doctorId}/date/{date}/available',
            GET_AVAILABILITY: '/slots/doctor/{doctorId}/date/{date}/availability',
            MARK_UNAVAILABLE: '/slots/{slotId}/unavailable',
            RELEASE: '/slots/{slotId}/release'
        },

        // ============ OPD SERVICE (Port 8087) ============
        OPD_QUEUE: {
            ADD: '/opd/queue/add',
            GET_BY_DOCTOR_DATE: '/opd/queue/doctor/{doctorId}/date/{date}',
            START_CONSULTATION: '/opd/queue/{queueId}/start-consultation',
            COMPLETE: '/opd/queue/{queueId}/complete',
            CALL_NEXT: '/opd/queue/doctor/{doctorId}/date/{date}/call-next',
        },
        CONSULTATION: {
            CREATE: '/opd/consultations/create',
            GET_BY_ID: '/opd/consultations/{consultationId}',
            GET_BY_PATIENT: '/opd/consultations/patient/{pinNumber}',
            COMPLETE: '/opd/consultations/{consultationId}/complete',
            // ✅ NEW ENDPOINTS FOR EDIT/UPDATE/DELETE
            //            UPDATE: '/opd/consultations/{consultationId}/update',
            //            DELETE: '/opd/consultations/{consultationId}/delete',
            UPDATE: '/opd/consultations/{consultationId}',
            DELETE: '/opd/consultations/{consultationId}',
            GET_BY_DOCTOR_DATE: '/opd/consultations/by-doctor-date?doctorId={doctorId}&date={date}',

            SEARCH: '/opd/consultations/search',  // For LOV search
            GET_BY_CVR: '/opd/consultations/cvr/{cvrNumber}',
            GET_ALL: '/opd/consultations/all'  // With pagination
        },
        PRESCRIPTION: {
            CREATE: '/opd/prescriptions/create',
            GET_BY_ID: '/opd/prescriptions/{prescriptionId}',
            GET_BY_PATIENT: '/opd/prescriptions/patient/{pinNumber}',
            GET_BY_CONSULTATION: '/opd/prescriptions/consultation/{consultationId}', // ✅ ADD
            DELETE: '/opd/prescriptions/{prescriptionId}',  // ✅ ADD
            UPDATE: '/opd/prescriptions/{prescriptionId}'   // ✅ ADD THIS


        },

        // ============ BILLING SERVICE (Port 8088) ============
        INVOICE: {
            CREATE: '/billing/invoices/create',
            GET_BY_NUMBER: '/billing/invoices/{invoiceNumber}',
            GET_PENDING: '/billing/invoices/pending',
            GET_BY_PATIENT: '/billing/invoices/patient/{pinNumber}',
            GET_BY_CONSULTATION: '/billing/invoices/consultation/{consultationId}',
            GET_BY_CVR: '/billing/invoices/by-cvr/{cvrNumber}' // <-- New endpoint
        },
        PAYMENT: {
            PROCESS: '/billing/payments/process/{invoiceNumber}',
            GET_BY_INVOICE: '/billing/payments/invoice/{invoiceNumber}',
             HISTORY: '/billing/payments/history'  
        }
    }
};