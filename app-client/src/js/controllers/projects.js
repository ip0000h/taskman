/////////////////////////////////////////////////////////////////////
//////////////////////////////////
//projects list controller
app.controller('ProjectsController',
    ['$rootScope', '$scope', '$modal', 'Projects',
    function ($rootScope, $scope, $modal, Projects) {
        //init
        $scope.projects = Projects.query(function() {
            if ($scope.projects.length) {
                $rootScope.activeProject = $scope.projects[0].id;
                $scope.selectedProject = $scope.projects[0];
            }
            else {
                $rootScope.activeProject=null;
            }
            $rootScope.$broadcast('showProjectsGroups');
        });

        //select current project
        $scope.setProject = function() {
            $rootScope.activeProject = $scope.selectedProject.id;
            $rootScope.$broadcast('showProjectsGroups');
        };

        //add project
        $scope.addProject = function() {
            var modalInstance = $modal.open({
                templateUrl: 'templates/add_project.html',
                controller: 'AddProjectController',
            });
            modalInstance.result.then(function(data) {
                $scope.projects.push(data);
                $rootScope.activeProject = data.id;
                $scope.selectedProject = data;
                $rootScope.$broadcast('showProjectsGroups');
            });
        };

        //delete project
        $scope.deleteProject = function() {
            var modalInstance = $modal.open({
                templateUrl: 'templates/delete_project.html',
                controller: 'DeleteProjectController',
                resolve: {
                    id: function() {
                        return $scope.selectedProject.id;
                    },
                    name: function() {
                        return $scope.selectedProject.name;
                    }
                }
            });
            modalInstance.result.then(function() {
                var ind = $scope.projects.indexOf($scope.selectedProject);
                $scope.projects.splice(ind, 1);
                if ($scope.projects.length) {
                    $rootScope.activeProject = $scope.projects[0].id;
                    $scope.selectedProject = $scope.projects[0];
                }
                else {
                    $rootScope.activeProject=null;
                }
                $rootScope.$broadcast('showProjectsGroups');
            });
        };

        //rename project
        $scope.renameProject = function() {
            var modalInstance = $modal.open({
                templateUrl: 'templates/rename_project.html',
                controller: 'RenameProjectController',
                resolve: {
                    id: function() {
                        return $scope.selectedProject.id;
                    },
                    oldName: function() {
                        return $scope.selectedProject.name;
                    }
                }
            });
            modalInstance.result.then(function(data) {
                $scope.selectedProject.name = data;
            });
        };
}]);

//////////////////////////////////
//add project modal controller
app.controller('AddProjectController',
    ['$scope', '$modalInstance', 'Projects',
    function ($scope, $modalInstance, Projects) {
        $scope.input = {};

        $scope.ok = function() {
            if ($scope.input.name) {
                var result = Projects.save({'name': $scope.input.name});
                $modalInstance.close(result);
            }
        };

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
}]);

//////////////////////////////////
//delete project modal controller
app.controller('DeleteProjectController',
    ['$scope', '$modalInstance', 'Project', 'id', 'name',
    function ($scope, $modalInstance, Project, id, name, gcount) {
        $scope.projectId = id;
        $scope.projectName = name;
        $scope.groupsCount = gcount;

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
