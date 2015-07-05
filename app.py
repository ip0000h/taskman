from flask import Flask
from flask import g, jsonify, render_template, send_from_directory
from flask.ext.restful import Resource, Api
from flask.ext.restful import reqparse
from flask.ext.httpauth import HTTPBasicAuth

import models
import serialize

#create flask application and load config from object
app = Flask(__name__)
app.config.from_object('config.AppConfig')

#init database with application
models.db.init_app(app)

#init application api
api = Api(app)

#init auth object
auth = HTTPBasicAuth()


@auth.verify_password
def verify_password(username_or_token, password):
    # first try to authenticate by token
    user = models.User.verify_auth_token(username_or_token)
    if not user:
        # try to authenticate with username/password
        user = models.User.query.filter_by(username=username_or_token).first()
        if not user or not user.check_password(password):
            return False
    g.user = user
    return True


@app.route('/api/token')
@auth.login_required
def get_auth_token():
    token = g.user.generate_auth_token()
    return jsonify({'token': token.decode('ascii')})


@app.route('/')
@auth.login_required
def index():
    return render_template('index.html')


@app.route('/templates/<file_name>')
@auth.login_required
def templates(file_name):
    return send_from_directory('templates', file_name)


class UserListAPI(Resource):

    decorators = [auth.login_required]

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument(
            'username', type=str, required=True,
            help='No username provided', location='json')
        self.reqparse.add_argument(
            'password', type=str, required=True,
            help='No password provided', location='json')
        self.reqparse.add_argument(
            'email', type=str, required=False, location='json')
        self.reqparse.add_argument(
            'jabber', type=str, required=False, location='json')
        self.schema = serialize.UserSchema()
        super(UserListAPI, self).__init__()

    def get(self):
        users = models.User.query.all()
        return [self.schema.dump(user).data for user in users]

    def post(self):
        args = self.reqparse.parse_args()
        new_user = models.User(
            args['username'], args['password'], args['email'], args['jabber'])
        models.db.session.add(new_user)
        models.db.session.commit()
        return self.schema.dump(new_user).data


class UserAPI(Resource):

    decorators = [auth.login_required]

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument(
            'password', type=str, required=False, location='json')
        self.reqparse.add_argument(
            'email', type=str, required=False, location='json')
        self.reqparse.add_argument(
            'jabber', type=str, required=False, location='json')
        self.schema = serialize.UserSchema()
        super(UserAPI, self).__init__()

    def get(self, id):
        user = models.User.query.get(id)
        return self.schema.dump(user).data

    def put(self, id):
        user = models.User.query.get(id)
        args = self.reqparse.parse_args()
        for k, v in args.items():
            if v is not None:
                setattr(user, k, v)
        models.db.session.commit()
        return {'status': 'ok'}

    def delete(self, id):
        user = models.User.query.get(id)
        models.db.session.delete(user)
        models.db.session.commit()
        return {'status': 'ok'}


class ProjectListAPI(Resource):

    decorators = [auth.login_required]

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument(
            'name', type=str, required=True,
            help='No group name provided', location='json')
        self.schema = serialize.ProjectSchema()
        super(ProjectListAPI, self).__init__()

    def get(self):
        projects = models.Project.query.all()
        return [self.schema.dump(project).data for project in projects]

    def post(self):
        args = self.reqparse.parse_args()
        new_project = models.Project(args['name'])
        models.db.session.add(new_project)
        models.db.session.commit()
        return self.schema.dump(new_project).data


class ProjectAPI(Resource):

    decorators = [auth.login_required]

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument(
            'name', type=str, required=True,
            help='No group name provided', location='json')
        self.schema = serialize.ProjectSchema()
        super(ProjectAPI, self).__init__()

    def get(self, id):
        project = models.Project.query.get(id)
        return self.schema.dump(project).data

    def put(self, id):
        project = models.Project.query.get(id)
        args = self.reqparse.parse_args()
        for k, v in args.items():
            if v is not None:
                setattr(project, k, v)
        models.db.session.commit()
        return {'status': 'ok'}

    def delete(self, id):
        project = models.Project.query.get(id)
        models.db.session.delete(project)
        models.db.session.commit()
        return {'status': 'ok'}


