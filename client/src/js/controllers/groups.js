/////////////////////////////////////////////////////////////////////
//////////////////////////////////
//groups list controller
app.controller('GroupsController',
    ['$rootScope', '$scope', '$modal', 'Groups',
    function ($rootScope, $scope, $modal, Groups) {
        //init
        $scope.groups = Groups.query(function() {
            if ($scope.groups.length) {
                $rootScope.activeGroup = $scope.groups[0].id;
                $scope.selectedGroup = $scope.groups[0];
            }
            else {
                $rootScope.activeGroup=null;
            }
            $rootScope.$broadcast('showGroupProjects');
        });

        //select current group
        $scope.setGroup = function() {
            $rootScope.activeGroup = $scope.selectedGroup.id;
            $rootScope.$broadcast('showGroupProjects');
        };

        //add group
        $scope.addGroup = function() {
            var modalInstance = $modal.open({
                templateUrl: 'templates/add_group.html',
                controller: 'AddGroupController',
            });
            modalInstance.result.then(function(data) {
                $scope.groups.push(data);
                $rootScope.activeGroup = data.id;
                $scope.selectedGroup = data;
                $rootScope.$broadcast('showGroupProjects');
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
                        return $scope.selectedGroup.name;
                    },
                    projectsCount: function() {
                        return $scope.selectedGroup.projects_count;
                    }
                }
            });
            modalInstance.result.then(function() {
                var ind = $scope.groups.indexOf($scope.selectedGroup);
                $scope.groups.splice(ind, 1);
                if ($scope.groups.length) {

                    $rootScope.activeGroup = $scope.groups[0].id;
                    $scope.selectedGroup = $scope.groups[0];
                }
                else {
                    $rootScope.activeGroup=null;
                }
                $rootScope.$broadcast('showGroupProjects');
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
                        return $scope.selectedGroup.name;
                    }
                }
            });

            modalInstance.result.then(function(data) {
                $scope.groups[$scope.selectedGroup].name = data;
                $scope.selectedGroup.name = data;
            });
        };
}]);

//////////////////////////////////
//add group modal controller
app.controller('AddGroupController',
    ['$scope', '$modalInstance', 'Groups',
    function ($scope, $modalInstance, Groups) {
        $scope.input = {};

        $scope.ok = function() {
            if ($scope.input.name) {
                $scope.new_group = Groups.save({'name': $scope.input.name});
                $scope.new_group.$promise.then(
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
//delete group modal controller
app.controller('DeleteGroupController',
    ['$scope', '$modalInstance', 'Group', 'id', 'name', 'projectsCount',
    function ($scope, $modalInstance, Group, id, name, projectsCount) {
        $scope.groupId = id;
        $scope.groupName = name;
        $scope.projectsCount = projectsCount;

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
