import React from 'react';
import { View, Text, Pressable, ScrollView, Linking } from 'react-native';
import { Image } from 'expo-image';
import { useApp } from '../../context/AppContext';
import { TicketStatusBadge, PriorityBadge } from '../common/Badge';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Wrench,
  Phone,
  User,
  KeyRound,
  Radio,
  FileCheck,
  Check,
} from 'lucide-react-native';

export const RequestStatusView: React.FC = () => {
  const {
    tickets,
    selectedTicketId,
    setSelectedTicketId,
    setCurrentScreen,
  } = useApp();

  const currentTicket =
    tickets.find((t) => t.id === selectedTicketId) ||
    tickets[0];

  if (!currentTicket) {
    return (
      <View className="flex-1 p-8 items-center justify-center">
        <Text className="text-slate-500 text-sm">No service requests found.</Text>
        <Pressable
          onPress={() => setCurrentScreen('raise-request')}
          className="mt-4 px-4 py-2 bg-blue-700 rounded-xl"
        >
          <Text className="text-white text-xs font-bold">Raise New Request</Text>
        </Pressable>
      </View>
    );
  }

  const timelineSteps = [
    { key: 'RAISED', label: 'Ticket Raised', desc: 'Logged & dispatched' },
    { key: 'ACCEPTED', label: 'Accepted', desc: currentTicket.assignedEngineerName ? `${currentTicket.assignedEngineerName} claimed call` : 'Awaiting claim' },
    { key: 'EN_ROUTE', label: 'En Route', desc: currentTicket.etaMinutes ? `ETA ~${currentTicket.etaMinutes} mins` : 'Engineer traveling' },
    { key: 'IN_PROGRESS', label: 'On-Site Repair', desc: 'Calibration & repair active' },
    { key: 'RESOLVED', label: 'Repair Resolved', desc: 'Ready for OTP sign-off' },
    { key: 'CLOSED', label: 'Job Closed', desc: 'FSR signed & closed' },
  ];

  const getStepStatus = (stepKey: string) => {
    const order = ['RAISED', 'ASSIGNED', 'ACCEPTED', 'EN_ROUTE', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
    
    // Normalize status
    let currentStatus = currentTicket.status;
    if (currentStatus === 'ASSIGNED') currentStatus = 'ACCEPTED';

    const currentIdx = order.indexOf(currentStatus);
    const stepIdx = order.indexOf(stepKey);

    if (stepIdx < currentIdx) return 'completed';
    if (stepIdx === currentIdx) return 'active';
    return 'pending';
  };

  return (
    <ScrollView className="flex-1 bg-slate-50 p-4 space-y-6" keyboardShouldPersistTaps="handled">
      {/* Header Banner - Topic Only */}
      <View className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex-row items-center justify-between">
        <Text className="text-xl font-black text-slate-900 tracking-tight">
          Live Service Request Timeline
        </Text>

        <View className="flex-row items-center gap-1.5 px-2.5 py-1 bg-emerald-50 rounded-full border border-emerald-200">
          <Radio size={12} color="#059669" />
          <Text className="text-[10px] font-bold text-emerald-800">Live Customer Sync</Text>
        </View>
      </View>

      {/* Ticket List Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
        {tickets.map((tkt) => {
          const isSelected = tkt.id === currentTicket.id;
          return (
            <Pressable
              key={tkt.id}
              onPress={() => setSelectedTicketId(tkt.id)}
              className={`p-3 rounded-xl border ${
                isSelected ? 'bg-blue-50 border-blue-400' : 'bg-white border-slate-200'
              }`}
            >
              <Text className="font-mono text-xs font-bold text-slate-900">{tkt.ticketNumber}</Text>
              <Text className="text-[11px] text-slate-500 mt-0.5">{tkt.status}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Active Ticket Details & OTP */}
      <View className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
        <View className="space-y-2">
          <View className="flex-row items-center gap-2 flex-wrap">
            <Text className="text-base font-black font-mono text-blue-700">{currentTicket.ticketNumber}</Text>
            <PriorityBadge priority={currentTicket.priority} />
            <TicketStatusBadge status={currentTicket.status} isOfflineQueued={currentTicket.isOfflineQueued} />
          </View>
          <Text className="text-lg font-bold text-slate-900">{currentTicket.machineModel}</Text>
          <Text className="text-xs text-slate-500 font-mono">
            SN: {currentTicket.machineSerial} • {currentTicket.siteName}
          </Text>
        </View>

        {/* Postponed Alert if applicable */}
        {currentTicket.status === 'POSTPONED' && (
          <View className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-1">
            <View className="flex-row items-center gap-1.5">
              <Clock size={16} color="#d97706" />
              <Text className="text-xs font-bold text-amber-900 uppercase">Service Call Postponed</Text>
            </View>
            <Text className="text-xs text-amber-900 font-semibold">
              Reason: {currentTicket.postponeReason || 'Awaiting slot access'}
            </Text>
            {currentTicket.postponedUntil && (
              <Text className="text-[11px] text-amber-700 font-bold">
                Target Rescheduled Time: {currentTicket.postponedUntil}
              </Text>
            )}
          </View>
        )}

        {/* Handover OTP Card */}
        {currentTicket.status === 'RESOLVED' && (
          <View className="p-4 bg-amber-50 rounded-2xl border border-amber-200 items-center space-y-1">
            <View className="flex-row items-center gap-1">
              <KeyRound size={16} color="#d97706" />
              <Text className="text-xs font-bold text-amber-900 uppercase">On-Site Handover OTP</Text>
            </View>
            <Text className="text-3xl font-black font-mono tracking-widest text-amber-900">
              {currentTicket.otp}
            </Text>
            <Text className="text-[10px] text-amber-700 text-center font-medium">
              Provide this 4-digit code to engineer on-site to complete sign-off.
            </Text>
          </View>
        )}

        {/* Timeline Stepper */}
        <View className="space-y-3 pt-2">
          <Text className="text-xs font-bold uppercase text-slate-400">Synchronized Lifecycle Stepper</Text>
          <View className="space-y-2">
            {timelineSteps.map((step, idx) => {
              const state = getStepStatus(step.key);

              return (
                <View
                  key={step.key}
                  className={`p-3 rounded-xl border flex-row items-center justify-between ${
                    state === 'completed'
                      ? 'bg-emerald-50 border-emerald-300'
                      : state === 'active'
                      ? 'bg-blue-50 border-blue-400'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <View className="flex-row items-center gap-2.5 flex-1 pr-2">
                    <View
                      className={`w-6 h-6 rounded-full items-center justify-center ${
                        state === 'completed'
                          ? 'bg-emerald-600'
                          : state === 'active'
                          ? 'bg-blue-600'
                          : 'bg-slate-200'
                      }`}
                    >
                      <Text className="text-[10px] font-bold text-white">{idx + 1}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs font-bold text-slate-900">{step.label}</Text>
                      <Text className="text-[10px] text-slate-500">{step.desc}</Text>
                    </View>
                  </View>
                  <Text className="text-[10px] font-bold uppercase">
                    {state === 'completed' ? '✓ Done' : state === 'active' ? '● Live' : 'Pending'}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* Assigned Engineer Card */}
      {currentTicket.assignedEngineerName ? (
        <View className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
          <View className="flex-row items-center gap-3">
            <Image
              source={{ uri: currentTicket.assignedEngineerAvatar }}
              style={{ width: 48, height: 48, borderRadius: 24 }}
              contentFit="cover"
            />
            <View className="flex-1">
              <Text className="text-xs font-bold text-blue-800">Assigned Engineer</Text>
              <Text className="text-base font-bold text-slate-900">{currentTicket.assignedEngineerName}</Text>
              <Text className="text-xs text-slate-500">Meril Field Engineer</Text>
            </View>
          </View>

          <Pressable
            onPress={() => Linking.openURL(`tel:${currentTicket.assignedEngineerPhone}`)}
            className="flex-row items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 rounded-xl"
          >
            <Phone size={16} color="#ffffff" />
            <Text className="text-white text-xs font-bold">Call Engineer</Text>
          </Pressable>
        </View>
      ) : (
        <View className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex-row items-center gap-3">
          <AlertCircle size={20} color="#d97706" />
          <Text className="text-xs font-bold text-amber-950 flex-1">
            Available in Open Pool — Awaiting Engineer Self-Claim or Dispatch...
          </Text>
        </View>
      )}

      {/* Audit History Log */}
      <View className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 pb-8">
        <Text className="text-xs font-bold uppercase text-slate-400">Live Activity Broadcast Log</Text>
        <View className="space-y-3">
          {currentTicket.timeline.map((event) => (
            <View key={event.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
              <View className="flex-row justify-between items-center">
                <Text className="text-xs font-bold text-slate-900">{event.title}</Text>
                <Text className="text-[10px] text-slate-400 font-mono">
                  {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <Text className="text-xs text-slate-600">{event.description}</Text>
              <Text className="text-[10px] text-blue-700 font-semibold">
                By: {event.actorName} ({event.actorRole})
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};
