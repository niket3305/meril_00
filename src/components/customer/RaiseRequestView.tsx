import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useApp } from '../../context/AppContext';
import { FaultCategory, TicketPriority } from '../../types';
import { CustomSelect } from '../common/CustomSelect';
import {
  AlertTriangle,
  ArrowRight,
  Trash2,
} from 'lucide-react-native';

export const RaiseRequestView: React.FC = () => {
  const {
    machines,
    selectedMachineForRequest,
    raiseRequest,
    setCurrentScreen,
  } = useApp();

  const [selectedMachineId, setSelectedMachineId] = useState<string>(
    selectedMachineForRequest ? selectedMachineForRequest.id : machines[0]?.id || ''
  );

  const [faultCategory, setFaultCategory] = useState<FaultCategory>('ELECTRICAL');
  const [priority, setPriority] = useState<TicketPriority>('CRITICAL');
  const [faultDescription, setFaultDescription] = useState(
    'Optical tracking sensor throwing Error code E-402 during pre-procedural calibration. System calibration failing tolerance check.'
  );
  const [contactName, setContactName] = useState('Karthik Raja (Senior Biomedical Lead)');
  const [contactPhone, setContactPhone] = useState('+91 98402 78910');
  const [otAccessNotes, setOtAccessNotes] = useState('Report to OT Tower B, 3rd Floor. Sterile gown required.');

  const [photos, setPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedMachineForRequest) {
      setSelectedMachineId(selectedMachineForRequest.id);
    }
  }, [selectedMachineForRequest]);

  const selectedMachine = machines.find((m) => m.id === selectedMachineId) || machines[0];

  const sampleFaultPhotos = [
    {
      label: 'Error Display',
      url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
    },
    {
      label: 'Sensor Check',
      url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    },
  ];

  const machineOptions = machines.map((m) => ({
    label: `${m.model} (SN: ${m.serialNumber})`,
    value: m.id,
    description: `${m.customerName} • ${m.siteName}`,
  }));

  const priorityOptions = [
    { label: '🚨 CRITICAL (SLA < 2h)', value: 'CRITICAL', description: 'Immediate clinical impact' },
    { label: '⚠️ HIGH (Procedure scheduled)', value: 'HIGH', description: 'Urgent resolution required' },
    { label: '⚡ MEDIUM (Non-blocking)', value: 'MEDIUM', description: 'Standard breakdown response' },
    { label: 'ℹ️ LOW (Routine)', value: 'LOW', description: 'Scheduled maintenance / check' },
  ];

  const handleSubmit = () => {
    if (!faultDescription.trim() || !contactName.trim()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      raiseRequest({
        machineId: selectedMachine.id,
        faultCategory,
        faultDescription: `${faultDescription}\n\n[OT Access Notes: ${otAccessNotes}]`,
        priority,
        photos,
        contactName,
        contactPhone,
      });

      setIsSubmitting(false);
      setCurrentScreen('request-status');
    }, 500);
  };

  return (
    <ScrollView className="flex-1 bg-slate-50 p-4 space-y-6" keyboardShouldPersistTaps="handled">
      {/* Top Banner - Topic Only */}
      <View className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex-row items-center justify-between">
        <Text className="text-xl font-black text-slate-900 tracking-tight">
          Raise Service Request
        </Text>
        <Pressable onPress={() => setCurrentScreen('my-machines')} className="px-3 py-1.5 bg-slate-100 rounded-xl">
          <Text className="text-xs font-bold text-slate-600">← Back</Text>
        </Pressable>
      </View>

      {/* Step 1: Select Machine */}
      <View className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
        <Text className="text-xs font-bold uppercase text-slate-400">Step 1: Select Affected Equipment</Text>

        <View className="space-y-3">
          <CustomSelect
            label="Installed Device *"
            options={machineOptions}
            selectedValue={selectedMachineId}
            onValueChange={(val) => setSelectedMachineId(val)}
          />

          <CustomSelect
            label="Priority Level *"
            options={priorityOptions}
            selectedValue={priority}
            onValueChange={(val) => setPriority(val)}
          />

          {/* Machine Summary Card */}
          {selectedMachine && (
            <View className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex-row items-center gap-3">
              <Image
                source={{ uri: selectedMachine.imageUrl }}
                style={{ width: 48, height: 48, borderRadius: 8 }}
                contentFit="cover"
              />
              <View className="flex-1">
                <Text className="text-xs font-bold text-slate-900">{selectedMachine.model}</Text>
                <Text className="text-[11px] font-mono text-blue-700">SN: {selectedMachine.serialNumber}</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Step 2: Fault Details */}
      <View className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
        <Text className="text-xs font-bold uppercase text-slate-400">Step 2: Fault Symptom</Text>

        <Text className="text-xs font-bold text-slate-700">Classification</Text>
        <View className="flex-row flex-wrap gap-2">
          {[
            { id: 'ELECTRICAL', label: '⚡ Electrical' },
            { id: 'CALIBRATION', label: '🎯 Calibration' },
            { id: 'MECHANICAL', label: '⚙️ Mechanical' },
            { id: 'SOFTWARE_ERROR', label: '💻 Software' },
            { id: 'OPTICAL_FLUIDICS', label: '🔬 Optics' },
            { id: 'HARDWARE_ALARM', label: '🔔 Alarm' },
          ].map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() => setFaultCategory(cat.id as FaultCategory)}
              className={`px-3 py-2 rounded-xl border ${
                faultCategory === cat.id
                  ? 'bg-blue-50 border-blue-500'
                  : 'bg-white border-slate-200'
              }`}
            >
              <Text className={`text-xs font-bold ${faultCategory === cat.id ? 'text-blue-900' : 'text-slate-700'}`}>
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View>
          <Text className="text-xs font-bold text-slate-700 mb-1">Problem Description *</Text>
          <TextInput
            multiline
            numberOfLines={4}
            value={faultDescription}
            onChangeText={setFaultDescription}
            placeholder="Describe error code, alarm tone..."
            className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 min-h-[80px]"
          />
        </View>

        {/* Photos */}
        <View className="space-y-2">
          <Text className="text-xs font-bold text-slate-700">Attached Photos ({photos.length})</Text>
          <View className="flex-row gap-2 flex-wrap">
            {photos.map((url, idx) => (
              <View key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200">
                <Image source={{ uri: url }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                <Pressable
                  onPress={() => setPhotos(photos.filter((_, i) => i !== idx))}
                  className="absolute top-1 right-1 p-1 bg-slate-900/60 rounded-full"
                >
                  <Trash2 size={12} color="#f87171" />
                </Pressable>
              </View>
            ))}
          </View>
          <View className="flex-row gap-2">
            {sampleFaultPhotos.map((s, i) => (
              <Pressable
                key={i}
                onPress={() => {
                  if (!photos.includes(s.url)) setPhotos([...photos, s.url]);
                }}
                className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg"
              >
                <Text className="text-[11px] font-semibold text-slate-700">+ Add {s.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      {/* Step 3: Contact */}
      <View className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
        <Text className="text-xs font-bold uppercase text-slate-400">Step 3: Contact & Access</Text>

        <View>
          <Text className="text-xs font-bold text-slate-700 mb-1">Contact Name *</Text>
          <TextInput
            value={contactName}
            onChangeText={setContactName}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
          />
        </View>

        <View>
          <Text className="text-xs font-bold text-slate-700 mb-1">Mobile Number *</Text>
          <TextInput
            value={contactPhone}
            onChangeText={setContactPhone}
            keyboardType="phone-pad"
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
          />
        </View>

        <View>
          <Text className="text-xs font-bold text-slate-700 mb-1">OT Access Notes</Text>
          <TextInput
            value={otAccessNotes}
            onChangeText={setOtAccessNotes}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
          />
        </View>
      </View>

      {/* Submit Button */}
      <Pressable
        onPress={handleSubmit}
        disabled={isSubmitting}
        className="py-3.5 px-6 bg-rose-600 rounded-xl shadow-lg flex-row items-center justify-center gap-2 mb-8"
      >
        {isSubmitting ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : (
          <>
            <Text className="text-white text-xs font-bold">Submit & Track Live Status</Text>
            <ArrowRight size={16} color="#ffffff" />
          </>
        )}
      </Pressable>
    </ScrollView>
  );
};
