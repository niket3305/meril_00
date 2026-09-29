import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
import { Modal } from './Modal';

export interface SelectOption {
  label: string;
  value: string;
  description?: string;
}

interface CustomSelectProps {
  label?: string;
  options: SelectOption[];
  selectedValue: string;
  onValueChange: (value: any) => void;
  placeholder?: string;
  className?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  options,
  selectedValue,
  onValueChange,
  placeholder = 'Select an option',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === selectedValue);

  return (
    <View className={`space-y-1 ${className}`}>
      {label && <Text className="text-xs font-bold text-slate-700 mb-1">{label}</Text>}

      <Pressable
        onPress={() => setIsOpen(true)}
        className="px-3.5 py-3 bg-white border border-slate-200 rounded-xl flex-row items-center justify-between shadow-xs active:bg-slate-50"
      >
        <View className="flex-1 pr-2">
          <Text className="text-xs font-bold text-slate-900" numberOfLines={1}>
            {selectedOption ? selectedOption.label : placeholder}
          </Text>
          {selectedOption?.description && (
            <Text className="text-[10px] text-slate-500 font-medium" numberOfLines={1}>
              {selectedOption.description}
            </Text>
          )}
        </View>
        <ChevronDown size={16} color="#64748b" />
      </Pressable>

      {isOpen && (
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title={label || 'Select Facility / Option'}
        >
          <ScrollView className="max-h-80 space-y-2 py-1">
            {options.map((opt) => {
              const isSelected = opt.value === selectedValue;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => {
                    onValueChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`p-3.5 rounded-xl border flex-row items-center justify-between mb-2 ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-400'
                      : 'bg-white border-slate-200 active:bg-slate-50'
                  }`}
                >
                  <View className="flex-1 pr-3">
                    <Text className={`text-xs font-bold ${isSelected ? 'text-emerald-950' : 'text-slate-900'}`}>
                      {opt.label}
                    </Text>
                    {opt.description && (
                      <Text className="text-[11px] text-slate-500 mt-0.5">{opt.description}</Text>
                    )}
                  </View>
                  {isSelected && <Check size={16} color="#059669" />}
                </Pressable>
              );
            })}
          </ScrollView>
        </Modal>
      )}
    </View>
  );
};
