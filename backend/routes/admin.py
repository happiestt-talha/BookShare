from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from extensions import db
from models import User, Book, BorrowRequest, Notification
from functools import wraps

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')


def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not current_user.is_authenticated:
            return jsonify({'error': 'Authentication required.'}), 401
        if current_user.role != 'admin':
            return jsonify({'error': 'Admin access required.'}), 403
        return f(*args, **kwargs)
    return decorated


# ── Users ──────────────────────────────────────────────────────────────────────

@admin_bp.route('/users', methods=['GET'])
@login_required
@admin_required
def list_users():
    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify({'users': [u.to_dict() for u in users]}), 200


@admin_bp.route('/users/<int:user_id>/block', methods=['PUT'])
@login_required
@admin_required
def block_user(user_id):
    user = User.query.get_or_404(user_id)

    if user.id == current_user.id:
        return jsonify({'error': 'You cannot block your own account.'}), 400

    user.status = 'blocked' if user.status == 'active' else 'active'
    db.session.commit()
    action = 'blocked' if user.status == 'blocked' else 'unblocked'
    return jsonify({'message': f'User {action} successfully.', 'user': user.to_dict()}), 200


@admin_bp.route('/users/<int:user_id>/promote', methods=['PUT'])
@login_required
@admin_required
def promote_user(user_id):
    user = User.query.get_or_404(user_id)
    user.role = 'admin' if user.role == 'member' else 'member'
    db.session.commit()
    action = 'promoted to admin' if user.role == 'admin' else 'demoted to member'
    return jsonify({'message': f'User {action}.', 'user': user.to_dict()}), 200


# ── Books ──────────────────────────────────────────────────────────────────────

@admin_bp.route('/books', methods=['GET'])
@login_required
@admin_required
def list_all_books():
    flagged_only = request.args.get('flagged') == 'true'
    query = Book.query
    if flagged_only:
        query = query.filter_by(is_flagged=True)
    books = query.order_by(Book.created_at.desc()).all()
    return jsonify({'books': [b.to_dict(include_owner=True) for b in books]}), 200


@admin_bp.route('/books/<int:book_id>', methods=['DELETE'])
@login_required
@admin_required
def remove_book(book_id):
    book = Book.query.get_or_404(book_id)
    owner_id = book.owner_id
    title = book.title

    # Reject all active borrow requests for this book
    active_requests = BorrowRequest.query.filter(
        BorrowRequest.book_id == book_id,
        BorrowRequest.status.in_(['pending', 'accepted'])
    ).all()
    for req in active_requests:
        notif = Notification(
            user_id=req.borrower_id,
            message=f'The book "{title}" you had a borrow request for has been removed by an admin.'
        )
        db.session.add(notif)

    db.session.delete(book)

    notif = Notification(
        user_id=owner_id,
        message=f'Your book "{title}" has been removed by an admin for violating platform guidelines.'
    )
    db.session.add(notif)

    db.session.commit()
    return jsonify({'message': 'Book removed successfully.'}), 200


# ── Reports ────────────────────────────────────────────────────────────────────

@admin_bp.route('/reports', methods=['GET'])
@login_required
@admin_required
def reports():
    from datetime import datetime, timedelta

    period = request.args.get('period', 'all')

    if period == '7days':
        since = datetime.utcnow() - timedelta(days=7)
    elif period == '30days':
        since = datetime.utcnow() - timedelta(days=30)
    else:
        since = None

    def base_filter(query, model):
        if since:
            return query.filter(model.created_at >= since)
        return query

    total_users = base_filter(User.query, User).count()
    total_books = base_filter(Book.query, Book).count()
    active_borrows = BorrowRequest.query.filter_by(status='accepted').count()
    total_returned = base_filter(BorrowRequest.query, BorrowRequest).filter_by(status='returned').count()
    total_requests = base_filter(BorrowRequest.query, BorrowRequest).count()
    physical_books = Book.query.filter_by(type='physical').count()
    digital_books = Book.query.filter_by(type='digital').count()

    return jsonify({
        'period': period,
        'total_users': total_users,
        'total_books': total_books,
        'active_borrows': active_borrows,
        'total_returned': total_returned,
        'total_requests': total_requests,
        'physical_books': physical_books,
        'digital_books': digital_books,
    }), 200