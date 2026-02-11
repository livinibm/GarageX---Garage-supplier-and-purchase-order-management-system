# VendorPulse Project Setup Checklist

## ✅ Completed (Already Done)
- [x] Frontend API base URL centralized (REACT_APP_API_BASE_URL)
- [x] All frontend components use shared API helpers (apiClient/apiFetch)
- [x] MySQL environment variable support added to Django backend
- [x] Backend `.env` file created with MySQL configuration

## 📋 Next Steps (You Need to Do These)

### Step 1: Verify & Update MySQL Credentials
**File:** `backend/.env`

The `.env` file has been created with default credentials. Update these with your actual MySQL credentials:

```env
DJANGO_DB_ENGINE=mysql
DJANGO_DB_NAME=vendorpulse_db
DJANGO_DB_USER=root              ← Change if needed
DJANGO_DB_PASSWORD=root          ← Change if needed
DJANGO_DB_HOST=127.0.0.1         ← Change if using remote MySQL
DJANGO_DB_PORT=3306              ← Usually correct for MySQL
```

### Step 2: Import the MySQL Dump
Open phpMyAdmin or MySQL command line and run:
```sql
-- If database doesn't exist
CREATE DATABASE vendorpulse_db;
USE vendorpulse_db;

-- Import the SQL dump
SOURCE /path/to/vendorpulse_db.sql;
```

Or via command line (if MySQL is in PATH):
```bash
mysql -u root -p vendorpulse_db < vendorpulse_db.sql
```

### Step 3: Run Django Migrations
Open Command Prompt in the `backend` folder and run:
```bash
python manage.py migrate
```

This creates/updates any new tables (like for the PurchaseOrder.created_by_user field).

### Step 4: Test Database Connection
In Command Prompt (backend folder), run Python check:
```bash
python manage.py check
```

Should output: `System check identified no issues (0 silenced).`

### Step 5: Start Backend Server
```bash
python manage.py runserver
```

Should show: `Starting development server at http://127.0.0.1:8000/`

### Step 6: Start Frontend (in another Command Prompt)
Navigate to `frontend` folder and run:
```bash
npm start
```

Should open browser at `http://localhost:3000`

### Step 7: Test Login
Use these test credentials from the database:
- **Admin User:** `admin1` / (password not provided, set new one or check DB)
- **Ops User:** `ops1` / (password not provided, check DB)  
- **Supplier User:** `supplier1` / (password not provided, check DB)

## 🔍 Current Issue: Login 401 Error

### Why It's Happening
You got "No active account found with the given credentials" because:
1. Backend was using SQLite (default) instead of MySQL
2. The ops1, admin1, supplier1 users exist in MySQL dump, NOT SQLite

### How We Fixed It
✅ Created `.env` file with `DJANGO_DB_ENGINE=mysql`

### What You Need to Do
1. **Update** `.env` with your actual MySQL password
2. **Import** the `vendorpulse_db.sql` dump to MySQL
3. **Restart** Django backend (Ctrl+C then `python manage.py runserver` again)
4. **Try login again** - should work now!

## 📁 File Locations

| File | Purpose |
|------|---------|
| `backend/.env` | MySQL & Django config (you just edited this) |
| `vendorpulse_db.sql` | SQL dump with test users & sample data |
| `frontend/src/api.js` | API base URL & auth token configuration |
| `backend/core/settings.py` | Uses `DJANGO_DB_ENGINE` env var (lines 104-126) |

## ❓ Questions You Might Have

**Q: Where is the ops1 password?**  
A: Passwords in the SQL dump are hashed. You can:
- Set a new password in Django: `python manage.py changepassword ops1`
- Or check phpMyAdmin's auth_user table for the password hash
- Or login as admin1 (the admin user created in the dump)

**Q: What if MySQL import fails?**  
A: Make sure:
- MySQL service is running
- Database `vendorpulse_db` exists (create it first)
- Your credentials in `.env` are correct
- No SQL errors in the dump (it's a valid 8.0.39 dump)

**Q: Do I need to run migrations?**  
A: Yes! Migrations update the database schema to match Django code. Even if you import the dump, you should run:
```bash
python manage.py migrate
```

## ✨ After Setup Is Complete

Once login works:
1. Click on your user role dashboard (Admin/Ops/Supplier)
2. You should see vendors, purchase orders, suppliers, etc.
3. Try creating/editing items to test API integration
4. Use browser DevTools (F12) → Network tab to verify API calls are hitting the correct endpoint

---

## Need Help?
If you get errors, share:
1. The error message (exact text)
2. Where it occurred (browser console, command line, etc.)
3. What you were trying to do (login, create order, etc.)

