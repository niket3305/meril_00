import React from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { useApp } from '../../context/AppContext';
import {
  Activity,
  ShieldCheck,
  Building2,
  Wrench,
  LogOut,
  RotateCcw,
} from 'lucide-react-native';

export const Header: React.FC = () => {
  const {
    currentRole,
    currentUser,
    isLoggedIn,
    logout,
    resetAllData,
  } = useApp();

  const getRoleBadge = () => {
    switch (currentRole) {
      case 'admin':
        return (
          <View className="flex-row items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200/60 rounded-full">
            <ShieldCheck size={13} color="#1d4ed8" />
            <Text className="text-xs font-semibold text-blue-900">Admin</Text>
          </View>
        );
      case 'engineer':
        return (
          <View className="flex-row items-center gap-1.5 px-2.5 py-1 bg-[#e6f4f6] border border-[#007b8a]/20 rounded-full">
            <Wrench size={13} color="#007b8a" />
            <Text className="text-xs font-bold text-[#007b8a]">Engineer</Text>
          </View>
        );
      case 'customer':
      default:
        return (
          <View className="flex-row items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200/60 rounded-full">
            <Building2 size={13} color="#059669" />
            <Text className="text-xs font-semibold text-emerald-900">Customer</Text>
          </View>
        );
    }
  };

  return (
    <View className="bg-white border-b border-slate-200/80 px-4 py-2.5">
      <View className="flex-row items-center justify-between">
        {/* Logo & Brand */}
        <View className="flex-row items-center gap-2 flex-1 min-w-0">
          <View className="w-8 h-8 rounded-lg bg-[#007b8a] flex-row items-center justify-center">
            <Activity size={17} color="#ffffff" />
          </View>
          <View className="flex-row items-center gap-1.5">
            <Text className="text-base font-black tracking-tight text-[#0f2930]">MERIL</Text>
            <Text className="text-xs text-slate-400 font-medium">|</Text>
            {getRoleBadge()}
          </View>
        </View>

        {/* Right Actions */}
        <View className="flex-row items-center gap-2 shrink-0">
          {isLoggedIn ? (
            <Pressable
              onPress={() => {
                Alert.alert(
                  'Sign Out',
                  'Are you sure you want to sign out?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Sign Out', style: 'destructive', onPress: logout },
                  ]
                );
              }}
              accessibilityLabel="Sign Out"
              className="px-3 py-1.5 flex-row items-center gap-1.5 bg-slate-100 active:bg-slate-200 rounded-lg"
            >
              <LogOut size={13} color="#64748b" />
              <Text className="text-xs font-semibold text-slate-700">Sign Out</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => {
                Alert.alert(
                  'Reset Demo Data',
                  'Reset all demo data back to default state?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Reset', style: 'destructive', onPress: resetAllData },
                  ]
                );
              }}
              accessibilityLabel="Reset demo data"
              className="w-8 h-8 items-center justify-center bg-slate-100 rounded-lg"
            >
              <RotateCcw size={15} color="#64748b" />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
};
