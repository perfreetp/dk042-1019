import React from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import type { Buddy } from '@/types';
import { getOnlineStatusColor, getStageLabel } from '@/utils';
import styles from './index.module.scss';
import classnames from 'classnames';

interface BuddyCardProps {
  buddy: Buddy;
  onApply?: (buddy: Buddy) => void;
}

const BuddyCard: React.FC<BuddyCardProps> = ({ buddy, onApply }) => {
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
        title: '已发送申请',
        icon: 'success'
      });
    }
  };

  return (
    <View className={styles.buddyCard} onClick={handleCardClick}>
      <View className={styles.cardHeader}>
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
        <View className={styles.userInfo}>
          <Text className={styles.nickname}>
            {buddy.isAnonymous ? '匿名用户' : buddy.nickname}
          </Text>
          <Text className={styles.school}>{buddy.targetSchool}</Text>
        </View>
        <Text className={styles.matchRate}>{buddy.matchRate}%</Text>
      </View>

      <View className={styles.tags}>
        {buddy.tags.slice(0, 3).map((tag, index) => (
          <Text key={index} className={styles.tag}>{tag}</Text>
        ))}
      </View>

      <Text className={styles.plan}>{buddy.plan}</Text>

      <View className={styles.footer}>
        <Text className={styles.location}>{buddy.location} · {getStageLabel(buddy.studyStage)}</Text>
        <Button className={styles.applyBtn} onClick={handleApply}>
          申请
        </Button>
      </View>
    </View>
  );
};

export default BuddyCard;
