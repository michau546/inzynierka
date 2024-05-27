import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Alert, FlatList, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useNavigation } from 'expo-router';
import { db } from '../../firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';

export default function PomocBudzetowaCalendar() {
  const [selectedDate, setSelectedDate] = useState('');
  const [expense, setExpense] = useState('');
  const [expenseName, setExpenseName] = useState('');
  const [expenses, setExpenses] = useState({});
  const [expenseList, setExpenseList] = useState([]);
  const [editExpenseId, setEditExpenseId] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    fetchAllExpenses();
  }, []);

  const fetchAllExpenses = async () => {
    try {
      const expensesCollection = collection(db, 'expenses');
      const expenseSnapshot = await getDocs(expensesCollection);
      const expenseList = expenseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const newExpenses = {};
      expenseList.forEach(exp => {
        newExpenses[exp.date] = {
          marked: true,
          dotColor: 'red',
          customStyles: {
            container: {
              backgroundColor: 'green',
            },
            text: {
              color: 'white',
              fontWeight: 'bold',
            },
          },
        };
      });

      setExpenses(newExpenses);
    } catch (error) {
      console.error('Error fetching expenses: ', error);
      Alert.alert('Error', 'Failed to fetch expenses.');
    }
  };

  const fetchExpensesForDate = async (date) => {
    try {
      const expensesCollection = collection(db, 'expenses');
      const q = query(expensesCollection, where('date', '==', date));
      const expenseSnapshot = await getDocs(q);
      const expenseList = expenseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setExpenseList(expenseList);
    } catch (error) {
      console.error('Error fetching expenses for date: ', error);
      Alert.alert('Error', 'Failed to fetch expenses for the selected date.');
    }
  };

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);

    // Clear previous selection
    const newExpenses = { ...expenses };
    Object.keys(newExpenses).forEach((key) => {
      if (newExpenses[key].selected) {
        delete newExpenses[key].selected;
        delete newExpenses[key].selectedColor;
      }
    });

    // Highlight the selected date
    newExpenses[day.dateString] = {
      ...newExpenses[day.dateString],
      selected: true,
      selectedColor: 'blue',
    };

    setExpenses(newExpenses);
    fetchExpensesForDate(day.dateString);
  };

  const handleAddExpense = async () => {
    if (expense && expenseName && selectedDate) {
      if (editExpenseId) {
        // Update existing expense
        const expenseRef = doc(db, 'expenses', editExpenseId);
        await updateDoc(expenseRef, {
          date: selectedDate,
          amount: parseFloat(expense),
          expenseName: expenseName,
        });
        Alert.alert('Expense Updated', `Updated ${expenseName} on ${selectedDate}`);
        setEditExpenseId(null);
      } else {
        // Add new expense
        await addDoc(collection(db, 'expenses'), {
          date: selectedDate,
          amount: parseFloat(expense),
          expenseName: expenseName,
        });
        Alert.alert('Expense Added', `Added ${expenseName} on ${selectedDate}`);
      }

      setExpense('');
      setExpenseName('');
      fetchExpensesForDate(selectedDate);
      fetchAllExpenses();
    } else {
      Alert.alert('Error', 'Please select a date and enter an expense with a name.');
    }
  };

  const handleEditExpense = (item) => {
    setSelectedDate(item.date);
    setExpense(item.amount.toString());
    setExpenseName(item.expenseName);
    setEditExpenseId(item.id);
  };

  const handleDeleteExpense = async (id) => {
    await deleteDoc(doc(db, 'expenses', id));
    Alert.alert('Expense Deleted', 'Expense has been deleted.');
    fetchExpensesForDate(selectedDate);
    fetchAllExpenses();
  };

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={handleDayPress}
        markedDates={expenses}
        markingType={'custom'}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter expense name"
        value={expenseName}
        onChangeText={setExpenseName}
      />
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Enter expense amount"
        value={expense}
        onChangeText={setExpense}
      />
      <Button title={editExpenseId ? "Update Expense" : "Add Expense"} onPress={handleAddExpense} />
      {expenseList.length > 0 && (
        <FlatList
          data={expenseList}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text>{item.date}: {item.expenseName} - {item.amount.toFixed(2)} PLN</Text>
              <View style={styles.itemActions}>
                <TouchableOpacity onPress={() => handleEditExpense(item)}>
                  <Text style={styles.editButton}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteExpense(item.id)}>
                  <Text style={styles.deleteButton}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
      <Button title="Go Back to Budget" onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    width: '100%',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  itemActions: {
    flexDirection: 'row',
  },
  editButton: {
    color: 'blue',
    marginRight: 10,
  },
  deleteButton: {
    color: 'red',
  },
});
