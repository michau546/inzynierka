import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { collection, getDocs, addDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';

// Define a type for the budget item
type BudgetItem = {
    id: string;
    name: string;
    amount: number;
};

const BudgetManager: React.FC = () => {
    // State for the list of budget items
    const [items, setItems] = useState<BudgetItem[]>([]);
    // State for the new item input fields
    const [newItem, setNewItem] = useState<{ name: string; amount: string }>({ name: '', amount: '' });

    // Fetch data from Firestore on component mount
    useEffect(() => {
        const itemsCollection = collection(db, 'budgetItems');
        
        // Using onSnapshot to get real-time updates
        const unsubscribe = onSnapshot(itemsCollection, snapshot => {
            const itemsList = snapshot.docs.map(doc => ({
                id: doc.id,
                name: doc.data().name,
                amount: doc.data().amount,
            }));
            setItems(itemsList);
        });

        // Clean up the listener on unmount
        return () => unsubscribe();
    }, []);

    // Handle input change
    const handleChange = (name: string, value: string) => {
        setNewItem({
            ...newItem,
            [name]: value,
        });
    };

    // Handle adding a new budget item
    const handleAddItem = async () => {
        if (newItem.name && newItem.amount) {
            const newItemObj = {
                name: newItem.name,
                amount: parseFloat(newItem.amount),
            };
            await addDoc(collection(db, 'budgetItems'), newItemObj);
            setNewItem({ name: '', amount: '' });
        }
    };

    // Handle deleting a budget item
    const handleDeleteItem = async (id: string) => {
        await deleteDoc(doc(db, 'budgetItems', id));
    };

    // Calculate total budget
    const calculateTotal = () => {
        return items.reduce((total, item) => total + item.amount, 0).toFixed(2);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Menedżer Budżetu</Text>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Nazwa przedmiotu"
                    value={newItem.name}
                    onChangeText={text => handleChange('name', text)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Kwota"
                    value={newItem.amount}
                    keyboardType="numeric"
                    onChangeText={text => handleChange('amount', text)}
                />
                <Button title="Dodaj Przedmiot" onPress={handleAddItem} />
            </View>
            <FlatList
                data={items}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <Text>{item.name}: {item.amount.toFixed(2)} zł</Text>
                        <TouchableOpacity onPress={() => handleDeleteItem(item.id)}>
                            <Text style={styles.deleteButton}>Usuń</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />
            <Text style={styles.total}>Razem: {calculateTotal()} zł</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    inputContainer: {
        marginBottom: 20,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    deleteButton: {
        color: 'red',
    },
    total: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
    },
});

export default BudgetManager;
