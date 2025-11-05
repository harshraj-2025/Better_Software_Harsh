from flask import Flask
from extensions import db


def create_app(test_config=None):
    app = Flask(__name__)
    if test_config:
        app.config.update(test_config)
    else:
        app.config.from_mapping(
            SQLALCHEMY_DATABASE_URI='sqlite:///data.db',
            SQLALCHEMY_TRACK_MODIFICATIONS=False,
        )

    db.init_app(app)

    # import and register routes after db is initialized to avoid circular imports
    from routes import bp
    app.register_blueprint(bp)

    with app.app_context():
        db.create_all()

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
