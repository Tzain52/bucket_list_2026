from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class BucketListItem(db.Model):
    __tablename__ = 'bucket_list_items'
    
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(500), nullable=False)
    added_by = db.Column(db.String(100), nullable=False)
    is_completed = db.Column(db.Boolean, default=False)
    is_hidden = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)
    
    photos = db.relationship('ItemPhoto', backref='item', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'description': self.description,
            'added_by': self.added_by,
            'is_completed': self.is_completed,
            'is_hidden': getattr(self, 'is_hidden', False),
            'photos': [photo.to_dict() for photo in self.photos],
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }

class ItemPhoto(db.Model):
    __tablename__ = 'item_photos'
    
    id = db.Column(db.Integer, primary_key=True)
    item_id = db.Column(db.Integer, db.ForeignKey('bucket_list_items.id'), nullable=False)
    photo_path = db.Column(db.String(500), nullable=False)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'photo_path': self.photo_path,
            'uploaded_at': self.uploaded_at.isoformat() if self.uploaded_at else None
        }
