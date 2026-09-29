import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Linking } from 'react-native';
import { Image } from 'expo-image';
import { useApp } from '../../context/AppContext';
import { PriorityBadge, TicketStatusBadge } from '../common/Badge';
import { Modal } from '../common/Modal';
import {
  Wrench,
  Phone,
  Truck,
  Wifi,
  WifiOff,
  FileCheck,
  Check,
  Forward,
  Clock,
  AlertCircle,
  Radio,
  CheckCircle,
} from 'lucide-react-native';

export const JobDetailView: React.FC = () => {
  const {
    tickets,
    engineers,
    selectedTicketId,
    updateTicketStatus,
    acceptRequest,
    passRequest,
    postponeRequest,
    setCurrentScreen,
    isOffline,
    toggleOfflineMode,
  } = useApp();

  const currentEngineer = engineers[0];
  const [notesInput, setNotesInput] = useState('');

  // Modal states for Pass and Postpone
  const [showPassModal, setShowPassModal] = useState(false);
  const [passReason, setPassReason] = useState('');

  const [showPostponeModal, setShowPostponeModal] = useState(false);
  const [postponeReason, setPostponeReason] = useState('');
  const [postponedUntil, setPostponedUntil] = useState('Today at 4:00 PM');

  const currentTicket =
    tickets.find((t) => t.id === selectedTicketId) ||
    tickets[0];

  if (!currentTicket) {
    return (
      <View className="flex-1 p-8 items-center justify-center">
        <Text className="text-slate-500 text-sm">No job selected.</Text>
        <Pressable
          onPress={() => setCurrentScreen('my-jobs')}
          className="mt-4 px-4 py-2 bg-emerald-700 rounded-xl"
        >
          <Text className="text-white text-xs font-bold">Return to Job Board</Text>
        </Pressable>
      </View>
    );
  }

  const handleStatusUpdate = (newStatus: any, customNote?: string) => {
    updateTicketStatus(currentTicket.id, newStatus, customNote || notesInput);
    setNotesInput('');
  };

  const handleConfirmPass = () => {
    passRequest(currentTicket.id, currentEngineer.id, passReason.trim());
    setShowPassModal(false);
    setPassReason('');
    setCurrentScreen('my-jobs');
  };

  const handleConfirmPostpone = () => {
    if (!postponeReason.trim()) return;
    postponeRequest(currentTicket.id, postponeReason.trim(), postponedUntil.trim());
    setShowPostponeModal(false);
    setPostponeReason('');
  };

  const isAssignedToMe = currentTicket.assignedEngineerId === currentEngineer.id;
  const isOpenPoolItem = currentTicket.status === 'RAISED' || !currentTicket.assignedEngineerId;
  const isAccepted = currentTicket.status === 'ACCEPTED';
  const hasPassed = (currentTicket.passedEngineerIds || []).includes(currentEngineer.id);

  const quickDiagnosticNotes = [
    'Completed visual & resistance checks',
    'Replaced faulty sensor component',
    'Fluidics & pressure calibration passed',
    'System operational — ready for customer OTP signoff',
  ];

  return (
    <ScrollView className="flex-1 bg-slate-50 p-4 space-y-6" keyboardShouldPersistTaps="handled">
      {/* Top Banner - Topic Only */}
      <View className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex-row items-center justify-between">
        <View className="flex-1 pr-2">
          <Text className="text-xl font-black text-slate-900 tracking-tight">
            Service Request & Work Order Details
          </Text>
        </View>

        <Pressable
          onPress={() => setCurrentScreen('my-jobs')}
          className="px-3 py-1.5 bg-slate-100 rounded-xl"
        >
          <Text className="text-xs font-bold text-slate-600">← Back</Text>
        </Pressable>
      </View>

      {/* Ticket Overview Card */}
      <View className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
        <View className="space-y-2">
          <View className="flex-row items-center gap-2 flex-wrap">
            <Text className="font-mono text-base font-black text-emerald-800">
              {currentTicket.ticketNumber}
            </Text>
            <PriorityBadge priority={currentTicket.priority} />
            <TicketStatusBadge status={currentTicket.status} isOfflineQueued={currentTicket.isOfflineQueued} />
          </View>
          <Text className="text-lg font-bold text-slate-900">{currentTicket.machineModel}</Text>
          <Text className="text-xs text-blue-700 font-mono font-bold">
            SN: {currentTicket.machineSerial}
          </Text>
        </View>

        {/* Customer & Location */}
        <View className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-xs font-bold text-slate-900">{currentTicket.customerName}</Text>
              <Text className="text-[11px] text-slate-500">{currentTicket.siteName}</Text>
            </View>

            <Pressable
              onPress={() => Linking.openURL(`tel:${currentTicket.contactPhone}`)}
              className="flex-row items-center gap-1 px-3 py-1.5 bg-emerald-600 rounded-xl"
            >
              <Phone size={14} color="#ffffff" />
              <Text className="text-white text-xs font-bold">Call</Text>
            </Pressable>
          </View>

          <Text className="text-xs font-bold text-slate-800">Contact: {currentTicket.contactName}</Text>
        </View>

        {/* Fault Description & Photos */}
        <View className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <Text className="text-xs font-bold text-slate-400 uppercase">Reported Breakdown Symptoms</Text>
          <Text className="text-xs text-slate-800 font-medium leading-relaxed">
            {currentTicket.faultDescription}
          </Text>

          {hasPassed && (
            <View className="p-2.5 bg-slate-200 border border-slate-300 rounded-xl mt-2 flex-row items-center gap-2">
              <AlertCircle size={14} color="#475569" />
              <Text className="text-xs text-slate-700 font-medium flex-1">
                You passed on this request. It remains open in the pool for other engineers or Admin dispatch.
              </Text>
            </View>
          )}

          {currentTicket.postponeReason && (
            <View className="p-2.5 bg-amber-100 border border-amber-300 rounded-xl mt-2">
              <Text className="text-xs font-bold text-amber-900">Postponed:</Text>
              <Text className="text-xs text-amber-800 mt-0.5">{currentTicket.postponeReason}</Text>
              {currentTicket.postponedUntil && (
                <Text className="text-[11px] text-amber-700 font-semibold mt-0.5">
                  Target Time: {currentTicket.postponedUntil}
                </Text>
              )}
            </View>
          )}

          {currentTicket.photos.length > 0 && (
            <View className="space-y-1.5 pt-2 border-t border-slate-200">
              <Text className="text-[11px] font-bold text-slate-400 uppercase">Customer Photos</Text>
              <View className="flex-row gap-2 flex-wrap">
                {currentTicket.photos.map((p, i) => (
                  <Image
                    key={i}
                    source={{ uri: p }}
                    style={{ width: 64, height: 64, borderRadius: 8 }}
                    contentFit="cover"
                  />
                ))}
              </View>
            </View>
          )}

          {/* Product Ordering Direct Callout */}
          <Pressable
            onPress={() => setCurrentScreen('product-ordering')}
            className="mt-3 p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-2 flex-1 pr-2">
              <Text className="text-base">🧪</Text>
              <View className="flex-1">
                <Text className="text-xs font-bold text-emerald-950">Order Reagents, Parts & Machines</Text>
                <Text className="text-[10px] text-emerald-700 font-medium">Auto-linked to {currentTicket.ticketNumber} for availability alerts</Text>
              </View>
            </View>
            <View className="px-2.5 py-1 bg-emerald-700 rounded-lg">
              <Text className="text-white text-[11px] font-bold">Order Now</Text>
            </View>
          </Pressable>
        </View>
      </View>

      {/* Engineer Request Decision Panel (Accept / Pass / Postpone) */}
      {(isOpenPoolItem || isAssignedToMe || isAccepted) && (
        <View className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 shadow-xs">
          <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Engineer Decision Panel
          </Text>

          <View className="flex-row gap-2">
            {/* Accept & Claim */}
            <Pressable
              onPress={() => acceptRequest(currentTicket.id, currentEngineer.id)}
              disabled={isAccepted && isAssignedToMe}
              className={`flex-1 py-3 px-2 rounded-xl flex-row items-center justify-center gap-1.5 ${
                isAccepted && isAssignedToMe ? 'bg-emerald-100 border border-emerald-300' : 'bg-emerald-700'
              }`}
            >
              <Check size={16} color={isAccepted && isAssignedToMe ? '#047857' : '#ffffff'} />
              <Text className={`text-xs font-bold ${isAccepted && isAssignedToMe ? 'text-emerald-800' : 'text-white'}`}>
                {isAccepted && isAssignedToMe ? 'Claimed & Accepted' : 'Accept & Claim'}
              </Text>
            </Pressable>

            {/* Pass Request */}
            <Pressable
              onPress={() => setShowPassModal(true)}
              className="flex-1 py-3 px-2 bg-slate-700 rounded-xl flex-row items-center justify-center gap-1.5"
            >
              <Forward size={16} color="#ffffff" />
              <Text className="text-white text-xs font-bold">Pass Request</Text>
            </Pressable>

            {/* Postpone */}
            <Pressable
              onPress={() => {
                setPostponeReason(currentTicket.postponeReason || '');
                setShowPostponeModal(true);
              }}
              className="py-3 px-3.5 bg-amber-600 rounded-xl flex-row items-center justify-center"
            >
              <Clock size={16} color="#ffffff" />
            </Pressable>
          </View>
        </View>
      )}

      {/* Engineer Status Progression Panel */}
      <View className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Wrench size={18} color="#059669" />
            <Text className="text-base font-bold text-slate-900">Job Lifecycle & Stages</Text>
          </View>
          <Text className="text-xs text-slate-500 font-bold">{currentTicket.status}</Text>
        </View>

        <View className="space-y-3">
          {/* Step 1: Accept & En Route */}
          <Pressable
            onPress={() => handleStatusUpdate('EN_ROUTE', 'Engineer accepted call and is en route to site.')}
            disabled={currentTicket.status === 'EN_ROUTE' || currentTicket.status === 'IN_PROGRESS' || currentTicket.status === 'RESOLVED' || currentTicket.status === 'CLOSED'}
            className={`p-4 rounded-2xl border ${
              currentTicket.status === 'EN_ROUTE'
                ? 'bg-blue-50 border-blue-400'
                : currentTicket.status === 'IN_PROGRESS' || currentTicket.status === 'RESOLVED' || currentTicket.status === 'CLOSED'
                ? 'bg-slate-50 border-slate-200 opacity-60'
                : 'bg-white border-slate-200'
            }`}
          >
            <View className="flex-row items-center justify-between mb-1">
              <Truck size={20} color="#2563eb" />
              <Text className="text-[10px] font-bold uppercase text-slate-400">Step 1</Text>
            </View>
            <Text className="text-xs font-bold text-slate-900">1. Depart & En Route</Text>
            <Text className="text-[10px] text-slate-500 mt-0.5">Alert hospital that engineer is traveling</Text>
          </Pressable>

          {/* Step 2: Arrive & In Progress */}
          <Pressable
            onPress={() => handleStatusUpdate('IN_PROGRESS', 'Engineer arrived at OT/CathLab. Diagnostics initiated.')}
            disabled={currentTicket.status === 'IN_PROGRESS' || currentTicket.status === 'RESOLVED' || currentTicket.status === 'CLOSED'}
            className={`p-4 rounded-2xl border ${
              currentTicket.status === 'IN_PROGRESS'
                ? 'bg-emerald-50 border-emerald-400'
                : currentTicket.status === 'RESOLVED' || currentTicket.status === 'CLOSED'
                ? 'bg-slate-50 border-slate-200 opacity-60'
                : 'bg-white border-slate-200'
            }`}
          >
            <View className="flex-row items-center justify-between mb-1">
              <Wrench size={20} color="#059669" />
              <Text className="text-[10px] font-bold uppercase text-slate-400">Step 2</Text>
            </View>
            <Text className="text-xs font-bold text-slate-900">2. Arrive & In Progress</Text>
            <Text className="text-[10px] text-slate-500 mt-0.5">Begin on-site calibration & testing</Text>
          </Pressable>

          {/* Step 3: Complete Repair (Resolved) */}
          <Pressable
            onPress={() => handleStatusUpdate('RESOLVED', 'On-site repair completed. Requesting customer Handover OTP verification.')}
            disabled={currentTicket.status === 'RESOLVED' || currentTicket.status === 'CLOSED'}
            className={`p-4 rounded-2xl border ${
              currentTicket.status === 'RESOLVED'
                ? 'bg-amber-50 border-amber-400'
                : currentTicket.status === 'CLOSED'
                ? 'bg-slate-50 border-slate-200 opacity-60'
                : 'bg-white border-slate-200'
            }`}
          >
            <View className="flex-row items-center justify-between mb-1">
              <CheckCircle size={20} color="#d97706" />
              <Text className="text-[10px] font-bold uppercase text-slate-400">Step 3</Text>
            </View>
            <Text className="text-xs font-bold text-slate-900">3. Mark Repair Resolved</Text>
            <Text className="text-[10px] text-slate-500 mt-0.5">Notify customer to provide 4-digit Handover OTP</Text>
          </Pressable>

          {/* Step 4: Complete & Close Job */}
          <Pressable
            onPress={() => setCurrentScreen('close-job')}
            disabled={currentTicket.status === 'CLOSED'}
            className={`p-4 rounded-2xl border ${
              currentTicket.status === 'CLOSED'
                ? 'bg-emerald-100 border-emerald-300'
                : 'bg-emerald-700 border-emerald-800'
            }`}
          >
            <View className="flex-row items-center justify-between mb-1">
              <FileCheck size={20} color="#ffffff" />
              <Text className="text-[10px] font-bold uppercase text-emerald-200">Final Step</Text>
            </View>
            <Text className="text-xs font-bold text-white">4. Close Job & Sign FSR</Text>
            <Text className="text-[10px] text-emerald-100 mt-0.5">OTP verification, parts & digital sign</Text>
          </Pressable>
        </View>

        {/* Live Customer Sync & Diagnostic Updates */}
        <View className="space-y-3 pt-3 border-t border-slate-100">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-bold text-slate-900">Customer Live Update Broadcast</Text>
            <View className="flex-row items-center gap-1">
              <Radio size={12} color="#059669" />
              <Text className="text-[10px] font-bold text-emerald-700">Live Sync Active</Text>
            </View>
          </View>

          {/* Quick Preset Notes */}
          <View className="flex-row gap-1.5 flex-wrap">
            {quickDiagnosticNotes.map((preset, idx) => (
              <Pressable
                key={idx}
                onPress={() => setNotesInput(preset)}
                className="px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg"
              >
                <Text className="text-[11px] font-medium text-slate-700">{preset}</Text>
              </Pressable>
            ))}
          </View>

          <View className="flex-row gap-2">
            <TextInput
              value={notesInput}
              onChangeText={setNotesInput}
              placeholder="Post diagnostic update to customer..."
              className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
            />
            <Pressable
              onPress={() => handleStatusUpdate(currentTicket.status, notesInput)}
              className="px-4 py-2.5 bg-slate-900 rounded-xl"
            >
              <Text className="text-white text-xs font-bold">Sync</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Pass Request Modal */}
      {showPassModal && (
        <Modal
          isOpen={showPassModal}
          onClose={() => setShowPassModal(false)}
          title={`Pass Service Request ${currentTicket.ticketNumber}`}
          subtitle={`${currentTicket.machineModel} • ${currentTicket.customerName}`}
        >
          <View className="space-y-4">
            <View className="p-3 bg-slate-100 border border-slate-300 rounded-xl flex-row items-center gap-2">
              <Forward size={18} color="#475569" />
              <Text className="text-xs font-medium text-slate-800 flex-1">
                Passing will leave this request in the open pool for other field engineers to accept. Admin can assign if no engineer takes it.
              </Text>
            </View>

            <View className="space-y-2">
              <Text className="text-xs font-bold text-slate-700">Select Reason for Passing (Optional)</Text>
              <View className="flex-row gap-1.5 flex-wrap">
                {[
                  'Occupied with active breakdown call',
                  'Parts not readily available in vehicle',
                  'Outside current geographical zone',
                  'Shift ending soon',
                ].map((reason) => (
                  <Pressable
                    key={reason}
                    onPress={() => setPassReason(reason)}
                    className={`px-2.5 py-1.5 rounded-lg border ${
                      passReason === reason
                        ? 'bg-slate-200 border-slate-500'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <Text className="text-xs text-slate-800 font-medium">{reason}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View className="space-y-1">
              <Text className="text-xs font-bold text-slate-700">Custom Notes for Pool</Text>
              <TextInput
                value={passReason}
                onChangeText={setPassReason}
                placeholder="Optional note for team..."
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </View>

            <View className="pt-3 border-t border-slate-100 flex-row items-center justify-end gap-3">
              <Pressable onPress={() => setShowPassModal(false)} className="px-4 py-2">
                <Text className="text-slate-600 text-xs font-bold">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleConfirmPass}
                className="px-5 py-2.5 bg-slate-800 rounded-xl"
              >
                <Text className="text-white text-xs font-bold">Confirm Pass</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}

      {/* Postpone Request Modal */}
      {showPostponeModal && (
        <Modal
          isOpen={showPostponeModal}
          onClose={() => setShowPostponeModal(false)}
          title={`Postpone Request ${currentTicket.ticketNumber}`}
          subtitle={`${currentTicket.machineModel} • ${currentTicket.customerName}`}
        >
          <View className="space-y-4">
            <View className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex-row items-center gap-2">
              <Clock size={18} color="#d97706" />
              <Text className="text-xs font-medium text-amber-900 flex-1">
                Postponing will update the service timeline and notify hospital management of the delayed window.
              </Text>
            </View>

            <View className="space-y-2">
              <Text className="text-xs font-bold text-slate-700">Select Postponement Reason</Text>
              <View className="flex-row gap-1.5 flex-wrap">
                {[
                  'Awaiting OT / Cath Lab slot access',
                  'Waiting for spare part arrival',
                  'Prior critical breakdown extended',
                  'Customer requested time shift',
                ].map((reason) => (
                  <Pressable
                    key={reason}
                    onPress={() => setPostponeReason(reason)}
                    className={`px-2.5 py-1.5 rounded-lg border ${
                      postponeReason === reason
                        ? 'bg-amber-100 border-amber-400'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <Text className="text-xs text-slate-800 font-medium">{reason}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View className="space-y-1">
              <Text className="text-xs font-bold text-slate-700">Rescheduled Target Time</Text>
              <TextInput
                value={postponedUntil}
                onChangeText={setPostponedUntil}
                placeholder="e.g. Today at 5:00 PM, Tomorrow 9:00 AM"
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
              />
            </View>

            <View className="space-y-1">
              <Text className="text-xs font-bold text-slate-700">Postponement Explanation</Text>
              <TextInput
                value={postponeReason}
                onChangeText={setPostponeReason}
                placeholder="Describe why call is being postponed..."
                multiline
                numberOfLines={3}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </View>

            <View className="pt-3 border-t border-slate-100 flex-row items-center justify-end gap-3">
              <Pressable onPress={() => setShowPostponeModal(false)} className="px-4 py-2">
                <Text className="text-slate-600 text-xs font-bold">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleConfirmPostpone}
                disabled={!postponeReason.trim()}
                className={`px-5 py-2.5 rounded-xl ${
                  postponeReason.trim() ? 'bg-amber-600' : 'bg-slate-300'
                }`}
              >
                <Text className="text-white text-xs font-bold">Confirm Postpone</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
};
