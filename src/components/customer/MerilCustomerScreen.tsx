import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
  Image,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { MerilChatBotModal } from './MerilChatBotModal';

type ScreenType =
  | 'overview'
  | 'login'
  | 'machines'
  | 'service'
  | 'reagents'
  | 'shop'
  | 'warranty'
  | 'tracking'
  | 'feedback'
  | 'training'
  | 'notifications'
  | 'profile'
  | 'engineerTracking'
  | 'reports';

interface TicketData {
  ticketId: string;
  analyzer: string;
  issueType: string;
  status: string;
  slaTarget: string;
  assignedEngineer: {
    name: string;
    role: string;
    etaMins: number;
    phone: string;
    distanceKm: number;
  };
  verificationOtp: string;
}

interface ReagentItem {
  id: string;
  name: string;
  sku: string;
  price: number;
}

export const MerilCustomerScreen: React.FC = () => {
  const {
    currentUser,
    logout,
    machines: contextMachines,
    tickets: contextTickets,
    engineers: contextEngineers,
    raiseRequest,
    createProductOrder,
  } = useApp();

  const [currentScreen, setCurrentScreen] = useState<ScreenType>('overview');
  const [clientId, setClientId] = useState(
    currentUser?.employeeId || (currentUser?.email ? 'MER-' + currentUser.email.split('@')[0].toUpperCase().slice(0, 6) : 'MER-882190')
  );
  const [phoneOrPass, setPhoneOrPass] = useState('password123');
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [otpSent, setOtpSent] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const [sosActive, setSosActive] = useState(false);
  const [chatBotOpen, setChatBotOpen] = useState(false);

  const OTP_EXPIRY_SECONDS = 30;
  const [currentOtp, setCurrentOtp] = useState('5892');
  const [otpTimeLeft, setOtpTimeLeft] = useState(OTP_EXPIRY_SECONDS);

  // Sync client ID if currentUser changes
  useEffect(() => {
    if (currentUser?.employeeId) {
      setClientId(currentUser.employeeId);
    } else if (currentUser?.email) {
      setClientId('MER-' + currentUser.email.split('@')[0].toUpperCase().slice(0, 6));
    }
  }, [currentUser]);

  // OTP Timer auto-roll
  useEffect(() => {
    const timer = setInterval(() => {
      setOtpTimeLeft((prev) => {
        if (prev <= 1) {
          const autoRolledOtp = Math.floor(1000 + Math.random() * 9000).toString();
          setCurrentOtp(autoRolledOtp);
          return OTP_EXPIRY_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const [unreadCount, setUnreadCount] = useState(4);
  const [liveTicket, setLiveTicket] = useState<TicketData | null>(null);
  const [liveReagents, setLiveReagents] = useState<ReagentItem[]>([]);

  // Find active ticket from AppContext or fallback
  useEffect(() => {
    const activeTicket = contextTickets?.find((t) => t.status !== 'CLOSED') || contextTickets?.[0];
    if (activeTicket) {
      const assignedEng = contextEngineers?.find((e) => e.id === activeTicket.assignedEngineerId);
      setLiveTicket({
        ticketId: activeTicket.ticketNumber || activeTicket.id,
        analyzer: activeTicket.machineModel || 'Meril Quant-Mate 400',
        issueType: activeTicket.faultDescription || 'Flow-cell optical sensor calibration error',
        status: activeTicket.status,
        slaTarget: activeTicket.priority === 'CRITICAL' ? '4 Hours (Emergency SOS)' : '24-48 Hours',
        assignedEngineer: {
          name: activeTicket.assignedEngineerName || assignedEng?.name || 'Rajesh Sharma',
          role: assignedEng?.designation || 'Senior Field Specialist',
          etaMins: activeTicket.etaMinutes || (activeTicket.status === 'EN_ROUTE' ? 20 : activeTicket.status === 'IN_PROGRESS' ? 0 : 35),
          phone: activeTicket.assignedEngineerPhone || assignedEng?.phone || '+91 98200 11223',
          distanceKm: activeTicket.status === 'IN_PROGRESS' ? 0.1 : 3.4,
        },
        verificationOtp: activeTicket.otp || '5892',
      });
      setCurrentOtp(activeTicket.otp || '5892');
    }
  }, [contextTickets, contextEngineers]);

  const defaultReagentsList: ReagentItem[] = [
    { id: '1', name: 'Meril SGOT / AST Clinical Pack', sku: 'MER-CH-012', price: 4850 },
    { id: '2', name: 'Direct Creatinine Kinetic Assay', sku: 'MER-CH-044', price: 3200 },
    { id: '3', name: 'AutoChem Electrolyte ISE Pack', sku: 'MER-ISE-08', price: 6500 },
    { id: '4', name: 'MeRes Diagnostic Diluent Reagent', sku: 'MER-DL-901', price: 2900 },
  ];

  const displayReagents = liveReagents.length > 0 ? liveReagents : defaultReagentsList;

  const handleTriggerSOS = () => {
    const nextState = !sosActive;
    setSosActive(nextState);
    if (nextState) {
      // Create a critical emergency service ticket in AppContext
      try {
        const targetMachine = contextMachines && contextMachines.length > 0 ? contextMachines[0] : null;
        if (targetMachine && raiseRequest) {
          raiseRequest({
            machineId: targetMachine.id,
            faultCategory: 'HARDWARE_ALARM',
            faultDescription: 'EMERGENCY SOS: Clinical analyzer stoppage requiring immediate 4-hour SLA field dispatch.',
            priority: 'CRITICAL',
            photos: [],
            contactName: currentUser?.name || 'Lab In-Charge',
            contactPhone: currentUser?.phone || '+91 98200 00000',
          });
        }
      } catch (err) {
        console.warn('SOS context ticket sync:', err);
      }
      Alert.alert('Emergency SOS Dispatched', 'A priority ticket has been broadcast to Central Service Operations. SLA target: 4 Hours.');
    } else {
      Alert.alert('SOS Disengaged', 'Emergency alert has been cancelled.');
    }
  };

  const handleReorderReagent = (reagent: ReagentItem) => {
    try {
      if (createProductOrder) {
        createProductOrder({
          items: [
            {
              id: reagent.id,
              itemCategory: 'REAGENT',
              itemName: reagent.name,
              itemCode: reagent.sku,
              quantity: 1,
              unitPrice: reagent.price,
            },
          ],
          urgency: 'ROUTINE',
          notes: `Customer re-order for ${reagent.name}`,
        });
      }
    } catch (err) {
      console.warn('Product order context sync:', err);
    }
    Alert.alert('Order Placed', `${reagent.name} (SKU: ${reagent.sku}) has been queued for fulfillment.`);
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm('Are you sure you want to log out?')) {
        logout();
      }
    } else {
      Alert.alert('Sign Out', 'Are you sure you want to log out of your session?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]);
    }
  };

  const engineer = liveTicket?.assignedEngineer;

  const notificationsList = [
    {
      id: '1',
      title: 'Engineer Dispatched',
      desc: `${engineer?.name ?? 'Rajesh Sharma'} is en route for ticket #${liveTicket?.ticketId ?? 'MER-90214'}.`,
      time: '10m ago',
      unread: true,
    },
    {
      id: '2',
      title: 'AMC Expiry Notice',
      desc: 'AutoChem II maintenance contract renewal due in 28 days.',
      time: '2h ago',
      unread: true,
    },
    {
      id: '3',
      title: 'Reagent Order Shipped',
      desc: 'Batch #MER-CH-012 has left the regional diagnostic hub.',
      time: 'Yesterday',
      unread: true,
    },
    {
      id: '4',
      title: 'Preventive Calibration Complete',
      desc: 'Signed calibration audit report is ready for download.',
      time: '3d ago',
      unread: false,
    },
  ];

  /* ====================================================
      NOTIFICATIONS SUB-PAGE
  ==================================================== */
  const renderNotificationsPage = () => (
    <View style={styles.subPageContainer}>
      <View style={styles.rowBetween}>
        <View style={{ flex: 1 }}>
          <Text style={styles.pageHeader}>Notifications</Text>
          <Text style={styles.pageSubHeader}>Service alerts, reagent orders & warranty notices.</Text>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markReadBtn} onPress={() => setUnreadCount(0)}>
            <Text style={styles.markReadText}>Mark Read</Text>
          </TouchableOpacity>
        )}
      </View>

      {notificationsList.map((item) => (
        <View key={item.id} style={[styles.notifCard, item.unread && styles.notifCardUnread]}>
          <View style={styles.notifIconCircle}>
            <Ionicons name="notifications-outline" size={18} color="#007b8a" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={styles.rowBetween}>
              <Text style={styles.notifTitle}>{item.title}</Text>
              <Text style={styles.notifTime}>{item.time}</Text>
            </View>
            <Text style={styles.notifDesc}>{item.desc}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  /* ====================================================
      PROFILE SUB-PAGE
  ==================================================== */
  const renderProfilePage = () => (
    <View style={styles.subPageContainer}>
      <Text style={styles.pageHeader}>Laboratory Profile</Text>
      <Text style={styles.pageSubHeader}>Hospital credentials and registered account session.</Text>

      <View style={styles.profileHeroCard}>
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=150&auto=format&fit=crop&q=80',
          }}
          style={styles.profileAvatarLarge}
        />
        <View style={styles.profileHeroText}>
          <Text style={styles.profileName}>
            {currentUser?.facilityName || 'Apollo Diagnostic Center'}
          </Text>
          <View style={styles.verifiedTag}>
            <Text style={styles.verifiedTagText}>✓ Verified Client</Text>
          </View>
          <Text style={styles.profileIdText}>Client ID: {clientId}</Text>
          <Text style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
            {currentUser?.name ? `Contact: ${currentUser.name}` : 'Contact: Chief Lab Director'}
          </Text>
        </View>
      </View>

      <View style={styles.stackedButtonGroup}>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => setCurrentScreen('machines')}>
          <Text style={styles.primaryBtnText}>View Registered Machines</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.7} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>Sign Out of Session 🚪</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  /* ====================================================
      MACHINES SUB-PAGE
  ==================================================== */
  const renderMachinesPage = () => {
    const machinesToDisplay =
      contextMachines && contextMachines.length > 0
        ? contextMachines.map((m) => ({
            name: m.model,
            sn: m.serialNumber,
            status: m.status === 'OPERATIONAL' ? 'Operational' : m.status,
            nextPM: m.nextServiceDue || '15 Oct 2026',
            warranty: `${m.warrantyType.replace('_', ' ')} (${m.warrantyExpiryDate})`,
            image:
              m.imageUrl ||
              'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=300&auto=format&fit=crop&q=80',
          }))
        : [
            {
              name: liveTicket?.analyzer ?? 'Meril Quant-Mate 400',
              sn: 'MQM-2024-8841',
              status: 'Operational',
              nextPM: '15 Oct 2026',
              warranty: 'Till Nov 2027',
              image:
                'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=300&auto=format&fit=crop&q=80',
            },
            {
              name: 'Meril AutoChem 300 Fully Automated',
              sn: 'MAC-2023-1102',
              status: 'Operational',
              nextPM: '02 Nov 2026',
              warranty: 'Till Dec 2027',
              image:
                'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=300&auto=format&fit=crop&q=80',
            },
          ];

    return (
      <View style={styles.subPageContainer}>
        <Text style={styles.pageHeader}>Registered Analyzers ({machinesToDisplay.length})</Text>
        <Text style={styles.pageSubHeader}>Manage lab instruments, serial logs, and preventive maintenance.</Text>

        {machinesToDisplay.map((machine, i) => (
          <View key={i} style={styles.recordCard}>
            <View style={styles.machineCardTop}>
              <Image source={{ uri: machine.image }} style={styles.machineThumb} />
              <View style={{ flex: 1 }}>
                <Text style={styles.recordTitle}>{machine.name}</Text>
                <Text style={styles.recordSubtitle}>S/N: {machine.sn}</Text>
                <Text style={styles.metaItem}>🗓 Next: {machine.nextPM}</Text>
                <Text style={styles.metaItem}>🛡 {machine.warranty}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => setCurrentScreen('service')}>
              <Text style={styles.primaryBtnText}>Book Service</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  /* ====================================================
      SERVICE PAGE
  ==================================================== */
  const renderServicePage = () => (
    <View style={styles.subPageContainer}>
      <Text style={styles.pageHeader}>Service & SOS Support</Text>
      <Text style={styles.pageSubHeader}>Dispatch Meril field specialists or schedule routine visits.</Text>

      <View style={styles.emergencyBox}>
        <View style={styles.emergencyHeader}>
          <Text style={styles.emergencyTitle}>🚨 Emergency SOS</Text>
          <Text style={styles.emergencyTime}>4-Hr Target</Text>
        </View>
        <Text style={styles.emergencyDesc}>Trigger an immediate field escalation if analyzer failure halts diagnostics.</Text>
        <TouchableOpacity
          style={[styles.sosActionBtn, sosActive && styles.sosActiveBtn]}
          onPress={handleTriggerSOS}
        >
          <Text style={styles.sosActionBtnText}>{sosActive ? 'CANCEL ACTIVE SOS' : 'TRIGGER EMERGENCY SOS'}</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.recordCard, { marginTop: 14 }]}>
        <View style={styles.rowBetween}>
          <Text style={styles.recordTitle}>Active Request: {liveTicket ? liveTicket.ticketId : 'MER-90214'}</Text>
          <View style={styles.livePill}>
            <Text style={styles.livePillText}>{liveTicket?.status || 'Active'}</Text>
          </View>
        </View>
        <Text style={styles.metaItem}>Analyzer: {liveTicket?.analyzer || 'Meril Quant-Mate 400'}</Text>
        <Text style={styles.metaItem}>Field Specialist: {engineer?.name ?? 'Rajesh Sharma'}</Text>
        <View style={styles.otpBanner}>
          <Text style={styles.otpBannerTitle}>Service Handover OTP</Text>
          <Text style={styles.otpNumber}>{liveTicket?.verificationOtp || currentOtp}</Text>
          <Text style={styles.otpNote}>Provide this 4-digit code to the technician on-site for FSR sign-off.</Text>
        </View>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => setCurrentScreen('engineerTracking')}>
          <Text style={styles.primaryBtnText}>Track Specialist Location & Route 📍</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  /* ====================================================
      GPS TRACKING PAGE
  ==================================================== */
  const renderEngineerTrackingPage = () => {
    const query = encodeURIComponent(liveTicket?.analyzer ? `${liveTicket.analyzer}, Mumbai` : 'Apollo Hospital, Chennai');
    const googleMapUrl = `https://maps.google.com/maps?q=${query}&hl=en&z=15&output=embed`;

    return (
      <View style={styles.subPageContainer}>
        <View style={styles.rowBetween}>
          <Text style={styles.pageHeader}>Live GPS Telemetry</Text>
          <View style={styles.livePill}>
            <Text style={styles.livePillText}>{liveTicket?.status || 'IN_TRANSIT'}</Text>
          </View>
        </View>
        <Text style={styles.pageSubHeader}>Real-time technician transit, corridor routing and ETA updates.</Text>

        <View style={styles.liveMapWrapper}>
          {Platform.OS === 'web' ? (
            // @ts-ignore
            <iframe
              title="Google Maps Live Tracking"
              src={googleMapUrl}
              style={{ width: '100%', height: 260, border: 'none', borderRadius: 12 }}
              allowFullScreen
              loading="lazy"
            />
          ) : (
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&auto=format&fit=crop&q=80',
              }}
              style={styles.mapImage}
            />
          )}
        </View>

        <View style={[styles.recordCard, { marginTop: 12 }]}>
          <Text style={styles.recordTitle}>{engineer?.name ?? 'Rajesh Sharma'}</Text>
          <Text style={styles.metaItem}>
            Status: {liveTicket?.status === 'EN_ROUTE' ? '🚗 Specialist En Route to Hospital' : liveTicket?.status === 'IN_PROGRESS' ? '🔧 Specialist Arrived & Calibrating On-Site' : liveTicket?.status === 'RESOLVED' ? '✅ Repair Resolved — Awaiting OTP Sign-off' : 'Assigned & Dispatched'}
          </Text>
          <Text style={styles.metaItem}>ETA: {engineer?.etaMins ?? 20} Mins Away (Distance: {engineer?.distanceKm ?? 3.4} km)</Text>
          <TouchableOpacity
            style={[styles.primaryBtn, { marginTop: 10 }]}
            onPress={() => Alert.alert('Dialing Specialist', `Connecting call to ${engineer?.name || 'Rajesh Sharma'} (${engineer?.phone || '+91 98200 11223'})...`)}
          >
            <Text style={styles.primaryBtnText}>📞 Voice Call Specialist</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  /* ====================================================
      REAGENTS PAGE
  ==================================================== */
  const renderReagentsPage = () => (
    <View style={styles.subPageContainer}>
      <Text style={styles.pageHeader}>Reagent Ordering</Text>
      <Text style={styles.pageSubHeader}>Original Meril assays, calibrators and controls.</Text>

      {displayReagents.map((reagent) => (
        <View key={reagent.id} style={styles.recordCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.recordTitle}>{reagent.name}</Text>
            <Text style={{ fontSize: 14, fontWeight: '800', color: '#007b8a' }}>₹{reagent.price}</Text>
          </View>
          <Text style={styles.recordSubtitle}>SKU: {reagent.sku} • In Stock</Text>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => handleReorderReagent(reagent)}
          >
            <Text style={styles.primaryBtnText}>Reorder Assays 📦</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  /* ====================================================
      OTHER SUB-PAGES
  ==================================================== */
  const renderGenericSubPage = (title: string, desc: string) => (
    <View style={styles.subPageContainer}>
      <Text style={styles.pageHeader}>{title}</Text>
      <Text style={styles.pageSubHeader}>{desc}</Text>
      <View style={styles.recordCard}>
        <Text style={styles.recordTitle}>Standard Meril Module</Text>
        <Text style={styles.metaItem}>Operational and connected to active regional server.</Text>
      </View>
    </View>
  );

  /* ====================================================
      OVERVIEW DASHBOARD
  ==================================================== */
  const renderOverviewPage = () => (
    <>
      <TouchableOpacity
        style={[styles.ctaButton, sosActive && styles.ctaButtonActive]}
        activeOpacity={0.85}
        onPress={handleTriggerSOS}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="alert-circle-outline" size={18} color={sosActive ? '#be123c' : '#007b8a'} />
          <Text style={[styles.ctaButtonText, sosActive && { color: '#be123c' }]}>
            {sosActive ? 'SOS ACTIVE • CANCEL REQUEST' : 'CTA BUTTON : 4-HR EMERGENCY SOS'}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.headerImageBlock}
        activeOpacity={0.9}
        onPress={() => setCurrentScreen('machines')}
      >
        <View style={styles.headerContainer}>
          <View style={styles.rowBetween}>
            <Text style={styles.headerTitle}>Meril Life Sciences • Advancing Healthcare</Text>
            <View style={styles.livePill}>
              <Text style={styles.livePillText}>INNOVATION</Text>
            </View>
          </View>
          <Text style={styles.headerSubtitle}>Dedicated to advancing healthcare solutions that improve patient outcomes.</Text>
        </View>

        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&auto=format&fit=crop&q=80' }}
            style={styles.imageMain}
          />
        </View>
      </TouchableOpacity>

      <View style={styles.dualButtonRow}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnPrimary]}
          onPress={() => setCurrentScreen('service')}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="construct-outline" size={16} color="#ffffff" />
            <Text style={styles.actionBtnPrimaryText}>BUTTON: Book Service</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnSecondary]}
          onPress={() => setCurrentScreen('engineerTracking')}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="location-outline" size={16} color="#0f2930" />
            <Text style={styles.actionBtnSecondaryText}>BUTTON: Track Live</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.cardContainer}>
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.cardHeaderSmall}>ASSIGNED SPECIALIST</Text>
            <Text style={styles.cardTitle}>{engineer?.name ?? 'Rajesh Sharma'}</Text>
          </View>
          <View style={styles.cardBadge}>
            <Text style={styles.cardBadgeText}>
              {liveTicket?.status === 'IN_PROGRESS' ? 'ON-SITE' : liveTicket?.status === 'EN_ROUTE' ? `ETA ~${engineer?.etaMins ?? 20}M` : 'ASSIGNED'}
            </Text>
          </View>
        </View>

        <View style={styles.otpStrip}>
          <Text style={styles.otpLabel}>Service Handover OTP:</Text>
          <Text style={styles.otpValue}>{liveTicket?.verificationOtp || currentOtp}</Text>
        </View>

        <View style={styles.cardActionRow}>
          <TouchableOpacity
            style={styles.cardMiniBtn}
            onPress={() => Alert.alert('Dialing Specialist', `Connecting call to ${engineer?.name || 'Rajesh Sharma'} (${engineer?.phone || '+91 98200 11223'})...`)}
          >
            <Text style={styles.cardMiniBtnText}>📞 Voice Call</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.cardMiniBtn, { backgroundColor: '#16a34a' }]}
            onPress={() => Alert.alert('Connecting Specialist', 'Opening instant chat support...')}
          >
            <Text style={styles.cardMiniBtnText}>💬 Message</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );

  /* ====================================================
      APP SHELL
  ==================================================== */
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* TOP HEADER */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.topBarBrand} onPress={() => setCurrentScreen('overview')}>
          <View style={styles.brandBadge}>
            <Text style={styles.brandBadgeText}>M</Text>
          </View>
          <View>
            <Text style={styles.topBarTitle}>MERIL ONE</Text>
            <Text style={styles.topBarSub}>
              {currentUser?.facilityName || 'Apollo Lab'} • {clientId}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.headerRightGroup}>
          <TouchableOpacity style={styles.aiHeaderBtn} onPress={() => setChatBotOpen(true)}>
            <Ionicons name="sparkles" size={15} color="#007b8a" />
            <Text style={styles.aiHeaderBtnText}>Ask AI</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.notificationBtn} onPress={() => setCurrentScreen('notifications')}>
            <Ionicons name="notifications-outline" size={18} color="#0f2930" />
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.profileBadgeBtn} onPress={() => setCurrentScreen('profile')}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&auto=format&fit=crop&q=80' }}
              style={styles.topAvatar}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* BODY CONTENT */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {currentScreen !== 'overview' && (
          <TouchableOpacity style={styles.backButton} onPress={() => setCurrentScreen('overview')}>
            <Text style={styles.backButtonText}>← Back to Overview</Text>
          </TouchableOpacity>
        )}

        {currentScreen === 'overview' && renderOverviewPage()}
        {currentScreen === 'notifications' && renderNotificationsPage()}
        {currentScreen === 'profile' && renderProfilePage()}
        {currentScreen === 'machines' && renderMachinesPage()}
        {currentScreen === 'service' && renderServicePage()}
        {currentScreen === 'engineerTracking' && renderEngineerTrackingPage()}
        {currentScreen === 'reagents' && renderReagentsPage()}
        {currentScreen === 'shop' && renderGenericSubPage('Equipment Catalogue', 'Explore next-generation clinical platforms.')}
        {currentScreen === 'warranty' && renderGenericSubPage('Warranty & AMC', 'Coverage policies and preventive compliance.')}
        {currentScreen === 'tracking' && renderGenericSubPage('Service Tracking', 'Timeline updates on active service tickets.')}
        {currentScreen === 'feedback' && renderGenericSubPage('Technician Feedback', 'Rate recent service satisfaction.')}
        {currentScreen === 'training' && renderGenericSubPage('SOPs & Training', 'Digital guides and clinical operating procedures.')}
        {currentScreen === 'reports' && renderGenericSubPage('Service Reports', 'Download signed ISO and NABL compliance certificates.')}
      </ScrollView>

      {/* BOTTOM TAB BAR */}
      <View style={styles.tabBar}>
        <View style={styles.tabIconsRow}>
          {[
            { id: 'overview' as ScreenType, label: 'Home', icon: 'home-outline' },
            { id: 'machines' as ScreenType, label: 'Analyzers', icon: 'fitness-outline' },
            { id: 'service' as ScreenType, label: 'Service', icon: 'construct-outline' },
            { id: 'engineerTracking' as ScreenType, label: 'Tracking', icon: 'navigate-outline' },
            { id: 'profile' as ScreenType, label: 'Profile', icon: 'person-outline' },
          ].map((tab) => {
            const isSelected = currentScreen === tab.id;
            const iconColor = isSelected ? '#007b8a' : '#64748b';
            return (
              <TouchableOpacity
                key={tab.id}
                style={styles.tabItem}
                onPress={() => setCurrentScreen(tab.id)}
              >
                <View style={[styles.tabSquare, isSelected && styles.tabSquareActive]}>
                  <Ionicons name={tab.icon as any} size={20} color={iconColor} />
                </View>
                <Text style={[styles.tabLabel, isSelected && styles.tabLabelActive]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* FLOATING ACTION BUTTON */}
      <TouchableOpacity style={styles.floatingAiBtn} onPress={() => setChatBotOpen(true)}>
        <Ionicons name="sparkles" size={16} color="#ffffff" />
        <Text style={styles.floatingAiText}>Ask AI</Text>
      </TouchableOpacity>

      {/* CHATBOT MODAL */}
      <MerilChatBotModal visible={chatBotOpen} onClose={() => setChatBotOpen(false)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f1f5f9' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24, maxWidth: 520, width: '100%', alignSelf: 'center' },
  topBar: { height: 56, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff' },
  topBarBrand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandBadge: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#007b8a', alignItems: 'center', justifyContent: 'center' },
  brandBadgeText: { color: '#ffffff', fontWeight: '900', fontSize: 15 },
  topBarTitle: { color: '#0f2930', fontSize: 14.5, fontWeight: '800' },
  topBarSub: { color: '#64748b', fontSize: 10 },
  headerRightGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  notificationBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' },
  unreadBadge: { position: 'absolute', top: -2, right: -2, backgroundColor: '#dc2626', borderRadius: 9, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  unreadBadgeText: { color: '#ffffff', fontSize: 9, fontWeight: '800' },
  profileBadgeBtn: { width: 34, height: 34, borderRadius: 17, overflow: 'hidden', borderWidth: 1.5, borderColor: '#007b8a' },
  topAvatar: { width: '100%', height: '100%' },
  aiHeaderBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#e6f4f6', borderWidth: 1, borderColor: '#007b8a', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16 },
  aiHeaderBtnText: { color: '#007b8a', fontSize: 12, fontWeight: '800' },
  floatingAiBtn: { position: 'absolute', bottom: 90, right: 24, backgroundColor: '#007b8a', flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 25, zIndex: 9999, elevation: 8 },
  floatingAiText: { color: '#ffffff', fontSize: 12.5, fontWeight: '800' },
  backButton: { alignSelf: 'flex-start', backgroundColor: '#ffffff', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  backButtonText: { color: '#007b8a', fontWeight: '700', fontSize: 12 },
  ctaButton: { borderWidth: 1.5, borderColor: '#007b8a', backgroundColor: '#e6f4f6', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginBottom: 14 },
  ctaButtonActive: { borderColor: '#e11d48', backgroundColor: '#ffe4e6' },
  ctaButtonText: { color: '#007b8a', fontSize: 12.5, fontWeight: '800' },
  headerImageBlock: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, overflow: 'hidden', marginBottom: 14, backgroundColor: '#ffffff' },
  headerContainer: { padding: 12, borderBottomWidth: 1, borderColor: '#f1f5f9' },
  headerTitle: { color: '#0f2930', fontSize: 15, fontWeight: '800' },
  headerSubtitle: { color: '#64748b', fontSize: 11, marginTop: 2 },
  livePill: { borderWidth: 1, borderColor: '#007b8a', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, backgroundColor: '#e6f4f6' },
  livePillText: { color: '#007b8a', fontSize: 9.5, fontWeight: '800' },
  imageWrapper: { height: 180, width: '100%', backgroundColor: '#f8fafc' },
  imageMain: { width: '100%', height: '100%', resizeMode: 'cover' },
  dualButtonRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  actionBtn: { flex: 1, borderWidth: 1, borderColor: '#e2e8f0', paddingVertical: 11, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  actionBtnPrimary: { backgroundColor: '#007b8a', borderColor: '#007b8a' },
  actionBtnSecondary: { backgroundColor: '#ffffff' },
  actionBtnPrimaryText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  actionBtnSecondaryText: { color: '#0f2930', fontSize: 12, fontWeight: '700' },
  cardContainer: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, backgroundColor: '#ffffff', marginBottom: 12 },
  cardHeaderSmall: { color: '#64748b', fontSize: 9.5, fontWeight: '700' },
  cardTitle: { color: '#0f2930', fontSize: 14.5, fontWeight: '800', marginTop: 2 },
  cardBadge: { borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: '#f8fafc' },
  cardBadgeText: { color: '#007b8a', fontSize: 10, fontWeight: '800' },
  otpStrip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', paddingHorizontal: 12, paddingVertical: 9, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', marginVertical: 10 },
  otpLabel: { color: '#475569', fontSize: 11, fontWeight: '500' },
  otpValue: { color: '#007b8a', fontSize: 16, fontWeight: '900', letterSpacing: 3 },
  cardActionRow: { flexDirection: 'row', gap: 10, marginTop: 2 },
  cardMiniBtn: { flex: 1, backgroundColor: '#007b8a', paddingVertical: 8, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  cardMiniBtnText: { color: '#ffffff', fontSize: 11.5, fontWeight: '700' },
  tabBar: { borderTopWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff', paddingTop: 6, paddingBottom: Platform.OS === 'ios' ? 18 : 8, paddingHorizontal: 10 },
  tabIconsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  tabItem: { alignItems: 'center', gap: 3 },
  tabSquare: { width: 38, height: 38, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' },
  tabSquareActive: { borderColor: '#007b8a', backgroundColor: '#e6f4f6' },
  tabLabel: { color: '#64748b', fontSize: 8.5, fontWeight: '700' },
  tabLabelActive: { color: '#007b8a' },
  subPageContainer: { backgroundColor: '#ffffff', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  pageHeader: { fontSize: 18, fontWeight: '800', color: '#0f2930' },
  pageSubHeader: { fontSize: 11.5, color: '#64748b', marginTop: 3, marginBottom: 16 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recordCard: { backgroundColor: '#f8fafc', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 12 },
  recordTitle: { fontSize: 14, fontWeight: '700', color: '#0f2930' },
  recordSubtitle: { fontSize: 11.5, color: '#64748b', marginTop: 2 },
  metaItem: { fontSize: 11.5, color: '#475569', marginTop: 2 },
  primaryBtn: { backgroundColor: '#007b8a', paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  primaryBtnText: { color: '#ffffff', fontSize: 12.5, fontWeight: '700' },
  stackedButtonGroup: { flexDirection: 'column', gap: 8 },
  machineCardTop: { flexDirection: 'row', gap: 12 },
  machineThumb: { width: 60, height: 60, borderRadius: 6 },
  emergencyBox: { backgroundColor: '#fff1f2', borderWidth: 1, borderColor: '#fecdd3', borderRadius: 10, padding: 12 },
  emergencyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  emergencyTitle: { fontSize: 14, fontWeight: '800', color: '#be123c' },
  emergencyTime: { fontSize: 10, fontWeight: '700', color: '#be123c', backgroundColor: '#ffe4e6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  emergencyDesc: { fontSize: 11, color: '#881337', marginBottom: 10 },
  sosActionBtn: { backgroundColor: '#e11d48', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  sosActiveBtn: { backgroundColor: '#9f1239' },
  sosActionBtnText: { color: '#ffffff', fontWeight: '800', fontSize: 12 },
  otpBanner: { backgroundColor: '#ecfeff', borderWidth: 1, borderColor: '#a5f3fc', borderRadius: 8, padding: 10, marginVertical: 10, alignItems: 'center' },
  otpBannerTitle: { fontSize: 10.5, color: '#0e7490', fontWeight: '600' },
  otpNumber: { fontSize: 20, fontWeight: '900', letterSpacing: 4, color: '#0891b2', marginVertical: 2 },
  otpNote: { fontSize: 10 },
  liveMapWrapper: { height: 260, width: '100%', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#f8fafc' },
  mapImage: { height: 260, width: '100%', borderRadius: 12 },
  profileHeroCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 12, marginBottom: 16 },
  profileAvatarLarge: { width: 52, height: 52, borderRadius: 26 },
  profileHeroText: { flex: 1, marginLeft: 12 },
  profileName: { fontSize: 14.5, fontWeight: '800', color: '#0f2930' },
  verifiedTag: { backgroundColor: '#dcfce7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start', marginTop: 3 },
  verifiedTagText: { fontSize: 9, fontWeight: '700', color: '#15803d' },
  profileIdText: { fontSize: 11, color: '#007b8a', marginTop: 2 },
  logoutBtn: { borderWidth: 1, borderColor: '#fecdd3', backgroundColor: '#fff1f2', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  logoutBtnText: { color: '#be123c', fontSize: 12, fontWeight: '700' },
  notifCard: { flexDirection: 'row', backgroundColor: '#f8fafc', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 10 },
  notifCardUnread: { backgroundColor: '#ffffff', borderLeftWidth: 3.5, borderLeftColor: '#007b8a' },
  notifIconCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  notifTitle: { fontSize: 13, fontWeight: '700', color: '#0f2930' },
  notifTime: { fontSize: 10, color: '#64748b' },
  notifDesc: { fontSize: 11.5, color: '#475569', marginTop: 2 },
  markReadBtn: { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#e0f2fe', borderRadius: 6 },
  markReadText: { fontSize: 10.5, color: '#0284c7', fontWeight: '700' },
});

export default MerilCustomerScreen;
