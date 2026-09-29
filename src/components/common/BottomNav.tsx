import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useApp } from '../../context/AppContext';
import { ScreenId } from '../../context/AppContext';
import {
  ShieldCheck,
  Building2,
  Cpu,
  Monitor,
  PlusCircle,
  Clock,
  Wrench,
  ShoppingBag,
} from 'lucide-react-native';

export const BottomNav: React.FC = () => {
  const { currentRole, currentScreen, setCurrentScreen, tickets } = useApp();

  const pendingDispatchCount = tickets.filter((t) => t.status === 'RAISED').length;

  if (currentRole === 'admin') {
    const tabs: { id: ScreenId; label: string; icon: any; badge?: number }[] = [
      { id: 'request-queue', label: 'Request Queue', icon: ShieldCheck, badge: pendingDispatchCount },
      { id: 'customers', label: 'Customers', icon: Building2 },
      { id: 'machines', label: 'Machines', icon: Cpu },
    ];

    return (
      <View className="bg-white border-t border-slate-200 px-2 py-2 flex-row items-center justify-around shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentScreen === tab.id;
          return (
            <Pressable
              key={tab.id}
              onPress={() => setCurrentScreen(tab.id)}
              className={`flex-1 items-center py-1.5 px-1 rounded-xl ${
                isActive ? 'bg-blue-50' : ''
              }`}
            >
              <View className="relative">
                <Icon size={20} color={isActive ? '#1d4ed8' : '#64748b'} />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <View className="absolute -top-1.5 -right-3 px-1.5 py-0.2 bg-rose-500 rounded-full">
                    <Text className="text-[9px] font-bold text-white">{tab.badge}</Text>
                  </View>
                )}
              </View>
              <Text
                className={`text-[11px] font-bold mt-1 ${
                  isActive ? 'text-blue-900' : 'text-slate-500'
                }`}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  }

  if (currentRole === 'customer') {
    const tabs: { id: ScreenId; label: string; icon: any }[] = [
      { id: 'my-machines', label: 'My Equipment', icon: Monitor },
      { id: 'raise-request', label: 'Raise Request', icon: PlusCircle },
      { id: 'request-status', label: 'Timeline Status', icon: Clock },
    ];

    return (
      <View className="bg-white border-t border-slate-200 px-2 py-2 flex-row items-center justify-around shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentScreen === tab.id;
          return (
            <Pressable
              key={tab.id}
              onPress={() => setCurrentScreen(tab.id)}
              className={`flex-1 items-center py-1.5 px-1 rounded-xl ${
                isActive ? 'bg-emerald-50' : ''
              }`}
            >
              <Icon size={20} color={isActive ? '#059669' : '#64748b'} />
              <Text
                className={`text-[11px] font-bold mt-1 ${
                  isActive ? 'text-emerald-900' : 'text-slate-500'
                }`}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  }

  if (currentRole === 'engineer') {
    const isJobActive = currentScreen === 'my-jobs' || currentScreen === 'job-detail' || currentScreen === 'close-job';
    const tabs: { id: ScreenId; label: string; icon: any; isActive: boolean }[] = [
      { id: 'my-jobs', label: 'Job Board', icon: Wrench, isActive: isJobActive },
      { id: 'product-ordering', label: 'Parts Desk', icon: ShoppingBag, isActive: currentScreen === 'product-ordering' },
    ];

    return (
      <View className="bg-white border-t border-slate-200 px-2 py-2 flex-row items-center justify-around shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Pressable
              key={tab.id}
              onPress={() => setCurrentScreen(tab.id)}
              className={`flex-1 items-center py-1.5 px-1 rounded-xl ${
                tab.isActive ? 'bg-amber-50' : ''
              }`}
            >
              <Icon size={20} color={tab.isActive ? '#d97706' : '#64748b'} />
              <Text
                className={`text-[11px] font-bold mt-1 ${
                  tab.isActive ? 'text-amber-900' : 'text-slate-500'
                }`}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  }

  return null;
};
