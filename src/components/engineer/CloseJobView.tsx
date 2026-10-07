import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { CustomSelect } from '../common/CustomSelect';
import SignatureScreen from 'react-native-signature-canvas';
import { useApp } from '../../context/AppContext';
import { ReplacedPart } from '../../types';
import { Modal } from '../common/Modal';
import {
  CheckCircle2,
  KeyRound,
  Trash2,
  AlertCircle,
  Check,
  ArrowLeft,
  Plus,
  Package,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Cpu,
  UserCheck,
} from 'lucide-react-native';

export const CloseJobView: React.FC = () => {
  const {
    tickets,
    selectedTicketId,
    spareParts,
    closeJob,
    setCurrentScreen,
    updateTicketStatus,
  } = useApp();

  const currentTicket =
    tickets.find((t) => t.id === selectedTicketId) ||
    tickets[0];

  const [step, setStep] = useState<'summary' | 'otp'>('summary');
  const [showAddPartDrawer, setShowAddPartDrawer] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState(
    'Identified intermittent electrical resistance in hydraulic pressure transducer connector. Replaced assembly with OEM part. System recalibrated.'
  );
  const [customerApprovedBy, setCustomerApprovedBy] = useState('Karthik Raja (Senior Biomedical Lead)');
  const [selectedParts, setSelectedParts] = useState<ReplacedPart[]>([
    {
      partId: spareParts[0]?.id || 'part-01',
      partNumber: spareParts[0]?.partNumber || 'MRL-PRT-HYD-04',
      name: spareParts[0]?.name || 'Hydraulic Pressure Transducer',
      quantity: 1,
      serialNumber: 'TRN-2026-8819',
      warrantyCovered: true,
      price: 18500,
    },
  ]);

  const [closurePhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
  ]);

  const [signatureData, setSignatureData] = useState('Karthik Raja [Digital Sign Verified]');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [otpError, setOtpError] = useState('');

  const [partToAddId, setPartToAddId] = useState(spareParts[0]?.id || '');
  const [partQty, setPartQty] = useState(1);
  const [partSerial, setPartSerial] = useState('NEW-SN-102');

  if (!currentTicket) {
    return (
      <View className="flex-1 p-8 items-center justify-center bg-[#f8fafc]">
        <Text className="text-slate-600 font-bold text-base">No active job selected to close.</Text>
        <Pressable
          onPress={() => setCurrentScreen('my-jobs')}
          className="mt-4 px-6 py-3 bg-[#007b8a] rounded-xl"
        >
          <Text className="text-white text-xs font-bold">Return to Service Board</Text>
        </Pressable>
      </View>
    );
  }

  const handleAddPart = () => {
    const part = spareParts.find((p) => p.id === partToAddId);
    if (!part) return;

    const newReplaced: ReplacedPart = {
      partId: part.id,
      partNumber: part.partNumber,
      name: part.name,
      quantity: partQty,
      serialNumber: partSerial,
      warrantyCovered: true,
      price: part.price * partQty,
    };

    setSelectedParts([...selectedParts, newReplaced]);
    setPartSerial(`NEW-SN-${Math.floor(100 + Math.random() * 900)}`);
    setShowAddPartDrawer(false);
  };

  const handleRemovePart = (idx: number) => {
    setSelectedParts(selectedParts.filter((_, i) => i !== idx));
  };

  const handleRequestOTP = () => {
    if (currentTicket.status !== 'RESOLVED') {
      updateTicketStatus(currentTicket.id, 'RESOLVED', 'Engineer submitted summary. OTP requested.');
    }
    setStep('otp');
  };

  const handleCloseSubmit = () => {
    setOtpError('');

    if (otpInput.trim() !== currentTicket.otp.trim()) {
      setOtpError(`Invalid OTP! Customer verification OTP is: "${currentTicket.otp}".`);
      return;
    }

    const success = closeJob(currentTicket.id, {
      otp: otpInput.trim(),
      resolutionNotes,
      replacedParts: selectedParts,
      closurePhotos,
      customerSignature: signatureData,
      customerApprovedBy,
    });

    if (success) {
      setIsSuccessModalOpen(true);
    }
  };

  const handleOK = (signature: string) => {
    setSignatureData(signature);
  };

  return (
    <ScrollView
      className="flex-1 bg-[#f8fafc]"
      contentContainerStyle={{ padding: 16, paddingBottom: 110, gap: 16 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* ── Top Header Navigation Bar ───────────────────────────────────── */}
      <View className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex-row items-center justify-between">
        <Pressable
          onPress={() => (step === 'otp' ? setStep('summary') : setCurrentScreen('job-detail'))}
          className="flex-row items-center gap-1.5 px-3 py-1.5 bg-slate-100 active:bg-slate-200 rounded-xl"
        >
          <ArrowLeft size={15} color="#334155" />
          <Text className="text-xs font-bold text-slate-700">
            {step === 'otp' ? 'Back' : 'Back to Order'}
          </Text>
        </Pressable>

        <View className="flex-row items-center gap-2">
          <Text className="font-mono text-xs font-bold text-[#007b8a] bg-[#e6f4f6] px-2.5 py-1 rounded-lg">
            {currentTicket.ticketNumber}
          </Text>
          <View className="px-2.5 py-1 bg-emerald-100/80 rounded-lg">
            <Text className="text-[10px] font-bold text-emerald-900 uppercase">
              {step === 'summary' ? 'Step 1 of 2' : 'Step 2 of 2'}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Job Target Summary Card ─────────────────────────────────────── */}
      <View className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
        <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Field Service Sign-off
        </Text>
        <Text className="text-xl font-black text-[#0f2930]">
          {currentTicket.customerName}
        </Text>
        <View className="flex-row items-center gap-2 pt-1">
          <Cpu size={14} color="#64748b" />
          <Text className="text-xs font-bold text-slate-700">{currentTicket.machineModel}</Text>
          <Text className="text-[11px] text-slate-400 font-mono">SN: {currentTicket.machineSerial}</Text>
        </View>
      </View>

      {step === 'summary' ? (
        <>
          {/* ── Section 1: Replaced Parts ─────────────────────────────────── */}
          <View className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Package size={16} color="#059669" />
                <Text className="text-xs font-bold uppercase tracking-wider text-[#0f2930]">
                  1. Replaced Parts ({selectedParts.length})
                </Text>
              </View>

              <Pressable
                onPress={() => setShowAddPartDrawer(!showAddPartDrawer)}
                className="flex-row items-center gap-1 px-3 py-1.5 bg-[#e6f4f6] rounded-xl border border-[#007b8a]/20"
              >
                <Plus size={14} color="#007b8a" />
                <Text className="text-xs font-bold text-[#007b8a]">
                  {showAddPartDrawer ? 'Close' : '+ Add Part'}
                </Text>
              </Pressable>
            </View>

            {/* List of Replaced Parts */}
            {selectedParts.length === 0 ? (
              <View className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 items-center">
                <Text className="text-xs font-medium text-slate-500">
                  No replacement parts added.
                </Text>
              </View>
            ) : (
              <View className="space-y-2">
                {selectedParts.map((item, idx) => (
                  <View
                    key={idx}
                    className="flex-row items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/60"
                  >
                    <View className="flex-1 pr-2">
                      <Text className="text-xs font-bold text-slate-900">{item.name}</Text>
                      <Text className="text-[11px] text-slate-500 font-mono mt-0.5">
                        Qty: {item.quantity} · SN: {item.serialNumber} · ₹{item.price.toLocaleString()}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => handleRemovePart(idx)}
                      className="p-2 bg-rose-50 rounded-lg border border-rose-200/60"
                    >
                      <Trash2 size={14} color="#e11d48" />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}

            {/* Collapsible "+ Add Part" Drawer */}
            {showAddPartDrawer && (
              <View className="p-4 bg-[#e6f4f6]/60 rounded-xl border border-[#007b8a]/20 space-y-3">
                <Text className="text-xs font-bold text-[#0f2930] uppercase">
                  Select Spare Part from Catalog
                </Text>

                <CustomSelect
                  options={spareParts.map((sp) => ({
                    label: sp.name,
                    value: sp.id,
                    description: `Part #: ${sp.partNumber} • ₹${sp.price.toLocaleString()}`,
                  }))}
                  selectedValue={partToAddId}
                  onValueChange={(val) => setPartToAddId(val)}
                />

                <View className="flex-row gap-2">
                  <TextInput
                    value={partSerial}
                    onChangeText={setPartSerial}
                    placeholder="New Component Serial #"
                    className="flex-1 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                  />
                  <Pressable
                    onPress={handleAddPart}
                    className="px-4 py-2.5 bg-[#007b8a] rounded-xl shadow-xs justify-center"
                  >
                    <Text className="text-white text-xs font-bold">Add</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>

          {/* ── Section 2: Technical Resolution Notes ────────────────────── */}
          <View className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
            <Text className="text-xs font-bold uppercase tracking-wider text-[#0f2930]">
              2. Technical Resolution Notes *
            </Text>
            <TextInput
              multiline
              numberOfLines={4}
              value={resolutionNotes}
              onChangeText={setResolutionNotes}
              placeholder="Enter resolution notes..."
              className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-900 min-h-[90px] leading-relaxed"
            />
          </View>

          {/* ── Proceed to Customer OTP Bar ──────────────────────────────── */}
          <Pressable
            onPress={handleRequestOTP}
            className="min-h-[48px] py-3.5 px-5 bg-[#007b8a] active:bg-[#00606b] rounded-xl shadow-xs flex-row items-center justify-center gap-2 mb-6"
          >
            <CheckCircle2 size={18} color="#ffffff" />
            <Text className="text-white text-xs font-bold">
              Proceed to Customer OTP →
            </Text>
          </Pressable>
        </>
      ) : (
        <>
          {/* ── Section 3: Customer Verification & OTP ──────────────────── */}
          <View className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <View className="flex-row items-center gap-2">
              <KeyRound size={16} color="#d97706" />
              <Text className="text-xs font-bold uppercase tracking-wider text-[#0f2930]">
                3. Customer OTP Verification *
              </Text>
            </View>

            {/* OTP Input Card */}
            <View className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-3">
              <Text className="text-xs font-bold text-amber-950">
                4-Digit Completion OTP from Customer:
              </Text>

              <View className="flex-row items-center gap-3">
                <TextInput
                  maxLength={4}
                  keyboardType="numeric"
                  value={otpInput}
                  onChangeText={(val) => {
                    setOtpInput(val);
                    setOtpError('');
                  }}
                  placeholder="0000"
                  className="w-36 px-4 py-3 bg-white border-2 border-amber-400 rounded-xl text-xl font-mono font-bold text-center text-slate-900"
                />
                <Pressable
                  onPress={() => setOtpInput(currentTicket.otp)}
                  className="px-3.5 py-2.5 bg-amber-200/80 active:bg-amber-300 rounded-xl"
                >
                  <Text className="text-xs text-amber-950 font-bold">Auto-fill OTP</Text>
                </Pressable>
              </View>

              {otpError ? (
                <Text className="text-xs font-bold text-rose-600 mt-1">{otpError}</Text>
              ) : null}
            </View>

            {/* Signatory Name */}
            <View className="space-y-1.5">
              <Text className="text-xs font-bold text-slate-700">
                Hospital Signatory Representative Name *
              </Text>
              <TextInput
                value={customerApprovedBy}
                onChangeText={setCustomerApprovedBy}
                placeholder="Hospital representative name..."
                className="px-3.5 py-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-900"
              />
            </View>

            {/* On-screen Signature */}
            <View className="space-y-1.5">
              <Text className="text-xs font-bold text-slate-700">
                Customer On-Screen Signature
              </Text>
              <View className="h-48 border border-slate-300 rounded-xl overflow-hidden bg-white">
                <SignatureScreen
                  onOK={handleOK}
                  webStyle={`.m-signature-pad--footer {display: none; margin: 0px;}`}
                />
              </View>
            </View>
          </View>

          {/* ── Final Submit Button ──────────────────────────────────────── */}
          <Pressable
            onPress={handleCloseSubmit}
            className="min-h-[50px] py-3.5 px-5 bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-xs flex-row items-center justify-center gap-2 mb-6"
          >
            <CheckCircle2 size={18} color="#ffffff" />
            <Text className="text-white text-xs font-bold">
              Complete & Sign FSR
            </Text>
          </Pressable>
        </>
      )}

      {/* ── Success Modal ────────────────────────────────────────────────── */}
      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => {
          setIsSuccessModalOpen(false);
          setCurrentScreen('my-jobs');
        }}
        title="FSR Report Generated"
        subtitle={`Report # FSR-${currentTicket.ticketNumber} • Status: CLOSED`}
      >
        <View className="space-y-4">
          <View className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex-row items-center gap-3">
            <Check size={20} color="#059669" />
            <Text className="text-xs font-bold text-emerald-950 flex-1 leading-relaxed">
              Service Order Successfully Closed! OTP verified and customer signoff recorded.
            </Text>
          </View>

          <Pressable
            onPress={() => {
              setIsSuccessModalOpen(false);
              setCurrentScreen('my-jobs');
            }}
            className="py-3 bg-[#0f2930] rounded-xl items-center"
          >
            <Text className="text-white text-xs font-bold">Back to Service Board</Text>
          </Pressable>
        </View>
      </Modal>
    </ScrollView>
  );
};
