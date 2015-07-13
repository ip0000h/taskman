/////////////////////////////////////////////////////////////////////
//////////////////////////////////
//tasks list controller
app.controller('AttachmentsListController',
    ['$scope', '$routeParams', '$modal', 'Attachments',
    function ($scope, $routeParams, $modal, Attachments) {
        $scope.attachments = [];
        $scope.selectedAttachments = [];
        $scope.selectAll = false;
        $scope.attachments = Attachments.query({taskId: $routeParams.id});

        //add attachment
        $scope.addAttachment = function() {
            var modalInstance = $modal.open({
                templateUrl: 'templates/add_attachment.html',
                controller: 'AddAttachmentController',
                resolve: {
                    taskId: function() {
                        return $routeParams.id;
                    }
                }
            });
            modalInstance.result.then(function(data) {
                $scope.attachments.push(data);
            });
        };

        //select attachment
        $scope.selectAttachment = function(attachmentId) {
            var position = $.inArray(attachmentId, $scope.selectedAttachments);
            if (position + 1) {
                $scope.selectedAttachments.splice(position, 1);
                $scope.selectAll = false;
            } else {
                $scope.selectedAttachments.push(attachmentId);
                $scope.selectAll = false;
            }
        };

        //select all attachments
        $scope.selectAllAttachments = function() {
            $scope.selectedAttachments = [];
            if ($scope.selectAll) {
                $scope.selectAll = false;
            } else {
                $scope.selectAll = true;
                $scope.attachments.forEach(function(item) {
                    $scope.selectedAttachments.push(item.id);
                });
            }
            $scope.attachments.forEach(function(item) {
                item.selected = $scope.selectAll;
            });
        };

        //delete attachments
        $scope.deleteAttachments = function() {
            if ($scope.selectedAttachments.length === 0) {
                alert("No selected attachments");
                return;
            }
            var modalInstance = $modal.open({
                templateUrl: 'templates/delete_attachments.html',
                controller: 'DeleteAttachmentsController',
                resolve: {
                    selectedAttachments: function() {
                        return $scope.selectedAttachments;
                    }
                }
            });
            modalInstance.result.then(function() {
                $scope.attachments = $scope.attachments.filter(function(item) {
                    return !item.selected;
                });
                $scope.selectedAttachments = [];
            });
        };
}]);

//////////////////////////////////
//add attachment modal controller
app.controller('AddAttachmentController',
    ['$scope', '$modalInstance', 'Attachments', 'taskId',
    function ($scope, $modalInstance, Attachments, taskId) {
        $scope.input = {};
        $scope.taskId = taskId;

        $scope.ok = function() {
            var fd = new FormData();
            fd.append('file', $scope.upload.file);
            var result = Attachments.save(
                {taskId: $scope.taskId},
                fd
            );
            $modalInstance.close(result);
        };

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
}]);

//////////////////////////////////
//delete attachments modal controller
app.controller('DeleteAttachmentsController',
    ['$scope', '$modalInstance', 'Attachments', 'selectedAttachments',
    function ($scope, $modalInstance, Attachments, selectedAttachments) {
        $scope.selectedAttachments = selectedAttachments;

        $scope.ok = function() {
            Attachments.remove(
                {},
                {'id': $scope.selectedAttachments}
            );
            $modalInstance.close();
        };

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
}]);
