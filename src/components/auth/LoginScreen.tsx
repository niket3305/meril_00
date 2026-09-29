import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { CustomSelect } from '../common/CustomSelect';
import {
  ShieldCheck,
  Wrench,
  ArrowRight,
  Activity,
  Lock,
  Mail,
  Hospital,
  User,
  Phone,
  Building2,
  Briefcase,
  MapPin,
  Stethoscope,
  IdCard,
} from 'lucide-react-native';

// ─── Dropdown options ──────────────────────────────────────────────────────────

const DEPT_OPTIONS = [
  { label: 'Cardiology CathLab', value: 'Cardiology CathLab' },
  { label: 'Orthopedics OT', value: 'Orthopedics OT' },
  { label: 'Neurology ICU', value: 'Neurology ICU' },
  { label: 'Endosurgery Suite', value: 'Endosurgery Suite' },
  { label: 'In-Vitro Diagnostics', value: 'In-Vitro Diagnostics' },
  { label: 'ENT & Neuro OT', value: 'ENT & Neuro OT' },
  { label: 'Biomedical Engineering', value: 'Biomedical Engineering' },
  { label: 'General ICU / HDU', value: 'General ICU / HDU' },
  { label: 'Radiology & Imaging', value: 'Radiology & Imaging' },
];

const FACILITY_TYPE_OPTIONS = [
  { label: 'Multispecialty Hospital', value: 'Multispecialty Hospital' },
  { label: 'Cardiology Center', value: 'Cardiology Center' },
  { label: 'Orthopedic Institute', value: 'Orthopedic Institute' },
  { label: 'Diagnostic Lab', value: 'Diagnostic Lab' },
  { label: 'Government Hospital', value: 'Government Hospital' },
  { label: 'Nursing Home / Clinic', value: 'Nursing Home / Clinic' },
];

const CITY_OPTIONS = [
  { label: 'Mumbai', value: 'Mumbai' },
  { label: 'Delhi NCR', value: 'Delhi NCR' },
  { label: 'Bengaluru', value: 'Bengaluru' },
  { label: 'Chennai', value: 'Chennai' },
  { label: 'Hyderabad', value: 'Hyderabad' },
  { label: 'Pune', value: 'Pune' },
  { label: 'Ahmedabad', value: 'Ahmedabad' },
  { label: 'Kolkata', value: 'Kolkata' },
  { label: 'Jaipur', value: 'Jaipur' },
  { label: 'Surat', value: 'Surat' },
];

const SPECIALIZATION_OPTIONS = [
  { label: 'Cardiovascular & Consoles', value: 'Cardiovascular & Consoles' },
  { label: 'Orthopedics & Robotics', value: 'Orthopedics & Robotics' },
  { label: 'Endosurgery Systems', value: 'Endosurgery Systems' },
  { label: 'In-Vitro Diagnostics (IVD)', value: 'In-Vitro Diagnostics (IVD)' },
  { label: 'ENT & Neuro Equipment', value: 'ENT & Neuro Equipment' },
  { label: 'Imaging & Radiology', value: 'Imaging & Radiology' },
];

const ADMIN_DIVISION_OPTIONS = [
  { label: 'Central Service Operations', value: 'Central Service Operations' },
  { label: 'Regional Dispatch (West)', value: 'Regional Dispatch (West)' },
  { label: 'Regional Dispatch (North)', value: 'Regional Dispatch (North)' },
  { label: 'Regional Dispatch (South)', value: 'Regional Dispatch (South)' },
  { label: 'Regional Dispatch (East)', value: 'Regional Dispatch (East)' },
  { label: 'Customer Success', value: 'Customer Success' },
  { label: 'Quality & Compliance', value: 'Quality & Compliance' },
];

// ─── Sub-component: Input Field ────────────────────────────────────────────────
interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  icon: React.ReactNode;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}
const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  keyboardType = 'default',
  secureTextEntry = false,
  autoCapitalize = 'sentences',
}) => (
  <View className="space-y-1.5">
    <Text className="text-xs font-bold text-slate-600 tracking-wide uppercase">{label}</Text>
    <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 gap-3">
      {icon}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        className="flex-1 text-sm font-medium text-slate-900"
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
      />
    </View>
  </View>
);

