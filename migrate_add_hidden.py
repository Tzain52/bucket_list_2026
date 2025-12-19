#!/usr/bin/env python3
"""
Migration script to add is_hidden column to bucket_list_items table
Run this once to update your existing database
"""

from app import app, db
from sqlalchemy import text

def migrate():
    with app.app_context():
        try:
            # Check if column already exists
            result = db.session.execute(text(
                "SELECT column_name FROM information_schema.columns "
                "WHERE table_name='bucket_list_items' AND column_name='is_hidden'"
            ))
            
            if result.fetchone():
                print("✓ Column 'is_hidden' already exists. No migration needed.")
                return
            
            # Add the is_hidden column
            db.session.execute(text(
                "ALTER TABLE bucket_list_items ADD COLUMN is_hidden BOOLEAN DEFAULT FALSE"
            ))
            db.session.commit()
            print("✓ Successfully added 'is_hidden' column to bucket_list_items table")
            
        except Exception as e:
            print(f"✗ Migration failed: {e}")
            db.session.rollback()

if __name__ == '__main__':
    print("Starting database migration...")
    migrate()
    print("Migration complete!")
