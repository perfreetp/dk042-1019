import { create } from 'zustand';
import type { UserProfile, FilterParams, Task } from '@/types';
import { todayTasks } from '@/data/tasks';

interface AppState {
  userProfile: UserProfile | null;
  filterParams: FilterParams;
  tasks: Task[];
  setUserProfile: (profile: UserProfile) => void;
  setFilterParams: (params: Partial<FilterParams>) => void;
  toggleTaskStatus: (taskId: string) => void;
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

export const useAppStore = create<AppState>((set) => ({
  userProfile: defaultUser,
  filterParams: {},
  tasks: todayTasks,
  setUserProfile: (profile) => set({ userProfile: profile }),
  setFilterParams: (params) =>
    set((state) => ({
      filterParams: { ...state.filterParams, ...params }
    })),
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
    }))
}));
