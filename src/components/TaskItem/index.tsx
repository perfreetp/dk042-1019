import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import type { Task } from '@/types';
import { formatMinutes } from '@/utils';
import styles from './index.module.scss';

interface TaskItemProps {
  task: Task;
  onToggle?: (task: Task) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle }) => {
  const handleClick = () => {
    if (onToggle) {
      onToggle(task);
    }
  };

  const getStatusText = () => {
    switch (task.status) {
      case 'doing':
        return '进行中';
      case 'done':
        return '已完成';
      default:
        return '待开始';
    }
  };

  return (
    <View
      className={classnames(styles.taskItem, task.status === 'done' && styles.done)}
      onClick={handleClick}
    >
      <View
        className={classnames(styles.checkbox, task.status === 'done' && styles.checked)}
      />

      <View className={styles.taskContent}>
        <View style={{ display: 'flex', alignItems: 'center' }}>
          <Text className={styles.title}>{task.title}</Text>
          <Text className={classnames(styles.statusTag, styles[task.status])}>
            {getStatusText()}
          </Text>
        </View>

        <View className={styles.meta}>
          {task.startTime && task.endTime && (
            <Text className={styles.time}>
              ⏰ {task.startTime}-{task.endTime}
            </Text>
          )}
          {task.duration && (
            <>
              <Text className={styles.dot}></Text>
              <Text className={styles.duration}>
                {formatMinutes(task.duration)}
              </Text>
            </>
          )}
          {task.isShared && (
            <>
              <Text className={styles.dot}></Text>
              <Text className={styles.sharedBadge}>搭子可见</Text>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

export default TaskItem;
