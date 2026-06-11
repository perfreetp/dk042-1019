import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Button,
  ScrollView
} from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import styles from './index.module.scss';
import TaskItem from '@/components/TaskItem';
import { useAppStore } from '@/store/useAppStore';
import { weeklySummary, pomodoroRecords, absenceRecords } from '@/data/tasks';
import { formatMinutes } from '@/utils';
import type { Task } from '@/types';

const CheckinPage: React.FC = () => {
  const { tasks, toggleTaskStatus } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);

  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weekDay = weekDays[today.getDay()];

  const completedCount = useMemo(
    () => tasks.filter((t) => t.status === 'done').length,
    [tasks]
  );

  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  const handleToggleTask = (task: Task) => {
    toggleTaskStatus(task.id);
    if (task.status !== 'done') {
      Taro.vibrateShort({ type: 'light' });
    }
  };

  const handleAddTask = () => {
    Taro.showToast({ title: '添加任务功能开发中', icon: 'none' });
  };

  const handlePomodoro = () => {
    Taro.navigateTo({ url: '/pages/pomodoro/index' });
  };

  const handleStudyRoom = () => {
    Taro.navigateTo({ url: '/pages/study-room/index' });
  };

  const handleRemind = () => {
    Taro.showToast({ title: '已提醒搭子', icon: 'success' });
  };

  usePullDownRefresh(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Taro.stopPullDownRefresh();
    }, 1000);
  });

  useDidShow(() => {
    console.log('[Checkin] 页面显示');
  });

  const maxMinutes = Math.max(...pomodoroRecords.map((r) => r.focusMinutes));

  return (
    <ScrollView className={styles.checkinPage} scrollY enhanced>
      {/* 顶部打卡进度卡 */}
      <View className={styles.headerCard}>
        <View className={styles.dateRow}>
          <Text className={styles.dateText}>
            {month}月{day}日 {weekDay}
          </Text>
          <View className={styles.streak}>
            🔥 连续 <Text className={styles.streakNum}>{weeklySummary.streakDays}</Text> 天
          </View>
        </View>

        <View className={styles.progressWrap}>
          <View className={styles.progressInfo}>
            <Text>今日任务进度</Text>
            <Text>{completedCount}/{tasks.length}</Text>
          </View>
          <View className={styles.progressBar}>
            <View
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            />
          </View>
        </View>
      </View>

      {/* 番茄计时大按钮 */}
      <View style={{ padding: '0 32rpx' }}>
        <Button className={styles.pomodoroBigBtn} onClick={handlePomodoro}>
          <Text className={styles.pomodoroIcon}>🍅</Text>
          <Text className={styles.pomodoroTitle}>开始番茄专注</Text>
          <Text className={styles.pomodoroDesc}>25分钟专注 + 5分钟休息</Text>
        </Button>
      </View>

      {/* 今日任务 */}
      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>今日任务</Text>
          <Text className={styles.sectionMore}>历史记录 ›</Text>
        </View>

        <View className={styles.taskList}>
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} onToggle={handleToggleTask} />
          ))}

          <View className={styles.addTaskBtn} onClick={handleAddTask}>
            <Text>+ 添加任务</Text>
          </View>
        </View>
      </View>

      {/* 快捷操作 */}
      <View className={styles.quickActions}>
        <View className={styles.quickCard} onClick={handleStudyRoom}>
          <View className={styles.quickIcon} style={{ background: '#E8F0FF' }}>
            📚
          </View>
          <Text className={styles.quickTitle}>小组自习</Text>
          <Text className={styles.quickDesc}>和搭子一起学</Text>
        </View>
        <View className={styles.quickCard} onClick={handleRemind}>
          <View className={styles.quickIcon} style={{ background: '#FFF3E6' }}>
            🔔
          </View>
          <Text className={styles.quickTitle}>互相提醒</Text>
          <Text className={styles.quickDesc}>提醒搭子打卡</Text>
        </View>
      </View>

      {/* 周总结 */}
      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>本周总结</Text>
          <Text className={styles.sectionMore}>详细 ›</Text>
        </View>

        <View className={styles.statsCard}>
          <View className={styles.statsGrid}>
            <View className={styles.statItem}>
              <Text className={styles.statNum}>{weeklySummary.totalStudyHours}h</Text>
              <Text className={styles.statLabel}>总学习时长</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statNum}>{weeklySummary.completedTasks}</Text>
              <Text className={styles.statLabel}>完成任务</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statNum}>{weeklySummary.attendanceRate}%</Text>
              <Text className={styles.statLabel}>出勤率</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statNum}>{weeklySummary.streakDays}天</Text>
              <Text className={styles.statLabel}>连续打卡</Text>
            </View>
          </View>

          {/* 周学习时长图表 */}
          <View className={styles.weekChart}>
            {pomodoroRecords.map((record) => {
              const height = maxMinutes > 0 ? (record.focusMinutes / maxMinutes) * 100 : 0;
              return (
                <View key={record.id} className={styles.chartBar}>
                  <Text className={styles.barValue}>
                    {Math.round(record.focusMinutes / 60)}h
                  </Text>
                  <View
                    className={styles.barFill}
                    style={{ height: `${Math.max(height, 5)}%` }}
                  />
                  <Text className={styles.barLabel}>{record.date}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* 缺勤记录 */}
      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>缺勤记录</Text>
          <Text className={styles.sectionMore}>补卡申请 ›</Text>
        </View>

        <View className={styles.absenceList}>
          {absenceRecords.map((item) => (
            <View key={item.id} className={styles.absenceItem}>
              <Text className={styles.absenceDate}>{item.date}</Text>
              <Text
                className={
                  item.type === 'full_day'
                    ? `${styles.absenceType} ${styles.full_day}`
                    : `${styles.absenceType} ${styles.half_day}`
                }
              >
                {item.type === 'full_day' ? '全天' : '半天'}
              </Text>
              <Text className={styles.absenceReason}>{item.reason}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default CheckinPage;
