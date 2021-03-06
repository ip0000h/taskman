/////////////////////////////////////////////////////////////////////
//////////////////////////////////
//tasks list controller
app.controller('AttachmentsListController',
    ['$scope', '$routeParams', '$modal', 'Attachments',
    function ($scope, $routeParams, $modal, Attachments) {
        $scope.attachments = [];
        $scope.selectedAttachments = [];
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
            } else {
                $scope.selectedAttachments.push(attachmentId);
            }
            $scope.selectAll = false;
        };

        //select all attachments
        $scope.selectAllAttachments = function() {
            $scope.selectedAttachments = [];
            if ($scope.selectAll) {
                $scope.selectAll = true;
                $scope.attachments.forEach(function(item) {
                    $scope.selectedAttachments.push(item.id);
                });
            } else {
                $scope.selectAll = false;
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
                $scope.selectAll = false;
            });
        };
}]);

//////////////////////////////////
//add attachment modal controller
app.controller('AddAttachmentController',
    ['$scope', '$modalInstance', 'Upload', 'Attachments', 'taskId',
    function ($scope, $modalInstance, Upload, Attachments, taskId) {
        $scope.input = {};
        $scope.taskId = taskId;

        $scope.ok = function() {

            $scope.$watch('files', function () {
                $scope.upload($scope.input.files);
            });

            function uploadSuccess (data, status, headers, config) {
                $scope.new_attachment.files.push(data);
            }

            $scope.upload = function (files) {
                if (files && files.length) {
                    $scope.new_attachment = Attachments.save(
                        {taskId: $scope.taskId},
                        {'comment': $scope.input.comment}
                    );
                    $scope.new_attachment.$promise.then(
                        function (value) {
                            $scope.new_attachment.files = Array();
                            for (var i = 0; i < files.length; i++) {
                                var upload = Upload.upload({
                                    url: '/api/uploads/' + $scope.new_attachment.id,
                                    file: files[i]
                                }).success(uploadSuccess);
                            }
                            $modalInstance.close($scope.new_attachment);
                        },
                        function (error) {
                            console.log(error);
                        }
                    );
                }
            };
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
