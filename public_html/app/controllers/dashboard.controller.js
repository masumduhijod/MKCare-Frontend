/**
 * Dashboard Controller
 * - Today's Visits = CVRs + paid invoices (deduped by patient)
 * - Revenue Section: Daily / Monthly / Yearly collection
 *   ADMIN → all revenue; DOCTOR → only their revenue; Others → basic view
 */

app.controller('DashboardController', [
    '$scope', '$rootScope', '$http', 'PatientService', 'DoctorService',
    'AppointmentService', 'CVRService', 'BillingService', 'AuthService',
    function ($scope, $rootScope, $http, PatientService, DoctorService,
        AppointmentService, CVRService, BillingService, AuthService) {

        var base = API_CONFIG.GATEWAY_URL;

        function authHeaders() {
            return {
                'X-Tenant-ID': localStorage.getItem('tenantId') || '',
                'Authorization': 'Bearer ' + (localStorage.getItem('authToken') || '')
            };
        }

        // Current user
        $scope.currentUser = AuthService.getCurrentUser();
        $scope.userRole = $scope.currentUser ? $scope.currentUser.role : '';
        $scope.clinicLogo = localStorage.getItem('clinicLogo') || '';
        $scope.clinicName = localStorage.getItem('clinicName') || '';

        // ── Statistics ──
        $scope.stats = {
            totalPatients: 0,
            totalDoctors: 0,
            todayAppointments: 0,
            todayVisits: 0,   // CVRs + paid invoices (deduped)
            pendingConsultations: 0
        };

        // ── Revenue ──
        $scope.revenue = {
            daily: { amount: 0, count: 0 },
            monthly: { amount: 0, count: 0 },
            yearly: { amount: 0, count: 0 },
            transactions: [],   // detail rows for table
            chartLabels: [],
            chartData: []
        };

        $scope.loading = true;
        $scope.revenueLoading = false;
        $scope.revenueTab = 'daily';   // daily | monthly | yearly

        $scope.todayAppointments = [];
        $scope.todayCVRs = [];
        $scope.revenueError = '';

        // ═════════════════════════════════════════════
        //  HELPERS
        // ═════════════════════════════════════════════
        function today() { return new Date().toISOString().split('T')[0]; }
        $scope.currentDayOfMonth = new Date().getDate();  // for Avg/Day block
        function firstOfMonth() {
            var d = new Date();
            return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-01';
        }
        function firstOfYear() {
            return new Date().getFullYear() + '-01-01';
        }
        function pad(n) { return n < 10 ? '0' + n : '' + n; }

        function formatTime(t) {
            if (!t) return 'N/A';
            if (typeof t === 'string') return t.substring(0, 5);
            if (typeof t === 'object' && t.hour !== undefined) {
                return pad(t.hour) + ':' + pad(t.minute || 0);
            }
            return 'N/A';
        }

        $scope.getStatusClass = function (s) {
            return {
                SCHEDULED: 'bg-secondary', CHECKED_IN: 'bg-warning',
                IN_CONSULTATION: 'bg-primary', COMPLETED: 'bg-success',
                CANCELLED: 'bg-danger'
            }[s] || 'bg-secondary';
        };

        $scope.hasRole = function (roles) { return roles.indexOf($scope.userRole) !== -1; };

        // ═════════════════════════════════════════════
        //  LOAD DASHBOARD STATISTICS
        // ═════════════════════════════════════════════
        $scope.loadStatistics = function () {
            $scope.loading = true;
            var done = 0, total = 4;

            function tick() {
                done++;
                if (done >= total) {
                    $scope.loading = false;
                }
            }

            // 1. Patient count
            PatientService.getCount()
                .then(function (r) {
                    if (r.data && r.data.success) $scope.stats.totalPatients = r.data.data;
                }).catch(angular.noop).finally(tick);

            // 2. Doctor count
            DoctorService.getCount()
                .then(function (r) {
                    if (r.data && r.data.success) $scope.stats.totalDoctors = r.data.data;
                }).catch(angular.noop).finally(tick);

            // 3. Today's Appointments
            AppointmentService.getToday()
                .then(function (r) {
                    if (r.data && r.data.success && r.data.data) {
                        $scope.todayAppointments = r.data.data.map(function (a) {
                            return {
                                appointmentId: a.appointmentId,
                                tokenNumber: a.tokenNumber,
                                pinNumber: a.pinNumber || 'N/A',
                                patientName: a.patientName || 'Unknown',
                                doctorId: a.doctorId,
                                doctorName: a.doctorName || 'Dr. ' + (a.doctorId || '—'),
                                appointmentDate: a.appointmentDate,
                                appointmentTime: formatTime(a.appointmentTime),
                                status: a.status || 'Unknown',
                                appointmentType: a.appointmentType || 'Consultation',
                                cvrNumber: a.cvrNumber || null
                            };
                        });
                        $scope.stats.todayAppointments = $scope.todayAppointments.length;
                        $scope.loadNames();
                    }
                }).catch(angular.noop).finally(tick);

            // 4. Today's CVRs (visits)
            CVRService.getToday()
                .then(function (r) {
                    if (r.data && r.data.success && r.data.data) {
                        $scope.todayCVRs = r.data.data;
                    }
                    // Also count today's paid invoices → merge into visit count
                    $scope.loadTodayRevenue();
                }).catch(function () {
                    // CVR service failed - still try revenue, visit count will fallback to 0
                    $scope.loadTodayRevenue();
                }).finally(tick);

            // 5. Pending consultations (DOCTOR / ADMIN only)
            if ($scope.hasRole(['DOCTOR', 'ADMIN'])) {
                total++;
                AppointmentService.getByStatus('CHECKED_IN')
                    .then(function (r) {
                        if (r.data && r.data.success)
                            $scope.stats.pendingConsultations = r.data.data.length;
                    }).catch(angular.noop).finally(tick);
            }
        };

        // ─── Resolve correct doctorId ───────────────
        $scope.getDoctorIdAsync = function(callback) {
            if ($scope.userRole !== 'DOCTOR' || !$scope.currentUser) {
                callback(null);
                return;
            }
            if ($scope.currentUser.doctorId) {
                callback($scope.currentUser.doctorId);
                return;
            }
            DoctorService.getActiveDoctors().then(function(res) {
                var docs = res.data.data || [];
                var myDoctor = docs.find(function(d) {
                    return (d.userId && d.userId == $scope.currentUser.userId) ||
                           (d.email && d.email === $scope.currentUser.email) || 
                           (d.username && d.username === $scope.currentUser.username) ||
                           (d.contactNumber && d.contactNumber === $scope.currentUser.contactNumber) ||
                           (d.doctorId === $scope.currentUser.username) ||
                           (d.fullName && $scope.currentUser.fullName && d.fullName.toLowerCase().trim() === $scope.currentUser.fullName.toLowerCase().trim());
                });
                if (myDoctor) {
                    console.log("✅ getDoctorIdAsync FOUND MATCH:", myDoctor.doctorId);
                    $scope.currentUser.doctorId = myDoctor.doctorId; // Cache
                    callback(myDoctor.doctorId);
                } else {
                    console.warn("❌ getDoctorIdAsync FAILED TO MATCH. Falling back to:", $scope.currentUser.username || $scope.currentUser.userId);
                    console.warn("User data was:", $scope.currentUser);
                    console.warn("Available doctors:", docs);
                    callback($scope.currentUser.username || $scope.currentUser.userId);
                }
            }).catch(function() {
                callback($scope.currentUser.username || $scope.currentUser.userId);
            });
        };

        // ─── Load today's revenue + update visit count ───────────────
        $scope.loadTodayRevenue = function () {
            $scope.revenueLoading = true;
            $scope.revenueError = '';

            $scope.getDoctorIdAsync(function(doctorId) {
                var dailyParams = { fromDate: today(), toDate: today() };
                var monthlyParams = { fromDate: firstOfMonth(), toDate: today() };
                var yearlyParams = { fromDate: firstOfYear(), toDate: today() };

                if (doctorId) {
                    dailyParams.doctorId = doctorId;
                    monthlyParams.doctorId = doctorId;
                    yearlyParams.doctorId = doctorId;
                }

                // ── Daily (also drives visit count + transaction table + chart) ──
                $http.get(base + '/reports/billing/payment-collection', {
                    params: dailyParams,
                    headers: authHeaders()
                }).then(function (res) {
                    var d = (res.data && res.data.data) ? res.data.data : {};

                    // totalCollected comes as BigDecimal → serialised as number by Jackson
                    $scope.revenue.daily.amount = parseFloat(d.totalCollected) || 0;
                    $scope.revenue.daily.count = parseInt(d.totalPayments, 10) || 0;

                    // Payments list for visit-count and transaction table
                    var paidToday = (d.payments && Array.isArray(d.payments)) ? d.payments : [];

                    // ── Today's Visits: CVRs + paid payments deduped by PIN ──
                    updateVisitCount(paidToday);

                    // ── Transaction table (latest 50) ──
                    $scope.revenue.transactions = paidToday.slice(0, 50).map(function (p) {
                        return {
                            paymentId: p.paymentId || '—',
                            patientName: p.patientName || p.pinNumber || '—',
                            pinNumber: p.pinNumber || '—',
                            invoiceNo: p.invoiceNumber || '—',
                            amount: parseFloat(p.amount) || 0,
                            mode: p.paymentMode || '—',
                            date: p.paymentDate ? new Date(p.paymentDate) : null
                        };
                    });

                    // Build chart using today's payment list
                    buildChart(paidToday);
                    
                    // Fetch actual patient names instead of PIN fallback
                    loadTransactionNames();

                }).catch(function (err) {
                    console.warn('[Dashboard] Daily revenue error:', err && err.status, err && err.data);
                    $scope.revenueError = 'Revenue data unavailable (billing service). Showing visit count from CVR data.';

                    // ── FALLBACK: Even if billing fails, count visits from CVRs ──
                    updateVisitCount([]);

                    // Show empty chart
                    buildChart([]);
                });

                // ── Monthly ──
                $http.get(base + '/reports/billing/payment-collection', {
                    params: monthlyParams,
                    headers: authHeaders()
                }).then(function (res) {
                    var d = (res.data && res.data.data) ? res.data.data : {};
                    $scope.revenue.monthly.amount = parseFloat(d.totalCollected) || 0;
                    $scope.revenue.monthly.count = parseInt(d.totalPayments, 10) || 0;
                }).catch(function (err) {
                    console.warn('[Dashboard] Monthly revenue error:', err && err.status);
                });

                // ── Yearly ──
                $http.get(base + '/reports/billing/payment-collection', {
                    params: yearlyParams,
                    headers: authHeaders()
                }).then(function (res) {
                    var d = (res.data && res.data.data) ? res.data.data : {};
                    $scope.revenue.yearly.amount = parseFloat(d.totalCollected) || 0;
                    $scope.revenue.yearly.count = parseInt(d.totalPayments, 10) || 0;
                }).catch(function (err) {
                    console.warn('[Dashboard] Yearly revenue error:', err && err.status);
                }).finally(function () {
                    $scope.revenueLoading = false;
                });
            });
        };



        // ─── Calculate today's visit count (CVRs + paid payments deduped) ────
        function updateVisitCount(paidToday) {
            var visitPins = {};
            angular.forEach($scope.todayCVRs, function (c) {
                if (c.pinNumber) visitPins[c.pinNumber] = true;
            });
            angular.forEach(paidToday || [], function (p) {
                if (p.pinNumber) visitPins[p.pinNumber] = true;
            });

            var uniquePinCount = Object.keys(visitPins).length;
            if (uniquePinCount > 0) {
                $scope.stats.todayVisits = uniquePinCount;
            } else {
                // Fallback: CVR count alone
                $scope.stats.todayVisits = $scope.todayCVRs.length;
            }
        }

        // ─── Build simple bar chart data over last 7 days ────────────
        function buildChart(payments) {
            var dayBuckets = {};
            for (var i = 6; i >= 0; i--) {
                var d = new Date();
                d.setDate(d.getDate() - i);
                var label = (d.getMonth() + 1) + '/' + d.getDate();
                dayBuckets[label] = 0;
            }
            payments.forEach(function (p) {
                if (!p.paymentDate) return;
                var d = new Date(p.paymentDate);
                var label = (d.getMonth() + 1) + '/' + d.getDate();
                if (dayBuckets[label] !== undefined) {
                    dayBuckets[label] += (p.amount || 0);
                }
            });
            $scope.revenue.chartLabels = Object.keys(dayBuckets);
            $scope.revenue.chartData = Object.values(dayBuckets);

            // Render chart after digest
            setTimeout(renderRevenueChart, 200);
        }

        // ─── Plot a simple canvas bar chart ──────────────────────────
        function renderRevenueChart() {
            var canvas = document.getElementById('revenueBarChart');
            if (!canvas) return;
            var ctx = canvas.getContext('2d');
            var labels = $scope.revenue.chartLabels;
            var data = $scope.revenue.chartData;
            var w = canvas.width = canvas.parentElement.clientWidth || 400;
            var h = canvas.height = 180;

            ctx.clearRect(0, 0, w, h);
            if (!data.length) {
                ctx.fillStyle = '#aaa';
                ctx.font = '13px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('No data', w / 2, h / 2);
                return;
            }

            var max = Math.max.apply(null, data) || 1;
            var pad = 40;
            var barW = Math.max(20, (w - pad * 2) / labels.length - 8);
            var chartH = h - 50;

            // Gradient bars
            labels.forEach(function (label, i) {
                var val = data[i] || 0;
                var barH = (val / max) * chartH;
                var x = pad + i * ((w - pad * 2) / labels.length);
                var y = h - 30 - barH;

                var grad = ctx.createLinearGradient(0, y, 0, h - 30);
                grad.addColorStop(0, '#0288d1');
                grad.addColorStop(1, 'rgba(2,136,209,0.3)');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.roundRect(x, y, barW, barH, 4);
                ctx.fill();

                // Label
                ctx.fillStyle = '#555';
                ctx.font = '10px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(label, x + barW / 2, h - 12);

                // Value
                if (val > 0) {
                    ctx.fillStyle = '#0288d1';
                    ctx.font = 'bold 10px sans-serif';
                    ctx.fillText('₹' + (val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val), x + barW / 2, y - 4);
                }
            });

            // Y-axis line
            ctx.strokeStyle = '#e0e0e0';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(pad - 5, 10);
            ctx.lineTo(pad - 5, h - 30);
            ctx.stroke();
        }

        // ─── Load patient/doctor names for appointments ───────────────
        $scope.loadNames = function () {
            angular.forEach($scope.todayAppointments, function (a) {
                PatientService.getByPin(a.pinNumber).then(function (r) {
                    if (r.data && r.data.success && r.data.data)
                        a.patientName = r.data.data.firstName + ' ' + r.data.data.lastName;
                });
                DoctorService.getById(a.doctorId).then(function (r) {
                    if (r.data && r.data.success && r.data.data)
                        a.doctorName = 'Dr. ' + r.data.data.firstName + ' ' + r.data.data.lastName;
                }).catch(function () { a.doctorName = 'Dr. Unknown'; });
            });
        };

        // ─── Load actual patient names for transactions ────────────────
        function loadTransactionNames() {
            angular.forEach($scope.revenue.transactions, function (t) {
                if (t.patientName === t.pinNumber && t.pinNumber && t.pinNumber !== '—') {
                    PatientService.getByPin(t.pinNumber).then(function (r) {
                        if (r.data && r.data.success && r.data.data) {
                            var name = r.data.data.firstName || '';
                            if (r.data.data.lastName) name += ' ' + r.data.data.lastName;
                            t.patientName = name.trim();
                        }
                    });
                }
            });
        }

        // ═════════════════════════════════════════════
        //  QUICK ACTIONS
        // ═════════════════════════════════════════════
        $scope.registerPatient = function () { window.location.href = '#!/patient/register'; };
        $scope.bookAppointment = function () { window.location.href = '#!/appointment/book'; };
        $scope.createCVR = function () { window.location.href = '#!/cvr/create'; };
        $scope.viewQueue = function () { window.location.href = '#!/opd/queue'; };

        $scope.refreshStats = function () {
            $scope.loadStatistics();
            $rootScope.showAlert('info', 'Dashboard refreshed');
        };

        $scope.setRevenueTab = function (tab) {
            $scope.revenueTab = tab;
        };

        // ═════════════════════════════════════════════
        //  INIT
        // ═════════════════════════════════════════════
        console.log('DashboardController init, user:', $scope.currentUser);
        
        function initGreeting() {
            var h = new Date().getHours();
            if (h < 12) {
                $scope.greeting = "Good Morning";
                $scope.energyMessage = "Rise and shine! Ready to make a positive impact today? 🚀";
            } else if (h < 17) {
                $scope.greeting = "Good Afternoon";
                $scope.energyMessage = "Keep up the great energy! You're doing amazing today. ⚡";
            } else if (h < 21) {
                $scope.greeting = "Good Evening";
                $scope.energyMessage = "Hope your day was successful. Wrapping things up smoothly. 🌅";
            } else {
                $scope.greeting = "Good Night";
                $scope.energyMessage = "You've worked hard today. Get some rest and recharge! 🌙";
            }
            $scope.currentDate = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            $scope.currentDayOfMonth = new Date().getDate();
        }
        initGreeting();
        
        $scope.loadStatistics();
    }
]);