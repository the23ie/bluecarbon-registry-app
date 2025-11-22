import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors } from '../styles/colors';

const TaskCard = ({ title, points, deadline, completed }) => {
  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: completed ? colors.green + '20' : colors.orange + '20' },
          ]}>
          <Icon
            name={completed ? 'check-circle' : 'clock'}
            size={24}
            color={completed ? colors.green : colors.orange}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.deadline}>{deadline}</Text>
        </View>
      </View>
      <View
        style={[
          styles.pointsBadge,
          { backgroundColor: completed ? colors.green + '20' : colors.primary + '20' },
        ]}>
        <Text
          style={[
            styles.pointsText,
            { color: completed ? colors.green : colors.primary },
          ]}>
          {completed ? '+' : ''}{points} pts
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
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
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  deadline: {
    fontSize: 14,
    color: colors.textLight,
  },
  pointsBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default TaskCard;