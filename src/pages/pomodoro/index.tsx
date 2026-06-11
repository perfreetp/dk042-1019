import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro, { useDidShow, useDidHide } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAppStore } from '@/store/useAppStore';
import { todayTasks } from '@/data/tasks';
import type { Task } from '@/types';

type PomodoroMode = 'focus' | 'shortBreak' | 'longBreak';
type TimerStatus = 'idle' | 'running' | 'paused' | 'finished';

const FOCUS_DURATION = 25 * 60;
const SHORT_BREAK = 5 * 60;
const LONG_BREAK = 15 * 60;
const CIRCUMFERENCE = 2 * Math.PI * 220;

const PomodoroPage: React.FC = () => {
  const { addFocusMinutes, tasks, toggleTask, addPomodoroRecord } = useAppStore();

  const [mode, setMode] = useState<PomodoroMode>('focus');
  const [duration, setDuration] = useState(FOCUS_DURATION);
  const [remaining, setRemaining] = useState(FOCUS_DURATION);
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [showComplete, setShowComplete] = useState(false);
  const [completedPomodoroMinutes, setCompletedPomodoroMinutes] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalIdRef = useRef<number | null>(null);

  const allTasks: Task[] = tasks.length > 0 ? tasks : todayTasks;

  // 今日专注数据
  const todayFocusMinutes = useAppStore((s) => s.todayFocusMinutes);
  const weeklySummary = useAppStore((s) => s.weeklySummary);

  const durationConfigs = useMemo(() => ({
    focus: { duration: FOCUS_DURATION, label: 'FOCUS', title: '专注时间' },
    shortBreak: { duration: SHORT_BREAK, label: 'BREAK', title: '短休息' },
    longBreak: { duration: LONG_BREAK, label: 'BREAK', title: '长休息' }
  }), []);

  const progress = useMemo(() => {
    const total = durationConfigs[mode].duration;
    return remaining / total;
  }, [remaining, mode, durationConfigs]);

  const progressOffset = useMemo(() => {
    return CIRCUMFERENCE * (1 - progress);
  }, [progress]);

  const formatTime = useCallback((seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, []);

  const statusText = useMemo(() => {
    if (status === 'finished') return '已完成';
    if (status === 'paused') return '已暂停';
    if (status === 'running') return '进行中';
    return '准备开始';
  }, [status]);

  const handleModeChange = useCallback((newMode: PomodoroMode) => {
    if (status === 'running') {
      Taro.showToast({ title: '请先暂停计时', icon: 'none' });
      return;
    }
    setMode(newMode);
    const newDuration = durationConfigs[newMode].duration;
    setDuration(newDuration);
    setRemaining(newDuration);
    setStatus('idle');
  }, [status, durationConfigs]);

  const handleQuickDuration = useCallback((minutes: number) => {
    if (status === 'running') {
      Taro.showToast({ title: '请先暂停计时', icon: 'none' });
      return;
    }
    const sec = minutes * 60;
    setDuration(sec);
    setRemaining(sec);
    setStatus('idle');
  }, [status]);

  const handleStart = useCallback(() => {
    if (status === 'running') return;

    if (status === 'idle') {
      // 开始新的番茄钟，记录初始时长
    }

    setStatus('running');

    // 启动计时器
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000) as unknown as NodeJS.Timeout;

    // 同时用 setTimeout 记录 intervalId
    try {
      const intervalId = setInterval(() => {}, 1000) as unknown as number;
      intervalIdRef.current = intervalId;
      clearInterval(intervalId);
    } catch (e) {
      // ignore
    }

    Taro.showToast({ title: mode === 'focus' ? '开始专注学习！' : '休息一下~', icon: 'none' });
  }, [status, mode]);

  const handlePause = useCallback(() => {
    if (status !== 'running') return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setStatus('paused');
    Taro.showToast({ title: '已暂停', icon: 'none' });
  }, [status]);

  const handleReset = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const originalDuration = durationConfigs[mode].duration;
    setRemaining(duration);
    if (duration !== originalDuration) {
      // keep custom duration
    }
    setStatus('idle');
    setShowComplete(false);
  }, [mode, duration, durationConfigs]);

  const handleEnd = useCallback(() => {
    // 计算已完成的专注分钟数
    const elapsed = duration - remaining;
    const elapsedMinutes = Math.floor(elapsed / 60);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mode === 'focus' && elapsedMinutes >= 1) {
      const actualDuration = elapsedMinutes;
      addFocusMinutes(actualDuration);
      addPomodoroRecord({
        duration: actualDuration,
        startTime: Date.now() - elapsed * 1000,
        endTime: Date.now(),
        taskId: selectedTask || undefined,
        taskName: selectedTask
          ? (allTasks.find(t => t.id === selectedTask)?.title || '')
          : '自由学习'
      });
      setCompletedPomodoroMinutes(actualDuration);
      setStatus('finished');
      setShowComplete(true);
    } else if (mode !== 'focus') {
      setStatus('finished');
      Taro.showToast({ title: '休息结束，回去学习吧！', icon: 'success' });
    } else {
      setStatus('idle');
      Taro.showToast({ title: '已放弃（不足1分钟不计入）', icon: 'none' });
    }
  }, [duration, remaining, mode, selectedTask, allTasks, addFocusMinutes, addPomodoroRecord]);

  // 监听计时完成
  useEffect(() => {
    if (remaining === 0 && status === 'running') {
      // 计时完成
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // 只有专注模式才记录数据
      if (mode === 'focus') {
        const actualMinutes = Math.floor(duration / 60);
        addFocusMinutes(actualMinutes);
        addPomodoroRecord({
          duration: actualMinutes,
          startTime: Date.now() - duration * 1000,
          endTime: Date.now(),
          taskId: selectedTask || undefined,
          taskName: selectedTask
            ? (allTasks.find(t => t.id === selectedTask)?.title || '')
            : '自由学习'
        });
        setCompletedPomodoroMinutes(actualMinutes);
        setShowComplete(true);

        // 震动提醒
        try {
          Taro.vibrateLong({ success: () => {}, fail: () => {} });
        } catch (e) {
          // ignore
        }
      } else {
        Taro.showToast({ title: '休息结束啦！', icon: 'success' });
      }

      setStatus('finished');
    }
  }, [remaining, status, mode, duration, selectedTask, allTasks, addFocusMinutes, addPomodoroRecord]);

  const handleTaskSelect = useCallback((taskId: string) => {
    if (status === 'running') {
      Taro.showToast({ title: '计时中无法切换任务', icon: 'none' });
      return;
    }
    setSelectedTask((prev) => (prev === taskId ? null : taskId));
  }, [status]);

  const handleTaskToggle = useCallback((taskId: string, e: any) => {
    e.stopPropagation();
    toggleTask(taskId);
  }, [toggleTask]);

  const handleNextPomodoro = useCallback(() => {
    setShowComplete(false);
    setRemaining(duration);
    setStatus('idle');
  }, [duration]);

  const handleBack = useCallback(() => {
    if (status === 'running') {
      Taro.showModal({
        title: '确认离开？',
        content: '计时进行中，离开将放弃当前番茄钟',
        confirmText: '放弃离开',
        cancelText: '继续留下',
        success: (res) => {
          if (res.confirm) {
            Taro.navigateBack();
          }
        }
      });
      return;
    }
    Taro.navigateBack();
  }, [status]);

  // 页面隐藏时暂停计时
  useDidHide(() => {
    if (status === 'running') {
      handlePause();
    }
  });

  // 卸载时清理
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const selectedTaskObj = selectedTask
    ? allTasks.find((t) => t.id === selectedTask)
    : null;

  return (
    <View className={styles.pomodoroPage}>
      {/* 装饰圆形 */}
      <View className={`${styles.decorationCircle} ${styles.circle1}`} />
      <View className={`${styles.decorationCircle} ${styles.circle2}`} />
      <View className={`${styles.decorationCircle} ${styles.circle3}`} />

      {/* 头部 */}
      <View className={styles.header}>
        <Button className={styles.backBtn} onClick={handleBack}>
          ←
        </Button>

        <View className={styles.modeTabs}>
          <View
            className={classnames(styles.modeTab, mode === 'focus' && styles.active)}
            onClick={() => handleModeChange('focus')}
          >
            <Text>专注</Text>
          </View>
          <View
            className={classnames(styles.modeTab, mode === 'shortBreak' && styles.active)}
            onClick={() => handleModeChange('shortBreak')}
          >
            <Text>短休</Text>
          </View>
          <View
            className={classnames(styles.modeTab, mode === 'longBreak' && styles.active)}
            onClick={() => handleModeChange('longBreak')}
          >
            <Text>长休</Text>
          </View>
        </View>

        <View className={styles.statsIcon}>
          <Text>📊</Text>
        </View>
      </View>

      {/* 计时器 */}
      <View className={styles.timerSection}>
        <Text className={styles.pomodoroLabel}>{durationConfigs[mode].label}</Text>

        <View className={styles.timerCircleWrap}>
          <svg
            className={styles.timerCircle}
            viewBox="0 0 500 500"
            width="500"
            height="500"
          >
            <circle
              className={styles.timerCircleBg}
              cx="250"
              cy="250"
              r="220"
            />
            <circle
              className={styles.timerCircleProgress}
              cx="250"
              cy="250"
              r="220"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={progressOffset}
            />
          </svg>

          <View className={styles.timerCenter}>
            <Text className={styles.timerTime}>{formatTime(remaining)}</Text>
            <Text className={styles.timerStatus}>{statusText}</Text>
            {selectedTaskObj && (
              <Text className={styles.timerTask}>{selectedTaskObj.title}</Text>
            )}
          </View>
        </View>

        {/* 控制按钮 */}
        <View className={styles.controls}>
          <Button
            className={classnames(
              styles.controlBtn,
              status === 'idle' && styles.controlBtnDisabled
            )}
            onClick={handleReset}
          >
            ⟲
          </Button>

          <Button
            className={classnames(
              styles.controlBtn,
              styles.controlBtnMain
            )}
            onClick={status === 'running' ? handlePause : handleStart}
          >
            <Text>{status === 'running' ? '⏸' : status === 'paused' ? '▶' : '▶'}</Text>
          </Button>

          <Button
            className={classnames(
              styles.controlBtn,
              (status === 'idle' || status === 'finished') && styles.controlBtnDisabled
            )}
            onClick={handleEnd}
          >
            ⏹
          </Button>
        </View>

        {/* 快速设置时长 */}
        {status === 'idle' && mode === 'focus' && (
          <View className={styles.quickSettings}>
            {[15, 25, 30, 45, 60].map((m) => (
              <View
                key={m}
                className={classnames(
                  styles.quickSetting,
                  Math.floor(duration / 60) === m && styles.active
                )}
                onClick={() => handleQuickDuration(m)}
              >
                <Text>{m}min</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* 统计数据 */}
      <View className={styles.statsSection}>
        <View className={styles.statsCard}>
          <Text className={styles.statsCardTitle}>
            <Text className={styles.statsCardIcon}>📈</Text>
            学习统计
          </Text>
          <View className={styles.statsGrid}>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>
                {todayFocusMinutes}
                <Text className={styles.statUnit}>分钟</Text>
              </Text>
              <Text className={styles.statLabel}>今日专注</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>
                {weeklySummary?.totalMinutes || 0}
                <Text className={styles.statUnit}>分钟</Text>
              </Text>
              <Text className={styles.statLabel}>本周累计</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>
                {weeklySummary?.completedTasks || 0}
                <Text className={styles.statUnit}>个</Text>
              </Text>
              <Text className={styles.statLabel}>完成任务</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 今日任务 */}
      <View className={styles.taskSection}>
        <View className={styles.taskCard}>
          <View className={styles.taskCardTitle}>
            <Text>📝 今日任务</Text>
            <Text className={styles.taskCountBadge}>
              {allTasks.filter(t => t.completed).length}/{allTasks.length}
            </Text>
          </View>

          {allTasks.slice(0, 4).map((task) => (
            <View
              key={task.id}
              className={styles.taskItem}
              onClick={() => handleTaskSelect(task.id)}
            >
              <View
                className={classnames(
                  styles.taskCheckbox,
                  task.completed && styles.taskCheckboxChecked
                )}
                onClick={(e) => handleTaskToggle(task.id, e)}
              >
                {task.completed && <Text>✓</Text>}
              </View>
              <View className={styles.taskInfo}>
                <Text
                  className={classnames(
                    styles.taskName,
                    task.completed && styles.taskNameDone
                  )}
                >
                  {task.title}
                </Text>
                <Text className={styles.taskMeta}>
                  预计 {task.estimatedMinutes} 分钟
                </Text>
              </View>
              <View
                className={classnames(
                  styles.taskFocus,
                  selectedTask === task.id && styles.active
                )}
              >
                <Text>{selectedTask === task.id ? '✓ 已关联' : '🎯 关联'}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 完成弹窗 */}
      {showComplete && mode === 'focus' && (
        <View className={styles.completeMask}>
          <View className={styles.completeCard}>
            <Text className={styles.completeIcon}>🎉</Text>
            <Text className={styles.completeTitle}>太棒了！番茄钟完成</Text>
            <Text className={styles.completeSubtitle}>
              距离你的目标又近了一步，继续加油！
            </Text>

            <View className={styles.completeStats}>
              <View className={styles.completeStatItem}>
                <Text className={styles.completeStatValue}>
                  {completedPomodoroMinutes}
                </Text>
                <Text className={styles.completeStatLabel}>专注分钟</Text>
              </View>
              <View className={styles.completeStatItem}>
                <Text className={styles.completeStatValue}>
                  {todayFocusMinutes}
                </Text>
                <Text className={styles.completeStatLabel}>今日累计</Text>
              </View>
            </View>

            <View className={styles.completeActions}>
              <Button
                className={classnames(styles.completeBtn, styles.completeBtnSecondary)}
                onClick={() => setShowComplete(false)}
              >
                查看统计
              </Button>
              <Button
                className={classnames(styles.completeBtn, styles.completeBtnPrimary)}
                onClick={handleNextPomodoro}
              >
                再来一个
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default PomodoroPage;
