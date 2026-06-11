import { create } from 'zustand';
import type {
  UserProfile,
  FilterParams,
  Task,
  BuddyRequest,
  StudyRoom,
  Conversation,
  WeeklySummary,
  ChatMessage,
  PomodoroSession,
  PlanRequest,
  ChatLink
} from '@/types';
import { todayTasks, weeklySummary as defaultWeeklySummary } from '@/data/tasks';
import { conversations as defaultConversations } from '@/data/messages';

type SendChatMessageParams = {
  content: string;
  type?: 'text' | 'link' | 'system' | 'plan_request' | 'plan_response';
  senderId?: string;
  link?: ChatLink;
  planRequest?: PlanRequest;
};

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
  pomodoroSessions: PomodoroSession[];

  setUserProfile: (profile: UserProfile) => void;
  setFilterParams: (params: Partial<FilterParams>) => void;
  clearFilterParams: () => void;
  toggleTaskStatus: (taskId: string) => void;
  toggleTask: (taskId: string) => void;
  addFocusMinutes: (minutes: number) => void;
  addPomodoroRecord: (session: Omit<PomodoroSession, 'id'>) => void;

  sendBuddyRequest: (
    toUserId: string,
    data: { checkinCycle: number; commonGoal: string; message?: string }
  ) => BuddyRequest | null;
  acceptBuddyRequest: (requestId: string) => void;
  rejectBuddyRequest: (requestId: string) => void;

  sendChatMessage: (
    conversationId: string,
    params: string | SendChatMessageParams
  ) => void;
  updateConversation: (
    conversationId: string,
    data: Partial<Conversation>
  ) => void;

  addStudyRoom: (room: Omit<StudyRoom, 'id' | 'createdAt'>) => StudyRoom;
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

const formatLastMessage = (msg: ChatMessage): string => {
  if (msg.type === 'link') {
    return `[资料] ${msg.link?.title || msg.content}`.substring(0, 40);
  }
  if (msg.type === 'plan_request') {
    return '[计划调整请求] 查看详情';
  }
  if (msg.type === 'plan_response') {
    return msg.planRequest?.status === 'approved'
      ? '[计划调整] 已同意'
      : '[计划调整] 已回复';
  }
  if (msg.type === 'system') {
    return `[系统] ${msg.content}`.substring(0, 40);
  }
  return msg.content.substring(0, 40);
};

