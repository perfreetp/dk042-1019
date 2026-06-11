import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';

const ChatPage: React.FC = () => {
  const handleBack = () => {
    Taro.navigateBack();
  };

  return (
    <View className={styles.placeholderPage}>
      <Text className={styles.icon}>💬</Text>
      <Text className={styles.title}>聊天</Text>
      <Text className={styles.desc}>
        功能正在开发中...
        {'\n'}
        和搭子交流学习心得
      </Text>
      <Button className={styles.backBtn} onClick={handleBack}>
        返回
      </Button>
    </View>
  );
};

export default ChatPage;
