from extensions import db, login_manager
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


class User(UserMixin, db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='member')  # member | admin
    status = db.Column(db.String(20), nullable=False, default='active')  # active | blocked
    bio = db.Column(db.Text, nullable=True)
    phone = db.Column(db.String(30), nullable=True)
    avatar_url = db.Column(db.String(300), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    books = db.relationship('Book', backref='owner', lazy=True, foreign_keys='Book.owner_id')
    borrow_requests = db.relationship('BorrowRequest', backref='borrower', lazy=True, foreign_keys='BorrowRequest.borrower_id')
    notifications = db.relationship('Notification', backref='user', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'status': self.status,
            'bio': self.bio,
            'phone': self.phone,
            'avatar_url': self.avatar_url,
            'created_at': self.created_at.isoformat()
        }


class Book(db.Model):
    __tablename__ = 'books'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    author = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(20), nullable=False)   # physical | digital
    status = db.Column(db.String(20), nullable=False, default='available')  # available | pending | borrowed
    location = db.Column(db.String(300), nullable=True)
    file_link = db.Column(db.String(500), nullable=True)
    is_flagged = db.Column(db.Boolean, default=False)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    borrow_requests = db.relationship('BorrowRequest', backref='book', lazy=True)

    def to_dict(self, include_owner=False):
        data = {
            'id': self.id,
            'title': self.title,
            'author': self.author,
            'category': self.category,
            'type': self.type,
            'status': self.status,
            'location': self.location,
            'file_link': self.file_link,
            'is_flagged': self.is_flagged,
            'owner_id': self.owner_id,
            'created_at': self.created_at.isoformat()
        }
        if include_owner and self.owner:
            data['owner'] = {
                'id': self.owner.id,
                'name': self.owner.name,
                'avatar_url': self.owner.avatar_url
            }
        return data


class BorrowRequest(db.Model):
    __tablename__ = 'borrow_requests'

    id = db.Column(db.Integer, primary_key=True)
    book_id = db.Column(db.Integer, db.ForeignKey('books.id'), nullable=False)
    borrower_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(30), nullable=False, default='pending')
    # pending | accepted | rejected | returned | alternative_suggested
    proposed_date = db.Column(db.String(20), nullable=True)   # stored as YYYY-MM-DD string
    proposed_time = db.Column(db.String(10), nullable=True)   # stored as HH:MM string
    location = db.Column(db.String(300), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self, include_book=False, include_borrower=False):
        data = {
            'id': self.id,
            'book_id': self.book_id,
            'borrower_id': self.borrower_id,
            'status': self.status,
            'proposed_date': self.proposed_date,
            'proposed_time': self.proposed_time,
            'location': self.location,
            'created_at': self.created_at.isoformat()
        }
        if include_book and self.book:
            data['book'] = self.book.to_dict(include_owner=True)
        if include_borrower and self.borrower:
            data['borrower'] = {
                'id': self.borrower.id,
                'name': self.borrower.name,
                'avatar_url': self.borrower.avatar_url
            }
        return data


class Notification(db.Model):
    __tablename__ = 'notifications'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'message': self.message,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat()
        }