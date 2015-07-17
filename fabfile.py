from fabric.api import run, lcd, cd, local, task
from fabric.state import env

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
def setup(PROJECT_PATH):
    with cd(PROJECT_PATH):
        #setup global dependencies
        env.run('sudo apt-get update')
        add_os_package('nodejs')
        add_os_package('npm')
        add_os_package('postgresql-server-dev-9.4')
        #create db role and database
        create_db_role()
        create_db()
        #setup python dependencies
        env.run('sudo {0} install -U -r requirements.txt'.format(PIP_EXECUTABLE_PATH))
        #upgrade migrations
        upgrade_db(PROJECT_PATH)
        #create a local user
        create_user(PROJECT_PATH)
        #setup javascript dependencies and collect static
        env.run('sudo npm install bower -g')
        env.run('sudo npm install grunt-cli -g')
        collect_static()


#collect static
@task
def collect_static():
    with lcd('client'):
        env.run('npm install')
        env.run('bower install')
        env.run('grunt')


#create a user
@task
def create_user(PROJECT_PATH):
    with cd(PROJECT_PATH):
        env.run('{0} manage.py create_user'.format(PYTHON_EXECUTABLE_PATH))


#upgrade db
@task
def upgrade_db(PROJECT_PATH):
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


#drop db role
@task
def drop_db_role():
    env.run('sudo -u {0} psql -c "DROP USER {1}"'.format(PGSQL_USER, DB_USER))
