import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LineChart } from 'react-native-chart-kit';
import { restClient } from '@polygon.io/client-js';

const screenWidth = Dimensions.get('window').width;
const apiKey = '71H9CXzKp99QvYNlhEJf1h5gpf8kikJL';
const client = restClient(apiKey);

const periods = [
  { label: 'Last 7 Days', value: '7' },
  { label: 'Last 14 Days', value: '14' },
  { label: 'Last 30 Days', value: '30' },
];

export default function TabThreeScreen() {
  const [currency, setCurrency] = useState('USD');
  const [period, setPeriod] = useState('7');
  const [historicalData, setHistoricalData] = useState({ dates: [], values: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHistoricalData();
  }, [currency, period]);

  const fetchHistoricalData = async () => {
    setLoading(true);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(period));
    
    const end = endDate.toISOString().split('T')[0];
    const start = startDate.toISOString().split('T')[0];

    try {
      let symbol;
      if (currency === 'USD') {
        symbol = `C:EURUSD`;
      } else {
        symbol = `C:${currency}USD`;
      }

      const response = await client.forex.aggregates(symbol, 1, 'day', start, end);

      if (response.results && response.results.length > 0) {
        const dates = response.results.map(result => new Date(result.t).toISOString().split('T')[0]);
        let values;

        if (currency === 'USD') {
          values = response.results.map(result => 1 / result.c); // Invert the rates
        } else {
          values = response.results.map(result => result.c);
        }

        setHistoricalData({ dates, values });
      } else {
        Alert.alert('Error', 'No historical data available.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch historical data.');
      console.error(error);
    } finally {
      setLoading(false);
    }
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
      <View style={styles.pickerContainer}>
        <Text>Select Period:</Text>
        <Picker
          selectedValue={period}
          style={styles.picker}
          onValueChange={(itemValue) => setPeriod(itemValue)}
        >
          {periods.map(p => (
            <Picker.Item key={p.value} label={p.label} value={p.value} />
          ))}
        </Picker>
      </View>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        historicalData.dates.length > 0 && (
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
