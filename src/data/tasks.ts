import type { Task, WeeklySummary, PomodoroRecord } from '@/types';

export const todayTasks: Task[] = [
  {
    id: '1',
    title: '数学 - 高数第三章习题',
    status: 'done',
    duration: 120,
    startTime: '08:00',
    endTime: '10:00',
    isShared: true
  },
  {
    id: '2',
    title: '英语 - 真题阅读2篇',
    status: 'doing',
    duration: 90,
    startTime: '10:30',
    endTime: '12:00',
    isShared: true
  },
  {
    id: '3',
    title: '专业课 - 数据结构复习',
    status: 'pending',
    duration: 150,
    startTime: '14:00',
    endTime: '16:30',
    isShared: false
  },
  {
    id: '4',
    title: '政治 - 马原选择题',
    status: 'pending',
    duration: 60,
    startTime: '19:00',
    endTime: '20:00',
    isShared: true
  },
  {
    id: '5',
    title: '英语 - 单词背诵',
    status: 'pending',
    duration: 30,
    startTime: '22:00',
    endTime: '22:30',
    isShared: false
  }
];

export const weeklySummary: WeeklySummary = {
  weekStart: '2024-06-10',
  weekEnd: '2024-06-16',
  totalStudyHours: 42.5,
  completedTasks: 28,
  attendanceRate: 90,
  streakDays: 7
};

export const pomodoroRecords: PomodoroRecord[] = [
  { id: '1', date: '周一', focusMinutes: 360, breakMinutes: 60, sessions: 6 },
  { id: '2', date: '周二', focusMinutes: 420, breakMinutes: 70, sessions: 7 },
  { id: '3', date: '周三', focusMinutes: 300, breakMinutes: 50, sessions: 5 },
  { id: '4', date: '周四', focusMinutes: 480, breakMinutes: 80, sessions: 8 },
  { id: '5', date: '周五', focusMinutes: 360, breakMinutes: 60, sessions: 6 },
  { id: '6', date: '周六', focusMinutes: 540, breakMinutes: 90, sessions: 9 },
  { id: '7', date: '周日', focusMinutes: 420, breakMinutes: 70, sessions: 7 }
];

export const absenceRecords = [
  { id: '1', date: '2024-06-08', reason: '身体不适', type: 'full_day' },
  { id: '2', date: '2024-06-05', reason: '学校有事', type: 'half_day' }
];
