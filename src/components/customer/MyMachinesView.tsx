import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { useApp } from '../../context/AppContext';
import { Machine } from '../../types';
import { WarrantyBadge, MachineStatusBadge } from '../common/Badge';
import { CustomSelect } from '../common/CustomSelect';
import {
  Building2,
  AlertTriangle,
  Search,
  Clock,
  ArrowRight,
  MapPin,
  Phone,
} from 'lucide-react-native';

export const MyMachinesView: React.FC = () => {
  const {
    machines,
    customers,
    tickets,
    setSelectedMachineForRequest,
    setCurrentScreen,
    setSelectedTicketId,
  } = useApp();

  const [selectedCustomerId, setSelectedCustomerId] = useState('cust-1');
  const [searchQuery, setSearchQuery] = useState('');

  const currentHospital = customers.find((c) => c.id === selectedCustomerId) || customers[0];
  const customerMachines = machines.filter((m) => m.customerId === selectedCustomerId);

  const filteredMachines = customerMachines.filter(
    (m) =>
      m.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.siteName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCustomerTickets = tickets.filter(
    (t) => t.customerId === selectedCustomerId && t.status !== 'CLOSED'
  );

  const handleRaiseRequest = (machine: Machine) => {
    setSelectedMachineForRequest(machine);
    setCurrentScreen('raise-request');
  };

  const facilityOptions = customers.map((c) => ({
    label: `${c.name} (${c.code})`,
    value: c.id,
    description: `${c.type} • ${c.city}, ${c.state}`,
  }));

  return (
    <ScrollView className="flex-1 bg-slate-50 p-4 space-y-6" keyboardShouldPersistTaps="handled">
      {/* Top Banner - Topic Only */}
      <View className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <Text className="text-xl font-black text-slate-900 tracking-tight">
          My Registered Equipment
        </Text>

        {/* Facility Selector */}
        <View className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
          <CustomSelect
            label="SELECT HOSPITAL / FACILITY VIEW"
            options={facilityOptions}
            selectedValue={selectedCustomerId}
            onValueChange={(val) => setSelectedCustomerId(val)}
          />

          {currentHospital && (
            <View className="pt-2 border-t border-slate-200 space-y-1">
              <View className="flex-row items-center justify-between">
                <Text className="text-xs font-bold text-slate-900">{currentHospital.name}</Text>
                <View className="px-2 py-0.5 bg-blue-100 rounded-full">
                  <Text className="text-[10px] font-bold text-blue-800">{currentHospital.type}</Text>
                </View>
              </View>
              <View className="flex-row items-center gap-1.5">
                <MapPin size={12} color="#64748b" />
                <Text className="text-[11px] text-slate-600">
                  {currentHospital.address}, {currentHospital.city}, {currentHospital.state} - {currentHospital.pincode}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Active Alerts Banner if there is an ongoing ticket */}
      {activeCustomerTickets.length > 0 && (
        <View className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-xl bg-amber-100 items-center justify-center">
              <AlertTriangle size={20} color="#d97706" />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-bold text-amber-950">
                {activeCustomerTickets.length} Active Service Ticket(s) in Progress
              </Text>
              <Text className="text-xs text-amber-700 mt-0.5">
                Latest: {activeCustomerTickets[0].ticketNumber} ({activeCustomerTickets[0].status})
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => {
              setSelectedTicketId(activeCustomerTickets[0].id);
              setCurrentScreen('request-status');
            }}
            className="flex-row items-center justify-center gap-1.5 px-3.5 py-2 bg-amber-600 rounded-xl"
          >
            <Text className="text-white text-xs font-bold">Track Live Status</Text>
            <ArrowRight size={16} color="#ffffff" />
          </Pressable>
        </View>
      )}

      {/* Search & Action Bar */}
      <View className="space-y-3">
        <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 shadow-xs">
          <Search size={16} color="#94a3b8" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search my equipment by name or serial..."
            className="flex-1 ml-2 text-xs font-medium text-slate-900 py-1"
          />
        </View>

        <Pressable
          onPress={() => {
            setSelectedMachineForRequest(null);
            setCurrentScreen('raise-request');
          }}
          className="flex-row items-center justify-center gap-2 px-4 py-3 bg-rose-600 rounded-xl shadow-md"
        >
          <AlertTriangle size={16} color="#ffffff" />
          <Text className="text-white text-xs font-bold">Raise Breakdown Service Ticket</Text>
        </Pressable>
      </View>

      {/* Machines List */}
      <View className="space-y-4 pb-8">
        {filteredMachines.map((machine) => {
          const hasActiveTicket = activeCustomerTickets.some((t) => t.machineId === machine.id);

          return (
            <View
              key={machine.id}
              className={`bg-white rounded-2xl border overflow-hidden shadow-xs ${
                machine.status === 'BREAKDOWN' ? 'border-rose-300' : 'border-slate-200'
              }`}
            >
              {/* Photo & Badge header */}
              <View className="relative h-40 bg-slate-100">
                <Image
                  source={{ uri: machine.imageUrl }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                />
                <View className="absolute top-3 left-3 bg-slate-900/80 px-2.5 py-1 rounded-lg">
                  <Text className="text-xs font-bold text-white">{machine.category}</Text>
                </View>
                <View className="absolute top-3 right-3">
                  <MachineStatusBadge status={machine.status} />
                </View>
              </View>

              {/* Details */}
              <View className="p-4 space-y-3">
                <View>
                  <Text className="text-base font-bold text-slate-900">{machine.model}</Text>
                  <Text className="text-xs font-mono font-bold text-emerald-800 mt-0.5">
                    SN: {machine.serialNumber}
                  </Text>
                </View>

                <View className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-slate-400">Department:</Text>
                    <Text className="text-xs font-bold text-slate-800">{machine.siteName}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-slate-400">Last Serviced:</Text>
                    <Text className="text-xs font-semibold text-slate-700">{machine.lastServiceDate}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-slate-400">Next Due:</Text>
                    <Text className="text-xs font-semibold text-slate-700">{machine.nextServiceDue}</Text>
                  </View>
                </View>

                <View className="flex-row justify-between items-center pt-1">
                  <Text className="text-xs text-slate-400 font-medium">Warranty:</Text>
                  <WarrantyBadge type={machine.warrantyType} expiryDate={machine.warrantyExpiryDate} />
                </View>
              </View>

              {/* Action Bar */}
              <View className="p-3 bg-slate-50 border-t border-slate-100">
                {hasActiveTicket ? (
                  <Pressable
                    onPress={() => {
                      const tkt = activeCustomerTickets.find((t) => t.machineId === machine.id);
                      if (tkt) setSelectedTicketId(tkt.id);
                      setCurrentScreen('request-status');
                    }}
                    className="py-2.5 px-3 bg-amber-500 rounded-xl flex-row items-center justify-center gap-1.5"
                  >
                    <Clock size={14} color="#ffffff" />
                    <Text className="text-white text-xs font-bold">Track Active Ticket</Text>
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={() => handleRaiseRequest(machine)}
                    className="py-2.5 px-3 bg-rose-50 border border-rose-200 rounded-xl flex-row items-center justify-center gap-1.5"
                  >
                    <AlertTriangle size={14} color="#e11d48" />
                    <Text className="text-rose-700 text-xs font-bold">Raise Service Request</Text>
                  </Pressable>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};
