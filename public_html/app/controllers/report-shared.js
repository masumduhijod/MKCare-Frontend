/**
 * Report Shared Directives & LOV System  (v4.0)
 * ─────────────────────────────────────────────
 *  clinicPrintHeader  → Left: Logo (tenant-based) | Center: Clinic | Right: User + Page
 *  pinLov             → Patient PIN search
 *  cvrLov             → CVR Number search  (with patientName, visitDate, doctorName)
 *  invoiceLov         → Invoice search      (uses /billing/invoices endpoints)
 *  doctorLov          → Doctor search       (uses /doctors/active endpoint)
 *
 *  FIXES v4.0:
 *   1. Logo selected by tenantId: HMS001 → HMIS logo, APOLLO001 → Apollo logo
 *   2. Table column headers now dark/bold (not light)
 *   3. PIN LOV  → correct /patients/search endpoint + shows fullName
 *   4. CVR LOV  → shows patientName, visitDate, doctorName correctly
 *   5. Invoice LOV → uses /billing/invoices/pending + fallback
 *   6. Doctor LOV  → uses /doctors/active (correct endpoint)
 *   7. All LOVs show error details in modal for easier debugging
 */

// ═══════════════════════════════════════════════════════════
// SHARED HELPERS
// ═══════════════════════════════════════════════════════════
function extractList(d) {
    if (!d) return [];
    if (d.data && Array.isArray(d.data.content)) return d.data.content;
    if (d.data && Array.isArray(d.data)) return d.data;
    if (Array.isArray(d.content)) return d.content;
    if (Array.isArray(d)) return d;
    return [];
}

function filterList(list, q, fields) {
    if (!q) return list;
    var ql = q.toLowerCase();
    return list.filter(function (item) {
        return fields.some(function (f) {
            return item[f] && String(item[f]).toLowerCase().indexOf(ql) !== -1;
        });
    });
}

// ═══════════════════════════════════════════════════════════
// BOOTSTRAP MODAL HELPERS
// ═══════════════════════════════════════════════════════════
function openBsModal(id) {
    var el = document.getElementById(id);
    if (!el) { console.error('[LOV] Modal not found:', id); return; }
    bootstrap.Modal.getOrCreateInstance(el).show();
}
function closeBsModal(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var m = bootstrap.Modal.getInstance(el);
    if (m) m.hide();
}

// ═══════════════════════════════════════════════════════════
// LOV HEADER STYLES  (dark, readable column headers)
// ═══════════════════════════════════════════════════════════
var LOV_TH_BLUE = 'background:linear-gradient(135deg,#1a3a6b,#2563eb);color:#fff;border:none;padding:10px 12px;font-size:12px;font-weight:600;';
var LOV_TH_GREEN = 'background:linear-gradient(135deg,#065f46,#059669);color:#fff;border:none;padding:10px 12px;font-size:12px;font-weight:600;';
var LOV_TH_AMBER = 'background:linear-gradient(135deg,#78350f,#d97706);color:#fff;border:none;padding:10px 12px;font-size:12px;font-weight:600;';
var LOV_TH_TEAL = 'background:linear-gradient(135deg,#0f766e,#14b8a6);color:#fff;border:none;padding:10px 12px;font-size:12px;font-weight:600;';

// ═══════════════════════════════════════════════════════════
// CLINIC PRINT HEADER DIRECTIVE
// ═══════════════════════════════════════════════════════════
/**
 * Logo logic (priority order):
 *  1. clinicLogo in localStorage (base64 or URL uploaded at login)
 *  2. tenantId based: HMS001 → hmis-logo.png  |  APOLLO001 → apollo-logo.png
 *  3. Any value containing 'apollo' in tenantId → apollo logo
 *  4. Fallback → hmis-logo.png
 */
