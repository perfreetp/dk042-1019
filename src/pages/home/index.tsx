import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  Button,
  ScrollView
} from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import styles from './index.module.scss';
import BuddyCard from '@/components/BuddyCard';
import FilterTag from '@/components/FilterTag';
import { buddyList } from '@/data/buddies';
import { useAppStore } from '@/store/useAppStore';
import { getStageLabel, getHoursLabel, getScheduleLabel } from '@/utils';

const HomePage: React.FC = () => {
  const { userProfile, filterParams, setFilterParams } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);

  const stages = ['preliminary', 'foundation', 'strengthen', 'sprint'];
  const hoursOptions = ['less4', '4to6', '6to8', '8to10', 'more10'];
  const schedules = ['early_bird', 'normal', 'night_owl'];

  const handleStageClick = useCallback((stage: string) => {
    setFilterParams({
      studyStage: filterParams.studyStage === stage ? undefined : (stage as any)
    });
  }, [filterParams.studyStage, setFilterParams]);

  const handleHoursClick = useCallback((hours: string) => {
    setFilterParams({
      dailyHours: filterParams.dailyHours === hours ? undefined : (hours as any)
    });
  }, [filterParams.dailyHours, setFilterParams]);

  const handleScheduleClick = useCallback((schedule: string) => {
    setFilterParams({
      scheduleType: filterParams.scheduleType === schedule ? undefined : (schedule as any)
    });
  }, [filterParams.scheduleType, setFilterParams]);

  const handleStartMatch = () => {
    Taro.switchTab({
      url: '/pages/match/index'
    });
  };

  const handleEditProfile = () => {
    Taro.navigateTo({
      url: '/pages/profile-edit/index'
    });
  };

  const handleSeeAll = () => {
    Taro.switchTab({
      url: '/pages/match/index'
    });
  };

  const handleQuickEntry = (type: string) => {
    switch (type) {
      case 'pomodoro':
        Taro.navigateTo({ url: '/pages/pomodoro/index' });
        break;
      case 'studyroom':
        Taro.navigateTo({ url: '/pages/study-room/index' });
        break;
      case 'checkin':
        Taro.switchTab({ url: '/pages/checkin/index' });
        break;
      case 'rank':
        Taro.showToast({ title: '功能开发中', icon: 'none' });
        break;
    }
  };

  usePullDownRefresh(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Taro.stopPullDownRefresh();
    }, 1000);
  });

  useDidShow(() => {
    console.log('[Home] 页面显示');
  });

  const recommendBuddies = buddyList.slice(0, 5);

  return (
    <View className={styles.homePage}>
      {/* 顶部渐变区 */}
      <View className={styles.header}>
        <View className={styles.userSection} onClick={handleEditProfile}>
          <Image
            className={styles.avatar}
            src={userProfile?.avatar || 'https://picsum.photos/id/64/200/200'}
            mode="aspectFill"
          />
          <View className={styles.userInfo}>
            <Text className={styles.greeting}>
              你好，{userProfile?.nickname || '考研人'} 👋
            </Text>
            <Text className={styles.target}>
              {userProfile?.targetSchool || '目标院校'} · {userProfile?.targetMajor || '目标专业'}
            </Text>
          </View>
        </View>

        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>7</Text>
            <Text className={styles.statLabel}>连续打卡</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>42.5h</Text>
            <Text className={styles.statLabel}>本周学习</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>3</Text>
            <Text className={styles.statLabel}>我的搭子</Text>
          </View>
        </View>
      </View>

      {/* 内容区 */}
      <View className={styles.content}>
        {/* 快捷入口 */}
        <View className={styles.quickEntries}>
          <View className={styles.quickItem} onClick={() => handleQuickEntry('pomodoro')}>
            <View className={styles.quickIcon} style={{ background: '#FFF3E6' }}>🍅</View>
            <Text className={styles.quickLabel}>番茄钟</Text>
          </View>
          <View className={styles.quickItem} onClick={() => handleQuickEntry('studyroom')}>
            <View className={styles.quickIcon} style={{ background: '#E8F0FF' }}>📚</View>
            <Text className={styles.quickLabel}>自习室</Text>
          </View>
          <View className={styles.quickItem} onClick={() => handleQuickEntry('checkin')}>
            <View className={styles.quickIcon} style={{ background: '#E8FFEE' }}>✅</View>
            <Text className={styles.quickLabel}>去打卡</Text>
          </View>
          <View className={styles.quickItem} onClick={() => handleQuickEntry('rank')}>
            <View className={styles.quickIcon} style={{ background: '#FFF3E6' }}>🏆</View>
            <Text className={styles.quickLabel}>排行榜</Text>
          </View>
        </View>

        {/* 筛选条件 */}
        <View className={styles.filterCard}>
          <View className={styles.cardHeader}>
            <Text className={styles.cardTitle}>匹配筛选</Text>
            <Text className={styles.moreBtn}>
              更多筛选 ›
            </Text>
          </View>

          <View className={styles.filterGroup}>
            <Text className={styles.groupLabel}>备考阶段</Text>
            <View className={styles.tagsWrap}>
              {stages.map((stage) => (
                <FilterTag
                  key={stage}
                  label={getStageLabel(stage)}
                  active={filterParams.studyStage === stage}
                  onClick={() => handleStageClick(stage)}
                />
              ))}
            </View>
          </View>

          <View className={styles.filterGroup}>
            <Text className={styles.groupLabel}>每日学习时长</Text>
            <View className={styles.tagsWrap}>
              {hoursOptions.map((hours) => (
                <FilterTag
                  key={hours}
                  label={getHoursLabel(hours)}
                  active={filterParams.dailyHours === hours}
                  onClick={() => handleHoursClick(hours)}
                />
              ))}
            </View>
          </View>

          <View className={styles.filterGroup}>
            <Text className={styles.groupLabel}>作息偏好</Text>
            <View className={styles.tagsWrap}>
              {schedules.map((schedule) => (
                <FilterTag
                  key={schedule}
                  label={getScheduleLabel(schedule)}
                  active={filterParams.scheduleType === schedule}
                  onClick={() => handleScheduleClick(schedule)}
                />
              ))}
            </View>
          </View>
        </View>

        {/* 推荐搭子 */}
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>为你推荐</Text>
          <Text className={styles.seeMore} onClick={handleSeeAll}>查看全部 ›</Text>
        </View>

        <ScrollView
          className={styles.recommendScroll}
          scrollX
          enhanced
          showScrollbar={false}
        >
          {recommendBuddies.map((buddy) => (
            <BuddyCard key={buddy.id} buddy={buddy} />
          ))}
        </ScrollView>
      </View>

      {/* 底部操作按钮 */}
      <View className={styles.bottomAction}>
        <Button className={styles.matchBtn} onClick={handleStartMatch}>
          开始匹配搭子
        </Button>
      </View>
    </View>
  );
};

export default HomePage;
