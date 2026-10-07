import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Linking, TextInput } from 'react-native';
import { useApp } from '../../context/AppContext';
import { PriorityBadge, TicketStatusBadge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { ServiceTicket } from '../../types';
import {
  Wifi,
  WifiOff,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Phone,
  Hospital,
  Check,
  Forward,
  Clock,
  AlertCircle,
  Package,
  ChevronDown,
  ChevronUp,
  Cpu,
  User,
  FileText,
  Navigation,
  Sparkles,
} from 'lucide-react-native';

/* ─── Priority color map for subtle indicators ────────────────────────────── */
const priorityColors: Record<string, { bg: string; text: string; badgeBg: string }> = {
  CRITICAL: { bg: 'bg-rose-50', text: 'text-rose-700', badgeBg: 'bg-rose-50 border-rose-200' },
  HIGH:     { bg: 'bg-orange-50', text: 'text-orange-700', badgeBg: 'bg-orange-50 border-orange-200' },
  MEDIUM:   { bg: 'bg-amber-50', text: 'text-amber-800', badgeBg: 'bg-amber-50 border-amber-200' },
  LOW:      { bg: 'bg-emerald-50', text: 'text-emerald-700', badgeBg: 'bg-emerald-50 border-emerald-200' },
};

export const MyJobsView: React.FC = () => {
  const {
    tickets,
    engineers,
    customers,
    isOffline,
    toggleOfflineMode,
    offlineQueue,
    syncOfflineQueue,
    setSelectedTicketId,
    setCurrentScreen,
    acceptRequest,
    passRequest,
    postponeRequest,
  } = useApp();

  const currentEngineer = engineers[0];
  const [selectedTab, setSelectedTab] = useState<'OPEN_POOL' | 'MY_JOBS' | 'POSTPONED' | 'COMPLETED'>('OPEN_POOL');

  // Track expanded cards for collapsible details
  const [expandedTicketIds, setExpandedTicketIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (ticketId: string) => {
    setExpandedTicketIds((prev) => ({
      ...prev,
      [ticketId]: !prev[ticketId],
    }));
  };

  const [ticketToPass, setTicketToPass] = useState<ServiceTicket | null>(null);
  const [passReason, setPassReason] = useState('');
  const [ticketToPostpone, setTicketToPostpone] = useState<ServiceTicket | null>(null);
  const [postponeReason, setPostponeReason] = useState('');
  const [postponedUntil, setPostponedUntil] = useState('Today at 4:00 PM');

  const openPoolJobs = tickets.filter(
    (t) => t.status === 'RAISED' || (!t.assignedEngineerId && t.status !== 'CLOSED')
  );
  const myActiveJobs = tickets.filter(
    (t) =>
      t.assignedEngineerId === currentEngineer.id &&
      (t.status === 'ACCEPTED' || t.status === 'ASSIGNED' || t.status === 'EN_ROUTE' || t.status === 'IN_PROGRESS' || t.status === 'RESOLVED')
  );
  const postponedJobs = tickets.filter(
    (t) => (t.assignedEngineerId === currentEngineer.id || t.status === 'POSTPONED') && t.status === 'POSTPONED'
  );
  const completedJobs = tickets.filter(
    (t) => t.assignedEngineerId === currentEngineer.id && t.status === 'CLOSED'
  );

  const displayedJobs =
    selectedTab === 'OPEN_POOL' ? openPoolJobs
    : selectedTab === 'MY_JOBS' ? myActiveJobs
    : selectedTab === 'POSTPONED' ? postponedJobs
    : completedJobs;

  const handleConfirmPass = () => {
    if (!ticketToPass) return;
    passRequest(ticketToPass.id, currentEngineer.id, passReason.trim());
    setTicketToPass(null);
    setPassReason('');
  };

  const handleConfirmPostpone = () => {
    if (!ticketToPostpone || !postponeReason.trim()) return;
    postponeRequest(ticketToPostpone.id, postponeReason.trim(), postponedUntil.trim());
    setTicketToPostpone(null);
    setPostponeReason('');
  };

  const handleOpenGoogleMaps = (tkt: ServiceTicket) => {
    const matchedCustomer = customers.find((c) => c.id === tkt.customerId);
    const destinationQuery = matchedCustomer
      ? `${matchedCustomer.name}, ${matchedCustomer.address}, ${matchedCustomer.city}`
      : `${tkt.customerName}, ${tkt.siteName}`;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destinationQuery)}`;
    Linking.openURL(url).catch((err) => console.warn('Cannot open maps:', err));
  };

  const tabs = [
    { key: 'OPEN_POOL',  label: 'Open Pool', count: openPoolJobs.length },
    { key: 'MY_JOBS',    label: 'My Active', count: myActiveJobs.length },
    { key: 'POSTPONED',  label: 'Postponed', count: postponedJobs.length },
    { key: 'COMPLETED',  label: 'Completed', count: completedJobs.length },
  ] as const;

  // Helper for human-readable stage progress (Stage X of 4)
  const getStageInfo = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return { step: 'Stage 1 of 4', label: 'Ready to Depart', icon: '⚡' };
      case 'EN_ROUTE':
        return { step: 'Stage 2 of 4', label: 'En Route to Site', icon: '🚗' };
      case 'IN_PROGRESS':
        return { step: 'Stage 3 of 4', label: 'On-Site Diagnostics', icon: '🔧' };
      case 'RESOLVED':
        return { step: 'Stage 4 of 4', label: 'Awaiting Handover Sign-off', icon: '🔑' };
      case 'RAISED':
        return { step: 'Open Pool', label: 'Claim Required', icon: '📋' };
      default:
        return { step: 'Completed', label: 'FSR Signed & Closed', icon: '✓' };
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-[#f8fafc]"
      contentContainerStyle={{ padding: 16, paddingBottom: 110, gap: 16 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* ── 1. Page Header & Profile ────────────────────────────────────── */}
      <View className="flex-row items-center justify-between pt-1 pb-1">
        <View className="flex-1 pr-2">
          <Text className="text-2xl font-black text-[#0f2930] tracking-tight">
            Service Board
          </Text>
          <Text className="text-xs text-slate-500 font-medium mt-0.5" numberOfLines={1}>
            {currentEngineer.name} ({currentEngineer.code})
          </Text>
        </View>

        <Pressable
          onPress={toggleOfflineMode}
          className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full border ${
            isOffline ? 'bg-amber-50 border-amber-200' : 'bg-teal-50 border-[#007b8a]/20'
          }`}
        >
          {isOffline ? <WifiOff size={13} color="#d97706" /> : <Wifi size={13} color="#007b8a" />}
          <Text className={`text-xs font-bold ${isOffline ? 'text-amber-900' : 'text-[#007b8a]'}`}>
            {isOffline ? 'Offline' : 'Online'}
          </Text>
        </Pressable>
      </View>

      {/* ── 2. Compact Summary Bar (Replaces bulky cards) ──────────────── */}
      <View className="bg-white rounded-2xl p-3 border border-slate-200/80 flex-row items-center justify-around shadow-xs">
        {[
          { key: 'OPEN_POOL', label: 'Open', count: openPoolJobs.length, color: 'text-emerald-700' },
          { key: 'MY_JOBS', label: 'Active', count: myActiveJobs.length, color: 'text-[#007b8a]' },
          { key: 'POSTPONED', label: 'On Hold', count: postponedJobs.length, color: 'text-amber-700' },
          { key: 'COMPLETED', label: 'Completed', count: completedJobs.length, color: 'text-slate-600' },
        ].map((item, idx) => {
          const isSelected = selectedTab === item.key;
          return (
            <Pressable
              key={item.label}
              onPress={() => setSelectedTab(item.key as any)}
              className={`flex-1 items-center py-1 rounded-xl ${
                isSelected ? 'bg-slate-100/80' : ''
              }`}
            >
              <Text className={`text-lg font-extrabold ${item.color}`}>{item.count}</Text>
              <Text className={`text-[11px] font-semibold mt-0.5 ${isSelected ? 'text-[#0f2930] font-bold' : 'text-slate-500'}`}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* ── 3. Compact Parts & Reagents Action Bar ─────────────────────── */}
      <Pressable
        onPress={() => setCurrentScreen('product-ordering')}
        className="flex-row items-center justify-between bg-white border border-slate-200/80 rounded-2xl px-4 py-3 shadow-xs"
      >
        <View className="flex-row items-center gap-2.5">
          <View className="w-7 h-7 rounded-lg bg-[#e6f4f6] items-center justify-center">
            <Package size={15} color="#007b8a" />
          </View>
          <View>
            <Text className="text-xs font-bold text-[#0f2930]">Parts & Reagents Desk</Text>
            <Text className="text-[11px] text-slate-500 font-medium">Request replacement components</Text>
          </View>
        </View>
        <View className="flex-row items-center gap-1">
          <Text className="text-xs font-bold text-[#007b8a]">Order</Text>
          <ArrowRight size={14} color="#007b8a" />
        </View>
      </Pressable>

      {/* ── Offline Alert Banner ────────────────────────────────────────── */}
      {isOffline && (
        <View className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2.5 flex-1 pr-2">
            <WifiOff size={16} color="#d97706" />
            <View className="flex-1">
              <Text className="text-xs font-bold text-amber-950">
                Offline Mode ({offlineQueue.length} queued)
              </Text>
            </View>
          </View>
          {offlineQueue.length > 0 && (
            <Pressable
              onPress={syncOfflineQueue}
              className="px-3 py-1.5 bg-amber-500 rounded-xl"
            >
              <Text className="text-xs font-bold text-white">Sync</Text>
            </Pressable>
          )}
        </View>
      )}

      {/* ── 4. Navigation Tabs ──────────────────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row"
        contentContainerStyle={{ gap: 8 }}
      >
        {tabs.map((tab) => {
          const isActive = selectedTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setSelectedTab(tab.key)}
              className={`px-4 py-2 rounded-xl flex-row items-center gap-1.5 border ${
                isActive
                  ? 'bg-[#007b8a] border-[#007b8a]'
                  : 'bg-white border-slate-200'
              }`}
            >
              <Text className={`text-xs font-bold ${isActive ? 'text-white' : 'text-slate-700'}`}>
                {tab.label}
              </Text>
              <View className={`px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20' : 'bg-slate-100'}`}>
                <Text className={`text-[10px] font-bold ${isActive ? 'text-white' : 'text-slate-500'}`}>
                  {tab.count}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* ── 5. Job Cards List (Clean Hierarchy & Progressive Disclosure) ─── */}
      {displayedJobs.length === 0 ? (
        <View className="p-10 items-center bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <View className="w-12 h-12 rounded-xl bg-[#e6f4f6] items-center justify-center mb-3">
            <CheckCircle2 size={28} color="#007b8a" />
          </View>
          <Text className="text-base font-bold text-[#0f2930]">No Jobs in this View</Text>
          <Text className="text-xs text-slate-500 text-center mt-1 max-w-xs">
            No service orders listed under {tabs.find((t) => t.key === selectedTab)?.label}.
          </Text>
        </View>
      ) : (
        displayedJobs.map((tkt) => {
          const hasPassed = (tkt.passedEngineerIds || []).includes(currentEngineer.id);
          const isOpenPoolItem = selectedTab === 'OPEN_POOL' || tkt.status === 'RAISED';
          const pColor = priorityColors[tkt.priority] || priorityColors.LOW;
          const isExpanded = !!expandedTicketIds[tkt.id];
          const stageInfo = getStageInfo(tkt.status);

          return (
            <View
              key={tkt.id}
              className={`bg-white rounded-2xl border border-slate-200/90 p-4 space-y-3.5 shadow-xs ${
                hasPassed ? 'opacity-70' : ''
              }`}
            >
              {/* Top Row: Ticket ID, Priority, Status */}
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Text className="font-mono text-xs font-bold text-[#007b8a] bg-[#e6f4f6] px-2.5 py-1 rounded-lg">
                    {tkt.ticketNumber}
                  </Text>
                  <View className={`px-2 py-0.5 rounded-md border ${pColor.badgeBg}`}>
                    <Text className={`text-[10px] font-bold uppercase ${pColor.text}`}>
                      {tkt.priority}
                    </Text>
                  </View>
                </View>
                <TicketStatusBadge status={tkt.status} isOfflineQueued={tkt.isOfflineQueued} />
              </View>

              {/* Main Section: Hospital Name, Site, Machine */}
              <View className="space-y-1">
                <Text className="text-lg font-extrabold text-[#0f2930] leading-snug">
                  {tkt.customerName}
                </Text>
                <View className="flex-row items-center gap-1.5">
                  <MapPin size={13} color="#64748b" />
                  <Text className="text-xs font-semibold text-slate-500">
                    {tkt.siteName}
                  </Text>
                </View>

                {/* Machine Model Pill */}
                <View className="flex-row items-center gap-2 pt-1.5">
                  <View className="px-2.5 py-1 bg-slate-100 rounded-lg flex-row items-center gap-1.5 border border-slate-200/60">
                    <Cpu size={13} color="#007b8a" />
                    <Text className="text-xs font-bold text-slate-800">
                      {tkt.machineModel}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Issue / Symptom Summary (Clean 1-line glance) */}
              {tkt.faultDescription ? (
                <View className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <Text className="text-xs text-slate-700 font-medium" numberOfLines={2}>
                    <Text className="font-bold text-slate-900">Issue: </Text>
                    {tkt.faultDescription}
                  </Text>
                </View>
              ) : null}

              {/* Simple Progress Stepper Component */}
              <View className="bg-[#f8fafc] px-3 py-2 rounded-xl border border-slate-200/60 flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Text className="text-xs font-bold text-[#007b8a]">{stageInfo.icon}</Text>
                  <View>
                    <Text className="text-[10px] font-bold text-slate-400 uppercase">{stageInfo.step}</Text>
                    <Text className="text-xs font-bold text-[#0f2930]">{stageInfo.label}</Text>
                  </View>
                </View>
              </View>

              {/* Collapsible Details Drawer */}
              {isExpanded && (
                <View className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 pt-2">
                  <View className="flex-row justify-between py-1 border-b border-slate-200/60">
                    <Text className="text-[11px] font-bold text-slate-400 uppercase">Serial Number</Text>
                    <Text className="text-xs font-mono font-bold text-slate-800">{tkt.machineSerial}</Text>
                  </View>
                  <View className="flex-row justify-between py-1 border-b border-slate-200/60">
                    <Text className="text-[11px] font-bold text-slate-400 uppercase">Contact Lead</Text>
                    <Text className="text-xs font-bold text-slate-800">{tkt.contactName}</Text>
                  </View>
                  <View className="flex-row justify-between py-1">
                    <Text className="text-[11px] font-bold text-slate-400 uppercase">OTP Verification</Text>
                    <Text className="text-xs font-mono font-bold text-[#007b8a]">{tkt.otp}</Text>
                  </View>
                </View>
              )}

              {/* Expand Toggle */}
              <Pressable
                onPress={() => toggleExpand(tkt.id)}
                className="flex-row items-center justify-center gap-1 py-1"
              >
                <Text className="text-xs font-semibold text-slate-500">
                  {isExpanded ? 'Hide Details' : 'View Details'}
                </Text>
                {isExpanded ? (
                  <ChevronUp size={14} color="#64748b" />
                ) : (
                  <ChevronDown size={14} color="#64748b" />
                )}
              </Pressable>

              {/* Action Buttons Hierarchy */}
              <View className="pt-1 space-y-2 border-t border-slate-100">
                {isOpenPoolItem ? (
                  <View className="space-y-2">
                    <Pressable
                      onPress={() => acceptRequest(tkt.id, currentEngineer.id)}
                      className="min-h-[46px] bg-[#007b8a] active:bg-[#00606b] rounded-xl items-center justify-center flex-row gap-2"
                    >
                      <Check size={16} color="#ffffff" />
                      <Text className="text-white text-xs font-bold">Accept & Claim Job</Text>
                    </Pressable>

                    <View className="flex-row gap-2">
                      <Pressable
                        onPress={() => {
                          setTicketToPass(tkt);
                          setPassReason('');
                        }}
                        className="flex-1 min-h-[42px] bg-slate-100 active:bg-slate-200 rounded-xl items-center justify-center flex-row gap-1.5"
                      >
                        <Forward size={14} color="#334155" />
                        <Text className="text-slate-700 text-xs font-bold">Pass</Text>
                      </Pressable>

                      <Pressable
                        onPress={() => {
                          setTicketToPostpone(tkt);
                          setPostponeReason(tkt.postponeReason || '');
                        }}
                        className="flex-1 min-h-[42px] bg-amber-50 active:bg-amber-100 border border-amber-200 rounded-xl items-center justify-center flex-row gap-1.5"
                      >
                        <Clock size={14} color="#d97706" />
                        <Text className="text-amber-900 text-xs font-bold">Postpone</Text>
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  <View className="flex-row items-center gap-2">
                    <Pressable
                      onPress={() => Linking.openURL(`tel:${tkt.contactPhone}`)}
                      className="min-h-[44px] px-3.5 rounded-xl bg-slate-100 active:bg-slate-200 flex-row items-center justify-center gap-1.5"
                    >
                      <Phone size={15} color="#334155" />
                      <Text className="text-xs font-bold text-slate-700">Call</Text>
                    </Pressable>

                    <Pressable
                      onPress={() => handleOpenGoogleMaps(tkt)}
                      className="min-h-[44px] px-3.5 rounded-xl bg-slate-100 active:bg-slate-200 flex-row items-center justify-center gap-1.5"
                    >
                      <Navigation size={15} color="#334155" />
                      <Text className="text-xs font-bold text-slate-700">Navigate</Text>
                    </Pressable>

                    <Pressable
                      onPress={() => {
                        setSelectedTicketId(tkt.id);
                        setCurrentScreen('job-detail');
                      }}
                      className="min-h-[44px] flex-1 rounded-xl bg-[#007b8a] active:bg-[#00606b] flex-row items-center justify-center gap-1.5"
                    >
                      <Text className="text-white text-xs font-bold">
                        {selectedTab === 'COMPLETED' ? 'View FSR' : 'Open Job'}
                      </Text>
                      <ArrowRight size={15} color="#ffffff" />
                    </Pressable>
                  </View>
                )}
              </View>
            </View>
          );
        })
      )}

      {/* Pass Modal */}
      {ticketToPass && (
        <Modal
          isOpen={!!ticketToPass}
          onClose={() => setTicketToPass(null)}
          title={`Pass Call ${ticketToPass.ticketNumber}`}
          subtitle={`${ticketToPass.machineModel} • ${ticketToPass.customerName}`}
        >
          <View className="space-y-4">
            <View className="p-3.5 bg-slate-100 border border-slate-300 rounded-2xl flex-row items-center gap-2.5">
              <Forward size={18} color="#475569" />
              <Text className="text-xs font-medium text-slate-800 flex-1 leading-relaxed">
                Passing leaves this request available in the pool for other field engineers.
              </Text>
            </View>

            <View className="space-y-2">
              <Text className="text-xs font-bold text-slate-700">Select Reason</Text>
              <View className="gap-2">
                {[
                  'Occupied with active breakdown call',
                  'Parts not readily available in vehicle',
                  'Outside current geographical zone',
                  'Shift ending soon',
                ].map((reason) => (
                  <Pressable
                    key={reason}
                    onPress={() => setPassReason(reason)}
                    className={`p-3 rounded-xl border ${
                      passReason === reason
                        ? 'bg-[#007b8a] border-[#007b8a]'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <Text className={`text-xs font-bold ${passReason === reason ? 'text-white' : 'text-slate-700'}`}>
                      {reason}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <TextInput
              value={passReason}
              onChangeText={setPassReason}
              placeholder="Or add custom note..."
              className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
            />

            <View className="pt-3 border-t border-slate-100 flex-row items-center justify-end gap-2.5">
              <Pressable
                onPress={() => setTicketToPass(null)}
                className="flex-1 py-3.5 border border-slate-200 rounded-xl items-center"
              >
                <Text className="text-slate-600 text-xs font-bold">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleConfirmPass}
                className="flex-1 py-3.5 bg-[#007b8a] rounded-xl items-center"
              >
                <Text className="text-white text-xs font-bold">Confirm Pass</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}

      {/* Postpone Modal */}
      {ticketToPostpone && (
        <Modal
          isOpen={!!ticketToPostpone}
          onClose={() => setTicketToPostpone(null)}
          title={`Postpone ${ticketToPostpone.ticketNumber}`}
          subtitle={`${ticketToPostpone.machineModel} • ${ticketToPostpone.customerName}`}
        >
          <View className="space-y-4">
            <View className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex-row items-center gap-2.5">
              <Clock size={18} color="#d97706" />
              <Text className="text-xs font-medium text-amber-900 flex-1 leading-relaxed">
                Hospital management will receive an automated alert for the rescheduled window.
              </Text>
            </View>

            <View className="space-y-2">
              <Text className="text-xs font-bold text-slate-700">Select Postponement Reason</Text>
              <View className="gap-2">
                {[
                  'Awaiting OT / Cath Lab slot access',
                  'Waiting for spare part arrival',
                  'Prior critical breakdown extended',
                  'Customer requested time shift',
                ].map((reason) => (
                  <Pressable
                    key={reason}
                    onPress={() => setPostponeReason(reason)}
                    className={`p-3 rounded-xl border ${
                      postponeReason === reason
                        ? 'bg-amber-600 border-amber-600'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <Text className={`text-xs font-bold ${postponeReason === reason ? 'text-white' : 'text-slate-700'}`}>
                      {reason}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View>
              <Text className="text-xs font-bold text-slate-700 mb-1.5">Rescheduled Target Time</Text>
              <TextInput
                value={postponedUntil}
                onChangeText={setPostponedUntil}
                placeholder="e.g. Today at 5:00 PM, Tomorrow 9:00 AM"
                className="px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
              />
            </View>

            <View>
              <Text className="text-xs font-bold text-slate-700 mb-1.5">Explanation</Text>
              <TextInput
                value={postponeReason}
                onChangeText={setPostponeReason}
                placeholder="Describe reason..."
                multiline
                numberOfLines={3}
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 min-h-[70px]"
              />
            </View>

            <View className="pt-3 border-t border-slate-100 flex-row items-center justify-end gap-2.5">
              <Pressable
                onPress={() => setTicketToPostpone(null)}
                className="flex-1 py-3.5 border border-slate-200 rounded-xl items-center"
              >
                <Text className="text-slate-600 text-xs font-bold">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleConfirmPostpone}
                disabled={!postponeReason.trim()}
                className={`flex-1 py-3.5 rounded-xl items-center ${
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
