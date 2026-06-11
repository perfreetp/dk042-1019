import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import type { Conversation } from '@/types';
import styles from './index.module.scss';

interface MessageItemProps {
  conversation: Conversation;
  onClick?: (conversation: Conversation) => void;
}

const MessageItem: React.FC<MessageItemProps> = ({ conversation, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(conversation);
    } else {
      Taro.navigateTo({
        url: `/pages/chat/index?id=${conversation.id}`
      });
    }
  };

  return (
    <View className={styles.messageItem} onClick={handleClick}>
      <View className={styles.avatarWrap}>
        <Image
          className={styles.avatar}
          src={conversation.buddyAvatar}
          mode="aspectFill"
        />
        {conversation.unreadCount > 0 && (
          <Text className={styles.unreadBadge}>
            {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
          </Text>
        )}
      </View>

      <View className={styles.messageContent}>
        <View className={styles.messageHeader}>
          <Text className={styles.nickname}>{conversation.buddyName}</Text>
          <Text className={styles.time}>{conversation.lastTime}</Text>
        </View>
        <Text className={styles.lastMessage}>{conversation.lastMessage}</Text>
      </View>
    </View>
  );
};

export default MessageItem;
