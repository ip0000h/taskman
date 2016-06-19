from functools import wraps
from flask import Flask
from flask import abort, \
    flash, \
    render_template, \
    request, \
    send_from_directory, \
    send_file, \
    redirect, \
    url_for, \
    make_response, \
    jsonify
from werkzeug.datastructures import FileStorage
from werkzeug.contrib.fixers import ProxyFix
from flask_login import LoginManager, current_user, login_user, logout_user
from flask_restful import Resource, Api
from flask_restful import inputs, reqparse

import models
import serialize
from forms import LoginForm


# create flask application and load config from object
app = Flask(__name__)
app.config.from_object('config.AppConfig')

# init database with application
models.db.init_app(app)

# init application api
api = Api(app)


@app.errorhandler(400)
def bad_request(error):
    return make_response(jsonify({'error': 'Bad request'}), 400)


@app.errorhandler(404)
def not_found(error):
    return make_response(jsonify({'error': 'Not found'}), 404)


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            if not app.config['DEBUG']:
                return redirect(url_for(
                    'login', _scheme="https", _external=True))
            else:
                return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function


@app.route("/login", methods=["GET", "POST"])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        user = models.User.query.get(form.user.id)
        login_user(user)
        flash(u'Successfully logged in as %s' % form.user.username)
        if not app.config['DEBUG']:
            return redirect(request.args.get("next") or url_for(
                "index", _scheme="https", _external=True))
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
@login_required
def index():
    return render_template('index.html')


@app.route('/templates/<file_name>')
@login_required
def templates(file_name):
    return send_from_directory('templates', file_name)

# create and setup logger manager object
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'


@login_manager.user_loader
def load_user(userid):
    return models.User.query.get(userid)


class UserListAPI(Resource):

    decorators = [login_required]

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
            args['username'],
            args['password'],
            args['email'],
            args['jabber']
        )
        models.db.session.add(new_user)
        models.db.session.commit()
        return self.schema.dump(new_user).data


class UserAPI(Resource):

    decorators = [login_required]

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


class GroupListAPI(Resource):

    decorators = [login_required]

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument(
            'name', type=str, required=True,
            help='No group name provided', location='json')
        self.schema = serialize.GroupSchema()
        super(GroupListAPI, self).__init__()

    def get(self):
        groups = models.Group.query.all()
        return [self.schema.dump(group).data for group in groups]

    def post(self):
        args = self.reqparse.parse_args()
        new_group = models.Group(args['name'])
        models.db.session.add(new_group)
        models.db.session.commit()
        return self.schema.dump(new_group).data


class GroupAPI(Resource):

    decorators = [login_required]

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


class ProjectListAPI(Resource):

    decorators = [login_required]

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument(
            'name', type=str, required=True,
            help='No group name provided', location='json')
        self.schema = serialize.ProjectSchema()
        super(ProjectListAPI, self).__init__()

    def get(self, group_id):
        projects = models.Project.query.filter_by(group_id=group_id).all()
        return [self.schema.dump(project).data for project in projects]

    def post(self, group_id):
        args = self.reqparse.parse_args()
        new_project = models.Project(group_id, args['name'])
        models.db.session.add(new_project)
        models.db.session.commit()
        return self.schema.dump(new_project).data


class ProjectAPI(Resource):

    decorators = [login_required]

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


class TaskStatusListAPI(Resource):

    decorators = [login_required]

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument(
            'name', type=str, required=True,
            help='No task status name provided', location='json')
        self.reqparse.add_argument(
            'priority', type=int, required=True,
            help='No task status priority provided', location='json')
        self.schema = serialize.TaskStatusSchema()
        super(TaskStatusListAPI, self).__init__()

    def get(self):
        task_statuses = models.TaskStatus.query.all()
        return [
            self.schema.dump(task_status).data for task_status in task_statuses
        ]

    def post(self):
        args = self.reqparse.parse_args()
        new_task_status = models.TaskStatus(
            args['name'],
            args['priority']
        )
        models.db.session.add(new_task_status)
        models.db.session.commit()
        return self.schema.dump(new_task_status).data


