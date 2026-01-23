/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Patient List Controller
 * Display and search patients
 */

/**
 * Patient List Controller - FIXED VERSION
 * Display and search patients with proper error handling
 */

app.controller('PatientListController', ['$scope', '$rootScope', '$location', 'PatientService',
    function($scope, $rootScope, $location, PatientService) {
    
    // Initialize variables
    $scope.patients = [];
    $scope.loading = false;
    $scope.error = null;
    $scope.searchQuery = '';
    $scope.searchType = 'NAME';
    
    // Pagination
    $scope.currentPage = 1;
    $scope.itemsPerPage = 10;
    $scope.totalItems = 0;
    
    /**
     * Load Recent Patients
     */
    $scope.loadRecentPatients = function() {
        $scope.loading = true;
        $scope.error = null;
        
        PatientService.getRecent(50)
            .then(function(response) {
                $scope.loading = false;
                
                console.log('Recent patients response:', response.data);
                
                if (response.data && response.data.success) {
                    $scope.patients = response.data.data || [];
                    $scope.totalItems = $scope.patients.length;
                    $scope.currentPage = 1; // Reset to first page
                    
                    if ($scope.patients.length === 0) {
                        $scope.error = 'No patients found in the system';
                    }
                } else {
                    $scope.patients = [];
                    $scope.totalItems = 0;
                    $scope.error = response.data.message || 'No patients found';
                }
            })
            .catch(function(error) {
                $scope.loading = false;
                $scope.patients = [];
                $scope.totalItems = 0;
                
                console.error('Error loading patients:', error);
                
                if (error.status === 404) {
                    $scope.error = 'Patient service not available';
                } else if (error.status === 401) {
                    $scope.error = 'Unauthorized. Please login again';
                    $location.path('/login');
                } else if (error.status === 0) {
                    $scope.error = 'Cannot connect to server. Please check your connection';
                } else {
                    $scope.error = error.data?.message || 'Error loading patients';
                }
            });
    };
    
    /**
     * Search Patients
     */
    $scope.searchPatients = function() {
        // If no search query, load recent patients
        if (!$scope.searchQuery || $scope.searchQuery.trim() === '') {
            $scope.loadRecentPatients();
            return;
        }
        
        $scope.loading = true;
        $scope.error = null;
        
        var query = $scope.searchQuery.trim();
        var type = $scope.searchType || 'NAME';
        
        console.log('Searching patients:', query, type);
        
        PatientService.search(query, type)
            .then(function(response) {
                $scope.loading = false;
                
                console.log('Search response:', response.data);
                
                if (response.data && response.data.success) {
                    $scope.patients = response.data.data || [];
                    $scope.totalItems = $scope.patients.length;
                    $scope.currentPage = 1; // Reset to first page
                    
                    if ($scope.patients.length === 0) {
                        $scope.error = 'No patients found matching "' + query + '"';
                    } else {
                        $rootScope.showAlert && $rootScope.showAlert('success', 
                            'Found ' + $scope.patients.length + ' patient(s)');
                    }
                } else {
                    $scope.patients = [];
                    $scope.totalItems = 0;
                    $scope.error = response.data.message || 'No patients found matching your search';
                }
            })
            .catch(function(error) {
                $scope.loading = false;
                $scope.patients = [];
                $scope.totalItems = 0;
                
                console.error('Error searching patients:', error);
                
                if (error.status === 404) {
                    $scope.error = 'No patients found matching "' + query + '"';
                } else if (error.status === 401) {
                    $scope.error = 'Unauthorized. Please login again';
                    $location.path('/login');
                } else if (error.status === 0) {
                    $scope.error = 'Cannot connect to server. Please check your connection';
                } else {
                    $scope.error = error.data?.message || 'Error searching patients';
                }
            });
    };
    
    /**
     * Clear Search and Reset
     */
    $scope.clearSearch = function() {
        $scope.searchQuery = '';
        $scope.searchType = 'NAME';
        $scope.error = null;
        $scope.currentPage = 1;
        $scope.loadRecentPatients();
    };
    
    /**
     * View Patient Details
     */
    $scope.viewPatient = function(pinNumber) {
        if (!pinNumber) {
            $rootScope.showAlert && $rootScope.showAlert('warning', 'Invalid patient PIN');
            return;
        }
        
        console.log('Viewing patient:', pinNumber);
        $location.path('/patient/details/' + pinNumber);
    };
    
    /**
     * Create CVR for Patient
     */
    $scope.createCVR = function(pinNumber) {
        if (!pinNumber) {
            $rootScope.showAlert && $rootScope.showAlert('warning', 'Invalid patient PIN');
            return;
        }
        
        console.log('Creating CVR for patient:', pinNumber);
        $location.path('/cvr/create').search({pinNumber: pinNumber});
    };
    
    /**
     * Book Appointment for Patient
     */
    $scope.bookAppointment = function(pinNumber) {
        if (!pinNumber) {
            $rootScope.showAlert && $rootScope.showAlert('warning', 'Invalid patient PIN');
            return;
        }
        
        console.log('Booking appointment for patient:', pinNumber);
        $location.path('/appointment/book').search({pinNumber: pinNumber});
    };
    
    /**
     * Get Paginated Patients
     */
    $scope.getPaginatedPatients = function() {
        if (!$scope.patients || $scope.patients.length === 0) {
            return [];
        }
        
        var start = ($scope.currentPage - 1) * $scope.itemsPerPage;
        var end = start + $scope.itemsPerPage;
        return $scope.patients.slice(start, end);
    };
    
    /**
     * Change Page
     */
    $scope.changePage = function(page) {
        var totalPages = $scope.getTotalPages();
        
        if (page < 1 || page > totalPages) {
            return;
        }
        
        $scope.currentPage = page;
        
        // Scroll to top
        window.scrollTo(0, 0);
    };
    
    /**
     * Get Total Pages
     */
    $scope.getTotalPages = function() {
        if (!$scope.totalItems || $scope.totalItems === 0) {
            return 0;
        }
        return Math.ceil($scope.totalItems / $scope.itemsPerPage);
    };
    
    /**
     * Get Page Numbers Array
     */
    $scope.getPageNumbers = function() {
        var pages = [];
        var totalPages = $scope.getTotalPages();
        var currentPage = $scope.currentPage;
        
        // Show max 5 page numbers at a time
        var startPage = Math.max(1, currentPage - 2);
        var endPage = Math.min(totalPages, currentPage + 2);
        
        // Adjust if we're near the beginning or end
        if (currentPage <= 3) {
            endPage = Math.min(5, totalPages);
        }
        if (currentPage >= totalPages - 2) {
            startPage = Math.max(1, totalPages - 4);
        }
        
        for (var i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        
        return pages;
    };
    
    /**
     * Refresh Patient List
     */
    $scope.refresh = function() {
        if ($scope.searchQuery && $scope.searchQuery.trim() !== '') {
            $scope.searchPatients();
        } else {
            $scope.loadRecentPatients();
        }
    };
    
    // Initialize - Load recent patients on page load
    console.log('PatientListController initialized');
    $scope.loadRecentPatients();
    
    // Watch for search type changes
    $scope.$watch('searchType', function(newVal, oldVal) {
        if (newVal !== oldVal && $scope.searchQuery && $scope.searchQuery.trim() !== '') {
            console.log('Search type changed to:', newVal);
        }
    });
}]);