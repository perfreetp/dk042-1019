import type { Buddy } from '@/types';

export const buddyList: Buddy[] = [
  {
    id: '1',
    nickname: '考研上岸鸭',
    avatar: 'https://picsum.photos/id/64/200/200',
    targetSchool: '北京大学',
    targetMajor: '计算机科学与技术',
    studyStage: 'strengthen',
    dailyHours: '8to10',
    scheduleType: 'early_bird',
    superviseType: 'mutual_supervise',
    location: '北京',
    isAnonymous: false,
    plan: '每天早上6点起床，上午数学，下午专业课，晚上英语和政治，11点准时睡觉。',
    tags: ['985目标', '跨考', '二战', '自律型'],
    matchRate: 92,
    onlineStatus: 'online'
  },
  {
    id: '2',
    nickname: '匿名用户',
    avatar: 'https://picsum.photos/id/338/200/200',
    targetSchool: '清华大学',
    targetMajor: '软件工程',
    studyStage: 'sprint',
    dailyHours: 'more10',
    scheduleType: 'night_owl',
    superviseType: 'daily_check',
    location: '上海',
    isAnonymous: true,
    plan: '冲刺阶段每天12小时，早8晚10，主攻真题和模拟题。',
    tags: ['清北复交', '本专业', '一战', '夜猫子'],
    matchRate: 87,
    onlineStatus: 'busy'
  },
  {
    id: '3',
    nickname: '稳稳的幸福',
    avatar: 'https://picsum.photos/id/91/200/200',
    targetSchool: '复旦大学',
    targetMajor: '金融学',
    studyStage: 'foundation',
    dailyHours: '6to8',
    scheduleType: 'normal',
    superviseType: 'weekly_report',
    location: '广东',
    isAnonymous: false,
    plan: '基础阶段慢慢来，每天6-8小时，打好数学和英语基础。',
    tags: ['金融专硕', '跨考', '在职备考', '稳扎稳打'],
    matchRate: 85,
    onlineStatus: 'online'
  },
  {
    id: '4',
    nickname: '冲冲冲',
    avatar: 'https://picsum.photos/id/177/200/200',
    targetSchool: '浙江大学',
    targetMajor: '机械工程',
    studyStage: 'strengthen',
    dailyHours: '8to10',
    scheduleType: 'early_bird',
    superviseType: 'mutual_supervise',
    location: '浙江',
    isAnonymous: false,
    plan: '强化阶段大量刷题，早上5:30起，晚上10:30睡，中午午休1小时。',
    tags: ['工科', '二战', '早起型', '题海战术'],
    matchRate: 83,
    onlineStatus: 'offline'
  },
  {
    id: '5',
    nickname: '匿名学霸',
    avatar: 'https://picsum.photos/id/1027/200/200',
    targetSchool: '上海交通大学',
    targetMajor: '临床医学',
    studyStage: 'sprint',
    dailyHours: 'more10',
    scheduleType: 'night_owl',
    superviseType: 'timed_reminder',
    location: '上海',
    isAnonymous: true,
    plan: '医学考研内容多，每天12小时以上，深夜效率高。',
    tags: ['医学', '本专业', '冲刺', '夜猫子'],
    matchRate: 79,
    onlineStatus: 'online'
  },
  {
    id: '6',
    nickname: '一研为定',
    avatar: 'https://picsum.photos/id/64/200/200',
    targetSchool: '南京大学',
    targetMajor: '汉语言文学',
    studyStage: 'foundation',
    dailyHours: '4to6',
    scheduleType: 'normal',
    superviseType: 'daily_check',
    location: '江苏',
    isAnonymous: false,
    plan: '文科考研重在积累，每天4-6小时，循序渐进。',
    tags: ['文科', '一战', '应届生', '按部就班'],
    matchRate: 76,
    onlineStatus: 'busy'
  },
  {
    id: '7',
    nickname: '上岸锦鲤',
    avatar: 'https://picsum.photos/id/91/200/200',
    targetSchool: '武汉大学',
    targetMajor: '法律硕士',
    studyStage: 'strengthen',
    dailyHours: '6to8',
    scheduleType: 'early_bird',
    superviseType: 'mutual_supervise',
    location: '湖北',
    isAnonymous: false,
    plan: '法硕知识点多需要反复记忆，早上背诵效果最好。',
    tags: ['法硕', '跨考', '二战', '晨读型'],
    matchRate: 74,
    onlineStatus: 'online'
  },
  {
    id: '8',
    nickname: '匿名战士',
    avatar: 'https://picsum.photos/id/338/200/200',
    targetSchool: '中山大学',
    targetMajor: '生物医学工程',
    studyStage: 'sprint',
    dailyHours: '8to10',
    scheduleType: 'night_owl',
    superviseType: 'daily_check',
    location: '广东',
    isAnonymous: true,
    plan: '最后冲刺，每天8-10小时，主攻真题和错题回顾。',
    tags: ['理工科', '一战', '冲刺', '匿名'],
    matchRate: 71,
    onlineStatus: 'offline'
  },
  {
    id: '9',
    nickname: '考研小白',
    avatar: 'https://picsum.photos/id/177/200/200',
    targetSchool: '四川大学',
    targetMajor: '工商管理',
    studyStage: 'preliminary',
    dailyHours: 'less4',
    scheduleType: 'normal',
    superviseType: 'weekly_report',
    location: '四川',
    isAnonymous: false,
    plan: '刚开始准备，还在择校和了解阶段，求带！',
    tags: ['MBA', '在职', '萌新', '求带'],
    matchRate: 68,
    onlineStatus: 'online'
  },
  {
    id: '10',
    nickname: '稳稳上岸',
    avatar: 'https://picsum.photos/id/1027/200/200',
    targetSchool: '西安交通大学',
    targetMajor: '电气工程',
    studyStage: 'strengthen',
    dailyHours: '6to8',
    scheduleType: 'early_bird',
    superviseType: 'mutual_supervise',
    location: '陕西',
    isAnonymous: false,
    plan: '强化阶段稳步推进，每天6-8小时，注重效率不拼时长。',
    tags: ['电气', '二战', '效率派', '早起型'],
    matchRate: 73,
    onlineStatus: 'online'
  }
];

export const stageMap: Record<string, string> = {
  preliminary: '预备阶段',
  foundation: '基础阶段',
  strengthen: '强化阶段',
  sprint: '冲刺阶段'
};

export const hoursMap: Record<string, string> = {
  less4: '4小时以下',
  '4to6': '4-6小时',
  '6to8': '6-8小时',
  '8to10': '8-10小时',
  more10: '10小时以上'
};

export const scheduleMap: Record<string, string> = {
  early_bird: '早起型',
  night_owl: '夜猫子',
  normal: '规律作息'
};

export const superviseMap: Record<string, string> = {
  daily_check: '每日打卡',
  mutual_supervise: '互相监督',
  weekly_report: '周报反馈',
  timed_reminder: '定时提醒'
};
