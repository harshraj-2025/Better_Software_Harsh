from flask import Blueprint, request, jsonify, abort
from app import db
from models import Task, Comment

bp = Blueprint('api', __name__)


@bp.route('/tasks', methods=['GET'])
def list_tasks():
    tasks = Task.query.order_by(Task.created_at.desc()).all()
    return jsonify([t.to_dict() for t in tasks]), 200


@bp.route('/tasks', methods=['POST'])
def create_task():
    data = request.get_json() or {}
    title = data.get('title')
    if not title:
        return jsonify({'error': 'title is required'}), 400
    task = Task(title=title, description=data.get('description'))
    db.session.add(task)
    db.session.commit()
    return jsonify(task.to_dict()), 201


@bp.route('/tasks/<int:task_id>/comments', methods=['GET'])
def list_comments(task_id):
    task = Task.query.get_or_404(task_id)
    comments = Comment.query.filter_by(task_id=task.id).order_by(Comment.created_at.asc()).all()
    return jsonify([c.to_dict() for c in comments]), 200


@bp.route('/tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    task = Task.query.get_or_404(task_id)
    return jsonify(task.to_dict()), 200


@bp.route('/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    task = Task.query.get_or_404(task_id)
    data = request.get_json() or {}
    title = data.get('title')
    description = data.get('description')
    if title:
        task.title = title
    if description is not None:
        task.description = description
    db.session.commit()
    return jsonify(task.to_dict()), 200


@bp.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    task = Task.query.get_or_404(task_id)
    db.session.delete(task)
    db.session.commit()
    return jsonify({'deleted': True}), 200


@bp.route('/tasks/<int:task_id>/comments', methods=['POST'])
def create_comment(task_id):
    task = Task.query.get_or_404(task_id)
    data = request.get_json() or {}
    author = data.get('author')
    body = data.get('body')
    if not author or not body:
        return jsonify({'error': 'author and body are required'}), 400
    comment = Comment(task_id=task.id, author=author, body=body)
    db.session.add(comment)
    db.session.commit()
    return jsonify(comment.to_dict()), 201


@bp.route('/comments/<int:comment_id>', methods=['PUT'])
def update_comment(comment_id):
    comment = Comment.query.get_or_404(comment_id)
    data = request.get_json() or {}
    author = data.get('author')
    body = data.get('body')
    if author:
        comment.author = author
    if body:
        comment.body = body
    db.session.commit()
    return jsonify(comment.to_dict()), 200


@bp.route('/comments/<int:comment_id>', methods=['DELETE'])
def delete_comment(comment_id):
    comment = Comment.query.get_or_404(comment_id)
    db.session.delete(comment)
    db.session.commit()
    return jsonify({'deleted': True}), 200
