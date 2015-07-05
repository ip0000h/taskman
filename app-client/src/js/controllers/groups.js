/////////////////////////////////////////////////////////////////////
//////////////////////////////////
//groups list controller
app.controller('GroupsController',
    ['$rootScope', '$scope', '$modal', 'Groups',
    function ($rootScope, $scope, $modal, Groups) {
    //root broadcast event showProjectsGroups
    $rootScope.$on('showProjectsGroups', function() {
        $scope.groups = Groups.query({projectId: $rootScope.activeProject}, function(){
            if ($scope.groups.length) {
                $rootScope.activeGroup = $scope.groups[0].id;
                $scope.activeGroupName = $scope.groups[0].name;
                $scope.selectedGroup = 0;
            }
            else{
                $rootScope.activeGroup = null;
            }
            $rootScope.$broadcast('showGroupTasks');
        });
    });

    //select current group
    $scope.setGroup = function(groupId, groupName, index) {
        $rootScope.activeGroup = groupId;
        $scope.activeGroupName = groupName;
        $scope.selectedGroup = index;
        $rootScope.activePage = 1;
        $rootScope.search_str = null;
        $rootScope.$broadcast('showGroupTasks');
    };

    //add group
    $scope.addGroup = function() {
        var modalInstance = $modal.open({
            templateUrl: 'templates/add_group.html',
            controller: 'AddGroupController',
            resolve: {
                projectId: function() {
                    return $rootScope.activeProject;
                }
            }
        });
        modalInstance.result.then(function(data) {
            $scope.groups.push(data);
            $rootScope.activeGroup = data.id;
            $scope.selectedGroup = $scope.groups.length - 1;
            $rootScope.$broadcast('showGroupTasks');
        });
    };

    //delete group
    $scope.deleteGroup = function() {
        var modalInstance = $modal.open({
            templateUrl: 'templates/delete_group.html',
            controller: 'DeleteGroupController',
            resolve: {
                id: function() {
                    return $rootScope.activeGroup;
                },
                name: function() {
                    return $scope.activeGroupName;
                }
            }
        });
        modalInstance.result.then(function() {
            $scope.groups.splice($scope.selectedGroup, 1);
            if ($scope.groups.length) {
                $rootScope.activeGroup = $scope.groups[0].id;
                $scope.activeGroupName = $scope.groups[0].name;
                $scope.selectedGroup = 0;
            }
            else {
                $rootScope.activeProject=null;
            }
            $rootScope.$broadcast('showGroupTasks');
        });
    };

    //rename group
    $scope.renameGroup = function() {
        var modalInstance = $modal.open({
            templateUrl: 'templates/rename_group.html',
            controller: 'RenameGroupController',
            resolve: {
                id: function() {
                    return $rootScope.activeGroup;
                },
                oldName: function() {
                    return $scope.activeGroupName;
                }
            }
        });

        modalInstance.result.then(function(data) {
            $scope.groups[$scope.selectedGroup].name = data;
            $scope.activeGroupName = data;
        });
    };
}]);

//////////////////////////////////
//add group controller
app.controller('AddGroupController',
    ['$scope', '$modalInstance', 'Groups', 'projectId',
    function ($scope, $modalInstance, Groups, projectId) {
        $scope.input = {};
        $scope.projectId = projectId;
        $scope.ok = function() {
            if ($scope.input.name) {
                var result = Groups.save(
                    {projectId: $scope.projectId},
                    {'name': $scope.input.name}
                );
                $modalInstance.close(result);
            }
        };

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
}]);

//////////////////////////////////
//delete group modal controller
app.controller('DeleteGroupController',
    ['$scope', '$modalInstance', 'Group', 'id', 'name',
    function ($scope, $modalInstance, Group, id, name, tcount) {
        $scope.groupId = id;
        $scope.groupName = name;
        $scope.tasksCount = tcount;

        $scope.ok = function() {
            Group.remove(
                {groupId: $scope.groupId}
            );
            $modalInstance.close();
        };

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
}]);

//////////////////////////////////
//rename group modal controller
app.controller('RenameGroupController',
    ['$scope', '$modalInstance', 'Group', 'id', 'oldName',
    function ($scope, $modalInstance, Group, id, oldName) {
        $scope.input = {};
        $scope.groupId = id;
        $scope.oldName = oldName;

        $scope.ok = function() {
            Group.update(
                {groupId: $scope.groupId},
                {'name': $scope.input.newName}
            );
            $modalInstance.close($scope.input.newName);
        };

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
}]);
