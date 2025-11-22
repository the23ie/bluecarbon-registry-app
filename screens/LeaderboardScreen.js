import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { colors } from '../styles/colors';

const LeaderboardScreen = () => {
  const leaderboardData = [
    { rank: 1, name: 'Sarah Chen', points: 2450, avatar: '👩' },
    { rank: 2, name: 'Michael Torres', points: 2180, avatar: '👨' },
    { rank: 3, name: 'Priya Sharma', points: 1920, avatar: '👩' },
    { rank: 4, name: 'James Wilson', points: 1650, avatar: '👨' },
    {
      rank: 5,
      name: 'John Doe',
      points: 1250,
      avatar: '👤',
      isCurrentUser: true,
    },
    { rank: 6, name: 'Emma Rodriguez', points: 1180, avatar: '👩' },
    { rank: 7, name: 'Alex Kim', points: 980, avatar: '👨' },
  ];

  const getMedalColor = (rank) => {
    if (rank === 1) return '#fbbf24';
    if (rank === 2) return '#d1d5db';
    if (rank === 3) return '#fb923c';
    return colors.background;
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#fbbf24', '#f97316']}
        style={styles.headerCard}>
        <Icon name="award" size={48} color={colors.white} />
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Leaderboard</Text>
          <Text style={styles.headerSubtitle}>Top Contributors</Text>
        </View>
      </LinearGradient>

      <View style={styles.list}>
        {leaderboardData.map((user) => (
          <View key={user.rank}>
            {user.isCurrentUser ? (
              <LinearGradient
                colors={['#3b82f6', '#10b981']}
                style={styles.userCard}>
                <View style={styles.userContent}>
                  <View
                    style={[
                      styles.rankBadge,
                      { backgroundColor: 'rgba(255,255,255,0.2)' },
                    ]}>
                    <Text style={[styles.rankText, { color: colors.white }]}>
                      {user.rank}
                    </Text>
                  </View>
                  <Text style={styles.avatar}>{user.avatar}</Text>
                  <View style={styles.userInfo}>
                    <Text style={[styles.userName, { color: colors.white }]}>
                      {user.name}
                    </Text>
                    <Text
                      style={[
                        styles.userPoints,
                        { color: 'rgba(255,255,255,0.8)' },
                      ]}>
                      {user.points} points
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            ) : (
              <View style={styles.userCard}>
                <View style={styles.userContent}>
                  <View
                    style={[
                      styles.rankBadge,
                      { backgroundColor: getMedalColor(user.rank) },
                    ]}>
                    <Text
                      style={[
                        styles.rankText,
                        {
                          color:
                            user.rank <= 3 ? colors.text : colors.textLight,
                        },
                      ]}>
                      {user.rank}
                    </Text>
                  </View>
                  <Text style={styles.avatar}>{user.avatar}</Text>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userPoints}>{user.points} points</Text>
                  </View>
                </View>
                {user.rank <= 3 && (
                  <Icon
                    name="award"
                    size={32}
                    color={getMedalColor(user.rank)}
                  />
                )}
              </View>
            )}
          </View>
        ))}
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
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  headerText: {
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  list: {
    paddingHorizontal: 16,
  },
  userCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  avatar: {
    fontSize: 32,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  userPoints: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 2,
  },
});

export default LeaderboardScreen;