// 备考阶段
export type StudyStage = 'foundation' | 'strengthen' | 'sprint' | 'preliminary';

// 每日学习时长
export type DailyHours = 'less4' | '4to6' | '6to8' | '8to10' | 'more10';

// 作息偏好
export type ScheduleType = 'early_bird' | 'night_owl' | 'normal';

// 监督方式
export type SuperviseType = 'daily_check' | 'mutual_supervise' | 'weekly_report' | 'timed_reminder';

// 搭子信息
export interface Buddy {
  id: string;
  nickname: string;
  avatar: string;
  targetSchool: string;
  targetMajor: string;
  studyStage: StudyStage;
  dailyHours: DailyHours;
  scheduleType: ScheduleType;
  superviseType: SuperviseType;
  location: string;
  isAnonymous: boolean;
  plan: string;
  tags: string[];
  matchRate: number;
  onlineStatus: 'online' | 'offline' | 'busy';
}

// 筛选条件
export interface FilterParams {
  targetSchool?: string;
  targetMajor?: string;
  studyStage?: StudyStage;
  dailyHours?: DailyHours;
  scheduleType?: ScheduleType;
}

// 任务状态
export type TaskStatus = 'pending' | 'doing' | 'done';

// 打卡任务
export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  duration?: number;
  startTime?: string;
  endTime?: string;
  isShared?: boolean;
}

// 番茄钟记录
export interface PomodoroRecord {
  id: string;
  date: string;
  focusMinutes: number;
  breakMinutes: number;
  sessions: number;
}

// 周总结
export interface WeeklySummary {
  weekStart: string;
  weekEnd: string;
  totalStudyHours: number;
  completedTasks: number;
  attendanceRate: number;
  streakDays: number;
}

// 消息会话
export interface Conversation {
  id: string;
  buddyId: string;
  buddyName: string;
  buddyAvatar: string;
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
}

// 用户信息
export interface UserProfile {
  id: string;
  nickname: string;
  avatar: string;
  targetSchool: string;
  targetMajor: string;
  studyStage: StudyStage;
  dailyHours: DailyHours;
  scheduleType: ScheduleType;
  superviseType: SuperviseType;
  location: string;
  isAnonymous: boolean;
  plan: string;
  tags: string[];
}

// 结伴申请
export interface BuddyRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  checkinCycle?: number;
  commonGoal?: string;
  applyNote?: string;
  createdAt: string;
}

// 聊天消息链接
export interface ChatLink {
  url: string;
  title: string;
  icon?: string;
  meta?: string;
  desc?: string;
}

// 计划调整请求
export interface PlanRequest {
  studyStage?: StudyStage;
  dailyHours?: DailyHours;
  scheduleType?: ScheduleType;
  superviseType?: SuperviseType;
  commonGoal?: string;
  checkinCycle?: number;
  reason?: string;
  status?: 'pending' | 'approved' | 'rejected';
}

// 聊天消息
export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'text' | 'link' | 'system' | 'plan_request' | 'plan_response';
  timestamp: number;
  read: boolean;
  link?: ChatLink;
  planRequest?: PlanRequest;
}

// 番茄钟记录
export interface PomodoroSession {
  id: string;
  duration: number;
  startTime: number;
  endTime: number;
  taskId?: string;
  taskName?: string;
}

// 任务 - 增加 completed 字段兼容新旧代码
export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  completed?: boolean;
  duration?: number;
  estimatedMinutes?: number;
  startTime?: string;
  endTime?: string;
  isShared?: boolean;
}

// 小组自习室
export interface StudyRoom {
  id: string;
  name: string;
  members: string[];
  commonGoal: string;
  checkinCycle: number;
  createdAt: string;
}

// 黑名单
export interface BlacklistItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  reason?: string;
  createdAt: string;
}

// 匹配评价
export interface MatchRating {
  id: string;
  fromUserId: string;
  toUserId: string;
  rating: number;
  tags: string[];
  comment?: string;
  createdAt: string;
}
