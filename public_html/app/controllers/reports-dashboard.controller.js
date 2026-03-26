/**
 * Reports Dashboard Controller
 * Main landing page for all reports with role-based visibility
 */
app.controller('ReportsDashboardController', ['$scope', '$location',
    function($scope, $location) {

    // Clinic / user info
    $scope.clinicName   = localStorage.getItem('clinicName') || 'Hospital';
    var user = localStorage.getItem('currentUser');
    $scope.currentUser  = user ? JSON.parse(user) : {};

    /**
     * Role-based access check
     * Admin always has access to everything
     */
    $scope.canAccess = function(roles) {
        if (!$scope.currentUser || !$scope.currentUser.role) return false;
        if ($scope.currentUser.role === 'ADMIN') return true;
        return roles.indexOf($scope.currentUser.role) !== -1;
    };

    /**
     * Navigate to a report
     */
    $scope.go = function(path) {
        $location.path('/' + path);
    };
}]);
