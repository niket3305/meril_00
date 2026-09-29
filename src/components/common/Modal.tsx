import React from 'react';
import { View, Text, Modal as RNModal, Pressable, ScrollView } from 'react-native';
import { X } from 'lucide-react-native';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
}) => {
  return (
    <RNModal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center p-4 bg-slate-900/60">
        <Pressable className="absolute inset-0" onPress={onClose} />

        <View className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 max-h-[85%]">
          {/* Header */}
          <View className="px-5 py-4 border-b border-slate-100 flex-row items-start justify-between bg-slate-50">
            <View className="flex-1 pr-2">
              <Text className="text-base font-bold text-slate-900">{title}</Text>
              {subtitle && <Text className="text-xs text-slate-500 mt-0.5">{subtitle}</Text>}
            </View>
            <Pressable
              onPress={onClose}
              className="p-1 text-slate-400 rounded-lg"
            >
              <X size={20} color="#64748b" />
            </Pressable>
          </View>

          {/* Scrollable Content */}
          <ScrollView className="p-5" keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        </View>
      </View>
    </RNModal>
  );
};