class GroupListAPI(Resource):

    decorators = [auth.login_required]

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument(
            'name', type=str, required=True,
            help='No group name provided', location='json')
        self.schema = serialize.GroupSchema()
        super(GroupListAPI, self).__init__()

    def get(self, project_id):
        groups = models.Group.query.filter_by(project_id=project_id).all()
        return [self.schema.dump(group).data for group in groups]

    def post(self, project_id):
        args = self.reqparse.parse_args()
        new_group = models.Group(args['name'], project_id)
        models.db.session.add(new_group)
        models.db.session.commit()
        return self.schema.dump(new_group).data


class GroupAPI(Resource):

    decorators = [auth.login_required]

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument(
            'name', type=str, required=True,
            help='No group name provided', location='json')
        self.schema = serialize.GroupSchema()
        super(GroupAPI, self).__init__()

    def get(self, id):
        group = models.Group.query.get(id)
        return self.schema.dump(group).data

    def put(self, id):
        group = models.Group.query.get(id)
        args = self.reqparse.parse_args()
        for k, v in args.items():
            if v is not None:
                setattr(group, k, v)
        models.db.session.commit()
        return {'status': 'ok'}

    def delete(self, id):
        group = models.Group.query.get(id)
        models.db.session.delete(group)
        models.db.session.commit()
        return {'status': 'ok'}


class TaskListAPI(Resource):

    decorators = [auth.login_required]

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument(
            'title', type=str, required=True,
            help='No task title provided', location='json')
        self.reqparse.add_argument(
            'text', type=str, required=False, location='json')
        self.reqparse.add_argument(
            'status', type=str, required=True,
            help='No task status provided', location='json')
        self.reqparse.add_argument(
            'assigned', type=int, required=False, location='json')
        self.short_schema = serialize.TaskShortSchema()
        self.full_schema = serialize.TaskFullSchema()
        super(TaskListAPI, self).__init__()

    def get(self, group_id):
        tasks = models.Task.query.filter_by(group_id=group_id).all()
        return [self.short_schema.dump(task).data for task in tasks]

    def post(self, group_id):
        args = self.reqparse.parse_args()
        new_task = models.Task(
            args['title'], group_id, g.user.id, args['text'], args['status'], args['assigned'])
        models.db.session.add(new_task)
        models.db.session.commit()
        return self.full_schema.dump(new_task).data


class TaskAPI(Resource):

    decorators = [auth.login_required]

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument(
            'title', type=str, required=True,
            help='No task title provided', location='json')
        self.reqparse.add_argument(
            'text', type=str, required=False, location='json')
        self.reqparse.add_argument(
            'status', type=str, required=True,
            help='No task status provided', location='json')
        self.reqparse.add_argument(
            'assigned', type=int, required=False, location='json')
        self.schema = serialize.TaskFullSchema()
        super(TaskAPI, self).__init__()

    def get(self, id):
        task = models.Task.query.get(id)
        return self.schema.dump(task).data

    def put(self, id):
        task = models.Task.query.get(id)
        args = self.reqparse.parse_args()
        for k, v in args.items():
            if v is not None:
                setattr(task, k, v)
        models.db.session.commit()
        return {'status': 'ok'}

    def delete(self, id):
        task = models.Task.query.get(id)
        models.db.session.delete(task)
        models.db.session.commit()
        return {'status': 'ok'}


api.add_resource(UserListAPI, '/api/users', endpoint='users')
api.add_resource(UserAPI, '/api/user/<int:id>', endpoint='user')
api.add_resource(ProjectListAPI, '/api/projects', endpoint='projects')
api.add_resource(ProjectAPI, '/api/project/<int:id>', endpoint='project')
api.add_resource(GroupListAPI, '/api/groups/<int:project_id>', endpoint='groups')
api.add_resource(GroupAPI, '/api/group/<int:id>', endpoint='group')
api.add_resource(TaskListAPI, '/api/tasks/<int:group_id>', endpoint='tasks')
api.add_resource(TaskAPI, '/api/task/<int:id>', endpoint='task')

if __name__ == "__main__":
    app.run()
