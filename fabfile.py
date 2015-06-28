from fabric.api import run, cd, local, task
from fabric.state import env

PROJECT_PATH = '/data/btadmin'
PGSQL_USER = 'postgres'
POSTGRESQL_EXECUTABLE_PATH = '/usr/bin/psql'
PYTHON_EXECUTABLE_PATH = '/usr/bin/python3'
PIP_EXECUTABLE_PATH = '/usr/bin/pip3'
SUREPVISORCTL_EXECUTABLE_PATH = '/usr/local/bin/supervisorctl'
DB_USER = 'taskman'
DB_NAME = 'taskman'
DB_PASSWORD = 'taskman'

env.run = run


#use with localhost
@task
def localhost():
    env.run = local
    env.hosts = ['localhost']


def add_os_package(name):
    env.run('sudo apt-get -y install {0}'.format(name))


#setup all(init db schema, run all migrations, create a user, start all apps)
@task
def setup():
    with cd(PROJECT_PATH):
        env.run('sudo apt-get update')
        add_os_package('postgresql-server-dev-9.4')
        create_db()
        env.run('sudo {0} install -U -r requirements.txt'.format(PIP_EXECUTABLE_PATH))
        upgrade_db()
        create_user()


#create a user
@task
def create_user():
    with cd(PROJECT_PATH):
        env.run('{0} manage.py create_user'.format(PYTHON_EXECUTABLE_PATH))


#upgrade db
@task
def upgrade_db():
    with cd(PROJECT_PATH):
        env.run('{0} manage.py db upgrade'.format(PYTHON_EXECUTABLE_PATH))


#create db
@task
def create_db():
    env.run('sudo -u {0} psql -c "CREATE DATABASE {1}"'.format(PGSQL_USER, DB_NAME))
    env.run('sudo -u {0} psql -c "GRANT ALL privileges ON DATABASE {1} TO {2}"'.format(PGSQL_USER, DB_NAME, DB_USER))


#create db role
@task
def create_db_role():
    env.run('sudo -u {0} psql -c "CREATE USER {1} WITH PASSWORD \'{2}\'"'.format(PGSQL_USER, DB_USER, DB_PASSWORD))


#drop database
@task
def drop_db():
    env.run('sudo -u {0} psql -c "DROP DATABASE {1}"'.format(PGSQL_USER, DB_NAME))
