/////////////////////////////////////////////////////////////////////
//groups list controller
app.controller('GroupsController', ['$rootScope', '$scope', '$modal', 'Groups', function ($rootScope, $scope, $modal, Groups) {
    $rootScope.selectedGroup = 0;
    $rootScope.activeProject = 1;
    $scope.groups = Groups.query({projectId: $rootScope.activeProject});

    $scope.setGroup = function(groupId, groupName, index) {
        $rootScope.activeGroup = groupId;
        $rootScope.activeGroupName = groupName;
        $rootScope.selectedGroup = index;
        $rootScope.activePage = 1;
        $rootScope.search_str = null;
        $rootScope.$broadcast('showGroupTasks');
    };

    $scope.addGroup = function() {
        var modalInstance = $modal.open({
            templateUrl: 'templates/add_group.html',
            controller: AddGroupController,
        });
        modalInstance.result.then(function() {

        });
    };

    $scope.deleteGroup = function() {
        var modalInstance = $modal.open({
            templateUrl: 'templates/delete_group.html',
            controller: DeleteGroupController,
            resolve: {
                group_id: function() {
                    return $rootScope.activeGroup;
                },
                group_name: function() {
                    return $rootScope.activeGroupName;
                }
            }
        });
        modalInstance.result.then(function() {

        });
    };

    $scope.renameGroup = function() {
        var modalInstance = $modal.open({
            templateUrl: 'templates/rename_group.html',
            controller: RenameGroupController,
            resolve: {
                group_id: function() {
                    return $rootScope.activeGroup;
                },
                old_name: function() {
                    return $rootScope.activeGroupName;
                }
            }
        });

        modalInstance.result.then(function() {

        });

    };
}]);
