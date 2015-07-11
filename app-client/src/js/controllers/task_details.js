/////////////////////////////////////////////////////////////////////
//////////////////////////////////
//tasks list controller
app.controller('TasksDetailsController',
    ['$scope', '$routeParams', 'Task',
    function ($scope, $routeParams, Task) {
        $scope.task = Task.get({taskId: $routeParams.id});
}]);
