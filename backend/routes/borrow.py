from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from extensions import db
from models import Book, BorrowRequest, Notification
from datetime import datetime, timedelta

borrow_bp = Blueprint('borrow', __name__, url_prefix='/api/borrow')


def create_notification(user_id, message):
    notif = Notification(user_id=user_id, message=message)
    db.session.add(notif)


@borrow_bp.route('/request', methods=['POST'])
@login_required
def submit_request():
    data = request.get_json()
    book_id = data.get('book_id')

    if not book_id:
        return jsonify({'error': 'book_id is required.'}), 400

    book = Book.query.get_or_404(book_id)

    if book.owner_id == current_user.id:
        return jsonify({'error': 'You cannot borrow your own book.'}), 400

    if book.status != 'available':
        return jsonify({'error': 'This book is not available for borrowing.'}), 400

    # Check if this user already has a pending/accepted request for this book
    existing = BorrowRequest.query.filter_by(
        book_id=book_id, borrower_id=current_user.id
    ).filter(BorrowRequest.status.in_(['pending', 'accepted'])).first()

    if existing:
        return jsonify({'error': 'You already have an active request for this book.'}), 409

    proposed_date = data.get('proposed_date')
    proposed_time = data.get('proposed_time')
    location = data.get('location', '').strip()

    if book.type == 'physical':
        if not proposed_date or not proposed_time or not location:
            return jsonify({'error': 'Date, time, and location are required for physical books.'}), 400

    borrow_req = BorrowRequest(
        book_id=book.id,
        borrower_id=current_user.id,
        proposed_date=proposed_date,
        proposed_time=proposed_time,
        location=location or None
    )
    db.session.add(borrow_req)

    book.status = 'pending'

    create_notification(
        book.owner_id,
        f'{current_user.name} has requested to borrow your book "{book.title}".'
    )

    db.session.commit()
    return jsonify({'message': 'Borrow request sent to the owner.', 'request': borrow_req.to_dict()}), 201


@borrow_bp.route('/incoming', methods=['GET'])
@login_required
def incoming_requests():
    """All borrow requests for books owned by the current user."""
    owner_book_ids = [b.id for b in Book.query.filter_by(owner_id=current_user.id).all()]
    requests = BorrowRequest.query.filter(
        BorrowRequest.book_id.in_(owner_book_ids)
    ).order_by(BorrowRequest.created_at.desc()).all()

    return jsonify({'requests': [r.to_dict(include_book=True, include_borrower=True) for r in requests]}), 200


@borrow_bp.route('/my', methods=['GET'])
@login_required
def my_requests():
    """All borrow requests made by the current user."""
    requests = BorrowRequest.query.filter_by(
        borrower_id=current_user.id
    ).order_by(BorrowRequest.created_at.desc()).all()

    return jsonify({'requests': [r.to_dict(include_book=True) for r in requests]}), 200


@borrow_bp.route('/<int:req_id>/accept', methods=['PUT'])
@login_required
def accept_request(req_id):
    borrow_req = BorrowRequest.query.get_or_404(req_id)
    book = Book.query.get_or_404(borrow_req.book_id)

    if book.owner_id != current_user.id:
        return jsonify({'error': 'Only the book owner can accept this request.'}), 403

    if borrow_req.status != 'pending' and borrow_req.status != 'alternative_suggested':
        return jsonify({'error': 'This request cannot be accepted in its current state.'}), 400

    # Reject all other pending requests for this book
    other_requests = BorrowRequest.query.filter(
        BorrowRequest.book_id == book.id,
        BorrowRequest.id != req_id,
        BorrowRequest.status == 'pending'
    ).all()
    for other in other_requests:
        other.status = 'rejected'
        create_notification(
            other.borrower_id,
            f'Your request for "{book.title}" was not accepted because the owner accepted another request.'
        )

    borrow_req.status = 'accepted'
    book.status = 'borrowed'

    create_notification(
        borrow_req.borrower_id,
        f'Your borrow request for "{book.title}" has been accepted!'
        + (f' Pickup on {borrow_req.proposed_date} at {borrow_req.proposed_time}, {borrow_req.location}.'
           if book.type == 'physical' else '')
    )

    db.session.commit()
    return jsonify({'message': 'Request accepted.', 'request': borrow_req.to_dict(include_book=True)}), 200


