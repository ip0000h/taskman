/////////////////////////////////////////////////////////////////////
//////////////////////////////////
//groups list controller
app.controller('GroupsController',
    ['$rootScope', '$scope', '$modal', 'Groups',
    function ($rootScope, $scope, $modal, Groups) {

    $rootScope.$on('showProjectsGroups', function() {
        $scope.groups = Groups.query({projectId: $rootScope.activeProject}, function(){
            if ($scope.groups.length) {
                $rootScope.activeGroup = $scope.groups[0].id;
                $scope.selectedGroup = 0;
            }
            else{
                $rootScope.activeGroup = null
            }
            $rootScope.$broadcast('showGroupTasks');
        });
    });

    $scope.setGroup = function(groupId, groupName, index) {
        $rootScope.activeGroup = groupId;
        $scope.activeGroupName = groupName;
        $scope.selectedGroup = index;
        $rootScope.activePage = 1;
        $rootScope.search_str = null;
        $rootScope.$broadcast('showGroupTasks');
    };

    $scope.addGroup = function() {
        var modalInstance = $modal.open({
            templateUrl: 'templates/add_group.html',
            controller: 'AddGroupController',
        });
        modalInstance.result.then(function() {

        });
    };

    $scope.deleteGroup = function() {
        var modalInstance = $modal.open({
            templateUrl: 'templates/delete_group.html',
            controller: 'DeleteGroupController',
            resolve: {
                group_id: function() {
                    return $rootScope.activeGroup;
                },
                group_name: function() {
                    return $scope.activeGroupName;
                }
            }
        });
        modalInstance.result.then(function() {

        });
    };

    $scope.renameGroup = function() {
        var modalInstance = $modal.open({
            templateUrl: 'templates/rename_group.html',
            controller: 'RenameGroupController',
            resolve: {
                group_id: function() {
                    return $rootScope.activeGroup;
                },
                old_name: function() {
                    return $scope.activeGroupName;
                }
            }
        });

        modalInstance.result.then(function() {

        });
    };
}]);

//////////////////////////////////
//add group controller
app.controller('AddGroupController',
    ['$scope', '$modalInstance', 'Groups',
    function ($scope, $modalInstance, Groups) {
    $scope.input = {};

    $scope.ok = function() {
        if ($scope.input.name) {
        }
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
}]);

//////////////////////////////////
//delete not empty group modal controller
app.controller('DeleteGroupController',
    ['$scope', '$modalInstance',
    function ($scope, $modalInstance, id, name, tcount) {
    $scope.group_id = id;
    $scope.groupName = name;
    $scope.tasksCount = tcount;

    $scope.ok = function() {
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
}]);

//////////////////////////////////
//rename group modal controller
app.controller('RenameGroupController',
    ['$scope', '$modalInstance',
    function ($scope, $modalInstance, id, oldName) {
    $scope.input = {};
    $scope.groupId = id;
    $scope.oldName = oldName;

    $scope.ok = function() {
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
}]);
