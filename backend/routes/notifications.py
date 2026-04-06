from flask import Blueprint, jsonify
from flask_login import login_required, current_user
from extensions import db
from models import Notification

notifications_bp = Blueprint('notifications', __name__, url_prefix='/api/notifications')


@notifications_bp.route('', methods=['GET'])
@login_required
def get_notifications():
    notifications = Notification.query.filter_by(
        user_id=current_user.id
    ).order_by(Notification.created_at.desc()).limit(50).all()

    unread_count = Notification.query.filter_by(
        user_id=current_user.id, is_read=False
    ).count()

    return jsonify({
        'notifications': [n.to_dict() for n in notifications],
        'unread_count': unread_count
    }), 200


@notifications_bp.route('/read', methods=['PUT'])
@login_required
def mark_all_read():
    Notification.query.filter_by(
        user_id=current_user.id, is_read=False
    ).update({'is_read': True})
    db.session.commit()
    return jsonify({'message': 'All notifications marked as read.'}), 200


@notifications_bp.route('/<int:notif_id>/read', methods=['PUT'])
@login_required
def mark_one_read(notif_id):
    notif = Notification.query.get_or_404(notif_id)
    if notif.user_id != current_user.id:
        return jsonify({'error': 'Not authorized.'}), 403
    notif.is_read = True
    db.session.commit()
    return jsonify({'message': 'Notification marked as read.'}), 200