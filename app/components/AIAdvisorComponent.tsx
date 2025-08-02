import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const OPENROUTER_KEY = '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';

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
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + OPENROUTER_KEY,
          'HTTP-Referer': 'myshop-clothes-app',
        },
        body: JSON.stringify({
         model: 'openrouter/horizon-beta',
          messages: [
            { role: 'system', content: 'Bạn là trợ lý AI cho shop quần áo, chuyên tư vấn phối đồ, chọn size, mẹo mặc đẹp, trend thời trang...' },
            { role: 'user', content: aiInput }
          ],
          max_tokens: 350,
          temperature: 0.7,
        }),
      });

      const data = await res.json();
      console.log('OpenRouter data:', data);

      if (data?.choices?.[0]?.message?.content) {
        setAiResponse(data.choices[0].message.content.trim());
      } else if (data?.error?.message) {
        setAiResponse('Lỗi API: ' + data.error.message);
      } else {
        setAiResponse('Không thể nhận phản hồi từ AI.');
      }
    } catch (err) {
      setAiResponse('Lỗi mạng hoặc không thể kết nối OpenRouter.');
    }
    setAiLoading(false);
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>Hỏi AI thời trang 👗🧑‍💼</Text>
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
        <View style={styles.responseBox}>
          <Text style={styles.responseText}>{aiResponse}</Text>
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
