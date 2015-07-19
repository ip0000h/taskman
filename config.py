import os
basedir = os.path.abspath(os.path.dirname(__file__))


class AppConfig(object):
    DEBUG = True
    CSRF_ENABLED = True
    WTF_CSRF_SECRET_KEY = 'WTF_CSRF_SECRET_KEY'
    SECRET_KEY = 'SECRET_KEY'
    SQLALCHEMY_DATABASE_URI = 'postgresql://taskman:taskman@localhost/taskman'
    ALLOWED_EXTENSIONS = ['txt', 'zip', 'rar', 'tgz', 'gz']
