import React from 'react';
import MangroveImage from '../assets/mangrove.jpg';


import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { LineChart, BarChart } from 'react-native-chart-kit';
import StatCard from '../components/StatCard';
import { colors } from '../styles/colors';

const DashboardScreen = () => {
  const screenWidth = Dimensions.get('window').width;

  const phData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [6.5, 6.6, 6.7, 6.8, 6.8, 6.9],
        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  const heightData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [45, 52, 61, 68, 75, 83],
      },
    ],
  };

  const carbonData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [120, 145, 178, 205, 242, 280],
        color: (opacity = 1) => `rgba(5, 150, 105, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: colors.white,
    backgroundGradientFrom: colors.white,
    backgroundGradientTo: colors.white,
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: colors.primary,
    },
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header Card */}
      <LinearGradient
        colors={['#3b82f6', '#10b981']}
        style={styles.headerCard}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.gridNumber}>GRID_NO:001</Text>
            <Text style={styles.location}>Mangaluru</Text>
          </View>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Live</Text>
          </View>
        </View>

        <View style={styles.gridImagePlaceholder}>
        <Image
             source={MangroveImage}
             style={styles.gridImage}
             resizeMode="cover"
                              />
        </View>

      </LinearGradient>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <StatCard
              icon="droplet"
              label="Salinity"
              value="12 ppt"
              color={colors.primary}
            />
          </View>
          <View style={styles.statItem}>
            <StatCard
              icon="thermometer"
              label="Atm. Temp"
              value="28°C"
              color={colors.orange}
            />
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <StatCard
              icon="activity"
              label="Soil pH"
              value="6.8"
              color={colors.secondary}
            />
          </View>
          <View style={styles.statItem}>
            <StatCard
              icon="droplet"
              label="Water Level"
              value="1.2m"
              color="#0ea5e9"
            />
          </View>
        </View>
      </View>

      {/* Survival Rate */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Survival Rate</Text>
          <Text style={styles.survivalRate}>94%</Text>
        </View>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={['#10b981', '#059669']}
            style={[styles.progressFill, { width: '94%' }]}
          />
        </View>
      </View>

      {/* pH Trends Chart */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>pH Trends</Text>
        <LineChart
          data={phData}
          width={screenWidth - 64}
          height={220}
          chartConfig={{
            ...chartConfig,
            color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
          }}
          bezier
          style={styles.chart}
        />
      </View>

      {/* Tree Height Chart */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Tree Height Growth (cm)</Text>
        <BarChart
          data={heightData}
          width={screenWidth - 64}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
          showValuesOnTopOfBars
        />
      </View>

      {/* Carbon Sequestration Chart */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Carbon Sequestration (kg CO₂)</Text>
        <LineChart
          data={carbonData}
          width={screenWidth - 64}
          height={220}
          chartConfig={{
            ...chartConfig,
            color: (opacity = 1) => `rgba(5, 150, 105, ${opacity})`,
          }}
          bezier
          style={styles.chart}
        />
      </View>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    
  },
  headerCard: {
    margin: 16,
    borderRadius: 24,
    padding: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  gridNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
  },
  location: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
    marginRight: 8,
  },
  statusText: {
    color: colors.white,
    fontWeight: '600',
  },
  gridImagePlaceholder: {
  backgroundColor: 'rgba(255,255,255,0.1)',
  borderRadius: 16,
  height: 180,
  overflow: 'hidden',   // 🔥 super important
},

  gridImage: {
  width: '100%',
  height: '100%',
  borderRadius: 16,
},

  statsGrid: {
    paddingHorizontal: 16,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    marginHorizontal: 6,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  survivalRate: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.secondary,
  },
  progressBar: {
    height: 12,
    backgroundColor: colors.background,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

export default DashboardScreen;