export const useAppStore = create<AppState>((set, get) => ({
  userProfile: defaultUser,
  filterParams: {},
  tasks: todayTasks.map(t => ({ ...t, completed: t.status === 'done' })),
  weeklySummary: defaultWeeklySummary,
  buddyRequests: [],
  studyRooms: [],
  conversations: defaultConversations,
  chatMessages: {},
  todayFocusMinutes: 0,
  pomodoroSessions: [],

  setUserProfile: (profile) => set({ userProfile: profile }),

  setFilterParams: (params) =>
    set((state) => ({
      filterParams: { ...state.filterParams, ...params }
    })),

  clearFilterParams: () => set({ filterParams: {} }),

  toggleTaskStatus: (taskId) =>
    set((state) => {
      const newTasks = state.tasks.map((task) => {
        if (task.id !== taskId) return task;
        const newStatus = task.status === 'done' ? 'pending' : 'done';
        return {
          ...task,
          status: newStatus,
          completed: newStatus === 'done'
        };
      });
      const completedCount = newTasks.filter(t => t.status === 'done').length;
      return {
        tasks: newTasks,
        weeklySummary: {
          ...state.weeklySummary,
          completedTasks: completedCount
        }
      };
    }),

  toggleTask: (taskId) => {
    get().toggleTaskStatus(taskId);
  },

  addFocusMinutes: (minutes) =>
    set((state) => {
      const newTodayMinutes = state.todayFocusMinutes + minutes;
      const newWeeklyHours = Number(
        (state.weeklySummary.totalStudyHours + minutes / 60).toFixed(1)
      );
      console.log('[Store] addFocusMinutes:', {
        added: minutes,
        today: newTodayMinutes,
        weekly: newWeeklyHours
      });
      return {
        todayFocusMinutes: newTodayMinutes,
        weeklySummary: {
          ...state.weeklySummary,
          totalStudyHours: newWeeklyHours
        }
      };
    }),

  addPomodoroRecord: (session) =>
    set((state) => ({
      pomodoroSessions: [
        { ...session, id: `pom_${Date.now()}` },
        ...state.pomodoroSessions
      ]
    })),

  sendBuddyRequest: (toUserId, data) => {
    const now = new Date();
    const newRequest: BuddyRequest = {
      id: `req_${Date.now()}`,
      fromUserId: 'me',
      toUserId,
      status: 'pending',
      message: data.message,
      checkinCycle: data.checkinCycle,
      commonGoal: data.commonGoal,
      applyNote: data.message,
      createdAt: now.toISOString()
    };
    set((state) => ({
      buddyRequests: [newRequest, ...state.buddyRequests]
    }));
    console.log('[Store] 结伴申请已发送:', newRequest);
    return newRequest;
  },

  acceptBuddyRequest: (requestId) => {
    const state = get();
    const req = state.buddyRequests.find((r) => r.id === requestId);
    if (!req) {
      console.warn('[Store] acceptBuddyRequest: request not found', requestId);
      return;
    }

    console.log('[Store] 接受结伴申请:', req);

    // 更新申请状态
    set((s) => ({
      buddyRequests: s.buddyRequests.map((r) =>
        r.id === requestId ? { ...r, status: 'accepted' } : r
      )
    }));

    // 对方用户ID
    const otherUserId = req.fromUserId === 'me' ? req.toUserId : req.fromUserId;

    // 创建自习室（用申请里的真实数据）
    const newRoom: StudyRoom = {
      id: `room_${Date.now()}`,
      name: '我们的考研自习室',
      members: ['me', otherUserId],
      commonGoal: req.commonGoal || '共同进步，一战上岸！',
      checkinCycle: req.checkinCycle || 7,
      createdAt: new Date().toISOString()
    };

    set((s) => ({
      studyRooms: [newRoom, ...s.studyRooms]
    }));

    console.log('[Store] 自习室已创建:', newRoom);

    // 如果没有会话，自动创建一个
    const existingConv = get().conversations.find(c => c.id === otherUserId);
    if (!existingConv) {
      const buddyInfo = (globalThis as any)._buddyList?.find((b: any) => b.id === otherUserId);
      const newConv: Conversation = {
        id: otherUserId,
        buddyId: otherUserId,
        buddyName: buddyInfo?.nickname || '搭子',
        buddyAvatar: buddyInfo?.avatar || 'https://picsum.photos/id/1027/200/200',
        lastMessage: '我们已结伴成功！开始学习吧~',
        lastTime: '刚刚',
        unreadCount: 0
      };
      set((s) => ({
        conversations: [newConv, ...s.conversations]
      }));
    }
  },

  rejectBuddyRequest: (requestId) =>
    set((state) => ({
      buddyRequests: state.buddyRequests.map((r) =>
        r.id === requestId ? { ...r, status: 'rejected' } : r
      )
    })),

  sendChatMessage: (conversationId, params) => {
    const now = Date.now();
    const nowDate = new Date(now);
    const timeStr = `${String(nowDate.getHours()).padStart(2, '0')}:${String(nowDate.getMinutes()).padStart(2, '0')}`;

    let messageParams: SendChatMessageParams;
    if (typeof params === 'string') {
      messageParams = { content: params, type: 'text' };
    } else {
      messageParams = params;
    }

    const newMessage: ChatMessage = {
      id: `msg_${now}_${Math.random().toString(36).substr(2, 9)}`,
      conversationId,
      senderId: messageParams.senderId || 'me',
      content: messageParams.content,
      type: messageParams.type || 'text',
      timestamp: now,
      read: true,
      link: messageParams.link,
      planRequest: messageParams.planRequest
    };

    const lastMsgPreview = formatLastMessage(newMessage);

    set((state) => {
      const existingMsgs = state.chatMessages[conversationId] || [];
      const newMessages = [...existingMsgs, newMessage];

      // 自动创建会话（如果不存在）
      let newConversations = state.conversations;
      const convExists = state.conversations.some(c => c.id === conversationId);
      if (!convExists) {
        const buddyInfo = (globalThis as any)._buddyList?.find((b: any) => b.id === conversationId);
        newConversations = [
          {
            id: conversationId,
            buddyId: conversationId,
            buddyName: buddyInfo?.nickname || '搭子',
            buddyAvatar: buddyInfo?.avatar || 'https://picsum.photos/id/1027/200/200',
            lastMessage: lastMsgPreview,
            lastTime: timeStr,
            unreadCount: 0
          },
          ...state.conversations
        ];
      } else {
        newConversations = state.conversations.map((c) =>
          c.id === conversationId
            ? { ...c, lastMessage: lastMsgPreview, lastTime: timeStr }
            : c
        );
      }

      return {
        chatMessages: {
          ...state.chatMessages,
          [conversationId]: newMessages
        },
        conversations: newConversations
      };
    });

    console.log('[Store] 消息已发送:', newMessage, '预览:', lastMsgPreview);

    // 自动回复模拟（仅当是我发的文字消息时）
    if (newMessage.senderId === 'me' && newMessage.type === 'text') {
      setTimeout(() => {
        const autoReplies = [
          '好的，收到！',
          '我这边也准备开始了，一起加油！',
          '今天状态不错呢~',
          '你说的对，我们按计划来',
          '嗯嗯，我也这么想的！',
          '收到~ 看完资料有问题再聊',
          '好的！我也正在复习这部分'
        ];
        const reply = autoReplies[Math.floor(Math.random() * autoReplies.length)];
        get().sendChatMessage(conversationId, {
          content: reply,
          type: 'text',
          senderId: conversationId
        });
      }, 1500 + Math.random() * 2000);
    }
  },

  updateConversation: (conversationId, data) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId ? { ...c, ...data } : c
      )
    })),

  addStudyRoom: (room) => {
    const newRoom: StudyRoom = {
      ...room,
      id: `room_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    set((state) => ({
      studyRooms: [newRoom, ...state.studyRooms]
    }));
    console.log('[Store] 自习室已手动添加:', newRoom);
    return newRoom;
  }
}));

// 全局挂载 buddyList 供 store 使用
import { buddyList } from '@/data/buddies';
(globalThis as any)._buddyList = buddyList;
