/**
 * ============================================
 * PAYMENT HISTORY CONTROLLER 
 * ============================================
 */

app.controller('PaymentHistoryController', ['$scope', '$http', 'PatientService', 'DoctorService', 'BillingService', 'AppointmentService',
    function ($scope, $http, PatientService, DoctorService, BillingService, AppointmentService) {

        console.log("Payment History Controller Loaded");

        // Doctor & Date selection functionality
        $scope.doctorList = [];
        $scope.selectedDate = new Date(); // defaults to today
        $scope.paymentHistory = [];
        $scope.loading = false;
        $scope.patientVisits = [];
        $scope.selectedPatientInvoices = [];
        $scope.searchMode = "PATIENT";   // default mode
        $scope.filteredVisits = [];
        $scope.filteredInvoices = [];

        $scope.filter = {
            searchText: "",
            searchType: "PIN"
        };
        $scope.filteredVisits = [];
        $scope.filteredInvoices = [];

        // LOV Variables
        $scope.lovPatients = [];
        $scope.lovSearchQuery = '';
        $scope.lovCurrentPage = 1;
        $scope.lovPageSize = 5;
        $scope.lovTotalPages = 1;
        $scope.isLovLoading = false;


        $scope.applyFilters = function () {

            var text = ($scope.filter.searchText || '').toLowerCase();
            var type = $scope.filter.searchType;

            // =========================
            // FILTER PATIENT VISITS
            // =========================
            $scope.filteredVisits = ($scope.patientVisits || []).filter(function (v) {

                if (!text || type === 'ALL')
                    return true;

                switch (type) {

                    case 'PIN':
                        return v.pinNumber &&
                                v.pinNumber.toLowerCase().includes(text);

                    case 'NAME':
                        return v.patientName &&
                                v.patientName.toLowerCase().includes(text);

                    default:
                        return true;
                }
            });


            // =========================
            // FILTER INVOICES
            // =========================
            $scope.filteredInvoices = ($scope.selectedPatientInvoices || []).filter(function (inv) {

                if (!text || type === 'ALL')
                    return true;

                switch (type) {

                    case 'INVOICE':
                        return inv.invoiceNumber &&
                                inv.invoiceNumber.toLowerCase().includes(text);

                    case 'NAME':
                        return inv.patientName &&
                                inv.patientName.toLowerCase().includes(text);

                    case 'PIN':
                        return inv.pinNumber &&
                                inv.pinNumber.toLowerCase().includes(text);

                    default:
                        return true;
                }
            });

        };
        // Load doctors
        $scope.loadDoctors = function () {
            DoctorService.getActiveDoctors().then(
                    function (response) {
                        if (response.data.success) {
                            $scope.doctorList = response.data.data;
                            console.log("✅ Doctors loaded:", $scope.doctorList);
                        } else {
                            $scope.doctorList = [];
                            console.warn("⚠️ No doctors found");
                        }
                    },
                    function (error) {
                        $scope.doctorList = [];
                        console.error("❌ Error loading doctors", error);
                    }
            );
        };
        $scope.loadPaymentHistory = function () {
            // 🔎 DEBUG LOGS — ADD HERE
            console.log("Mode:", $scope.searchMode);
            console.log("Doctor:", $scope.selectedDoctor);
            console.log("SearchText:", $scope.filter.searchText);
            let params = [];

            // PATIENT MODE
            if ($scope.searchMode === "PATIENT") {

                // ✔ If user typed something → apply filter
                if ($scope.filter.searchText) {

                    if ($scope.filter.searchType === "INVOICE") {
                        params.push("invoiceNumber=" + encodeURIComponent($scope.filter.searchText));
                    } else {
                        // PIN search is default now
                        params.push("pin=" + encodeURIComponent($scope.filter.searchText));
                    }

                }
                // ✔ If nothing typed → load ALL payments
            }

            // DOCTOR MODE
            if ($scope.searchMode === "DOCTOR") {

                if (!$scope.selectedDoctor) {
                    alert("Select Doctor first");
                    return;
                }

                params.push("doctorId=" + encodeURIComponent($scope.selectedDoctor.doctorId));
                params.push("date=" + formatDate($scope.selectedDate));
            }

            let url = API_CONFIG.GATEWAY_URL + "/billing/payments/history";

            if (params.length > 0) {
                url += "?" + params.join("&");
            }

            console.log("Calling API:", url);

            $scope.loading = true;

            $http.get(url).then(function (response) {

                console.log("FULL RESPONSE:", response);
                console.log("DATA ARRAY:", response.data.data);

                // ✔ IMPORTANT FIX
                $scope.paymentHistory = response.data.data || [];

                $scope.attachInvoiceDetails();
                // ✔ If searched by invoice → show invoice directly
                if ($scope.searchMode === "PATIENT" && $scope.filter.searchType === "INVOICE") {

                    $scope.selectedPatientInvoices = angular.copy($scope.paymentHistory);
                    $scope.filteredInvoices = angular.copy($scope.paymentHistory);
                }
                $scope.loading = false;
            }).catch(function (error) {
                console.error("Error loading history", error);
                $scope.loading = false;
            });
        };
        function formatDate(date) {
            let d = new Date(date);
            let month = '' + (d.getMonth() + 1);
            let day = '' + d.getDate();
            let year = d.getFullYear();

            if (month.length < 2)
                month = '0' + month;
            if (day.length < 2)
                day = '0' + day;

            return [year, month, day].join('-');
        }

        // Watch for date changes
        $scope.$watch('selectedDate', function (newVal) {
            if (newVal) {
                console.log("Date selected:", newVal);
                $scope.message = "Date selected: " + newVal.toLocaleDateString();
            }
        });

        // Initialize doctors on page load
        $scope.loadDoctors();

        // Dummy message for testing

        $scope.message = "Payment History Page Working";
        $scope.$watch('selectedDoctor', function (newVal) {
            if (newVal) {
                console.log("Doctor selected:", newVal.doctorId);
            }
        });

//        $scope.attachInvoiceDetails = function () {
//            console.log("🔹 attachInvoiceDetails started, total payments:", $scope.paymentHistory.length);
//
//            angular.forEach($scope.paymentHistory, function (p, index) {
//                console.log("🔸 Payment #" + (index + 1), p);
//
//                if (!p.invoiceNumber)
//                    return;
//
//                BillingService.getInvoiceByNumber(p.invoiceNumber)
//                        .then(function (res) {
//                            if (res.data.success && res.data.data) {
//                                let invoice = res.data.data;
//
//                                // ✅ PIN
//                                p.pinNumber = invoice.pinNumber || '-';
//                                console.log("🔹 PIN:", p.pinNumber);
//                                p.paymentStatus = invoice.paymentStatus || 'UNKNOWN'; // ← Add this line
//                                // ✅ Fetch patient name
//                                if (invoice.pinNumber) {
//                                    PatientService.getByPin(invoice.pinNumber)
//                                            .then(ptRes => {
//                                                if (ptRes.data.success && ptRes.data.data) {
//                                                    let pt = ptRes.data.data;
//                                                    p.patientName = pt.firstName + ' ' + (pt.lastName || '');
//                                                    console.log("✅ Patient name:", p.patientName);
//                                                } else {
//                                                    p.patientName = 'Unknown';
//                                                }
//                                            })
//                                            .catch(() => {
//                                                p.patientName = 'Unknown';
//                                            });
//                                }
//
//                                // ✅ Fetch doctor name via appointment
//                                if (invoice.appointmentId) {
//                                    console.log("🔹 Fetching appointment for key:", invoice.appointmentId);
//                                    AppointmentService.getById(invoice.appointmentId)
//                                            .then(appRes => {
//                                                if (appRes.data.success && appRes.data.data) {
//                                                    let appointment = appRes.data.data;
//                                                    let doctorId = appointment.doctorId || appointment.doctor_id;
//
//                                                    if (doctorId) {
//                                                        DoctorService.getById(doctorId)
//                                                                .then(dRes => {
//                                                                    if (dRes.data.success && dRes.data.data) {
//                                                                        let doctor = dRes.data.data;
//                                                                        p.doctorName = 'Dr. ' + doctor.firstName + ' ' + (doctor.lastName || '');
//                                                                        console.log("✅ Doctor name:", p.doctorName);
//                                                                    } else {
//                                                                        p.doctorName = 'Dr. Unknown';
//                                                                    }
//                                                                })
//                                                                .catch(() => {
//                                                                    p.doctorName = 'Dr. Unknown';
//                                                                });
//                                                    } else {
//                                                        p.doctorName = 'Dr. Unknown';
//                                                    }
//                                                } else {
//                                                    p.doctorName = 'Dr. Unknown';
//                                                }
//                                            })
//                                            .catch(() => {
//                                                p.doctorName = 'Dr. Unknown';
//                                            });
//                                } else {
//                                    p.doctorName = 'Dr. Unknown';
//                                }
//                            }
//                        })
//                        .catch(err => {
//                            console.error("❌ Error fetching invoice:", err);
//                            p.patientName = 'Unknown';
//                            p.doctorName = 'Dr. Unknown';
//                        });
//            });
//        };

    $scope.attachInvoiceDetails = function () {

    console.log("🔹 attachInvoiceDetails started, total payments:", $scope.paymentHistory.length);

    let pending = $scope.paymentHistory.length;

    if (pending === 0) {
        $scope.buildPatientTableFromPayments();
        return;
    }

    angular.forEach($scope.paymentHistory, function (p, index) {

        console.log("🔸 Payment #" + (index + 1), p);

        if (!p.invoiceNumber) {
            pending--;
            return;
        }

        BillingService.getInvoiceByNumber(p.invoiceNumber)
            .then(function (res) {

                if (res.data.success && res.data.data) {

                    let invoice = res.data.data;

                    p.pinNumber = invoice.pinNumber || '-';
                    p.paymentStatus = invoice.paymentStatus || 'UNKNOWN';
                    p.cvrNumber = invoice.cvrNumber || '-';

                    console.log("🔹 PIN:", p.pinNumber);

                    // PATIENT NAME
                    if (invoice.pinNumber) {
                        return PatientService.getByPin(invoice.pinNumber)
                            .then(ptRes => {
                                if (ptRes.data.success && ptRes.data.data) {
                                    let pt = ptRes.data.data;
                                    p.patientName = pt.firstName + ' ' + (pt.lastName || '');
                                    console.log("✅ Patient name:", p.patientName);
                                } else {
                                    p.patientName = 'Unknown';
                                }
                            });
                    }
                }
            })

            .then(function () {

                // DOCTOR NAME
                if (!p.invoiceNumber) return;

                return BillingService.getInvoiceByNumber(p.invoiceNumber)
                    .then(function (res) {

                        let invoice = res.data.data;
                        if (!invoice || !invoice.appointmentId) return;

                        console.log("🔹 Fetching appointment:", invoice.appointmentId);

                        return AppointmentService.getById(invoice.appointmentId)
                            .then(appRes => {

                                let app = appRes.data.data;
                                if (!app) return;

                                let doctorId = app.doctorId || app.doctor_id;
                                if (!doctorId) return;

                                return DoctorService.getById(doctorId)
                                    .then(dRes => {
                                        let d = dRes.data.data;
                                        if (d) {
                                            p.doctorName = 'Dr. ' + d.firstName + ' ' + (d.lastName || '');
                                            console.log("✅ Doctor name:", p.doctorName);
                                        }
                                    });
                            });
                    });
            })

            .finally(function () {

                pending--;

                // ⭐ AFTER ALL PAYMENTS PROCESSED
                if (pending === 0) {
                    console.log("✅ All invoice details attached");
                    $scope.buildPatientTableFromPayments();
                    $scope.$applyAsync();
                }
            })

            .catch(err => {
                console.error("❌ Error:", err);
                pending--;
            });

    });
};

        $scope.buildPatientTableFromPayments = function () {

            console.log("🔁 Building patient table from payments");

            let patientMap = {};

            $scope.paymentHistory.forEach(function (p) {

                if (!p.pinNumber)
                    return;

                if (!patientMap[p.pinNumber]) {
                    patientMap[p.pinNumber] = {
                        pinNumber: p.pinNumber,
                        patientName: p.patientName || p.pinNumber
                    };
                }
            });

            $scope.patientVisits = Object.values(patientMap);
            $scope.filteredVisits = angular.copy($scope.patientVisits);

            console.log("✅ Patient table ready:", $scope.patientVisits);
        };
        $scope.loadPatients = function () {


            let doctorId = $scope.selectedDoctor.doctorId;
            let date = formatDate($scope.selectedDate);

            let url = API_CONFIG.GATEWAY_URL +
                    "/appointments/doctor/" +
                    doctorId + "/date/" + date;

            console.log("Loading patients:", url);

            $scope.loading = true;
            $scope.selectedPatientInvoices = [];

            $http.get(url).then(function (res) {

                $scope.patientVisits = res.data.data || [];
                $scope.filteredVisits = angular.copy($scope.patientVisits);
                let pending = $scope.patientVisits.length;   // ✅ ADD THIS
                console.log("Appointments received:", $scope.patientVisits);

                // 🔥 ADD THIS BLOCK
                angular.forEach($scope.patientVisits, function (visit) {

                    if (!visit.pinNumber)
                        return;

                    PatientService.getByPin(visit.pinNumber)
                            .then(function (ptRes) {

                                if (ptRes.data.success && ptRes.data.data) {
                                    let p = ptRes.data.data;
                                    visit.patientName =
                                            p.firstName + ' ' + (p.lastName || '');
                                } else {
                                    visit.patientName = visit.pinNumber;
                                }

                            })
                            .catch(function () {
                                visit.patientName = visit.pinNumber;
                            })
                            .finally(function () {

                                pending--;

                                // ✅ APPLY FILTER AFTER ALL NAMES LOAD
                                if (pending === 0) {
                                    $scope.filteredVisits =
                                            angular.copy($scope.patientVisits);
                                    $scope.applyFilters();
                                }
                            });
                });

                $scope.loading = false;

            }).catch(function (err) {
                console.error("Error loading patients", err);
                $scope.loading = false;
            });
        };
        $scope.viewInvoices = function (pinNumber) {

            console.log("Loading invoices for PIN:", pinNumber);
            $scope.activePatientPin = pinNumber;

            var url = API_CONFIG.GATEWAY_URL +
                    "/billing/invoices/patient/" + pinNumber;
            $http.get(url).then(function (res) {

                console.log("Invoices loaded:", res.data.data);

                $scope.selectedPatientInvoices = res.data.data || [];
                $scope.filteredInvoices = angular.copy($scope.selectedPatientInvoices);
                $scope.applyFilters();
            }, function (err) {
                console.error("Error loading invoices", err);
            });

        };
        
        $scope.closeInvoices = function () {
            $scope.activePatientPin = null;
            $scope.selectedPatientInvoices = [];
            $scope.filteredInvoices = [];
        };

        // LOV Functions
        $scope.openPatientLov = function() {
            $scope.lovSearchQuery = $scope.filter.searchText || '';
            $scope.lovPatients = [];
            $scope.lovCurrentPage = 1;
            $scope.lovTotalPages = 1;
            $scope.searchLovPatients();
        };

        $scope.searchLovPatients = function() {
            $scope.isLovLoading = true;
            var query = ($scope.lovSearchQuery || '').trim();
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
            }).catch(function() {
                $scope.isLovLoading = false;
                $scope.lovPatients = [];
                $scope.updateLovPagination();
            });
        };

        $scope.updateLovPagination = function() {
            $scope.lovCurrentPage = 1;
            $scope.lovTotalPages = Math.ceil($scope.lovPatients.length / $scope.lovPageSize) || 1;
        };
        $scope.prevLovPage = function() { if ($scope.lovCurrentPage > 1) $scope.lovCurrentPage--; };
        $scope.nextLovPage = function() { if ($scope.lovCurrentPage < $scope.lovTotalPages) $scope.lovCurrentPage++; };

        $scope.selectPatientFromModal = function(patient) {
            $scope.filter.searchType = 'PIN';
            $scope.filter.searchText = patient.pinNumber;
            if (window.jQuery) { $('#patientLovModal').modal('hide'); }
            $scope.applyFilters();
        };

        // Export to CSV function
        $scope.exportPaymentHistory = function() {
            var invoicesToExport = [];
            
            if ($scope.activePatientPin) {
                invoicesToExport = $scope.filteredInvoices;
            } else if ($scope.searchMode === 'PATIENT') {
                var activePins = $scope.filteredVisits.map(function(v) { return v.pinNumber; });
                invoicesToExport = $scope.paymentHistory.filter(function(p) {
                    return activePins.includes(p.pinNumber);
                });
            } else {
                invoicesToExport = $scope.paymentHistory;
            }

            if (!invoicesToExport || invoicesToExport.length === 0) {
                alert("No data available to export.");
                return;
            }

            var csvContent = "data:text/csv;charset=utf-8,";
            csvContent += "Invoice Number,CVR Number,PIN Number,Patient Name,Date,Amount,Status\r\n";

            invoicesToExport.forEach(function(row) {
                var invNo = row.invoiceNumber || '-';
                var cvr = row.cvrNumber || row.cvr_number || 'N/A';
                var pin = row.pinNumber || '-';
                var pName = (row.patientName || 'Unknown').replace(/,/g, ' ');
                var dt = row.invoiceDate || row.paymentDate || row.created_at || '-';
                if (dt !== '-') {
                    var d = new Date(dt);
                    if (!isNaN(d)) {
                        var timeStr = ("0"+d.getHours()).slice(-2) + ":" + ("0"+d.getMinutes()).slice(-2);
                        dt = [("0"+d.getDate()).slice(-2), ("0"+(d.getMonth()+1)).slice(-2), d.getFullYear()].join('-') + " " + timeStr;
                    }
                }
                var amt = parseFloat(row.totalAmount || 0).toFixed(2);
                var status = row.paymentStatus || 'UNKNOWN';

                csvContent += invNo + "," + cvr + "," + pin + "," + pName + "," + dt + "," + amt + "," + status + "\r\n";
            });

            var encodedUri = encodeURI(csvContent);
            var link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "payment_invoices_" + new Date().getTime() + ".csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        $scope.refreshPaymentHistory = function () {
            window.location.reload();
        };
        setTimeout(() => {
            $scope.buildPatientTableFromPayments();
            $scope.$applyAsync();
        }, 600);
        
        
    }]);