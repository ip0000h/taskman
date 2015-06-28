from functools import wraps
from flask import Flask
from flask import redirect, render_template, request, send_from_directory, url_for
from flask.ext.restful import Resource, Api
from flask.ext.restful import reqparse
from flask.ext.login import LoginManager, current_user, login_user, logout_user

import models
import serialize
from forms import LoginForm

#create flask application and load config from object
app = Flask(__name__)
app.config.from_object('config.AppConfig')

#init database with application
models.db.init_app(app)

#init application api
api = Api(app)

#create and setup logger manager object
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated():
            if not app.config['DEBUG']:
                return redirect(url_for('login', _scheme="https", _external=True))
            else:
                return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function


@login_manager.user_loader
def load_user(userid):
    return models.User.query.get(userid)


@app.route("/login", methods=["GET", "POST"])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        user = models.User.query.get(form.user.id)
        login_user(user)
        if not app.config['DEBUG']:
            return redirect(request.args.get("next") or url_for("index", _scheme="https", _external=True))
        else:
            return redirect(request.args.get("next") or url_for("index"))
    return render_template("login.html", form=form)


@app.route("/logout")
@login_required
def logout():
    logout_user()
    if not app.config['DEBUG']:
        return redirect(url_for("login", _scheme="https", _external=True))
    else:
        return redirect(url_for("login"))


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/templates/<file_name>')
@login_required
def templates(file_name):
    return send_from_directory('templates', file_name)


class ProjectListAPI(Resource):

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument(
            'name', type=str, required=True,
            help='No group name provided', location='json')
        self.schema = serialize.ProjectSchema()
        super(ProjectListAPI, self).__init__()

    def get(self):
        res = {}
        projects = models.Project.query.all()
        res['data'] = [self.schema.dump(project).data for project in projects]
        return res

    def post(self):
        res = {}
        args = self.reqparse.parse_args()
        new_project = models.Project(args['name'])
        models.db.session.add(new_project)
        models.db.session.commit()
        res['data'] = self.schema.dump(new_project).data
        return res


class ProjectAPI(Resource):

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
        return {'status': 'ok'}

    def delete(self, id):
        project = models.Project.query.get(id)
        models.db.session.delete(project)
        return {'status': 'ok'}


class GroupListAPI(Resource):

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument(
            'name', type=str, required=True,
            help='No group name provided', location='json')
        self.schema = serialize.GroupSchema()
        super(GroupListAPI, self).__init__()

    def get(self, project_id):
        res = {}
        groups = models.Group.query.filter_by(project_id=project_id).all()
        res['data'] = [self.schema.dump(group).data for group in groups]
        return res

    def post(self, project_id):
        res = {}
        args = self.reqparse.parse_args()
        new_group = models.Group(args['name'], project_id)
        models.db.session.add(new_group)
        models.db.session.commit()
        res['data'] = self.schema.dump(new_group).data
        return res


class GroupAPI(Resource):

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
        return {'status': 'ok'}

    def delete(self, id):
        group = models.Group.query.get(id)
        models.db.session.delete(group)
        return {'status': 'ok'}


class TaskListAPI(Resource):

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
        res = {}
        tasks = models.Task.query.filter_by(group_id=group_id).all()
        res['data'] = [self.short_schema.dump(task).data for task in tasks]
        return res

    def post(self, group_id):
        res = {}
        args = self.reqparse.parse_args()
        #REDO
        new_task = models.Task(
            args['title'], group_id, None, args['text'], args['status'])
        models.db.session.add(new_task)
        models.db.session.commit()
        res['data'] = self.full_schema.dump(new_task).data
        return res


class TaskAPI(Resource):

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
        res = {}
        task = models.Task.query.get(id)
        res['data'] = self.schema.dump(task)
        return res

    def put(self, id):
        task = models.Task.query.get(id)
        return {'status': 'ok'}

    def delete(self, id):
        task = models.Task.query.get(id)
        models.db.session.delete(task)
        return {'status': 'ok'}

api.add_resource(ProjectListAPI, '/api/projects', endpoint='projects')
api.add_resource(ProjectAPI, '/api/project/<int:id>', endpoint='project')
api.add_resource(GroupListAPI, '/api/groups/<int:project_id>', endpoint='groups')
api.add_resource(GroupAPI, '/api/group/<int:id>', endpoint='group')
api.add_resource(TaskListAPI, '/api/tasks/<int:group_id>', endpoint='tasks')
api.add_resource(TaskAPI, '/api/task/<int:id>', endpoint='task')

if __name__ == "__main__":
    app.run()
