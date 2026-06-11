import type { Conversation } from '@/types';

export const conversations: Conversation[] = [
  {
    id: '1',
    buddyId: '1',
    buddyName: '考研上岸鸭',
    buddyAvatar: 'https://picsum.photos/id/64/200/200',
    lastMessage: '今天数学那道题你做出来了吗？我卡了好久',
    lastTime: '刚刚',
    unreadCount: 3
  },
  {
    id: '2',
    buddyId: '3',
    buddyName: '稳稳的幸福',
    buddyAvatar: 'https://picsum.photos/id/91/200/200',
    lastMessage: '我把英语真题资料发你了，记得查收~',
    lastTime: '10分钟前',
    unreadCount: 1
  },
  {
    id: '3',
    buddyId: '4',
    buddyName: '冲冲冲',
    buddyAvatar: 'https://picsum.photos/id/177/200/200',
    lastMessage: '明天早上6点准时开始哦！',
    lastTime: '1小时前',
    unreadCount: 0
  },
  {
    id: '4',
    buddyId: '7',
    buddyName: '上岸锦鲤',
    buddyAvatar: 'https://picsum.photos/id/91/200/200',
    lastMessage: '这周的周总结你写了吗？',
    lastTime: '昨天',
    unreadCount: 0
  },
  {
    id: '5',
    buddyId: '10',
    buddyName: '稳稳上岸',
    buddyAvatar: 'https://picsum.photos/id/1027/200/200',
    lastMessage: '好的，一起加油！',
    lastTime: '2天前',
    unreadCount: 0
  },
  {
    id: '6',
    buddyId: '5',
    buddyName: '匿名学霸',
    buddyAvatar: 'https://picsum.photos/id/1027/200/200',
    lastMessage: '资料我已经整理好了',
    lastTime: '3天前',
    unreadCount: 0
  }
];

export const systemMessages = [
  {
    id: 'sys1',
    title: '结伴申请通知',
    content: '冲冲冲 向你发起了结伴申请',
    time: '2小时前',
    type: 'request'
  },
  {
    id: 'sys2',
    title: '打卡提醒',
    content: '你的搭子 考研上岸鸭 已经完成今日打卡',
    time: '今天 09:30',
    type: 'reminder'
  },
  {
    id: 'sys3',
    title: '匹配成功',
    content: '恭喜你与 稳稳的幸福 匹配成功！',
    time: '昨天',
    type: 'match'
  }
];
