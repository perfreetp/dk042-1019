import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';

const BuddyDetailPage: React.FC = () => {
  const handleBack = () => {
    Taro.navigateBack();
  };

  return (
    <View className={styles.placeholderPage}>
      <Text className={styles.icon}>👤</Text>
      <Text className={styles.title}>搭子详情</Text>
      <Text className={styles.desc}>
        功能正在开发中...
        {'\n'}
        敬请期待搭子详细信息展示
      </Text>
      <Button className={styles.backBtn} onClick={handleBack}>
        返回
      </Button>
    </View>
  );
};

export default BuddyDetailPage;
