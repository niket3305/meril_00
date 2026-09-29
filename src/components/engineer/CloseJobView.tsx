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
} from 'lucide-react-native';

export const CloseJobView: React.FC = () => {
  const {
    tickets,
    selectedTicketId,
    spareParts,
    closeJob,
    setCurrentScreen,
    setCurrentRole,
    isOffline,
    updateTicketStatus,
  } = useApp();

  const currentTicket =
    tickets.find((t) => t.id === selectedTicketId) ||
    tickets[0];

  const [step, setStep] = useState<'summary' | 'otp'>('summary');
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
      <View className="flex-1 p-8 items-center justify-center">
        <Text className="text-slate-500 text-sm">No active job selected to close.</Text>
        <Pressable
          onPress={() => setCurrentScreen('my-jobs')}
          className="mt-4 px-4 py-2 bg-emerald-700 rounded-xl"
        >
          <Text className="text-white text-xs font-bold">Return to My Jobs</Text>
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
      setOtpError(`Invalid OTP! Customer OTP is: "${currentTicket.otp}".`);
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
    <ScrollView className="flex-1 bg-slate-50 p-4 space-y-6" keyboardShouldPersistTaps="handled">
      {/* Top Banner - Topic Only */}
      <View className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex-row items-center justify-between">
        <Text className="text-xl font-black text-slate-900 tracking-tight">
          Field Service Closure & Sign-off
        </Text>
        <Pressable onPress={() => setCurrentScreen('job-detail')} className="px-3 py-1.5 bg-slate-100 rounded-xl">
          <Text className="text-xs font-bold text-slate-600">← Back</Text>
        </Pressable>
      </View>

      {step === 'summary' ? (
        <>
          {/* Section 1: Parts Replaced */}
          <View className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
            <Text className="text-xs font-bold uppercase text-slate-400">
              1. Replaced Parts ({selectedParts.length})
            </Text>

            <View className="space-y-2">
              {selectedParts.map((item, idx) => (
                <View
                  key={idx}
                  className="flex-row items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200"
                >
                  <View className="flex-1 pr-2">
                    <Text className="text-xs font-bold text-slate-900">{item.name}</Text>
                    <Text className="text-[10px] text-slate-500">
                      Qty: {item.quantity} • SN: {item.serialNumber} • ₹{item.price.toLocaleString()}
                    </Text>
                  </View>
                  <Pressable onPress={() => handleRemovePart(idx)} className="p-1">
                    <Trash2 size={16} color="#f87171" />
                  </Pressable>
                </View>
              ))}
            </View>

            {/* Add Part Sub-Bar */}
            <View className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 space-y-2">
              <Text className="text-[11px] font-bold text-blue-900 uppercase">+ Add Part</Text>

              <CustomSelect
                options={spareParts.map((sp) => ({
                  label: sp.name,
                  value: sp.id,
                  description: `Part #: ${sp.partNumber} • ₹${sp.price.toLocaleString()} • In Stock: ${sp.stockQty}`,
                }))}
                selectedValue={partToAddId}
                onValueChange={(val) => setPartToAddId(val)}
              />

              <View className="flex-row gap-2">
                <TextInput
                  value={partSerial}
                  onChangeText={setPartSerial}
                  placeholder="Component SN"
                  className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                />
                <Pressable onPress={handleAddPart} className="px-4 py-2 bg-blue-700 rounded-xl">
                  <Text className="text-white text-xs font-bold">Add</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Section 2: Technical Resolution Notes */}
          <View className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
            <Text className="text-xs font-bold uppercase text-slate-400">2. Technical Resolution Notes *</Text>
            <TextInput
              multiline
              numberOfLines={3}
              value={resolutionNotes}
              onChangeText={setResolutionNotes}
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 min-h-[70px]"
            />
          </View>

          {/* Submit Summary & Request OTP Bar */}
          <Pressable
            onPress={handleRequestOTP}
            className="py-3.5 px-6 bg-blue-700 rounded-2xl shadow-lg flex-row items-center justify-center gap-2 mb-8"
          >
            <CheckCircle2 size={20} color="#ffffff" />
            <Text className="text-white text-xs font-bold">Submit Summary & Request OTP</Text>
          </Pressable>
        </>
      ) : (
        <>
          {/* Section 3: Customer Verification OTP */}
          <View className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
            <Text className="text-xs font-bold uppercase text-slate-400">3. Verification & Sign-off *</Text>

            {/* OTP Input Card */}
            <View className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
              <View className="flex-row items-center gap-1.5">
                <KeyRound size={16} color="#d97706" />
                <Text className="text-xs font-bold text-amber-950 uppercase">
                  Enter 4-Digit Customer OTP
                </Text>
              </View>

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
                  className="w-32 px-3 py-2 bg-white border-2 border-amber-300 rounded-xl text-lg font-mono font-black text-center text-slate-900"
                />
                <Pressable onPress={() => setOtpInput(currentTicket.otp)}>
                  <Text className="text-xs text-amber-700 underline font-semibold">Auto-fill OTP</Text>
                </Pressable>
              </View>

              {otpError ? (
                <Text className="text-xs font-bold text-rose-600">{otpError}</Text>
              ) : null}
            </View>

            {/* Customer Name & Signature */}
            <View className="space-y-3">
              <View>
                <Text className="text-xs font-bold text-slate-700 mb-1">Signatory Representative *</Text>
                <TextInput
                  value={customerApprovedBy}
                  onChangeText={setCustomerApprovedBy}
                  className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </View>

              <View>
                <Text className="text-xs font-bold text-slate-700 mb-1">Customer On-Screen Signature</Text>
                <View className="h-36 border border-slate-300 rounded-xl overflow-hidden bg-white">
                  <SignatureScreen
                    onOK={handleOK}
                    webStyle={`.m-signature-pad--footer {display: none; margin: 0px;}`}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Final Submit Bar */}
          <Pressable
            onPress={handleCloseSubmit}
            className="py-3.5 px-6 bg-emerald-700 rounded-2xl shadow-lg flex-row items-center justify-center gap-2 mb-8"
          >
            <CheckCircle2 size={20} color="#ffffff" />
            <Text className="text-white text-xs font-bold">Complete & Sign Field Service Report</Text>
          </Pressable>
        </>
      )}

      {/* Success Modal */}
      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => {
          setIsSuccessModalOpen(false);
          setCurrentScreen('my-jobs');
        }}
        title="Field Service Report Generated"
        subtitle={`Report # FSR-${currentTicket.ticketNumber} • Status: CLOSED`}
      >
        <View className="space-y-4">
          <View className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex-row items-center gap-3">
            <Check size={24} color="#059669" />
            <Text className="text-xs font-bold text-emerald-950 flex-1">
              Service Order Successfully Closed! OTP verified.
            </Text>
          </View>

          <Pressable
            onPress={() => {
              setIsSuccessModalOpen(false);
              setCurrentScreen('my-jobs');
            }}
            className="py-3 bg-slate-900 rounded-xl items-center"
          >
            <Text className="text-white text-xs font-bold">Back to My Jobs</Text>
          </Pressable>
        </View>
      </Modal>
    </ScrollView>
  );
};