// ─── Main Component ────────────────────────────────────────────────────────────
export const LoginScreen: React.FC = () => {
  const { login, signup } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);

  // Common
  const [email, setEmail] = useState('biomedical.apollo@apollohospitals.com');
  const [password, setPassword] = useState('••••••••••••');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  // Customer-specific
  const [facilityName, setFacilityName] = useState('');
  const [facilityType, setFacilityType] = useState('Multispecialty Hospital');
  const [department, setDepartment] = useState('Cardiology CathLab');
  const [addressLine, setAddressLine] = useState('');
  const [pincode, setPincode] = useState('');
  const [customerCity, setCustomerCity] = useState('Mumbai');

  // Admin-specific
  const [employeeId, setEmployeeId] = useState('');
  const [adminDivision, setAdminDivision] = useState('Central Service Operations');

  // Engineer-specific
  const [engineerCity, setEngineerCity] = useState('Mumbai');
  const [specialization, setSpecialization] = useState('Cardiovascular & Consoles');

  // ─── Role color theme ──────────────────────────────────────────────────────
  const roleTheme = {
    customer: {
      bg: 'bg-emerald-700',
      light: 'bg-emerald-50',
      border: 'border-emerald-300',
      text: 'text-emerald-900',
      activeIcon: '#059669',
      badge: 'bg-emerald-100 border-emerald-300',
    },
    admin: {
      bg: 'bg-blue-800',
      light: 'bg-blue-50',
      border: 'border-blue-300',
      text: 'text-blue-900',
      activeIcon: '#1d4ed8',
      badge: 'bg-blue-100 border-blue-300',
    },
    engineer: {
      bg: 'bg-amber-600',
      light: 'bg-amber-50',
      border: 'border-amber-300',
      text: 'text-amber-900',
      activeIcon: '#d97706',
      badge: 'bg-amber-100 border-amber-300',
    },
  };
  const theme = roleTheme[selectedRole];

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setAuthMode('signin');
    if (role === 'customer') setEmail('biomedical.apollo@apollohospitals.com');
    else if (role === 'admin') setEmail('dispatch.central@merillife.com');
    else setEmail('rajesh.kumar@merillife.com');
  };

  const handleFillDemo = (role: UserRole) => {
    handleRoleChange(role);
  };

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert('Validation Error', 'Please enter your email.');
      return;
    }
    setLoading(true);
    try {
      if (authMode === 'signin') {
        await login(selectedRole, email.trim(), password);
      } else {
        if (!fullName.trim()) {
          Alert.alert('Validation Error', 'Please enter your full name.');
          return;
        }
        await signup({
          name: fullName.trim(),
          email: email.trim(),
          role: selectedRole,
          password,
          phone: phone.trim(),
          facilityName:
            selectedRole === 'customer' ? facilityName.trim() : undefined,
          department:
            selectedRole === 'customer'
              ? department
              : selectedRole === 'admin'
              ? adminDivision
              : undefined,
          employeeId:
            selectedRole === 'admin' ? employeeId.trim() : undefined,
          specialization:
            selectedRole === 'engineer' ? specialization : undefined,
          city:
            selectedRole === 'engineer'
              ? engineerCity
              : selectedRole === 'customer'
              ? customerCity
              : undefined,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const roleLabel = selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1);

  return (
    <ScrollView
      className="flex-1 bg-slate-100"
      contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="max-w-lg mx-auto w-full space-y-6">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <View className="items-center pt-6 pb-2 space-y-3">
          <View className="flex-row items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-xs">
            <Activity size={14} color="#2563eb" />
            <Text className="text-blue-800 text-xs font-bold tracking-wider uppercase">
              Meril Life Sciences
            </Text>
          </View>
          <Text className="text-2xl font-black text-slate-900 tracking-tight text-center">
            Medical Device{'\n'}Service Platform
          </Text>
        </View>

        {/* ── Auth Card ──────────────────────────────────────────────────── */}
        <View className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">

          {/* Role Tabs */}
          <View className="flex-row bg-slate-50 border-b border-slate-200">
            {(['customer', 'admin', 'engineer'] as UserRole[]).map((role) => {
              const isActive = selectedRole === role;
              const icons = {
                customer: <Hospital size={15} color={isActive ? roleTheme[role].activeIcon : '#94a3b8'} />,
                admin: <ShieldCheck size={15} color={isActive ? roleTheme[role].activeIcon : '#94a3b8'} />,
                engineer: <Wrench size={15} color={isActive ? roleTheme[role].activeIcon : '#94a3b8'} />,
              };
              return (
                <Pressable
                  key={role}
                  onPress={() => handleRoleChange(role)}
                  className={`flex-1 py-3.5 items-center gap-1 border-b-2 ${
                    isActive ? `border-b-2 bg-white` : 'border-transparent'
                  }`}
                  style={isActive ? { borderBottomColor: roleTheme[role].activeIcon } : {}}
                >
                  {icons[role]}
                  <Text
                    className={`text-[11px] font-bold ${
                      isActive ? roleTheme[role].text : 'text-slate-400'
                    }`}
                  >
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View className="p-5 space-y-5">
            {/* Sign In / Sign Up toggle */}
            <View className="flex-row bg-slate-100 rounded-2xl p-1">
              {(['signin', 'signup'] as const).map((mode) => (
                <Pressable
                  key={mode}
                  onPress={() => setAuthMode(mode)}
                  className={`flex-1 py-2.5 rounded-xl items-center ${
                    authMode === mode ? 'bg-white shadow-xs' : ''
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      authMode === mode ? 'text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    {mode === 'signin' ? 'Sign In' : 'Sign Up'}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* ── SIGN UP FIELDS ─────────────────────────────────────────── */}
            {authMode === 'signup' && (
              <View className="space-y-4">
                {/* ─── COMMON ─── */}
                <InputField
                  label="Full Name"
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Dr. Priya Sharma"
                  icon={<User size={16} color="#94a3b8" />}
                />
                <InputField
                  label="Phone Number"
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+91 98000 00000"
                  icon={<Phone size={16} color="#94a3b8" />}
                  keyboardType="phone-pad"
                />

                {/* ─── CUSTOMER ─── */}
                {selectedRole === 'customer' && (
                  <View className="space-y-4">
                    <View className="h-px bg-slate-100" />
                    <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Facility Details
                    </Text>

                    <InputField
                      label="Hospital / Facility Name"
                      value={facilityName}
                      onChangeText={setFacilityName}
                      placeholder="Apollo Multispecialty Hospital"
                      icon={<Building2 size={16} color="#94a3b8" />}
                    />

                    <CustomSelect
                      label="Facility Type"
                      options={FACILITY_TYPE_OPTIONS}
                      selectedValue={facilityType}
                      onValueChange={setFacilityType}
                      placeholder="Select facility type"
                    />

                    <CustomSelect
                      label="Clinical Department"
                      options={DEPT_OPTIONS}
                      selectedValue={department}
                      onValueChange={setDepartment}
                      placeholder="Select department"
                    />

                    <InputField
                      label="Street Address"
                      value={addressLine}
                      onChangeText={setAddressLine}
                      placeholder="123, Main Road, Medical Colony"
                      icon={<MapPin size={16} color="#94a3b8" />}
                    />

                    <View className="flex-row gap-3">
                      <View className="flex-1">
                        <CustomSelect
                          label="City"
                          options={CITY_OPTIONS}
                          selectedValue={customerCity}
                          onValueChange={setCustomerCity}
                          placeholder="Select city"
                        />
                      </View>
                      <View className="w-28">
                        <InputField
                          label="PIN Code"
                          value={pincode}
                          onChangeText={setPincode}
                          placeholder="400001"
                          icon={<MapPin size={16} color="#94a3b8" />}
                          keyboardType="phone-pad"
                        />
                      </View>
                    </View>
                  </View>
                )}

                {/* ─── ADMIN ─── */}
                {selectedRole === 'admin' && (
                  <View className="space-y-4">
                    <View className="h-px bg-slate-100" />
                    <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Admin Profile
                    </Text>

                    <InputField
                      label="Employee ID"
                      value={employeeId}
                      onChangeText={setEmployeeId}
                      placeholder="MRL-ADM-042"
                      icon={<IdCard size={16} color="#94a3b8" />}
                      autoCapitalize="characters"
                    />

                    <CustomSelect
                      label="Division / Unit"
                      options={ADMIN_DIVISION_OPTIONS}
                      selectedValue={adminDivision}
                      onValueChange={setAdminDivision}
                      placeholder="Select division"
                    />
                  </View>
                )}

                {/* ─── ENGINEER ─── */}
                {selectedRole === 'engineer' && (
                  <View className="space-y-4">
                    <View className="h-px bg-slate-100" />
                    <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Engineer Profile
                    </Text>

                    <CustomSelect
                      label="Specialization"
                      options={SPECIALIZATION_OPTIONS}
                      selectedValue={specialization}
                      onValueChange={setSpecialization}
                      placeholder="Select specialization"
                    />

                    <CustomSelect
                      label="Base City / Territory"
                      options={CITY_OPTIONS}
                      selectedValue={engineerCity}
                      onValueChange={setEngineerCity}
                      placeholder="Select city"
                    />
                  </View>
                )}
              </View>
            )}

            {/* ── COMMON AUTH FIELDS ─────────────────────────────────────── */}
            <View className="space-y-3">
              <InputField
                label={
                  selectedRole === 'customer'
                    ? 'Hospital Email'
                    : selectedRole === 'admin'
                    ? 'Admin Email'
                    : 'Engineer Email'
                }
                value={email}
                onChangeText={setEmail}
                placeholder="name@domain.com"
                icon={<Mail size={16} color="#94a3b8" />}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <InputField
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••••••"
                icon={<Lock size={16} color="#94a3b8" />}
                secureTextEntry
              />

              {authMode === 'signup' && (
                <InputField
                  label="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="••••••••••••"
                  icon={<Lock size={16} color="#94a3b8" />}
                  secureTextEntry
                />
              )}
            </View>

            {/* ── Submit Button ──────────────────────────────────────────── */}
            <Pressable
              onPress={handleSubmit}
              disabled={loading}
              className={`py-4 rounded-2xl flex-row items-center justify-center gap-2 shadow-md ${theme.bg}`}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <Text className="text-white text-sm font-bold tracking-wide">
                    {authMode === 'signin'
                      ? `Sign In as ${roleLabel}`
                      : `Create ${roleLabel} Account`}
                  </Text>
                  <ArrowRight size={16} color="#ffffff" />
                </>
              )}
            </Pressable>

            {/* ── Quick Demo Accounts ────────────────────────────────────── */}
            <View className="space-y-2.5">
              <View className="flex-row items-center gap-2">
                <View className="flex-1 h-px bg-slate-200" />
                <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Quick Demo Login
                </Text>
                <View className="flex-1 h-px bg-slate-200" />
              </View>
              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => handleFillDemo('customer')}
                  className="flex-1 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 items-center"
                >
                  <Hospital size={13} color="#059669" />
                  <Text className="text-[10px] font-bold text-emerald-800 mt-0.5">Customer</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleFillDemo('admin')}
                  className="flex-1 py-2.5 rounded-xl border border-blue-200 bg-blue-50 items-center"
                >
                  <ShieldCheck size={13} color="#1d4ed8" />
                  <Text className="text-[10px] font-bold text-blue-800 mt-0.5">Admin</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleFillDemo('engineer')}
                  className="flex-1 py-2.5 rounded-xl border border-amber-200 bg-amber-50 items-center"
                >
                  <Wrench size={13} color="#d97706" />
                  <Text className="text-[10px] font-bold text-amber-800 mt-0.5">Engineer</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <Text className="text-center text-[10px] text-slate-400 font-medium pb-2">
          Meril Life Sciences Ltd. • Field Service Management v2.0
        </Text>
      </View>
    </ScrollView>
  );
};
