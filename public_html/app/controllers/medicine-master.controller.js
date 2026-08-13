app.controller('MedicineMasterController', ['$scope', 'MedicineService', 'AuthService', function ($scope, MedicineService, AuthService) {
    
    $scope.medicines = [];
    $scope.currentPage = 0;
    $scope.pageSize = 10;
    $scope.totalItems = 0;
    $scope.totalPages = 0;
    $scope.searchQuery = '';
    $scope.isEdit = false;
    $scope.medForm = {};
    $scope.Math = window.Math;

    $scope.init = function() {
        $scope.loadMedicines();
    };

    $scope.loadMedicines = function() {
        $scope.loading = true;
        var promise;
        if ($scope.searchQuery) {
            promise = MedicineService.search($scope.searchQuery, $scope.currentPage, $scope.pageSize);
        } else {
            promise = MedicineService.list($scope.currentPage, $scope.pageSize);
        }

        promise.then(function(res) {
            if (res.data) {
                $scope.medicines = res.data.data;
                $scope.totalItems = res.data.totalItems;
                $scope.totalPages = res.data.totalPages;
            }
            $scope.loading = false;
        }).catch(function(err) {
            console.error('Error loading medicines:', err);
            $scope.loading = false;
        });
    };

    $scope.search = function() {
        $scope.currentPage = 0;
        $scope.loadMedicines();
    };

    $scope.resetSearch = function() {
        $scope.searchQuery = '';
        $scope.currentPage = 0;
        $scope.loadMedicines();
    };

    $scope.changePage = function(page) {
        if (page >= 0 && page < $scope.totalPages) {
            $scope.currentPage = page;
            $scope.loadMedicines();
        }
    };

    $scope.openAddModal = function() {
        $scope.isEdit = false;
        $scope.medForm = {
            isActive: true,
            medicineType: 'Tablet',
            unit: 'mg',
            packaging: 'Strip'
        };
        var modal = new bootstrap.Modal(document.getElementById('medicineModal'));
        modal.show();
    };

    $scope.openEditModal = function(med) {
        $scope.isEdit = true;
        $scope.medForm = angular.copy(med);
        var modal = new bootstrap.Modal(document.getElementById('medicineModal'));
        modal.show();
    };

    $scope.saveMedicine = function() {
        if (!$scope.medForm.medicineName || !$scope.medForm.medicineType) return;

        $scope.medForm.createdBy = AuthService.getCurrentUser().username;
        var promise;
        if ($scope.isEdit) {
            promise = MedicineService.update($scope.medForm.id, $scope.medForm);
        } else {
            promise = MedicineService.create($scope.medForm);
        }

        promise.then(function(res) {
            bootstrap.Modal.getInstance(document.getElementById('medicineModal')).hide();
            $scope.loadMedicines();
            // Show success alert if available
            if ($scope.showAlert) $scope.showAlert('Medicine saved successfully', 'success');
        }).catch(function(err) {
            console.error('Error saving medicine:', err);
        });
    };

    $scope.deleteMedicine = function(med) {
        if (confirm('Are you sure you want to deactivate this medicine?')) {
            MedicineService.delete(med.id).then(function() {
                $scope.loadMedicines();
            });
        }
    };

}]);
