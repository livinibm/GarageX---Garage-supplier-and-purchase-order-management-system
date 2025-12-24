import pymysql
pymysql.install_as_MySQLdb()

# Bypass Django's mysqlclient version check
import MySQLdb
MySQLdb.version_info = (2, 2, 1, 'final', 0)

# Bypass Django's MariaDB version check
from django.db.backends.base.base import BaseDatabaseWrapper
BaseDatabaseWrapper.check_database_version_supported = lambda self: None
