import React from 'react';
import { View, Text } from 'react-native';
import { TicketStatus, TicketPriority, WarrantyType, MachineStatus } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 rounded-md font-medium',
    md: 'text-xs px-2.5 py-1 rounded-full font-semibold',
    lg: 'text-sm px-3 py-1.5 rounded-full font-semibold',
  };

  const variantClasses = {
    primary: 'bg-blue-50 text-blue-700 border border-blue-200',
    secondary: 'bg-cyan-50 text-cyan-700 border border-cyan-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
  };

  const dotColors = {
    primary: 'bg-blue-500',
    secondary: 'bg-cyan-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    neutral: 'bg-slate-400',
  };

  return (
    <View className={`inline-flex flex-row items-center gap-1.5 ${sizeClasses[size]} ${variantClasses[variant]}`}>
      {dot && <View className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      <Text className={variantClasses[variant].split(' ').find(c => c.startsWith('text-')) || 'text-slate-700'}>
        {children}
      </Text>
    </View>
  );
};

export const TicketStatusBadge: React.FC<{ status: TicketStatus; isOfflineQueued?: boolean }> = ({
  status,
  isOfflineQueued,
}) => {
  if (isOfflineQueued) {
    return (
      <Badge variant="warning" dot>
        Pending Sync ({status})
      </Badge>
    );
  }

  switch (status) {
    case 'RAISED':
      return <Badge variant="warning" dot>Pending Dispatch</Badge>;
    case 'ASSIGNED':
      return <Badge variant="secondary" dot>Engineer Assigned</Badge>;
    case 'ACCEPTED':
      return <Badge variant="success" dot>Request Accepted</Badge>;
    case 'PASSED':
      return <Badge variant="neutral" dot>Passed in Pool</Badge>;
    case 'REJECTED':
      return <Badge variant="danger" dot>Request Rejected</Badge>;
    case 'POSTPONED':
      return <Badge variant="warning" dot>Request Postponed</Badge>;
    case 'EN_ROUTE':
      return <Badge variant="primary" dot>Engineer En Route</Badge>;
    case 'IN_PROGRESS':
      return <Badge variant="primary" dot>In Progress</Badge>;
    case 'RESOLVED':
    case 'CLOSED':
      return <Badge variant="success" dot>Resolved & Closed</Badge>;
    default:
      return <Badge variant="neutral">{status}</Badge>;
  }
};

export const PriorityBadge: React.FC<{ priority: TicketPriority }> = ({ priority }) => {
  switch (priority) {
    case 'CRITICAL':
      return <Badge variant="danger" dot>CRITICAL (SLA &lt; 2h)</Badge>;
    case 'HIGH':
      return <Badge variant="warning" dot>HIGH</Badge>;
    case 'MEDIUM':
      return <Badge variant="primary">MEDIUM</Badge>;
    case 'LOW':
      return <Badge variant="neutral">LOW</Badge>;
  }
};

export const WarrantyBadge: React.FC<{ type: WarrantyType; expiryDate?: string }> = ({
  type,
  expiryDate,
}) => {
  switch (type) {
    case 'UNDER_WARRANTY':
      return (
        <View className="inline-flex flex-row items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 border border-emerald-200">
          <Text className="text-emerald-800 text-xs font-semibold">
            ✓ Active Warranty {expiryDate ? `(Exp: ${expiryDate})` : ''}
          </Text>
        </View>
      );
    case 'AMC_ACTIVE':
      return (
        <View className="inline-flex flex-row items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 border border-blue-200">
          <Text className="text-blue-800 text-xs font-semibold">
            🛡️ AMC Active {expiryDate ? `(Exp: ${expiryDate})` : ''}
          </Text>
        </View>
      );
    case 'CMC_ACTIVE':
      return (
        <View className="inline-flex flex-row items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 border border-indigo-200">
          <Text className="text-indigo-800 text-xs font-semibold">
            ⭐ Comprehensive CMC
          </Text>
        </View>
      );
    case 'EXPIRED':
      return (
        <View className="inline-flex flex-row items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 border border-rose-200">
          <Text className="text-rose-800 text-xs font-semibold">
            ⚠️ Warranty Expired
          </Text>
        </View>
      );
  }
};

export const MachineStatusBadge: React.FC<{ status: MachineStatus }> = ({ status }) => {
  switch (status) {
    case 'OPERATIONAL':
      return (
        <View className="inline-flex flex-row items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200">
          <View className="w-2 h-2 rounded-full bg-emerald-500" />
          <Text className="text-xs font-medium text-emerald-700">Operational</Text>
        </View>
      );
    case 'NEEDS_MAINTENANCE':
      return (
        <View className="inline-flex flex-row items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200">
          <View className="w-2 h-2 rounded-full bg-amber-500" />
          <Text className="text-xs font-medium text-amber-700">Maintenance Due</Text>
        </View>
      );
    case 'BREAKDOWN':
      return (
        <View className="inline-flex flex-row items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200">
          <View className="w-2 h-2 rounded-full bg-rose-500" />
          <Text className="text-xs font-medium text-rose-700">Breakdown / Down</Text>
        </View>
      );
  }
};
