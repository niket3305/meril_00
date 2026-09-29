import { Customer, Machine, Engineer, SparePart, ServiceTicket } from '../types';
import { INITIAL_CUSTOMERS, INITIAL_MACHINES, INITIAL_ENGINEERS, INITIAL_SPARE_PARTS, INITIAL_TICKETS } from '../data/initialData';

export const seedDatabaseSQL = (): string => {
  let sql = `-- Seed script for Meril App Database\n\n`;

  // Seed Users & Logins
  sql += `-- Seed Users\n`;
  sql += `INSERT INTO users (id, name, email, phone, role, password_hash) VALUES\n`;
  sql += `('usr-1', 'Dr. Ramesh Sundaram', 'dr.ramesh@apollohospitals.com', '+91 98401 23456', 'customer', 'hash_customer_1'),\n`;
  sql += `('usr-2', 'Rajesh Sharma', 'rajesh.sharma@merillife.com', '+91 98250 11223', 'engineer', 'hash_engineer_1'),\n`;
  sql += `('usr-3', 'System Administrator', 'admin@merillife.com', '+91 98250 00000', 'admin', 'hash_admin_1')\n`;
  sql += `ON CONFLICT (id) DO NOTHING;\n\n`;

  // Seed User Login History
  sql += `-- Seed Sample User Login History\n`;
  sql += `INSERT INTO user_login_history (user_id, login_time, ip_address, status) VALUES\n`;
  sql += `('usr-1', CURRENT_TIMESTAMP - INTERVAL '2 days', '192.168.1.50', 'SUCCESS'),\n`;
  sql += `('usr-2', CURRENT_TIMESTAMP - INTERVAL '1 day', '192.168.1.102', 'SUCCESS'),\n`;
  sql += `('usr-3', CURRENT_TIMESTAMP - INTERVAL '3 hours', '127.0.0.1', 'SUCCESS');\n\n`;

  // Seed Customers
  sql += `-- Seed Customers\n`;
  const customerValues = INITIAL_CUSTOMERS.map(c => 
    `('${c.id}', '${c.name.replace(/'/g, "''")}', '${c.code}', '${c.type}', '${c.address.replace(/'/g, "''")}', '${c.city}', '${c.state}', '${c.pincode}', '${c.phone}', '${c.email}')`
  ).join(',\n');
  sql += `INSERT INTO customers (id, name, code, type, address, city, state, pincode, phone, email) VALUES\n${customerValues}\nON CONFLICT (id) DO NOTHING;\n\n`;

  // Seed Customer Sites & Contact Persons
  sql += `-- Seed Sites & Contacts\n`;
  INITIAL_CUSTOMERS.forEach(c => {
    c.sites.forEach(s => {
      sql += `INSERT INTO customer_sites (id, customer_id, name, department, building_floor, city, state) VALUES\n`;
      sql += `('${s.id}', '${s.customerId}', '${s.name.replace(/'/g, "''")}', '${s.department.replace(/'/g, "''")}', '${s.buildingFloor.replace(/'/g, "''")}', '${s.city}', '${s.state}')\nON CONFLICT (id) DO NOTHING;\n`;
      
      s.contacts.forEach(cp => {
        sql += `INSERT INTO contact_persons (id, site_id, name, role, email, phone, is_primary) VALUES\n`;
        sql += `('${cp.id}', '${s.id}', '${cp.name.replace(/'/g, "''")}', '${cp.role.replace(/'/g, "''")}', '${cp.email}', '${cp.phone}', ${cp.isPrimary})\nON CONFLICT (id) DO NOTHING;\n`;
      });
    });
  });

  // Seed Engineers
  sql += `\n-- Seed Engineers\n`;
  const engineerValues = INITIAL_ENGINEERS.map(e => 
    `('${e.id}', '${e.name.replace(/'/g, "''")}', '${e.code}', '${e.email}', '${e.phone}', '${e.avatar}', '${e.designation}', ARRAY[${e.specializations.map(s => `'${s.replace(/'/g, "''")}'`).join(',')}], '${e.currentCity}', ${e.activeJobsCount}, ${e.rating}, ${e.isAvailable})`
  ).join(',\n');
  sql += `INSERT INTO engineers (id, name, code, email, phone, avatar, designation, specializations, current_city, active_jobs_count, rating, is_available) VALUES\n${engineerValues}\nON CONFLICT (id) DO NOTHING;\n\n`;

  // Seed Machines
  sql += `-- Seed Machines\n`;
  const machineValues = INITIAL_MACHINES.map(m => 
    `('${m.id}', '${m.serialNumber}', '${m.model.replace(/'/g, "''")}', '${m.category}', '${m.customerId}', '${m.siteId}', '${m.installDate}', '${m.warrantyType}', '${m.warrantyExpiryDate}', '${m.status}', '${m.lastServiceDate}', '${m.nextServiceDue}', '${m.imageUrl}', '${JSON.stringify(m.specifications)}')`
  ).join(',\n');
  sql += `INSERT INTO machines (id, serial_number, model, category, customer_id, site_id, install_date, warranty_type, warranty_expiry_date, status, last_service_date, next_service_due, image_url, specifications) VALUES\n${machineValues}\nON CONFLICT (id) DO NOTHING;\n\n`;

  // Seed Spare Parts
  sql += `-- Seed Spare Parts\n`;
  const partValues = INITIAL_SPARE_PARTS.map(p => 
    `('${p.id}', '${p.partNumber}', '${p.name.replace(/'/g, "''")}', '${p.category}', ${p.price}, ${p.stockQty}, ARRAY[${p.compatibleModels.map(m => `'${m.replace(/'/g, "''")}'`).join(',')}])`
  ).join(',\n');
  sql += `INSERT INTO spare_parts (id, part_number, name, category, price, stock_qty, compatible_models) VALUES\n${partValues}\nON CONFLICT (id) DO NOTHING;\n\n`;

  // Seed Service Tickets & History
  sql += `-- Seed Service Tickets & History\n`;
  INITIAL_TICKETS.forEach(t => {
    sql += `INSERT INTO service_tickets (id, ticket_number, machine_id, customer_id, site_id, contact_name, contact_phone, priority, fault_category, fault_description, photos, status, assigned_engineer_id, eta_minutes, otp, resolution_notes, closure_photos, customer_signature, customer_approved_by, created_at, updated_at, closed_at) VALUES\n`;
    sql += `('${t.id}', '${t.ticketNumber}', '${t.machineId}', '${t.customerId}', '${t.siteId}', '${t.contactName.replace(/'/g, "''")}', '${t.contactPhone}', '${t.priority}', '${t.faultCategory}', '${t.faultDescription.replace(/'/g, "''")}', ARRAY[${t.photos.map(p => `'${p}'`).join(',')}], '${t.status}', ${t.assignedEngineerId ? `'${t.assignedEngineerId}'` : 'NULL'}, ${t.etaMinutes || 'NULL'}, '${t.otp}', ${t.resolutionNotes ? `'${t.resolutionNotes.replace(/'/g, "''")}'` : 'NULL'}, ARRAY[${(t.closurePhotos || []).map(p => `'${p}'`).join(',')}], ${t.customerSignature ? `'${t.customerSignature}'` : 'NULL'}, ${t.customerApprovedBy ? `'${t.customerApprovedBy.replace(/'/g, "''")}'` : 'NULL'}, '${t.createdAt}', '${t.updatedAt}', ${t.closedAt ? `'${t.closedAt}'` : 'NULL'})\nON CONFLICT (id) DO NOTHING;\n`;

    // Replaced parts history
    if (t.replacedParts && t.replacedParts.length > 0) {
      t.replacedParts.forEach(rp => {
        sql += `INSERT INTO ticket_replaced_parts (ticket_id, part_id, part_number, part_name, quantity, serial_number, warranty_covered, price) VALUES\n`;
        sql += `('${t.id}', '${rp.partId}', '${rp.partNumber}', '${rp.name.replace(/'/g, "''")}', ${rp.quantity}, ${rp.serialNumber ? `'${rp.serialNumber}'` : 'NULL'}, ${rp.warrantyCovered}, ${rp.price});\n`;
      });
    }

    // Timeline History
    if (t.timeline && t.timeline.length > 0) {
      t.timeline.forEach(tl => {
        sql += `INSERT INTO ticket_timeline_events (id, ticket_id, status, title, description, actor_name, actor_role, timestamp) VALUES\n`;
        sql += `('${tl.id}', '${t.id}', '${tl.status}', '${tl.title.replace(/'/g, "''")}', '${tl.description.replace(/'/g, "''")}', '${tl.actorName.replace(/'/g, "''")}', '${tl.actorRole}', '${tl.timestamp}')\nON CONFLICT (id) DO NOTHING;\n`;
      });
    }
  });

  return sql;
};
