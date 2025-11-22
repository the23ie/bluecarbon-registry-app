import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import TaskCard from '../components/TaskCard';
import { colors } from '../styles/colors';

const TasksScreen = () => {
  const pendingTasks = [
    { id: 1, title: 'Upload sensor logs', points: 50, deadline: '2 days left' },
    { id: 2, title: 'Verify data points', points: 75, deadline: '5 days left' },
    {
      id: 3,
      title: 'Field data collection',
      points: 100,
      deadline: '1 week left',
    },
    {
      id: 4,
      title: 'Manual tree count verification',
      points: 80,
      deadline: '3 days left',
    },
  ];

  const completedTasks = [
    {
      id: 1,
      title: 'Monthly report submission',
      points: 100,
      deadline: '2 days ago',
    },
    { id: 2, title: 'Drone imagery upload', points: 150, deadline: '5 days ago' },
    { id: 3, title: 'Water quality testing', points: 75, deadline: '1 week ago' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pending Tasks</Text>
        {pendingTasks.map((task) => (
          <TaskCard
            key={task.id}
            title={task.title}
            points={task.points}
            deadline={task.deadline}
            completed={false}
          />
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recently Completed</Text>
        {completedTasks.map((task) => (
          <TaskCard
            key={task.id}
            title={task.title}
            points={task.points}
            deadline={task.deadline}
            completed={true}
          />
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
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
});

export default TasksScreen;