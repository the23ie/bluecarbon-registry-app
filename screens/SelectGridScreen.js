import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import ApiService from '../services/api';
import Geolocation from '@react-native-community/geolocation';

const SelectGridScreen = ({ navigation }) => {
  const [grids, setGrids] = useState([]);
  const [homeLocation, setHomeLocation] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    load();
    getUserLocation();
  }, []);

  // 1. Get user's current GPS location
  const getUserLocation = () => {
    Geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        console.log('Your location:', latitude, longitude);
        setCurrentLocation({ latitude, longitude });
      },
      (error) => {
        console.log('Location error:', error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  // 2. Load grids + user's saved home location
  const load = async () => {
    try {
      const data = await ApiService.getGrids();
      setGrids(data);

      const profile = await ApiService.getUserProfile();
      if (profile.home_lat && profile.home_lng) {
        setHomeLocation({
          lat: profile.home_lat,
          lng: profile.home_lng,
        });
      }
    } catch (err) {
      console.log('Load error:', err);
    }
  };

  // 3. Haversine distance formula
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };
   const handleSelectGrid = async (grid) => {
  try {
    console.log("Selected grid:", grid.grid_id);

    await ApiService.selectGrid(grid.grid_id);

    navigation.navigate("SetLocation");  // or Main, or Dashboard
  } catch (err) {
    console.log("Select grid error:", err);
  }
};

  // 4. Render each grid item
  const renderGridItem = ({ item }) => {
  const coords = item.geometry?.coordinates?.[0]?.[0];

  if (!coords) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>{item.grid_id}</Text>
        <Text style={styles.distance}>Invalid geometry</Text>
      </View>
    );
  }

  const gridLng = coords[0];
  const gridLat = coords[1];

  let distance = '---';

  if (homeLocation) {
    distance = getDistance(homeLocation.lat, homeLocation.lng, gridLat, gridLng).toFixed(2);
  } else if (currentLocation) {
    distance = getDistance(currentLocation.latitude, currentLocation.longitude, gridLat, gridLng).toFixed(2);
  }
  return (
  <TouchableOpacity
    style={styles.card}
    onPress={async () => {
      try {
        await ApiService.selectGrid(item.grid_id);
        alert(`Selected Grid: ${item.grid_id}`);
        navigation.goBack();   // or navigate to Dashboard
      } catch (err) {
        console.log('Grid select error:', err);
        alert('Failed to select grid');
      }
    }}
  >
    <Text style={styles.title}>{item.grid_id}</Text>
    <Text style={styles.distance}>{distance} km away</Text>
  </TouchableOpacity>
);

  
};


  return (
    <View style={styles.container}>
      <FlatList
        data={grids}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderGridItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: {
    padding: 16,
    marginVertical: 8,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 3,
  },
  title: { fontSize: 18, fontWeight: 'bold' },
  distance: { marginTop: 4, fontSize: 14, color: 'gray' },
});

export default SelectGridScreen;
