import os
basedir = os.path.abspath(os.path.dirname(__file__))


class AppConfig(object):

    DEBUG = True
    PORT = 5001

    CSRF_ENABLED = True
    WTF_CSRF_SECRET_KEY = 'WTF_CSRF_SECRET_KEY'
    SECRET_KEY = 'SECRET_KEY'

    SQLALCHEMY_DATABASE_URI = 'postgresql://taskman:taskman@localhost/taskman'
    # SQLALCHEMY_ECHO = True # Debug output for all database operations
    SQLALCHEMY_TRACK_MODIFICATIONS = True

    CHECK_FILE_EXTENSIONS = False
    UPLOAD_FOLDER = os.path.join(basedir, 'uploads')
    MAX_FILE_SIZE = 1024 * 1024 * 1024 * 4  # 4GB Max file size

    TASKS_PAGE_SIZE = 5
