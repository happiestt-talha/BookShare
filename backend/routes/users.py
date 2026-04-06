import os
from flask import Blueprint, request, jsonify, current_app
from flask_login import login_required, current_user
from werkzeug.utils import secure_filename
from extensions import db
from models import User

users_bp = Blueprint('users', __name__, url_prefix='/api/users')


@users_bp.route('/me', methods=['PUT'])
@login_required
def update_profile():
    if request.content_type and 'multipart/form-data' in request.content_type:
        data = request.form
    else:
        data = request.get_json() or {}

    name = data.get('name', '').strip()
    phone = data.get('phone', '').strip()
    bio = data.get('bio', '').strip()

    if name:
        current_user.name = name
    if phone is not None:
        current_user.phone = phone or None
    if bio is not None:
        current_user.bio = bio or None

    # Handle avatar upload
    if 'avatar' in request.files:
        file = request.files['avatar']
        if file and file.filename:
            ext = file.filename.rsplit('.', 1)[-1].lower()
            if ext not in ('jpg', 'jpeg', 'png', 'webp'):
                return jsonify({'error': 'Avatar must be a JPG, PNG, or WEBP image.'}), 400
            filename = secure_filename(f'avatar_{current_user.id}.{ext}')
            upload_path = current_app.config['UPLOAD_FOLDER']
            os.makedirs(upload_path, exist_ok=True)
            file.save(os.path.join(upload_path, filename))
            current_user.avatar_url = f'/uploads/{filename}'

    db.session.commit()
    return jsonify({'message': 'Profile updated successfully.', 'user': current_user.to_dict()}), 200


@users_bp.route('/me/password', methods=['PUT'])
@login_required
def change_password():
    data = request.get_json()
    current_password = data.get('current_password', '')
    new_password = data.get('new_password', '')

    if not current_password or not new_password:
        return jsonify({'error': 'Current and new passwords are required.'}), 400

    if not current_user.check_password(current_password):
        return jsonify({'error': 'Current password is incorrect.'}), 401

    if len(new_password) < 8:
        return jsonify({'error': 'New password must be at least 8 characters.'}), 400

    current_user.set_password(new_password)
    db.session.commit()
    return jsonify({'message': 'Password changed successfully.'}), 200


@users_bp.route('/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify({'user': user.to_dict()}), 200