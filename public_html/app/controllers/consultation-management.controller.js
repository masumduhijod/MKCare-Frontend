/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
// ============================================
// CONSULTATION MANAGEMENT CONTROLLER
// File: app/controllers/opd/consultation-management.controller.js
// Edit, Update, Delete consultations with LOV search
// ============================================

app.controller('ConsultationManagementController', ['$scope', '$rootScope', '$location',
    'OPDService', 'PatientService',
    function($scope, $rootScope, $location, OPDService, PatientService) {
    
    // Initialize
    $scope.loading = false;
    $scope.consultations = [];
    $scope.filteredConsultations = [];
    $scope.selectedConsultation = null;
    $scope.editMode = false;
    
    // Search
    $scope.search = {
        type: 'PIN',  // PIN, CVR, NAME
        query: '',
        results: []
    };
    
    // Pagination
    $scope.pagination = {
        currentPage: 1,
        itemsPerPage: 10,
        totalItems: 0,
        totalPages: 0
    };
    
    // Editable consultation
    $scope.consultation = null;
    
    /**
     * Search consultations
     */
    $scope.searchConsultations = function() {
        if (!$scope.search.query || $scope.search.query.length < 2) {
            $rootScope.showAlert('warning', 'Please enter at least 2 characters');
            return;
        }
        
        $scope.loading = true;
        
        if ($scope.search.type === 'PIN') {
            $scope.searchByPIN();
        } else if ($scope.search.type === 'CVR') {
            $scope.searchByCVR();
        } else if ($scope.search.type === 'NAME') {
            $scope.searchByName();
        }
    };
    
    /**
     * Search by PIN
     */
    $scope.searchByPIN = function() {
        OPDService.getConsultationsByPatient($scope.search.query).then(
            function(response) {
                $scope.loading = false;
                if (response.data.success) {
                    $scope.consultations = response.data.data;
                    $scope.applyFilters();
                } else {
                    $rootScope.showAlert('info', 'No consultations found');
                }
            },
            function(error) {
                $scope.loading = false;
                console.error('Search error:', error);
                $rootScope.showAlert('danger', 'Search failed');
            }
        );
    };
    
    /**
     * Search by CVR
     */
    $scope.searchByCVR = function() {
        var url = API_CONFIG.ENDPOINTS.CONSULTATION.GET_BY_CVR
            .replace('{cvrNumber}', $scope.search.query);
        
        $http.get(API_CONFIG.GATEWAY_URL + url).then(
            function(response) {
                $scope.loading = false;
                if (response.data.success) {
                    $scope.consultations = [response.data.data];
                    $scope.applyFilters();
                } else {
                    $rootScope.showAlert('info', 'No consultation found');
                }
            },
            function(error) {
                $scope.loading = false;
                console.error('Search error:', error);
                $rootScope.showAlert('danger', 'Search failed');
            }
        );
    };
    
    /**
     * Search by patient name
     */
    $scope.searchByName = function() {
        // First search patients
        PatientService.searchPatients($scope.search.query).then(
            function(response) {
                if (response.data.success && response.data.data.length > 0) {
                    // Show LOV popup
                    $scope.search.results = response.data.data;
                    $scope.showLOV = true;
                } else {
                    $scope.loading = false;
                    $rootScope.showAlert('info', 'No patients found');
                }
            },
            function(error) {
                $scope.loading = false;
                console.error('Search error:', error);
            }
        );
    };
    
    /**
     * Select patient from LOV
     */
    $scope.selectPatient = function(patient) {
        $scope.showLOV = false;
        $scope.search.query = patient.pinNumber;
        $scope.search.type = 'PIN';
        $scope.searchByPIN();
    };
    
    /**
     * Apply filters
     */
    $scope.applyFilters = function() {
        $scope.filteredConsultations = $scope.consultations;
        $scope.updatePagination();
    };
    
    /**
     * Update pagination
     */
    $scope.updatePagination = function() {
        $scope.pagination.totalItems = $scope.filteredConsultations.length;
        $scope.pagination.totalPages = Math.ceil(
            $scope.pagination.totalItems / $scope.pagination.itemsPerPage
        );
    };
    
    /**
     * Get paged consultations
     */
    $scope.getPagedConsultations = function() {
        var start = ($scope.pagination.currentPage - 1) * $scope.pagination.itemsPerPage;
        var end = start + $scope.pagination.itemsPerPage;
        return $scope.filteredConsultations.slice(start, end);
    };
    
    /**
     * Edit consultation
     */
    $scope.editConsultation = function(consultation) {
        $scope.selectedConsultation = angular.copy(consultation);
        $scope.editMode = true;
    };
    
    /**
     * Update consultation
     */
    $scope.updateConsultation = function() {
        if (confirm('Update consultation?')) {
            $scope.loading = true;
            
            var url = API_CONFIG.ENDPOINTS.CONSULTATION.UPDATE
                .replace('{consultationId}', $scope.selectedConsultation.consultationId);
            
            $http.put(API_CONFIG.GATEWAY_URL + url, $scope.selectedConsultation).then(
                function(response) {
                    $scope.loading = false;
                    if (response.data.success) {
                        $rootScope.showAlert('success', 'Consultation updated successfully');
                        $scope.cancelEdit();
                        $scope.searchConsultations();
                    } else {
                        $rootScope.showAlert('danger', response.data.message);
                    }
                },
                function(error) {
                    $scope.loading = false;
                    console.error('Update error:', error);
                    $rootScope.showAlert('danger', 'Failed to update consultation');
                }
            );
        }
    };
    
    /**
     * Delete consultation
     */
    $scope.deleteConsultation = function(consultation) {
        if (confirm('Delete this consultation?\n\nConsultation ID: ' + consultation.consultationId + 
                    '\nPatient: ' + consultation.patientName + '\n\nThis action cannot be undone!')) {
            $scope.loading = true;
            
            var url = API_CONFIG.ENDPOINTS.CONSULTATION.DELETE
                .replace('{consultationId}', consultation.consultationId);
            
            $http.delete(API_CONFIG.GATEWAY_URL + url).then(
                function(response) {
                    $scope.loading = false;
                    if (response.data.success) {
                        $rootScope.showAlert('success', 'Consultation deleted successfully');
                        $scope.searchConsultations();
                    } else {
                        $rootScope.showAlert('danger', response.data.message);
                    }
                },
                function(error) {
                    $scope.loading = false;
                    console.error('Delete error:', error);
                    $rootScope.showAlert('danger', 'Failed to delete consultation');
                }
            );
        }
    };
    
    /**
     * Cancel edit
     */
    $scope.cancelEdit = function() {
        $scope.selectedConsultation = null;
        $scope.editMode = false;
    };
    
    /**
     * View details
     */
    $scope.viewDetails = function(consultation) {
        // Store in localStorage and navigate
        localStorage.setItem('viewConsultation', JSON.stringify(consultation));
        $location.path('/consultation/view/' + consultation.consultationId);
    };
    
    /**
     * Change page
     */
    $scope.goToPage = function(page) {
        if (page >= 1 && page <= $scope.pagination.totalPages) {
            $scope.pagination.currentPage = page;
        }
    };
}]);

