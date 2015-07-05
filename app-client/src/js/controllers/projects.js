/////////////////////////////////////////////////////////////////////
//////////////////////////////////
//projects list controller
app.controller('ProjectsController',
    ['$rootScope', '$scope', '$modal', 'Projects',
    function ($rootScope, $scope, $modal, Projects) {

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

    $scope.setProject = function() {
        $rootScope.activeProject = $scope.selectedProject.id;
        $rootScope.$broadcast('showProjectsGroups');
    };

    $scope.addProject = function() {
        var modalInstance = $modal.open({
            templateUrl: 'templates/add_project.html',
            controller: 'AddProjectController',
        });
        modalInstance.result.then(function(data) {
            $scope.projects.push(data);
            $rootScope.activeProject = data.id;
        });
    };

    $scope.deleteProject = function() {
        var modalInstance = $modal.open({
            templateUrl: 'templates/delete_project.html',
            controller: 'DeleteProjectController',
            resolve: {
                project_id: function() {
                    return $rootScope.activeProject;
                },
                project_name: function() {
                    return $rootScope.activeProjectName;
                }
            }
        });
        modalInstance.result.then(function() {

        });
    };

    $scope.renameProject = function() {
        var modalInstance = $modal.open({
            templateUrl: 'templates/rename_project.html',
            controller: 'RenameProjectController',
            resolve: {
                project_id: function() {
                    return $rootScope.activeProject;
                },
                old_name: function() {
                    return $rootScope.activeProjectName;
                }
            }
        });

        modalInstance.result.then(function() {

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
//delete not empty project modal controller
app.controller('DeleteProjectController',
    ['$scope', '$modalInstance', 'Project',
    function ($scope, $modalInstance, Project, id, name, gcount) {
    $scope.projectId = id;
    $scope.projectName = name;
    $scope.groupsCount = gcount;

    $scope.ok = function() {
        $modalInstance.close();
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
}]);

//////////////////////////////////
//rename project modal controller
app.controller('RenameProjectController',
    ['$scope', '$modalInstance', 'Project',
    function ($scope, $modalInstance, Project, id, oldName) {
    $scope.input = {};
    $scope.projectId = id;
    $scope.oldName = oldName;

    $scope.ok = function() {
        $modalInstance.close();
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
}]);
