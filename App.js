import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, TextInput, View, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Feather, FontAwesome5 } from '@expo/vector-icons';
import { useState } from 'react';

const dailyForecast = [
  { day: 'Fri', icon: 'weather-sunny', temp: 30.3 },
  { day: 'Sat', icon: 'weather-partly-cloudy', temp: 28.1 },
  { day: 'Sun', icon: 'weather-rainy', temp: 25.7 },
  { day: 'Mon', icon: 'weather-lightning', temp: 27.2 },
  { day: 'Tue', icon: 'weather-cloudy', temp: 26.4 },
];

const metrics = [
  { label: 'Wind', value: '12 km/h', icon: <Feather name="wind" size={20} color="#fff" /> },
  { label: 'Humidity', value: '68%', icon: <Feather name="droplet" size={20} color="#fff" /> },
  { label: 'Sunrise', value: '6:12 AM', icon: <Feather name="sunrise" size={20} color="#fff" /> },
];

// Helper to map OpenWeatherMap weather to MaterialCommunityIcons
const getWeatherIcon = (main, icon) => {
  if (main === 'Clear') return 'weather-sunny';
  if (main === 'Clouds') return icon && icon.endsWith('n') ? 'weather-night-partly-cloudy' : 'weather-partly-cloudy';
  if (main === 'Rain') return icon && icon.endsWith('n') ? 'weather-night-rainy' : 'weather-rainy';
  if (main === 'Drizzle') return 'weather-hail';
  if (main === 'Thunderstorm') return 'weather-lightning';
  if (main === 'Snow') return 'weather-snowy';
  if ([
    'Mist', 'Smoke', 'Haze', 'Dust', 'Fog', 'Sand', 'Ash'
  ].includes(main)) return 'weather-fog';
  if (main === 'Squall' || main === 'Tornado') return 'weather-windy';
  return 'weather-partly-cloudy';
};

