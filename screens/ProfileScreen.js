import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { colors } from '../styles/colors';
import ApiService from '../services/api';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = React.useState(null);
   useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await ApiService.getUserProfile();
        setUser(data);
      } catch (error) {
        console.log('Profile load error:', error);
      }
    };
    loadProfile();
  }, []);

  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  const handleLogout = () => {
    ApiService.logout();
    navigation.replace('Login');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <LinearGradient
        colors={['#a855f7', '#ec4899']}
        style={styles.headerCard}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Rank</Text>
            <Text style={styles.statValue}>#{user.rank}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Carbon Coins</Text>
            <Text style={styles.statValue}>{user.carbonCoins}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Contribution Stats */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Contribution Stats</Text>
        <View style={styles.statRow}>
          <Text style={styles.statRowLabel}>Total Contributions</Text>
          <Text style={styles.statRowValue}>{user.totalContributions}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statRow}>
          <Text style={styles.statRowLabel}>Tasks Completed</Text>
          <Text style={styles.statRowValue}>23</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statRow}>
          <Text style={styles.statRowLabel}>Data Points Verified</Text>
          <Text style={styles.statRowValue}>156</Text>
        </View>
      </View>

      {/* Rewards Wallet */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="award" size={20} color={colors.yellow} />
          <Text style={[styles.cardTitle, { marginBottom: 0, marginLeft: 8 }]}>
            Rewards Wallet
          </Text>
        </View>
        <LinearGradient
          colors={['#fef3c7', '#fed7aa']}
          style={styles.walletCard}>
          <Text style={styles.walletLabel}>Available Balance</Text>
          <Text style={styles.walletAmount}>{user.carbonCoins} CC</Text>
          <Text style={styles.walletSubtext}>Carbon Coins</Text>
        </LinearGradient>
      </View>

      {/* Recent Activity */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recent Activity</Text>
        <View style={styles.activityItem}>
          <View style={[styles.activityDot, { backgroundColor: colors.green }]} />
          <Text style={styles.activityText}>
            Completed field data collection
          </Text>
          <Text style={styles.activityTime}>2h ago</Text>
        </View>
        <View style={styles.activityItem}>
          <View
            style={[styles.activityDot, { backgroundColor: colors.primary }]}
          />
          <Text style={styles.activityText}>Verified 15 data points</Text>
          <Text style={styles.activityTime}>1d ago</Text>
        </View>
        <View style={styles.activityItem}>
          <View
            style={[styles.activityDot, { backgroundColor: colors.purple }]}
          />
          <Text style={styles.activityText}>Uploaded sensor logs</Text>
          <Text style={styles.activityTime}>2d ago</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <TouchableOpacity style={styles.actionButton}>
        <Icon name="settings" size={24} color={colors.textLight} />
        <Text style={styles.actionButtonText}>Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="log-out" size={24} color={colors.red} />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

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
    padding: 32,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
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
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  statRowLabel: {
    fontSize: 16,
    color: colors.textLight,
  },
  statRowValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.background,
  },
  walletCard: {
    borderRadius: 12,
    padding: 20,
    marginTop: 8,
  },
  walletLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 8,
  },
  walletAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  walletSubtext: {
    fontSize: 14,
    color: colors.textLight,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  activityText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  activityTime: {
    fontSize: 12,
    color: colors.textLight,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.red,
    marginLeft: 12,
  },
});

export default ProfileScreen;