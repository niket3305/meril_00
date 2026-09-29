-- Seed script for Meril App Database

-- 1. USERS & LOGINS
INSERT INTO users (id, name, email, phone, role, password_hash) VALUES
('usr-1', 'Dr. Ramesh Sundaram', 'dr.ramesh@apollohospitals.com', '+91 98401 23456', 'customer', '$2a$10$abcdefghijklmnopqrstuv'),
('usr-2', 'Rajesh Sharma', 'rajesh.sharma@merillife.com', '+91 98250 11223', 'engineer', '$2a$10$abcdefghijklmnopqrstuv'),
('usr-3', 'System Administrator', 'admin@merillife.com', '+91 98250 00000', 'admin', '$2a$10$abcdefghijklmnopqrstuv')
ON CONFLICT (id) DO NOTHING;

-- 2. LOGIN HISTORY
INSERT INTO user_login_history (user_id, login_time, ip_address, status) VALUES
('usr-1', CURRENT_TIMESTAMP - INTERVAL '2 days', '192.168.1.50', 'SUCCESS'),
('usr-2', CURRENT_TIMESTAMP - INTERVAL '1 day', '192.168.1.102', 'SUCCESS'),
('usr-3', CURRENT_TIMESTAMP - INTERVAL '3 hours', '127.0.0.1', 'SUCCESS');

-- 3. CUSTOMERS
INSERT INTO customers (id, name, code, type, address, city, state, pincode, phone, email) VALUES
('cust-1', 'Apollo Specialty Hospitals', 'APL-CHE-01', 'Multispecialty Hospital', '21 Greams Lane, Off Greams Road, Thousand Lights', 'Chennai', 'Tamil Nadu', '600006', '+91 44 2829 0200', 'biomedical.apollo@apollohospitals.com'),
('cust-2', 'Fortis Escorts Heart Institute', 'FEHI-DEL-02', 'Cardiology Center', 'Okhla Road, Sukhdev Vihar, Metro Station', 'New Delhi', 'Delhi', '110025', '+91 11 4713 5000', 'service.fehi@fortishealthcare.com'),
('cust-3', 'Max Super Speciality Hospital', 'MAX-MUM-03', 'Multispecialty Hospital', '1 2, Press Enclave Marg, Saket', 'New Delhi', 'Delhi', '110017', '+91 11 2651 5050', 'bme.saket@maxhealthcare.com')
ON CONFLICT (id) DO NOTHING;

-- 4. CUSTOMER SITES
INSERT INTO customer_sites (id, customer_id, name, department, building_floor, city, state) VALUES
('site-101', 'cust-1', 'Apollo Heart Center - CathLab 2', 'Cardiology & Interventional Radiology', 'Tower B, 3rd Floor', 'Chennai', 'Tamil Nadu'),
('site-102', 'cust-1', 'Apollo Robotic Joint Center', 'Orthopedic Surgery & Robotics', 'Tower A, 4th Floor, OT Suite 5', 'Chennai', 'Tamil Nadu'),
('site-201', 'cust-2', 'Fortis Advanced Structural Heart Suite', 'Structural Heart & TAVR Suite', 'Main Block, Ground Floor', 'New Delhi', 'Delhi')
ON CONFLICT (id) DO NOTHING;

