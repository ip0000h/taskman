/////////////////////////////////////////////////////////////////////
//////////////////////////////////
//tasks list controller
app.controller('AttachmentsListController',
    ['$scope', '$routeParams', 'Attachments',
    function ($scope, $routeParams, Attachments) {
        $scope.selectedTimes = [];
        $scope.attachment = Attachments.query({taskId: $routeParams.id});

        //add time
        $scope.addTime = function() {
            var modalInstance = $modal.open({
                templateUrl: 'templates/add_time.html',
                controller: 'AddTimeController',
                resolve: {
                    taskId: function() {
                        return $routeParams.id;
                    }
                }
            });
            modalInstance.result.then(function(data) {
                $scope.tasks.push(data);
            });
        };

        //delete tasks
        $scope.deleteTimes = function() {
            if ($scope.selectedTimes.length === 0) {
                alert("No selected times");
                return;
            }
            var modalInstance = $modal.open({
                templateUrl: 'templates/delete_times.html',
                controller: 'DeleteTimesController',
                resolve: {
                    selectedTimes: function() {
                        return $scope.selectedTimes;
                    }
                }
            });
        };
}]);

//////////////////////////////////
//add task controller
app.controller('AddTimeController',
    ['$scope', '$modalInstance', 'Times', 'taskId',
    function ($scope, $modalInstance, Times, taskId) {
        $scope.input = {};
        $scope.taskId = taskId;

        $scope.ok = function() {
            var newTime = {
                'start': $scope.input.start,
                'stop': $scope.input.stop,
            };
            var result = Times.save(
                {taskId: $scope.taskId},
                newTime
            );
            $modalInstance.close(result);
        };

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
}]);

//////////////////////////////////
//delete task modal controller
app.controller('DeleteTimesController',
    ['$scope', '$modalInstance', 'Times', 'selectedTasks',
    function ($scope, $modalInstance, Times, selectedTasks) {
        $scope.selectedTasks = selectedTasks;

        $scope.ok = function() {
            Tasks.remove(
                {},
                {'id': $scope.selectedTasks}
            );
            $modalInstance.close();
        };

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
}]);