class TaskStatusAPI(Resource):

    decorators = [login_required]

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument(
            'name', type=str, required=False, location='json')
        self.reqparse.add_argument(
            'priority', type=int, required=False, location='json')
        self.schema = serialize.TaskStatusSchema()
        super(GroupAPI, self).__init__()

    def get(self, id):
        task_status = models.TaskStatus.query.get(id)
        return self.schema.dump(task_status).data

    def put(self, id):
        task_status = models.TaskStatus.query.get(id)
        args = self.reqparse.parse_args()
        for k, v in args.items():
            if v is not None:
                setattr(task_status, k, v)
        models.db.session.commit()
        return {'status': 'ok'}

    def delete(self, id):
        task_status = models.TaskStatus.query.get(id)
        models.db.session.delete(task_status)
        models.db.session.commit()
        return {'status': 'ok'}


class TaskListAPI(Resource):

    decorators = [login_required]

    def __init__(self):
        # reqparse for new task
        self.post_reqparse = reqparse.RequestParser()
        self.post_reqparse.add_argument(
            'title', type=str, required=True,
            help='No task title provided', location='json')
        self.post_reqparse.add_argument(
            'text', type=str, required=False, location='json')
        self.post_reqparse.add_argument(
            'task_status_id', type=str, required=True,
            help='No task status id provided', location='json')
        self.post_reqparse.add_argument(
            'assigned', type=int, required=False, location='json')
        # reqparse for get tasks list
        self.get_reqparse = reqparse.RequestParser()
        self.get_reqparse.add_argument(
            'page', type=int, required=False, default=1, location='args')
        # schema for tasks list(short)
        self.short_schema = serialize.TaskShortSchema()
        # schema for creating new task(full)
        self.full_schema = serialize.TaskFullSchema()
        super(TaskListAPI, self).__init__()

    def get(self, project_id):
        args = self.get_reqparse.parse_args()
        tasks = models.Task.query. \
            filter_by(project_id=project_id). \
            join(models.Task.task_status). \
            order_by(
                models.TaskStatus.priority.desc(),
                models.Task.updated.desc()). \
            paginate(args['page'], app.config['TASKS_PAGE_SIZE'])
        return {
            'data': [
                self.short_schema.dump(task).data for task in tasks.items
            ],
            'pages': tasks.pages,
            'total': tasks.total
        }

    def post(self, project_id):
        args = self.post_reqparse.parse_args()
        new_task = models.Task(
            project_id,
            current_user.id,
            args['task_status_id'],
            args['title'],
            args['text'],
            args['assigned']
        )
        models.db.session.add(new_task)
        models.db.session.commit()
        return self.full_schema.dump(new_task).data


class TaskChangeListApi(Resource):

    decorators = [login_required]

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument(
            'id', type=int, required=True, action='append')
        self.reqparse.add_argument(
            'project_id', type=int, required=False, location='json')
        self.reqparse.add_argument(
            'task_status_id', type=int, required=False, location='json')
        super(TaskChangeListApi, self).__init__()

    def post(self):
        args = self.reqparse.parse_args()
        models.Task.query.filter(
            models.Task.id.in_(args['id'])).delete(synchronize_session='fetch')
        models.db.session.commit()
        return {'status': 'ok'}

    def put(self):
        args = self.reqparse.parse_args()
        tasks = models.Task.query.filter(models.Task.id.in_(args['id'])).all()
        del args['id']
        for task in tasks:
            for k, v in args.items():
                if v is not None:
                    setattr(task, k, v)
        models.db.session.commit()
        return {'status': 'ok'}