app.directive('clinicPrintHeader', ['$timeout', function ($timeout) {
    return {
        restrict: 'E',
        scope: { reportTitle: '@' },
        template: [
            '<div class="clinic-print-header" id="clinicPrintHeaderEl">',
            '  <div class="clinic-header-inner">',

            /* ── LEFT: Logo ── */
            '    <div style="flex:0 0 90px;display:flex;align-items:center;justify-content:center">',
            '      <img ng-if="cLogo" ng-src="{{cLogo}}" class="clinic-header-logo"',
            '           alt="Logo" style="max-height:72px;max-width:80px;object-fit:contain">',
            '      <div ng-if="!cLogo" class="clinic-header-logo-placeholder">',
            '        <i class="fas fa-hospital" style="font-size:2.5rem;color:#1a3a6b"></i>',
            '      </div>',
            '    </div>',

            /* ── CENTER: Clinic Info ── */
            '    <div class="clinic-header-info">',
            '      <h2>{{cName}}</h2>',
            '      <p ng-if="cAddress"><i class="fas fa-map-marker-alt me-1"></i>{{cAddress}}</p>',
            '      <p ng-if="cPhone"><i class="fas fa-phone me-1"></i>{{cPhone}}</p>',
            '      <p ng-if="cEmail"><i class="fas fa-envelope me-1"></i>{{cEmail}}</p>',
            '    </div>',

            /* ── RIGHT: User + Page ── */
            '    <div class="clinic-header-user">',
            '      <div class="user-name"><i class="fas fa-user-circle me-1"></i>{{uName}}</div>',
            '      <div><span class="user-role">{{uRole}}</span></div>',
            '      <div class="print-date">{{pDate}}</div>',
            '      <div class="clinic-header-page">Page <span class="page-number"></span></div>',
            '    </div>',

            '  </div>',
            '  <div class="report-print-title">{{reportTitle}}</div>',
            '</div>'
        ].join(''),
        link: function (scope) {
            // Clinic info from localStorage
            scope.cName = localStorage.getItem('clinicName') || 'Hospital Management System';
            scope.cAddress = localStorage.getItem('clinicAddress') || '';
            scope.cPhone = localStorage.getItem('clinicPhone') || '';
            scope.cEmail = localStorage.getItem('clinicEmail') || '';

            // ── LOGO SELECTION: tenantId takes priority ──
            var storedLogo = localStorage.getItem('clinicLogo') || '';
            var tenantId = (localStorage.getItem('tenantId') || '').toUpperCase();

            if (storedLogo) {
                scope.cLogo = storedLogo;
            } else if (tenantId.indexOf('APOLLO') !== -1) {
                scope.cLogo = 'assets/images/apollo-logo.png';
            } else if (tenantId.indexOf('HMS') !== -1 || tenantId.indexOf('HMIS') !== -1) {
                scope.cLogo = 'assets/images/hmis-logo.png';
            } else {
                // Fallback: check clinic name
                var name = (scope.cName || '').toLowerCase();
                scope.cLogo = (name.indexOf('apollo') !== -1)
                    ? 'assets/images/apollo-logo.png'
                    : 'assets/images/hmis-logo.png';
            }

            // User info
            var u = localStorage.getItem('currentUser');
            var user = u ? JSON.parse(u) : {};
            scope.uName = user.fullName || user.username || '';
            scope.uRole = user.role || '';
            scope.pDate = 'Printed: ' + new Date().toLocaleString('en-IN', {
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        }
    };
}]);


// ═══════════════════════════════════════════════════════════
// SHARED printReport HELPER
// ═══════════════════════════════════════════════════════════
app.run(['$rootScope', '$window', function ($rootScope, $window) {
    $rootScope.doPrint = function (titleText) {
        var screenView = document.querySelector('.report-screen-view');
        if (!screenView) {
            window.print();
            return;
        }

        var printDoc = screenView.cloneNode(true);
        
        // Remove existing print header as we use the new template's header
        var header = printDoc.querySelector('clinic-print-header');
        if (header) header.remove();
        
        // Remove print footers or buttons
        var noPrintElems = printDoc.querySelectorAll('.report-print-footer, button, a.btn');
        noPrintElems.forEach(function(el) { el.remove(); });

        // Un-hide no-print summary cards & format them for printing
        var statCardsRow = printDoc.querySelector('.row.g-3');
        if (statCardsRow) {
            statCardsRow.classList.remove('no-print');
            var statCards = statCardsRow.querySelectorAll('.stat-card');
            statCards.forEach(function(sc) {
                // Clear all classes and just style it inline so it prints with white bg
                sc.className = 'stat-card';
                sc.style.border = '1px solid #cbd5e1';
                sc.style.borderRadius = '8px';
                sc.style.padding = '15px';
                sc.style.textAlign = 'center';
                sc.style.marginBottom = '15px';
                sc.style.backgroundColor = '#f8fafc';
                sc.style.color = '#000';
                
                var num = sc.querySelector('.stat-number');
                if(num) { num.style.fontSize = '24px'; num.style.fontWeight = 'bold'; num.style.color = '#1a3a6b'; }
                var lbl = sc.querySelector('.stat-label');
                if(lbl) { lbl.style.fontSize = '12px'; lbl.style.textTransform = 'uppercase'; }
            });
        }
        
        // Unhide meta info (Period: Date to Date)
        var metaSection = printDoc.querySelector('.d-flex.justify-content-between.align-items-center.mb-3.no-print');
        if (metaSection) {
            metaSection.classList.remove('no-print');
        }

        var tableResp = printDoc.querySelector('.report-table-responsive');
        if (tableResp) {
            var table = tableResp.querySelector('table');
            if (table) {
                table.style.width = '100%';
                table.style.borderCollapse = 'collapse';
                var ths = table.querySelectorAll('th');
                ths.forEach(function(th) {
                    th.style.backgroundColor = '#e2e8f0';
                    th.style.color = '#1e293b';
                    th.style.padding = '10px';
                    th.style.border = '1px solid #cbd5e1';
                    th.style.fontSize = '0.9rem';
                });
                var tds = table.querySelectorAll('td');
                tds.forEach(function(td) {
                    td.style.padding = '8px';
                    td.style.border = '1px solid #cbd5e1';
                    td.style.fontSize = '0.95rem';
                });
            }
        }

        var contentHtml = printDoc.innerHTML;
        var currentUser = localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')) : null;

        var titleEl = document.querySelector('.report-print-title');
        var actualTitle = titleText || (titleEl ? titleEl.innerText : 'Report');

        var printData = {
            reportTitle: actualTitle,
            clinicName: localStorage.getItem('clinicName') || 'Hospital Management System',
            clinicLogo: localStorage.getItem('clinicLogo') || '',
            clinicAddress: localStorage.getItem('clinicAddress') || 'N/A',
            clinicPhone: localStorage.getItem('clinicPhone') || 'N/A',
            loginName: currentUser ? (currentUser.fullName || currentUser.username) : 'Admin',
            role: currentUser ? currentUser.role : '',
            dateTime: new Date().toLocaleString(),
            contentHtml: contentHtml
        };

        localStorage.setItem('printReportData', JSON.stringify(printData));
        $window.open('print-report.html', '_blank');
    };
}]);


// ═══════════════════════════════════════════════════════════
// PIN LOV DIRECTIVE
// Endpoint: GET /patients/search?query=<q>
// ═══════════════════════════════════════════════════════════
app.directive('pinLov', ['$http', '$timeout', function ($http, $timeout) {
    var counter = 0;
    return {
        restrict: 'E',
        scope: { model: '=', onSelect: '&' },
        link: function (scope, element) {
            counter++;
            var id = 'pinLovModal_' + counter;
            scope.displayVal = '';

            element.html([
                '<div class="input-group input-group-sm">',
                '  <input type="text" class="form-control lov-display-input" readonly',
                '         style="cursor:pointer;background:#f8f9fa;border-right:0"',
                '         placeholder="PIN — click to search patient">',
                '  <button class="btn btn-outline-secondary lov-clear-btn" type="button"',
                '          style="display:none;border-right:0" title="Clear">',
                '    <i class="fas fa-times text-danger"></i>',
                '  </button>',
                '  <button class="btn btn-primary lov-search-btn" type="button">',
                '    <i class="fas fa-search me-1"></i>Patient',
                '  </button>',
                '</div>'
            ].join(''));

            var modalHtml = [
                '<div class="modal fade" id="' + id + '" tabindex="-1">',
                '  <div class="modal-dialog modal-xl modal-dialog-scrollable">',
                '    <div class="modal-content">',
                '      <div class="modal-header" style="background:linear-gradient(135deg,#1a3a6b,#2563eb);color:white">',
                '        <h5 class="modal-title"><i class="fas fa-user-injured me-2"></i>Patient Search — Select PIN</h5>',
                '        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>',
                '      </div>',
                '      <div class="modal-body" style="background:#f8faff">',
                '        <div class="input-group mb-3">',
                '          <span class="input-group-text bg-white"><i class="fas fa-search text-primary"></i></span>',
                '          <input type="text" class="form-control lov-qinput" placeholder="Search by PIN, Name or Contact...">',
                '        </div>',
                '        <div class="lov-loading text-center py-4" style="display:none">',
                '          <div class="spinner-border text-primary"></div><p class="mt-2 text-muted small">Searching patients...</p>',
                '        </div>',
                '        <div class="lov-empty text-center text-muted py-5" style="display:none">',
                '          <i class="fas fa-user-slash fa-3x mb-2 d-block opacity-50"></i><p>No patients found</p>',
                '        </div>',
                '        <div class="lov-table-wrap" style="background:white;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)">',
                '          <table class="table table-bordered table-hover align-middle mb-0">',
                '            <thead><tr>',
                '              <th style="' + LOV_TH_BLUE + '">PIN</th>',
                '              <th style="' + LOV_TH_BLUE + '">Full Name</th>',
                '              <th style="' + LOV_TH_BLUE + '">Age / Gender</th>',
                '              <th style="' + LOV_TH_BLUE + '">Contact</th>',
                '              <th style="' + LOV_TH_BLUE + '">Blood Group</th>',
                '              <th style="' + LOV_TH_BLUE + '">Status</th>',
                '              <th style="' + LOV_TH_BLUE + '">Action</th>',
                '            </tr></thead>',
                '            <tbody class="lov-tbody"></tbody>',
                '          </table>',
                '        </div>',
                '      </div>',
                '      <div class="modal-footer" style="background:#f0f4ff">',
                '        <span class="text-muted small me-auto lov-count"></span>',
                '        <button class="btn btn-secondary btn-sm" data-bs-dismiss="modal"><i class="fas fa-times me-1"></i>Cancel</button>',
                '      </div>',
                '    </div>',
                '  </div>',
                '</div>'
            ].join('');

            var $modalEl = angular.element(modalHtml);
            angular.element(document.body).append($modalEl);

            var $trigger = angular.element(element[0]);
            var $input = $trigger.find('.lov-display-input');
            var $clearBtn = $trigger.find('.lov-clear-btn');
            var $searchBtn = $trigger.find('.lov-search-btn');
            var $qInput = $modalEl.find('.lov-qinput');
            var $loading = $modalEl.find('.lov-loading');
            var $empty = $modalEl.find('.lov-empty');
            var $tbody = $modalEl.find('.lov-tbody');
            var $count = $modalEl.find('.lov-count');
            var $tableWrap = $modalEl.find('.lov-table-wrap');

            function updateTrigger() {
                $input.val(scope.displayVal || '');
                $clearBtn[0].style.display = scope.model ? '' : 'none';
            }
            scope.$watch('model', function (v) {
                if (!v) { scope.displayVal = ''; updateTrigger(); }
            });

            $searchBtn.on('click', openModal);
            $input.on('click', openModal);
            $clearBtn.on('click', function () {
                scope.$apply(function () { scope.model = ''; scope.displayVal = ''; });
                updateTrigger();
            });

            function openModal() {
                $qInput.val(''); $tbody.empty(); $count.text('');
                $empty.hide(); $tableWrap.show();
                doSearch('');
                openBsModal(id);
                $timeout(function () { if ($qInput[0]) $qInput[0].focus(); }, 450);
            }

            var searchTimer = null;
            $qInput.on('input', function () {
                clearTimeout(searchTimer);
                var q = $qInput.val();
                searchTimer = setTimeout(function () { doSearch(q); }, 350);
            });

            function doSearch(q) {
                $loading.show(); $empty.hide(); $tbody.empty(); $count.text('');
                var base = (typeof API_CONFIG !== 'undefined') ? API_CONFIG.GATEWAY_URL : 'http://localhost:8080/api';

                $http.get(base + '/patients/search', {
                    params: { query: q || '' }
                }).then(function (res) {
                    $loading.hide();
                    var list = extractList(res.data);
                    if (q) list = filterList(list, q, ['pinNumber', 'firstName', 'lastName', 'contactNumber', 'patientName']);
                    renderRows(list);
                }).catch(function (err) {
                    $loading.hide();
                    $empty.html(
                        '<i class="fas fa-exclamation-circle fa-2x mb-2 d-block text-danger"></i>' +
                        '<p class="text-danger small">Error loading patients (HTTP ' + (err.status || '?') + ')</p>' +
                        '<p class="text-muted small">Endpoint: GET /patients/search</p>'
                    ).show();
                    console.error('[PIN LOV] Error:', err.status, err.data);
                });
            }

            function renderRows(list) {
                $tbody.empty();
                if (!list || list.length === 0) {
                    $empty.html('<i class="fas fa-user-slash fa-3x mb-2 d-block opacity-50"></i><p>No patients found. Try different search.</p>').show();
                    $count.text('0 results');
                    return;
                }
                $empty.hide();
                $count.text(list.length + ' patient(s) found');
                list.forEach(function (p) {
                    // Handle both firstName+lastName and fullName/patientName patterns
                    var fullName = p.patientName || p.fullName ||
                        ((p.firstName || '') + ' ' + (p.lastName || '')).trim() || '—';
                    var statusBg = (p.status === 'ACTIVE') ? '#166534' : '#6c757d';
                    var tr = angular.element(
                        '<tr style="cursor:pointer">' +
                        '<td><strong style="color:#1a3a6b">' + (p.pinNumber || '—') + '</strong></td>' +
                        '<td><strong>' + fullName + '</strong></td>' +
                        '<td>' + (p.age || '—') + ' / ' + (p.gender || '—') + '</td>' +
                        '<td>' + (p.contactNumber || '—') + '</td>' +
                        '<td><span class="badge bg-danger">' + (p.bloodGroup || '—') + '</span></td>' +
                        '<td><span class="badge" style="background:' + statusBg + ';color:white">' + (p.status || 'ACTIVE') + '</span></td>' +
                        '<td><button class="btn btn-sm btn-primary px-2 py-1">Select</button></td>' +
                        '</tr>'
                    );
                    tr.on('click', function () {
                        scope.$apply(function () {
                            scope.model = p.pinNumber;
                            scope.displayVal = (p.pinNumber || '') + '  —  ' + fullName;
                        });
                        updateTrigger();
                        closeBsModal(id);
                        if (scope.onSelect) scope.$apply(function () { scope.onSelect({ patient: p }); });
                    });
                    $tbody.append(tr);
                });
            }

            scope.$on('$destroy', function () {
                clearTimeout(searchTimer);
                var bsInst = bootstrap.Modal.getInstance($modalEl[0]);
                if (bsInst) bsInst.dispose();
                $modalEl.remove();
            });
        }
    };
}]);


// ═══════════════════════════════════════════════════════════
// CVR LOV DIRECTIVE
// Endpoint: GET /cvr/search?query=<q>
// Shows: cvrNumber, pinNumber, patientName, visitDate, doctorName, status
// ═══════════════════════════════════════════════════════════
app.directive('cvrLov', ['$http', '$timeout', function ($http, $timeout) {
    var counter = 0;
    return {
        restrict: 'E',
        scope: { model: '=', onSelect: '&' },
        link: function (scope, element) {
            counter++;
            var id = 'cvrLovModal_' + counter;
            scope.displayVal = '';

            element.html([
                '<div class="input-group input-group-sm">',
                '  <input type="text" class="form-control lov-display-input" readonly',
                '         style="cursor:pointer;background:#f8f9fa;border-right:0"',
                '         placeholder="CVR No — click to search">',
                '  <button class="btn btn-outline-secondary lov-clear-btn" type="button"',
                '          style="display:none;border-right:0">',
                '    <i class="fas fa-times text-danger"></i>',
                '  </button>',
                '  <button class="btn btn-success lov-search-btn" type="button">',
                '    <i class="fas fa-search me-1"></i>CVR',
                '  </button>',
                '</div>'
            ].join(''));

            var $modalEl = angular.element([
                '<div class="modal fade" id="' + id + '" tabindex="-1">',
                '  <div class="modal-dialog modal-xl modal-dialog-scrollable">',
                '    <div class="modal-content">',
                '      <div class="modal-header" style="background:linear-gradient(135deg,#065f46,#059669);color:white">',
                '        <h5 class="modal-title"><i class="fas fa-file-medical me-2"></i>CVR Search — Select Visit Record</h5>',
                '        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>',
                '      </div>',
                '      <div class="modal-body" style="background:#f0faf5">',
                '        <div class="input-group mb-3">',
                '          <span class="input-group-text bg-white"><i class="fas fa-search text-success"></i></span>',
                '          <input type="text" class="form-control lov-qinput" placeholder="Search by CVR Number, PIN or Patient Name...">',
                '        </div>',
                '        <div class="lov-loading text-center py-4" style="display:none">',
                '          <div class="spinner-border text-success"></div><p class="mt-2 text-muted small">Searching CVR records...</p>',
                '        </div>',
                '        <div class="lov-empty text-center text-muted py-5" style="display:none">',
                '          <i class="fas fa-file-medical fa-3x mb-2 d-block opacity-50"></i><p>No CVR records found</p>',
                '        </div>',
                '        <div class="lov-table-wrap" style="background:white;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)">',
                '          <table class="table table-bordered table-hover align-middle mb-0">',
                '            <thead><tr>',
                '              <th style="' + LOV_TH_GREEN + '">CVR No</th>',
                '              <th style="' + LOV_TH_GREEN + '">PIN</th>',
                '              <th style="' + LOV_TH_GREEN + '">Patient Name</th>',
                '              <th style="' + LOV_TH_GREEN + '">Visit Date</th>',
                '              <th style="' + LOV_TH_GREEN + '">Doctor</th>',
                '              <th style="' + LOV_TH_GREEN + '">Status</th>',
                '              <th style="' + LOV_TH_GREEN + '">Action</th>',
                '            </tr></thead>',
                '            <tbody class="lov-tbody"></tbody>',
                '          </table>',
                '        </div>',
                '      </div>',
                '      <div class="modal-footer" style="background:#e8f8f0">',
                '        <span class="text-muted small me-auto lov-count"></span>',
                '        <button class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>',
                '      </div>',
                '    </div>',
                '  </div>',
                '</div>'
            ].join(''));
            angular.element(document.body).append($modalEl);

            var $trigger = angular.element(element[0]);
            var $input = $trigger.find('.lov-display-input');
            var $clearBtn = $trigger.find('.lov-clear-btn');
            var $searchBtn = $trigger.find('.lov-search-btn');
            var $qInput = $modalEl.find('.lov-qinput');
            var $loading = $modalEl.find('.lov-loading');
            var $empty = $modalEl.find('.lov-empty');
            var $tbody = $modalEl.find('.lov-tbody');
            var $count = $modalEl.find('.lov-count');

            function updateTrigger() {
                $input.val(scope.displayVal || '');
                $clearBtn[0].style.display = scope.model ? '' : 'none';
            }
            scope.$watch('model', function (v) { if (!v) { scope.displayVal = ''; updateTrigger(); } });
            $searchBtn.on('click', openModal);
            $input.on('click', openModal);
            $clearBtn.on('click', function () { scope.$apply(function () { scope.model = ''; scope.displayVal = ''; }); updateTrigger(); });

            function openModal() {
                $qInput.val(''); $tbody.empty(); $count.text(''); $empty.hide();
                doSearch('');
                openBsModal(id);
                $timeout(function () { if ($qInput[0]) $qInput[0].focus(); }, 450);
            }

            var searchTimer = null;
            $qInput.on('input', function () {
                clearTimeout(searchTimer);
                var q = $qInput.val();
                searchTimer = setTimeout(function () { doSearch(q); }, 350);
            });

            function doSearch(q) {
                $loading.show(); $empty.hide(); $tbody.empty(); $count.text('');
                var base = (typeof API_CONFIG !== 'undefined') ? API_CONFIG.GATEWAY_URL : 'http://localhost:8080/api';

                // Primary: /cvr/search?query=
                $http.get(base + '/cvr/search', {
                    params: { query: q || '' }
                }).then(function (res) {
                    $loading.hide();
                    var list = extractList(res.data);
                    if (q) list = filterList(list, q, ['cvrNumber', 'pinNumber', 'patientName', 'doctorName']);
                    renderRows(list);
                }).catch(function () {
                    // Fallback: /cvr/recent
                    $http.get(base + '/cvr/recent', {
                        params: { limit: 50 }
                    }).then(function (res2) {
                        $loading.hide();
                        var list2 = extractList(res2.data);
                        if (q) list2 = filterList(list2, q, ['cvrNumber', 'pinNumber', 'patientName', 'doctorName']);
                        renderRows(list2);
                    }).catch(function (err2) {
                        $loading.hide();
                        $empty.html(
                            '<i class="fas fa-exclamation-circle fa-2x mb-2 d-block text-danger"></i>' +
                            '<p class="text-danger small">Error (HTTP ' + (err2.status || '?') + ')</p>' +
                            '<p class="text-muted small">Tried: GET /cvr/search and /cvr/recent</p>'
                        ).show();
                        console.error('[CVR LOV] Error:', err2.status, err2.data);
                    });
                });
            }

            function renderRows(list) {
                $tbody.empty();
                if (!list || list.length === 0) {
                    $empty.html('<i class="fas fa-file-medical fa-3x mb-2 d-block opacity-50"></i><p>No CVR records found</p>').show();
                    $count.text('0 records');
                    return;
                }
                $empty.hide();
                $count.text(list.length + ' record(s) found');
                var statusColors = {
                    'COMPLETED': '#166534', 'IN_CONSULTATION': '#1d4ed8',
                    'PENDING': '#92400e', 'CANCELLED': '#991b1b'
                };
                list.forEach(function (c) {
                    // Map various field name conventions to display
                    var patName = c.patientName || c.patient_name || '—';
                    var docName = c.doctorName || c.doctor_name || c.assignedDoctorName || '—';
                    var visitDt = c.visitDate || c.visit_date || c.createdAt || '';
                    var visitDtFmt = visitDt ? new Date(visitDt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
                    var statusBg = statusColors[c.status] || '#6c757d';

                    var tr = angular.element(
                        '<tr style="cursor:pointer">' +
                        '<td><strong style="color:#059669">' + (c.cvrNumber || '—') + '</strong></td>' +
                        '<td>' + (c.pinNumber || '—') + '</td>' +
                        '<td><strong>' + patName + '</strong></td>' +
                        '<td>' + visitDtFmt + '</td>' +
                        '<td>' + docName + '</td>' +
                        '<td><span class="badge" style="background:' + statusBg + ';color:white;font-size:11px">' + (c.status || '—') + '</span></td>' +
                        '<td><button class="btn btn-sm btn-success px-2 py-1">Select</button></td>' +
                        '</tr>'
                    );
                    tr.on('click', function () {
                        scope.$apply(function () {
                            scope.model = c.cvrNumber;
                            scope.displayVal = (c.cvrNumber || '') + (patName !== '—' ? '  —  ' + patName : '');
                        });
                        updateTrigger(); closeBsModal(id);
                        if (scope.onSelect) scope.$apply(function () { scope.onSelect({ cvr: c }); });
                    });
                    $tbody.append(tr);
                });
            }

            scope.$on('$destroy', function () {
                clearTimeout(searchTimer);
                var bsInst = bootstrap.Modal.getInstance($modalEl[0]);
                if (bsInst) bsInst.dispose();
                $modalEl.remove();
            });
        }
    };
}]);


// ═══════════════════════════════════════════════════════════
// INVOICE LOV DIRECTIVE
// Endpoints tried (in order):
//  1. GET /billing/invoices/pending              (no-filter list)
//  2. GET /billing/invoices?page=0&size=50        (paginated)
// ═══════════════════════════════════════════════════════════
app.directive('invoiceLov', ['$http', '$timeout', function ($http, $timeout) {
    var counter = 0;
    return {
        restrict: 'E',
        scope: { model: '=', onSelect: '&' },
        link: function (scope, element) {
            counter++;
            var id = 'invLovModal_' + counter;
            scope.displayVal = '';

            element.html([
                '<div class="input-group input-group-sm">',
                '  <input type="text" class="form-control lov-display-input" readonly',
                '         style="cursor:pointer;background:#f8f9fa;border-right:0"',
                '         placeholder="Invoice No — click to search">',
                '  <button class="btn btn-outline-secondary lov-clear-btn" type="button"',
                '          style="display:none;border-right:0">',
                '    <i class="fas fa-times text-danger"></i>',
                '  </button>',
                '  <button class="btn btn-warning lov-search-btn" type="button">',
                '    <i class="fas fa-search me-1 text-dark"></i><span class="text-dark">Invoice</span>',
                '  </button>',
                '</div>'
            ].join(''));

            var $modalEl = angular.element([
                '<div class="modal fade" id="' + id + '" tabindex="-1">',
                '  <div class="modal-dialog modal-xl modal-dialog-scrollable">',
                '    <div class="modal-content">',
                '      <div class="modal-header" style="background:linear-gradient(135deg,#78350f,#d97706)">',
                '        <h5 class="modal-title" style="color:white"><i class="fas fa-file-invoice me-2"></i>Invoice Search — Select Invoice</h5>',
                '        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>',
                '      </div>',
                '      <div class="modal-body" style="background:#fffbeb">',
                '        <div class="input-group mb-3">',
                '          <span class="input-group-text bg-white"><i class="fas fa-search text-warning"></i></span>',
                '          <input type="text" class="form-control lov-qinput" placeholder="Search by Invoice No, PIN or Patient Name...">',
                '        </div>',
                '        <div class="lov-loading text-center py-4" style="display:none">',
                '          <div class="spinner-border text-warning"></div><p class="mt-2 text-muted small">Loading invoices...</p>',
                '        </div>',
                '        <div class="lov-empty text-center text-muted py-5" style="display:none">',
                '          <i class="fas fa-file-invoice fa-3x mb-2 d-block opacity-50"></i><p>No invoices found</p>',
                '        </div>',
                '        <div class="lov-table-wrap" style="background:white;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)">',
                '          <table class="table table-bordered table-hover align-middle mb-0">',
                '            <thead><tr>',
                '              <th style="' + LOV_TH_AMBER + '">Invoice No</th>',
                '              <th style="' + LOV_TH_AMBER + '">PIN</th>',
                '              <th style="' + LOV_TH_AMBER + '">Patient Name</th>',
                '              <th style="' + LOV_TH_AMBER + '">Date</th>',
                '              <th style="' + LOV_TH_AMBER + '">Total Amount</th>',
                '              <th style="' + LOV_TH_AMBER + '">Status</th>',
                '              <th style="' + LOV_TH_AMBER + '">Action</th>',
                '            </tr></thead>',
                '            <tbody class="lov-tbody"></tbody>',
                '          </table>',
                '        </div>',
                '      </div>',
                '      <div class="modal-footer" style="background:#fef3c7">',
                '        <span class="text-muted small me-auto lov-count"></span>',
                '        <button class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>',
                '      </div>',
                '    </div>',
                '  </div>',
                '</div>'
            ].join(''));
            angular.element(document.body).append($modalEl);

            var $trigger = angular.element(element[0]);
            var $input = $trigger.find('.lov-display-input');
            var $clearBtn = $trigger.find('.lov-clear-btn');
            var $searchBtn = $trigger.find('.lov-search-btn');
            var $qInput = $modalEl.find('.lov-qinput');
            var $loading = $modalEl.find('.lov-loading');
            var $empty = $modalEl.find('.lov-empty');
            var $tbody = $modalEl.find('.lov-tbody');
            var $count = $modalEl.find('.lov-count');

            function updateTrigger() {
                $input.val(scope.displayVal || '');
                $clearBtn[0].style.display = scope.model ? '' : 'none';
            }
            scope.$watch('model', function (v) { if (!v) { scope.displayVal = ''; updateTrigger(); } });
            $searchBtn.on('click', openModal);
            $input.on('click', openModal);
            $clearBtn.on('click', function () { scope.$apply(function () { scope.model = ''; scope.displayVal = ''; }); updateTrigger(); });

            function openModal() {
                $qInput.val(''); $tbody.empty(); $count.text(''); $empty.hide();
                doSearch('');
                openBsModal(id);
                $timeout(function () { if ($qInput[0]) $qInput[0].focus(); }, 450);
            }

            var searchTimer = null;
            $qInput.on('input', function () {
                clearTimeout(searchTimer);
                var q = $qInput.val();
                searchTimer = setTimeout(function () { doSearch(q); }, 350);
            });

            function doSearch(q) {
                $loading.show(); $empty.hide(); $tbody.empty(); $count.text('');
                var base = (typeof API_CONFIG !== 'undefined') ? API_CONFIG.GATEWAY_URL : 'http://localhost:8080/api';

                // Try 1: /billing/invoices with pagination
                $http.get(base + '/billing/invoices', {
                    params: { page: 0, size: 100 }
                }).then(function (res) {
                    $loading.hide();
                    var list = extractList(res.data);
                    if (q) list = filterList(list, q, ['invoiceNumber', 'pinNumber', 'patientName']);
                    renderRows(list);
                }).catch(function () {
                    // Try 2: /billing/invoices/pending
                    $http.get(base + '/billing/invoices/pending').then(function (res2) {
                        $loading.hide();
                        var list2 = extractList(res2.data);
                        if (q) list2 = filterList(list2, q, ['invoiceNumber', 'pinNumber', 'patientName']);
                        renderRows(list2);
                    }).catch(function (err2) {
                        $loading.hide();
                        $empty.html(
                            '<i class="fas fa-exclamation-circle fa-2x mb-2 d-block text-danger"></i>' +
                            '<p class="text-danger small">Error (HTTP ' + (err2.status || '?') + ')</p>' +
                            '<p class="text-muted small">Tried: GET /billing/invoices &amp; /billing/invoices/pending</p>'
                        ).show();
                        console.error('[Invoice LOV] Error:', err2.status, err2.data);
                    });
                });
            }

            function renderRows(list) {
                $tbody.empty();
                if (!list || list.length === 0) {
                    $empty.html('<i class="fas fa-file-invoice fa-3x mb-2 d-block opacity-50"></i><p>No invoices found</p>').show();
                    $count.text('0 invoices');
                    return;
                }
                $empty.hide();
                $count.text(list.length + ' invoice(s) found');
                list.forEach(function (inv) {
                    var patName = inv.patientName || inv.patient_name || '—';
                    var invDate = inv.invoiceDate || inv.invoice_date || inv.createdAt || '';
                    var invDateFmt = invDate ? new Date(invDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
                    var statusBg = inv.paymentStatus === 'PAID' ? '#166534' :
                        inv.paymentStatus === 'PARTIALLY_PAID' ? '#92400e' : '#991b1b';
                    var tr = angular.element(
                        '<tr style="cursor:pointer">' +
                        '<td><strong style="color:#78350f">' + (inv.invoiceNumber || '—') + '</strong></td>' +
                        '<td>' + (inv.pinNumber || '—') + '</td>' +
                        '<td><strong>' + patName + '</strong></td>' +
                        '<td>' + invDateFmt + '</td>' +
                        '<td class="text-end fw-bold">₹' + ((inv.totalAmount || 0).toLocaleString('en-IN')) + '</td>' +
                        '<td><span class="badge" style="background:' + statusBg + ';color:white;font-size:11px">' + (inv.paymentStatus || 'UNPAID') + '</span></td>' +
                        '<td><button class="btn btn-sm btn-warning px-2 py-1 text-dark">Select</button></td>' +
                        '</tr>'
                    );
                    tr.on('click', function () {
                        scope.$apply(function () {
                            scope.model = inv.invoiceNumber;
                            scope.displayVal = (inv.invoiceNumber || '') + (patName !== '—' ? '  —  ' + patName : '');
                        });
                        updateTrigger(); closeBsModal(id);
                        if (scope.onSelect) scope.$apply(function () { scope.onSelect({ invoice: inv }); });
                    });
                    $tbody.append(tr);
                });
            }

            scope.$on('$destroy', function () {
                clearTimeout(searchTimer);
                var bsInst = bootstrap.Modal.getInstance($modalEl[0]);
                if (bsInst) bsInst.dispose();
                $modalEl.remove();
            });
        }
    };
}]);


// ═══════════════════════════════════════════════════════════
// DOCTOR LOV DIRECTIVE
// Endpoints tried (in order):
//  1. GET /doctors/active    (active doctors list)
//  2. GET /doctors/available  (if active fails)
//  3. GET /doctors/search?query=<q>
// ═══════════════════════════════════════════════════════════
app.directive('doctorLov', ['$http', '$timeout', function ($http, $timeout) {
    var counter = 0;
    return {
        restrict: 'E',
        scope: { model: '=', onSelect: '&' },
        link: function (scope, element) {
            counter++;
            var id = 'docLovModal_' + counter;
            scope.displayVal = '';

            element.html([
                '<div class="input-group input-group-sm">',
                '  <input type="text" class="form-control lov-display-input" readonly',
                '         style="cursor:pointer;background:#f8f9fa;border-right:0"',
                '         placeholder="Doctor — click to search">',
                '  <button class="btn btn-outline-secondary lov-clear-btn" type="button"',
                '          style="display:none;border-right:0">',
                '    <i class="fas fa-times text-danger"></i>',
                '  </button>',
                '  <button class="btn lov-search-btn" type="button"',
                '          style="background:linear-gradient(135deg,#0f766e,#14b8a6);color:white">',
                '    <i class="fas fa-search me-1"></i>Doctor',
                '  </button>',
                '</div>'
            ].join(''));

            var $modalEl = angular.element([
                '<div class="modal fade" id="' + id + '" tabindex="-1">',
                '  <div class="modal-dialog modal-lg modal-dialog-scrollable">',
                '    <div class="modal-content">',
                '      <div class="modal-header" style="background:linear-gradient(135deg,#0f766e,#14b8a6);color:white">',
                '        <h5 class="modal-title"><i class="fas fa-user-md me-2"></i>Doctor Search — Select Doctor</h5>',
                '        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>',
                '      </div>',
                '      <div class="modal-body" style="background:#f0fdfb">',
                '        <div class="input-group mb-3">',
                '          <span class="input-group-text bg-white"><i class="fas fa-search" style="color:#0f766e"></i></span>',
                '          <input type="text" class="form-control lov-qinput" placeholder="Search by Name, ID or Specialization...">',
                '        </div>',
                '        <div class="lov-loading text-center py-4" style="display:none">',
                '          <div class="spinner-border" style="color:#0f766e"></div><p class="mt-2 text-muted small">Loading doctors...</p>',
                '        </div>',
                '        <div class="lov-empty text-center text-muted py-5" style="display:none">',
                '          <i class="fas fa-user-md fa-3x mb-2 d-block opacity-50"></i><p>No doctors found</p>',
                '        </div>',
                '        <div class="lov-table-wrap" style="background:white;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)">',
                '          <table class="table table-bordered table-hover align-middle mb-0">',
                '            <thead><tr>',
                '              <th style="' + LOV_TH_TEAL + '">Doctor ID</th>',
                '              <th style="' + LOV_TH_TEAL + '">Full Name</th>',
                '              <th style="' + LOV_TH_TEAL + '">Specialization</th>',
                '              <th style="' + LOV_TH_TEAL + '">Department</th>',
                '              <th style="' + LOV_TH_TEAL + '">Fee (₹)</th>',
                '              <th style="' + LOV_TH_TEAL + '">Action</th>',
                '            </tr></thead>',
                '            <tbody class="lov-tbody"></tbody>',
                '          </table>',
                '        </div>',
                '      </div>',
                '      <div class="modal-footer" style="background:#ccfbf1">',
                '        <span class="text-muted small me-auto lov-count"></span>',
                '        <button class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>',
                '      </div>',
                '    </div>',
                '  </div>',
                '</div>'
            ].join(''));
            angular.element(document.body).append($modalEl);

            var $trigger = angular.element(element[0]);
            var $input = $trigger.find('.lov-display-input');
            var $clearBtn = $trigger.find('.lov-clear-btn');
            var $searchBtn = $trigger.find('.lov-search-btn');
            var $qInput = $modalEl.find('.lov-qinput');
            var $loading = $modalEl.find('.lov-loading');
            var $empty = $modalEl.find('.lov-empty');
            var $tbody = $modalEl.find('.lov-tbody');
            var $count = $modalEl.find('.lov-count');
            var allDoctors = [];   // cache for client-side filter

            function updateTrigger() {
                $input.val(scope.displayVal || '');
                $clearBtn[0].style.display = scope.model ? '' : 'none';
            }
            scope.$watch('model', function (v) { if (!v) { scope.displayVal = ''; updateTrigger(); } });
            $searchBtn.on('click', openModal);
            $input.on('click', openModal);
            $clearBtn.on('click', function () { scope.$apply(function () { scope.model = ''; scope.displayVal = ''; }); updateTrigger(); });

            function openModal() {
                $qInput.val(''); $count.text(''); $empty.hide();
                if (allDoctors.length > 0) {
                    // Reuse cached list
                    $tbody.empty(); renderRows(allDoctors);
                } else {
                    $tbody.empty();
                    loadDoctors();
                }
                openBsModal(id);
                $timeout(function () { if ($qInput[0]) $qInput[0].focus(); }, 450);
            }

            var searchTimer = null;
            $qInput.on('input', function () {
                clearTimeout(searchTimer);
                searchTimer = setTimeout(function () {
                    var q = $qInput.val();
                    if (!q) { $tbody.empty(); renderRows(allDoctors); return; }
                    var filtered = allDoctors.filter(function (d) {
                        var fullName = ((d.firstName || '') + ' ' + (d.lastName || '')).trim();
                        var q2 = q.toLowerCase();
                        return fullName.toLowerCase().indexOf(q2) !== -1 ||
                            (d.doctorId || '').toLowerCase().indexOf(q2) !== -1 ||
                            (d.specialization || '').toLowerCase().indexOf(q2) !== -1 ||
                            (d.department || '').toLowerCase().indexOf(q2) !== -1;
                    });
                    $tbody.empty(); renderRows(filtered);
                }, 300);
            });

            function loadDoctors() {
                $loading.show(); $empty.hide();
                var base = (typeof API_CONFIG !== 'undefined') ? API_CONFIG.GATEWAY_URL : 'http://localhost:8080/api';

                // Try 1: /doctors/active
                $http.get(base + '/doctors/active').then(function (res) {
                    $loading.hide();
                    allDoctors = extractList(res.data);
                    renderRows(allDoctors);
                }).catch(function () {
                    // Try 2: /doctors/available
                    $http.get(base + '/doctors/available').then(function (res2) {
                        $loading.hide();
                        allDoctors = extractList(res2.data);
                        renderRows(allDoctors);
                    }).catch(function (err2) {
                        $loading.hide();
                        $empty.html(
                            '<i class="fas fa-exclamation-circle fa-2x mb-2 d-block text-danger"></i>' +
                            '<p class="text-danger small">Error loading doctors (HTTP ' + (err2.status || '?') + ')</p>' +
                            '<p class="text-muted small">Tried: GET /doctors/active and /doctors/available</p>'
                        ).show();
                        console.error('[Doctor LOV] Error:', err2.status, err2.data);
                    });
                });
            }

            function renderRows(list) {
                $tbody.empty();
                if (!list || list.length === 0) {
                    $empty.html('<i class="fas fa-user-md fa-3x mb-2 d-block opacity-50"></i><p>No doctors found</p>').show();
                    $count.text('0 doctors');
                    return;
                }
                $empty.hide();
                $count.text(list.length + ' doctor(s)');
                list.forEach(function (d) {
                    var fullName = ((d.firstName || '') + ' ' + (d.lastName || '')).trim() || d.doctorName || '—';
                    var tr = angular.element(
                        '<tr style="cursor:pointer">' +
                        '<td><strong style="color:#0f766e">' + (d.doctorId || '—') + '</strong></td>' +
                        '<td><strong>' + fullName + '</strong></td>' +
                        '<td>' + (d.specialization || '—') + '</td>' +
                        '<td>' + (d.department || '—') + '</td>' +
                        '<td class="text-end">₹' + (d.consultationFee || 0).toLocaleString('en-IN') + '</td>' +
                        '<td><button class="btn btn-sm px-2 py-1" style="background:#0f766e;color:white">Select</button></td>' +
                        '</tr>'
                    );
                    tr.on('click', function () {
                        scope.$apply(function () {
                            scope.model = d.doctorId;
                            scope.displayVal = (d.doctorId || '') + '  —  ' + fullName +
                                (d.specialization ? ' (' + d.specialization + ')' : '');
                        });
                        updateTrigger(); closeBsModal(id);
                        if (scope.onSelect) scope.$apply(function () { scope.onSelect({ doctor: d }); });
                    });
                    $tbody.append(tr);
                });
            }

            scope.$on('$destroy', function () {
                clearTimeout(searchTimer);
                allDoctors = [];
                var bsInst = bootstrap.Modal.getInstance($modalEl[0]);
                if (bsInst) bsInst.dispose();
                $modalEl.remove();
            });
        }
    };
}]);

// ═══════════════════════════════════════════════════════════
// MEDICINE LOV DIRECTIVE
// Endpoint: GET /opd/medicines/search?query=<q>
// ═══════════════════════════════════════════════════════════
app.directive('medicineLov', ['$http', '$timeout', function ($http, $timeout) {
    var counter = 0;
    return {
        restrict: 'E',
        scope: { model: '=', onSelect: '&' },
        link: function (scope, element) {
            counter++;
            var id = 'medLovModal_' + counter;
            scope.displayVal = '';

            element.html([
                '<div class="input-group input-group-sm">',
                '  <input type="text" class="form-control lov-display-input" readonly',
                '         style="cursor:pointer;background:#f8f9fa;border-right:0"',
                '         placeholder="Search Medicine...">',
                '  <button class="btn btn-outline-secondary lov-clear-btn" type="button"',
                '          style="display:none;border-right:0">',
                '    <i class="fas fa-times text-danger"></i>',
                '  </button>',
                '  <button class="btn btn-info lov-search-btn" type="button">',
                '    <i class="fas fa-search me-1"></i>Search',
                '  </button>',
                '</div>'
            ].join(''));

            var $modalEl = angular.element([
                '<div class="modal fade" id="' + id + '" tabindex="-1">',
                '  <div class="modal-dialog modal-xl modal-dialog-scrollable">',
                '    <div class="modal-content">',
                '      <div class="modal-header" style="background:linear-gradient(135deg,#0d6efd,#0dcaf0);color:white">',
                '        <h5 class="modal-title"><i class="fas fa-capsules me-2"></i>Medicine Search</h5>',
                '        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>',
                '      </div>',
                '      <div class="modal-body" style="background:#f0f7ff">',
                '        <div class="input-group mb-3">',
                '          <span class="input-group-text bg-white"><i class="fas fa-search text-info"></i></span>',
                '          <input type="text" class="form-control lov-qinput" placeholder="Search by Name, Generic, Brand or Composition...">',
                '        </div>',
                '        <div class="lov-loading text-center py-4" style="display:none">',
                '          <div class="spinner-border text-info"></div><p class="mt-2 text-muted small">Searching medicines...</p>',
                '        </div>',
                '        <div class="lov-empty text-center text-muted py-5" style="display:none">',
                '          <i class="fas fa-pills fa-3x mb-2 d-block opacity-50"></i><p>No medicines found</p>',
                '        </div>',
                '        <div class="lov-table-wrap" style="background:white;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)">',
                '          <table class="table table-bordered table-hover align-middle mb-0">',
                '            <thead><tr>',
                '              <th style="' + LOV_TH_TEAL + '">Medicine Name</th>',
                '              <th style="' + LOV_TH_TEAL + '">Generic / Brand</th>',
                '              <th style="' + LOV_TH_TEAL + '">Composition</th>',
                '              <th style="' + LOV_TH_TEAL + '">Type</th>',
                '              <th style="' + LOV_TH_TEAL + '">Strength</th>',
                '              <th style="' + LOV_TH_TEAL + '">Action</th>',
                '            </tr></thead>',
                '            <tbody class="lov-tbody"></tbody>',
                '          </table>',
                '        </div>',
                '      </div>',
                '      <div class="modal-footer" style="background:#e8f4ff">',
                '        <span class="text-muted small me-auto lov-count"></span>',
                '        <button class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>',
                '      </div>',
                '    </div>',
                '  </div>',
                '</div>'
            ].join(''));
            angular.element(document.body).append($modalEl);

            var $trigger = angular.element(element[0]);
            var $input = $trigger.find('.lov-display-input');
            var $clearBtn = $trigger.find('.lov-clear-btn');
            var $searchBtn = $trigger.find('.lov-search-btn');
            var $qInput = $modalEl.find('.lov-qinput');
            var $loading = $modalEl.find('.lov-loading');
            var $empty = $modalEl.find('.lov-empty');
            var $tbody = $modalEl.find('.lov-tbody');
            var $count = $modalEl.find('.lov-count');

            function updateTrigger() {
                $input.val(scope.displayVal || '');
                $clearBtn[0].style.display = scope.model ? '' : 'none';
            }
            scope.$watch('model', function (v) { if (!v) { scope.displayVal = ''; updateTrigger(); } });
            $searchBtn.on('click', openModal);
            $input.on('click', openModal);
            $clearBtn.on('click', function () { scope.$apply(function () { scope.model = ''; scope.displayVal = ''; }); updateTrigger(); });

            function openModal() {
                $qInput.val(''); $tbody.empty(); $count.text(''); $empty.hide();
                doSearch('');
                openBsModal(id);
                $timeout(function () { if ($qInput[0]) $qInput[0].focus(); }, 450);
            }

            var searchTimer = null;
            $qInput.on('input', function () {
                clearTimeout(searchTimer);
                var q = $qInput.val();
                searchTimer = setTimeout(function () { doSearch(q); }, 350);
            });

            function doSearch(q) {
                $loading.show(); $empty.hide(); $tbody.empty(); $count.text('');
                var base = (typeof API_CONFIG !== 'undefined') ? API_CONFIG.GATEWAY_URL : 'http://localhost:8080/api';

                $http.get(base + '/opd/medicines/search', {
                    params: { query: q || '', page: 0, size: 50 }
                }).then(function (res) {
                    $loading.hide();
                    var list = extractList(res.data);
                    renderRows(list);
                }).catch(function (err) {
                    $loading.hide();
                    $empty.html('<p class="text-danger small">Error loading medicines</p>').show();
                });
            }

            function renderRows(list) {
                $tbody.empty();
                if (!list || list.length === 0) {
                    $empty.show();
                    $count.text('0 found');
                    return;
                }
                $empty.hide();
                $count.text(list.length + ' found');
                list.forEach(function (m) {
                    var tr = angular.element(
                        '<tr style="cursor:pointer">' +
                        '<td><strong class="text-primary">' + m.medicineName + '</strong></td>' +
                        '<td><small>' + (m.genericName || '-') + ' / ' + (m.brandName || '-') + '</small></td>' +
                        '<td>' + (m.composition || '-') + '</td>' +
                        '<td><span class="badge bg-info">' + m.medicineType + '</span></td>' +
                        '<td>' + (m.strength || '-') + ' ' + (m.unit || '') + '</td>' +
                        '<td><button class="btn btn-sm btn-primary">Select</button></td>' +
                        '</tr>'
                    );
                    tr.on('click', function () {
                        scope.$apply(function () {
                            scope.model = m.medicineName;
                            scope.displayVal = m.medicineName;
                        });
                        updateTrigger(); closeBsModal(id);
                        if (scope.onSelect) scope.$apply(function () { scope.onSelect({ medicine: m }); });
                    });
                    $tbody.append(tr);
                });
            }

            scope.$on('$destroy', function () {
                clearTimeout(searchTimer);
                var bsInst = bootstrap.Modal.getInstance($modalEl[0]);
                if (bsInst) bsInst.dispose();
                $modalEl.remove();
            });
        }
    };
}]);
