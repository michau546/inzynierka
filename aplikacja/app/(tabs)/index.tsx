import React, { useEffect, useState } from 'react';
import { StyleSheet, Button, TextInput, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { db } from '../../firebase'; // Ensure Firebase configuration is correctly imported
import { Text, View } from '@/components/Themed';
import { collection, addDoc, updateDoc, doc, onSnapshot } from 'firebase/firestore';

const fetchExchangeRates = async () => {
  try {
    const response = await fetch('http://api.nbp.pl/api/exchangerates/tables/A?format=json');
    const data = await response.json();
    return data[0].rates;
  } catch (error) {
    console.error('Error fetching exchange rates: ', error);
  }
};

export default function WalletScreen() {
  const [data, setData] = useState([]);
  const [rates, setRates] = useState([]);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('PLN');
  const [newCurrency, setNewCurrency] = useState('USD');
  const [showPicker, setShowPicker] = useState(null); // Track which item is being exchanged

  useEffect(() => {
    const q = collection(db, 'wallets');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dataList = [];
      snapshot.forEach((doc) => {
        dataList.push({ ...doc.data(), id: doc.id });
      });
      setData(dataList);
    });

    fetchExchangeRates().then((rates) => setRates(rates));

    return () => unsubscribe();
  }, []);

  const addCurrency = async () => {
    try {
      const selectedRate = rates.find((rate) => rate.code === currency);
      if (!selectedRate) {
        Alert.alert('Error', 'Exchange rate for the specified currency not found');
        return;
      }

      await addDoc(collection(db, 'wallets'), {
        currency: currency,
        amount: parseFloat(amount),
        rate: selectedRate.mid,
      });
      setCurrency('PLN');
      setAmount('');
    } catch (e) {
      console.error('Error adding document: ', e);
    }
  };

  const exchangeCurrency = async (id, newAmount, newCurrency) => {
    try {
      const docRef = doc(db, 'wallets', id);
      await updateDoc(docRef, {
        amount: newAmount,
        currency: newCurrency,
      });
    } catch (e) {
      console.error('Error updating document: ', e);
    }
  };

  const handleExchange = (id, currentAmount, currentCurrency) => {
    const currentData = data.find((item) => item.id === id);
    const newRate = rates.find((rate) => rate.code === newCurrency);

    if (currentData && newRate) {
      const newAmount = (parseFloat(currentAmount) * currentData.rate) / newRate.mid;
      exchangeCurrency(id, newAmount.toFixed(2), newCurrency);
      setShowPicker(null);
    } else {
      Alert.alert('Error', 'Exchange rate for the specified currency not found');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wallet</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />

      <Picker
        selectedValue={currency}
        style={styles.picker}
        onValueChange={(itemValue) => setCurrency(itemValue)}
      >
        <Picker.Item label="PLN" value="PLN" />
        {rates.map((rate) => (
          <Picker.Item key={rate.code} label={`${rate.currency} (${rate.code})`} value={rate.code} />
        ))}
      </Picker>
      
      <TextInput
        style={styles.input}
        placeholder="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />
      <Button title="Add Currency" onPress={addCurrency} />

      {data.map((item) => (
        <View key={item.id} style={styles.item}>
          <Text>{item.currency}: {item.amount}</Text>
          <Button title="Exchange" onPress={() => setShowPicker(item.id)} />
          {showPicker === item.id && (
            <>
              <Picker
                selectedValue={newCurrency}
                style={styles.picker}
                onValueChange={(itemValue) => setNewCurrency(itemValue)}
              >
                {rates.map((rate) => (
                  <Picker.Item key={rate.code} label={`${rate.currency} (${rate.code})`} value={rate.code} />
                ))}
              </Picker>
              <Button title="Confirm Exchange" onPress={() => handleExchange(item.id, item.amount, item.currency)} />
            </>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  item: {
    marginVertical: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
    width: '80%',
  },
  picker: {
    height: 50,
    width: '80%',
    marginBottom: 10,
  },
});
