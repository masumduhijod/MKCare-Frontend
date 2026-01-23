/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */



/**
 * ============================================
 * CUSTOM JAVASCRIPT UTILITIES
 * ============================================
 */
// File: assets/js/custom.js

// Auto-hide alerts after 5 seconds
document.addEventListener('DOMContentLoaded', function() {
    // Bootstrap collapse toggle for sidebar
    var collapseElements = document.querySelectorAll('[data-bs-toggle="collapse"]');
    collapseElements.forEach(function(element) {
        element.addEventListener('click', function() {
            var target = document.querySelector(this.getAttribute('href'));
            if (target) {
                var bsCollapse = new bootstrap.Collapse(target, {
                    toggle: true
                });
            }
        });
    });
});

// Print function
function printElement(elementId) {
    var content = document.getElementById(elementId);
    if (content) {
        var printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write('<html><head><title>Print</title>');
        printWindow.document.write('<link rel="stylesheet" href="assets/css/print.css">');
        printWindow.document.write('</head><body>');
        printWindow.document.write(content.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    }
}

// Format Currency
function formatCurrency(amount) {
    return '₹' + parseFloat(amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

// Validate Aadhar Number
function validateAadhar(aadharNumber) {
    var aadharPattern = /^\d{12}$/;
    return aadharPattern.test(aadharNumber);
}

// Validate Phone Number
function validatePhone(phoneNumber) {
    var phonePattern = /^[0-9]{10}$/;
    return phonePattern.test(phoneNumber);
}

// Calculate Age from Date of Birth
function calculateAge(dateOfBirth) {
    if (!dateOfBirth) return 0;
    
    var dob = new Date(dateOfBirth);
    var today = new Date();
    var age = today.getFullYear() - dob.getFullYear();
    var monthDiff = today.getMonth() - dob.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    
    return age;
}

// Calculate BMI
function calculateBMI(weightKg, heightCm) {
    if (!weightKg || !heightCm) return null;
    
    var heightM = heightCm / 100;
    var bmi = weightKg / (heightM * heightM);
    
    return bmi.toFixed(2);
}

// Get BMI Category
function getBMICategory(bmi) {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
}

// Format Time Object to String
function formatTimeObject(timeObj) {
    if (!timeObj) return '';
    
    var hour = ('0' + timeObj.hour).slice(-2);
    var minute = ('0' + timeObj.minute).slice(-2);
    
    return hour + ':' + minute;
}

// Parse Time String to Object
function parseTimeString(timeStr) {
    if (!timeStr) return null;
    
    var parts = timeStr.split(':');
    return {
        hour: parseInt(parts[0]),
        minute: parseInt(parts[1]),
        second: 0,
        nano: 0
    };
}

// Get Current Date in YYYY-MM-DD format
function getCurrentDate() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();
    
    return yyyy + '-' + mm + '-' + dd;
}

// Get Current Time Object
function getCurrentTimeObject() {
    var now = new Date();
    return {
        hour: now.getHours(),
        minute: now.getMinutes(),
        second: 0,
        nano: 0
    };
}

// Generate Random ID
function generateRandomId(prefix) {
    var timestamp = new Date().getTime();
    var random = Math.floor(Math.random() * 10000);
    return prefix + timestamp + random;
}

// Debounce Function (for search inputs)
function debounce(func, wait) {
    var timeout;
    return function() {
        var context = this;
        var args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(function() {
            func.apply(context, args);
        }, wait);
    };
}

// Export to CSV
function exportToCSV(data, filename) {
    if (!data || data.length === 0) {
        alert('No data to export');
        return;
    }
    
    var csv = [];
    var headers = Object.keys(data[0]);
    csv.push(headers.join(','));
    
    data.forEach(function(row) {
        var values = headers.map(function(header) {
            return JSON.stringify(row[header] || '');
        });
        csv.push(values.join(','));
    });
    
    var csvContent = csv.join('\n');
    var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement('a');
    
    if (link.download !== undefined) {
        var url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename + '.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Show Notification (using browser notification API)
function showNotification(title, message) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body: message,
            icon: 'assets/images/logo.png'
        });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
        Notification.requestPermission().then(function(permission) {
            if (permission === 'granted') {
                new Notification(title, {
                    body: message,
                    icon: 'assets/images/logo.png'
                });
            }
        });
    }
}

// Console log with timestamp
function log(message, data) {
    var timestamp = new Date().toLocaleString();
    console.log('[' + timestamp + '] ' + message, data || '');
}