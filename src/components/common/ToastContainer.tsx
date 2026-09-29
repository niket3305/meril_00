import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react-native';

export const ToastContainer: React.FC = () => {
  const { notifications, dismissNotification } = useApp();

  if (notifications.length === 0) return null;

  return (
    <View className="absolute bottom-5 left-4 right-4 z-50 flex-col gap-2">
      {notifications.map((n) => {
        const icons = {
          success: <CheckCircle2 size={20} color="#10b981" />,
          error: <AlertCircle size={20} color="#f43f5e" />,
          warning: <AlertTriangle size={20} color="#f59e0b" />,
          info: <Info size={20} color="#3b82f6" />,
        };

        const borderColors = {
          success: 'border-emerald-200 bg-emerald-50 text-emerald-950',
          error: 'border-rose-200 bg-rose-50 text-rose-950',
          warning: 'border-amber-200 bg-amber-50 text-amber-950',
          info: 'border-blue-200 bg-blue-50 text-blue-950',
        };

        return (
          <View
            key={n.id}
            className={`flex-row items-start gap-3 p-3.5 rounded-xl border shadow-lg ${borderColors[n.type]}`}
          >
            {icons[n.type]}
            <Text className="text-xs font-medium leading-snug flex-1 text-slate-800">
              {n.message}
            </Text>
            <Pressable
              onPress={() => dismissNotification(n.id)}
              className="p-0.5"
            >
              <X size={16} color="#64748b" />
            </Pressable>
          </View>
        );
      })}
    </View>
  );
};
