/////////////////////////////////////////////////////////////////////
//////////////////////////////////
//tasks list controller
app.controller('TimesListController',
    ['$scope', '$routeParams', 'Times',
    function ($scope, $routeParams, Times) {
        $scope.times = Times.query({taskId: $routeParams.id});

        //add time
        $scope.addTime = function() {
            var modalInstance = $modal.open({
                templateUrl: 'templates/add_time.html',
                controller: 'AddTaskController',
                resolve: {
                    groupId: function() {
                        return $rootScope.activeGroup;
                    }
                }
            });
            modalInstance.result.then(function(data) {
                $scope.tasks.push(data);
                $rootScope.$broadcast(
                    'changeGroupTasksCount', 1);
            });
        };
}]);
