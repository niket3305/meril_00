import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { useApp } from '../../context/AppContext';
import { CustomSelect } from '../common/CustomSelect';
import { ProductItemCategory, ProductOrderItem, ProductOrderStatus } from '../../types';
import {
  ShoppingBag,
  Package,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Plus,
  Trash2,
  Truck,
  Check,
  Bell,
  Sparkles,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Boxes,
} from 'lucide-react-native';

export const ProductOrderingView: React.FC = () => {
  const {
    tickets,
    engineers,
    spareParts,
    productOrders,
    createProductOrder,
    updateProductOrderStatus,
    setCurrentScreen,
    setSelectedTicketId,
  } = useApp();

  const currentEngineer = engineers[0];
  const [activeTab, setActiveTab] = useState<'NEW_ORDER' | 'TRACK_ORDERS'>('NEW_ORDER');

  // Track expanded order cards
  const [expandedOrderIds, setExpandedOrderIds] = useState<Record<string, boolean>>({});

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrderIds((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  // Form State
  const [formTicketId, setFormTicketId] = useState<string>(tickets[0]?.id || '');
  const [selectedCategory, setSelectedCategory] = useState<ProductItemCategory>('SPARE_PART');
  const [selectedPartCatalogId, setSelectedPartCatalogId] = useState<string>(spareParts[0]?.id || '');
  const [customItemName, setCustomItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState('1');
  const [orderUrgency, setOrderUrgency] = useState<'ROUTINE' | 'URGENT' | 'CRITICAL_BREAKDOWN'>('CRITICAL_BREAKDOWN');
  const [orderNotes, setOrderNotes] = useState('Urgent component delivery needed to restore hospital OT service.');

  const [orderCart, setOrderCart] = useState<ProductOrderItem[]>([
    {
      id: 'cart-1',
      itemCategory: 'SPARE_PART',
      itemName: spareParts[0]?.name || 'Pressure Sensor Assembly',
      itemCode: spareParts[0]?.partNumber || 'MRL-PRT-SEN-04',
      quantity: 1,
      unitPrice: spareParts[0]?.price || 48000,
    },
  ]);

  // Active tickets for linking
  const activeTickets = tickets.filter((t) => t.status !== 'CLOSED');

  const ticketOptions = [
    { label: '📦 General Field Van Restock', value: '', description: 'Not linked to a specific call' },
    ...activeTickets.map((t) => ({
      label: `${t.ticketNumber} • ${t.customerName}`,
      value: t.id,
      description: `${t.machineModel} (${t.priority})`,
    })),
  ];

  const partCatalogOptions = spareParts.map((sp) => ({
    label: `${sp.name} (₹${sp.price.toLocaleString()})`,
    value: sp.id,
    description: `Part #: ${sp.partNumber} • Stock: ${sp.stockQty}`,
  }));

  const handleAddItemToCart = () => {
    let name = customItemName.trim();
    let code = 'CUSTOM-ITEM';
    let price = 0;

    if (!name && selectedPartCatalogId) {
      const sp = spareParts.find((s) => s.id === selectedPartCatalogId);
      if (sp) {
        name = sp.name;
        code = sp.partNumber;
        price = sp.price;
      }
    }

    if (!name) return;

    const newItem: ProductOrderItem = {
      id: `cart-${Date.now()}-${Math.random()}`,
      itemCategory: selectedCategory,
      itemName: name,
      itemCode: code,
      quantity: parseInt(itemQuantity) || 1,
      unitPrice: price,
    };

    setOrderCart((prev) => [...prev, newItem]);
    setCustomItemName('');
  };

  const handleRemoveFromCart = (id: string) => {
    setOrderCart((prev) => prev.filter((i) => i.id !== id));
  };

  const handleFormSubmit = () => {
    if (orderCart.length === 0) return;

    createProductOrder({
      ticketId: formTicketId || undefined,
      items: orderCart,
      urgency: orderUrgency,
      notes: orderNotes,
    });

    setActiveTab('TRACK_ORDERS');
  };

  const getOrderStatusBadge = (status: ProductOrderStatus) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return (
          <View className="px-2.5 py-0.5 bg-amber-50 border border-amber-200 rounded-full">
            <Text className="text-[10px] font-bold text-amber-900">Pending Approval</Text>
          </View>
        );
      case 'APPROVED':
        return (
          <View className="px-2.5 py-0.5 bg-blue-50 border border-blue-200 rounded-full">
            <Text className="text-[10px] font-bold text-blue-900">Approved</Text>
          </View>
        );
      case 'IN_TRANSIT':
        return (
          <View className="px-2.5 py-0.5 bg-indigo-50 border border-indigo-200 rounded-full flex-row items-center gap-1">
            <Truck size={11} color="#3730a3" />
            <Text className="text-[10px] font-bold text-indigo-900">In Transit</Text>
          </View>
        );
      case 'AVAILABLE_ON_SITE':
        return (
          <View className="px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 rounded-full flex-row items-center gap-1">
            <CheckCircle2 size={11} color="#065f46" />
            <Text className="text-[10px] font-bold text-emerald-900">On-Site</Text>
          </View>
        );
      case 'DELIVERED':
        return (
          <View className="px-2.5 py-0.5 bg-emerald-100 border border-emerald-300 rounded-full flex-row items-center gap-1">
            <Check size={11} color="#064e3b" />
            <Text className="text-[10px] font-bold text-emerald-950">Delivered</Text>
          </View>
        );
      default:
        return (
          <View className="px-2.5 py-0.5 bg-slate-100 border border-slate-200 rounded-full">
            <Text className="text-[10px] font-bold text-slate-700">{status}</Text>
          </View>
        );
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-[#f8fafc]"
      contentContainerStyle={{ padding: 16, paddingBottom: 110, gap: 16 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* ── Top Header Navigation Bar ───────────────────────────────────── */}
      <View className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-2">
            <Text className="text-2xl font-black text-[#0f2930] tracking-tight">
              Parts & Supplies Desk
            </Text>
            <Text className="text-xs text-[#007b8a] font-semibold mt-0.5">
              Warehouse & Logistics Dispatch
            </Text>
          </View>

          <Pressable
            onPress={() => setCurrentScreen('my-jobs')}
            className="flex-row items-center gap-1 px-3 py-1.5 bg-slate-100 active:bg-slate-200 rounded-xl"
          >
            <ArrowLeft size={14} color="#334155" />
            <Text className="text-xs font-bold text-slate-700">Jobs</Text>
          </Pressable>
        </View>

        {/* Compact 1-Row Summary Strip */}
        <View className="flex-row bg-slate-50 rounded-xl p-2.5 border border-slate-200/60 justify-between">
          <View className="items-center flex-1">
            <Text className="text-lg font-black text-[#0f2930]">{productOrders.length}</Text>
            <Text className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Total Orders</Text>
          </View>
          <View className="items-center flex-1 border-l border-slate-200">
            <Text className="text-lg font-black text-indigo-600">
              {productOrders.filter((o) => o.status === 'IN_TRANSIT').length}
            </Text>
            <Text className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">In Transit</Text>
          </View>
          <View className="items-center flex-1 border-l border-slate-200">
            <Text className="text-lg font-black text-emerald-600">
              {productOrders.filter((o) => o.status === 'AVAILABLE_ON_SITE' || o.status === 'DELIVERED').length}
            </Text>
            <Text className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">On-Site</Text>
          </View>
        </View>
      </View>

      {/* ── Navigation Tabs ─────────────────────────────────────────────── */}
      <View className="flex-row bg-white rounded-2xl p-1 border border-slate-200/80 shadow-xs">
        <Pressable
          onPress={() => setActiveTab('NEW_ORDER')}
          className={`flex-1 py-2.5 items-center justify-center rounded-xl ${
            activeTab === 'NEW_ORDER' ? 'bg-[#007b8a] shadow-xs' : 'bg-transparent'
          }`}
        >
          <Text className={`text-xs font-bold ${activeTab === 'NEW_ORDER' ? 'text-white' : 'text-slate-600'}`}>
            + Create Order Request
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('TRACK_ORDERS')}
          className={`flex-1 py-2.5 items-center justify-center rounded-xl ${
            activeTab === 'TRACK_ORDERS' ? 'bg-[#007b8a] shadow-xs' : 'bg-transparent'
          }`}
        >
          <Text className={`text-xs font-bold ${activeTab === 'TRACK_ORDERS' ? 'text-white' : 'text-slate-600'}`}>
            Track Orders ({productOrders.length})
          </Text>
        </Pressable>
      </View>

      {activeTab === 'NEW_ORDER' ? (
        <View className="space-y-4">
          {/* Step 1: Link Target Service Request */}
          <View className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
            <View className="flex-row items-center gap-2">
              <Sparkles size={16} color="#007b8a" />
              <Text className="text-xs font-bold uppercase tracking-wider text-[#0f2930]">
                Step 1: Link Work Order (Optional)
              </Text>
            </View>

            <CustomSelect
              label="LINK ORDER TO SERVICE REQUEST FOR AVAILABILITY ALERTS"
              options={ticketOptions}
              selectedValue={formTicketId}
              onValueChange={(val) => setFormTicketId(val)}
            />
          </View>

          {/* Step 2: Add Items */}
          <View className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <Text className="text-xs font-bold uppercase tracking-wider text-[#0f2930]">
              Step 2: Add Products, Reagents or Parts
            </Text>

            {/* Category Selectors */}
            <View className="flex-row gap-2">
              {[
                { id: 'REAGENT', label: '🧪 Reagents' },
                { id: 'SPARE_PART', label: '⚙️ Spare Parts' },
                { id: 'MACHINE_EQUIPMENT', label: '🔬 Equipment' },
              ].map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() => setSelectedCategory(cat.id as ProductItemCategory)}
                  className={`flex-1 p-3 rounded-xl border items-center justify-center ${
                    selectedCategory === cat.id
                      ? 'bg-teal-50 border-[#007b8a]'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <Text className={`text-xs font-bold text-center ${selectedCategory === cat.id ? 'text-[#007b8a]' : 'text-slate-700'}`}>
                    {cat.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Catalog Selector */}
            {selectedCategory === 'SPARE_PART' && (
              <CustomSelect
                label="Select Spare Part from Catalog"
                options={partCatalogOptions}
                selectedValue={selectedPartCatalogId}
                onValueChange={(val) => setSelectedPartCatalogId(val)}
              />
            )}

            {/* Custom Item Entry */}
            <View className="space-y-1.5">
              <Text className="text-xs font-bold text-slate-700">
                {selectedCategory === 'REAGENT'
                  ? 'Reagent / Solution Name *'
                  : selectedCategory === 'MACHINE_EQUIPMENT'
                  ? 'Machine Module Name *'
                  : 'Custom Part / Item Name (Optional override)'}
              </Text>
              <TextInput
                value={customItemName}
                onChangeText={setCustomItemName}
                placeholder="Enter item name..."
                className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </View>

            {/* Quantity + Add Button */}
            <View className="flex-row items-center gap-3">
              <View className="w-28">
                <Text className="text-xs font-bold text-slate-700 mb-1">Quantity</Text>
                <TextInput
                  keyboardType="numeric"
                  value={itemQuantity}
                  onChangeText={setItemQuantity}
                  className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 text-center"
                />
              </View>

              <Pressable
                onPress={handleAddItemToCart}
                className="flex-1 mt-4 min-h-[44px] px-4 bg-[#007b8a] active:bg-[#00606b] rounded-xl flex-row items-center justify-center gap-1.5 shadow-xs"
              >
                <Plus size={16} color="#ffffff" />
                <Text className="text-white text-xs font-bold">Add to List</Text>
              </Pressable>
            </View>

            {/* Cart Preview List */}
            <View className="pt-3 border-t border-slate-100 space-y-2">
              <Text className="text-xs font-bold text-slate-800">
                Selected Items ({orderCart.length})
              </Text>
              {orderCart.map((item) => (
                <View
                  key={item.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex-row items-center justify-between"
                >
                  <View className="flex-1 pr-2">
                    <Text className="text-xs font-bold text-slate-900">{item.itemName}</Text>
                    <Text className="text-[10px] text-slate-500 font-mono mt-0.5">
                      Code: {item.itemCode || 'N/A'} · Qty: {item.quantity}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => handleRemoveFromCart(item.id)}
                    className="p-1.5 bg-rose-50 rounded-lg border border-rose-200/60"
                  >
                    <Trash2 size={14} color="#e11d48" />
                  </Pressable>
                </View>
              ))}
            </View>
          </View>

          {/* Step 3: Urgency & Notes */}
          <View className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
            <Text className="text-xs font-bold uppercase tracking-wider text-[#0f2930]">
              Step 3: Urgency & Instructions
            </Text>

            <View className="space-y-1.5">
              <Text className="text-xs font-bold text-slate-700">Urgency Level</Text>
              <View className="flex-row gap-2">
                {[
                  { id: 'CRITICAL_BREAKDOWN', label: '🚨 CRITICAL' },
                  { id: 'URGENT', label: '⚠️ URGENT' },
                  { id: 'ROUTINE', label: 'ℹ️ ROUTINE' },
                ].map((urg) => (
                  <Pressable
                    key={urg.id}
                    onPress={() => setOrderUrgency(urg.id as any)}
                    className={`flex-1 p-2.5 rounded-xl border items-center justify-center ${
                      orderUrgency === urg.id
                        ? 'bg-rose-50 border-rose-400'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <Text className={`text-xs font-bold ${orderUrgency === urg.id ? 'text-rose-900' : 'text-slate-700'}`}>
                      {urg.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View className="space-y-1.5">
              <Text className="text-xs font-bold text-slate-700">Instructions</Text>
              <TextInput
                multiline
                numberOfLines={3}
                value={orderNotes}
                onChangeText={setOrderNotes}
                placeholder="Delivery instructions..."
                className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-900 min-h-[70px]"
              />
            </View>
          </View>

          {/* Primary Submit Order Request */}
          <Pressable
            onPress={handleFormSubmit}
            disabled={orderCart.length === 0}
            className={`min-h-[48px] py-3.5 px-5 rounded-xl shadow-xs flex-row items-center justify-center gap-2 mb-6 ${
              orderCart.length > 0 ? 'bg-[#007b8a] active:bg-[#00606b]' : 'bg-slate-300'
            }`}
          >
            <ShoppingBag size={18} color="#ffffff" />
            <Text className="text-white text-xs font-bold tracking-wide">
              Submit Product Order Request
            </Text>
          </Pressable>
        </View>
      ) : (
        /* ── Track Orders Tab ──────────────── */
        <View className="space-y-4">
          {productOrders.map((ord) => {
            const isAvailable = ord.status === 'AVAILABLE_ON_SITE' || ord.status === 'DELIVERED';
            const isExpanded = !!expandedOrderIds[ord.id];

            return (
              <View
                key={ord.id}
                className={`p-4 bg-white rounded-2xl border shadow-xs space-y-3 ${
                  isAvailable ? 'border-emerald-300 bg-emerald-50/10' : 'border-slate-200/90'
                }`}
              >
                {/* Top Row: Order ID & Status */}
                <View className="flex-row items-center justify-between">
                  <Text className="font-mono text-xs font-bold text-[#007b8a] bg-[#e6f4f6] px-2.5 py-1 rounded-lg">
                    {ord.orderNumber}
                  </Text>
                  {getOrderStatusBadge(ord.status)}
                </View>

                {/* Linked Call Info */}
                {ord.ticketNumber ? (
                  <View className="p-3 bg-blue-50/80 border border-blue-200/60 rounded-xl flex-row items-center justify-between">
                    <View className="flex-1 pr-2">
                      <Text className="text-[10px] font-bold uppercase text-blue-700">Linked Call</Text>
                      <Text className="text-xs font-bold text-blue-950 mt-0.5">{ord.ticketNumber} · {ord.customerName}</Text>
                    </View>
                    <Pressable
                      onPress={() => {
                        if (ord.ticketId) {
                          setSelectedTicketId(ord.ticketId);
                          setCurrentScreen('job-detail');
                        }
                      }}
                      className="px-3 py-1.5 bg-blue-700 active:bg-blue-800 rounded-lg flex-row items-center gap-1"
                    >
                      <Text className="text-white text-[11px] font-bold">View Call →</Text>
                    </Pressable>
                  </View>
                ) : (
                  <View className="p-2.5 bg-slate-100 rounded-lg">
                    <Text className="text-xs font-semibold text-slate-600">General Restock</Text>
                  </View>
                )}

                {/* Availability Callout Banner */}
                {isAvailable && (
                  <View className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex-row items-center gap-2">
                    <Bell size={15} color="#047857" />
                    <Text className="text-xs font-bold text-emerald-950 flex-1">
                      Items available on-site at {ord.customerName}!
                    </Text>
                  </View>
                )}

                {/* Collapsible Details Drawer */}
                <View className="rounded-xl border border-slate-200/60 overflow-hidden bg-slate-50">
                  <Pressable
                    onPress={() => toggleOrderExpand(ord.id)}
                    className="flex-row items-center justify-between px-3.5 py-2.5 bg-slate-100/70"
                  >
                    <Text className="text-xs font-bold text-slate-700">
                      {isExpanded ? 'Hide Items' : `View Items (${ord.items.length})`}
                    </Text>
                    {isExpanded ? (
                      <ChevronUp size={14} color="#64748b" />
                    ) : (
                      <ChevronDown size={14} color="#64748b" />
                    )}
                  </Pressable>

                  {isExpanded && (
                    <View className="p-3.5 space-y-3 bg-white border-t border-slate-200">
                      {ord.items.map((it) => (
                        <View key={it.id} className="flex-row justify-between items-center py-1 border-b border-slate-100">
                          <Text className="text-xs font-bold text-slate-900 flex-1 pr-2">{it.itemName}</Text>
                          <Text className="text-xs font-bold text-slate-900">Qty: {it.quantity}</Text>
                        </View>
                      ))}

                      {/* Demo Simulator Controls */}
                      <View className="pt-2 space-y-1.5 border-t border-slate-100">
                        <Text className="text-[10px] font-bold uppercase text-slate-400">Demo Status Simulator</Text>
                        <View className="flex-row gap-1.5 flex-wrap">
                          {[
                            { status: 'APPROVED', label: 'Approve' },
                            { status: 'IN_TRANSIT', label: 'In Transit' },
                            { status: 'AVAILABLE_ON_SITE', label: 'Mark Available' },
                            { status: 'DELIVERED', label: 'Delivered' },
                          ].map((st) => (
                            <Pressable
                              key={st.status}
                              onPress={() => updateProductOrderStatus(ord.id, st.status as ProductOrderStatus)}
                              className={`px-2.5 py-1.5 rounded-lg border ${
                                ord.status === st.status
                                  ? 'bg-emerald-600 border-emerald-700'
                                  : 'bg-slate-100 border-slate-200'
                              }`}
                            >
                              <Text className={`text-[10px] font-bold ${ord.status === st.status ? 'text-white' : 'text-slate-800'}`}>
                                {st.label}
                              </Text>
                            </Pressable>
                          ))}
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
};
