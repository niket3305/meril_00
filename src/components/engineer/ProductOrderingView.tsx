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
  Search,
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
    { label: '📦 General Field Van Inventory Restock', value: '', description: 'Not linked to a specific service call' },
    ...activeTickets.map((t) => ({
      label: `${t.ticketNumber} • ${t.customerName}`,
      value: t.id,
      description: `${t.machineModel} (${t.priority} priority)`,
    })),
  ];

  const partCatalogOptions = spareParts.map((sp) => ({
    label: `${sp.name} (₹${sp.price.toLocaleString()})`,
    value: sp.id,
    description: `Part #: ${sp.partNumber} • Stock Qty: ${sp.stockQty}`,
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
        return <View className="px-2.5 py-1 bg-amber-100 border border-amber-300 rounded-full"><Text className="text-[10px] font-bold text-amber-900">Pending Approval</Text></View>;
      case 'APPROVED':
        return <View className="px-2.5 py-1 bg-blue-100 border border-blue-300 rounded-full"><Text className="text-[10px] font-bold text-blue-900">Approved</Text></View>;
      case 'IN_TRANSIT':
        return <View className="px-2.5 py-1 bg-indigo-100 border border-indigo-300 rounded-full flex-row items-center gap-1"><Truck size={10} color="#3730a3" /><Text className="text-[10px] font-bold text-indigo-900">In Transit</Text></View>;
      case 'AVAILABLE_ON_SITE':
        return <View className="px-2.5 py-1 bg-emerald-100 border border-emerald-300 rounded-full flex-row items-center gap-1"><CheckCircle2 size={10} color="#065f46" /><Text className="text-[10px] font-bold text-emerald-950">Available On-Site</Text></View>;
      case 'DELIVERED':
        return <View className="px-2.5 py-1 bg-emerald-200 border border-emerald-400 rounded-full flex-row items-center gap-1"><Check size={10} color="#064e3b" /><Text className="text-[10px] font-bold text-emerald-950">Delivered</Text></View>;
      default:
        return <View className="px-2.5 py-1 bg-slate-100 border border-slate-300 rounded-full"><Text className="text-[10px] font-bold text-slate-700">{status}</Text></View>;
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-50 p-4 space-y-6" keyboardShouldPersistTaps="handled">
      {/* Top Banner - Topic Only */}
      <View className="bg-emerald-900 text-white p-5 rounded-3xl space-y-4 shadow-lg">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-black text-white">Product & Parts Ordering Portal</Text>

          <Pressable
            onPress={() => setCurrentScreen('my-jobs')}
            className="px-3 py-1.5 bg-emerald-800 rounded-xl"
          >
            <Text className="text-xs font-bold text-emerald-100">← Back to Jobs</Text>
          </Pressable>
        </View>

        {/* Quick Order Stats Bar */}
        <View className="flex-row justify-between pt-3 border-t border-emerald-800">
          <View>
            <Text className="text-[10px] text-emerald-300 font-bold uppercase">Total Orders</Text>
            <Text className="text-lg font-black text-white">{productOrders.length}</Text>
          </View>
          <View>
            <Text className="text-[10px] text-emerald-300 font-bold uppercase">In Transit</Text>
            <Text className="text-lg font-black text-white">
              {productOrders.filter((o) => o.status === 'IN_TRANSIT').length}
            </Text>
          </View>
          <View>
            <Text className="text-[10px] text-emerald-300 font-bold uppercase">Available On-Site</Text>
            <Text className="text-lg font-black text-emerald-200">
              {productOrders.filter((o) => o.status === 'AVAILABLE_ON_SITE' || o.status === 'DELIVERED').length}
            </Text>
          </View>
        </View>
      </View>

      {/* Navigation Tabs */}
      <View className="flex-row gap-2 p-1 bg-slate-100 rounded-2xl">
        <Pressable
          onPress={() => setActiveTab('NEW_ORDER')}
          className={`flex-1 py-2.5 rounded-xl items-center ${
            activeTab === 'NEW_ORDER' ? 'bg-white shadow-xs' : ''
          }`}
        >
          <Text className={`text-xs font-bold ${activeTab === 'NEW_ORDER' ? 'text-emerald-900' : 'text-slate-600'}`}>
            + Create Order Request
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('TRACK_ORDERS')}
          className={`flex-1 py-2.5 rounded-xl items-center ${
            activeTab === 'TRACK_ORDERS' ? 'bg-white shadow-xs' : ''
          }`}
        >
          <Text className={`text-xs font-bold ${activeTab === 'TRACK_ORDERS' ? 'text-emerald-900' : 'text-slate-600'}`}>
            Track Orders ({productOrders.length})
          </Text>
        </Pressable>
      </View>

      {activeTab === 'NEW_ORDER' ? (
        <View className="space-y-5 pb-8">
          {/* Step 1: Link Service Request */}
          <View className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 shadow-xs">
            <View className="flex-row items-center gap-2">
              <Sparkles size={16} color="#059669" />
              <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Step 1: Specify Target Service Request
              </Text>
            </View>

            <CustomSelect
              label="LINK ORDER TO SERVICE REQUEST FOR AVAILABILITY ALERTS"
              options={ticketOptions}
              selectedValue={formTicketId}
              onValueChange={(val) => setFormTicketId(val)}
            />
          </View>

          {/* Step 2: Select Items (Reagents, Parts, Machines) */}
          <View className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
            <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Step 2: Add Reagents, Parts or Machines
            </Text>

            {/* Category Selector */}
            <Text className="text-xs font-bold text-slate-700">Product Category</Text>
            <View className="flex-row gap-2">
              {[
                { id: 'REAGENT', label: '🧪 Reagents', desc: 'Fluidic & calibration packs' },
                { id: 'SPARE_PART', label: '⚙️ Spare Parts', desc: 'Sensors, motors, PCBS' },
                { id: 'MACHINE_EQUIPMENT', label: '🔬 Equipment', desc: 'Replacement modules/carts' },
              ].map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() => setSelectedCategory(cat.id as ProductItemCategory)}
                  className={`flex-1 p-3 rounded-xl border items-center justify-center ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-50 border-emerald-500'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <Text className={`text-xs font-bold text-center ${selectedCategory === cat.id ? 'text-emerald-950' : 'text-slate-700'}`}>
                    {cat.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Catalog Selector */}
            {selectedCategory === 'SPARE_PART' && (
              <CustomSelect
                label="Select Spare Part from Master Catalog"
                options={partCatalogOptions}
                selectedValue={selectedPartCatalogId}
                onValueChange={(val) => setSelectedPartCatalogId(val)}
              />
            )}

            {/* Custom Item Entry */}
            <View className="space-y-1">
              <Text className="text-xs font-bold text-slate-700">
                {selectedCategory === 'REAGENT' ? 'Reagent / Solution Name *' : selectedCategory === 'MACHINE_EQUIPMENT' ? 'Machine Module Name *' : 'Custom Part / Item Name (Optional override)'}
              </Text>
              <TextInput
                value={customItemName}
                onChangeText={setCustomItemName}
                placeholder={
                  selectedCategory === 'REAGENT'
                    ? 'e.g. Flush Buffer Solution 10L'
                    : selectedCategory === 'MACHINE_EQUIPMENT'
                    ? 'e.g. Backup Navigation Generator Cart'
                    : 'Enter custom item name if not in catalog...'
                }
                className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </View>

            {/* Quantity */}
            <View className="flex-row items-center gap-3">
              <View className="w-32">
                <Text className="text-xs font-bold text-slate-700 mb-1">Quantity</Text>
                <TextInput
                  keyboardType="numeric"
                  value={itemQuantity}
                  onChangeText={setItemQuantity}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                />
              </View>

              <Pressable
                onPress={handleAddItemToCart}
                className="flex-1 mt-4 py-2.5 px-4 bg-emerald-700 rounded-xl flex-row items-center justify-center gap-1.5"
              >
                <Plus size={16} color="#ffffff" />
                <Text className="text-white text-xs font-bold">Add Item to Order</Text>
              </Pressable>
            </View>

            {/* Cart Preview List */}
            <View className="pt-2 border-t border-slate-100 space-y-2">
              <Text className="text-xs font-bold text-slate-700">Selected Items ({orderCart.length})</Text>
              {orderCart.map((item) => (
                <View
                  key={item.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex-row items-center justify-between"
                >
                  <View className="flex-1 pr-2">
                    <Text className="text-xs font-bold text-slate-900">{item.itemName}</Text>
                    <Text className="text-[11px] text-slate-500 font-mono">
                      Category: {item.itemCategory} • Code: {item.itemCode || 'N/A'} • Qty: {item.quantity}
                    </Text>
                  </View>
                  <Pressable onPress={() => handleRemoveFromCart(item.id)} className="p-1.5">
                    <Trash2 size={14} color="#e11d48" />
                  </Pressable>
                </View>
              ))}
            </View>
          </View>

          {/* Step 3: Urgency & Notes */}
          <View className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
            <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Step 3: Urgency Level & Delivery Notes
            </Text>

            <View className="space-y-2">
              <Text className="text-xs font-bold text-slate-700">Order Priority / Urgency</Text>
              <View className="flex-row gap-2">
                {[
                  { id: 'CRITICAL_BREAKDOWN', label: '🚨 CRITICAL', desc: 'Hospital OT Down' },
                  { id: 'URGENT', label: '⚠️ URGENT', desc: 'Proc Scheduled' },
                  { id: 'ROUTINE', label: 'ℹ️ ROUTINE', desc: 'Van Restock' },
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

            <View className="space-y-1">
              <Text className="text-xs font-bold text-slate-700">Delivery Instructions & Special Notes</Text>
              <TextInput
                multiline
                numberOfLines={3}
                value={orderNotes}
                onChangeText={setOrderNotes}
                placeholder="Specific delivery instructions for warehouse or courier..."
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 min-h-[60px]"
              />
            </View>
          </View>

          {/* Submit Order Request */}
          <Pressable
            onPress={handleFormSubmit}
            disabled={orderCart.length === 0}
            className={`py-4 px-6 rounded-2xl shadow-lg flex-row items-center justify-center gap-2 ${
              orderCart.length > 0 ? 'bg-emerald-700' : 'bg-slate-300'
            }`}
          >
            <ShoppingBag size={18} color="#ffffff" />
            <Text className="text-white text-xs font-bold">Submit Product Order Request</Text>
          </Pressable>
        </View>
      ) : (
        /* Track Orders Tab */
        <View className="space-y-4 pb-8">
          {productOrders.map((ord) => {
            const isAvailable = ord.status === 'AVAILABLE_ON_SITE' || ord.status === 'DELIVERED';

            return (
              <View
                key={ord.id}
                className={`p-5 bg-white rounded-2xl border space-y-4 shadow-xs ${
                  isAvailable ? 'border-emerald-400 bg-emerald-50/10' : 'border-slate-200'
                }`}
              >
                {/* Header */}
                <View className="flex-row items-center justify-between">
                  <Text className="font-mono text-xs font-black text-blue-800">{ord.orderNumber}</Text>
                  {getOrderStatusBadge(ord.status)}
                </View>

                {/* Service Request Link Callout */}
                {ord.ticketNumber ? (
                  <View className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex-row items-center justify-between">
                    <View className="flex-1 pr-2">
                      <Text className="text-[10px] font-bold uppercase text-blue-700">Linked Service Call</Text>
                      <Text className="text-xs font-bold text-blue-900">{ord.ticketNumber} • {ord.customerName}</Text>
                      <Text className="text-[11px] text-blue-800">{ord.machineModel}</Text>
                    </View>
                    <Pressable
                      onPress={() => {
                        if (ord.ticketId) {
                          setSelectedTicketId(ord.ticketId);
                          setCurrentScreen('job-detail');
                        }
                      }}
                      className="px-3 py-1.5 bg-blue-700 rounded-lg flex-row items-center gap-1"
                    >
                      <Text className="text-white text-[11px] font-bold">View Call</Text>
                      <ArrowRight size={12} color="#ffffff" />
                    </Pressable>
                  </View>
                ) : (
                  <View className="p-2.5 bg-slate-100 rounded-xl">
                    <Text className="text-xs font-semibold text-slate-600">General Field Van Restock Order</Text>
                  </View>
                )}

                {/* Personalized Availability Banner */}
                {isAvailable && (
                  <View className="p-3.5 bg-emerald-100 border border-emerald-300 rounded-xl space-y-1">
                    <View className="flex-row items-center gap-2">
                      <Bell size={16} color="#047857" />
                      <Text className="text-xs font-bold text-emerald-950 uppercase">
                        🔔 Personalized Alert: Parts Available On-Site!
                      </Text>
                    </View>
                    <Text className="text-xs text-emerald-900 leading-relaxed font-medium">
                      Requested items for service request {ord.ticketNumber} are now available on-site at {ord.customerName}. You can proceed with the repair execution.
                    </Text>
                  </View>
                )}

                {/* Items List */}
                <View className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <Text className="text-[11px] font-bold uppercase text-slate-400">Order Contents</Text>
                  {ord.items.map((it) => (
                    <View key={it.id} className="flex-row justify-between items-center">
                      <View className="flex-1 pr-2">
                        <Text className="text-xs font-bold text-slate-900">{it.itemName}</Text>
                        <Text className="text-[10px] text-slate-500 font-mono">[{it.itemCategory}] {it.itemCode}</Text>
                      </View>
                      <Text className="text-xs font-bold text-slate-900">Qty: {it.quantity}</Text>
                    </View>
                  ))}
                </View>

                {/* Status Simulator Controls (Interactive Demo) */}
                <View className="pt-2 border-t border-slate-100 space-y-2">
                  <Text className="text-[11px] font-bold uppercase text-slate-400">Simulate Warehouse / Logistics Status</Text>
                  <View className="flex-row gap-1.5 flex-wrap">
                    {[
                      { status: 'APPROVED', label: 'Approve' },
                      { status: 'IN_TRANSIT', label: 'In Transit' },
                      { status: 'AVAILABLE_ON_SITE', label: 'Mark Available On-Site 🔔' },
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
                        <Text className={`text-[11px] font-bold ${ord.status === st.status ? 'text-white' : 'text-slate-800'}`}>
                          {st.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
};
