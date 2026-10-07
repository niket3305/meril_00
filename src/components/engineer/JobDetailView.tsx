import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Linking, Platform } from 'react-native';
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
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Hospital,
  Cpu,
  Package,
  ArrowLeft,
  Send,
  Camera,
  MapPin,
  User,
  ShieldCheck,
  Navigation,
  ExternalLink,
  Sparkles,
  RotateCcw,
} from 'lucide-react-native';

export const JobDetailView: React.FC = () => {
  const {
    tickets,
    engineers,
    customers,
    selectedTicketId,
    updateTicketStatus,
    addTicketNote,
    acceptRequest,
    passRequest,
    postponeRequest,
    setCurrentScreen,
    isOffline,
  } = useApp();

  const currentEngineer = engineers[0];
  const [notesInput, setNotesInput] = useState('');

  // Collapsible dropdown states
  const [showLocationDetails, setShowLocationDetails] = useState(false);
  const [showSymptomDetails, setShowSymptomDetails] = useState(true);
  const [showBroadcastPanel, setShowBroadcastPanel] = useState(false);
  const [showLiveMap, setShowLiveMap] = useState(true);

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
      <View className="flex-1 p-8 items-center justify-center bg-[#f8fafc]">
        <Text className="text-slate-600 font-bold text-base">No active job selected.</Text>
        <Pressable
          onPress={() => setCurrentScreen('my-jobs')}
          className="mt-4 px-6 py-3 bg-[#007b8a] rounded-xl"
        >
          <Text className="text-white text-xs font-bold">Return to Service Board</Text>
        </Pressable>
      </View>
    );
  }

  // Find customer facility address
  const matchedCustomer = customers.find((c) => c.id === currentTicket.customerId);
  const destinationQuery = matchedCustomer
    ? `${matchedCustomer.name}, ${matchedCustomer.address}, ${matchedCustomer.city}`
    : `${currentTicket.customerName}, ${currentTicket.siteName}`;

  const googleMapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(destinationQuery)}&hl=en&z=15&output=embed`;
  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destinationQuery)}`;

  const handleOpenGoogleMapsNav = () => {
    Linking.openURL(googleMapsDirectionsUrl).catch((err) => {
      console.warn('Cannot open maps:', err);
    });
  };

  // Execution Stage Handlers - Fully Clickable & Seamless Transition
  const handleStageClick = (targetStage: 'ACCEPTED' | 'EN_ROUTE' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED') => {
    if (targetStage === 'CLOSED') {
      setCurrentScreen('close-job');
      return;
    }

    let note = '';
    if (targetStage === 'ACCEPTED') {
      if (currentTicket.status !== 'RAISED' && currentTicket.status !== 'ASSIGNED') return;
      note = 'Service call accepted from beginning. Ready for departure.';
      acceptRequest(currentTicket.id, currentEngineer.id, note);
      return;
    } else if (targetStage === 'EN_ROUTE') {
      note = 'Field specialist departed and is en route to site via corridor navigation.';
    } else if (targetStage === 'IN_PROGRESS') {
      note = 'Specialist arrived on-site at Cath Lab / OT. Calibration and diagnostic routines active.';
    } else if (targetStage === 'RESOLVED') {
      note = 'On-site service and calibration completed. Handover OTP requested from customer.';
    }

    updateTicketStatus(currentTicket.id, targetStage, note);
  };

  const handleRestartLifecycle = () => {
    handleStageClick('ACCEPTED');
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
    'Completed checks',
    'Transducer replaced',
    'Calibration passed',
    'Ready for handover',
  ];

  // Stage states for Stepper
  const status = currentTicket.status;
  const isEnRouteActive = status === 'EN_ROUTE';
  const isInProgressActive = status === 'IN_PROGRESS';
  const isResolvedActive = status === 'RESOLVED';
  const isClosedActive = status === 'CLOSED';

  const isEnRouteCompleted = isInProgressActive || isResolvedActive || isClosedActive;
  const isInProgressCompleted = isResolvedActive || isClosedActive;
  const isResolvedCompleted = isClosedActive;

  return (
    <ScrollView
      className="flex-1 bg-[#f8fafc]"
      contentContainerStyle={{ padding: 16, paddingBottom: 110, gap: 16 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* ── Top Header Navigation Bar ───────────────────────────────────── */}
      <View className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex-row items-center justify-between">
        <Pressable
          onPress={() => setCurrentScreen('my-jobs')}
          className="flex-row items-center gap-1.5 px-3 py-1.5 bg-slate-100 active:bg-slate-200 rounded-xl"
        >
          <ArrowLeft size={15} color="#334155" />
          <Text className="text-xs font-bold text-slate-700">Back</Text>
        </Pressable>

        <View className="flex-row items-center gap-2">
          <Text className="font-mono text-xs font-bold text-[#007b8a] bg-[#e6f4f6] px-2.5 py-1 rounded-lg">
            {currentTicket.ticketNumber}
          </Text>
          <TicketStatusBadge status={currentTicket.status} isOfflineQueued={currentTicket.isOfflineQueued} />
        </View>
      </View>

      {/* ── Core Hospital Work Order Card ─────────────────────────────── */}
      <View className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        {/* Row 1: Hospital Name & Quick Call Action */}
        <View className="flex-row items-start justify-between gap-3 pb-3 border-b border-slate-100">
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <PriorityBadge priority={currentTicket.priority} />
            </View>
            <Text className="text-xl font-black text-[#0f2930] mt-1.5 leading-snug">
              {currentTicket.customerName}
            </Text>
            <Text className="text-xs font-semibold text-slate-500 mt-0.5">
              {currentTicket.siteName}
            </Text>
          </View>

          <Pressable
            onPress={() => Linking.openURL(`tel:${currentTicket.contactPhone}`)}
            className="min-h-[42px] px-3.5 py-2 bg-[#007b8a] active:bg-[#00606b] rounded-xl flex-row items-center gap-1.5 shadow-xs"
          >
            <Phone size={14} color="#ffffff" />
            <Text className="text-white text-xs font-bold">Call Lead</Text>
          </Pressable>
        </View>

        {/* Row 2: Machine Model Summary */}
        <View className="flex-row items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200/60">
          <View className="flex-row items-center gap-2 flex-1 pr-2">
            <View className="w-8 h-8 rounded-lg bg-[#e6f4f6] items-center justify-center border border-[#007b8a]/20">
              <Cpu size={16} color="#007b8a" />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-bold text-[#0f2930]">{currentTicket.machineModel}</Text>
              <Text className="text-[11px] text-slate-500 font-mono">SN: {currentTicket.machineSerial}</Text>
            </View>
          </View>

          <View className="px-2.5 py-1 bg-[#e6f4f6] rounded-lg border border-[#007b8a]/20">
            <Text className="text-[10px] font-bold text-[#007b8a]">Meril OEM</Text>
          </View>
        </View>

        {/* ── GOOGLE MAPS INTEGRATION: Live Site & GPS Navigation ───────── */}
        <View className="rounded-xl border border-slate-200/80 overflow-hidden bg-slate-50">
          <View className="p-3 bg-white border-b border-slate-100 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <MapPin size={15} color="#007b8a" />
              <View>
                <Text className="text-xs font-bold text-[#0f2930]">
                  Google Maps Site Navigation
                </Text>
              </View>
            </View>
            <Pressable
              onPress={() => setShowLiveMap(!showLiveMap)}
              className="px-2.5 py-1 bg-slate-100 rounded-lg"
            >
              <Text className="text-[11px] font-bold text-[#007b8a]">
                {showLiveMap ? 'Hide Map' : 'Show Map'}
              </Text>
            </Pressable>
          </View>

          {showLiveMap && (
            <View className="p-3 space-y-3 bg-white">
              <View className="h-64 w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                {Platform.OS === 'web' ? (
                  // @ts-ignore
                  <iframe
                    title="Google Maps Engineer Route"
                    src={googleMapEmbedUrl}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    allowFullScreen
                    loading="lazy"
                  />
                ) : (
                  <Image
                    source={{
                      uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&auto=format&fit=crop&q=80',
                    }}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                  />
                )}
              </View>

              <View className="flex-row items-center justify-between pt-1 gap-2">
                <View className="flex-1">
                  <Text className="text-xs font-bold text-[#0f2930]">
                    📍 {currentTicket.siteName || 'Apollo Cath Lab 2'}
                  </Text>
                  <Text className="text-[11px] text-slate-500 mt-0.5">
                    Est. Transit: ~20 mins • 3.4 km
                  </Text>
                </View>

                <Pressable
                  onPress={handleOpenGoogleMapsNav}
                  className="px-3.5 py-2.5 bg-[#007b8a] active:bg-[#00606b] rounded-xl flex-row items-center gap-1.5 shadow-xs"
                >
                  <Navigation size={14} color="#ffffff" />
                  <Text className="text-white text-xs font-bold">Navigate 🧭</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        {/* ── Collapsible Section: Breakdown Symptoms ──────────── */}
        <View className="rounded-xl border border-slate-200/80 overflow-hidden bg-slate-50">
          <Pressable
            onPress={() => setShowSymptomDetails(!showSymptomDetails)}
            className="flex-row items-center justify-between px-3.5 py-2.5 bg-slate-100/70 active:bg-slate-200/60"
          >
            <View className="flex-row items-center gap-2">
              <AlertCircle size={15} color="#d97706" />
              <Text className="text-xs font-bold text-[#0f2930]">
                Symptom Notes & Media
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Text className="text-[11px] font-semibold text-slate-500">
                {showSymptomDetails ? 'Hide' : 'Expand'}
              </Text>
              {showSymptomDetails ? (
                <ChevronUp size={15} color="#64748b" />
              ) : (
                <ChevronDown size={15} color="#64748b" />
              )}
            </View>
          </Pressable>

          {showSymptomDetails && (
            <View className="p-3.5 space-y-3 bg-white border-t border-slate-200">
              <Text className="text-xs text-slate-800 font-medium leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                {currentTicket.faultDescription || 'No detailed breakdown description provided.'}
              </Text>

              {currentTicket.photos && currentTicket.photos.length > 0 && (
                <View className="flex-row gap-2.5 pt-1">
                  {currentTicket.photos.map((p, i) => (
                    <Image
                      key={i}
                      source={{ uri: p }}
                      style={{ width: 72, height: 72, borderRadius: 8 }}
                      contentFit="cover"
                    />
                  ))}
                </View>
              )}
            </View>
          )}
        </View>

        {/* Parts Order Direct Shortcut */}
        <Pressable
          onPress={() => setCurrentScreen('product-ordering')}
          className="p-3 bg-[#e6f4f6] border border-[#007b8a]/20 rounded-xl flex-row items-center justify-between"
        >
          <View className="flex-row items-center gap-2.5 flex-1 pr-2">
            <Package size={16} color="#007b8a" />
            <Text className="text-xs font-bold text-[#0f2930]">Order Replacement Parts</Text>
          </View>
          <Text className="text-xs font-bold text-[#007b8a]">Order Desk →</Text>
        </Pressable>
      </View>

      {/* ── Open Pool / Claim Decision Bar ──────────────────────────────── */}
      {(isOpenPoolItem || isAssignedToMe || isAccepted) && (
        <View className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
          <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Work Order Claim & Action
          </Text>

          <View className="flex-row gap-2">
            <Pressable
              onPress={() => handleStageClick('ACCEPTED')}
              className={`flex-1 min-h-[46px] py-2.5 px-3 rounded-xl flex-row items-center justify-center gap-1.5 ${
                isAccepted
                  ? 'bg-[#e6f4f6] border border-[#007b8a]/30'
                  : 'bg-[#007b8a] active:bg-[#00606b] shadow-xs'
              }`}
            >
              <Check size={16} color={isAccepted ? '#007b8a' : '#ffffff'} />
              <Text className={`text-xs font-bold ${isAccepted ? 'text-[#007b8a]' : 'text-white'}`}>
                {isAccepted ? 'Accepted' : 'Accept & Claim Job'}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setShowPassModal(true)}
              className="min-h-[46px] py-2.5 px-3 bg-slate-100 active:bg-slate-200 rounded-xl flex-row items-center justify-center gap-1"
            >
              <Forward size={15} color="#334155" />
              <Text className="text-slate-700 text-xs font-bold">Pass</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setPostponeReason(currentTicket.postponeReason || '');
                setShowPostponeModal(true);
              }}
              className="min-h-[46px] py-2.5 px-3 bg-amber-50 active:bg-amber-100 border border-amber-200 rounded-xl flex-row items-center justify-center"
            >
              <Clock size={15} color="#d97706" />
            </Pressable>
          </View>
        </View>
      )}

      {/* ── LIVE JOB EXECUTION STEPS ─────────────────────────────────── */}
      <View className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Wrench size={18} color="#007b8a" />
            <Text className="text-base font-extrabold text-[#0f2930]">Execution Stepper</Text>
          </View>
          
          <Pressable
            onPress={handleRestartLifecycle}
            className="flex-row items-center gap-1 px-2.5 py-1 bg-slate-100 active:bg-slate-200 rounded-lg"
          >
            <RotateCcw size={12} color="#007b8a" />
            <Text className="text-[11px] font-bold text-[#007b8a]">Reset</Text>
          </Pressable>
        </View>

        <View className="space-y-2.5">
          {/* Step 1: En Route */}
          <Pressable
            onPress={() => handleStageClick('EN_ROUTE')}
            className={`p-3.5 rounded-xl border ${
              isEnRouteActive
                ? 'bg-[#e6f4f6] border-[#007b8a]'
                : isEnRouteCompleted
                ? 'bg-slate-50 border-emerald-300'
                : 'bg-white border-slate-200'
            }`}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2.5">
                <Truck size={16} color={isEnRouteActive ? '#007b8a' : '#64748b'} />
                <Text className="text-xs font-extrabold text-[#0f2930]">Stage 1: Depart & En Route</Text>
              </View>
              <Text className="text-xs font-bold text-[#007b8a]">
                {isEnRouteActive ? 'In Transit' : isEnRouteCompleted ? '✓' : 'Start →'}
              </Text>
            </View>
          </Pressable>

          {/* Step 2: In Progress */}
          <Pressable
            onPress={() => handleStageClick('IN_PROGRESS')}
            className={`p-3.5 rounded-xl border ${
              isInProgressActive
                ? 'bg-emerald-50 border-emerald-500'
                : isInProgressCompleted
                ? 'bg-slate-50 border-emerald-300'
                : 'bg-white border-slate-200'
            }`}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2.5">
                <Wrench size={16} color={isInProgressActive ? '#059669' : '#64748b'} />
                <Text className="text-xs font-extrabold text-[#0f2930]">Stage 2: Arrive & Diagnostics</Text>
              </View>
              <Text className="text-xs font-bold text-emerald-800">
                {isInProgressActive ? 'Active' : isInProgressCompleted ? '✓' : 'Arrive →'}
              </Text>
            </View>
          </Pressable>

          {/* Step 3: Repair Resolved */}
          <Pressable
            onPress={() => handleStageClick('RESOLVED')}
            className={`p-3.5 rounded-xl border ${
              isResolvedActive
                ? 'bg-amber-50 border-amber-500'
                : isResolvedCompleted
                ? 'bg-slate-50 border-emerald-300'
                : 'bg-white border-slate-200'
            }`}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2.5">
                <CheckCircle2 size={16} color={isResolvedActive ? '#d97706' : '#64748b'} />
                <Text className="text-xs font-extrabold text-[#0f2930]">Stage 3: Mark Resolved</Text>
              </View>
              <Text className="text-xs font-bold text-amber-900">
                {isResolvedActive ? 'Awaiting OTP' : isResolvedCompleted ? '✓' : 'Resolve →'}
              </Text>
            </View>
          </Pressable>

          {/* Step 4: Final Sign-off & FSR */}
          <Pressable
            onPress={() => handleStageClick('CLOSED')}
            className="p-3.5 rounded-xl border bg-[#007b8a] active:bg-[#00606b] border-[#007b8a]"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2.5">
                <FileCheck size={16} color="#ffffff" />
                <Text className="text-xs font-extrabold text-white">Stage 4: Close Job & Sign FSR</Text>
              </View>
              <Text className="text-xs font-bold text-white">Proceed →</Text>
            </View>
          </Pressable>
        </View>

        {/* Live Broadcast Panel */}
        <View className="pt-2 border-t border-slate-100 space-y-2">
          <Text className="text-[11px] font-bold text-slate-500 uppercase">Send Live Update to Customer</Text>
          <View className="flex-row gap-2">
            <TextInput
              value={notesInput}
              onChangeText={setNotesInput}
              placeholder="Type diagnostic update..."
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
            />
            <Pressable
              onPress={() => {
                if (notesInput.trim()) {
                  addTicketNote(currentTicket.id, notesInput);
                  setNotesInput('');
                }
              }}
              className="px-4 py-2 bg-[#007b8a] rounded-xl justify-center"
            >
              <Text className="text-white text-xs font-bold">Send</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};
