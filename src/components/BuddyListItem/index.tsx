import React from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import type { Buddy } from '@/types';
import { getOnlineStatusColor, getStageLabel, getSuperviseLabel, getHoursLabel } from '@/utils';
import styles from './index.module.scss';

interface BuddyListItemProps {
  buddy: Buddy;
  onApply?: (buddy: Buddy) => void;
}

const BuddyListItem: React.FC<BuddyListItemProps> = ({ buddy, onApply }) => {
  const handleCardClick = () => {
    Taro.navigateTo({
      url: `/pages/buddy-detail/index?id=${buddy.id}`
    });
  };

  const handleApply = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onApply) {
      onApply(buddy);
    } else {
      Taro.showToast({
        title: '申请已发送',
        icon: 'success'
      });
    }
  };

  return (
    <View className={styles.buddyListItem} onClick={handleCardClick}>
      <View className={styles.cardTop}>
        <View className={styles.avatarWrap}>
          <Image
            className={styles.avatar}
            src={buddy.avatar}
            mode="aspectFill"
          />
          <View
            className={styles.onlineDot}
            style={{ backgroundColor: getOnlineStatusColor(buddy.onlineStatus) }}
          />
        </View>

        <View className={styles.infoWrap}>
          <View className={styles.infoHeader}>
            <Text className={styles.nickname}>
              {buddy.isAnonymous ? '匿名用户' : buddy.nickname}
              {buddy.isAnonymous && <Text className={styles.anonymousBadge}>匿名</Text>}
            </Text>
            <Text className={styles.matchBadge}>{buddy.matchRate}%匹配</Text>
          </View>

          <Text className={styles.schoolMajor}>
            {buddy.targetSchool} · {buddy.targetMajor}
          </Text>

          <View className={styles.metaInfo}>
            <Text className={styles.metaItem}>{getStageLabel(buddy.studyStage)}</Text>
            <Text className={styles.dot}></Text>
            <Text className={styles.metaItem}>{getHoursLabel(buddy.dailyHours)}</Text>
            <Text className={styles.dot}></Text>
            <Text className={styles.metaItem}>{getSuperviseLabel(buddy.superviseType)}</Text>
          </View>

          <View className={styles.tags}>
            {buddy.tags.slice(0, 4).map((tag, index) => (
              <Text key={index} className={styles.tag}>{tag}</Text>
            ))}
          </View>

          <Text className={styles.plan}>{buddy.plan}</Text>
        </View>
      </View>

      <View className={styles.cardFooter}>
        <Text className={styles.location}>📍 {buddy.location}</Text>
        <Button className={styles.applyBtn} onClick={handleApply}>
          发起结伴
        </Button>
      </View>
    </View>
  );
};

export default BuddyListItem;
