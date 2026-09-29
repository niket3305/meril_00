import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { useApp } from '../../context/AppContext';
import { ServiceTicket } from '../../types';
import { PriorityBadge, TicketStatusBadge } from '../common/Badge';
import { Modal } from '../common/Modal';
import {
  UserCheck,
  AlertTriangle,
  Search,
  ChevronRight,
  Forward,
} from 'lucide-react-native';

export const RequestQueueView: React.FC = () => {
  const {
    tickets,
    engineers,
    assignEngineer,
    setCurrentScreen,
    setSelectedTicketId,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'ALL' | 'OPEN_POOL' | 'ASSIGNED' | 'IN_PROGRESS' | 'CLOSED'>('ALL');
  const [ticketToAssign, setTicketToAssign] = useState<ServiceTicket | null>(null);
  const [selectedEngineerId, setSelectedEngineerId] = useState<string>(engineers[0]?.id || '');
  const [etaMinutes, setEtaMinutes] = useState(35);

  const filteredTickets = tickets.filter((tkt) => {
    const matchesTab =
      selectedTab === 'ALL'
        ? true
        : selectedTab === 'OPEN_POOL'
        ? tkt.status === 'RAISED' || !tkt.assignedEngineerId
        : selectedTab === 'ASSIGNED'
        ? tkt.status === 'ASSIGNED' || tkt.status === 'ACCEPTED' || tkt.status === 'EN_ROUTE'
        : selectedTab === 'IN_PROGRESS'
        ? tkt.status === 'IN_PROGRESS'
        : tkt.status === 'CLOSED';

    const matchesSearch =
      tkt.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tkt.machineModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tkt.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tkt.faultDescription.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const openPoolCount = tickets.filter((t) => t.status === 'RAISED' || !t.assignedEngineerId).length;

  const handleAssignSubmit = () => {
    if (!ticketToAssign || !selectedEngineerId) return;

    assignEngineer(ticketToAssign.id, selectedEngineerId, etaMinutes);
    setSelectedTicketId(ticketToAssign.id);
    setTicketToAssign(null);
  };

  return (
    <ScrollView className="flex-1 bg-slate-50 p-4 space-y-6" keyboardShouldPersistTaps="handled">
      {/* Header Banner - Topic Only */}
      <View className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <Text className="text-xl font-black text-slate-900 tracking-tight">
          Central Service Request Dispatch & Queue
        </Text>
      </View>

      {/* Status Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-1.5 p-1 bg-slate-100 rounded-xl">
        {[
          { id: 'ALL', label: 'All Requests', count: tickets.length },
          { id: 'OPEN_POOL', label: 'Open Pool (Unclaimed)', count: openPoolCount, highlight: openPoolCount > 0 },
          {
            id: 'ASSIGNED',
            label: 'Claimed / Assigned',
            count: tickets.filter((t) => t.status === 'ASSIGNED' || t.status === 'ACCEPTED' || t.status === 'EN_ROUTE').length,
          },
          {
            id: 'IN_PROGRESS',
            label: 'On-Site',
            count: tickets.filter((t) => t.status === 'IN_PROGRESS').length,
          },
          {
            id: 'CLOSED',
            label: 'Closed',
            count: tickets.filter((t) => t.status === 'CLOSED').length,
          },
        ].map((tab) => (
          <Pressable
            key={tab.id}
            onPress={() => setSelectedTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg flex-row items-center gap-1.5 ${
              selectedTab === tab.id
                ? 'bg-white shadow-xs border border-slate-200'
                : ''
            }`}
          >
            <Text className={`text-xs font-bold ${selectedTab === tab.id ? 'text-blue-900' : 'text-slate-600'}`}>
              {tab.label}
            </Text>
            <View
              className={`px-1.5 py-0.2 rounded-full ${
                tab.highlight ? 'bg-amber-500' : 'bg-slate-200'
              }`}
            >
              <Text
                className={`text-[10px] font-bold ${
                  tab.highlight ? 'text-white' : 'text-slate-700'
                }`}
              >
                {tab.count}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {/* Search */}
      <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 shadow-xs">
        <Search size={16} color="#94a3b8" />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search tickets, machines, hospitals..."
          className="flex-1 ml-2 text-xs font-medium text-slate-900 py-1"
        />
      </View>

      {/* Tickets Queue Cards */}
      <View className="space-y-4 pb-8">
        {filteredTickets.map((tkt) => {
          const isUnassigned = !tkt.assignedEngineerId;
          const passedCount = (tkt.passedEngineerIds || []).length;

          return (
            <View
              key={tkt.id}
              className={`p-5 bg-white rounded-2xl border space-y-3 shadow-xs ${
                isUnassigned ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
              }`}
            >
              <View className="flex-row items-center gap-2 flex-wrap">
                <Text className="font-mono text-sm font-black text-blue-700">
                  {tkt.ticketNumber}
                </Text>
                <PriorityBadge priority={tkt.priority} />
                <TicketStatusBadge status={tkt.status} isOfflineQueued={tkt.isOfflineQueued} />
              </View>

              <View>
                <Text className="text-base font-bold text-slate-900">{tkt.machineModel}</Text>
                <Text className="text-xs text-blue-700 font-mono font-semibold mt-0.5">
                  SN: {tkt.machineSerial} • {tkt.customerName}
                </Text>
                <Text className="text-xs text-slate-500">{tkt.siteName}</Text>
              </View>

              <View className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <Text className="text-xs font-bold text-slate-700">Reported Issue:</Text>
                <Text className="text-xs text-slate-600">{tkt.faultDescription}</Text>
                
                {passedCount > 0 && (
                  <View className="mt-1 flex-row items-center gap-1.5 pt-1.5 border-t border-slate-200">
                    <Forward size={14} color="#d97706" />
                    <Text className="text-xs font-bold text-amber-800">
                      Passed by {passedCount} engineer(s) — Recommended for Admin Override Assignment
                    </Text>
                  </View>
                )}
              </View>

              {/* Photos preview */}
              {tkt.photos.length > 0 && (
                <View className="flex-row items-center gap-2">
                  <Text className="text-[11px] font-bold text-slate-400 uppercase">Evidence:</Text>
                  {tkt.photos.map((photoUrl, i) => (
                    <Image
                      key={i}
                      source={{ uri: photoUrl }}
                      style={{ width: 40, height: 40, borderRadius: 8 }}
                      contentFit="cover"
                    />
                  ))}
                </View>
              )}

              {/* Assigned Engineer / Dispatch */}
              <View className="pt-3 border-t border-slate-100 flex-row items-center justify-between">
                {tkt.assignedEngineerName ? (
                  <View className="flex-row items-center gap-2">
                    <Image
                      source={{ uri: tkt.assignedEngineerAvatar }}
                      style={{ width: 36, height: 36, borderRadius: 18 }}
                      contentFit="cover"
                    />
                    <View>
                      <Text className="text-xs font-bold text-slate-900">{tkt.assignedEngineerName}</Text>
                      <Text className="text-[11px] text-slate-500">{tkt.assignedEngineerPhone}</Text>
                    </View>
                  </View>
                ) : (
                  <View className="flex-row items-center gap-1.5 flex-1 pr-2">
                    <AlertTriangle size={16} color="#d97706" />
                    <Text className="text-xs font-bold text-amber-900">Open Pool Request</Text>
                  </View>
                )}

                {isUnassigned ? (
                  <Pressable
                    onPress={() => setTicketToAssign(tkt)}
                    className="py-2 px-3 bg-blue-700 rounded-xl flex-row items-center gap-1"
                  >
                    <UserCheck size={16} color="#ffffff" />
                    <Text className="text-white text-xs font-bold">Admin Override Assign</Text>
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={() => setTicketToAssign(tkt)}
                    className="py-2 px-3 bg-slate-800 rounded-xl flex-row items-center gap-1"
                  >
                    <UserCheck size={16} color="#ffffff" />
                    <Text className="text-white text-xs font-bold">Reassign</Text>
                  </Pressable>
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* Assign Engineer Modal */}
      {ticketToAssign && (
        <Modal
          isOpen={!!ticketToAssign}
          onClose={() => setTicketToAssign(null)}
          title={`Admin Override Assignment for ${ticketToAssign.ticketNumber}`}
          subtitle={`${ticketToAssign.machineModel} • ${ticketToAssign.customerName}`}
        >
          <View className="space-y-4">
            <View className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <Text className="text-xs text-amber-900 font-medium">
                Admin assignment is recommended when no engineer has accepted the request from the open pool, or when engineers have passed on it.
              </Text>
            </View>

            <Text className="text-xs font-bold text-slate-700">Select Certified Field Service Engineer</Text>

            <View className="space-y-2">
              {engineers.map((eng) => {
                const isSelected = selectedEngineerId === eng.id;
                const engPassed = (ticketToAssign.passedEngineerIds || []).includes(eng.id);

                return (
                  <Pressable
                    key={eng.id}
                    onPress={() => setSelectedEngineerId(eng.id)}
                    className={`p-3 rounded-xl border flex-row items-center justify-between ${
                      isSelected ? 'bg-blue-50 border-blue-500' : 'bg-white border-slate-200'
                    }`}
                  >
                    <View className="flex-row items-center gap-3 flex-1">
                      <Image
                        source={{ uri: eng.avatar }}
                        style={{ width: 44, height: 44, borderRadius: 22 }}
                        contentFit="cover"
                      />
                      <View className="flex-1">
                        <View className="flex-row items-center gap-1.5">
                          <Text className="text-xs font-bold text-slate-900">{eng.name}</Text>
                          {engPassed && (
                            <View className="px-1.5 py-0.5 bg-slate-200 rounded">
                              <Text className="text-[10px] font-bold text-slate-700">Passed previously</Text>
                            </View>
                          )}
                        </View>
                        <Text className="text-[11px] text-slate-500">{eng.designation}</Text>
                        <Text className="text-[10px] text-blue-700 font-semibold mt-0.5">
                          {eng.specializations.join(', ')}
                        </Text>
                      </View>
                    </View>

                    <View className="items-end">
                      <Text className="text-xs font-bold text-emerald-700">★ {eng.rating}</Text>
                      <Text className="text-[10px] text-slate-400">{eng.activeJobsCount} Active</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <View>
              <Text className="text-xs font-bold text-slate-700 mb-1">
                Estimated Travel & Arrival Time (Minutes)
              </Text>
              <TextInput
                keyboardType="numeric"
                value={etaMinutes.toString()}
                onChangeText={(val) => setEtaMinutes(parseInt(val) || 30)}
                className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
              />
            </View>

            <View className="pt-4 border-t border-slate-100 flex-row items-center justify-end gap-3">
              <Pressable
                onPress={() => setTicketToAssign(null)}
                className="px-4 py-2"
              >
                <Text className="text-slate-600 text-xs font-bold">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleAssignSubmit}
                className="px-5 py-2.5 bg-blue-700 rounded-xl"
              >
                <Text className="text-white text-xs font-bold">Confirm Direct Assignment</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
};
