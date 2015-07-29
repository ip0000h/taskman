from marshmallow import Schema, fields


class UserSchema(Schema):
    id = fields.Integer()
    username = fields.Str()
    email = fields.Str()
    jabber = fields.Str()
    is_active = fields.Boolean()
    is_admin = fields.Boolean()


class GroupSchema(Schema):
    id = fields.Integer()
    name = fields.Str()
    created = fields.DateTime()
    projects_count = fields.Integer()


class ProjectSchema(Schema):
    id = fields.Integer()
    name = fields.Str()
    created = fields.DateTime()
    tasks_count = fields.Integer()


class TaskFullSchema(Schema):
    id = fields.Integer()
    created = fields.DateTime()
    title = fields.Str()
    text = fields.Str()
    status_text = fields.Str()
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
    status_text = fields.Str()


class AttachmentFileSchema(Schema):
    id = fields.Integer()
    filename = fields.Str()


class AttachmentSchema(Schema):
    id = fields.Integer()
    created = fields.DateTime()
    comment = fields.Str()
    user_text = fields.Str()
    files = fields.Nested(AttachmentFileSchema, ('id', 'filename'), many=True)


class TimeSchema(Schema):
    id = fields.Integer()
    start = fields.DateTime()
    stop = fields.DateTime()
    comment = fields.Str()
    user_text = fields.Str()
