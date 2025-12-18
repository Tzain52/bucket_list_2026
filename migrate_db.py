from app import app, db
from models import BucketListItem, ItemPhoto

with app.app_context():
    db.drop_all()
    db.create_all()
    print("Database migrated successfully! All tables recreated.")
    print("Note: All existing data has been cleared.")
