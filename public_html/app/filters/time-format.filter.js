/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


// ============ TIME FORMAT FILTER ============
// File: app/filters/time-format.filter.js
app.filter('timeFormat', function() {
    return function(timeObj) {
        if (!timeObj) return '';
        
        var hour = ('0' + timeObj.hour).slice(-2);
        var minute = ('0' + timeObj.minute).slice(-2);
        
        return hour + ':' + minute;
    };
});