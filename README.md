# GarageX - Supplier and Purchase Order Management System

## Prerequisites
- Python 3.10+
- XAMPP or MySQL Server (MariaDB 10.4+ compatible)

## Backend Setup

1. **Database Configuration**
   - Open XAMPP and start Apache and MySQL.
   - Go to `phpMyAdmin` and create a database named `garagex_db`.
   - Import the `garagex_db.sql` file provided in the root directory.

2. **Environment Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
