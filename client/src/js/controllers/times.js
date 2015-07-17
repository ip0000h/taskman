/////////////////////////////////////////////////////////////////////
//////////////////////////////////
//tasks list controller
app.controller('TimesListController',
    ['$scope', '$routeParams', '$modal', 'Times',
    function ($scope, $routeParams, $modal, Times) {
        $scope.times = [];
        $scope.selectedTimes = [];
        $scope.selectAll = false;
        $scope.times = Times.query({taskId: $routeParams.id});

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
                $scope.times.push(data);
            });
        };

        //select time
        $scope.selectTime = function(timeId) {
            var position = $.inArray(timeId, $scope.selectedTimes);
            if (position + 1) {
                $scope.selectedTimes.splice(position, 1);
                $scope.selectAll = false;
            } else {
                $scope.selectedTimes.push(timeId);
                $scope.selectAll = false;
            }
        };

        //select all times
        $scope.selectAllTimes = function() {
            $scope.selectedTimes = [];
            if ($scope.selectAll) {
                $scope.selectAll = false;
            } else {
                $scope.selectAll = true;
                $scope.times.forEach(function(item) {
                    $scope.selectedTimes.push(item.id);
                });
            }
            $scope.times.forEach(function(item) {
                item.selected = $scope.selectAll;
            });
        };

        //delete times
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
            modalInstance.result.then(function() {
                $scope.times = $scope.times.filter(function(item) {
                    return !item.selected;
                });
                $scope.selectedTimes = [];
            });
        };
}]);

//////////////////////////////////
//add time modal controller
app.controller('AddTimeController',
    ['$scope', '$modalInstance', 'Times', 'taskId',
    function ($scope, $modalInstance, Times, taskId) {
        $scope.input = {};
        $scope.taskId = taskId;
        $scope.startIsOpen = false;
        $scope.stopIsOpen = false;

        $scope.openStartCalendar = function(e, prop) {
            e.preventDefault();
            e.stopPropagation();

            $scope.startIsOpen = true;
        };

        $scope.openStopCalendar = function(e, prop) {
            e.preventDefault();
            e.stopPropagation();

            $scope.stopIsOpen = true;
        };

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
//delete time modal controller
app.controller('DeleteTimesController',
    ['$scope', '$modalInstance', 'Times', 'selectedTimes',
    function ($scope, $modalInstance, Times, selectedTimes) {
        $scope.selectedTimes = selectedTimes;

        $scope.ok = function() {
            Times.remove(
                {},
                {'id': $scope.selectedTimes}
            );
            $modalInstance.close();
        };

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
}]);
