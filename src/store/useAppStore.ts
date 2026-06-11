import { create } from 'zustand';
import type {
  UserProfile,
  FilterParams,
  Task,
  BuddyRequest,
  StudyRoom,
  Conversation,
  WeeklySummary
} from '@/types';
import { todayTasks, weeklySummary as defaultWeeklySummary } from '@/data/tasks';
import { conversations as defaultConversations } from '@/data/messages';

interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'text' | 'link' | 'system' | 'plan_request';
  time: string;
  extra?: any;
}

interface AppState {
  userProfile: UserProfile | null;
  filterParams: FilterParams;
  tasks: Task[];
  weeklySummary: WeeklySummary;
  buddyRequests: BuddyRequest[];
  studyRooms: StudyRoom[];
  conversations: Conversation[];
  chatMessages: Record<string, ChatMessage[]>;
  todayFocusMinutes: number;

  setUserProfile: (profile: UserProfile) => void;
  setFilterParams: (params: Partial<FilterParams>) => void;
  clearFilterParams: () => void;
  toggleTaskStatus: (taskId: string) => void;
  addFocusMinutes: (minutes: number) => void;

  sendBuddyRequest: (
    toUserId: string,
    data: { checkinCycle: number; commonGoal: string; message?: string }
  ) => BuddyRequest | null;
  acceptBuddyRequest: (requestId: string) => void;
  rejectBuddyRequest: (requestId: string) => void;

  sendChatMessage: (
    conversationId: string,
    content: string,
    type?: 'text' | 'link' | 'plan_request'
  ) => void;
  updateConversation: (
    conversationId: string,
    data: { lastMessage: string; lastTime: string }
  ) => void;

  addStudyRoom: (room: Omit<StudyRoom, 'id' | 'createdAt'>) => void;
}

const defaultUser: UserProfile = {
  id: 'me',
  nickname: '考研人',
  avatar: 'https://picsum.photos/id/64/200/200',
  targetSchool: '目标院校',
  targetMajor: '目标专业',
  studyStage: 'strengthen',
  dailyHours: '8to10',
  scheduleType: 'early_bird',
  superviseType: 'mutual_supervise',
  location: '北京',
  isAnonymous: false,
  plan: '每天按计划学习，争取一战上岸！',
  tags: ['一战', '跨考', '自律型']
};

const defaultMessages: Record<string, ChatMessage[]> = {
  '1': [
    {
      id: 'm1',
      conversationId: '1',
      senderId: '1',
      content: '你好呀！一起加油！',
      type: 'text',
      time: '09:00'
    },
    {
      id: 'm2',
      conversationId: '1',
      senderId: 'me',
      content: '你好！今天数学复习得怎么样？',
      type: 'text',
      time: '09:05'
    },
    {
      id: 'm3',
      conversationId: '1',
      senderId: '1',
      content: '今天数学那道题你做出来了吗？我卡了好久',
      type: 'text',
      time: '10:30'
    }
  ]
};

export const useAppStore = create<AppState>((set, get) => ({
  userProfile: defaultUser,
  filterParams: {},
  tasks: todayTasks,
  weeklySummary: defaultWeeklySummary,
  buddyRequests: [],
  studyRooms: [],
  conversations: defaultConversations,
  chatMessages: defaultMessages,
  todayFocusMinutes: 0,

  setUserProfile: (profile) => set({ userProfile: profile }),

  setFilterParams: (params) =>
    set((state) => ({
      filterParams: { ...state.filterParams, ...params }
    })),

  clearFilterParams: () => set({ filterParams: {} }),

  toggleTaskStatus: (taskId) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: task.status === 'done' ? 'pending' : 'done'
            }
          : task
      )
    })),

  addFocusMinutes: (minutes) =>
    set((state) => ({
      todayFocusMinutes: state.todayFocusMinutes + minutes,
      weeklySummary: {
        ...state.weeklySummary,
        totalStudyHours: Number(
          (state.weeklySummary.totalStudyHours + minutes / 60).toFixed(1)
        )
      }
    })),

  sendBuddyRequest: (toUserId, data) => {
    const now = new Date().toISOString();
    const newRequest: BuddyRequest = {
      id: `req_${Date.now()}`,
      fromUserId: 'me',
      toUserId,
      status: 'pending',
      message: data.message || `打卡周期：${data.checkinCycle}天 | 共同目标：${data.commonGoal}`,
      createdAt: now
    };
    set((state) => ({
      buddyRequests: [newRequest, ...state.buddyRequests]
    }));
    console.log('[Store] 结伴申请已发送:', newRequest);
    return newRequest;
  },

  acceptBuddyRequest: (requestId) => {
    const req = get().buddyRequests.find((r) => r.id === requestId);
    if (!req) return;

    set((state) => ({
      buddyRequests: state.buddyRequests.map((r) =>
        r.id === requestId ? { ...r, status: 'accepted' } : r
      )
    }));

    if (req.fromUserId && req.fromUserId !== 'me') {
      const newRoom: StudyRoom = {
        id: `room_${Date.now()}`,
        name: '我们的自习室',
        members: ['me', req.fromUserId],
        commonGoal: '共同进步，一战上岸！',
        checkinCycle: 7,
        createdAt: new Date().toISOString()
      };
      set((state) => ({
        studyRooms: [newRoom, ...state.studyRooms]
      }));
      console.log('[Store] 自习室已创建:', newRoom);
    }
  },

  rejectBuddyRequest: (requestId) =>
    set((state) => ({
      buddyRequests: state.buddyRequests.map((r) =>
        r.id === requestId ? { ...r, status: 'rejected' } : r
      )
    })),

  sendChatMessage: (conversationId, content, type = 'text') => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      conversationId,
      senderId: 'me',
      content,
      type,
      time: timeStr
    };
    set((state) => ({
      chatMessages: {
        ...state.chatMessages,
        [conversationId]: [
          ...(state.chatMessages[conversationId] || []),
          newMessage
        ]
      },
      conversations: state.conversations.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              lastMessage: type === 'link' ? '[资料链接] ' + content : type === 'plan_request' ? '[计划调整请求] ' + content : content,
              lastTime: timeStr
            }
          : c
      )
    }));

    if (type === 'text') {
      setTimeout(() => {
        const autoReplies = [
          '好的，收到！',
          '我这边也准备开始了，一起加油！',
          '今天状态不错呢~',
          '你说的对，我们按计划来',
          '嗯嗯，我也这么想的！'
        ];
        const reply = autoReplies[Math.floor(Math.random() * autoReplies.length)];
        const replyTime = new Date();
        const replyTimeStr = `${String(replyTime.getHours()).padStart(2, '0')}:${String(replyTime.getMinutes()).padStart(2, '0')}`;
        const replyMsg: ChatMessage = {
          id: `msg_${Date.now()}_r`,
          conversationId,
          senderId: conversationId,
          content: reply,
          type: 'text',
          time: replyTimeStr
        };
        set((state) => ({
          chatMessages: {
            ...state.chatMessages,
            [conversationId]: [
              ...(state.chatMessages[conversationId] || []),
              replyMsg
            ]
          },
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? { ...c, lastMessage: reply, lastTime: replyTimeStr }
              : c
          )
        }));
      }, 1500);
    }
  },

  updateConversation: (conversationId, data) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId ? { ...c, ...data } : c
      )
    })),

  addStudyRoom: (room) =>
    set((state) => ({
      studyRooms: [
        { ...room, id: `room_${Date.now()}`, createdAt: new Date().toISOString() },
        ...state.studyRooms
      ]
    }))
}));
