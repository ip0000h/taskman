/////////////////////////////////////////////////////////////////////
//app services
//////////////////////////////////
//projects list service
app.factory('Projects', ['$resource', function($resource) {
    return $resource(
        '/api/projects',
        null,
        {'query': { method: 'GET', isArray: true}}
    );
}]);

//////////////////////////////////
//project single service
app.factory('Project', ['$resource', function($resource) {
    return $resource('/api/project/:projectId');
}]);

//////////////////////////////////
//groups list service
app.factory('Groups', ['$resource', function($resource) {
    return $resource(
        '/api/groups/:projectId',
        null,
        {'query': { method: 'GET', isArray: true}}
    );
}]);

//////////////////////////////////
//group single service
app.factory('Group', ['$resource', function($resource) {
    return $resource('/api/group/:groupId');
}]);

//////////////////////////////////
//tasks list service
app.factory('Tasks', ['$resource', function($resource) {
    return $resource(
        '/api/tasks/:groupId',
        null,
        {'query': { method: 'GET', isArray: true}}
    );
}]);

//////////////////////////////////
//task single service
app.factory('Task', ['$resource', function($resource) {
    return $resource('/api/task/:taskId');
}]);
