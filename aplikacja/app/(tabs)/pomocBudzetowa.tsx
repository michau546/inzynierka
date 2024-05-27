// pomocBudzetowa.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Alert } from 'react-native';
import { useNavigation } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

export default function PomocBudzetowa() {
  const [monthlyBudget, setMonthlyBudget] = useState('');
  const [budgetDetails, setBudgetDetails] = useState({ kosztyZycia: 0, zachcianki: 0, oszczednosci: 0, niespodziewaneWydatki: 0 });
  const navigation = useNavigation();

  useEffect(() => {
    if (monthlyBudget) {
      calculateBudgetDetails();
    }
  }, [monthlyBudget]);

  const calculateBudgetDetails = async () => {
    const budget = parseFloat(monthlyBudget);
    const kosztyZycia = budget * 0.5;
    
    // Fetch calendar expenses
    const expensesCollection = collection(db, 'expenses');
    const expenseSnapshot = await getDocs(expensesCollection);
    const expenseList = expenseSnapshot.docs.map(doc => doc.data());
    
    const niespodziewaneWydatki = expenseList.reduce((total, exp) => total + exp.amount, 0);
    const remainingAmount = kosztyZycia - niespodziewaneWydatki;
    
    const zachcianki = remainingAmount * 0.3;
    const oszczednosci = remainingAmount * 0.2;

    setBudgetDetails({ kosztyZycia, zachcianki, oszczednosci, niespodziewaneWydatki });
  };

  const handleSaveBudget = () => {
    if (monthlyBudget) {
      calculateBudgetDetails();
      Alert.alert('Budget Saved', `Your monthly budget is ${monthlyBudget}`);
    } else {
      Alert.alert('Error', 'Please enter a budget amount.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set Monthly Budget</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Enter monthly budget"
        value={monthlyBudget}
        onChangeText={setMonthlyBudget}
      />
      <Button title="Save Budget" onPress={handleSaveBudget} />
      {budgetDetails.kosztyZycia > 0 && (
        <View style={styles.detailsContainer}>
          <Text style={styles.detailText}>Koszty Życia: {budgetDetails.kosztyZycia.toFixed(2)} PLN</Text>
          <Text style={styles.detailText}>Niespodziewane Wydatki: {budgetDetails.niespodziewaneWydatki.toFixed(2)} PLN</Text>
          <Text style={styles.detailText}>Zachcianki: {budgetDetails.zachcianki.toFixed(2)} PLN</Text>
          <Text style={styles.detailText}>Oszczędności: {budgetDetails.oszczednosci.toFixed(2)} PLN</Text>
        </View>
      )}
      <Button title="Go to Calendar" onPress={() => navigation.navigate('PomocBudzetowaCalendar')} />
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
  detailsContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  detailText: {
    fontSize: 18,
    marginVertical: 5,
  },
});