class TaskAPI(Resource):

    decorators = [login_required]

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument(
            'title', type=str, required=False,
            help='No task title provided', location='json')
        self.reqparse.add_argument(
            'text', type=str, required=False, location='json')
        self.reqparse.add_argument(
            'task_status_id', type=int, required=False,
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


class AttachmentListAPI(Resource):

    decorators = [login_required]

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument(
            'comment', type=str, required=False, location='json')
        self.schema = serialize.AttachmentSchema()
        super(AttachmentListAPI, self).__init__()

    def get(self, task_id):
        attachments = models.Attachment.query.filter_by(
            task_id=task_id).join(models.Attachment.files)
        return [
            self.schema.dump(attachment).data for attachment in attachments
        ]

    def post(self, task_id):
        args = self.reqparse.parse_args()
        new_attachment = models.Attachment(
            task_id,
            current_user.id,
            args['comment']
        )
        models.db.session.add(new_attachment)
        models.db.session.commit()
        return self.schema.dump(new_attachment).data


class AttachmentAPI(Resource):

    decorators = [login_required]

    def __init__(self):
        self.schema = serialize.AttachmentSchema()
        super(AttachmentAPI, self).__init__()

    def get(self, id):
        attachment = models.Attachment.query.get(id)
        return self.schema.dump(attachment).data

    def delete(self, id):
        attachment = models.Attachment.query.get(id)
        models.db.session.delete(attachment)
        models.db.session.commit()
        return {'status': 'ok'}


class AttachmentDeleteListApi(Resource):

    decorators = [login_required]

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument(
            'id', type=int, required=True, action='append')
        super(AttachmentDeleteListApi, self).__init__()

    def post(self):
        args = self.reqparse.parse_args()
        attachments = models.Attachment.query.filter(
            models.Attachment.id.in_(args['id'])).all()
        for attachment in attachments:
            models.db.session.delete(attachment)
        models.db.session.commit()
        return {'status': 'ok'}


class FileStorageArgument(reqparse.Argument):
    """This argument class for flask-restful will be used in
    all cases where file uploads need to be handled."""

    def convert(self, value, op):
        if self.type is FileStorage:  # only in the case of files
            # this is done as self.type(value) makes the name attribute of the
            # FileStorage object same as argument name
            # and value is a FileStorage
            # object itself anyways
            return value

        # called so that this argument class will also be useful in
        # cases when argument type is not a file.
        super(FileStorageArgument, self).convert(*args, **kwargs)


class FileAttachmentListAPI(Resource):

    decorators = [login_required]

    def __init__(self):
        self.reqparse = reqparse.RequestParser(
            argument_class=FileStorageArgument)
        self.reqparse.add_argument(
            'file', type=FileStorage, required=True, location='files')
        self.schema = serialize.AttachmentFileSchema()
        super(FileAttachmentListAPI, self).__init__()

    def get(self, attachment_id):
        a_files = models.AttachmentFile.query.filter_by(
            attachment_id=attachment_id).all()
        return [self.schema.dump(a_file).data for a_file in a_files]

    def post(self, attachment_id):
        args = self.reqparse.parse_args()
        upload_file = args['file']
        new_a_file = models.AttachmentFile(
            attachment_id,
            upload_file.filename
        )
        models.db.session.add(new_a_file)
        models.db.session.commit()
        if not new_a_file.save_file(args['file']):
            abort(400)
        return self.schema.dump(new_a_file).data


class FileAttachmentAPI(Resource):

    decorators = [login_required]

    def get(self, id):
        attachment_file = models.AttachmentFile.query.get(id)
        return send_file(
            attachment_file.get_file_path,
            as_attachment=True,
            attachment_filename=attachment_file.filename
        )

    def delete(self, id):
        attachment_file = models.AttachmentFile.query.get(id)
        models.db.session.delete(attachment_file)
        models.db.session.commit()
        return {'status': 'ok'}


class TimeListAPI(Resource):

    decorators = [login_required]

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument(
            'start', type=inputs.datetime_from_iso8601, required=True,
            help='No start time provided', location='json')
        self.reqparse.add_argument(
            'stop', type=inputs.datetime_from_iso8601,
            required=False, location='json')
        self.schema = serialize.TimeSchema()
        super(TimeListAPI, self).__init__()

    def get(self, task_id):
        times = models.Time.query.filter_by(task_id=task_id).all()
        return [self.schema.dump(time).data for time in times]

    def post(self, task_id):
        args = self.reqparse.parse_args()
        new_time = models.Time(
            task_id,
            current_user.id,
            args['start'].replace(tzinfo=None),
            None if args['stop'] is None else args['stop'].replace(tzinfo=None)
        )
        models.db.session.add(new_time)
        models.db.session.commit()
        return self.schema.dump(new_time).data


class TimeAPI(Resource):

    decorators = [login_required]

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument(
            'stop', type=inputs.datetime_from_iso8601, required=True,
            help='No stop time provided', location='json')
        self.schema = serialize.TimeSchema()
        super(TimeAPI, self).__init__()

    def get(self, id):
        time = models.Time.query.get(id)
        return self.schema.dump(time).data

    def put(self, id):
        time = models.Time.query.get(id)
        args = self.reqparse.parse_args()
        time.stop = args['stop'].replace(tzinfo=None)
        models.db.session.commit()
        return self.schema.dump(time).data

    def delete(self, id):
        time = models.Time.query.get(id)
        models.db.session.delete(time)
        models.db.session.commit()
        return {'status': 'ok'}


class TimeDeleteListApi(Resource):

    decorators = [login_required]

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument(
            'id', type=int, required=True, action='append')
        super(TimeDeleteListApi, self).__init__()

    def post(self):
        args = self.reqparse.parse_args()
        models.Time.query.filter(
            models.Time.id.in_(args['id'])).delete(synchronize_session='fetch')
        models.db.session.commit()
        return {'status': 'ok'}


api.add_resource(UserListAPI, '/api/users', endpoint='users')
api.add_resource(UserAPI, '/api/user/<int:id>', endpoint='user')

api.add_resource(GroupListAPI, '/api/groups', endpoint='groups')
api.add_resource(GroupAPI, '/api/group/<int:id>', endpoint='group')

api.add_resource(
    ProjectListAPI, '/api/projects/<int:group_id>', endpoint='projects')
api.add_resource(ProjectAPI, '/api/project/<int:id>', endpoint='project')

api.add_resource(
    TaskStatusListAPI, '/api/task_statuses', endpoint='task_statuses')
api.add_resource(
    TaskChangeListApi, '/api/task_status/<int:id>', endpoint='task_status')

api.add_resource(TaskListAPI, '/api/tasks/<int:project_id>', endpoint='tasks')
api.add_resource(TaskChangeListApi, '/api/tasks', endpoint='change_tasks')
api.add_resource(TaskAPI, '/api/task/<int:id>', endpoint='task')

api.add_resource(
    AttachmentListAPI, '/api/attachments/<int:task_id>', endpoint='attachments'
)
api.add_resource(
    AttachmentAPI, '/api/attachment/<int:id>', endpoint='attachment')
api.add_resource(
    AttachmentDeleteListApi, '/api/attachments', endpoint='delete_attachments')


api.add_resource(
    FileAttachmentListAPI,
    '/api/uploads/<int:attachment_id>',
    endpoint='uploads'
)
api.add_resource(
    FileAttachmentAPI,
    '/api/attachment/file/<int:id>',
    endpoint='attachment_file'
)

api.add_resource(TimeListAPI, '/api/times/<int:task_id>', endpoint='times')
api.add_resource(TimeAPI, '/api/time/<int:id>', endpoint='time')
api.add_resource(TimeDeleteListApi, '/api/times', endpoint='delete_times')


app.wsgi_app = ProxyFix(app.wsgi_app)

if __name__ == "__main__":
    app.run(port=app.config['PORT'])
