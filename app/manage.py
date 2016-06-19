#!/usr/bin/env python
# -*- coding: utf-8 -*-

from flask_script import Manager, prompt, prompt_pass
from flask_migrate import Migrate, MigrateCommand

from app import app
import models

models.db.init_app(app)

migrate = Migrate(app, models.db)

manager = Manager(app)

manager.add_command('db', MigrateCommand)


@manager.command
def create_user():
    username = prompt("Enter username")
    password1 = prompt_pass("Enter password")
    password2 = prompt_pass("Re-type password")
    if password1 == password2:
        new_user = models.User(username, password1)
        models.db.session.add(new_user)
        models.db.session.commit()
        print('User {0} successfully created'.format(username))
    else:
        print("Error: Passwords don't match")


@manager.command
def create_default_db_columns():
    default_task_statuses = [
        models.TaskStatus('opened', 100),
        models.TaskStatus('closed', 200),
    ]
    models.db.session.bulk_save_objects(default_task_statuses)
    models.db.session.commit()


if __name__ == '__main__':
    manager.run()
