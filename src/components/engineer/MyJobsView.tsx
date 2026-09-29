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
} from 'lucide-react-native';

/* ─── Priority color map ──────────────────────────────────────────────────── */
const priorityColors: Record<string, { bar: string; bg: string; text: string }> = {
  CRITICAL: { bar: 'bg-rose-500',   bg: 'bg-rose-50',   text: 'text-rose-700'  },
  HIGH:     { bar: 'bg-orange-500', bg: 'bg-orange-50', text: 'text-orange-700' },
  MEDIUM:   { bar: 'bg-amber-400',  bg: 'bg-amber-50',  text: 'text-amber-700'  },
  LOW:      { bar: 'bg-emerald-400',bg: 'bg-emerald-50',text: 'text-emerald-700'},
};

export const MyJobsView: React.FC = () => {
  const {
    tickets,
    engineers,
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
      (t.status === 'ACCEPTED' || t.status === 'ASSIGNED' || t.status === 'EN_ROUTE' || t.status === 'IN_PROGRESS')
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

  /* ─── Tabs config ─────────────────────────────────────────────────────── */
  const tabs = [
    { key: 'OPEN_POOL',  label: 'Open Pool', count: openPoolJobs.length,  activeColor: 'text-emerald-800' },
    { key: 'MY_JOBS',    label: 'My Active', count: myActiveJobs.length,   activeColor: 'text-blue-800'    },
    { key: 'POSTPONED',  label: 'Postponed', count: postponedJobs.length,  activeColor: 'text-amber-700'   },
    { key: 'COMPLETED',  label: 'Done',      count: completedJobs.length,  activeColor: 'text-slate-700'   },
  ] as const;

  return (
    <ScrollView className="flex-1 bg-slate-100" contentContainerStyle={{ padding: 12, paddingBottom: 40, gap: 12 }} keyboardShouldPersistTaps="handled">

      {/* ── Header Card ─────────────────────────────────────────────────── */}
      <View className="bg-emerald-900 rounded-3xl p-4 space-y-3 shadow-md">
        {/* Top row */}
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-lg font-black text-white leading-tight">Field Service Board</Text>
            <Text className="text-xs text-emerald-300 font-medium mt-0.5" numberOfLines={1}>
              {currentEngineer.name} · {currentEngineer.code}
            </Text>
          </View>
          <Pressable
            onPress={toggleOfflineMode}
            className={`flex-row items-center gap-1.5 px-3 py-2 rounded-xl ${isOffline ? 'bg-amber-400' : 'bg-emerald-800 border border-emerald-700'}`}
          >
            {isOffline ? <WifiOff size={13} color="#78350f" /> : <Wifi size={13} color="#6ee7b7" />}
            <Text className={`text-xs font-bold ${isOffline ? 'text-amber-950' : 'text-emerald-100'}`}>
              {isOffline ? 'Offline' : 'Online'}
            </Text>
          </Pressable>
        </View>

        {/* Stats strip */}
        <View className="flex-row bg-emerald-800/60 rounded-2xl overflow-hidden">
          {[
            { label: 'Open Pool', value: openPoolJobs.length, color: 'text-emerald-300' },
            { label: 'My Active', value: myActiveJobs.length, color: 'text-blue-300' },
            { label: 'Postponed', value: postponedJobs.length, color: 'text-amber-300' },
            { label: 'Done', value: completedJobs.length, color: 'text-slate-300' },
          ].map((s, i) => (
            <View key={s.label} className={`flex-1 py-3 items-center ${i > 0 ? 'border-l border-emerald-700' : ''}`}>
              <Text className={`text-xl font-black ${s.color}`}>{s.value}</Text>
              <Text className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider mt-0.5">{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Parts Desk shortcut */}
        <Pressable
          onPress={() => setCurrentScreen('product-ordering')}
          className="flex-row items-center justify-between bg-emerald-800 border border-emerald-700 rounded-2xl px-4 py-3"
        >
          <View className="flex-row items-center gap-2.5">
            <Package size={16} color="#6ee7b7" />
            <Text className="text-xs font-bold text-white">Product & Parts Desk</Text>
          </View>
          <ArrowRight size={14} color="#6ee7b7" />
        </Pressable>
      </View>

      {/* ── Offline Alert ────────────────────────────────────────────────── */}
      {isOffline && (
        <View className="p-3 rounded-2xl bg-amber-50 border border-amber-300 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2 flex-1 pr-2">
            <WifiOff size={15} color="#d97706" />
            <Text className="text-xs font-bold text-amber-900">
              Offline Mode — {offlineQueue.length} action{offlineQueue.length !== 1 ? 's' : ''} queued
            </Text>
          </View>
          {offlineQueue.length > 0 && (
            <Pressable onPress={syncOfflineQueue} className="px-3 py-1.5 bg-amber-400 rounded-xl">
              <Text className="text-xs font-black text-amber-950">Sync Now</Text>
            </Pressable>
          )}
        </View>
      )}

      {/* ── Filter Tabs ──────────────────────────────────────────────────── */}
      <View className="flex-row bg-white rounded-2xl p-1 border border-slate-200 shadow-xs">
        {tabs.map((tab) => {
          const isActive = selectedTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setSelectedTab(tab.key)}
              className={`flex-1 py-2.5 items-center rounded-xl ${isActive ? 'bg-slate-900' : ''}`}
            >
              <Text className={`text-[11px] font-black ${isActive ? 'text-white' : 'text-slate-400'}`}>
                {tab.label}
              </Text>
              <Text className={`text-[10px] font-bold mt-0.5 ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                ({tab.count})
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* ── Job Cards ────────────────────────────────────────────────────── */}
      {displayedJobs.length === 0 ? (
        <View className="p-10 items-center bg-white rounded-2xl border border-slate-200">
          <CheckCircle2 size={32} color="#10b981" />
          <Text className="text-sm font-bold text-slate-700 mt-3">No requests in this tab</Text>
        </View>
      ) : (
        displayedJobs.map((tkt) => {
          const hasPassed = (tkt.passedEngineerIds || []).includes(currentEngineer.id);
          const isOpenPoolItem = selectedTab === 'OPEN_POOL' || tkt.status === 'RAISED';
          const pColor = priorityColors[tkt.priority] || priorityColors.LOW;

          return (
            <View
              key={tkt.id}
              className={`bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs ${hasPassed ? 'opacity-70' : ''}`}
            >
              {/* Priority color bar */}
              <View className={`h-1 w-full ${pColor.bar}`} />

              <View className="p-4 space-y-3">
                {/* Row 1: Ticket # + Status badge */}
                <View className="flex-row items-center justify-between">
                  <Text className="font-mono text-xs font-black text-blue-700">{tkt.ticketNumber}</Text>
                  <TicketStatusBadge status={tkt.status} isOfflineQueued={tkt.isOfflineQueued} />
                </View>

                {/* Row 2: Machine model + Priority pill */}
                <View className="flex-row items-start justify-between gap-2">
                  <View className="flex-1">
                    <Text className="text-sm font-black text-slate-900 leading-tight" numberOfLines={2}>
                      {tkt.machineModel}
                    </Text>
                    <Text className="text-[10px] text-slate-500 font-mono mt-0.5">SN: {tkt.machineSerial}</Text>
                  </View>
                  <View className={`px-2.5 py-1 rounded-full ${pColor.bg}`}>
                    <Text className={`text-[10px] font-black ${pColor.text}`}>{tkt.priority}</Text>
                  </View>
                </View>

                {/* Row 3: Site info */}
                <View className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5">
                  <View className="flex-row items-center gap-2">
                    <Hospital size={13} color="#475569" />
                    <Text className="text-xs font-bold text-slate-800 flex-1" numberOfLines={1}>
                      {tkt.customerName}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <MapPin size={13} color="#94a3b8" />
                    <Text className="text-xs text-slate-500 flex-1" numberOfLines={1}>
                      {tkt.siteName}
                    </Text>
                  </View>
                  <Text className="text-[11px] text-slate-600 leading-relaxed" numberOfLines={2}>
                    {tkt.faultDescription}
                  </Text>

                  {hasPassed && (
                    <View className="flex-row items-center gap-1.5 mt-0.5">
                      <AlertCircle size={11} color="#94a3b8" />
                      <Text className="text-[10px] text-slate-400 font-semibold">You passed on this request</Text>
                    </View>
                  )}
                  {tkt.postponeReason && (
                    <View className="flex-row items-center gap-1.5 mt-0.5">
                      <Clock size={11} color="#d97706" />
                      <Text className="text-[10px] text-amber-700 font-semibold flex-1" numberOfLines={1}>
                        {tkt.postponeReason}{tkt.postponedUntil ? ` · ${tkt.postponedUntil}` : ''}
                      </Text>
                    </View>
                  )}
                </View>

                {/* ── Open Pool Action Buttons ────────────────────────── */}
                {isOpenPoolItem && (
                  <View className="space-y-2">
                    {/* Accept full-width */}
                    <Pressable
                      onPress={() => acceptRequest(tkt.id, currentEngineer.id)}
                      className="w-full py-3 bg-emerald-700 rounded-xl flex-row items-center justify-center gap-2"
                    >
                      <Check size={15} color="#fff" />
                      <Text className="text-white text-xs font-black">Accept & Claim</Text>
                    </Pressable>

                    {/* Pass + Postpone side by side */}
                    <View className="flex-row gap-2">
                      <Pressable
                        onPress={() => { setTicketToPass(tkt); setPassReason(''); }}
                        className="flex-1 py-2.5 bg-slate-700 rounded-xl flex-row items-center justify-center gap-1.5"
                      >
                        <Forward size={14} color="#fff" />
                        <Text className="text-white text-[11px] font-bold">Pass</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => { setTicketToPostpone(tkt); setPostponeReason(''); }}
                        className="flex-1 py-2.5 bg-amber-600 rounded-xl flex-row items-center justify-center gap-1.5"
                      >
                        <Clock size={14} color="#fff" />
                        <Text className="text-white text-[11px] font-bold">Postpone</Text>
                      </Pressable>
                    </View>
                  </View>
                )}

                {/* ── Footer: Call + View Details ────────────────────── */}
                <View className="flex-row items-center justify-between pt-2 border-t border-slate-100">
                  <Pressable
                    onPress={() => Linking.openURL(`tel:${tkt.contactPhone}`)}
                    className="flex-row items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    <Phone size={13} color="#047857" />
                    <Text className="text-xs font-bold text-emerald-700">Call</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => { setSelectedTicketId(tkt.id); setCurrentScreen('job-detail'); }}
                    className="flex-row items-center gap-1.5 px-4 py-2 bg-emerald-700 rounded-xl"
                  >
                    <Text className="text-white text-xs font-bold">View Details</Text>
                    <ArrowRight size={13} color="#fff" />
                  </Pressable>
                </View>
              </View>
            </View>
          );
        })
      )}

      {/* ── Pass Modal ───────────────────────────────────────────────────── */}
      {ticketToPass && (
        <Modal
          isOpen={!!ticketToPass}
          onClose={() => setTicketToPass(null)}
          title={`Pass ${ticketToPass.ticketNumber}`}
          subtitle={`${ticketToPass.machineModel} · ${ticketToPass.customerName}`}
        >
          <View className="space-y-4">
            <View className="p-3 bg-slate-100 border border-slate-300 rounded-xl flex-row items-start gap-2">
              <Forward size={16} color="#475569" />
              <Text className="text-xs font-medium text-slate-700 flex-1">
                Passing leaves this request in the open pool for other engineers or Admin dispatch.
              </Text>
            </View>

            <View className="space-y-2">
              <Text className="text-xs font-bold text-slate-700">Quick Reason</Text>
              <View className="gap-1.5">
                {[
                  'Occupied with active breakdown',
                  'Parts not in vehicle',
                  'Outside current zone',
                  'Shift ending soon',
                ].map((reason) => (
                  <Pressable
                    key={reason}
                    onPress={() => setPassReason(reason)}
                    className={`px-3 py-2.5 rounded-xl border ${passReason === reason ? 'bg-slate-800 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
                  >
                    <Text className={`text-xs font-semibold ${passReason === reason ? 'text-white' : 'text-slate-700'}`}>{reason}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <TextInput
              value={passReason}
              onChangeText={setPassReason}
              placeholder="Or type a custom reason..."
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
            />

            <View className="flex-row gap-2 pt-2 border-t border-slate-100">
              <Pressable onPress={() => setTicketToPass(null)} className="flex-1 py-3 border border-slate-200 rounded-xl items-center">
                <Text className="text-xs font-bold text-slate-600">Cancel</Text>
              </Pressable>
              <Pressable onPress={handleConfirmPass} className="flex-1 py-3 bg-slate-800 rounded-xl items-center">
                <Text className="text-white text-xs font-bold">Confirm Pass</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}

      {/* ── Postpone Modal ───────────────────────────────────────────────── */}
      {ticketToPostpone && (
        <Modal
          isOpen={!!ticketToPostpone}
          onClose={() => setTicketToPostpone(null)}
          title={`Postpone ${ticketToPostpone.ticketNumber}`}
          subtitle={`${ticketToPostpone.machineModel} · ${ticketToPostpone.customerName}`}
        >
          <View className="space-y-4">
            <View className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex-row items-start gap-2">
              <Clock size={16} color="#d97706" />
              <Text className="text-xs font-medium text-amber-900 flex-1">
                Hospital management will be notified of the delayed service window.
              </Text>
            </View>

            <View className="space-y-2">
              <Text className="text-xs font-bold text-slate-700">Quick Reason</Text>
              <View className="gap-1.5">
                {[
                  'Awaiting OT / Cath Lab slot',
                  'Waiting for spare part',
                  'Prior critical call extended',
                  'Customer requested time shift',
                ].map((reason) => (
                  <Pressable
                    key={reason}
                    onPress={() => setPostponeReason(reason)}
                    className={`px-3 py-2.5 rounded-xl border ${postponeReason === reason ? 'bg-amber-500 border-amber-500' : 'bg-slate-50 border-slate-200'}`}
                  >
                    <Text className={`text-xs font-semibold ${postponeReason === reason ? 'text-white' : 'text-slate-700'}`}>{reason}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View>
              <Text className="text-xs font-bold text-slate-700 mb-1.5">Rescheduled Target Time</Text>
              <TextInput
                value={postponedUntil}
                onChangeText={setPostponedUntil}
                placeholder="e.g. Today at 5:00 PM"
                className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
              />
            </View>

            <View>
              <Text className="text-xs font-bold text-slate-700 mb-1.5">Explanation</Text>
              <TextInput
                value={postponeReason}
                onChangeText={setPostponeReason}
                placeholder="Describe reason for postponement..."
                multiline
                numberOfLines={3}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </View>

            <View className="flex-row gap-2 pt-2 border-t border-slate-100">
              <Pressable onPress={() => setTicketToPostpone(null)} className="flex-1 py-3 border border-slate-200 rounded-xl items-center">
                <Text className="text-xs font-bold text-slate-600">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleConfirmPostpone}
                disabled={!postponeReason.trim()}
                className={`flex-1 py-3 rounded-xl items-center ${postponeReason.trim() ? 'bg-amber-600' : 'bg-slate-200'}`}
              >
                <Text className={`text-xs font-bold ${postponeReason.trim() ? 'text-white' : 'text-slate-400'}`}>Confirm Postpone</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
};
