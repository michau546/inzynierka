import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const periods = [
  { label: 'Ostatnie 7 dni', value: '7' },
  { label: 'Ostatnie 14 dni', value: '14' },
  { label: 'Ostatnie 30 dni', value: '30' },
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
      const response = await fetch(`https://api.nbp.pl/api/exchangerates/rates/A/${currency}/${start}/${end}/?format=json`);
      const data = await response.json();

      if (data.rates && data.rates.length > 0) {
        const dates = data.rates.map(rate => rate.effectiveDate);
        const values = data.rates.map(rate => rate.mid);

        setHistoricalData({ dates, values });
      } else {
        Alert.alert('Błąd', 'Brak dostępnych danych historycznych.');
      }
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się pobrać danych historycznych.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historyczny Kurs Wymiany</Text>
      <View style={styles.pickerContainer}>
        <Text>Wybierz Walutę:</Text>
        <Picker
          selectedValue={currency}
          style={styles.picker}
          onValueChange={(itemValue) => setCurrency(itemValue)}
        >
          <Picker.Item label="USD" value="USD" />
          <Picker.Item label="EUR" value="EUR" />
          <Picker.Item label="GBP" value="GBP" />
          <Picker.Item label="JPY" value="JPY" />
          {/* Dodaj więcej walut w razie potrzeby */}
        </Picker>
      </View>
      <View style={styles.pickerContainer}>
        <Text>Wybierz Okres:</Text>
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
        <Text>Ładowanie...</Text>
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
