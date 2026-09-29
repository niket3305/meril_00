import AsyncStorage from '@react-native-async-storage/async-storage';
import { Customer, Machine, Engineer, SparePart, ServiceTicket, OfflineAction, ProductOrderRequest } from '../types';
import { INITIAL_CUSTOMERS, INITIAL_MACHINES, INITIAL_ENGINEERS, INITIAL_SPARE_PARTS, INITIAL_TICKETS, INITIAL_PRODUCT_ORDERS } from '../data/initialData';

const STORAGE_KEYS = {
  CUSTOMERS: 'meril_fsm_customers',
  MACHINES: 'meril_fsm_machines',
  ENGINEERS: 'meril_fsm_engineers',
  PARTS: 'meril_fsm_parts',
  TICKETS: 'meril_fsm_tickets',
  PRODUCT_ORDERS: 'meril_fsm_product_orders',
  OFFLINE_QUEUE: 'meril_fsm_offline_queue',
  SIMULATE_OFFLINE: 'meril_fsm_simulate_offline',
};

export const loadFromStorage = async <T>(key: string, fallback: T): Promise<T> => {
  try {
    const item = await AsyncStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.warn(`Error reading ${key} from AsyncStorage:`, error);
    return fallback;
  }
};

export const saveToStorage = async <T>(key: string, value: T): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Error writing ${key} to AsyncStorage:`, error);
  }
};

export const getStoredCustomers = (): Promise<Customer[]> =>
  loadFromStorage(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);

export const getStoredMachines = (): Promise<Machine[]> =>
  loadFromStorage(STORAGE_KEYS.MACHINES, INITIAL_MACHINES);

export const getStoredEngineers = (): Promise<Engineer[]> =>
  loadFromStorage(STORAGE_KEYS.ENGINEERS, INITIAL_ENGINEERS);

export const getStoredParts = (): Promise<SparePart[]> =>
  loadFromStorage(STORAGE_KEYS.PARTS, INITIAL_SPARE_PARTS);

export const getStoredTickets = (): Promise<ServiceTicket[]> =>
  loadFromStorage(STORAGE_KEYS.TICKETS, INITIAL_TICKETS);

export const getStoredProductOrders = (): Promise<ProductOrderRequest[]> =>
  loadFromStorage(STORAGE_KEYS.PRODUCT_ORDERS, INITIAL_PRODUCT_ORDERS);

export const getStoredOfflineQueue = (): Promise<OfflineAction[]> =>
  loadFromStorage(STORAGE_KEYS.OFFLINE_QUEUE, []);

export const clearAllStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
  } catch (e) {
    console.error('Failed to clear storage', e);
  }
};
