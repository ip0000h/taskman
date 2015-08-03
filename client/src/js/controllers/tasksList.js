/////////////////////////////////////////////////////////////////////
//////////////////////////////////
//tasks list controller
app.controller('TasksListController',
    ['$rootScope', '$scope', '$modal', 'Tasks',
    function ($rootScope, $scope, $modal, Tasks) {
        //root broadcast event showProjectTasks
        $rootScope.$on('showProjectTasks', function() {
            if ($rootScope.activeProject) {
                $scope.tasks = Tasks.query({projectId: $rootScope.activeProject});
            }
            else {
                $scope.tasks =[];
            }
            $scope.selectedTasks = [];
        });

        //add task
        $scope.addTask = function() {
            var modalInstance = $modal.open({
                templateUrl: 'templates/add_task.html',
                controller: 'AddTaskController',
                resolve: {
                    projectId: function() {
                        return $rootScope.activeProject;
                    }
                }
            });
            modalInstance.result.then(function(data) {
                $scope.tasks.push(data);
                changeProjectData = {
                    'projectId': $rootScope.activeProject,
                    'tasksCount': 1,
                    'mul': 1
                };
                $rootScope.$broadcast('changeProjectTasksCount', changeProjectData);
            });
        };

        //select task
        $scope.selectTask = function(taskId) {
            var position = $.inArray(taskId, $scope.selectedTasks);
            if (position + 1) {
                $scope.selectedTasks.splice(position, 1);
            } else {
                $scope.selectedTasks.push(taskId);
            }
            $scope.selectAll = false;
            console.log($scope.selectedTasks);
        };

        //select all tasks at current page
        $scope.selectPageTasks = function() {
            $scope.selectedTasks = [];
            if ($scope.selectAll) {
                $scope.selectAll = true;
                $scope.tasks.forEach(function(item) {
                    $scope.selectedTasks.push(item.id);
                });
            } else {
                $scope.selectAll = false;
            }
            $scope.tasks.forEach(function(item) {
                item.selected = $scope.selectAll;
            });
            console.log($scope.selectedTasks);
        };

        //close tasks
        $scope.closeTasks = function() {
            if ($scope.selectedTasks.length === 0) {
                alert("No selected tasks");
                return;
            }
            Tasks.update(
                {},
                {
                    'id': $scope.selectedTasks,
                    'status': 'closed'
                }
            );
            $scope.selectedTasks = [];
            $scope.selectAll = false;
            $rootScope.$broadcast('showProjectTasks');
        };

        //re-open tasks
        $scope.reopenTasks = function() {
            if ($scope.selectedTasks.length === 0) {
                alert("No selected tasks");
                return;
            }
            Tasks.update(
                {},
                {
                    'id': $scope.selectedTasks,
                    'status': 'opened'
                }
            );
            $scope.selectedTasks = [];
            $scope.selectAll = false;
            $rootScope.$broadcast('showProjectTasks');
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
                changeProjectData = {
                    'projectId': $rootScope.activeProject,
                    'tasksCount': $scope.selectedTasks.length,
                    'mul': -1
                };
                $rootScope.$broadcast('changeProjectTasksCount', changeProjectData);
                $scope.selectedTasks = [];
                $scope.selectAll = false;
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
                    activeGroup: function() {
                        return $rootScope.activeGroup;
                    }
                }
            });
            modalInstance.result.then(function(data) {
                $scope.tasks = $scope.tasks.filter(function(item) {
                    return !item.selected;
                });
                changeProjectData = {
                    'projectId': $rootScope.activeProject,
                    'tasksCount': $scope.selectedTasks.length,
                    'mul': -1
                };
                $rootScope.$broadcast('changeProjectTasksCount', changeProjectData);
                changeProjectData.projectId = data;
                changeProjectData.mul = 1;
                $rootScope.$broadcast('changeProjectTasksCount', changeProjectData);
                $scope.selectedTasks = [];
                $scope.selectAll = false;
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
//add task controller
app.controller('AddTaskController',
    ['$scope', '$modalInstance', 'Tasks', 'projectId',
    function ($scope, $modalInstance, Tasks, projectId) {
        $scope.input = {};
        $scope.projectId = projectId;

        $scope.ok = function() {
            var newTask = {
                'title': $scope.input.title,
                'text': $scope.input.text,
                'status': $scope.input.status
            };
            var result = Tasks.save(
                {projectId: $scope.projectId},
                newTask
            );
            $modalInstance.close(result);
        };

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
}]);

//////////////////////////////////
//delete task modal controller
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
    ['$scope', '$modalInstance', 'Projects', 'Tasks', 'selectedTasks', 'activeGroup',
    function ($scope, $modalInstance, Projects, Tasks, selectedTasks, activeGroup) {
        $scope.input = {};
        $scope.selectedTasks = selectedTasks;
        $scope.activeGroup = activeGroup;
        $scope.projects = Projects.query({groupId: $scope.activeGroup});

        $scope.ok = function() {
            Tasks.update(
                {},
                {
                    'id': $scope.selectedTasks,
                    'project_id': $scope.input.selectedOption.id
                }
            );
            $modalInstance.close($scope.input.selectedOption.id);
        };

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
}]);
