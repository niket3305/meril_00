import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
}

export interface MerilChatBotModalProps {
  visible: boolean;
  onClose: () => void;
}

const KNOWLEDGE_BASE: { keywords: string[]; answer: string }[] = [
  {
    keywords: ['myval', 'valve', 'aortic', 'thv', 'stenosis', 'tavr'],
    answer:
      "Myval THV series is India's first indigenously developed transcatheter aortic heart valve system for treating severe aortic stenosis, offering precise intermediate sizing and proven low transvalvular gradients.",
  },
  {
    keywords: ['meres', 'meres100', 'scaffold', 'brs', 'stent', 'coronary'],
    answer:
      "MeRes100 is the world's first 100-micron thin-strut bioresorbable vascular scaffold (BRS), engineered to provide temporary vessel support and dissolve completely in coronary arteries over time.",
  },
  {
    keywords: ['misso', 'cuvis', 'robot', 'robotic', 'ortho', 'joint', 'knee', 'hip'],
    answer:
      'Meril Orthopedics features MISSO and Cuvis robotic-assisted surgical systems for high-precision knee and hip joint replacements with personalized CT pre-planning and sub-millimeter bone resection.',
  },
  {
    keywords: ['suture', 'endo', 'mesh', 'stapler', 'hemostat', 'sealant', 'surgery'],
    answer:
      'Meril Endo-Surgery provides absorbable and non-absorbable surgical sutures (Filacryl, MeriGlean), tissue sealants, absorbable hemostats, hernia repair meshes, and mechanical endocutters/staplers.',
  },
  {
    keywords: ['ivd', 'diagnostics', 'analyzer', 'reagent', 'elisa', 'quant-mate', 'autochem'],
    answer:
      'Meril In-Vitro Diagnostics (IVD) covers clinical chemistry analyzers (AutoChem series), automated hematology counters, ELISA kits, and rapid testing strips for point-of-care diagnosis.',
  },
  {
    keywords: ['service', 'sos', 'engineer', 'ticket', 'repair', 'technician', 'otp'],
    answer:
      'For service emergencies or breakdown repairs, tap the 4-Hour Emergency SOS in the portal. A field specialist will arrive and request your rolling 4-digit OTP to complete sign-off.',
  },
];

export const MerilChatBotModal: React.FC<MerilChatBotModalProps> = ({ visible, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: 'Hello! I am your Meril MedTech AI Assistant. Ask me about Myval THV, MeRes100 scaffolds, MISSO robotics, surgical sutures, or IVD analyzers.',
    },
  ]);
  const [inputText, setInputText] = useState('');

  const getBotResponse = (query: string): string => {
    const q = query.toLowerCase();
    for (const entry of KNOWLEDGE_BASE) {
      if (entry.keywords.some((k) => q.includes(k))) {
        return entry.answer;
      }
    }
    return 'Meril manufactures advanced medtech solutions across Vascular Intervention (Myval, MeRes100), Robotics (MISSO, Cuvis), Endo-Surgery, and IVD Diagnostics. You can ask for technical specifications, product indications, or service requests.';
  };

  const handleSend = (userQuery?: string) => {
    const textToSend = userQuery || inputText;
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend.trim(),
    };

    const replyText = getBotResponse(textToSend);
    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      sender: 'bot',
      text: replyText,
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    if (!userQuery) setInputText('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.chatContainer}>
          {/* Header */}
          <View style={styles.chatHeader}>
            <View style={styles.headerLeftGroup}>
              <View style={styles.botIconCircle}>
                <Ionicons name="sparkles" size={16} color="#ffffff" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Meril MedTech AI</Text>
                <Text style={styles.headerStatus}>● Live Product Knowledge Base</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Prompt Suggestion Chips */}
          <View style={styles.pillsRow}>
            {['Myval THV', 'MeRes100 BRS', 'MISSO Robotics', 'IVD Analyzers', 'Emergency SOS'].map(
              (pill, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.pill}
                  onPress={() => handleSend(`Tell me about ${pill}`)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.pillText}>{pill}</Text>
                </TouchableOpacity>
              )
            )}
          </View>

          {/* Chat Messages */}
          <ScrollView contentContainerStyle={styles.messagesScroll} showsVerticalScrollIndicator={false}>
            {messages.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.messageBubble,
                  item.sender === 'user' ? styles.userBubble : styles.botBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    item.sender === 'user' ? styles.userMessageText : styles.botMessageText,
                  ]}
                >
                  {item.text}
                </Text>
              </View>
            ))}
          </ScrollView>

          {/* Chat Input Field */}
          <View style={styles.inputArea}>
            <TextInput
              style={styles.textInput}
              placeholder="Ask about Myval, MISSO, sutures..."
              placeholderTextColor="#94a3b8"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={() => handleSend()}
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={() => handleSend()}
              activeOpacity={0.8}
            >
              <Ionicons name="send" size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  chatContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '82%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  headerLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  botIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007b8a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f2930',
  },
  headerStatus: {
    fontSize: 10,
    color: '#16a34a',
    fontWeight: '600',
  },
  closeBtn: {
    padding: 6,
  },
  pillsRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
    flexWrap: 'wrap',
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: '#e6f4f6',
    borderWidth: 1,
    borderColor: '#007b8a',
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#007b8a',
  },
  messagesScroll: {
    padding: 16,
    gap: 12,
  },
  messageBubble: {
    maxWidth: '82%',
    padding: 12,
    borderRadius: 14,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#007b8a',
    borderBottomRightRadius: 2,
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5f9',
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18,
  },
  userMessageText: {
    color: '#ffffff',
  },
  botMessageText: {
    color: '#0f2930',
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0f2930',
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#007b8a',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MerilChatBotModal;
