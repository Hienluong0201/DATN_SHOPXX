import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Keyboard,ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const GEMINI_API_KEY = 'AIzaSyAfH5zVG1isAAYD8WCBcuoz0w3_j5VXwf8';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

export default function AIAdvisorComponent() {
  const [aiInput, setAiInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const handleAskAI = async () => {
    if (!aiInput.trim()) return;
    setAiLoading(true);
    setAiResponse('');
    Keyboard.dismiss();

    try {
      const res = await fetch(GEMINI_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: `Bạn là trợ lý AI cho shop quần áo, chuyên tư vấn phối đồ, chọn size, mẹo mặc đẹp, trend thời trang...
Câu hỏi của user: ${aiInput}` }
              ]
            }
          ]
        }),
      });

      const data = await res.json();
      // Xử lý trả lời
      const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (answer) {
        setAiResponse(answer.trim());
      } else if (data?.error?.message) {
        setAiResponse('Lỗi API: ' + data.error.message);
      } else {
        setAiResponse('Không thể nhận phản hồi từ Gemini AI.');
      }
    } catch (err) {
      setAiResponse('Lỗi mạng hoặc không thể kết nối Gemini.');
    }
    setAiLoading(false);
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>Hỏi AI thời trang 👗🧑‍💼 (Gemini)</Text>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Ví dụ: Mix áo thun trắng với quần gì? Nên mặc size nào nếu cao 1m7?"
          value={aiInput}
          onChangeText={setAiInput}
          editable={!aiLoading}
          onSubmitEditing={handleAskAI}
          returnKeyType="send"
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleAskAI} disabled={aiLoading}>
          {aiLoading
            ? <ActivityIndicator size={18} color="#fff" />
            : <Ionicons name="send" size={20} color="#fff" />
          }
        </TouchableOpacity>
      </View>
      {!!aiResponse && (
  <View style={[styles.responseBox, { maxHeight: 350 }]}>
    <ScrollView  showsVerticalScrollIndicator={false}>
      <Text style={styles.responseText}>{aiResponse}</Text>
    </ScrollView>
  </View>
)}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 14,
    paddingTop: 18,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomColor: '#f6f6f6',
    borderBottomWidth: 1,
    marginBottom: 10,
    borderRadius: 12,
    shadowColor: '#ddd',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 8,
    elevation: 2,
  },
  title: { fontWeight: 'bold', fontSize: 16, marginBottom: 8, color: '#282828' },
  row: { flexDirection: 'row', alignItems: 'center' },
  input: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    borderRadius: 16,
    paddingVertical: 9,
    paddingHorizontal: 15,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#ebebeb',
  },
  sendBtn: {
    marginLeft: 8,
    backgroundColor: '#d4af37',
    padding: 8,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center'
  },
  responseBox: {
    backgroundColor: '#faf7ea',
    marginTop: 10,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee8c6'
  },
  responseText: { color: '#444', fontSize: 14 }
});
