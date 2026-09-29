-- Schema for Meril Field Service & Asset Management Database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS & AUTHENTICATION
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'customer', 'engineer')),
    password_hash VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. CUSTOMERS
CREATE TABLE customers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(100) NOT NULL CHECK (type IN ('Multispecialty Hospital', 'Cardiology Center', 'Orthopedic Institute', 'Diagnostic Lab')),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(20),
    phone VARCHAR(50),
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. CUSTOMER SITES
CREATE TABLE customer_sites (
    id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    building_floor VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. CONTACT PERSONS
CREATE TABLE contact_persons (
    id VARCHAR(50) PRIMARY KEY,
    site_id VARCHAR(50) NOT NULL REFERENCES customer_sites(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. ENGINEERS
CREATE TABLE engineers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    avatar TEXT,
    designation VARCHAR(100),
    specializations TEXT[],
    current_city VARCHAR(100),
    active_jobs_count INT DEFAULT 0,
    rating NUMERIC(3,2) DEFAULT 5.0,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. MACHINES / ASSETS
CREATE TABLE machines (
    id VARCHAR(50) PRIMARY KEY,
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    model VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL CHECK (category IN ('Cardiovascular', 'Orthopedics', 'Endosurgery', 'In-Vitro Diagnostics', 'ENT & Neuro')),
    customer_id VARCHAR(50) REFERENCES customers(id),
    site_id VARCHAR(50) REFERENCES customer_sites(id),
    install_date DATE,
    warranty_type VARCHAR(50) CHECK (warranty_type IN ('UNDER_WARRANTY', 'AMC_ACTIVE', 'CMC_ACTIVE', 'EXPIRED')),
    warranty_expiry_date DATE,
    status VARCHAR(50) CHECK (status IN ('OPERATIONAL', 'NEEDS_MAINTENANCE', 'BREAKDOWN')),
    last_service_date DATE,
    next_service_due DATE,
    image_url TEXT,
    specifications JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. SPARE PARTS INVENTORY
CREATE TABLE spare_parts (
    id VARCHAR(50) PRIMARY KEY,
    part_number VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    stock_qty INT DEFAULT 0,
    compatible_models TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. SERVICE TICKETS (Customer Requests)
CREATE TABLE service_tickets (
    id VARCHAR(50) PRIMARY KEY,
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    machine_id VARCHAR(50) REFERENCES machines(id),
    customer_id VARCHAR(50) REFERENCES customers(id),
    site_id VARCHAR(50) REFERENCES customer_sites(id),
    contact_name VARCHAR(255),
    contact_phone VARCHAR(50),
    priority VARCHAR(20) CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    fault_category VARCHAR(50) CHECK (fault_category IN ('SOFTWARE_ERROR', 'CALIBRATION', 'MECHANICAL', 'ELECTRICAL', 'OPTICAL_FLUIDICS', 'HARDWARE_ALARM')),
    fault_description TEXT NOT NULL,
    photos TEXT[],
    status VARCHAR(20) CHECK (status IN ('RAISED', 'ASSIGNED', 'EN_ROUTE', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
    assigned_engineer_id VARCHAR(50) REFERENCES engineers(id),
    eta_minutes INT,
    otp VARCHAR(10),
    resolution_notes TEXT,
    closure_photos TEXT[],
    customer_signature TEXT,
    customer_approved_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP WITH TIME ZONE
);

-- 9. REPLACED PARTS HISTORY
CREATE TABLE ticket_replaced_parts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ticket_id VARCHAR(50) NOT NULL REFERENCES service_tickets(id) ON DELETE CASCADE,
    part_id VARCHAR(50) REFERENCES spare_parts(id),
    part_number VARCHAR(100) NOT NULL,
    part_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    serial_number VARCHAR(100),
    warranty_covered BOOLEAN DEFAULT FALSE,
    price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. TICKET TIMELINE & HISTORY LOGS
CREATE TABLE ticket_timeline_events (
    id VARCHAR(50) PRIMARY KEY,
    ticket_id VARCHAR(50) NOT NULL REFERENCES service_tickets(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    actor_name VARCHAR(255),
    actor_role VARCHAR(50),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. LOGIN & AUDIT LOGS HISTORY
CREATE TABLE user_login_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    login_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(50),
    user_agent TEXT,
    status VARCHAR(20) DEFAULT 'SUCCESS' CHECK (status IN ('SUCCESS', 'FAILED'))
);

-- 12. OFFLINE SYNC QUEUE HISTORY
CREATE TABLE offline_sync_actions (
    id VARCHAR(50) PRIMARY KEY,
    engineer_id VARCHAR(50) REFERENCES engineers(id),
    ticket_id VARCHAR(50) REFERENCES service_tickets(id),
    type VARCHAR(50) CHECK (type IN ('ACCEPT_JOB', 'UPDATE_STATUS', 'CLOSE_JOB')),
    payload JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SYNCED', 'FAILED')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR FAST SEARCH AND HISTORY RETRIEVAL
CREATE INDEX idx_tickets_customer ON service_tickets(customer_id);
CREATE INDEX idx_tickets_engineer ON service_tickets(assigned_engineer_id);
CREATE INDEX idx_tickets_machine ON service_tickets(machine_id);
CREATE INDEX idx_tickets_status ON service_tickets(status);
CREATE INDEX idx_timeline_ticket ON ticket_timeline_events(ticket_id);
CREATE INDEX idx_login_history_user ON user_login_history(user_id);
