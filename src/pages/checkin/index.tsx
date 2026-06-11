import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Button,
  ScrollView
} from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import TaskItem from '@/components/TaskItem';
import { useAppStore } from '@/store/useAppStore';
import { absenceRecords } from '@/data/tasks';
import { formatMinutes } from '@/utils';
import type { Task } from '@/types';

const CheckinPage: React.FC = () => {
  const {
    tasks,
    toggleTaskStatus,
    weeklySummary,
    todayFocusMinutes,
    pomodoroSessions
  } = useAppStore();
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
    console.log('[Checkin] 页面显示, todayFocusMinutes:', todayFocusMinutes, 'weeklyHours:', weeklySummary.totalStudyHours);
  });

  // 今日专注小时（保留1位小数）
  const todayFocusHours = Number((todayFocusMinutes / 60).toFixed(1));

  // 本周每天专注时长记录（用最近7天的番茄钟数据）
  const weekRecords = useMemo(() => {
    const now = new Date();
    const weekDays = ['一', '二', '三', '四', '五', '六', '日'];
    const records: { date: string; label: string; focusMinutes: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStr = `${d.getMonth() + 1}/${d.getDate()}`;
      const dayOfWeek = weekDays[d.getDay() === 0 ? 6 : d.getDay() - 1];

      // 计算当天的专注分钟数
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;
      const dayMinutes = pomodoroSessions
        .filter(s => s.startTime >= dayStart && s.startTime < dayEnd)
        .reduce((sum, s) => sum + s.duration, 0);

      // 今日用实时的 todayFocusMinutes
      const isToday = i === 0;
      const finalMinutes = isToday ? Math.max(dayMinutes, todayFocusMinutes) : dayMinutes;

      records.push({
        date: dayStr,
        label: isToday ? '今天' : dayOfWeek,
        focusMinutes: finalMinutes
      });
    }
    return records;
  }, [pomodoroSessions, todayFocusMinutes]);

  const maxMinutes = Math.max(...weekRecords.map((r) => r.focusMinutes), 60);

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

        <View className={styles.focusRow}>
          <View className={styles.focusItem}>
            <Text className={styles.focusLabel}>今日专注</Text>
            <Text className={styles.focusValue}>
              {todayFocusHours}
              <Text className={styles.focusUnit}> h</Text>
            </Text>
          </View>
          <View className={styles.focusDivider} />
          <View className={styles.focusItem}>
            <Text className={styles.focusLabel}>番茄钟</Text>
            <Text className={styles.focusValue}>
              {pomodoroSessions.filter(s => {
                const now = new Date();
                const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
                return s.startTime >= dayStart;
              }).length}
              <Text className={styles.focusUnit}> 个</Text>
            </Text>
          </View>
          <View className={styles.focusDivider} />
          <View className={styles.focusItem}>
            <Text className={styles.focusLabel}>本周累计</Text>
            <Text className={styles.focusValue}>
              {weeklySummary.totalStudyHours}
              <Text className={styles.focusUnit}> h</Text>
            </Text>
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

          {/* 周学习时长图表（实时数据） */}
          <View className={styles.weekChart}>
            {weekRecords.map((record, idx) => {
              const height = maxMinutes > 0 ? (record.focusMinutes / maxMinutes) * 100 : 0;
              return (
                <View key={idx} className={styles.chartBar}>
                  <Text className={styles.barValue}>
                    {record.focusMinutes >= 60
                      ? `${Math.round(record.focusMinutes / 60)}h`
                      : `${record.focusMinutes}m`}
                  </Text>
                  <View
                    className={classnames(
                      styles.barFill,
                      record.label === '今天' && styles.barFillToday
                    )}
                    style={{ height: `${Math.max(height, 5)}%` }}
                  />
                  <Text className={styles.barLabel}>{record.label}</Text>
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
