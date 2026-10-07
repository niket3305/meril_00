export type UserRole = 'admin' | 'customer' | 'engineer';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  facilityName?: string;
  department?: string;
  employeeId?: string;
  specialization?: string;
  city?: string;
}

export type WarrantyType = 'UNDER_WARRANTY' | 'AMC_ACTIVE' | 'CMC_ACTIVE' | 'EXPIRED';

export type MachineStatus = 'OPERATIONAL' | 'NEEDS_MAINTENANCE' | 'BREAKDOWN';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type TicketStatus = 
  | 'RAISED' 
  | 'ASSIGNED' 
  | 'ACCEPTED'
  | 'PASSED'
  | 'REJECTED'
  | 'POSTPONED'
  | 'EN_ROUTE' 
  | 'IN_PROGRESS' 
  | 'RESOLVED' 
  | 'CLOSED';

export type FaultCategory = 
  | 'SOFTWARE_ERROR' 
  | 'CALIBRATION' 
  | 'MECHANICAL' 
  | 'ELECTRICAL' 
  | 'OPTICAL_FLUIDICS' 
  | 'HARDWARE_ALARM';

export interface ContactPerson {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  isPrimary: boolean;
}

export interface CustomerSite {
  id: string;
  customerId: string;
  name: string;
  department: string;
  buildingFloor: string;
  city: string;
  state: string;
  contacts: ContactPerson[];
}

export interface Customer {
  id: string;
  name: string;
  code: string;
  type: 'Multispecialty Hospital' | 'Cardiology Center' | 'Orthopedic Institute' | 'Diagnostic Lab';
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  sites: CustomerSite[];
}

export interface Machine {
  id: string;
  serialNumber: string;
  model: string;
  category: 'Cardiovascular' | 'Orthopedics' | 'Endosurgery' | 'In-Vitro Diagnostics' | 'ENT & Neuro';
  customerId: string;
  customerName: string;
  siteId: string;
  siteName: string;
  installDate: string;
  warrantyType: WarrantyType;
  warrantyExpiryDate: string;
  status: MachineStatus;
  lastServiceDate: string;
  nextServiceDue: string;
  imageUrl: string;
  specifications: Record<string, string>;
}

export interface Engineer {
  id: string;
  name: string;
  code: string;
  email: string;
  phone: string;
  avatar: string;
  designation: string;
  specializations: string[];
  currentCity: string;
  activeJobsCount: number;
  rating: number;
  isAvailable: boolean;
}

export interface SparePart {
  id: string;
  partNumber: string;
  name: string;
  category: string;
  price: number;
  stockQty: number;
  compatibleModels: string[];
}

export interface ReplacedPart {
  partId: string;
  partNumber: string;
  name: string;
  quantity: number;
  serialNumber?: string;
  warrantyCovered: boolean;
  price: number;
}

export interface TimelineEvent {
  id: string;
  status: TicketStatus;
  title: string;
  description: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
}

export interface ServiceTicket {
  id: string;
  ticketNumber: string;
  machineId: string;
  machineModel: string;
  machineSerial: string;
  machineCategory: string;
  customerId: string;
  customerName: string;
  siteId: string;
  siteName: string;
  contactName: string;
  contactPhone: string;
  priority: TicketPriority;
  faultCategory: FaultCategory;
  faultDescription: string;
  photos: string[];
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  assignedEngineerId?: string;
  assignedEngineerName?: string;
  assignedEngineerPhone?: string;
  assignedEngineerAvatar?: string;
  etaMinutes?: number;
  otp: string;
  resolutionNotes?: string;
  replacedParts?: ReplacedPart[];
  closurePhotos?: string[];
  customerSignature?: string;
  customerApprovedBy?: string;
  closedAt?: string;
  timeline: TimelineEvent[];
  isOfflineQueued?: boolean;
  rejectionReason?: string;
  postponeReason?: string;
  postponedUntil?: string;
  passedEngineerIds?: string[];
}

export interface OfflineAction {
  id: string;
  timestamp: string;
  type: 'ACCEPT_JOB' | 'PASS_JOB' | 'REJECT_JOB' | 'POSTPONE_JOB' | 'UPDATE_STATUS' | 'ADD_NOTE' | 'CLOSE_JOB';
  ticketId: string;
  payload: any;
  status: 'PENDING' | 'SYNCED' | 'FAILED';
}

export type ProductItemCategory = 'REAGENT' | 'SPARE_PART' | 'MACHINE_EQUIPMENT';

export type ProductOrderStatus = 
  | 'PENDING_APPROVAL' 
  | 'APPROVED' 
  | 'IN_TRANSIT' 
  | 'AVAILABLE_ON_SITE' 
  | 'DELIVERED' 
  | 'CANCELLED';

export interface ProductOrderItem {
  id: string;
  itemCategory: ProductItemCategory;
  itemName: string;
  itemCode?: string;
  quantity: number;
  unitPrice?: number;
}

export interface ProductOrderRequest {
  id: string;
  orderNumber: string;
  engineerId: string;
  engineerName: string;
  ticketId?: string; // Linked service request ID
  ticketNumber?: string;
  customerName?: string;
  machineModel?: string;
  items: ProductOrderItem[];
  urgency: 'ROUTINE' | 'URGENT' | 'CRITICAL_BREAKDOWN';
  status: ProductOrderStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
  availabilityNotificationSent?: boolean;
}
