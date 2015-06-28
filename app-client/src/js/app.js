var app = angular.module('app', [
    'ngRoute'
    ]);

//////////////////////////////////
//route config
app.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        //index
        .when('/', {
            templateUrl: "/templates/main.html",
        })
        // //details
        .when('/details', {
            templateUrl: "templates/details.html",
            controller: DetailsController,
        })
        //otherwise
        .otherwise({ redirectTo: '/' });
}]);
