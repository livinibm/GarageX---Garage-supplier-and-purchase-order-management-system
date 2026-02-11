-- MySQL dump 10.13  Distrib 8.0.39, for Win64 (x86_64)
--
-- Host: localhost    Database: vendorpulse_db
-- ------------------------------------------------------
-- Server version	8.0.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `accounts_notification`
--

DROP TABLE IF EXISTS `accounts_notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accounts_notification` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `notif_type` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `message` longtext COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `is_read` tinyint(1) NOT NULL,
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `accounts_notification_user_id_30e6cfc5_fk_auth_user_id` (`user_id`),
  CONSTRAINT `accounts_notification_user_id_30e6cfc5_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounts_notification`
--

LOCK TABLES `accounts_notification` WRITE;
/*!40000 ALTER TABLE `accounts_notification` DISABLE KEYS */;
INSERT INTO `accounts_notification` VALUES (3,'LOW_STOCK','Low stock alert: Spark Plug (ID: 3) is at 0 units!','2026-01-27 14:00:00.000000',0,1),(4,'ORDER_APPROVED','Your purchase order PO-1001 has been approved.','2026-01-26 10:30:00.000000',1,5),(5,'LOW_STOCK','Low stock alert: Oil Filter (ID: 2) is at 5 units!','2026-01-27 15:00:00.000000',0,1),(6,'ORDER_APPROVED','Your purchase order PO-1002 has been approved.','2026-01-26 11:00:00.000000',1,5),(7,'LOW_STOCK','Low stock alert: Brake Pads (ID: 1) is at 2 units!','2026-01-27 16:00:00.000000',0,1);
/*!40000 ALTER TABLE `accounts_notification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `accounts_profile`
--

DROP TABLE IF EXISTS `accounts_profile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accounts_profile` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `role` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `phone` varchar(15) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `accounts_profile_user_id_49a85d32_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounts_profile`
--

LOCK TABLES `accounts_profile` WRITE;
/*!40000 ALTER TABLE `accounts_profile` DISABLE KEYS */;
INSERT INTO `accounts_profile` VALUES (1,'ADMIN',NULL,1),(5,'SUPPLIER',NULL,5),(6,'OPS',NULL,6);
/*!40000 ALTER TABLE `accounts_profile` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `accounts_useractivitylog`
--

DROP TABLE IF EXISTS `accounts_useractivitylog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accounts_useractivitylog` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `action` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `ip_address` char(39) COLLATE utf8mb4_general_ci NOT NULL,
  `user_agent` longtext COLLATE utf8mb4_general_ci NOT NULL,
  `timestamp` datetime(6) NOT NULL,
  `username_attempted` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `success` tinyint(1) NOT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `accounts_us_user_id_5cc93e_idx` (`user_id`,`timestamp`),
  KEY `accounts_us_action_fb1cb3_idx` (`action`,`timestamp`),
  KEY `accounts_us_ip_addr_f56645_idx` (`ip_address`,`timestamp`),
  CONSTRAINT `accounts_useractivitylog_user_id_33f5b02a_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`),
  CONSTRAINT `accounts_useractivitylog_chk_1` CHECK (json_valid(`details`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounts_useractivitylog`
--

LOCK TABLES `accounts_useractivitylog` WRITE;
/*!40000 ALTER TABLE `accounts_useractivitylog` DISABLE KEYS */;
/*!40000 ALTER TABLE `accounts_useractivitylog` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_group`
--

DROP TABLE IF EXISTS `auth_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group`
--

LOCK TABLES `auth_group` WRITE;
/*!40000 ALTER TABLE `auth_group` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_group_permissions`
--

DROP TABLE IF EXISTS `auth_group_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group_permissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  KEY `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group_permissions`
--

LOCK TABLES `auth_group_permissions` WRITE;
/*!40000 ALTER TABLE `auth_group_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_permission`
--

DROP TABLE IF EXISTS `auth_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_permission` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `content_type_id` int NOT NULL,
  `codename` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`),
  CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=69 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_permission`
--

LOCK TABLES `auth_permission` WRITE;
/*!40000 ALTER TABLE `auth_permission` DISABLE KEYS */;
INSERT INTO `auth_permission` VALUES (1,'Can add log entry',1,'add_logentry'),(2,'Can change log entry',1,'change_logentry'),(3,'Can delete log entry',1,'delete_logentry'),(4,'Can view log entry',1,'view_logentry'),(5,'Can add permission',2,'add_permission'),(6,'Can change permission',2,'change_permission'),(7,'Can delete permission',2,'delete_permission'),(8,'Can view permission',2,'view_permission'),(9,'Can add group',3,'add_group'),(10,'Can change group',3,'change_group'),(11,'Can delete group',3,'delete_group'),(12,'Can view group',3,'view_group'),(13,'Can add user',4,'add_user'),(14,'Can change user',4,'change_user'),(15,'Can delete user',4,'delete_user'),(16,'Can view user',4,'view_user'),(17,'Can add content type',5,'add_contenttype'),(18,'Can change content type',5,'change_contenttype'),(19,'Can delete content type',5,'delete_contenttype'),(20,'Can view content type',5,'view_contenttype'),(21,'Can add session',6,'add_session'),(22,'Can change session',6,'change_session'),(23,'Can delete session',6,'delete_session'),(24,'Can view session',6,'view_session'),(25,'Can add profile',7,'add_profile'),(26,'Can change profile',7,'change_profile'),(27,'Can delete profile',7,'delete_profile'),(28,'Can view profile',7,'view_profile'),(29,'Can add User Activity Log',8,'add_useractivitylog'),(30,'Can change User Activity Log',8,'change_useractivitylog'),(31,'Can delete User Activity Log',8,'delete_useractivitylog'),(32,'Can view User Activity Log',8,'view_useractivitylog'),(33,'Can add service',9,'add_service'),(34,'Can change service',9,'change_service'),(35,'Can delete service',9,'delete_service'),(36,'Can view service',9,'view_service'),(37,'Can add vehicle',10,'add_vehicle'),(38,'Can change vehicle',10,'change_vehicle'),(39,'Can delete vehicle',10,'delete_vehicle'),(40,'Can view vehicle',10,'view_vehicle'),(41,'Can add service request',11,'add_servicerequest'),(42,'Can change service request',11,'change_servicerequest'),(43,'Can delete service request',11,'delete_servicerequest'),(44,'Can view service request',11,'view_servicerequest'),(45,'Can add users',12,'add_users'),(46,'Can change users',12,'change_users'),(47,'Can delete users',12,'delete_users'),(48,'Can view users',12,'view_users'),(49,'Can add purchase order',13,'add_purchaseorder'),(50,'Can change purchase order',13,'change_purchaseorder'),(51,'Can delete purchase order',13,'delete_purchaseorder'),(52,'Can view purchase order',13,'view_purchaseorder'),(53,'Can add supplier',14,'add_supplier'),(54,'Can change supplier',14,'change_supplier'),(55,'Can delete supplier',14,'delete_supplier'),(56,'Can view supplier',14,'view_supplier'),(57,'Can add spare part',15,'add_sparepart'),(58,'Can change spare part',15,'change_sparepart'),(59,'Can delete spare part',15,'delete_sparepart'),(60,'Can view spare part',15,'view_sparepart'),(61,'Can add purchase order item',16,'add_purchaseorderitem'),(62,'Can change purchase order item',16,'change_purchaseorderitem'),(63,'Can delete purchase order item',16,'delete_purchaseorderitem'),(64,'Can view purchase order item',16,'view_purchaseorderitem'),(65,'Can add notification',17,'add_notification'),(66,'Can change notification',17,'change_notification'),(67,'Can delete notification',17,'delete_notification'),(68,'Can view notification',17,'view_notification');
/*!40000 ALTER TABLE `auth_permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user`
--

DROP TABLE IF EXISTS `auth_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `password` varchar(128) COLLATE utf8mb4_general_ci NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `first_name` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `last_name` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(254) COLLATE utf8mb4_general_ci NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user`
--

LOCK TABLES `auth_user` WRITE;
/*!40000 ALTER TABLE `auth_user` DISABLE KEYS */;
INSERT INTO `auth_user` VALUES (1,'pbkdf2_sha256$600000$7C44nhYR2Gy2TlVwUKL9b5$BHrB0OvqTo3iS6bMsMYI0l+TLqQQPXBB9b/AOnjThxM=',NULL,1,'admin1','Admin','One','admin1@example.com',1,1,'2025-12-24 12:12:09.779926'),(5,'pbkdf2_sha256$600000$ypkE8OwVOuJP4hpMMOGCjx$J2qxGu3Ab5YHX1hcKSvTt4ua75rbQ6UYLNH7hjsNzCc=',NULL,0,'supplier1','Supplier','One','supplier1@example.com',0,1,'2025-12-24 12:30:01.920100'),(6,'pbkdf2_sha256$600000$yVX4sT8T1yf99m26hfmmAo$lVHKWLoyg4gzmfv4YHRhcQbmlBF4kJbvNjgeqKTn7qY=',NULL,0,'ops1','Ops','One','ops1@example.com',0,1,'2025-12-24 12:30:05.408152');
/*!40000 ALTER TABLE `auth_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user_groups`
--

DROP TABLE IF EXISTS `auth_user_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_user_groups` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `group_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_user_groups_user_id_group_id_94350c0c_uniq` (`user_id`,`group_id`),
  KEY `auth_user_groups_group_id_97559544_fk_auth_group_id` (`group_id`),
  CONSTRAINT `auth_user_groups_group_id_97559544_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`),
  CONSTRAINT `auth_user_groups_user_id_6a12ed8b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user_groups`
--

LOCK TABLES `auth_user_groups` WRITE;
/*!40000 ALTER TABLE `auth_user_groups` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_user_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user_user_permissions`
--

DROP TABLE IF EXISTS `auth_user_user_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_user_user_permissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_user_user_permissions_user_id_permission_id_14a6b632_uniq` (`user_id`,`permission_id`),
  KEY `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user_user_permissions`
--

LOCK TABLES `auth_user_user_permissions` WRITE;
/*!40000 ALTER TABLE `auth_user_user_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_user_user_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_admin_log`
--

DROP TABLE IF EXISTS `django_admin_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_admin_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext COLLATE utf8mb4_general_ci,
  `object_repr` varchar(200) COLLATE utf8mb4_general_ci NOT NULL,
  `action_flag` smallint unsigned NOT NULL,
  `change_message` longtext COLLATE utf8mb4_general_ci NOT NULL,
  `content_type_id` int DEFAULT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  KEY `django_admin_log_user_id_c564eba6_fk_auth_user_id` (`user_id`),
  CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  CONSTRAINT `django_admin_log_user_id_c564eba6_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`),
  CONSTRAINT `django_admin_log_chk_1` CHECK ((`action_flag` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_admin_log`
--

LOCK TABLES `django_admin_log` WRITE;
/*!40000 ALTER TABLE `django_admin_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `django_admin_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_content_type`
--

DROP TABLE IF EXISTS `django_content_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_content_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `app_label` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `model` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_content_type`
--

LOCK TABLES `django_content_type` WRITE;
/*!40000 ALTER TABLE `django_content_type` DISABLE KEYS */;
INSERT INTO `django_content_type` VALUES (17,'accounts','notification'),(7,'accounts','profile'),(8,'accounts','useractivitylog'),(1,'admin','logentry'),(3,'auth','group'),(2,'auth','permission'),(4,'auth','user'),(5,'contenttypes','contenttype'),(6,'sessions','session'),(13,'supplier','purchaseorder'),(16,'supplier','purchaseorderitem'),(15,'supplier','sparepart'),(14,'supplier','supplier');
/*!40000 ALTER TABLE `django_content_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_migrations`
--

DROP TABLE IF EXISTS `django_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_migrations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `app` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `applied` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_migrations`
--

LOCK TABLES `django_migrations` WRITE;
/*!40000 ALTER TABLE `django_migrations` DISABLE KEYS */;
INSERT INTO `django_migrations` VALUES (1,'contenttypes','0001_initial','2025-12-24 12:11:59.946415'),(2,'auth','0001_initial','2025-12-24 12:12:00.137266'),(3,'accounts','0001_initial','2025-12-24 12:12:00.167187'),(4,'accounts','0002_alter_profile_role','2025-12-24 12:12:00.176268'),(5,'accounts','0003_alter_profile_phone_alter_profile_role','2025-12-24 12:12:00.196338'),(6,'admin','0001_initial','2025-12-24 12:12:00.242181'),(7,'admin','0002_logentry_remove_auto_add','2025-12-24 12:12:00.248422'),(8,'admin','0003_logentry_add_action_flag_choices','2025-12-24 12:12:00.256183'),(9,'contenttypes','0002_remove_content_type_name','2025-12-24 12:12:00.289516'),(10,'auth','0002_alter_permission_name_max_length','2025-12-24 12:12:00.313985'),(11,'auth','0003_alter_user_email_max_length','2025-12-24 12:12:00.330953'),(12,'auth','0004_alter_user_username_opts','2025-12-24 12:12:00.338890'),(13,'auth','0005_alter_user_last_login_null','2025-12-24 12:12:00.358143'),(14,'auth','0006_require_contenttypes_0002','2025-12-24 12:12:00.360488'),(15,'auth','0007_alter_validators_add_error_messages','2025-12-24 12:12:00.368282'),(16,'auth','0008_alter_user_username_max_length','2025-12-24 12:12:00.379347'),(17,'auth','0009_alter_user_last_name_max_length','2025-12-24 12:12:00.389042'),(18,'auth','0010_alter_group_name_max_length','2025-12-24 12:12:00.398265'),(19,'auth','0011_update_proxy_permissions','2025-12-24 12:12:00.405154'),(20,'auth','0012_alter_user_first_name_max_length','2025-12-24 12:12:00.414425'),(21,'sessions','0001_initial','2025-12-24 12:12:00.429727'),(22,'accounts','0004_useractivitylog','2026-01-26 16:38:40.155247'),(24,'supplier','0001_initial','2026-01-26 16:43:12.065901'),(25,'supplier','0002_purchaseorder_approved_at_delivered_at','2026-01-26 19:00:10.480563'),(26,'supplier','0003_alter_users_options_and_more','2026-01-27 09:22:30.893631'),(27,'supplier','0004_alter_purchaseorder_created_by_user_delete_users','2026-01-27 09:22:34.332886'),(28,'accounts','0005_notification','2026-01-27 09:40:33.095303'),(29,'supplier','0005_users_supplierpayment_purchaseinvoice_and_more','2026-02-04 07:11:15.370643');
/*!40000 ALTER TABLE `django_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_session`
--

DROP TABLE IF EXISTS `django_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_session` (
  `session_key` varchar(40) COLLATE utf8mb4_general_ci NOT NULL,
  `session_data` longtext COLLATE utf8mb4_general_ci NOT NULL,
  `expire_date` datetime(6) NOT NULL,
  PRIMARY KEY (`session_key`),
  KEY `django_session_expire_date_a5c62663` (`expire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_session`
--

LOCK TABLES `django_session` WRITE;
/*!40000 ALTER TABLE `django_session` DISABLE KEYS */;
/*!40000 ALTER TABLE `django_session` ENABLE KEYS */;
UNLOCK TABLES;


