import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function TabThreeScreen() {
  const [currency, setCurrency] = useState('USD');
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHistoricalData();
  }, [currency]);

  const fetchHistoricalData = () => {
    setLoading(true);
    fetch(`https://api.exchangerate-api.com/v4/latest/${currency}`)
      .then(response => response.json())
      .then(data => {
        const rates = data.rates;
        const dates = Object.keys(rates).slice(-7); // Last 7 days
        const values = dates.map(date => rates[date]);
        setHistoricalData({ dates, values });
        setLoading(false);
      })
      .catch(error => {
        Alert.alert('Error', 'Failed to fetch historical data.');
        setLoading(false);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historical Exchange Rate</Text>
      <View style={styles.pickerContainer}>
        <Text>Select Currency:</Text>
        <Picker
          selectedValue={currency}
          style={styles.picker}
          onValueChange={(itemValue) => setCurrency(itemValue)}
        >
          <Picker.Item label="USD" value="USD" />
          <Picker.Item label="EUR" value="EUR" />
          <Picker.Item label="GBP" value="GBP" />
          <Picker.Item label="JPY" value="JPY" />
          {/* Add more currencies as needed */}
        </Picker>
      </View>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        historicalData.dates && (
          <LineChart
            data={{
              labels: historicalData.dates,
              datasets: [
                {
                  data: historicalData.values,
                },
              ],
            }}
            width={screenWidth - 40} // from react-native
            height={220}
            yAxisLabel=""
            yAxisSuffix=""
            yAxisInterval={1} // optional, defaults to 1
            chartConfig={{
              backgroundColor: '#e26a00',
              backgroundGradientFrom: '#fb8c00',
              backgroundGradientTo: '#ffa726',
              decimalPlaces: 2, // optional, defaults to 2dp
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#ffa726',
              },
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        )
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
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  picker: {
    height: 50,
    width: 150,
  },
});
