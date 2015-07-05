/////////////////////////////////////////////////////////////////////
//////////////////////////////////
//tasks controller
app.controller('TasksListController',
    ['$rootScope', '$scope', '$modal', 'Tasks',
    function ($rootScope, $scope, $modal, Tasks) {

    $rootScope.$on('showGroupTasks', function() {
        if ($rootScope.activeGroup) {
            $scope.tasks = Tasks.query({groupId: $rootScope.activeGroup});
        }
        else {
            $scope.tasks =[];
        }
        $scope.selectedTasks = [];
        $scope.selectAll = false;
    });

    $scope.selectTask = function(task_id) {
        var position = $.inArray(task_id, $scope.selectedTasks);
        if (position + 1) {
            $scope.selectedTasks.splice(position, 1);
            $scope.selectAll = false;
        } else {
            $scope.selectedTasks.push(task_id);
            $scope.selectAll = false;
        }
    };

    $scope.selectPageTasks = function() {
        $scope.selectedTasks = [];
        if ($scope.selectAll) {
            $scope.selectAll = false;
        } else {
            $scope.selectAll = true;
            $scope.tasks.forEach(function(item) {
                $scope.selectedTasks.push(item.id);
            });
        }
        $scope.tasks.forEach(function(item) {
            item.selected = $scope.selectAll;
        });
    };

    $scope.moveTasks = function() {
        if ($scope.selectedTasks.length === 0) {
            alert("No selected tasks");
            return;
        }
        var modalInstance = $modal.open({
            templateUrl: 'templates/move_tasks.html',
            controller: MoveTasksController,
            resolve: {
                selectedTasks: function() {
                    return $scope.selectedTasks;
                }
            }
        });
    };

    $scope.deleteTasks = function() {
        if ($scope.selectedTasks.length === 0) {
            alert("No selected tasks");
            return;
        }
        var modalInstance = $modal.open({
            templateUrl: 'templates/delete_tasks.html',
            controller: DeleteTasksController,
            resolve: {
                selectedTasks: function() {
                    return $scope.selectedTasks;
                }
            }
        });
    };

    $scope.gotoPage = function(page) {
        $rootScope.activePage = page;
        if ($rootScope.search_str) {
            $rootScope.$broadcast('searchTasks');
        } else {
            $rootScope.$broadcast('showGroupTasks');
        }
    };
}]);
