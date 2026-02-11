# 🔐 Set Remaining User Passwords

The admin password has been set to: **Palanivel**

Now set passwords for the other two users:

## Command to Run:

In Command Prompt in the `backend` folder, run these commands one by one:

```bash
python manage.py changepassword ops1
```

When prompted:
```
Password: Operation123
Password (again): Operation123
```

Then:

```bash
python manage.py changepassword supplier1
```

When prompted:
```
Password: Vendor123
Password (again): Vendor123
```

---

## Test Account Credentials (Now Set)

| Username | Email | Password | Role |
|----------|-------|----------|------|
| admin1 | admin1@example.com | Palanivel | Admin |
| ops1 | ops1@example.com | Operation123 | Operations |
| supplier1 | supplier1@example.com | Vendor123 | Supplier |

---

## Login Page Display

These credentials are also displayed on the login page for reference:
- **Admin:** admin1 / Palanivel
- **Ops:** ops1 / Operation123
- **Vendor:** supplier1 / Vendor123

---

## ✅ Testing

After setting passwords:

1. Start backend: `python manage.py runserver`
2. Start frontend: `npm start`
3. Try logging in as any of the test users
4. All three should work now!

