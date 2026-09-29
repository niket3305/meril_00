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
          <View className="flex-row items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-xl">
            <ShieldCheck size={14} color="#1d4ed8" />
            <Text className="text-xs font-bold text-blue-900">Admin</Text>
          </View>
        );
      case 'engineer':
        return (
          <View className="flex-row items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-xl">
            <Wrench size={14} color="#d97706" />
            <Text className="text-xs font-bold text-amber-900">Engineer</Text>
          </View>
        );
      case 'customer':
      default:
        return (
          <View className="flex-row items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-xl">
            <Building2 size={14} color="#059669" />
            <Text className="text-xs font-bold text-emerald-900">Customer</Text>
          </View>
        );
    }
  };

  return (
    <View className="bg-white border-b border-slate-200 px-4 py-3 shadow-xs">
      <View className="flex-row items-center justify-between">
        {/* Logo & Brand */}
        <View className="flex-row items-center gap-2.5 flex-1 min-w-0 mr-2">
          <View className="w-10 h-10 rounded-xl bg-blue-800 flex-row items-center justify-center shadow-md">
            <Activity size={20} color="#7dd3fc" />
          </View>
          <View className="flex-row items-center gap-1.5">
            <Text className="text-lg font-black tracking-tight text-slate-900">MERIL</Text>
            <View className="px-1.5 py-0.5 rounded bg-blue-100">
              <Text className="text-[10px] font-semibold text-blue-800 tracking-wide uppercase">
                FSM Hub
              </Text>
            </View>
          </View>
        </View>

        {/* Right Actions: Logged In User Info / Sign Out / Reset */}
        <View className="flex-row items-center gap-2 shrink-0">
          {isLoggedIn ? (
            <>
              {getRoleBadge()}

              {/* Sign Out Button */}
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
                className="min-h-[40px] px-2.5 py-1.5 flex-row items-center gap-1.5 bg-rose-50 border border-rose-200 rounded-xl"
              >
                <LogOut size={14} color="#e11d48" />
                <Text className="text-xs font-bold text-rose-700">Sign Out</Text>
              </Pressable>
            </>
          ) : (
            /* Reset Demo Data Button when in login/demo state */
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
              className="min-h-[40px] min-w-[40px] px-2.5 items-center justify-center bg-slate-100 rounded-xl"
            >
              <RotateCcw size={16} color="#64748b" />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
};
