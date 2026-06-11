import React, { useCallback, useMemo } from 'react';
import { View, Text, Button, Image, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppStore } from '@/store/useAppStore';
import { buddyList } from '@/data/buddies';
import type { StudyRoom } from '@/types';

const StudyRoomPage: React.FC = () => {
  const { studyRooms, userProfile } = useAppStore();

  useDidShow(() => {
    console.log('[StudyRoom] 页面显示, rooms:', studyRooms.length);
  });

  const getMemberInfo = useCallback((memberId: string) => {
    if (memberId === 'me') {
      return {
        nickname: userProfile?.nickname || '我',
        avatar: userProfile?.avatar || 'https://picsum.photos/id/64/200/200'
      };
    }
    const buddy = buddyList.find(b => b.id === memberId);
    if (buddy) {
      return {
        nickname: buddy.isAnonymous ? '匿名搭子' : buddy.nickname,
        avatar: buddy.avatar
      };
    }
    return {
      nickname: '搭子',
      avatar: 'https://picsum.photos/id/1025/200/200'
    };
  }, [userProfile]);

  const handleGoMatch = useCallback(() => {
    Taro.switchTab({ url: '/pages/match/index' });
  }, []);

  const handleEnterRoom = useCallback((room: StudyRoom) => {
    console.log('[StudyRoom] 进入自习室:', room);
    Taro.showToast({ title: '自习室功能开发中', icon: 'none' });
  }, []);

  const formatCreateTime = useCallback((isoStr: string): string => {
    const date = new Date(isoStr);
    return `${date.getMonth() + 1}月${date.getDate()}日创建`;
  }, []);

  const sortedRooms = useMemo(
    () => [...studyRooms].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ),
    [studyRooms]
  );

  return (
    <ScrollView className={styles.studyRoomPage} scrollY enhanced>
      {/* 顶部横幅 */}
      <View className={styles.headerBanner}>
        <Text className={styles.bannerTitle}>📚 小组自习室</Text>
        <Text className={styles.bannerSubtitle}>和搭子一起，并肩作战</Text>
        <View className={styles.bannerStats}>
          <View className={styles.bannerStatItem}>
            <Text className={styles.statNum}>{sortedRooms.length}</Text>
            <Text className={styles.statLabel}>自习室</Text>
          </View>
          <View className={styles.bannerStatItem}>
            <Text className={styles.statNum}>
              {sortedRooms.reduce((sum, r) => sum + r.members.length, 0)}
            </Text>
            <Text className={styles.statLabel}>学习伙伴</Text>
          </View>
        </View>
      </View>

      {/* 房间列表 */}
      <View className={styles.roomSection}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionTitleIcon}>🏠</Text>
            我的自习室
          </Text>
          {sortedRooms.length > 0 && (
            <Text className={styles.roomCountBadge}>
              {sortedRooms.length} 个
            </Text>
          )}
        </View>

        {sortedRooms.length > 0 ? (
          <View>
            {sortedRooms.map((room) => {
              const membersInfo = room.members.map(id => getMemberInfo(id));
              return (
                <View key={room.id} className={styles.roomCard}>
                  <View className={styles.roomCardHeader}>
                    <View className={styles.roomNameRow}>
                      <View className={styles.roomIcon}>
                        <Text>🎯</Text>
                      </View>
                      <Text className={styles.roomName}>{room.name}</Text>
                    </View>
                    <View className={styles.roomActiveBadge}>
                      <View className={styles.onlineDot} />
                      <Text>进行中</Text>
                    </View>
                  </View>

                  {/* 成员头像 */}
                  <View className={styles.membersGroup}>
                    <View className={styles.membersAvatars}>
                      {membersInfo.slice(0, 4).map((member, idx) => (
                        <Image
                          key={idx}
                          className={styles.memberAvatar}
                          src={member.avatar}
                          mode="aspectFill"
                        />
                      ))}
                    </View>
                    <Text className={styles.membersText}>
                      <Text className={styles.membersCount}>{room.members.length}</Text>
                      位成员 · {formatCreateTime(room.createdAt)}
                    </Text>
                  </View>

                  {/* 房间信息 */}
                  <View className={styles.roomInfoGrid}>
                    <View className={styles.roomInfoTag}>
                      <Text className={styles.roomInfoLabel}>打卡周期</Text>
                      <Text className={styles.roomInfoValue}>
                        {room.checkinCycle >= 100
                          ? '全程'
                          : `${room.checkinCycle} 天`}
                      </Text>
                    </View>
                    <View className={styles.roomInfoTag}>
                      <Text className={styles.roomInfoLabel}>成员</Text>
                      <Text className={styles.roomInfoValue}>
                        {membersInfo.map(m => m.nickname).join('、')}
                      </Text>
                    </View>
                  </View>

                  {/* 共同目标 */}
                  {room.commonGoal && (
                    <View className={styles.roomGoalCard}>
                      <Text className={styles.roomGoalLabel}>共同目标</Text>
                      <Text className={styles.roomGoalText}>{room.commonGoal}</Text>
                    </View>
                  )}

                  {/* 进入按钮 */}
                  <Button
                    className={styles.enterRoomBtn}
                    onClick={() => handleEnterRoom(room)}
                  >
                    进入自习室 →
                  </Button>
                </View>
              );
            })}
          </View>
        ) : (
          <View className={styles.emptyState}>
            <View className={styles.emptyIcon}>
              <Text>🔍</Text>
            </View>
            <Text className={styles.emptyTitle}>还没有自习室</Text>
            <Text className={styles.emptyDesc}>
              找到合适的搭子并结伴后{'\n'}
              会自动创建专属自习室
            </Text>
            <Button className={styles.emptyAction} onClick={handleGoMatch}>
              去匹配搭子
            </Button>
          </View>
        )}
      </View>

      {/* 快捷入口提示 */}
      {sortedRooms.length === 0 && (
        <View className={styles.quickTip}>
          <Text className={styles.quickTipIcon}>💡</Text>
          <Text className={styles.quickTipText}>
            接受结伴申请后会自动创建自习室，也可以从搭子详情页发起申请
          </Text>
          <Text
            className={styles.quickTipLink}
            onClick={handleGoMatch}
          >
            去看看 ›
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

export default StudyRoomPage;
