# Database Setup (Recommended)

This project is best set up using Django migrations, which generate tables that match the current models and auth schema.

## MySQL / MariaDB (Recommended Path)
1. Create the database (for example, `vendorpulse_db`).
2. Copy `.env.sample` to `.env` and set:
   - `DJANGO_DB_ENGINE=mysql`
   - `DJANGO_DB_NAME=vendorpulse_db`
   - `DJANGO_DB_USER=...`
   - `DJANGO_DB_PASSWORD=...`
   - `DJANGO_DB_HOST=127.0.0.1`
   - `DJANGO_DB_PORT=3306`
3. Run Django migrations (when terminal access is available):
   - `python manage.py makemigrations`
   - `python manage.py migrate`

## SQL Dump (Not Recommended)
The provided `vendorpulse_db.sql` is from an older schema and includes a legacy `users` table that does not match Django's auth tables. Importing it can create mismatched foreign keys and break the current app.

If you must import it, it should be patched to align with current Django models first.
