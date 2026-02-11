# VendorPulse - Vendor Reliability and Order Management

## Prerequisites
- Python 3.10+
- XAMPP or MySQL Server (MariaDB 10.4+ compatible)

## Backend Setup

1. **Database Configuration**
   - Open XAMPP and start Apache and MySQL.
   - Go to `phpMyAdmin` and create a database named `vendorpulse_db`.
   - Import the `vendorpulse_db.sql` file provided in the root directory.

2. **Environment Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Environment Variables**
   - Copy `.env.sample` to `.env` at the project root.
   - Update values as needed for local or production runs.
   - Frontend base URL: set `REACT_APP_API_BASE_URL` in `frontend/.env`.

4. **MySQL / MariaDB Setup (Optional)**
   - Ensure MySQL or MariaDB is running.
   - Create a database named `vendorpulse_db` (or update `DJANGO_DB_NAME`).
   - Set in `.env`:
     - `DJANGO_DB_ENGINE=mysql`
     - `DJANGO_DB_NAME=vendorpulse_db`
     - `DJANGO_DB_USER=...`
     - `DJANGO_DB_PASSWORD=...`
     - `DJANGO_DB_HOST=127.0.0.1`
     - `DJANGO_DB_PORT=3306`
   - Run Django migrations to create tables (when terminal access is available).
   - Recommended: use Django migrations instead of importing the SQL dump.

5. **API Base Path**
   - All vendor endpoints use the base path `http://127.0.0.1:8000/api/vendor/`
   - Example: `http://127.0.0.1:8000/api/vendor/suppliers/`

## SQL Dump Notes
- The provided [vendorpulse_db.sql](vendorpulse_db.sql) is a full MySQL dump from an earlier schema.
- It includes a legacy `users` table and foreign keys that do not match the current Django auth tables (`auth_user`, `accounts_profile`).
- For a clean setup, prefer Django migrations to create tables, then import only compatible data if needed.

## Recommended Database Setup (Best Path)
- Use Django migrations to create tables for the current models.
- Steps (when terminal access is available):
   - `python manage.py makemigrations`
   - `python manage.py migrate`
- After migrations, you can add data using the app UI or Django admin.
