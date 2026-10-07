import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import {
  UserRole,
  AuthUser,
  Customer,
  Machine,
  Engineer,
  SparePart,
  ServiceTicket,
  TicketStatus,
  TicketPriority,
  FaultCategory,
  ReplacedPart,
  TimelineEvent,
  OfflineAction,
  ProductOrderRequest,
  ProductOrderItem,
  ProductOrderStatus,
} from '../types';
import {
  getStoredCustomers,
  getStoredMachines,
  getStoredEngineers,
  getStoredParts,
  getStoredTickets,
  getStoredProductOrders,
  getStoredOfflineQueue,
  saveToStorage,
  clearAllStorage,
} from '../utils/storage';
import { INITIAL_CUSTOMERS, INITIAL_MACHINES, INITIAL_ENGINEERS, INITIAL_SPARE_PARTS, INITIAL_TICKETS, INITIAL_PRODUCT_ORDERS } from '../data/initialData';

export type ScreenId =
  | 'login'          // 1. Login (Shared)
  | 'customers'      // 2. Customers (Admin)
  | 'machines'       // 3. Machines (Admin)
  | 'my-machines'    // 4. My Machines (Customer)
  | 'raise-request'  // 5. Raise Request (Customer)
  | 'request-status' // 6. Request Status (Customer)
  | 'request-queue'  // 7. Request Queue (Admin)
  | 'my-jobs'        // 8. My Jobs (Engineer)
  | 'job-detail'     // 9. Job Detail (Engineer)
  | 'close-job'      // 10. Close Job (Engineer)
  | 'product-ordering'; // 11. Product Ordering (Engineer)

interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

interface AppContextType {
  // Navigation & Role
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentScreen: ScreenId;
  setCurrentScreen: (screen: ScreenId) => void;
  isLoading: boolean;

  // Auth & Session
  currentUser: AuthUser | null;
  setCurrentUser: (user: AuthUser | null) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (loggedIn: boolean) => void;
  login: (role: UserRole, email: string, password?: string) => Promise<boolean>;
  signup: (payload: {
    name: string;
    email: string;
    role: UserRole;
    password?: string;
    phone?: string;
    facilityName?: string;
    department?: string;
    employeeId?: string;
    specialization?: string;
    city?: string;
  }) => Promise<boolean>;
  logout: () => void;

  // Selected Entities for Navigation
  selectedTicketId: string | null;
  setSelectedTicketId: (id: string | null) => void;
  selectedMachineForRequest: Machine | null;
  setSelectedMachineForRequest: (machine: Machine | null) => void;

  // Domain Data
  customers: Customer[];
  machines: Machine[];
  engineers: Engineer[];
  spareParts: SparePart[];
  tickets: ServiceTicket[];
  productOrders: ProductOrderRequest[];

  // Offline Engine
  isOffline: boolean;
  toggleOfflineMode: () => void;
  offlineQueue: OfflineAction[];
  syncOfflineQueue: () => void;

  // Notifications
  notifications: Notification[];
  dismissNotification: (id: string) => void;

  // Actions
  addCustomer: (customer: Customer) => void;
  addMachine: (machine: Machine) => void;
  raiseRequest: (payload: {
    machineId: string;
    faultCategory: FaultCategory;
    faultDescription: string;
    priority: TicketPriority;
    photos: string[];
    contactName: string;
    contactPhone: string;
  }) => ServiceTicket;
  assignEngineer: (ticketId: string, engineerId: string, etaMinutes?: number) => void;
  acceptRequest: (ticketId: string, engineerId?: string, notes?: string) => void;
  passRequest: (ticketId: string, engineerId?: string, reason?: string) => void;
  rejectRequest: (ticketId: string, reason: string) => void;
  postponeRequest: (ticketId: string, reason: string, postponedUntil?: string) => void;
  updateTicketStatus: (ticketId: string, newStatus: TicketStatus, notes?: string) => void;
  addTicketNote: (ticketId: string, note: string) => void;
  createProductOrder: (payload: {
    ticketId?: string;
    items: ProductOrderItem[];
    urgency: 'ROUTINE' | 'URGENT' | 'CRITICAL_BREAKDOWN';
    notes?: string;
  }) => ProductOrderRequest;
  updateProductOrderStatus: (orderId: string, newStatus: ProductOrderStatus, trackingNotes?: string) => void;
  closeJob: (
    ticketId: string,
    data: {
      otp: string;
      resolutionNotes: string;
      replacedParts: ReplacedPart[];
      closurePhotos: string[];
      customerSignature: string;
      customerApprovedBy: string;
    }
  ) => boolean;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('customer');
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('login');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>('tkt-101');
  const [selectedMachineForRequest, setSelectedMachineForRequest] = useState<Machine | null>(null);

  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [machines, setMachines] = useState<Machine[]>(INITIAL_MACHINES);
  const [engineers, setEngineers] = useState<Engineer[]>(INITIAL_ENGINEERS);
  const [spareParts, setSpareParts] = useState<SparePart[]>(INITIAL_SPARE_PARTS);
  const [tickets, setTickets] = useState<ServiceTicket[]>(INITIAL_TICKETS);
  const [productOrders, setProductOrders] = useState<ProductOrderRequest[]>(INITIAL_PRODUCT_ORDERS);
  const [offlineQueue, setOfflineQueue] = useState<OfflineAction[]>([]);
  const [isOffline, setIsOffline] = useState<boolean>(false);

  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load from AsyncStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedCustomers = await getStoredCustomers();
        const storedMachines = await getStoredMachines();
        const storedEngineers = await getStoredEngineers();
        const storedParts = await getStoredParts();
        let storedTickets = await getStoredTickets();
        const storedOrders = await getStoredProductOrders();
        const storedQueue = await getStoredOfflineQueue();