@borrow_bp.route('/<int:req_id>/reject', methods=['PUT'])
@login_required
def reject_request(req_id):
    borrow_req = BorrowRequest.query.get_or_404(req_id)
    book = Book.query.get_or_404(borrow_req.book_id)

    if book.owner_id != current_user.id:
        return jsonify({'error': 'Only the book owner can reject this request.'}), 403

    if borrow_req.status not in ('pending', 'alternative_suggested'):
        return jsonify({'error': 'This request cannot be rejected in its current state.'}), 400

    borrow_req.status = 'rejected'

    # Only set book back to available if no other pending requests exist
    other_pending = BorrowRequest.query.filter(
        BorrowRequest.book_id == book.id,
        BorrowRequest.id != req_id,
        BorrowRequest.status == 'pending'
    ).first()

    if not other_pending:
        book.status = 'available'

    create_notification(
        borrow_req.borrower_id,
        f'Your borrow request for "{book.title}" was rejected by the owner.'
    )

    db.session.commit()
    return jsonify({'message': 'Request rejected.', 'request': borrow_req.to_dict()}), 200


@borrow_bp.route('/<int:req_id>/suggest', methods=['PUT'])
@login_required
def suggest_alternative(req_id):
    borrow_req = BorrowRequest.query.get_or_404(req_id)
    book = Book.query.get_or_404(borrow_req.book_id)

    if book.owner_id != current_user.id:
        return jsonify({'error': 'Only the book owner can suggest alternatives.'}), 403

    if borrow_req.status != 'pending':
        return jsonify({'error': 'Can only suggest alternatives for pending requests.'}), 400

    data = request.get_json()
    proposed_date = data.get('proposed_date')
    proposed_time = data.get('proposed_time')
    location = data.get('location', '').strip()

    if not proposed_date or not proposed_time or not location:
        return jsonify({'error': 'Date, time, and location are required for an alternative suggestion.'}), 400

    borrow_req.proposed_date = proposed_date
    borrow_req.proposed_time = proposed_time
    borrow_req.location = location
    borrow_req.status = 'alternative_suggested'

    create_notification(
        borrow_req.borrower_id,
        f'The owner of "{book.title}" suggested a new schedule: {proposed_date} at {proposed_time}, {location}.'
    )

    db.session.commit()
    return jsonify({'message': 'Alternative suggested.', 'request': borrow_req.to_dict()}), 200


@borrow_bp.route('/<int:req_id>/return', methods=['PUT'])
@login_required
def return_book(req_id):
    borrow_req = BorrowRequest.query.get_or_404(req_id)
    book = Book.query.get_or_404(borrow_req.book_id)

    is_owner = book.owner_id == current_user.id
    is_borrower = borrow_req.borrower_id == current_user.id

    if not is_owner and not is_borrower:
        return jsonify({'error': 'Not authorized to mark this book as returned.'}), 403

    if borrow_req.status != 'accepted':
        return jsonify({'error': 'Only accepted borrows can be marked as returned.'}), 400

    borrow_req.status = 'returned'
    book.status = 'available'

    # Notify the other party
    notify_user_id = borrow_req.borrower_id if is_owner else book.owner_id
    actor = 'The owner' if is_owner else current_user.name
    create_notification(
        notify_user_id,
        f'{actor} has marked "{book.title}" as returned. It is now available again.'
    )

    db.session.commit()
    return jsonify({'message': 'Book marked as returned.', 'request': borrow_req.to_dict()}), 200


@borrow_bp.route('/auto-return', methods=['POST'])
def auto_return_digital():
    """
    Called on a schedule (or triggered from frontend on page load).
    Auto-returns digital books borrowed more than 7 days ago.
    """
    cutoff = datetime.utcnow() - timedelta(days=7)

    expired = db.session.query(BorrowRequest).join(Book).filter(
        BorrowRequest.status == 'accepted',
        Book.type == 'digital',
        BorrowRequest.created_at <= cutoff
    ).all()

    count = 0
    for req in expired:
        req.status = 'returned'
        req.book.status = 'available'
        create_notification(
            req.borrower_id,
            f'Your digital borrow of "{req.book.title}" has been automatically returned after 7 days.'
        )
        create_notification(
            req.book.owner_id,
            f'"{req.book.title}" was automatically returned after 7 days. It is now available.'
        )
        count += 1

    db.session.commit()
    return jsonify({'message': f'{count} book(s) auto-returned.'}), 200