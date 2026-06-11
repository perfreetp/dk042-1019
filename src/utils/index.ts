export const formatDate = (date: Date | string, format: string = 'YYYY-MM-DD'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

export const formatMinutes = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}小时${mins > 0 ? mins + '分钟' : ''}`;
  }
  return `${mins}分钟`;
};

export const getStageLabel = (stage: string): string => {
  const map: Record<string, string> = {
    preliminary: '预备阶段',
    foundation: '基础阶段',
    strengthen: '强化阶段',
    sprint: '冲刺阶段'
  };
  return map[stage] || stage;
};

export const getHoursLabel = (hours: string): string => {
  const map: Record<string, string> = {
    less4: '4小时以下',
    '4to6': '4-6小时',
    '6to8': '6-8小时',
    '8to10': '8-10小时',
    more10: '10小时以上'
  };
  return map[hours] || hours;
};

export const getScheduleLabel = (schedule: string): string => {
  const map: Record<string, string> = {
    early_bird: '早起型',
    night_owl: '夜猫子',
    normal: '规律作息'
  };
  return map[schedule] || schedule;
};

export const getSuperviseLabel = (supervise: string): string => {
  const map: Record<string, string> = {
    daily_check: '每日打卡',
    mutual_supervise: '互相监督',
    weekly_report: '周报反馈',
    timed_reminder: '定时提醒'
  };
  return map[supervise] || supervise;
};

export const getOnlineStatusText = (status: string): string => {
  const map: Record<string, string> = {
    online: '在线',
    offline: '离线',
    busy: '学习中'
  };
  return map[status] || status;
};

export const getOnlineStatusColor = (status: string): string => {
  const map: Record<string, string> = {
    online: '#00B42A',
    offline: '#C9CDD4',
    busy: '#FF7D00'
  };
  return map[status] || '#C9CDD4';
};
