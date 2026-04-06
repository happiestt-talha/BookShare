import os
from flask import Flask, send_from_directory, render_template
from flask_login import login_required
from flask_cors import CORS
from config import Config
from extensions import db, login_manager

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Allow Next.js frontend to communicate with Flask backend
    CORS(app, supports_credentials=True, origins=['http://localhost:3000','https://bookshare.tech'])

    db.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = None  # Return 401 JSON instead of redirect

    @login_manager.unauthorized_handler
    def unauthorized():
        from flask import jsonify
        return jsonify({'error': 'Authentication required.'}), 401

    # ---------- HOME ROUTE (moved inside create_app) ----------
    @app.route('/')
    def home():
        # You can later fetch featured books from DB
        featured_books = [
            {'title': 'Python Crash Course', 'author': 'Eric Matthes', 'type': 'Physical'},
            {'title': 'Atomic Habits', 'author': 'James Clear', 'type': 'Physical'},
            {'title': 'The Pragmatic Programmer', 'author': 'David Thomas', 'type': 'Digital'},
        ]
        return render_template('index.html', featured_books=featured_books)

    # Register blueprints
    from routes.auth import auth_bp
    from routes.books import books_bp
    from routes.borrow import borrow_bp
    from routes.admin import admin_bp
    from routes.notifications import notifications_bp
    from routes.users import users_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(books_bp)
    app.register_blueprint(borrow_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(notifications_bp)
    app.register_blueprint(users_bp)

    # Serve uploaded files (book PDFs, avatars)
    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    # Create DB tables on first run
    with app.app_context():
        db.create_all()

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)