-- 5. CONTACT PERSONS
INSERT INTO contact_persons (id, site_id, name, role, email, phone, is_primary) VALUES
('cp-1', 'site-101', 'Dr. Ramesh Sundaram', 'Lead Interventional Cardiologist', 'dr.ramesh@apollohospitals.com', '+91 98401 23456', TRUE),
('cp-2', 'site-101', 'Karthik Raja', 'Senior Biomedical Engineer', 'karthik.bme@apollohospitals.com', '+91 98402 78910', FALSE),
('cp-3', 'site-102', 'Dr. Sandhya Swaminathan', 'Chief Orthopedic Surgeon', 'dr.sandhya@apollohospitals.com', '+91 98403 45678', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 6. ENGINEERS
INSERT INTO engineers (id, name, code, email, phone, avatar, designation, specializations, current_city, active_jobs_count, rating, is_available) VALUES
('eng-1', 'Rajesh Sharma', 'ENG-CHE-09', 'rajesh.sharma@merillife.com', '+91 98250 11223', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'Senior Field Application Specialist', ARRAY['Cardiovascular', 'CathLab Systems'], 'Chennai', 2, 4.9, TRUE),
('eng-2', 'Vikramaditya Rao', 'ENG-DEL-14', 'vikram.rao@merillife.com', '+91 98110 55667', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'Lead Surgical Robotics Engineer', ARRAY['Orthopedics', 'Robotics'], 'New Delhi', 1, 4.85, TRUE)
ON CONFLICT (id) DO NOTHING;

-- 7. MACHINES
INSERT INTO machines (id, serial_number, model, category, customer_id, site_id, install_date, warranty_type, warranty_expiry_date, status, last_service_date, next_service_due, image_url, specifications) VALUES
('mach-1', 'MRL-CATH-2023-0892', 'Myval Transcatheter Heart Valve System', 'Cardiovascular', 'cust-1', 'site-101', '2023-03-15', 'UNDER_WARRANTY', '2025-03-14', 'BREAKDOWN', '2024-01-10', '2024-04-10', 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600', '{"generator": "100kW High Frequency Generator", "detector": "30x40 cm Flat Panel Detector", "softwareVersion": "v4.2.1-PRO"}'),
('mach-2', 'MRL-ROBO-2022-0411', 'CUVIS Joint Robotic System', 'Orthopedics', 'cust-1', 'site-102', '2022-11-01', 'CMC_ACTIVE', '2025-10-31', 'OPERATIONAL', '2024-02-01', '2024-05-01', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600', '{"armDegreesOfFreedom": "6-Axis Precision Arm", "opticalTracking": "Sub-millimeter Stereo Camera"}')
ON CONFLICT (id) DO NOTHING;

-- 8. SPARE PARTS
INSERT INTO spare_parts (id, part_number, name, category, price, stock_qty, compatible_models) VALUES
('sp-1', 'PRT-FLUID-001', 'Peristaltic Pump Tubing Set', 'Fluidics', 12500.00, 45, ARRAY['Myval Transcatheter Heart Valve System']),
('sp-2', 'PRT-ELECT-099', 'High Voltage Generator Control Board', 'Electronics', 185000.00, 8, ARRAY['Myval Transcatheter Heart Valve System'])
ON CONFLICT (id) DO NOTHING;

-- 9. SERVICE TICKETS (Customer Requests)
INSERT INTO service_tickets (id, ticket_number, machine_id, customer_id, site_id, contact_name, contact_phone, priority, fault_category, fault_description, photos, status, assigned_engineer_id, eta_minutes, otp, resolution_notes, closure_photos, customer_signature, customer_approved_by, created_at, updated_at, closed_at) VALUES
('tkt-1001', 'SR-2024-04891', 'mach-1', 'cust-1', 'site-101', 'Dr. Ramesh Sundaram', '+91 98401 23456', 'CRITICAL', 'OPTICAL_FLUIDICS', 'Contrast injection pressure drops unexpectedly during balloon inflation.', ARRAY['https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600'], 'IN_PROGRESS', 'eng-1', 25, '8492', NULL, ARRAY[]::text[], NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '45 minutes', CURRENT_TIMESTAMP - INTERVAL '10 minutes', NULL)
ON CONFLICT (id) DO NOTHING;

-- 10. TICKET TIMELINE HISTORY
INSERT INTO ticket_timeline_events (id, ticket_id, status, title, description, actor_name, actor_role, timestamp) VALUES
('tl-1', 'tkt-1001', 'RAISED', 'Service Request Created', 'Ticket raised via Mobile App by Dr. Ramesh Sundaram', 'Dr. Ramesh Sundaram', 'Customer (Lead Cardiologist)', CURRENT_TIMESTAMP - INTERVAL '45 minutes'),
('tl-2', 'tkt-1001', 'ASSIGNED', 'Engineer Assigned', 'Rajesh Sharma auto-assigned based on location proximity', 'Automated Dispatch System', 'System', CURRENT_TIMESTAMP - INTERVAL '40 minutes'),
('tl-3', 'tkt-1001', 'EN_ROUTE', 'Engineer En Route', 'Rajesh Sharma accepted job and is travelling to CathLab 2', 'Rajesh Sharma', 'Senior Field Specialist', CURRENT_TIMESTAMP - INTERVAL '30 minutes')
ON CONFLICT (id) DO NOTHING;