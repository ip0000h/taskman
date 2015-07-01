import datetime
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.bcrypt import generate_password_hash, check_password_hash
from sqlalchemy_utils.types.choice import ChoiceType
from itsdangerous import (TimedJSONWebSignatureSerializer
                          as Serializer, BadSignature, SignatureExpired)

from config import AppConfig

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(255))
    email = db.Column(db.String(50), unique=True, nullable=True)
    jabber = db.Column(db.String(50), unique=True, nullable=True)
    is_active = db.Column(db.Boolean)
    is_admin = db.Column(db.Boolean)

    created_tasks = db.relationship(
        'Task', backref='creator_user', lazy='dynamic', foreign_keys='Task.creator_id')
    assigned_tasks = db.relationship(
        'Task', backref='assign_user', lazy='dynamic', foreign_keys='Task.assigned_id')

    def __init__(self, username, password, email=None, jabber=None):
        self.username = username
        self.password = self.hash_password(password)
        self.jabber = jabber
        self.email = email

    def __repr__(self):
        return '<User {0}>'.format(self.username)

    def is_authenticated(self):
        return True

    def is_active(self):
        return True

    def is_anonymous(self):
        return False

    def get_id(self):
        return str(self.id)

    def set_password(self, new_password):
        self.password = self.hash_password(new_password)

    def check_password(self, password):
        return check_password_hash(self.password, password)

    @staticmethod
    def hash_password(password):
        return generate_password_hash(password)

    def generate_auth_token(self, expiration=600):
        s = Serializer(AppConfig.SECRET_KEY, expires_in=expiration)
        return s.dumps({'id': self.id})

    @staticmethod
    def verify_auth_token(token):
        s = Serializer(AppConfig.SECRET_KEY)
        try:
            data = s.loads(token)
        except SignatureExpired:
            return None  # valid token, but expired
        except BadSignature:
            return None  # invalid token
        user = User.query.get(data['id'])
        return user


class Project(db.Model):
    __tablename__ = 'projects'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True, nullable=False)
    created = db.Column(db.DateTime, nullable=False)

    groups = db.relationship('Group', backref='projects', lazy='dynamic')

    def __init__(self, name, created=None):
        self.name = name
        self.created = datetime.datetime.utcnow() if created is None else created

    def __repr__(self):
        return '<Project {0}>'.format(self.name)

    @property
    def groups_count(self):
        return self.groups.count()


class Group(db.Model):
    __tablename__ = 'groups'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True, nullable=False)
    created = db.Column(db.DateTime, nullable=False)

    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)

    tasks = db.relationship('Task', backref='groups', lazy='dynamic')

    def __init__(self, name, project_id, created=None):
        self.name = name
        self.project_id = project_id
        self.created = datetime.datetime.utcnow() if created is None else created

    def __repr__(self):
        return '<Group {0}>'.format(self.name)

    @property
    def tasks_count(self):
        return self.tasks.count()


class Task(db.Model):
    __tablename__ = 'tasks'

    TASK_STATUS_CHOICES = (
        (u'read', u'Read'),
        (u'unread', u'Unread'),
        (u'closed', u'Closed'),
    )

    id = db.Column(db.Integer, primary_key=True)
    created = db.Column(db.DateTime, nullable=False)
    updated = db.Column(db.DateTime, nullable=False)
    title = db.Column(db.String(255), nullable=False)
    text = db.Column(db.Text, nullable=True)
    status = db.Column(ChoiceType(TASK_STATUS_CHOICES), nullable=False)

    creator_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    assigned_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    group_id = db.Column(db.Integer, db.ForeignKey('groups.id'), nullable=False)

    attachments = db.relationship('Attachment', backref='tasks', lazy='dynamic')
    times = db.relationship('Time', backref='tasks', lazy='dynamic')

    def __init__(
        self,
        title,
        group_id,
        creator_id,
        text=None,
        status=u'read',
        assigned_id=None,
        created=None
    ):
        self.title = title
        self.group_id = group_id
        self.creator_id = creator_id
        self.text = text
        self.status = status
        self.assigned_id = assigned_id
        self.created = datetime.datetime.utcnow() if created is None else created
        self.updated = datetime.datetime.utcnow() if created is None else created

    def __repr__(self):
        return '<Task {0}>'.format(self.id)

    @property
    def status_text(self):
        return self.status.value

    @property
    def attachments_count(self):
        return self.attachments.count()

    @property
    def times_count(self):
        return self.times.count()

    def change_status(self, new_status):
        if new_status in [item[0] for item in self.TASK_STATUS_CHOICES]:
            self.status = new_status
        else:
            raise("Wrong status of Task")


class Attachment(db.Model):
    __tablename__ = 'attachments'

    id = db.Column(db.Integer, primary_key=True)
    created = db.Column(db.DateTime, nullable=False)
    filename = db.Column(db.String(255), nullable=False)

    task_id = db.Column(db.Integer, db.ForeignKey('tasks.id'), nullable=False)

    def __init__(self, filename, task_id, created=None):
        self.filename = filename
        self.task_id = task_id
        self.created = datetime.datetime.utcnow() if created is None else created

    def __repr__(self):
        return '<Attachment {0}>'.format(self.id)


class Time(db.Model):
    __tablename__ = 'times'

    id = db.Column(db.Integer, primary_key=True)
    start = db.Column(db.DateTime, nullable=False)
    stop = db.Column(db.DateTime, nullable=True)

    task_id = db.Column(db.Integer, db.ForeignKey('tasks.id'), nullable=False)

    def __init__(self, filename, task_id, created=None):
        self.filename = filename
        self.task_id = task_id
        self.created = datetime.datetime.utcnow() if created is None else created

    def __repr__(self):
        return '<Time {0}>'.format(self.id)
