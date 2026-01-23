/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


// ============ DATE FORMAT FILTER ============
// File: app/filters/date-format.filter.js
app.filter('dateFormat', function() {
    return function(dateString) {
        if (!dateString) return '';
        
        var date = new Date(dateString);
        var day = ('0' + date.getDate()).slice(-2);
        var month = ('0' + (date.getMonth() + 1)).slice(-2);
        var year = date.getFullYear();
        
        return day + '-' + month + '-' + year;
    };
});
