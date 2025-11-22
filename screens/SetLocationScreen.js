// ============================================
// screens/SetLocationScreen.js - NEW FILE
// ============================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { colors } from '../styles/colors';
import ApiService from '../services/api';
import Geolocation from '@react-native-community/geolocation';

const SetLocationScreen = ({ navigation }) => {
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const getCurrentLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Location permission is required');
      return;
    }

    setGettingLocation(true);
    
    Geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
        setGettingLocation(false);
        Alert.alert('Success', 'Current location captured! Please enter your address.');
      },
      (error) => {
        setGettingLocation(false);
        Alert.alert('Error', 'Failed to get current location: ' + error.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const handleSaveLocation = async () => {
    if (!address.trim()) {
      Alert.alert('Error', 'Please enter your address');
      return;
    }

    if (!latitude || !longitude) {
      Alert.alert('Error', 'Please provide coordinates or use current location');
      return;
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      Alert.alert('Error', 'Invalid coordinates. Latitude: -90 to 90, Longitude: -180 to 180');
      return;
    }

    setLoading(true);
    try {
      await ApiService.updateUserLocation(address.trim(), lat, lon);
      Alert.alert('Success', 'Location saved successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to save location');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#10b981', '#3b82f6']}
        style={styles.header}>
        <Icon name="map-pin" size={48} color={colors.white} />
        <Text style={styles.headerTitle}>Set Your Location</Text>
        <Text style={styles.headerSubtitle}>
          We'll use this to calculate distances to grids
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.infoCard}>
          <Icon name="info" size={24} color={colors.primary} />
          <Text style={styles.infoText}>
            Your location helps us calculate the distance between your home and 
            the monitoring grids, making it easier to choose a nearby location.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Home Address *</Text>
            <TextInput
              style={styles.input}
              placeholder="123 Main St, City, Country"
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={2}
            />
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Coordinates</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.locationButton}
            onPress={getCurrentLocation}
            disabled={gettingLocation}>
            <LinearGradient
              colors={['#3b82f6', '#10b981']}
              style={styles.locationButtonGradient}>
              {gettingLocation ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <Icon name="navigation" size={20} color={colors.white} />
                  <Text style={styles.locationButtonText}>
                    Use Current Location
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.orText}>or enter manually</Text>

          <View style={styles.coordinatesRow}>
            <View style={styles.coordinateInput}>
              <Text style={styles.label}>Latitude</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 21.4225"
                value={latitude}
                onChangeText={setLatitude}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.coordinateInput}>
              <Text style={styles.label}>Longitude</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 89.9516"
                value={longitude}
                onChangeText={setLongitude}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.helpCard}>
            <Icon name="help-circle" size={20} color={colors.orange} />
            <Text style={styles.helpText}>
              You can find your coordinates using Google Maps or any GPS app
            </Text>
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveLocation}
            disabled={loading}>
            <LinearGradient
              colors={['#10b981', '#059669']}
              style={styles.saveButtonGradient}>
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.saveButtonText}>Save Location</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 32,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    marginTop: 16,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
    textAlign: 'center',
  },
  content: {
    padding: 16,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  form: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    color: colors.text,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.background,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: colors.textLight,
    fontWeight: '600',
  },
  locationButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  locationButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  locationButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
  },
  orText: {
    textAlign: 'center',
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 16,
  },
  coordinatesRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  coordinateInput: {
    flex: 1,
  },
  helpCard: {
    flexDirection: 'row',
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    gap: 8,
  },
  helpText: {
    flex: 1,
    fontSize: 12,
    color: colors.text,
    lineHeight: 18,
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
  },
});

export default SetLocationScreen;

// ============================================
// UPDATE services/api.js - Add these methods
// ============================================

// Add these methods to your existing ApiService class in api.js:

/*
  // Grids
  async getGrids() {
    return await this.request('/grids');
  }

  async getSelectedGrid() {
    return await this.request('/user/selected-grid');
  }

  async selectGrid(gridId) {
    return await this.request('/user/select-grid', {
      method: 'POST',
      body: JSON.stringify({ gridId }),
    });
  }

  async updateUserLocation(address, latitude, longitude) {
    return await this.request('/user/update-location', {
      method: 'POST',
      body: JSON.stringify({ address, latitude, longitude }),
    });
  }

  async calculateDistance(gridId) {
    return await this.request('/grids/calculate-distance', {
      method: 'POST',
      body: JSON.stringify({ gridId }),
    });
  }
*/

// ============================================
// UPDATE navigation/AppNavigator.js
// ============================================

// Add these imports at the top:
// import GridSelectionScreen from '../screens/GridSelectionScreen';
// import SetLocationScreen from '../screens/SetLocationScreen';

// Add these screens to your Tab Navigator:

/*
<Tab.Screen
  name="Grids"
  component={GridSelectionScreen}
  options={{
    tabBarIcon: ({ color, size }) => (
      <Icon name="map" size={size} color={color} />
    ),
    headerTitle: 'Grid Selection',
  }}
/>
*/

// Add SetLocationScreen to Stack Navigator (before MainTabs):

/*
<Stack.Screen 
  name="SetLocation" 
  component={SetLocationScreen}
  options={{
    headerShown: true,
    headerTitle: 'Set Location',
    headerStyle: { backgroundColor: colors.primary },
    headerTintColor: colors.white,
  }}
/>
*/

// ============================================
// package.json - Add geolocation dependency
// ============================================

/*
"dependencies": {
  ...existing dependencies,
  "@react-native-community/geolocation": "^3.0.6"
}
*/

// Run: npm install @react-native-community/geolocation
// For iOS: cd ios && pod install && cd ..

// ============================================
// AndroidManifest.xml - Add permissions
// ============================================

/*
Add these permissions to android/app/src/main/AndroidManifest.xml:

<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
*/