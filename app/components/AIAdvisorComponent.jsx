// File: AIAdvisorComponent.js
import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Keyboard,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const GEMINI_API_KEY = 'AIzaSyAfH5zVG1isAAYD8WCBcuoz0w3_j5VXwf8';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

const SUGGESTIONS = [
  'Mình cao 1m70 nặng 65kg nên chọn size áo nào?',
  'Phối áo thun trắng với quần gì để đi cafe?',
  'Gợi ý outfit đi làm mát mẻ mà lịch sự',
  'Quần jean form nào hợp người đùi to?',
  'Trend thời trang Thu/Đông năm nay?',
];

export default function AIAdvisorComponent({ onClose }) {
  const [aiInput, setAiInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const askGemini = async (question) => {
    setAiLoading(true);
    setAiResponse('');
    Keyboard.dismiss();
    try {
      const res = await fetch(GEMINI_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text:
`Bạn là trợ lý AI cho shop quần áo: tư vấn phối đồ, chọn size, chất liệu, bảo quản, trend.
Yêu cầu: trả lời ngắn gọn, gợi ý 2–3 lựa chọn, có size/chất liệu (nếu cần), dùng tiếng Việt thân thiện.
Câu hỏi của khách: ${question}`,
                },
              ],
            },
          ],
        }),
      });
      const data = await res.json();
      const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (answer) setAiResponse(answer.trim());
      else if (data?.error?.message) setAiResponse('Lỗi API: ' + data.error.message);
      else setAiResponse('Không thể nhận phản hồi từ Gemini AI.');
    } catch (e) {
      setAiResponse('Lỗi mạng hoặc không thể kết nối Gemini.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAskAI = async (override) => {
    const q = (override ?? aiInput).trim();
    if (!q) return;
    await askGemini(q);
    if (!override) setAiInput('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header đẹp + nút tắt */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {onClose ? (
              <Pressable onPress={onClose} style={styles.iconBtn}>
                <Ionicons name="chevron-down" size={22} color="#1f2937" />
              </Pressable>
            ) : null}
            <Text style={styles.title}>Tư vấn thời trang AI</Text>
          </View>

          {!!aiResponse && (
            <Pressable onPress={() => setAiResponse('')} style={styles.iconBtn}>
              <Ionicons name="trash-outline" size={20} color="#6b7280" />
            </Pressable>
          )}
        </View>

        {/* Nội dung */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {aiResponse ? (
            <View style={styles.responseBox}>
              <Text style={styles.responseText}>{aiResponse}</Text>
            </View>
          ) : (
            <View style={styles.placeholder}>
              <Ionicons name="sparkles-outline" size={24} color="#6b7280" />
              <Text style={styles.placeholderText}>
                Hỏi bất cứ điều gì về mix đồ, size, chất liệu, trend…
              </Text>
            </View>
          )}

          <Text style={styles.suggestTitle}>Gợi ý nhanh</Text>
          <View style={styles.chipsWrap}>
            {SUGGESTIONS.map((s, i) => (
              <TouchableOpacity key={i} style={styles.chip} onPress={() => handleAskAI(s)} disabled={aiLoading}>
                <Text style={styles.chipText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Thanh nhập ở đáy */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Ví dụ: Mix áo thun trắng với quần gì? Nên mặc size nào nếu cao 1m7?"
            value={aiInput}
            onChangeText={setAiInput}
            editable={!aiLoading}
            onSubmitEditing={() => handleAskAI()}
            returnKeyType="send"
          />
          <TouchableOpacity style={styles.sendBtn} onPress={() => handleAskAI()} disabled={aiLoading}>
            {aiLoading ? <ActivityIndicator size={18} color="#fff" /> : <Ionicons name="send" size={18} color="#fff" />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Loading overlay */}
      {aiLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Đang suy nghĩ…</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const BRAND = '#8B4513'; // đổi theo màu thương hiệu của bạn

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  /* Header */
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: {
    padding: 8,
    borderRadius: 999,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  title: { fontSize: 17, fontWeight: '700', color: '#1f2937' },

  /* Content */
  content: { flex: 1 },
  contentContainer: { padding: 16, paddingBottom: 8 },

  responseBox: {
    backgroundColor: '#faf7ea',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#eee8c6',
  },
  responseText: { color: '#374151', fontSize: 15, lineHeight: 22 },

  placeholder: {
    borderWidth: 1,
    borderColor: '#f1f1f1',
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: 24,
    alignItems: 'center',
    gap: 10,
  },
  placeholderText: { color: '#6b7280', fontSize: 14, textAlign: 'center' },

  suggestTitle: { marginTop: 16, marginBottom: 8, fontWeight: '600', color: '#374151' },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: { fontSize: 13, color: '#374151' },

  /* Input bar */
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopColor: '#eee',
    borderTopWidth: 1,
    padding: 12,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#ebebeb',
  },
  sendBtn: {
    marginLeft: 8,
    backgroundColor: BRAND,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Loading overlay */
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { marginTop: 8, color: '#374151' },
});
