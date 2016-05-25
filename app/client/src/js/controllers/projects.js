/////////////////////////////////////////////////////////////////////
//////////////////////////////////
//projects list controller
app.controller('ProjectsController',
    ['$rootScope', '$scope', '$modal', 'Projects',
    function ($rootScope, $scope, $modal, Projects) {
        //root broadcast event showGroupProjects
        $rootScope.$on('showGroupProjects', function() {
            if ($rootScope.activeGroup) {
                $scope.projects = Projects.query({groupId: $rootScope.activeGroup}, function(){
                    if ($scope.projects.length) {
                        $rootScope.activeProject = $scope.projects[0].id;
                        $scope.activeProjectName = $scope.projects[0].name;
                        $scope.activeTasksCount = $scope.projects[0].tasks_count;
                        $scope.selectedProject = 0;
                    }
                    else{
                        $rootScope.activeProject = null;
                    }
                    $rootScope.$broadcast('showProjectTasks');
                });
            } else {
                $scope.projects = [];
                $rootScope.$broadcast('showProjectTasks');
            }
        });

        var findWithAttr = function(array, attr, value) {
            for(var i = 0; i < array.length; i += 1) {
                if(array[i][attr] === value) {
                    return i;
                }
            }
        };

        //root broadcast event changeGroupTasksCount
        $rootScope.$on('changeProjectTasksCount', function(event, data) {
            var projectInd = findWithAttr($scope.projects, 'id', data.projectId);
            $scope.projects[projectInd].tasks_count += data.mul * data.tasksCount;
        });

        //select current project
        $scope.setProject = function(projectId, projectName, tasksCount, index) {
            $rootScope.activeProject = projectId;
            $scope.activeProjectName = projectName;
            $scope.activeTasksCount = tasksCount;
            $scope.selectedProject = index;
            $rootScope.activePage = 1;
            $rootScope.search_str = null;
            $rootScope.$broadcast('showProjectTasks');
        };

        //add project
        $scope.addProject = function() {
            var modalInstance = $modal.open({
                templateUrl: 'templates/add_project.html',
                controller: 'AddProjectController',
                resolve: {
                    groupId: function() {
                        return $rootScope.activeGroup;
                    }
                }
            });
            modalInstance.result.then(function(data) {
                $scope.projects.push(data);
                $rootScope.activeProject = data.id;
                $scope.activeProjectName = data.name;
                $scope.activeTasksCount = data.tasks_count;
                $scope.selectedProject = $scope.projects.length - 1;
                $rootScope.$broadcast('showProjectTasks');
            });
        };

        //delete project
        $scope.deleteProject = function() {
            var modalInstance = $modal.open({
                templateUrl: 'templates/delete_project.html',
                controller: 'DeleteProjectController',
                resolve: {
                    id: function() {
                        return $rootScope.activeProject;
                    },
                    name: function() {
                        return $scope.activeProjectName;
                    },
                    tasksCount: function() {
                        return $scope.activeTasksCount;
                    }
                }
            });
            modalInstance.result.then(function() {
                $scope.projects.splice($scope.selectedProject, 1);
                if ($scope.projects.length) {
                    $rootScope.activeProject = $scope.projects[0].id;
                    $scope.activeProjectName = $scope.projects[0].name;
                    $scope.activeTasksCount = $scope.projects[0].tasks_count;
                    $scope.selectedProject = 0;
                }
                else {
                    $rootScope.activeProject=null;
                }
                $rootScope.$broadcast('showProjectTasks');
            });
        };

        //rename project
        $scope.renameProject = function() {
            var modalInstance = $modal.open({
                templateUrl: 'templates/rename_project.html',
                controller: 'RenameProjectController',
                resolve: {
                    id: function() {
                        return $rootScope.activeProject;
                    },
                    oldName: function() {
                        return $scope.activeProjectName;
                    }
                }
            });
            modalInstance.result.then(function(data) {
                $scope.activeProjectName = data;
                $scope.projects[$scope.selectedProject].name =data;
            });
        };
}]);

//////////////////////////////////
//add project modal controller
app.controller('AddProjectController',
    ['$scope', '$modalInstance', 'Projects', 'groupId',
    function ($scope, $modalInstance, Projects, groupId) {
        $scope.input = {};
        $scope.groupId = groupId;
        $scope.ok = function() {
            if ($scope.input.name) {
                $scope.new_project = Projects.save(
                    {groupId: $scope.groupId},
                    {'name': $scope.input.name}
                );
                $scope.new_project.$promise.then(
                    function (value) {
                        $modalInstance.close(value);
                    },
                    function (error) {
                        console.log(error);
                    }
                );
            }
        };

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
}]);

//////////////////////////////////
//delete project modal controller
app.controller('DeleteProjectController',
    ['$scope', '$modalInstance', 'Project', 'id', 'name', 'tasksCount',
    function ($scope, $modalInstance, Project, id, name, tasksCount) {
        $scope.projectId = id;
        $scope.projectName = name;
        $scope.tasksCount = tasksCount;

        $scope.ok = function() {
            Project.remove(
                {projectId: $scope.projectId}
            );
            $modalInstance.close();
        };

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
}]);

//////////////////////////////////
//rename project modal controller
app.controller('RenameProjectController',
    ['$scope', '$modalInstance', 'Project', 'id', 'oldName',
    function ($scope, $modalInstance, Project, id, oldName) {
        $scope.input = {};
        $scope.projectId = id;
        $scope.oldName = oldName;

        $scope.ok = function() {
            Project.update(
                {projectId: $scope.projectId},
                {'name': $scope.input.newName}
            );
            $modalInstance.close($scope.input.newName);
        };

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
}]);
