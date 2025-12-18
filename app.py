from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from models import db, BucketListItem, ItemPhoto
from config import Config
import os
from datetime import datetime
from werkzeug.utils import secure_filename

app = Flask(__name__, static_folder='static', static_url_path='')
app.config.from_object(Config)
CORS(app)

db.init_app(app)

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/api/items', methods=['GET'])
def get_items():
    items = BucketListItem.query.order_by(BucketListItem.created_at.desc()).all()
    return jsonify([item.to_dict() for item in items])

@app.route('/api/items', methods=['POST'])
def create_item():
    data = request.get_json()
    
    if not data.get('description') or not data.get('added_by'):
        return jsonify({'error': 'Description and added_by are required'}), 400
    
    new_item = BucketListItem(
        description=data['description'],
        added_by=data['added_by']
    )
    
    db.session.add(new_item)
    db.session.commit()
    
    return jsonify(new_item.to_dict()), 201

@app.route('/api/items/<int:item_id>', methods=['PUT'])
def update_item(item_id):
    item = BucketListItem.query.get_or_404(item_id)
    data = request.get_json()
    
    if 'description' in data:
        item.description = data['description']
    
    if 'added_by' in data:
        item.added_by = data['added_by']
    
    if 'is_completed' in data:
        item.is_completed = data['is_completed']
        if item.is_completed:
            item.completed_at = datetime.utcnow()
        else:
            item.completed_at = None
    
    db.session.commit()
    return jsonify(item.to_dict())

@app.route('/api/items/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):
    item = BucketListItem.query.get_or_404(item_id)
    
    for photo in item.photos:
        if os.path.exists(photo.photo_path):
            os.remove(photo.photo_path)
    
    db.session.delete(item)
    db.session.commit()
    
    return jsonify({'message': 'Item deleted successfully'}), 200

@app.route('/api/items/<int:item_id>/photos', methods=['POST'])
def upload_photo(item_id):
    item = BucketListItem.query.get_or_404(item_id)
    
    if 'photo' not in request.files:
        return jsonify({'error': 'No photo provided'}), 400
    
    file = request.files['photo']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(f"{item_id}_{datetime.utcnow().timestamp()}_{file.filename}")
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        new_photo = ItemPhoto(
            item_id=item_id,
            photo_path=filepath
        )
        db.session.add(new_photo)
        db.session.commit()
        
        return jsonify(item.to_dict())
    
    return jsonify({'error': 'Invalid file type'}), 400

@app.route('/api/photos/<int:photo_id>', methods=['DELETE'])
def delete_photo(photo_id):
    photo = ItemPhoto.query.get_or_404(photo_id)
    item_id = photo.item_id
    
    if os.path.exists(photo.photo_path):
        os.remove(photo.photo_path)
    
    db.session.delete(photo)
    db.session.commit()
    
    item = BucketListItem.query.get_or_404(item_id)
    return jsonify(item.to_dict())

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/stats', methods=['GET'])
def get_stats():
    total = BucketListItem.query.count()
    completed = BucketListItem.query.filter_by(is_completed=True).count()
    pending = total - completed
    completion_percentage = (completed / total * 100) if total > 0 else 0
    
    return jsonify({
        'total': total,
        'completed': completed,
        'pending': pending,
        'completion_percentage': round(completion_percentage, 1)
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
