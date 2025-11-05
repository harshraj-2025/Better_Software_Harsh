import os
import tempfile

import pytest

from app import create_app


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


def test_task_crud(client):
    # create task
    rv = client.post('/tasks', json={'title': 'Task 1', 'description': 'Desc 1'})
    assert rv.status_code == 201
    task = rv.get_json()
    task_id = task['id']

    # get task
    rv = client.get(f'/tasks/{task_id}')
    assert rv.status_code == 200
    got = rv.get_json()
    assert got['title'] == 'Task 1'

    # update task
    rv = client.put(f'/tasks/{task_id}', json={'title': 'Task 1 - updated', 'description': 'New desc'})
    assert rv.status_code == 200
    updated = rv.get_json()
    assert updated['title'] == 'Task 1 - updated'

    # list tasks
    rv = client.get('/tasks')
    assert rv.status_code == 200
    tasks = rv.get_json()
    assert any(t['id'] == task_id for t in tasks)

    # delete task
    rv = client.delete(f'/tasks/{task_id}')
    assert rv.status_code == 200
    resp = rv.get_json()
    assert resp['deleted'] is True

    # now 404 getting task
    rv = client.get(f'/tasks/{task_id}')
    assert rv.status_code == 404
