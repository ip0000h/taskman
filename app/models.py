import os
from datetime import datetime

from flask.ext.bcrypt import check_password_hash, generate_password_hash
from flask.ext.sqlalchemy import SQLAlchemy
from sqlalchemy import event

from config import AppConfig

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = 'users'
    # main fields
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    # optional fields
    email = db.Column(db.String(50), unique=True, nullable=True)
    jabber = db.Column(db.String(50), unique=True, nullable=True)
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    is_admin = db.Column(db.Boolean, nullable=False, default=False)
    # relationships
    created_tasks = db.relationship(
        'Task', backref='creator_user',
        lazy='dynamic', foreign_keys='Task.creator_id')
    assigned_tasks = db.relationship(
        'Task', backref='assign_user',
        lazy='dynamic', foreign_keys='Task.assigned_id')
    attachments = db.relationship(
        'Attachment', backref='user',
        lazy='dynamic', foreign_keys='Attachment.user_id')
    times = db.relationship(
        'Time', backref='user', lazy='dynamic', foreign_keys='Time.user_id')

    def __init__(self, username, password, email=None, jabber=None):
        self.username = username
        self.password = self.hash_password(password)
        self.jabber = jabber
        self.email = email

    def __repr__(self):
        return '<User {0}>'.format(self.username)

    def is_authenticated(self):
        return True

    # is user active function
    def is_active(self):
        return self.is_active

    # is admin function
    def is_admin(self):
        return self.is_admin

    # is anonymous function
    def is_anonymous(self):
        return False

    # returns string of id
    def get_id(self):
        return str(self.id)

    # set password function
    def set_password(self, new_password):
        self.password = self.hash_password(new_password)

    # check password function
    def check_password(self, password):
        return check_password_hash(self.password, password)

    @staticmethod
    def hash_password(password):
        return generate_password_hash(password)


class Group(db.Model):
    __tablename__ = 'groups'
    # main fields
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True, nullable=False)
    created = db.Column(db.DateTime, nullable=False)

    # relationships
    projects = db.relationship(
        'Project', backref='group', cascade="all,delete", lazy='dynamic')

    def __init__(self, name, created=None):
        self.name = name
        self.created = datetime.utcnow() if created is None else created

    def __repr__(self):
        return '<Group {0}>'.format(self.name)

    @property
    def projects_count(self):
        return self.projects.count()


class Project(db.Model):
    __tablename__ = 'projects'
    # main fields
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True, nullable=False)
    created = db.Column(db.DateTime, nullable=False)

    # parent
    group_id = db.Column(
        db.Integer, db.ForeignKey('groups.id'), nullable=False)

    # relationships
    tasks = db.relationship(
        'Task', backref='project', cascade="all,delete", lazy='dynamic')

    def __init__(self, group_id, name, created=None):
        self.group_id = group_id
        self.name = name
        self.created = datetime.utcnow() if created is None else created

    def __repr__(self):
        return '<Project {0}>'.format(self.name)

    @property
    def tasks_count(self):
        return self.tasks.count()


class TaskStatus(db.Model):
    __tablename__ = 'task_statuses'
    # main fields
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True, nullable=False)
    priority = db.Column(db.Integer, unique=True, nullable=False)

    def __init__(self, name, priority):
        self.name = name
        self.priority = priority

    def __repr__(self):
        return '<TaskStatus {0}>'.format(self.name)


class Task(db.Model):
    __tablename__ = 'tasks'
    # main fields
    id = db.Column(db.Integer, primary_key=True)
    created = db.Column(db.DateTime, nullable=False)
    updated = db.Column(db.DateTime, nullable=False)
    due_date = db.Column(db.Date, nullable=True)
    title = db.Column(db.String(255), nullable=False)
    text = db.Column(db.Text, nullable=True)

    # parent
    creator_id = db.Column(
        db.Integer, db.ForeignKey('users.id'), nullable=False)
    assigned_id = db.Column(
        db.Integer, db.ForeignKey('users.id'), nullable=True)
    project_id = db.Column(
        db.Integer, db.ForeignKey('projects.id'), nullable=False)
    task_status_id = db.Column(
        db.Integer, db.ForeignKey('task_statuses.id'), nullable=False)
    task_status = db.relationship('TaskStatus', backref='tasks')

    # relationships
    attachments = db.relationship(
        'Attachment', backref='task', cascade="all,delete", lazy='dynamic')
    times = db.relationship(
        'Time', backref='task', cascade="all,delete", lazy='dynamic')

    def __init__(
        self,
        project_id,
        creator_id,
        task_status_id,
        title,
        text=None,
        assigned_id=None,
        created=None
    ):
        self.project_id = project_id
        self.creator_id = creator_id
        self.task_status_id = task_status_id
        self.title = title
        self.text = text
        self.assigned_id = assigned_id
        self.created = datetime.utcnow() if created is None else created
        self.updated = datetime.utcnow() if created is None else created

    def __repr__(self):
        return '<Task {0}>'.format(self.id)

    @property
    def status(self):
        return self.task_status.name

    @property
    def status_priority(self):
        return self.task_status.priority

    @property
    def attachments_count(self):
        return self.attachments.count()

    @property
    def times_count(self):
        return self.times.count()

    @property
    def creator_username(self):
        return self.creator_user.username

    @property
    def assigned_username(self):
        return self.assigned_user.username


