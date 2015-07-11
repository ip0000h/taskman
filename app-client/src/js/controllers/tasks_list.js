/////////////////////////////////////////////////////////////////////
//////////////////////////////////
//tasks list controller
app.controller('TasksListController',
    ['$rootScope', '$scope', '$modal', 'Tasks',
    function ($rootScope, $scope, $modal, Tasks) {
        //init
        $scope.selectedTasks = [];
        $scope.selectAll = false;

        //root broadcast event showGroupTasks
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

        //add task
        $scope.addTask = function() {
            var modalInstance = $modal.open({
                templateUrl: 'templates/add_task.html',
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

        //select task
        $scope.selectTask = function(taskId) {
            var position = $.inArray(taskId, $scope.selectedTasks);
            if (position + 1) {
                $scope.selectedTasks.splice(position, 1);
                $scope.selectAll = false;
            } else {
                $scope.selectedTasks.push(taskId);
                $scope.selectAll = false;
            }
            console.log($scope.selectedTasks);
        };

        //select all tasks at current page
        $scope.selectPageTasks = function() {
            $scope.selectedTasks = [];
            if ($scope.selectAll) {
                console.log('unselect all');
                $scope.selectAll = false;
            } else {
                console.log('select all');
                $scope.selectAll = true;
                $scope.tasks.forEach(function(item) {
                    $scope.selectedTasks.push(item.id);
                    console.log(item.id);
                });
            }
            $scope.tasks.forEach(function(item) {
                item.selected = $scope.selectAll;
            });
            console.log($scope.selectedTasks);
        };

        //delete tasks
        $scope.deleteTasks = function() {
            if ($scope.selectedTasks.length === 0) {
                alert("No selected tasks");
                return;
            }
            var modalInstance = $modal.open({
                templateUrl: 'templates/delete_tasks.html',
                controller: 'DeleteTasksController',
                resolve: {
                    selectedTasks: function() {
                        return $scope.selectedTasks;
                    }
                }
            });
            modalInstance.result.then(function() {
                $scope.tasks = $scope.tasks.filter(function(item) {
                    return !item.selected;
                });
                changeGroupData = {
                    'groupId': $rootScope.activeGroup,
                    'tasksCount': $scope.selectedTasks.length,
                    'mul': -1
                };
                $rootScope.$broadcast('changeGroupTasksCount', changeGroupData);
                $scope.selectedTasks = [];
            });
        };

        //move tasks
        $scope.moveTasks = function() {
            if ($scope.selectedTasks.length === 0) {
                alert("No selected tasks");
                return;
            }
            var modalInstance = $modal.open({
                templateUrl: 'templates/move_tasks.html',
                controller: 'MoveTasksController',
                resolve: {
                    selectedTasks: function() {
                        return $scope.selectedTasks;
                    },
                    activeProject: function() {
                        return $rootScope.activeProject;
                    }
                }
            });
            modalInstance.result.then(function(data) {
                $scope.tasks = $scope.tasks.filter(function(item) {
                    return !item.selected;
                });
                changeGroupData = {
                    'groupId': $rootScope.activeGroup,
                    'tasksCount': $scope.selectedTasks.length,
                    'mul': -1
                };
                $rootScope.$broadcast('changeGroupTasksCount', changeGroupData);
                changeGroupData.groupId = data;
                changeGroupData.mul = 1;
                $rootScope.$broadcast('changeGroupTasksCount', changeGroupData);
                $scope.selectedTasks = [];
            });
        };

        //go to page
        $scope.gotoPage = function(page) {
            $rootScope.activePage = page;
            if ($rootScope.search_str) {
                $rootScope.$broadcast('searchTasks');
            } else {
                $rootScope.$broadcast('showGroupTasks');
            }
        };
}]);

//////////////////////////////////
//add group controller
app.controller('AddTaskController',
    ['$scope', '$modalInstance', 'Tasks', 'groupId',
    function ($scope, $modalInstance, Tasks, groupId) {
        $scope.input = {};
        $scope.groupId = groupId;

        $scope.ok = function() {
            var newTask = {
                'title': $scope.input.title,
                'text': $scope.input.text,
                'status': $scope.input.status
            };
            var result = Tasks.save(
                {groupId: $scope.groupId},
                newTask
            );
            $modalInstance.close(result);
        };

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
}]);

//////////////////////////////////
//delete group modal controller
app.controller('DeleteTasksController',
    ['$scope', '$modalInstance', 'Tasks', 'selectedTasks',
    function ($scope, $modalInstance, Tasks, selectedTasks) {
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

//////////////////////////////////
//move targets modal controller
app.controller('MoveTasksController',
    ['$scope', '$modalInstance', 'Groups', 'Tasks', 'selectedTasks', 'activeProject',
    function ($scope, $modalInstance, Groups, Tasks, selectedTasks, activeProject) {
        $scope.input = {};
        $scope.selectedTasks = selectedTasks;
        $scope.activeProject = activeProject;
        $scope.groups = Groups.query({projectId: $scope.activeProject});

        $scope.ok = function() {
            Tasks.update(
                {},
                {
                    'id': $scope.selectedTasks,
                    'new_group_id': $scope.input.selectedOption.id
                }
            );
            $modalInstance.close($scope.input.selectedOption.id);
        };

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
}]);
