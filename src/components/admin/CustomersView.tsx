import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Linking } from 'react-native';
import { CustomSelect } from '../common/CustomSelect';
import { useApp } from '../../context/AppContext';
import { Customer, CustomerSite, ContactPerson } from '../../types';
import { Modal } from '../common/Modal';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Plus,
  Search,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react-native';

export const CustomersView: React.FC = () => {
  const { customers, addCustomer, machines, setCurrentScreen } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<Customer['type']>('Multispecialty Hospital');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [siteName, setSiteName] = useState('');
  const [department, setDepartment] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.sites.some((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddCustomerSubmit = () => {
    if (!name.trim() || !city.trim()) return;

    const newCustomerId = `cust-${Date.now()}`;
    const newSiteId = `site-${Date.now()}`;
    const newContactId = `cp-${Date.now()}`;

    const newContact: ContactPerson = {
      id: newContactId,
      name: contactName || 'Authorized Biomedical Representative',
      role: 'Biomedical Engineer',
      email: email || 'biomedical@hospital.org',
      phone: contactPhone || phone,
      isPrimary: true,
    };

    const newSite: CustomerSite = {
      id: newSiteId,
      customerId: newCustomerId,
      name: siteName || `${name} Main Facility`,
      department: department || 'General OT / CathLab',
      buildingFloor: 'Floor 1, Block A',
      city,
      state: state || 'State',
      contacts: [newContact],
    };

    const newCust: Customer = {
      id: newCustomerId,
      name,
      code: code || `CUST-${Math.floor(100 + Math.random() * 900)}`,
      type,
      address: address || `${city} Medical Campus`,
      city,
      state: state || 'State',
      pincode: '400001',
      phone: phone || '+91 98000 00000',
      email: email || 'hospital@health.org',
      sites: [newSite],
    };

    addCustomer(newCust);
    setIsAddModalOpen(false);

    // Reset Form
    setName('');
    setCode('');
    setAddress('');
    setCity('');
    setPhone('');
    setEmail('');
    setSiteName('');
    setDepartment('');
    setContactName('');
  };

  return (
    <ScrollView className="flex-1 bg-slate-50 p-4 space-y-6" keyboardShouldPersistTaps="handled">
      {/* Top Banner - Topic Only */}
      <View className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex-row items-center justify-between">
        <Text className="text-xl font-black text-slate-900 tracking-tight">
          Customer Directory & Hospital Sites
        </Text>

        <Pressable
          onPress={() => setIsAddModalOpen(true)}
          className="flex-row items-center gap-1.5 px-3.5 py-2 bg-blue-700 rounded-xl"
        >
          <Plus size={16} color="#ffffff" />
          <Text className="text-white text-xs font-bold">Add Customer</Text>
        </Pressable>
      </View>

      {/* Filter & Search Bar */}
      <View className="space-y-2">
        <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 shadow-xs">
          <Search size={16} color="#94a3b8" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search hospitals, city, code, or department..."
            className="flex-1 ml-2 text-xs font-medium text-slate-900 py-1"
          />
        </View>
        <Text className="text-xs font-medium text-slate-500">
          Showing <Text className="font-bold text-slate-800">{filteredCustomers.length}</Text> healthcare accounts
        </Text>
      </View>

      {/* Customers & Sites List */}
      <View className="space-y-4 pb-8">
        {filteredCustomers.map((customer) => {
          const customerMachines = machines.filter((m) => m.customerId === customer.id);

          return (
            <View
              key={customer.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
            >
              {/* Header */}
              <View className="p-4 border-b border-slate-100 bg-slate-50 space-y-2">
                <View className="flex-row items-start gap-3">
                  <View className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 items-center justify-center">
                    <Building2 size={20} color="#1d4ed8" />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2 flex-wrap">
                      <Text className="text-base font-bold text-slate-900">{customer.name}</Text>
                      <View className="px-2 py-0.5 rounded bg-slate-200">
                        <Text className="text-xs font-semibold text-slate-700">{customer.code}</Text>
                      </View>
                    </View>
                    <Text className="text-xs font-semibold text-blue-700 mt-0.5">{customer.type}</Text>
                  </View>
                </View>

                <View className="space-y-1 pt-1">
                  <View className="flex-row items-center gap-1">
                    <MapPin size={14} color="#94a3b8" />
                    <Text className="text-xs text-slate-500 flex-1">
                      {customer.address}, {customer.city}, {customer.state}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <Phone size={14} color="#94a3b8" />
                    <Text className="text-xs text-slate-500">{customer.phone}</Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <Mail size={14} color="#94a3b8" />
                    <Text className="text-xs text-slate-500">{customer.email}</Text>
                  </View>
                </View>

                <View className="mt-2 pt-2 border-t border-slate-200 flex-row items-center justify-between">
                  <Text className="text-[10px] text-slate-400 font-bold uppercase">Installed Fleet</Text>
                  <Text className="text-xs font-black text-blue-700">{customerMachines.length} Units</Text>
                </View>
              </View>

              {/* Sites & Contacts Sub-List */}
              <View className="p-4 space-y-3">
                <View className="flex-row items-center gap-1.5">
                  <ShieldCheck size={16} color="#2563eb" />
                  <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Clinical Sites ({customer.sites.length})
                  </Text>
                </View>

                <View className="space-y-3">
                  {customer.sites.map((site) => {
                    const siteMachines = customerMachines.filter((m) => m.siteId === site.id);

                    return (
                      <View
                        key={site.id}
                        className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
                      >
                        <View className="flex-row items-start justify-between">
                          <View className="flex-1 pr-2">
                            <Text className="text-xs font-bold text-slate-900">{site.name}</Text>
                            <Text className="text-[11px] text-blue-700 font-semibold mt-0.5">
                              {site.department} • {site.buildingFloor}
                            </Text>
                          </View>
                          <View className="px-2 py-0.5 rounded bg-white border border-slate-200">
                            <Text className="text-[10px] font-bold text-slate-700">
                              {siteMachines.length} Devices
                            </Text>
                          </View>
                        </View>

                        {/* Contacts */}
                        <View className="space-y-1.5 pt-2 border-t border-slate-200">
                          <Text className="text-[10px] font-bold text-slate-400 uppercase">
                            On-Site Authorizations
                          </Text>
                          {site.contacts.map((contact) => (
                            <View
                              key={contact.id}
                              className="flex-row items-center justify-between bg-white p-2 rounded-lg border border-slate-200"
                            >
                              <View className="flex-row items-center gap-2 flex-1">
                                <View className="w-6 h-6 rounded-full bg-emerald-100 items-center justify-center">
                                  <Text className="font-bold text-[10px] text-emerald-800">
                                    {contact.name.charAt(0)}
                                  </Text>
                                </View>
                                <View className="flex-1">
                                  <Text className="text-xs font-bold text-slate-800">{contact.name}</Text>
                                  <Text className="text-[10px] text-slate-400">{contact.role}</Text>
                                </View>
                              </View>
                              <Pressable
                                onPress={() => Linking.openURL(`tel:${contact.phone}`)}
                              >
                                <Text className="text-blue-600 font-semibold text-[11px]">
                                  {contact.phone}
                                </Text>
                              </Pressable>
                            </View>
                          ))}
                        </View>

                        <Pressable
                          onPress={() => setCurrentScreen('machines')}
                          className="flex-row items-center justify-between pt-1"
                        >
                          <Text className="text-xs font-bold text-blue-600">
                            Inspect Site Equipment ({siteMachines.length})
                          </Text>
                          <ChevronRight size={14} color="#2563eb" />
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>
          );
        })}
      </View>

      {/* Add Customer Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Customer Facility & Site"
        subtitle="Add a new hospital account, operational site, and contact"
      >
        <View className="space-y-4">
          <View>
            <Text className="text-xs font-bold text-slate-700 mb-1">Hospital Name *</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Manipal Hospital"
              className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
            />
          </View>

            <CustomSelect
              label="Facility Type"
              options={[
                { label: 'Multispecialty Hospital', value: 'Multispecialty Hospital' },
                { label: 'Cardiology Center', value: 'Cardiology Center' },
                { label: 'Orthopedic Institute', value: 'Orthopedic Institute' },
                { label: 'Diagnostic Lab', value: 'Diagnostic Lab' },
              ]}
              selectedValue={type}
              onValueChange={(val) => setType(val)}
            />

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-xs font-bold text-slate-700 mb-1">City *</Text>
              <TextInput
                value={city}
                onChangeText={setCity}
                placeholder="e.g. Bengaluru"
                className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-bold text-slate-700 mb-1">State</Text>
              <TextInput
                value={state}
                onChangeText={setState}
                placeholder="e.g. Karnataka"
                className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </View>
          </View>

          <View>
            <Text className="text-xs font-bold text-slate-700 mb-1">Address</Text>
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Campus address & landmark"
              className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
            />
          </View>

          <View className="pt-3 border-t border-slate-100 space-y-3">
            <Text className="text-xs font-bold uppercase text-blue-700">Primary Site & Contact</Text>

            <View>
              <Text className="text-xs font-bold text-slate-700 mb-1">Site / Center Name</Text>
              <TextInput
                value={siteName}
                onChangeText={setSiteName}
                placeholder="e.g. Manipal CathLab Suite 1"
                className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </View>

            <View>
              <Text className="text-xs font-bold text-slate-700 mb-1">Department</Text>
              <TextInput
                value={department}
                onChangeText={setDepartment}
                placeholder="e.g. Interventional Cardiology"
                className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-xs font-bold text-slate-700 mb-1">Contact Name</Text>
                <TextInput
                  value={contactName}
                  onChangeText={setContactName}
                  placeholder="e.g. Suresh V"
                  className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-bold text-slate-700 mb-1">Contact Mobile</Text>
                <TextInput
                  value={contactPhone}
                  onChangeText={setContactPhone}
                  keyboardType="phone-pad"
                  placeholder="+91 98000 12345"
                  className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </View>
            </View>
          </View>

          <View className="pt-4 border-t border-slate-100 flex-row items-center justify-end gap-3">
            <Pressable
              onPress={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-bold rounded-xl"
            >
              <Text className="text-slate-600 text-xs font-bold">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleAddCustomerSubmit}
              className="px-5 py-2.5 bg-blue-700 rounded-xl shadow-xs"
            >
              <Text className="text-white text-xs font-bold">Save Customer</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};