        // If stored tickets are outdated or missing demonstration steps, refresh with multi-stage demo set
        if (!storedTickets || storedTickets.length < 5 || !storedTickets.find((t) => t.id === 'tkt-104')) {
          storedTickets = INITIAL_TICKETS;
          saveToStorage('meril_fsm_tickets', INITIAL_TICKETS);
        }

        setCustomers(storedCustomers);
        setMachines(storedMachines);
        setEngineers(storedEngineers);
        setSpareParts(storedParts);
        setTickets(storedTickets);
        setProductOrders(storedOrders);
        setOfflineQueue(storedQueue);
      } catch (e) {
        console.error('Failed to load initial data from storage', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const addNotification = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const id = `notif-${Date.now()}-${Math.random()}`;
    setNotifications((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      dismissNotification(id);
    }, 5000);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Sync to AsyncStorage
  useEffect(() => {
    if (!isLoading) saveToStorage('meril_fsm_customers', customers);
  }, [customers, isLoading]);

  useEffect(() => {
    if (!isLoading) saveToStorage('meril_fsm_machines', machines);
  }, [machines, isLoading]);

  useEffect(() => {
    if (!isLoading) saveToStorage('meril_fsm_engineers', engineers);
  }, [engineers, isLoading]);

  useEffect(() => {
    if (!isLoading) saveToStorage('meril_fsm_parts', spareParts);
  }, [spareParts, isLoading]);

  useEffect(() => {
    if (!isLoading) saveToStorage('meril_fsm_tickets', tickets);
  }, [tickets, isLoading]);

  useEffect(() => {
    if (!isLoading) saveToStorage('meril_fsm_product_orders', productOrders);
  }, [productOrders, isLoading]);

  useEffect(() => {
    if (!isLoading) saveToStorage('meril_fsm_offline_queue', offlineQueue);
  }, [offlineQueue, isLoading]);

  // Offline toggling
  const toggleOfflineMode = () => {
    if (isOffline) {
      // Reconnecting
      setIsOffline(false);
      addNotification('Network reconnected! Synchronizing offline service logs...', 'info');
      syncOfflineQueue();
    } else {
      setIsOffline(true);
      addNotification('Offline mode activated: Actions will be queued locally and synced on reconnect.', 'warning');
    }
  };

  const syncOfflineQueue = () => {
    if (offlineQueue.length === 0) {
      addNotification('Offline queue is clear. All records are up to date.', 'success');
      return;
    }

    setTickets((prevTickets) => {
      let updated = [...prevTickets];
      offlineQueue.forEach((action) => {
        const ticketIdx = updated.findIndex((t) => t.id === action.ticketId);
        if (ticketIdx !== -1) {
          const tkt = { ...updated[ticketIdx] };
          tkt.isOfflineQueued = false;
          tkt.updatedAt = new Date().toISOString();

          if (action.type === 'ACCEPT_JOB') {
            tkt.status = 'ACCEPTED';
            tkt.assignedEngineerId = action.payload.engineerId;
            const acceptedEngineer = engineers.find((engineer) => engineer.id === action.payload.engineerId);
            if (acceptedEngineer) {
              tkt.assignedEngineerName = acceptedEngineer.name;
              tkt.assignedEngineerPhone = acceptedEngineer.phone;
              tkt.assignedEngineerAvatar = acceptedEngineer.avatar;
            }
            tkt.timeline = [
              ...tkt.timeline,
              {
                id: `tl-sync-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                status: 'ACCEPTED',
                title: 'Request Accepted (Synced)',
                description: action.payload.notes || 'Accepted offline by engineer.',
                timestamp: new Date().toISOString(),
                actorName: acceptedEngineer?.name || 'Field Service Engineer',
                actorRole: 'Field Service Engineer',
              },
            ];
          } else if (action.type === 'PASS_JOB') {
            const passedEngineerIds = tkt.passedEngineerIds || [];
            if (!passedEngineerIds.includes(action.payload.engineerId)) {
              passedEngineerIds.push(action.payload.engineerId);
            }
            if (tkt.assignedEngineerId === action.payload.engineerId) {
              tkt.status = 'RAISED';
              tkt.assignedEngineerId = undefined;
              tkt.assignedEngineerName = undefined;
              tkt.assignedEngineerPhone = undefined;
              tkt.assignedEngineerAvatar = undefined;
            }
            tkt.passedEngineerIds = passedEngineerIds;
            tkt.timeline = [...tkt.timeline, {
              id: `tl-sync-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              status: 'PASSED',
              title: 'Engineer Passed Request (Synced)',
              description: `Request passed${action.payload.reason ? `: ${action.payload.reason}` : ''}. It remains available in the open pool.`,
              timestamp: new Date().toISOString(),
              actorName: engineers.find((engineer) => engineer.id === action.payload.engineerId)?.name || 'Field Service Engineer',
              actorRole: 'Field Service Engineer',
            }];
          } else if (action.type === 'REJECT_JOB') {
            tkt.status = 'REJECTED';
            tkt.rejectionReason = action.payload.reason;
            tkt.timeline = [
              ...tkt.timeline,
              {
                id: `tl-sync-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                status: 'REJECTED',
                title: 'Request Rejected (Synced)',
                description: `Reason: ${action.payload.reason}`,
                timestamp: new Date().toISOString(),
                actorName: 'Rajesh Kumar',
                actorRole: 'Field Service Engineer',
              },
            ];
          } else if (action.type === 'POSTPONE_JOB') {
            tkt.status = 'POSTPONED';
            tkt.postponeReason = action.payload.reason;
            tkt.postponedUntil = action.payload.postponedUntil;
            tkt.timeline = [
              ...tkt.timeline,
              {
                id: `tl-sync-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                status: 'POSTPONED',
                title: 'Request Postponed (Synced)',
                description: `Reason: ${action.payload.reason}${action.payload.postponedUntil ? ` (Rescheduled: ${action.payload.postponedUntil})` : ''}`,
                timestamp: new Date().toISOString(),
                actorName: 'Rajesh Kumar',
                actorRole: 'Field Service Engineer',
              },
            ];
          } else if (action.type === 'UPDATE_STATUS') {
            tkt.status = action.payload.status;
            if (action.payload.status === 'EN_ROUTE' && !tkt.assignedEngineerId) {
              const assignedEngineer = engineers.find((engineer) => engineer.id === action.payload.engineerId);
              if (assignedEngineer) {
                tkt.assignedEngineerId = assignedEngineer.id;
                tkt.assignedEngineerName = assignedEngineer.name;
                tkt.assignedEngineerPhone = assignedEngineer.phone;
                tkt.assignedEngineerAvatar = assignedEngineer.avatar;
              }
            }
            tkt.timeline = [
              ...tkt.timeline,
              {
                id: `tl-sync-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                status: action.payload.status,
                title: `Status: ${action.payload.status} (Synced)`,
                description: action.payload.notes || `Updated by engineer (previously cached offline).`,
                timestamp: new Date().toISOString(),
                actorName: 'Rajesh Kumar',
                actorRole: 'Field Service Engineer',
              },
            ];
          } else if (action.type === 'ADD_NOTE') {
            tkt.timeline = [...tkt.timeline, {
              id: `tl-sync-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              status: tkt.status,
              title: 'Engineer Update',
              description: action.payload.note,
              timestamp: new Date().toISOString(),
              actorName: engineers.find((engineer) => engineer.id === action.payload.engineerId)?.name || 'Field Service Engineer',
              actorRole: 'Field Service Engineer',
            }];
          } else if (action.type === 'CLOSE_JOB') {
            tkt.status = 'CLOSED';
            tkt.resolutionNotes = action.payload.resolutionNotes;
            tkt.replacedParts = action.payload.replacedParts;
            tkt.closurePhotos = action.payload.closurePhotos;
            tkt.customerSignature = action.payload.customerSignature;
            tkt.customerApprovedBy = action.payload.customerApprovedBy;
            tkt.closedAt = new Date().toISOString();
            tkt.timeline = [
              ...tkt.timeline,
              {
                id: `tl-sync-${Date.now()}`,
                status: 'CLOSED',
                title: 'Job Closed & OTP Verified (Synced from Offline)',
                description: 'Service completed on-site. Offline report synchronized to central hub.',
                timestamp: new Date().toISOString(),
                actorName: 'Rajesh Kumar & Customer Signoff',
                actorRole: 'Engineer & Customer',
              },
            ];
          }
          updated[ticketIdx] = tkt;
        }
      });
      return updated;
    });

    const syncedCount = offlineQueue.length;
    setOfflineQueue([]);
    addNotification(`Successfully synced ${syncedCount} offline engineer job update(s)!`, 'success');
  };

  const addCustomer = (customer: Customer) => {
    setCustomers((prev) => [customer, ...prev]);
    addNotification(`Hospital "${customer.name}" registered successfully.`, 'success');
  };

  const addMachine = (machine: Machine) => {
    setMachines((prev) => [machine, ...prev]);
    addNotification(`Machine ${machine.model} (${machine.serialNumber}) registered to registry.`, 'success');
  };

  const raiseRequest = (payload: {
    machineId: string;
    faultCategory: FaultCategory;
    faultDescription: string;
    priority: TicketPriority;
    photos: string[];
    contactName: string;
    contactPhone: string;
  }): ServiceTicket => {
    const machine = machines.find((m) => m.id === payload.machineId);
    const customer = customers.find((c) => c.id === machine?.customerId);
    const site = customer?.sites.find((s) => s.id === machine?.siteId);

    const now = new Date().toISOString();
    const newTicketNumber = `SR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();

    const newTicket: ServiceTicket = {
      id: `tkt-${Date.now()}`,
      ticketNumber: newTicketNumber,
      machineId: payload.machineId,
      machineModel: machine?.model || 'Meril Medical Equipment',
      machineSerial: machine?.serialNumber || 'MRL-GEN-000',
      machineCategory: machine?.category || 'Biomedical',
      customerId: customer?.id || 'cust-1',
      customerName: customer?.name || 'Customer Facility',
      siteId: site?.id || 'site-101',
      siteName: site?.name || 'Main OT / Department',
      contactName: payload.contactName,
      contactPhone: payload.contactPhone,
      priority: payload.priority,
      faultCategory: payload.faultCategory,
      faultDescription: payload.faultDescription,
      photos: payload.photos,
      status: 'RAISED',
      createdAt: now,
      updatedAt: now,
      otp: randomOtp,
      timeline: [
        {
          id: `tl-${Date.now()}`,
          status: 'RAISED',
          title: 'Breakdown Ticket Raised',
          description: `Service request logged with priority "${payload.priority}". Awaiting engineer assignment.`,
          timestamp: now,
          actorName: payload.contactName,
          actorRole: 'Customer',
        },
      ],
    };

    setTickets((prev) => [newTicket, ...prev]);

    // If critical/high, update machine status to BREAKDOWN
    if (payload.priority === 'CRITICAL' || payload.priority === 'HIGH') {
      setMachines((prev) =>
        prev.map((m) => (m.id === payload.machineId ? { ...m, status: 'BREAKDOWN' } : m))
      );
    }

    addNotification(`Ticket ${newTicket.ticketNumber} created successfully! Dispatched to Admin Queue.`, 'success');
    setSelectedTicketId(newTicket.id);
    return newTicket;
  };

  const assignEngineer = (ticketId: string, engineerId: string, etaMinutes: number = 45) => {
    const engineer = engineers.find((e) => e.id === engineerId);
    if (!engineer) return;

    const now = new Date().toISOString();

    setTickets((prev) =>
      prev.map((tkt) => {
        if (tkt.id === ticketId) {
          const updatedTimeline: TimelineEvent[] = [
            ...tkt.timeline,
            {
              id: `tl-${Date.now()}`,
              status: 'ASSIGNED',
              title: 'Engineer Assigned',
              description: `${engineer.name} (${engineer.code}) assigned. Proximity ETA: ${etaMinutes} mins.`,
              timestamp: now,
              actorName: 'Admin Dispatcher',
              actorRole: 'Admin',
            },
          ];

          return {
            ...tkt,
            status: 'ASSIGNED',
            assignedEngineerId: engineer.id,
            assignedEngineerName: engineer.name,
            assignedEngineerPhone: engineer.phone,
            assignedEngineerAvatar: engineer.avatar,
            etaMinutes,
            updatedAt: now,
            timeline: updatedTimeline,
          };
        }
        return tkt;
      })
    );

    // Increment engineer active jobs count
    setEngineers((prev) =>
      prev.map((e) => (e.id === engineerId ? { ...e, activeJobsCount: e.activeJobsCount + 1 } : e))
    );

    addNotification(`Assigned ${engineer.name} to ticket. Push alert sent to Engineer App.`, 'success');
  };

  const acceptRequest = (ticketId: string, engineerId?: string, notes?: string) => {
    const now = new Date().toISOString();
    const targetEngineer = engineers.find((e) => e.id === engineerId) || engineers[0];

    if (isOffline) {
      const action: OfflineAction = {
        id: `act-accept-${Date.now()}`,
        timestamp: now,
        type: 'ACCEPT_JOB',
        ticketId,
        payload: { engineerId: targetEngineer.id, notes },
        status: 'PENDING',
      };
      setOfflineQueue((prev) => [...prev, action]);
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId
            ? {
                ...t,
                status: 'ACCEPTED',
                assignedEngineerId: targetEngineer.id,
                assignedEngineerName: targetEngineer.name,
                assignedEngineerPhone: targetEngineer.phone,
                assignedEngineerAvatar: targetEngineer.avatar,
                isOfflineQueued: true,
              }
            : t
        )
      );
      addNotification('[Offline] Request accepted locally. Queued for sync when online.', 'warning');
      return;
    }

    setTickets((prev) =>
      prev.map((tkt) => {
        if (tkt.id === ticketId) {
          const newEvent: TimelineEvent = {
            id: `tl-${Date.now()}`,
            status: 'ACCEPTED',
            title: 'Request Accepted by Engineer',
            description: notes || `${targetEngineer.name} accepted service call from open request pool.`,
            timestamp: now,
            actorName: targetEngineer.name,
            actorRole: 'Field Service Engineer',
          };

          return {
            ...tkt,
            status: 'ACCEPTED',
            assignedEngineerId: targetEngineer.id,
            assignedEngineerName: targetEngineer.name,
            assignedEngineerPhone: targetEngineer.phone,
            assignedEngineerAvatar: targetEngineer.avatar,
            updatedAt: now,
            timeline: [...tkt.timeline, newEvent],
          };
        }
        return tkt;
      })
    );

    // Increment engineer active jobs count
    setEngineers((prev) =>
      prev.map((e) => (e.id === targetEngineer.id ? { ...e, activeJobsCount: e.activeJobsCount + 1 } : e))
    );

    addNotification(`Service request ACCEPTED by ${targetEngineer.name}! Claimed from open pool.`, 'success');
  };

  const passRequest = (ticketId: string, engineerId?: string, reason?: string) => {
    const now = new Date().toISOString();
    const targetEngineer = engineers.find((e) => e.id === engineerId) || engineers[0];

    if (isOffline) {
      const action: OfflineAction = {
        id: `act-pass-${Date.now()}`,
        timestamp: now,
        type: 'PASS_JOB',
        ticketId,
        payload: { engineerId: targetEngineer.id, reason },
        status: 'PENDING',
      };
      setOfflineQueue((prev) => [...prev, action]);
      setTickets((prev) =>
        prev.map((t) => {
          if (t.id === ticketId) {
            const passed = t.passedEngineerIds || [];
            return {
              ...t,
              passedEngineerIds: passed.includes(targetEngineer.id) ? passed : [...passed, targetEngineer.id],
              isOfflineQueued: true,
            };
          }
          return t;
        })
      );
      addNotification('[Offline] Request pass logged locally.', 'warning');
      return;
    }

    setTickets((prev) =>
      prev.map((tkt) => {
        if (tkt.id === ticketId) {
          const passed = tkt.passedEngineerIds || [];
          const newPassed = passed.includes(targetEngineer.id) ? passed : [...passed, targetEngineer.id];

          const passEvent: TimelineEvent = {
            id: `tl-${Date.now()}`,
            status: 'PASSED',
            title: 'Engineer Passed Request',
            description: `${targetEngineer.name} passed on taking this request${reason ? `: "${reason}"` : ''}. Remains in open pool.`,
            timestamp: now,
            actorName: targetEngineer.name,
            actorRole: 'Field Service Engineer',
          };

          // If it was assigned to this engineer, unassign it so it stays open in the pool
          const wasAssignedToMe = tkt.assignedEngineerId === targetEngineer.id;

          return {
            ...tkt,
            status: wasAssignedToMe ? 'RAISED' : tkt.status,
            assignedEngineerId: wasAssignedToMe ? undefined : tkt.assignedEngineerId,
            assignedEngineerName: wasAssignedToMe ? undefined : tkt.assignedEngineerName,
            assignedEngineerPhone: wasAssignedToMe ? undefined : tkt.assignedEngineerPhone,
            assignedEngineerAvatar: wasAssignedToMe ? undefined : tkt.assignedEngineerAvatar,
            passedEngineerIds: newPassed,
            updatedAt: now,
            timeline: [...tkt.timeline, passEvent],
          };
        }
        return tkt;
      })
    );

    addNotification(`Request passed by ${targetEngineer.name}. Open for other engineers or Admin dispatch.`, 'info');
  };

  const rejectRequest = (ticketId: string, reason: string) => {
    const now = new Date().toISOString();

    if (isOffline) {
      const action: OfflineAction = {
        id: `act-reject-${Date.now()}`,
        timestamp: now,
        type: 'REJECT_JOB',
        ticketId,
        payload: { reason },
        status: 'PENDING',
      };
      setOfflineQueue((prev) => [...prev, action]);
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId ? { ...t, status: 'REJECTED', rejectionReason: reason, isOfflineQueued: true } : t
        )
      );
      addNotification('[Offline] Request rejection queued locally.', 'warning');
      return;
    }

    setTickets((prev) =>
      prev.map((tkt) => {
        if (tkt.id === ticketId) {
          const newEvent: TimelineEvent = {
            id: `tl-${Date.now()}`,
            status: 'REJECTED',
            title: 'Request Rejected',
            description: `Rejection reason: ${reason}`,
            timestamp: now,
            actorName: tkt.assignedEngineerName || 'Field Service Engineer',
            actorRole: 'Field Service Engineer',
          };

          if (tkt.assignedEngineerId) {
            setEngineers((engs) =>
              engs.map((e) =>
                e.id === tkt.assignedEngineerId ? { ...e, activeJobsCount: Math.max(0, e.activeJobsCount - 1) } : e
              )
            );
          }

          return {
            ...tkt,
            status: 'REJECTED',
            rejectionReason: reason,
            updatedAt: now,
            timeline: [...tkt.timeline, newEvent],
          };
        }
        return tkt;
      })
    );
    addNotification(`Request REJECTED ("${reason}"). Alert sent to Dispatcher.`, 'warning');
  };

  const postponeRequest = (ticketId: string, reason: string, postponedUntil?: string) => {
    const now = new Date().toISOString();

    if (isOffline) {
      const action: OfflineAction = {
        id: `act-postpone-${Date.now()}`,
        timestamp: now,
        type: 'POSTPONE_JOB',
        ticketId,
        payload: { reason, postponedUntil },
        status: 'PENDING',
      };
      setOfflineQueue((prev) => [...prev, action]);
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId
            ? {
                ...t,
                status: 'POSTPONED',
                postponeReason: reason,
                postponedUntil,
                isOfflineQueued: true,
              }
            : t
        )
      );
      addNotification('[Offline] Request postponement queued.', 'warning');
      return;
    }

    setTickets((prev) =>
      prev.map((tkt) => {
        if (tkt.id === ticketId) {
          const newEvent: TimelineEvent = {
            id: `tl-${Date.now()}`,
            status: 'POSTPONED',
            title: 'Request Postponed',
            description: `Reason: ${reason}${postponedUntil ? ` (Rescheduled: ${postponedUntil})` : ''}`,
            timestamp: now,
            actorName: tkt.assignedEngineerName || 'Field Service Engineer',
            actorRole: 'Field Service Engineer',
          };
          return {
            ...tkt,
            status: 'POSTPONED',
            postponeReason: reason,
            postponedUntil,
            updatedAt: now,
            timeline: [...tkt.timeline, newEvent],
          };
        }
        return tkt;
      })
    );
    addNotification('Service request POSTPONED. Audit timeline updated.', 'info');
  };

  const updateTicketStatus = (ticketId: string, newStatus: TicketStatus, notes?: string) => {
    const now = new Date().toISOString();
    const ticket = tickets.find((item) => item.id === ticketId);
    if (!ticket) return;

    const normalizedStatus = ticket.status === 'ASSIGNED' ? 'ACCEPTED' : ticket.status;
    const nextStatus: Partial<Record<TicketStatus, TicketStatus>> = {
      RAISED: 'ACCEPTED',
      ASSIGNED: 'EN_ROUTE',
      ACCEPTED: 'EN_ROUTE',
      EN_ROUTE: 'IN_PROGRESS',
      IN_PROGRESS: 'RESOLVED',
    };
    const directDispatchToEnRoute = ticket.status === 'RAISED' && newStatus === 'EN_ROUTE';
    if (newStatus !== nextStatus[normalizedStatus] && !directDispatchToEnRoute) {
      addNotification(`Cannot move a ${ticket.status} job to ${newStatus}. Follow the job steps in order.`, 'warning');
      return;
    }

    if (isOffline) {
      // Offline mode: Queue action and update ticket locally with offline badge
      const action: OfflineAction = {
        id: `act-${Date.now()}`,
        timestamp: now,
        type: 'UPDATE_STATUS',
        ticketId,
        payload: { status: newStatus, notes, engineerId: engineers[0]?.id },
        status: 'PENDING',
      };

      setOfflineQueue((prev) => [...prev, action]);
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? {
          ...t,
          status: newStatus,
          ...(directDispatchToEnRoute ? {
            assignedEngineerId: engineers[0]?.id,
            assignedEngineerName: engineers[0]?.name,
            assignedEngineerPhone: engineers[0]?.phone,
            assignedEngineerAvatar: engineers[0]?.avatar,
          } : {}),
          isOfflineQueued: true,
        } : t))
      );

      addNotification(`[Offline] Status updated to "${newStatus}". Queued for sync when online.`, 'warning');
      return;
    }

    // Online mode
    setTickets((prev) =>
      prev.map((tkt) => {
        if (tkt.id === ticketId) {
          let title = `Status updated to ${newStatus}`;
          let desc = notes || `Status updated by Field Engineer.`;

          if (newStatus === 'ACCEPTED') {
            title = 'Service Call Accepted';
            desc = notes || 'Engineer accepted the service request and confirmed dispatch.';
          } else if (newStatus === 'EN_ROUTE') {
            title = 'Engineer En Route';
            desc = notes || 'Engineer has departed and is traveling to customer site.';
          } else if (newStatus === 'IN_PROGRESS') {
            title = 'Work In Progress On-Site';
            desc = notes || 'Engineer arrived on site and commenced diagnostic/repair procedures.';
          } else if (newStatus === 'RESOLVED') {
            title = 'Work Completed — Awaiting Sign-off';
            desc = notes || 'Engineer completed on-site repairs. Customer OTP handover requested for signoff.';
          } else if (newStatus === 'POSTPONED') {
            title = 'Service Call Postponed';
            desc = notes || 'Service call postponed by engineer.';
          }

          const newTimelineEvent: TimelineEvent = {
            id: `tl-${Date.now()}`,
            status: newStatus,
            title,
            description: desc,
            timestamp: now,
            actorName: tkt.assignedEngineerName || 'Field Service Engineer',
            actorRole: 'Field Service Engineer',
          };

          return {
            ...tkt,
            status: newStatus,
            ...(directDispatchToEnRoute ? {
              assignedEngineerId: engineers[0]?.id,
              assignedEngineerName: engineers[0]?.name,
              assignedEngineerPhone: engineers[0]?.phone,
              assignedEngineerAvatar: engineers[0]?.avatar,
            } : {}),
            updatedAt: now,
            timeline: [...tkt.timeline, newTimelineEvent],
          };
        }
        return tkt;
      })
    );

    if (directDispatchToEnRoute && engineers[0]) {
      setEngineers((prev) => prev.map((engineer) => engineer.id === engineers[0].id
        ? { ...engineer, activeJobsCount: engineer.activeJobsCount + 1 }
        : engineer));
    }

    addNotification(`Ticket status updated to ${newStatus}. The customer timeline is updated in this app.`, 'success');
  };

  const addTicketNote = (ticketId: string, note: string) => {
    const trimmedNote = note.trim();
    if (!trimmedNote) return;
    const now = new Date().toISOString();
    const engineer = engineers[0];

    if (isOffline) {
      const action: OfflineAction = {
        id: `act-note-${Date.now()}`,
        timestamp: now,
        type: 'ADD_NOTE',
        ticketId,
        payload: { note: trimmedNote, engineerId: engineer?.id },
        status: 'PENDING',
      };
      setOfflineQueue((prev) => [...prev, action]);
      setTickets((prev) => prev.map((ticket) => ticket.id === ticketId
        ? { ...ticket, isOfflineQueued: true }
        : ticket));
      addNotification('[Offline] Customer update queued for sync when online.', 'warning');
      return;
    }

    setTickets((prev) => prev.map((ticket) => ticket.id === ticketId
      ? {
          ...ticket,
          updatedAt: now,
          timeline: [...ticket.timeline, {
            id: `tl-note-${Date.now()}`,
            status: ticket.status,
            title: 'Engineer Update',
            description: trimmedNote,
            timestamp: now,
            actorName: engineer?.name || 'Field Service Engineer',
            actorRole: 'Field Service Engineer',
          }],
        }
      : ticket));
    addNotification('Customer update added to the service timeline.', 'success');
  };

  const createProductOrder = (payload: {
    ticketId?: string;
    items: ProductOrderItem[];
    urgency: 'ROUTINE' | 'URGENT' | 'CRITICAL_BREAKDOWN';
    notes?: string;
  }): ProductOrderRequest => {
    const currentEngineer = engineers[0];
    const targetTicket = tickets.find((t) => t.id === payload.ticketId);

    const now = new Date().toISOString();
    const orderNumber = `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: ProductOrderRequest = {
      id: `ord-${Date.now()}`,
      orderNumber,
      engineerId: currentEngineer.id,
      engineerName: currentEngineer.name,
      ticketId: payload.ticketId,
      ticketNumber: targetTicket?.ticketNumber,
      customerName: targetTicket?.customerName,
      machineModel: targetTicket?.machineModel,
      items: payload.items,
      urgency: payload.urgency,
      status: 'PENDING_APPROVAL',
      notes: payload.notes,
      createdAt: now,
      updatedAt: now,
      estimatedDelivery: payload.urgency === 'CRITICAL_BREAKDOWN' ? 'Within 4 Hours' : 'Tomorrow morning',
      availabilityNotificationSent: false,
    };

    setProductOrders((prev) => [newOrder, ...prev]);

    // If linked to a ticket, add a timeline event to that ticket
    if (payload.ticketId && targetTicket) {
      const itemNames = payload.items.map((i) => i.itemName).join(', ');
      setTickets((prev) =>
        prev.map((t) => {
          if (t.id === payload.ticketId) {
            const orderEvent: TimelineEvent = {
              id: `tl-ord-${Date.now()}`,
              status: t.status,
              title: `Product Order Requested (${orderNumber})`,
              description: `Engineer requested: ${itemNames} (${payload.urgency}). Linked to this service request.`,
              timestamp: now,
              actorName: currentEngineer.name,
              actorRole: 'Field Service Engineer',
            };
            return { ...t, timeline: [...t.timeline, orderEvent], updatedAt: now };
          }
          return t;
        })
      );
    }

    addNotification(
      `Product Order ${orderNumber} submitted! ${payload.ticketId ? `Linked to Service Request ${targetTicket?.ticketNumber}.` : ''}`,
      'success'
    );

    return newOrder;
  };

  const updateProductOrderStatus = (orderId: string, newStatus: ProductOrderStatus, trackingNotes?: string) => {
    const now = new Date().toISOString();

    setProductOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const isAvailable = newStatus === 'AVAILABLE_ON_SITE' || newStatus === 'DELIVERED';
          const shouldNotify = isAvailable && !ord.availabilityNotificationSent;

          if (shouldNotify) {
            const ticketText = ord.ticketNumber ? `for Service Call ${ord.ticketNumber} (${ord.customerName})` : '';
            const itemText = ord.items.map((i: ProductOrderItem) => i.itemName).join(', ');

            addNotification(
              `🔔 PARTS/REAGENTS AVAILABLE! ${itemText} ${ticketText} is now ${newStatus === 'AVAILABLE_ON_SITE' ? 'Available On-Site!' : 'Delivered!'}`,
              'success'
            );

            // Append live event to linked ticket timeline
            if (ord.ticketId) {
              setTickets((prevTkts) =>
                prevTkts.map((t) => {
                  if (t.id === ord.ticketId) {
                    const notifyEvent: TimelineEvent = {
                      id: `tl-partavail-${Date.now()}`,
                      status: t.status,
                      title: '🔔 Parts & Reagents Available On-Site',
                      description: `Requested items (${itemText}) are now available on-site for service execution.`,
                      timestamp: now,
                      actorName: 'Inventory & Dispatch',
                      actorRole: 'System Notification',
                    };
                    return { ...t, timeline: [...t.timeline, notifyEvent], updatedAt: now };
                  }
                  return t;
                })
              );
            }
          }

          return {
            ...ord,
            status: newStatus,
            notes: trackingNotes ? `${ord.notes || ''}\n[Update: ${trackingNotes}]` : ord.notes,
            updatedAt: now,
            availabilityNotificationSent: isAvailable ? true : ord.availabilityNotificationSent,
          };
        }
        return ord;
      })
    );
  };

  const closeJob = (
    ticketId: string,
    data: {
      otp: string;
      resolutionNotes: string;
      replacedParts: ReplacedPart[];
      closurePhotos: string[];
      customerSignature: string;
      customerApprovedBy: string;
    }
  ): boolean => {
    const tkt = tickets.find((t) => t.id === ticketId);
    if (!tkt) return false;

    // Verify OTP
    if (data.otp.trim() !== tkt.otp.trim()) {
      addNotification('Invalid OTP! Please obtain the 4-digit verification code from customer on-site.', 'error');
      return false;
    }

    const now = new Date().toISOString();

    if (isOffline) {
      // Offline closure
      const action: OfflineAction = {
        id: `act-close-${Date.now()}`,
        timestamp: now,
        type: 'CLOSE_JOB',
        ticketId,
        payload: data,
        status: 'PENDING',
      };
      setOfflineQueue((prev) => [...prev, action]);
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status: 'CLOSED', isOfflineQueued: true } : t))
      );
      addNotification('[Offline] Job closed locally with OTP verification. Will sync report when back online.', 'warning');
      return true;
    }

    // Online closure
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const closureEvent: TimelineEvent = {
            id: `tl-close-${Date.now()}`,
            status: 'CLOSED',
            title: 'Job Completed & OTP Verified',
            description: `Repair completed and validated on-site. Field Service Report signed by ${data.customerApprovedBy}.`,
            timestamp: now,
            actorName: `${t.assignedEngineerName || 'Engineer'} & ${data.customerApprovedBy}`,
            actorRole: 'Joint Sign-off',
          };

          return {
            ...t,
            status: 'CLOSED',
            resolutionNotes: data.resolutionNotes,
            replacedParts: data.replacedParts,
            closurePhotos: data.closurePhotos,
            customerSignature: data.customerSignature,
            customerApprovedBy: data.customerApprovedBy,
            closedAt: now,
            updatedAt: now,
            timeline: [...t.timeline, closureEvent],
          };
        }
        return t;
      })
    );

    // Restore machine status to OPERATIONAL and update service date
    setMachines((prev) =>
      prev.map((m) =>
        m.id === tkt.machineId
          ? {
              ...m,
              status: 'OPERATIONAL',
              lastServiceDate: now.split('T')[0],
            }
          : m
      )
    );

    // Reduce engineer active job count
    if (tkt.assignedEngineerId) {
      setEngineers((prev) =>
        prev.map((e) =>
          e.id === tkt.assignedEngineerId ? { ...e, activeJobsCount: Math.max(0, e.activeJobsCount - 1) } : e
        )
      );
    }

    addNotification(`Ticket ${tkt.ticketNumber} successfully CLOSED! Field Service Report generated.`, 'success');
    return true;
  };

  const login = async (role: UserRole, email: string, _password?: string): Promise<boolean> => {
    let user: AuthUser;
    if (role === 'admin') {
      user = {
        id: 'usr-admin-1',
        name: 'Admin Dispatcher',
        email: email || 'dispatch.central@merillife.com',
        role: 'admin',
        employeeId: 'MRL-ADM-001',
        department: 'Central Dispatch Operations',
      };
      setCurrentRole('admin');
      setCurrentScreen('request-queue');
    } else if (role === 'engineer') {
      const matchedEng = engineers.find((e) => e.email.toLowerCase() === email.toLowerCase()) || engineers[0];
      user = {
        id: matchedEng?.id || 'usr-eng-1',
        name: matchedEng?.name || 'Rajesh Kumar',
        email: email || matchedEng?.email || 'rajesh.kumar@merillife.com',
        role: 'engineer',
        specialization: matchedEng?.specializations?.join(', ') || 'Cardiovascular & Consoles',
        phone: matchedEng?.phone || '+91 98200 11223',
        city: matchedEng?.currentCity || 'Mumbai',
      };
      setCurrentRole('engineer');
      setCurrentScreen('my-jobs');
    } else {
      const matchedCust = customers.find((c) => c.email.toLowerCase() === email.toLowerCase()) || customers[0];
      user = {
        id: matchedCust?.id || 'usr-cust-1',
        name: matchedCust?.sites?.[0]?.contacts?.[0]?.name || 'Dr. Priya Sharma',
        email: email || 'biomedical.apollo@apollohospitals.com',
        role: 'customer',
        facilityName: matchedCust?.name || 'Apollo Multispecialty Hospital',
        phone: matchedCust?.phone || '+91 98000 00000',
        department: matchedCust?.sites?.[0]?.department || 'Cardiology CathLab',
      };
      setCurrentRole('customer');
      setCurrentScreen('my-machines');
    }

    setCurrentUser(user);
    setIsLoggedIn(true);
    addNotification(`Welcome, ${user.name}!`, 'success');
    return true;
  };

  const signup = async (payload: {
    name: string;
    email: string;
    role: UserRole;
    password?: string;
    phone?: string;
    facilityName?: string;
    department?: string;
    employeeId?: string;
    specialization?: string;
    city?: string;
  }): Promise<boolean> => {
    const userId = `usr-${Date.now()}`;
    const user: AuthUser = {
      id: userId,
      name: payload.name,
      email: payload.email,
      role: payload.role,
      phone: payload.phone,
      facilityName: payload.facilityName,
      department: payload.department,
      employeeId: payload.employeeId,
      specialization: payload.specialization,
      city: payload.city,
    };

    if (payload.role === 'customer') {
      const newCustId = `cust-${Date.now()}`;
      const newCustomer: Customer = {
        id: newCustId,
        name: payload.facilityName || `${payload.name}'s Hospital`,
        code: `CUST-${Math.floor(100 + Math.random() * 900)}`,
        type: 'Multispecialty Hospital',
        address: `${payload.city || 'Central'} Health Campus`,
        city: payload.city || 'Metro City',
        state: 'State',
        pincode: '400001',
        phone: payload.phone || '+91 98000 00000',
        email: payload.email,
        sites: [
          {
            id: `site-${Date.now()}`,
            customerId: newCustId,
            name: `${payload.facilityName || payload.name} Main Site`,
            department: payload.department || 'Biomedical Department',
            buildingFloor: 'Building A, Floor 1',
            city: payload.city || 'Metro City',
            state: 'State',
            contacts: [
              {
                id: `cnt-${Date.now()}`,
                name: payload.name,
                role: 'Biomedical Engineer',
                email: payload.email,
                phone: payload.phone || '+91 98000 00000',
                isPrimary: true,
              },
            ],
          },
        ],
      };
      setCustomers((prev) => [newCustomer, ...prev]);
      setCurrentRole('customer');
      setCurrentScreen('my-machines');
    } else if (payload.role === 'engineer') {
      const newEngId = `eng-${Date.now()}`;
      const newEngineer: Engineer = {
        id: newEngId,
        name: payload.name,
        code: `ENG-${Math.floor(10 + Math.random() * 90)}`,
        email: payload.email,
        phone: payload.phone || '+91 98111 22334',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        designation: 'Senior Field Specialist',
        specializations: payload.specialization ? [payload.specialization] : ['Cardiovascular'],
        currentCity: payload.city || 'Mumbai',
        activeJobsCount: 0,
        rating: 5.0,
        isAvailable: true,
      };
      setEngineers((prev) => [newEngineer, ...prev]);
      setCurrentRole('engineer');
      setCurrentScreen('my-jobs');
    } else {
      setCurrentRole('admin');
      setCurrentScreen('request-queue');
    }

    setCurrentUser(user);
    setIsLoggedIn(true);
    addNotification(`Account created! Welcome, ${payload.name}.`, 'success');
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    setCurrentScreen('login');
    addNotification('Logged out successfully.', 'info');
  };

  const resetAllData = async () => {
    await clearAllStorage();
    setCustomers(INITIAL_CUSTOMERS);
    setMachines(INITIAL_MACHINES);
    setEngineers(INITIAL_ENGINEERS);
    setSpareParts(INITIAL_SPARE_PARTS);
    setTickets(INITIAL_TICKETS);
    setOfflineQueue([]);
    setIsOffline(false);
    setSelectedTicketId('tkt-101');
    setSelectedMachineForRequest(null);
    setCurrentUser(null);
    setIsLoggedIn(false);
    setCurrentScreen('login');
    addNotification('Application state reset to default demo dataset.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        currentScreen,
        setCurrentScreen,
        isLoading,
        currentUser,
        setCurrentUser,
        isLoggedIn,
        setIsLoggedIn,
        login,
        signup,
        logout,
        selectedTicketId,
        setSelectedTicketId,
        selectedMachineForRequest,
        setSelectedMachineForRequest,
        customers,
        machines,
        engineers,
        spareParts,
        tickets,
        productOrders,
        isOffline,
        toggleOfflineMode,
        offlineQueue,
        syncOfflineQueue,
        notifications,
        dismissNotification,
        addCustomer,
        addMachine,
        raiseRequest,
        assignEngineer,
        acceptRequest,
        passRequest,
        rejectRequest,
        postponeRequest,
        updateTicketStatus,
        addTicketNote,
        createProductOrder,
        updateProductOrderStatus,
        closeJob,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
