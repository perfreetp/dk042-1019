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
import { getStageLabel } from '@/utils';
import type { Buddy } from '@/types';

const MatchPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [sortType, setSortType] = useState<'match' | 'online' | 'new'>('match');
  const [refreshing, setRefreshing] = useState(false);
  const [list, setList] = useState<Buddy[]>(buddyList);

  const filters = [
    { key: 'all', label: '全部' },
    { key: 'foundation', label: '基础阶段' },
    { key: 'strengthen', label: '强化阶段' },
    { key: 'sprint', label: '冲刺阶段' }
  ];

  const filteredList = useMemo(() => {
    let result = [...list];

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
  }, [list, activeFilter, sortType]);

  const handleFilterClick = useCallback((key: string) => {
    setActiveFilter(key);
  }, []);

  const handleApply = useCallback((buddy: Buddy) => {
    Taro.showModal({
      title: '发起结伴申请',
      content: `确定向 ${buddy.isAnonymous ? '匿名用户' : buddy.nickname} 发起结伴申请吗？`,
      confirmText: '发送',
      confirmColor: '#FF7D00',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({
            title: '申请已发送',
            icon: 'success'
          });
        }
      }
    });
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
    console.log('[Match] 页面显示');
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

      {/* 列表区 */}
      <View className={styles.listContainer}>
        {/* 排序栏 */}
        <View className={styles.sortBar}>
          <Text className={styles.sortLeft}>
            共 <Text className={styles.sortNum}>{filteredList.length}</Text> 位搭子
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
            <Text className={styles.emptyText}>暂无符合条件的搭子</Text>
            <Button
              className={styles.refreshBtn}
              onClick={() => setActiveFilter('all')}
            >
              查看全部搭子
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
