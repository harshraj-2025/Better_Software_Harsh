import json
import os
import tempfile

import pytest

from app import create_app, db
from models import Task, Comment


@pytest.fixture
def app():
    db_fd, db_path = tempfile.mkstemp(suffix='.db')
    config = {
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': 'sqlite:///' + db_path,
        'SQLALCHEMY_TRACK_MODIFICATIONS': False,
    }
    app = create_app(test_config=config)

    yield app

    try:
        os.close(db_fd)
        os.unlink(db_path)
    except Exception:
        pass


@pytest.fixture
def client(app):
    return app.test_client()


def test_comment_crud(client):
    # create a task
    rv = client.post('/tasks', json={'title': 'Test Task', 'description': 'desc'})
    assert rv.status_code == 201
    task = rv.get_json()
    task_id = task['id']

    # add a comment
    rv = client.post(f'/tasks/{task_id}/comments', json={'author': 'Alice', 'body': 'Hello'})
    assert rv.status_code == 201
    comment = rv.get_json()
    comment_id = comment['id']
    assert comment['author'] == 'Alice'

    # list comments
    rv = client.get(f'/tasks/{task_id}/comments')
    assert rv.status_code == 200
    comments = rv.get_json()
    assert len(comments) == 1

    # update comment
    rv = client.put(f'/comments/{comment_id}', json={'author': 'Bob', 'body': 'Updated'})
    assert rv.status_code == 200
    updated = rv.get_json()
    assert updated['author'] == 'Bob'
    assert updated['body'] == 'Updated'

    # delete comment
    rv = client.delete(f'/comments/{comment_id}')
    assert rv.status_code == 200
    resp = rv.get_json()
    assert resp['deleted'] is True

    # listing should be empty now
    rv = client.get(f'/tasks/{task_id}/comments')
    assert rv.status_code == 200
    assert rv.get_json() == []
