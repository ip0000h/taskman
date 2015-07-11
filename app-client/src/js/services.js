/////////////////////////////////////////////////////////////////////
//app services
//////////////////////////////////
//projects list service
app.factory('Projects', ['$resource', function($resource) {
    return $resource(
        '/api/projects',
        null,
        {'query': {method: 'GET', isArray: true}}
    );
}]);

//////////////////////////////////
//project single service
app.factory('Project', ['$resource', function($resource) {
    return $resource(
        '/api/project/:projectId',
        null,
        {'update': {method:'PUT'}}
    );
}]);

//////////////////////////////////
//groups list service
app.factory('Groups', ['$resource', function($resource) {
    return $resource(
        '/api/groups/:projectId',
        null,
        {'query': {method: 'GET', isArray: true}}
    );
}]);

//////////////////////////////////
//group single service
app.factory('Group', ['$resource', function($resource) {
    return $resource(
        '/api/group/:groupId',
        null,
        {'update': {method:'PUT'}}
    );
}]);

//////////////////////////////////
//tasks list service
app.factory('Tasks', ['$resource', function($resource) {
    return $resource(
        '/api/tasks/:groupId',
        null,
        {
            'query': {method: 'GET', isArray: true},
            'remove': {method: 'POST'},
            'update': {method:'PUT'}
        }
    );
}]);

//////////////////////////////////
//task single service
app.factory('Task', ['$resource', function($resource) {
    return $resource(
        '/api/task/:taskId',
        null,
        {'update': {method:'PUT'}}
    );
}]);
