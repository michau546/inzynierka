import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Alert } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';

export default function CurrencyConverter() {
  const [amount, setAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [result, setResult] = useState(null);
  const [rates, setRates] = useState({});

  useEffect(() => {
    fetch('https://api.exchangerate-api.com/v4/latest/USD')
      .then(response => response.json())
      .then(data => setRates(data.rates))
      .catch(error => Alert.alert('Błąd', 'Nie udało się pobrać kursów wymiany.'));
  }, []);

  const convertCurrency = () => {
    if (!amount) {
      Alert.alert('Błąd', 'Proszę wprowadzić kwotę.');
      return;
    }
    const rate = rates[toCurrency] / rates[fromCurrency];
    const result = (amount * rate).toFixed(2);
    setResult(result);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kalkulator Walutowy</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Wprowadź kwotę"
        value={amount}
        onChangeText={setAmount}
      />
      <RNPickerSelect
        onValueChange={setFromCurrency}
        items={Object.keys(rates).map(currency => ({ label: currency, value: currency }))}
        value={fromCurrency}
      />
      <RNPickerSelect
        onValueChange={setToCurrency}
        items={Object.keys(rates).map(currency => ({ label: currency, value: currency }))}
        value={toCurrency}
      />
      <Button title="Przelicz" onPress={convertCurrency} />
      {result && (
        <Text style={styles.result}>
          {amount} {fromCurrency} = {result} {toCurrency}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    width: '100%',
  },
  result: {
    marginTop: 20,
    fontSize: 18,
  },
});
