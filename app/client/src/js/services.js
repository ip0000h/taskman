/////////////////////////////////////////////////////////////////////
//app services

//////////////////////////////////
//groups list service
app.factory('Groups', ['$resource', function($resource) {
    return $resource(
        '/api/groups',
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
//projects list service
app.factory('Projects', ['$resource', function($resource) {
    return $resource(
        '/api/projects/:groupId',
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
//tasks statuses list service
app.factory('TaskStatuses', ['$resource', function($resource) {
    return $resource(
        '/api/task_statuses',
        null,
        {
            'query': {method: 'GET', isArray: true},
            'remove': {method: 'POST'},
            'update': {method:'PUT'}
        }
    );
}]);

//////////////////////////////////
//tasks status single service
app.factory('TaskStatus', ['$resource', function($resource) {
    return $resource(
        '/api/task_status/:taskStatusId',
        null,
        {'update': {method:'PUT'}}
    );
}]);

//////////////////////////////////
//tasks list service
app.factory('Tasks', ['$resource', function($resource) {
    return $resource(
        '/api/tasks/:projectId',
        null,
        {
            'query': {method: 'GET'},
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

//////////////////////////////////
//times list service
app.factory('Times', ['$resource', function($resource) {
    return $resource(
        '/api/times/:taskId',
        null,
        {
            'query': {method: 'GET', isArray: true},
            'remove': {method: 'POST'}
        }
    );
}]);

//////////////////////////////////
//time single service
app.factory('Time', ['$resource', function($resource) {
    return $resource(
        '/api/time/:timeId',
        null,
        {'update': {method:'PUT'}}
    );
}]);

//////////////////////////////////
//attachments list service
app.factory('Attachments', ['$resource', function($resource) {
    return $resource(
        '/api/attachments/:taskId',
        null,
        {
            'query': {method: 'GET', isArray: true},
            'remove': {method: 'POST'}
        }
    );
}]);

//////////////////////////////////
//attachment single service
app.factory('Attachment', ['$resource', function($resource) {
    return $resource(
        '/api/attachment/:attachmentId'
    );
}]);