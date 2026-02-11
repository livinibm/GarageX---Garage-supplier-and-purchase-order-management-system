# 🔐 Login Credentials & How to Set Passwords

## Users Available in Database

| ID | Username | Email | Password | Role | Status |
|----|---------|---------|----|------|--------|
| 1 | **admin1** | admin1@example.com | Palanivel | Admin | ✅ Active |
| 5 | **supplier1** | supplier1@example.com | Vendor123 | Supplier | ✅ Active |
| 6 | **ops1** | ops1@example.com | Operation123 | Operations | ✅ Active |

---

## ⚠️ Important: Set Your Own Passwords

Use the Django management command to set secure passwords for each user:

```bash
python manage.py changepassword admin1
python manage.py changepassword ops1
python manage.py changepassword supplier1
```

---

## 📋 Test User Information

### **Admin User**
- **Username:** `admin1`
- **Email:** admin1@example.com
- **Password:** *(Set with changepassword command)*
- **Permissions:** Full access to admin dashboard

### **Ops User**  
- **Username:** `ops1`
- **Email:** ops1@example.com
- **Password:** *(Set with changepassword command)*
- **Permissions:** Operations dashboard (purchase orders, vendors)

### **Supplier User**
- **Username:** `supplier1`
- **Email:** supplier1@example.com
- **Password:** *(Set with changepassword command)*
- **Permissions:** Supplier dashboard (view orders, invoices)

---

## ✅ Steps to Login

1. **Set passwords** for each user (see above)
2. **Start backend:** `python manage.py runserver`
3. **Start frontend:** `npm start`
4. **Go to:** http://localhost:3000
5. **Login** with your chosen username and password

---

## 🚀 Quick Setup

```bash
# Terminal in backend folder:
python manage.py changepassword admin1        # Set secure password
python manage.py changepassword ops1          # Set secure password
python manage.py changepassword supplier1     # Set secure password
python manage.py runserver                    # Start backend
```

```bash
# Another terminal in frontend folder:
npm start                                     # Start frontend
```

Then login with the passwords you just set! ✅

---

## ❓ Forgot Password?

Just run the changepassword command again to reset:
```bash
python manage.py changepassword admin1
```
