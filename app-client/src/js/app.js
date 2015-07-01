/////////////////////////////////////////////////////////////////////
//app define
var app = angular.module('app', [
    'ngResource',
    'ngRoute',
    'ui.bootstrap'
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
        // //details
        .when('/details', {
            templateUrl: "templates/details.html",
        })
        //otherwise
        .otherwise({ redirectTo: '/' });
}]);
