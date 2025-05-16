import React from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert } from 'react-native';
import * as MailComposer from 'expo-mail-composer';

export default function FeedbackScreen() {
  const [feedback, setFeedback] = React.useState('');
  const [email, setEmail] = React.useState('');

  const handleSend = async () => {
    if (!feedback.trim()) {
      Alert.alert('Erro', 'Por favor, digite seu feedback.');
      return;
    }
    await MailComposer.composeAsync({
      recipients: ['jusagenda@suporte.com'],
      subject: 'Feedback JusAgenda',
      body: `Mensagem: ${feedback}\nUsuário: ${email}`,
    });
    Alert.alert('Obrigado!', 'Seu feedback foi enviado.');
    setFeedback('');
    setEmail('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Envie seu Feedback</Text>
      <TextInput
        style={styles.input}
        placeholder="Seu e-mail (opcional)"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Digite seu feedback aqui..."
        value={feedback}
        onChangeText={setFeedback}
        multiline
      />
      <Button title="Enviar" onPress={handleSend} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    fontSize: 16,
  },
});
