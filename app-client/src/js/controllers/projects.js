/////////////////////////////////////////////////////////////////////
//projects list controller
app.controller('ProjectsController', ['$rootScope', '$scope', '$modal', 'Projects', function ($rootScope, $scope, $modal, Projects) {
    $rootScope.selectedProject = 0;
    $scope.projects = Projects.query();

    $scope.setProject = function(projectId, projectName, index) {
        $rootScope.activeProject = projectId;
        $rootScope.activeProjectName = projectName;
        $rootScope.selectedProject = index;
        $rootScope.activePage = 1;
        $rootScope.search_str = null;
        $rootScope.$broadcast('showProjectGroups');
    };

    $scope.addProject = function() {
        var modalInstance = $modal.open({
            templateUrl: 'templates/add_project.html',
            controller: AddProjectController,
        });
        modalInstance.result.then(function() {

        });
    };

    $scope.deleteProject = function() {
        var modalInstance = $modal.open({
            templateUrl: 'templates/delete_project.html',
            controller: DeleteProjectController,
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
            controller: RenameProjectController,
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