--
-- Table structure for table `purchase_invoices`
--

DROP TABLE IF EXISTS `purchase_invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase_invoices` (
  `invoice_id` int NOT NULL AUTO_INCREMENT,
  `invoice_number` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `issue_date` date NOT NULL,
  `due_date` date DEFAULT NULL,
  `total_amount` decimal(15,2) NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `file` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `order_id` int NOT NULL,
  PRIMARY KEY (`invoice_id`),
  UNIQUE KEY `invoice_number` (`invoice_number`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase_invoices`
--

LOCK TABLES `purchase_invoices` WRITE;
/*!40000 ALTER TABLE `purchase_invoices` DISABLE KEYS */;
INSERT INTO `purchase_invoices` VALUES (1,'INV-2026A','2026-01-25','2026-02-10',5000.00,'paid','',29),(2,'INV-2026B','2026-01-26','2026-02-15',3200.00,'Paid','',28),(3,'INV-2026C','2026-01-27','2026-02-20',1500.00,'Unpaid','',27),(4,'INV-2026D','2026-01-27','2026-02-25',4200.00,'Paid','',26);
/*!40000 ALTER TABLE `purchase_invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchase_order_items`
--

DROP TABLE IF EXISTS `purchase_order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase_order_items` (
  `item_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `part_id` int NOT NULL,
  `quantity` int NOT NULL,
  `agreed_price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`item_id`),
  KEY `idx_poi_order` (`order_id`),
  KEY `idx_poi_part` (`part_id`),
  CONSTRAINT `fk_poi_order` FOREIGN KEY (`order_id`) REFERENCES `purchase_orders` (`order_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_poi_part` FOREIGN KEY (`part_id`) REFERENCES `spare_parts` (`part_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase_order_items`
--

LOCK TABLES `purchase_order_items` WRITE;
/*!40000 ALTER TABLE `purchase_order_items` DISABLE KEYS */;
INSERT INTO `purchase_order_items` VALUES (23,26,1,1,45.00),(24,27,1,6,45.00),(25,28,1,1,45.00),(26,29,3,8,150.00);
/*!40000 ALTER TABLE `purchase_order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchase_orders`
--

DROP TABLE IF EXISTS `purchase_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase_orders` (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `po_reference_number` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `supplier_id` int NOT NULL,
  `created_by_user_id` int NOT NULL,
  `order_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `expected_delivery_date` date DEFAULT NULL,
  `total_amount` decimal(15,2) DEFAULT '0.00',
  `status` enum('Pending','Approved','Rejected','Delivered','Cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'Pending',
  `approved_at` datetime DEFAULT NULL,
  `delivered_at` datetime DEFAULT NULL,
  PRIMARY KEY (`order_id`),
  UNIQUE KEY `uq_po_reference` (`po_reference_number`),
  KEY `idx_po_supplier` (`supplier_id`),
  KEY `idx_po_created_by` (`created_by_user_id`),
  CONSTRAINT `fk_po_created_by_user` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`user_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_po_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`supplier_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase_orders`
--

LOCK TABLES `purchase_orders` WRITE;
/*!40000 ALTER TABLE `purchase_orders` DISABLE KEYS */;
INSERT INTO `purchase_orders` VALUES (26,'PO-649537',1,1,'2026-01-26 19:44:18','2026-01-28',45.00,'Delivered','2026-01-26 19:44:22','2026-01-26 19:44:23'),(27,'PO-700266',1,1,'2026-01-26 19:45:10','2026-02-04',270.00,'Delivered','2026-01-26 19:45:11','2026-01-26 19:45:12'),(28,'PO-742146',1,1,'2026-01-26 19:45:49','2026-01-28',45.00,'Delivered','2026-01-26 19:46:03','2026-01-26 19:46:17'),(29,'PO-831025',2,1,'2026-01-26 19:47:29','2026-01-28',1200.00,'Delivered','2026-01-26 19:47:30','2026-01-26 19:47:31');
/*!40000 ALTER TABLE `purchase_orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `spare_parts`
--

DROP TABLE IF EXISTS `spare_parts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `spare_parts` (
  `part_id` int NOT NULL AUTO_INCREMENT,
  `part_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sku_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `unit_price` decimal(10,2) NOT NULL,
  `current_stock` int DEFAULT '0',
  `supplier_id` int DEFAULT NULL,
  PRIMARY KEY (`part_id`),
  UNIQUE KEY `uq_spare_parts_sku` (`sku_code`),
  KEY `idx_spare_parts_supplier` (`supplier_id`),
  CONSTRAINT `fk_spare_parts_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`supplier_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `spare_parts`
--

LOCK TABLES `spare_parts` WRITE;
/*!40000 ALTER TABLE `spare_parts` DISABLE KEYS */;
INSERT INTO `spare_parts` VALUES (1,'Brake Pad','BP-001',NULL,45.00,12,1),(3,'Alternator','ALT-300',NULL,150.00,10,2);
/*!40000 ALTER TABLE `spare_parts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supplier_payments`
--

DROP TABLE IF EXISTS `supplier_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supplier_payments` (
  `payment_id` int NOT NULL AUTO_INCREMENT,
  `amount` decimal(15,2) NOT NULL,
  `payment_date` date NOT NULL,
  `payment_method` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `reference_number` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `notes` longtext COLLATE utf8mb4_general_ci,
  `order_id` int NOT NULL,
  `supplier_id` int NOT NULL,
  PRIMARY KEY (`payment_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supplier_payments`
--

LOCK TABLES `supplier_payments` WRITE;
/*!40000 ALTER TABLE `supplier_payments` DISABLE KEYS */;
INSERT INTO `supplier_payments` VALUES (2,3200.00,'2026-01-26','CASH','REF1002','Paid in cash',29,1),(3,1500.00,'2026-01-27','CARD','REF1003','Card payment',29,1),(4,4200.00,'2026-01-27','CHEQUE','REF1004','Cheque received',27,1),(5,2100.00,'2026-01-28','OTHER','REF1005','Other method',28,2);
/*!40000 ALTER TABLE `supplier_payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suppliers` (
  `supplier_id` int NOT NULL AUTO_INCREMENT,
  `supplier_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone_number` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`supplier_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suppliers`
--

LOCK TABLES `suppliers` WRITE;
/*!40000 ALTER TABLE `suppliers` DISABLE KEYS */;
INSERT INTO `suppliers` VALUES (1,'AutoParts Express','sales@autoparts.com','555-0101','123 Motor Way',1),(2,'Global Spares','info@globalspares.com','555-0102','456 Engine Blvd',1);
/*!40000 ALTER TABLE `suppliers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vendor_scores`
--

DROP TABLE IF EXISTS `vendor_scores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vendor_scores` (
  `score_id` int NOT NULL AUTO_INCREMENT,
  `supplier_id` int NOT NULL,
  `score` decimal(5,2) NOT NULL DEFAULT '0.00',
  `on_time_rate` decimal(5,2) NOT NULL DEFAULT '0.00',
  `avg_approval_hours` decimal(8,2) NOT NULL DEFAULT '0.00',
  `dispute_rate` decimal(5,2) NOT NULL DEFAULT '0.00',
  `completion_rate` decimal(5,2) NOT NULL DEFAULT '0.00',
  `last_calculated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`score_id`),
  UNIQUE KEY `uq_vendor_scores_supplier` (`supplier_id`),
  CONSTRAINT `vendor_scores_supplier_id_fk` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`supplier_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendor_scores`
--

LOCK TABLES `vendor_scores` WRITE, `suppliers` READ;
/*!40000 ALTER TABLE `vendor_scores` DISABLE KEYS */;
INSERT INTO `vendor_scores` (`supplier_id`)
SELECT `supplier_id` FROM `suppliers`;
/*!40000 ALTER TABLE `vendor_scores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('Admin','Ops Manager','Supplier') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','dummy_hash','Admin','2026-02-04 07:10:01');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-04 12:43:16
