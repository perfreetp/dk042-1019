import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Button
} from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh, useReachBottom } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import BuddyListItem from '@/components/BuddyListItem';
import { buddyList } from '@/data/buddies';
import { useAppStore } from '@/store/useAppStore';
import {
  getStageLabel,
  getHoursLabel,
  getScheduleLabel
} from '@/utils';
import type { Buddy } from '@/types';

const MatchPage: React.FC = () => {
  const { filterParams, setFilterParams, clearFilterParams } = useAppStore();
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [sortType, setSortType] = useState<'match' | 'online' | 'new'>('match');
  const [refreshing, setRefreshing] = useState(false);
  const [list, setList] = useState<Buddy[]>(buddyList);

  const filters = [
    { key: 'all', label: '全部' },
    { key: 'preliminary', label: '预备' },
    { key: 'foundation', label: '基础' },
    { key: 'strengthen', label: '强化' },
    { key: 'sprint', label: '冲刺' }
  ];

  const hasGlobalFilter = useMemo(() => {
    return Object.keys(filterParams).some(
      (k) => filterParams[k as keyof typeof filterParams] !== undefined
        && filterParams[k as keyof typeof filterParams] !== ''
    );
  }, [filterParams]);

  const activeFilterTags = useMemo(() => {
    const tags: { key: string; label: string }[] = [];
    if (filterParams.targetSchool) {
      tags.push({ key: 'targetSchool', label: `🏫 ${filterParams.targetSchool}` });
    }
    if (filterParams.targetMajor) {
      tags.push({ key: 'targetMajor', label: `📖 ${filterParams.targetMajor}` });
    }
    if (filterParams.studyStage) {
      tags.push({ key: 'studyStage', label: `📚 ${getStageLabel(filterParams.studyStage)}` });
    }
    if (filterParams.dailyHours) {
      tags.push({ key: 'dailyHours', label: `⏰ ${getHoursLabel(filterParams.dailyHours)}` });
    }
    if (filterParams.scheduleType) {
      tags.push({ key: 'scheduleType', label: `🌙 ${getScheduleLabel(filterParams.scheduleType)}` });
    }
    return tags;
  }, [filterParams]);

  const filteredList = useMemo(() => {
    let result = [...list];

    if (filterParams.targetSchool) {
      result = result.filter((b) =>
        b.targetSchool.includes(filterParams.targetSchool!)
      );
    }
    if (filterParams.targetMajor) {
      result = result.filter((b) =>
        b.targetMajor.includes(filterParams.targetMajor!)
      );
    }
    if (filterParams.studyStage) {
      result = result.filter((b) => b.studyStage === filterParams.studyStage);
    }
    if (filterParams.dailyHours) {
      result = result.filter((b) => b.dailyHours === filterParams.dailyHours);
    }
    if (filterParams.scheduleType) {
      result = result.filter((b) => b.scheduleType === filterParams.scheduleType);
    }

    if (activeFilter !== 'all') {
      result = result.filter((item) => item.studyStage === activeFilter);
    }

    if (sortType === 'match') {
      result.sort((a, b) => b.matchRate - a.matchRate);
    } else if (sortType === 'online') {
      const onlineFirst = (status: string) =>
        status === 'online' ? 0 : status === 'busy' ? 1 : 2;
      result.sort((a, b) => onlineFirst(a.onlineStatus) - onlineFirst(b.onlineStatus));
    }

    return result;
  }, [list, activeFilter, sortType, filterParams]);

  const handleFilterClick = useCallback((key: string) => {
    setActiveFilter(key);
  }, []);

  const handleRemoveTag = useCallback((key: string) => {
    setFilterParams({ [key]: undefined } as any);
  }, [setFilterParams]);

  const handleClearAllFilter = useCallback(() => {
    clearFilterParams();
    setActiveFilter('all');
  }, [clearFilterParams]);

  const handleApply = useCallback((buddy: Buddy) => {
    Taro.navigateTo({
      url: `/pages/buddy-detail/index?id=${buddy.id}&from=match`
    });
  }, []);

  const handleGoHome = useCallback(() => {
    Taro.switchTab({ url: '/pages/home/index' });
  }, []);

  usePullDownRefresh(() => {
    setRefreshing(true);
    setTimeout(() => {
      setList([...buddyList].sort(() => Math.random() - 0.5));
      setRefreshing(false);
      Taro.stopPullDownRefresh();
    }, 1000);
  });

  useReachBottom(() => {
    console.log('[Match] 触底加载更多');
  });

  useDidShow(() => {
    console.log('[Match] 页面显示, 筛选条件:', filterParams);
  });

  return (
    <View className={styles.matchPage}>
      {/* 筛选栏 */}
      <ScrollView className={styles.filterBar} scrollX enhanced showScrollbar={false}>
        {filters.map((filter) => (
          <View
            key={filter.key}
            className={classnames(styles.filterItem, activeFilter === filter.key && styles.active)}
            onClick={() => handleFilterClick(filter.key)}
          >
            <Text>{filter.label}</Text>
          </View>
        ))}
      </ScrollView>

      {/* 激活的全局筛选条件展示 */}
      {hasGlobalFilter && (
        <View className={styles.activeFilterBar}>
          <View className={styles.activeFilterTitle}>
            <Text className={styles.activeFilterLabel}>
              🎯 已设置 {activeFilterTags.length} 个筛选条件
            </Text>
            <Text className={styles.clearBtn} onClick={handleClearAllFilter}>
              清空全部
            </Text>
          </View>
          <View className={styles.activeFilterTags}>
            {activeFilterTags.map((tag) => (
              <View
                key={tag.key}
                className={styles.activeFilterTag}
                onClick={() => handleRemoveTag(tag.key)}
              >
                <Text>{tag.label}</Text>
                <Text className={styles.tagClose}>×</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 列表区 */}
      <View className={styles.listContainer}>
        {/* 排序栏 */}
        <View className={styles.sortBar}>
          <Text className={styles.sortLeft}>
            共 <Text className={styles.sortNum}>{filteredList.length}</Text> 位搭子
            {hasGlobalFilter && (
              <Text style={{ marginLeft: 8, color: '#FF7D00' }}>(筛选后)</Text>
            )}
          </Text>
          <View className={styles.sortRight}>
            <Text
              className={classnames(sortType === 'match' && styles.active)}
              onClick={() => setSortType('match')}
            >
              匹配度
            </Text>
            <Text
              className={classnames(sortType === 'online' && styles.active)}
              onClick={() => setSortType('online')}
            >
              在线优先
            </Text>
          </View>
        </View>

        {/* 搭子列表 */}
        {filteredList.length > 0 ? (
          filteredList.map((buddy) => (
            <BuddyListItem
              key={buddy.id}
              buddy={buddy}
              onApply={handleApply}
            />
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>🔍</Text>
            <Text className={styles.emptyText}>
              {hasGlobalFilter ? '当前筛选条件下暂无搭子' : '暂无符合条件的搭子'}
            </Text>
            <Button
              className={styles.refreshBtn}
              onClick={hasGlobalFilter ? handleClearAllFilter : handleGoHome}
            >
              {hasGlobalFilter ? '清空筛选条件' : '去设置筛选条件'}
            </Button>
          </View>
        )}

        {refreshing && (
          <View className={styles.loading}>刷新中...</View>
        )}
      </View>
    </View>
  );
};

export default MatchPage;