def task_after_update_listener(mapper, connection, target):
    target.updated = datetime.utcnow()

event.listen(
    Task, 'after_update', task_after_update_listener)


class Attachment(db.Model):
    __tablename__ = 'attachments'
    # main fields
    id = db.Column(db.Integer, primary_key=True)
    created = db.Column(db.DateTime, nullable=False)
    comment = db.Column(db.String(255), nullable=True)

    # parent
    task_id = db.Column(db.Integer, db.ForeignKey('tasks.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    # relationships
    files = db.relationship(
        'AttachmentFile', backref='attachment',
        cascade="all,delete", lazy='dynamic')

    def __init__(self, task_id, user_id, comment=None, created=None):
        self.task_id = task_id
        self.comment = comment
        self.user_id = user_id
        self.created = datetime.utcnow() if created is None else created
        if not os.path.exists(self.get_dir_path):
            os.makedirs(self.get_dir_path)

    def __repr__(self):
        return '<Attachment {0}>'.format(self.id)

    @property
    def user_text(self):
        return self.user.username

    @property
    def files_count(self):
        return self.files.count()

    @property
    def get_dir_path(self):
        return os.path.join(
            AppConfig.UPLOAD_FOLDER,
            'attachments',
            str(self.user_id),
            self.created.strftime("%Y_%m_%d_%H_%M_%S")
        )


def attachment_after_update_listener(mapper, connection, target):
    target.task.updated = datetime.utcnow()

event.listen(
    Attachment, 'after_update', task_after_update_listener)


def attachment_after_delete_listener(mapper, connection, target):
    try:
        os.rmdir(target.get_dir_path)
    except Exception as e:
        print("Error: Unknown error occurred: {0}".format(e))

event.listen(
    Attachment, 'after_delete', attachment_after_delete_listener)


class AttachmentFile(db.Model):
    __tablename__ = 'attachment_files'
    # main fields
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)

    # parent
    attachment_id = db.Column(
        db.Integer, db.ForeignKey('attachments.id'), nullable=False)

    def __init__(self, attachment_id, filename):
        self.attachment_id = attachment_id
        self.filename = filename

    def __repr__(self):
        return '<Attachment File {0}>'.format(self.id)

    @property
    def get_file_path(self):
        return os.path.join(
            self.attachment.get_dir_path,
            self.filename)

    def save_file(self, file_obj):
        file_bytes = file_obj.read(AppConfig.MAX_FILE_SIZE)
        if len(file_bytes) == AppConfig.MAX_FILE_SIZE:
            print('Update file bigger than MAX_FILE_SIZE: {0} bytes'.format(
                AppConfig.MAX_FILE_SIZE))
            return False
        f = open(self.get_file_path, 'wb')
        f.write(file_bytes)
        f.close()
        return True


def attachment_file_after_delete_listener(mapper, connection, target):
    try:
        os.remove(target.get_file_path)
    except Exception as e:
        print("Error: Unknown error occurred: {0}".format(e))

event.listen(
    AttachmentFile, 'after_delete', attachment_file_after_delete_listener)


class Time(db.Model):
    __tablename__ = 'times'
    # main fields
    id = db.Column(db.Integer, primary_key=True)
    start = db.Column(db.DateTime, nullable=False)
    stop = db.Column(db.DateTime, nullable=True)
    comment = db.Column(db.String(255), nullable=True)

    # parent
    task_id = db.Column(db.Integer, db.ForeignKey('tasks.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    def __init__(self, task_id, user_id, start=None, stop=None, comment=None):
        self.task_id = task_id
        self.user_id = user_id
        self.start = datetime.utcnow() if start is None else start
        self.stop = stop
        self.comment = comment

    def __repr__(self):
        return '<Time {0}>'.format(self.id)

    @property
    def user_text(self):
        return self.user.username
