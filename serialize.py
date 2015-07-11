from marshmallow import Schema, fields


class UserSchema(Schema):
    id = fields.Integer()
    username = fields.Str()
    email = fields.Str()
    jabber = fields.Str()
    is_active = fields.Boolean()
    is_admin = fields.Boolean()


class ProjectSchema(Schema):
    id = fields.Integer()
    name = fields.Str()
    created = fields.DateTime()
    groups_count = fields.Integer()


class GroupSchema(Schema):
    id = fields.Integer()
    name = fields.Str()
    created = fields.DateTime()
    tasks_count = fields.Integer()


class TaskFullSchema(Schema):
    id = fields.Integer()
    created = fields.DateTime()
    title = fields.Str()
    text = fields.Str()
    status = fields.Str()
    creator_id = fields.Integer()
    creator_username = fields.Str()
    assigned_id = fields.Integer()
    assigned_username = fields.Str()
    attachments_count = fields.Integer()
    times_count = fields.Integer()


class TaskShortSchema(Schema):
    id = fields.Integer()
    created = fields.DateTime()
    updated = fields.DateTime()
    title = fields.Str()
    status = fields.Str()


class AttachmentSchema(Schema):
    id = fields.Integer()
    created = fields.DateTime()
    filename = fields.Str()


class TimeSchema(Schema):
    id = fields.Integer()
    start = fields.DateTime()
    stop = fields.DateTime()
