// pomocBudzetowa.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Alert } from 'react-native';
import { useNavigation } from 'expo-router';
import { db } from '../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker';

export default function PomocBudzetowa() {
  const [monthlyBudget, setMonthlyBudget] = useState('');
  const [budgetDetails, setBudgetDetails] = useState({ kosztyZycia: 0, zachcianki: 0, oszczednosci: 0, niespodziewaneWydatki: 0 });
  const [selectedMonth, setSelectedMonth] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    if (monthlyBudget && selectedMonth) {
      calculateBudgetDetails();
    }
  }, [monthlyBudget, selectedMonth]);

  const calculateBudgetDetails = async () => {
    const budget = parseFloat(monthlyBudget);
    const kosztyZycia = budget * 0.5;

    // Fetch calendar expenses for the selected month
    const expensesCollection = collection(db, 'expenses');
    const q = query(expensesCollection, where('date', '>=', `${selectedMonth}-01`), where('date', '<=', `${selectedMonth}-31`));
    const expenseSnapshot = await getDocs(q);
    const expenseList = expenseSnapshot.docs.map(doc => doc.data());

    const niespodziewaneWydatki = expenseList.reduce((total, exp) => total + exp.amount, 0);
    const remainingAmount = kosztyZycia - niespodziewaneWydatki;

    const zachcianki = remainingAmount * 0.3;
    const oszczednosci = remainingAmount * 0.2;

    setBudgetDetails({ kosztyZycia, zachcianki, oszczednosci, niespodziewaneWydatki });
  };

  const handleSaveBudget = () => {
    if (monthlyBudget && selectedMonth) {
      calculateBudgetDetails();
      Alert.alert('Budżet Zapisany', `Twój miesięczny budżet to ${monthlyBudget} PLN na ${selectedMonth}`);
    } else {
      Alert.alert('Błąd', 'Proszę wprowadzić kwotę budżetu i wybrać miesiąc.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ustaw Miesięczny Budżet</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Wprowadź miesięczny budżet"
        value={monthlyBudget}
        onChangeText={setMonthlyBudget}
      />
      <Picker
        selectedValue={selectedMonth}
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedMonth(itemValue)}
      >
        <Picker.Item label="Wybierz Miesiąc" value="" />
        <Picker.Item label="Styczeń" value="2024-01" />
        <Picker.Item label="Luty" value="2024-02" />
        <Picker.Item label="Marzec" value="2024-03" />
        <Picker.Item label="Kwiecień" value="2024-04" />
        <Picker.Item label="Maj" value="2024-05" />
        <Picker.Item label="Czerwiec" value="2024-06" />
        <Picker.Item label="Lipiec" value="2024-07" />
        <Picker.Item label="Sierpień" value="2024-08" />
        <Picker.Item label="Wrzesień" value="2024-09" />
        <Picker.Item label="Październik" value="2024-10" />
        <Picker.Item label="Listopad" value="2024-11" />
        <Picker.Item label="Grudzień" value="2024-12" />
      </Picker>
      <Button title="Zapisz Budżet" onPress={handleSaveBudget} />
      {budgetDetails.kosztyZycia > 0 && (
        <View style={styles.detailsContainer}>
          <Text style={styles.detailText}>Koszty Życia: {budgetDetails.kosztyZycia.toFixed(2)} PLN</Text>
          <Text style={styles.detailText}>Niespodziewane Wydatki: {budgetDetails.niespodziewaneWydatki.toFixed(2)} PLN</Text>
          <Text style={styles.detailText}>Zachcianki: {budgetDetails.zachcianki.toFixed(2)} PLN</Text>
          <Text style={styles.detailText}>Oszczędności: {budgetDetails.oszczednosci.toFixed(2)} PLN</Text>
        </View>
      )}
      <Button title="Przejdź do Kalendarza" onPress={() => navigation.navigate('pomocBydzetowaCalendar')} />
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
  picker: {
    height: 50,
    width: 200,
    marginBottom: 20,
  },
  detailsContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  detailText: {
    fontSize: 18,
    marginVertical: 5,
  },
});
