import os
from flask import Blueprint, request, jsonify, current_app
from flask_login import login_required, current_user
from werkzeug.utils import secure_filename
from extensions import db
from models import Book, Notification

books_bp = Blueprint('books', __name__, url_prefix='/api/books')

CATEGORIES = [
    'Fiction', 'Non-Fiction', 'Academic', 'Technology',
    'Science', 'History', 'Biography', 'Self-Help', 'Other'
]


def allowed_file(filename):
    allowed = current_app.config['ALLOWED_EXTENSIONS']
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed


@books_bp.route('', methods=['GET'])
def list_books():
    query = Book.query

    search = request.args.get('search', '').strip()
    category = request.args.get('category', '').strip()
    book_type = request.args.get('type', '').strip()
    availability = request.args.get('status', '').strip()
    owner_id = request.args.get('owner_id', '').strip()

    if search:
        like = f'%{search}%'
        query = query.filter(
            db.or_(Book.title.ilike(like), Book.author.ilike(like))
        )
    if category:
        query = query.filter_by(category=category)
    if book_type:
        query = query.filter_by(type=book_type)
    if availability:
        query = query.filter_by(status=availability)
    if owner_id:
        query = query.filter_by(owner_id=int(owner_id))

    books = query.order_by(Book.created_at.desc()).all()
    return jsonify({'books': [b.to_dict(include_owner=True) for b in books]}), 200


@books_bp.route('/<int:book_id>', methods=['GET'])
def get_book(book_id):
    book = Book.query.get_or_404(book_id)
    return jsonify({'book': book.to_dict(include_owner=True)}), 200


@books_bp.route('', methods=['POST'])
@login_required
def create_book():
    # Support both JSON and multipart (for file uploads)
    if request.content_type and 'multipart/form-data' in request.content_type:
        data = request.form
    else:
        data = request.get_json() or {}

    title = data.get('title', '').strip()
    author = data.get('author', '').strip()
    category = data.get('category', '').strip()
    book_type = data.get('type', '').strip()
    location = data.get('location', '').strip()
    file_link = data.get('file_link', '').strip()

    if not title or not author or not category or not book_type:
        return jsonify({'error': 'Title, author, category, and type are required.'}), 400

    if book_type not in ('physical', 'digital'):
        return jsonify({'error': 'Type must be physical or digital.'}), 400

    if book_type == 'physical' and not location:
        return jsonify({'error': 'Location is required for physical books.'}), 400

    saved_file_link = file_link

    # Handle file upload for digital books
    if book_type == 'digital' and 'file' in request.files:
        file = request.files['file']
        if file and file.filename and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            upload_path = current_app.config['UPLOAD_FOLDER']
            os.makedirs(upload_path, exist_ok=True)
            file.save(os.path.join(upload_path, filename))
            saved_file_link = f'/uploads/{filename}'
        elif file and file.filename:
            return jsonify({'error': 'Only PDF and EPUB files are allowed.'}), 400

    book = Book(
        title=title,
        author=author,
        category=category,
        type=book_type,
        location=location or None,
        file_link=saved_file_link or None,
        owner_id=current_user.id
    )
    db.session.add(book)
    db.session.commit()

    return jsonify({'message': 'Book added successfully.', 'book': book.to_dict()}), 201


@books_bp.route('/<int:book_id>', methods=['PUT'])
@login_required
def update_book(book_id):
    book = Book.query.get_or_404(book_id)

    if book.owner_id != current_user.id and current_user.role != 'admin':
        return jsonify({'error': 'You do not have permission to edit this book.'}), 403

    if request.content_type and 'multipart/form-data' in request.content_type:
        data = request.form
    else:
        data = request.get_json() or {}

    book.title = data.get('title', book.title).strip()
    book.author = data.get('author', book.author).strip()
    book.category = data.get('category', book.category).strip()
    book.location = data.get('location', book.location or '').strip() or None
    book.file_link = data.get('file_link', book.file_link or '').strip() or None

    if 'file' in request.files:
        file = request.files['file']
        if file and file.filename and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            upload_path = current_app.config['UPLOAD_FOLDER']
            os.makedirs(upload_path, exist_ok=True)
            file.save(os.path.join(upload_path, filename))
            book.file_link = f'/uploads/{filename}'

    db.session.commit()
    return jsonify({'message': 'Book updated successfully.', 'book': book.to_dict()}), 200


@books_bp.route('/<int:book_id>', methods=['DELETE'])
@login_required
def delete_book(book_id):
    book = Book.query.get_or_404(book_id)

    if book.owner_id != current_user.id and current_user.role != 'admin':
        return jsonify({'error': 'You do not have permission to delete this book.'}), 403

    if book.status == 'borrowed':
        return jsonify({'error': 'Cannot delete a book that is currently borrowed.'}), 400

    db.session.delete(book)
    db.session.commit()
    return jsonify({'message': 'Book deleted successfully.'}), 200


@books_bp.route('/<int:book_id>/flag', methods=['PUT'])
@login_required
def flag_book(book_id):
    book = Book.query.get_or_404(book_id)
    book.is_flagged = not book.is_flagged
    db.session.commit()
    state = 'flagged' if book.is_flagged else 'unflagged'
    return jsonify({'message': f'Book {state} successfully.', 'is_flagged': book.is_flagged}), 200