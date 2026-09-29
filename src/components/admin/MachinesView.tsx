import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { CustomSelect } from '../common/CustomSelect';
import { useApp } from '../../context/AppContext';
import { Machine, WarrantyType } from '../../types';
import { WarrantyBadge, MachineStatusBadge } from '../common/Badge';
import { Modal } from '../common/Modal';
import {
  Search,
  Plus,
  ChevronRight,
  Eye,
} from 'lucide-react-native';

export const MachinesView: React.FC = () => {
  const { machines, customers, addMachine, setCurrentScreen } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedWarranty, setSelectedWarranty] = useState<string>('ALL');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [inspectMachine, setInspectMachine] = useState<Machine | null>(null);

  // Registration Form State
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [category, setCategory] = useState<Machine['category']>('Cardiovascular');
  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [siteId, setSiteId] = useState(customers[0]?.sites[0]?.id || '');
  const [warrantyType, setWarrantyType] = useState<WarrantyType>('UNDER_WARRANTY');
  const [warrantyExpiryDate, setWarrantyExpiryDate] = useState('2028-12-31');

  const filteredMachines = machines.filter((m) => {
    const matchesSearch =
      m.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.siteName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || m.category === selectedCategory;
    const matchesWarranty = selectedWarranty === 'ALL' || m.warrantyType === selectedWarranty;

    return matchesSearch && matchesCategory && matchesWarranty;
  });

  const handleRegisterSubmit = () => {
    if (!model.trim() || !serialNumber.trim()) return;

    const selectedCust = customers.find((c) => c.id === customerId);
    const selectedSite = selectedCust?.sites.find((s) => s.id === siteId) || selectedCust?.sites[0];

    const newMachine: Machine = {
      id: `m-${Date.now()}`,
      serialNumber,
      model,
      category,
      customerId: selectedCust?.id || 'cust-1',
      customerName: selectedCust?.name || 'Customer Facility',
      siteId: selectedSite?.id || 'site-101',
      siteName: selectedSite?.name || 'Main CathLab',
      installDate: new Date().toISOString().split('T')[0],
      warrantyType,
      warrantyExpiryDate,
      status: 'OPERATIONAL',
      lastServiceDate: new Date().toISOString().split('T')[0],
      nextServiceDue: '2026-12-31',
      imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80',
      specifications: {
        'Regulatory Clearance': 'CE Class III & USFDA Certified',
        'Service Interval': 'Quarterly (Every 90 Days)',
        'Calibrated Range': 'Standard Medical Grade Spec',
      },
    };

    addMachine(newMachine);
    setIsRegisterModalOpen(false);

    // Reset Form
    setModel('');
    setSerialNumber('');
  };

  return (
    <ScrollView className="flex-1 bg-slate-50 p-4 space-y-6" keyboardShouldPersistTaps="handled">
      {/* Header Banner - Topic Only */}
      <View className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex-row items-center justify-between">
        <Text className="text-xl font-black text-slate-900 tracking-tight">
          Machine Registry & Warranty Tracking
        </Text>

        <Pressable
          onPress={() => setIsRegisterModalOpen(true)}
          className="flex-row items-center gap-1.5 px-3.5 py-2 bg-blue-700 rounded-xl"
        >
          <Plus size={16} color="#ffffff" />
          <Text className="text-white text-xs font-bold">Register Machine</Text>
        </Pressable>
      </View>

      {/* Filter and Stats Bar */}
      <View className="flex-row gap-2">
        <View className="flex-1 p-3 bg-white rounded-xl border border-slate-200">
          <Text className="text-[10px] font-bold text-slate-400 uppercase">Installed Fleet</Text>
          <Text className="text-lg font-black text-slate-900 mt-0.5">{machines.length}</Text>
        </View>
        <View className="flex-1 p-3 bg-white rounded-xl border border-slate-200">
          <Text className="text-[10px] font-bold text-emerald-600 uppercase">Under Warranty</Text>
          <Text className="text-lg font-black text-emerald-700 mt-0.5">
            {machines.filter((m) => m.warrantyType !== 'EXPIRED').length}
          </Text>
        </View>
        <View className="flex-1 p-3 bg-white rounded-xl border border-slate-200">
          <Text className="text-[10px] font-bold text-rose-600 uppercase">Breakdowns</Text>
          <Text className="text-lg font-black text-rose-700 mt-0.5">
            {machines.filter((m) => m.status === 'BREAKDOWN').length}
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 shadow-xs">
        <Search size={16} color="#94a3b8" />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search model, serial number, hospital..."
          className="flex-1 ml-2 text-xs font-medium text-slate-900 py-1"
        />
      </View>

      {/* Machines List */}
      <View className="space-y-4 pb-8">
        {filteredMachines.map((machine) => (
          <View
            key={machine.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
          >
            {/* Image Banner */}
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

            {/* Body */}
            <View className="p-4 space-y-2">
              <Text className="text-base font-bold text-slate-900">{machine.model}</Text>
              <Text className="text-xs font-mono font-semibold text-blue-700">
                SN: {machine.serialNumber}
              </Text>

              <View className="pt-2 border-t border-slate-100 space-y-1">
                <View className="flex-row justify-between">
                  <Text className="text-xs text-slate-400">Hospital:</Text>
                  <Text className="text-xs font-bold text-slate-800">{machine.customerName}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-xs text-slate-400">Site:</Text>
                  <Text className="text-xs font-semibold text-slate-700">{machine.siteName}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-xs text-slate-400">Install Date:</Text>
                  <Text className="text-xs font-mono text-slate-700">{machine.installDate}</Text>
                </View>
              </View>

              <View className="pt-2 border-t border-slate-100 flex-row justify-between items-center">
                <Text className="text-xs text-slate-400">Coverage:</Text>
                <WarrantyBadge type={machine.warrantyType} expiryDate={machine.warrantyExpiryDate} />
              </View>
            </View>

            {/* Actions */}
            <View className="p-3 bg-slate-50 border-t border-slate-100 flex-row items-center justify-start">
              <Pressable
                onPress={() => setInspectMachine(machine)}
                className="flex-row items-center gap-1.5 px-3 py-1.5 bg-slate-200 rounded-lg"
              >
                <Eye size={16} color="#334155" />
                <Text className="text-xs font-bold text-slate-700">Specs & History</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>

      {/* Machine Inspection Modal */}
      {inspectMachine && (
        <Modal
          isOpen={!!inspectMachine}
          onClose={() => setInspectMachine(null)}
          title={inspectMachine.model}
          subtitle={`SN: ${inspectMachine.serialNumber} • ${inspectMachine.category}`}
        >
          <View className="space-y-4">
            <View className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <Text className="text-[10px] font-bold text-slate-400 uppercase">Hospital</Text>
              <Text className="text-sm font-bold text-slate-900">{inspectMachine.customerName}</Text>
              <Text className="text-xs text-blue-700 font-medium">{inspectMachine.siteName}</Text>
            </View>

            <View className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100 space-y-2">
              <Text className="text-xs font-bold uppercase text-blue-800">
                Warranty & Contract Details
              </Text>
              <View className="flex-row justify-between items-center">
                <Text className="text-xs text-slate-500">Contract Tier:</Text>
                <WarrantyBadge type={inspectMachine.warrantyType} />
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-xs text-slate-500">Contract Expiration:</Text>
                <Text className="text-xs font-bold text-slate-800 font-mono">
                  {inspectMachine.warrantyExpiryDate}
                </Text>
              </View>
            </View>

            {/* Specifications */}
            <View className="space-y-2">
              <Text className="text-xs font-bold uppercase text-slate-400">Technical Specifications</Text>
              {Object.entries(inspectMachine.specifications).map(([key, val]) => (
                <View key={key} className="flex-row justify-between p-2 bg-slate-50 rounded-lg">
                  <Text className="text-xs text-slate-500">{key}:</Text>
                  <Text className="text-xs font-semibold text-slate-800">{val}</Text>
                </View>
              ))}
            </View>
          </View>
        </Modal>
      )}

      {/* Register Machine Modal */}
      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        title="Register New Machine Unit"
        subtitle="Add machine serial number to global installed base"
      >
        <View className="space-y-4">
          <View>
            <Text className="text-xs font-bold text-slate-700 mb-1">Model Name *</Text>
            <TextInput
              value={model}
              onChangeText={setModel}
              placeholder="e.g. Meril Myval Octapro TAVR"
              className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
            />
          </View>

          <View>
            <Text className="text-xs font-bold text-slate-700 mb-1">Serial Number *</Text>
            <TextInput
              value={serialNumber}
              onChangeText={setSerialNumber}
              placeholder="e.g. MRL-MYV-2026-99"
              className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900"
            />
          </View>

          <CustomSelect
            label="Category"
            options={[
              { label: 'Cardiovascular', value: 'Cardiovascular' },
              { label: 'Orthopedics', value: 'Orthopedics' },
              { label: 'In-Vitro Diagnostics', value: 'In-Vitro Diagnostics' },
              { label: 'Endosurgery', value: 'Endosurgery' },
            ]}
            selectedValue={category}
            onValueChange={(val) => setCategory(val)}
          />

          <View className="pt-4 border-t border-slate-100 flex-row items-center justify-end gap-3">
            <Pressable
              onPress={() => setIsRegisterModalOpen(false)}
              className="px-4 py-2 text-xs font-bold"
            >
              <Text className="text-slate-600 text-xs font-bold">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleRegisterSubmit}
              className="px-5 py-2.5 bg-blue-700 rounded-xl shadow-xs"
            >
              <Text className="text-white text-xs font-bold">Register Machine</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};
