/////////////////////////////////////////////////////////////////////
//////////////////////////////////
//tasks list controller
app.controller('AttachmentsListController',
    ['$scope', '$routeParams', 'Attachments',
    function ($scope, $routeParams, Attachments) {
        $scope.attachment = Attachments.query({taskId: $routeParams.id});
}]);
