-- =========================================================
-- WayHome schema (MySQL)
-- Run: mysql -u root -p < schema.sql
-- (Hibernate ddl-auto=update can create these automatically instead)
-- =========================================================

CREATE DATABASE IF NOT EXISTS wayhome CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE wayhome;

CREATE TABLE IF NOT EXISTS user (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    phone       VARCHAR(50),
    password    VARCHAR(255) NOT NULL,
    role        VARCHAR(50) NOT NULL,
    status      VARCHAR(50) DEFAULT 'Active',
    created_at  DATETIME
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS property (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    title         VARCHAR(255) NOT NULL,
    type          VARCHAR(100),
    city          VARCHAR(100),
    state         VARCHAR(100),
    pin           VARCHAR(20),
    location      VARCHAR(255),
    rent_monthly  DOUBLE,
    sale_price    DOUBLE,
    listing_for   VARCHAR(30),
    bedrooms      INT,
    bathrooms     INT,
    area_sqft     DOUBLE,
    furnishing    VARCHAR(100),
    deposit       DOUBLE,
    maintenance   DOUBLE,
    image_url     LONGTEXT,
    latitude      DOUBLE,
    longitude     DOUBLE,
    description   LONGTEXT,
    status        VARCHAR(50) DEFAULT 'PENDING',
    verified      BIT(1) DEFAULT b'0',
    owner_id      BIGINT NOT NULL,
    CONSTRAINT fk_property_owner FOREIGN KEY (owner_id) REFERENCES user (id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS property_facility (
    property_id BIGINT NOT NULL,
    facility VARCHAR(255) NOT NULL,
    PRIMARY KEY (property_id, facility),
    CONSTRAINT fk_facility_property FOREIGN KEY (property_id) REFERENCES property (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS property_custom_field (
    property_id BIGINT NOT NULL,
    field_name VARCHAR(255) NOT NULL,
    field_value VARCHAR(1000),
    PRIMARY KEY (property_id, field_name),
    CONSTRAINT fk_custom_field_property FOREIGN KEY (property_id) REFERENCES property (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS property_image (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    property_id  BIGINT NOT NULL,
    image_url    LONGTEXT,
    CONSTRAINT fk_image_property FOREIGN KEY (property_id) REFERENCES property (id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS university (
    id     BIGINT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    city       VARCHAR(100),
    state      VARCHAR(100),
    latitude   DOUBLE,
    longitude  DOUBLE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS student_accommodation (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    name           VARCHAR(255),
    type           VARCHAR(50),
    university_id  BIGINT,
    distance_km    DOUBLE,
    rent_monthly   DOUBLE,
    room_type      VARCHAR(100),
    furnishing     VARCHAR(100),
    image_url      LONGTEXT,
    latitude       DOUBLE,
    longitude      DOUBLE,
    description    LONGTEXT,
    rating         DOUBLE,
    review_count   INT,
    available_rooms INT,
    wifi           BIT(1) DEFAULT b'0',
    food           BIT(1) DEFAULT b'0',
    laundry        BIT(1) DEFAULT b'0',
    security       BIT(1) DEFAULT b'0',
    owner_name     VARCHAR(255),
    owner_phone    VARCHAR(50),
    CONSTRAINT fk_accom_university FOREIGN KEY (university_id) REFERENCES university (id)
        ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS application (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    property_id  BIGINT NOT NULL,
    tenant_id    BIGINT NOT NULL,
    status       VARCHAR(50) DEFAULT 'Pending',
    applied_at   DATETIME,
    CONSTRAINT fk_application_property FOREIGN KEY (property_id) REFERENCES property (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_application_tenant FOREIGN KEY (tenant_id) REFERENCES user (id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS agreement (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id  BIGINT UNIQUE,
    property_id     BIGINT NOT NULL,
    tenant_id       BIGINT NOT NULL,
    owner_id        BIGINT NOT NULL,
    start_date      DATE,
    end_date        DATE,
    monthly_rent    DOUBLE,
    status          VARCHAR(50) DEFAULT 'Active',
    CONSTRAINT fk_agreement_application FOREIGN KEY (application_id) REFERENCES application (id)
        ON DELETE SET NULL,
    CONSTRAINT fk_agreement_property FOREIGN KEY (property_id) REFERENCES property (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_agreement_tenant FOREIGN KEY (tenant_id) REFERENCES user (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_agreement_owner FOREIGN KEY (owner_id) REFERENCES user (id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS message (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    sender_id    BIGINT NOT NULL,
    receiver_id  BIGINT NOT NULL,
    property_id  BIGINT,
    content      LONGTEXT,
    sent_at      DATETIME,
    is_read      BIT(1) DEFAULT b'0',
    CONSTRAINT fk_message_sender FOREIGN KEY (sender_id) REFERENCES user (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_message_receiver FOREIGN KEY (receiver_id) REFERENCES user (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_message_property FOREIGN KEY (property_id) REFERENCES property (id)
        ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notification (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT NOT NULL,
    title       VARCHAR(255),
    body        VARCHAR(1000),
    is_read     BIT(1) DEFAULT b'0',
    created_at  DATETIME,
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES user (id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS system_setting (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(120) NOT NULL UNIQUE,
    setting_value LONGTEXT,
    description VARCHAR(500),
    updated_at DATETIME
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS audit_log (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    actor_id     BIGINT,
    action       VARCHAR(100) NOT NULL,
    entity_type  VARCHAR(100) NOT NULL,
    entity_id    BIGINT,
    details      LONGTEXT,
    timestamp    DATETIME,
    ip_address   VARCHAR(50)
) ENGINE=InnoDB;

-- =========================================================
-- OTP verification (passwordless Email-OTP login)
-- =========================================================
CREATE TABLE IF NOT EXISTS otp_verification (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    email       VARCHAR(320) NOT NULL,
    otp_hash    VARCHAR(255) NOT NULL,
    created_at  DATETIME(6) NOT NULL,
    expires_at  DATETIME(6) NOT NULL,
    attempts    INT          NOT NULL DEFAULT 0,
    used        BIT(1)       NOT NULL DEFAULT b'0',
    purpose     VARCHAR(30)  NOT NULL,
    INDEX idx_otp_email_purpose (email, purpose)
) ENGINE=InnoDB;
