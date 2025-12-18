# 2026 Bucket List 💕

A beautiful, intimate web application for couples to track their shared bucket list for 2026.

## Features
- Add, edit, delete, and mark bucket list items as complete
- Track who added each item
- Upload photos for completed items
- View statistics: completion %, total, pending, and completed items
- Beautiful soft pastel theme with clean, professional design

## Tech Stack
- **Backend**: Python Flask
- **Database**: PostgreSQL
- **Frontend**: HTML, CSS, JavaScript (Vanilla)

## Setup Instructions

### Prerequisites
- Python 3.8+
- PostgreSQL installed and running

### Installation

1. **Clone and navigate to the project**
   ```bash
   cd /Users/a38371/Desktop/sql/new_website
   ```

2. **Create a virtual environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up PostgreSQL database**
   ```bash
   createdb bucketlist_db
   ```

5. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and update with your database credentials.

6. **Initialize the database**
   ```bash
   python init_db.py
   ```

7. **Run the application**
   ```bash
   python app.py
   ```

8. **Open in browser**
   Navigate to `http://localhost:5000`

## Usage
- Click "Add New Item" to create a bucket list entry
- Mark items as complete with the checkbox
- Upload a photo when completing an item
- Edit or delete items using the action buttons
- View your progress in the statistics dashboard

## Future Deployment
Ready to deploy on Render.com when you're ready!

---
Made with 💕 for an amazing 2026 together!
