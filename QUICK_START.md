# 🚀 Quick Start - Do These 4 Steps NOW

## Step 1️⃣ Update MySQL Password (if needed)
📁 Open: `backend/.env`

Change the password to match your MySQL root password:
```
DJANGO_DB_PASSWORD=root
```

## Step 2️⃣ Import the Database
Open MySQL/phpMyAdmin and run:
```sql
mysql -u root -p vendorpulse_db < vendorpulse_db.sql
```

Or in phpMyAdmin:
- Create database: `vendorpulse_db`
- Import file: `vendorpulse_db.sql`

**Expected result:** Database created with users (admin1, ops1, supplier1)

## Step 3️⃣ Set User Passwords
```bash
python manage.py changepassword admin1
python manage.py changepassword ops1  
python manage.py changepassword supplier1
```

**Note:** Passwords must be at least 8 characters and not similar to username.

## Step 4️⃣ Run Migrations & Start Both Servers

**Terminal 1** - Backend (Command Prompt in `backend` folder):
```bash
python manage.py migrate
python manage.py runserver
```
✅ Should show: `Starting development server at http://127.0.0.1:8000/`

**Terminal 2** - Frontend (Command Prompt in `frontend` folder):
```bash
npm start
```
✅ Should open: `http://localhost:3000` in your browser

## 🔑 Login Test
Try logging in with your chosen credentials:
- Username: `admin1`
- Password: *(your secure password)*

---

## ❌ If Login Still Fails

1. Check `.env` has correct MySQL password
2. Verify the database was imported (check phpMyAdmin)
3. Restart Django backend
4. Try login again

---

## 📖 For Full Details
See: [SETUP_GUIDE.md](SETUP_GUIDE.md)