export default function App() {
  const [city, setCity] = useState('San Francisco');
  const [location, setLocation] = useState('California, USA');
  const [temp, setTemp] = useState(36.9);
  const [status, setStatus] = useState('Sunny');
  const [metricsData, setMetricsData] = useState({ wind: '12 km/h', humidity: '68%', sunrise: '6:12 AM' });
  const [searching, setSearching] = useState(false);
  const [inputCity, setInputCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [weatherIcon, setWeatherIcon] = useState('weather-sunny');
  const [iconCode, setIconCode] = useState('01d');

  const fetchWeather = async (searchCity) => {
    setLoading(true);
    setError('');
    try {
      const data = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${searchCity}&appid=caf210f0c4b9e7d9a322ceffd94b8cf8`
      );
      const res = await data.json();
      if (res.cod === 200) {
        setCity(res.name);
        setLocation(res.sys?.country ? res.sys.country : '');
        setTemp((res.main.temp - 273.15).toFixed(1));
        setStatus(res.weather[0].main);
        setMetricsData({
          wind: res.wind ? `${res.wind.speed} m/s` : '-',
          humidity: res.main ? `${res.main.humidity}%` : '-',
          sunrise: res.sys?.sunrise ? new Date(res.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
        });
        setIconCode(res.weather[0].icon);
        setWeatherIcon(getWeatherIcon(res.weather[0].main, res.weather[0].icon));
      } else {
        setError('City not found');
      }
    } catch (e) {
      setError('Error fetching weather');
    }
    setLoading(false);
    setSearching(false);
    setInputCity('');
  };

  // Set initial icon for default city
  useState(() => {
    setWeatherIcon(getWeatherIcon(status, iconCode));
  }, []);

  return (
    <LinearGradient
      colors={["#43cea2", "#185a9d"]}
      style={styles.gradient}
    >
      <View style={styles.topSection}>
        <View style={styles.searchIconRow}>
          <View style={styles.searchIconWrapper}>
            <Feather name="search" size={24} color="#fff" onPress={() => setSearching(true)} />
          </View>
          {searching && (
            <View style={styles.searchInputWrapper}>
              <TextInput
                style={styles.searchInput}
                placeholder="Enter city name"
                placeholderTextColor="#7a8fa6"
                value={inputCity}
                onChangeText={setInputCity}
                onSubmitEditing={() => inputCity.trim() && fetchWeather(inputCity.trim())}
                autoFocus
              />
              <Button
                title="Go"
                onPress={() => inputCity.trim() && fetchWeather(inputCity.trim())}
                color="#2b5876"
              />
            </View>
          )}
        </View>
        <Text style={styles.city}>{city}</Text>
        <Text style={styles.location}>{location}</Text>
      </View>
      <View style={styles.centerSection}>
        <View style={styles.sunIconWrapper}>
          <MaterialCommunityIcons name={weatherIcon} size={110} color="#FFD93B" style={styles.sunIcon} />
          <View style={styles.sunGlow} />
        </View>
        {loading ? (
          <Text style={styles.status}>Loading...</Text>
        ) : error ? (
          <Text style={[styles.status, { color: 'red' }]}>{error}</Text>
        ) : (
          <>
            <Text style={styles.temp}>{temp}°</Text>
            <Text style={styles.status}>{status}</Text>
            <View style={styles.metricsRow}>
              <View style={styles.metric}>
                <Feather name="wind" size={20} color="#fff" />
                <Text style={styles.metricValue}>{metricsData.wind}</Text>
                <Text style={styles.metricLabel}>Wind</Text>
              </View>
              <View style={styles.metric}>
                <Feather name="droplet" size={20} color="#fff" />
                <Text style={styles.metricValue}>{metricsData.humidity}</Text>
                <Text style={styles.metricLabel}>Humidity</Text>
              </View>
              <View style={styles.metric}>
                <Feather name="sunrise" size={20} color="#fff" />
                <Text style={styles.metricValue}>{metricsData.sunrise}</Text>
                <Text style={styles.metricLabel}>Sunrise</Text>
              </View>
            </View>
          </>
        )}
      </View>
      <View style={styles.carouselWrapper}>
        <View style={styles.carouselGlass}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
            {dailyForecast.map((d, i) => (
              <View style={styles.forecastCard} key={i}>
                <MaterialCommunityIcons name={d.icon} size={32} color="#FFD93B" style={{ marginBottom: 6 }} />
                <Text style={styles.cardTemp}>{d.temp}°</Text>
                <Text style={styles.cardDay}>{d.day}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
      <StatusBar style="auto" />
    </LinearGradient>
  );
}

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  topSection: {
    alignItems: 'center',
    marginTop: 100,
    marginBottom: 16,
    position: 'relative',
  },
  searchIconRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 10,
  },
  city: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 1.2,
    fontFamily: 'System',
    
  },
  location: {
    color: '#e0e0e0',
    fontSize: 16,
    fontWeight: '400',
    marginTop: 2,
    fontFamily: 'System',
  },
  centerSection: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  sunIconWrapper: {
    position: 'relative',
    marginBottom: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sunIcon: {
    zIndex: 2,
  },
  sunGlow: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,217,59,0.25)',
    top: -10,
    left: -10,
    zIndex: 1,
    shadowColor: '#FFD93B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 30,
  },
  temp: {
    color: '#fff',
    fontSize: 64,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'System',
  },
  status: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '500',
    marginBottom: 18,
    fontFamily: 'System',
    textTransform: 'capitalize',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width - 60,
    marginTop: 10,
    marginBottom: 10,
  },
  metric: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
    fontFamily: 'System',
  },
  metricLabel: {
    color: '#e0e0e0',
    fontSize: 13,
    fontWeight: '400',
    marginTop: 1,
    fontFamily: 'System',
  },
  carouselWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
  },
  carouselGlass: {
    width: width - 24,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 32,
    paddingVertical: 22,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 32,
    elevation: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
    overflow: 'hidden',
  },
  carousel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 8,
    minHeight: 120,
  },
  forecastCard: {
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 22,
    alignItems: 'center',
    marginHorizontal: 10,
    minWidth: 80,
    shadowColor: '#185a9d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(67,206,162,0.18)',
    backdropFilter: 'blur(18px)', // for web, ignored on native
    position: 'relative',
  },
  cardTemp: {
    color: '#185a9d',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
    fontFamily: 'System',
    textShadowColor: 'rgba(24,90,157,0.12)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  cardDay: {
    color: '#2b5876',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'System',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  searchIconWrapper: {
    position: 'absolute',
    right: 24,
    top: 0,
    padding: 8,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    height: 36,
    borderColor: '#2b5876',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#f7fafd',
    fontSize: 16,
    color: '#2b5876',
    marginRight: 8,
  },
});
