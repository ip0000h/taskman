/////////////////////////////////////////////////////////////////////
//app define
var app = angular.module('app', [
    'ngResource',
    'ngRoute',
    'ui.bootstrap',
    'ui.bootstrap.datetimepicker',
    'ngFileUpload'
]);


/////////////////////////////////////////////////////////////////////
//app configs
//////////////////////////////////
//route config
app.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        //index
        .when('/', {
            templateUrl: "/templates/main.html"
        })
        //task details
        .when('/task/:id', {
            templateUrl: "templates/task_details.html",
        })
        //otherwise
        .otherwise({ redirectTo: '/' });
}]);
