app.factory('MedicineService', ['$http', function ($http) {
    var service = {};
    var baseUrl = API_CONFIG.GATEWAY_URL;

    service.create = function (medicine) {
        return $http.post(baseUrl + API_CONFIG.ENDPOINTS.MEDICINE.CREATE, medicine);
    };

    service.update = function (id, medicine) {
        var url = baseUrl + API_CONFIG.ENDPOINTS.MEDICINE.UPDATE.replace('{id}', id);
        return $http.put(url, medicine);
    };

    service.getById = function (id) {
        var url = baseUrl + API_CONFIG.ENDPOINTS.MEDICINE.GET_BY_ID.replace('{id}', id);
        return $http.get(url);
    };

    service.list = function (page, size, sortBy, direction) {
        var url = baseUrl + API_CONFIG.ENDPOINTS.MEDICINE.LIST + 
                  '?page=' + (page || 0) + 
                  '&size=' + (size || 10) + 
                  '&sortBy=' + (sortBy || 'medicineName') + 
                  '&direction=' + (direction || 'asc');
        return $http.get(url);
    };

    service.search = function (query, page, size) {
        var url = baseUrl + API_CONFIG.ENDPOINTS.MEDICINE.SEARCH + 
                  '?query=' + query + 
                  '&page=' + (page || 0) + 
                  '&size=' + (size || 10);
        return $http.get(url);
    };

    service.searchList = function (query) {
        var url = baseUrl + API_CONFIG.ENDPOINTS.MEDICINE.SEARCH_LIST + '?query=' + query;
        return $http.get(url);
    };

    service.delete = function (id) {
        var url = baseUrl + API_CONFIG.ENDPOINTS.MEDICINE.DELETE.replace('{id}', id);
        return $http.delete(url);
    };

    return service;
}]);
