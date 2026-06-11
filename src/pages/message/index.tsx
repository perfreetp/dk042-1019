import React, { useState, useMemo } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import MessageItem from '@/components/MessageItem';
import { conversations, systemMessages } from '@/data/messages';
import type { Conversation } from '@/types';

const MessagePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'system'>('chat');

  const totalUnread = useMemo(() => {
    return conversations.reduce((sum, c) => sum + c.unreadCount, 0);
  }, []);

  const handleChatClick = (conversation: Conversation) => {
    Taro.navigateTo({
      url: `/pages/chat/index?id=${conversation.id}`
    });
  };

  const handleSystemClick = (msg: any) => {
    if (msg.type === 'request') {
      Taro.showModal({
        title: '结伴申请',
        content: '是否接受该搭子的结伴申请？',
        confirmText: '接受',
        cancelText: '拒绝',
        confirmColor: '#FF7D00',
        success: (res) => {
          if (res.confirm) {
            Taro.showToast({ title: '已同意', icon: 'success' });
          } else {
            Taro.showToast({ title: '已拒绝', icon: 'none' });
          }
        }
      });
    } else {
      Taro.showToast({ title: '查看详情', icon: 'none' });
    }
  };

  const getSystemIcon = (type: string) => {
    switch (type) {
      case 'request':
        return { icon: '🤝', bg: '#E8F0FF' };
      case 'reminder':
        return { icon: '⏰', bg: '#FFF3E6' };
      case 'match':
        return { icon: '✨', bg: '#E8FFEE' };
      default:
        return { icon: '📢', bg: '#F5F6F7' };
    }
  };

  useDidShow(() => {
    console.log('[Message] 页面显示');
  });

  return (
    <View className={styles.messagePage}>
      {/* Tab 切换 */}
      <View className={styles.tabBar}>
        <View
          className={classnames(styles.tabItem, activeTab === 'chat' && styles.active)}
          onClick={() => setActiveTab('chat')}
        >
          <Text>消息</Text>
          {totalUnread > 0 && (
            <Text className={styles.tabBadge}>
              {totalUnread > 99 ? '99+' : totalUnread}
            </Text>
          )}
        </View>
        <View
          className={classnames(styles.tabItem, activeTab === 'system' && styles.active)}
          onClick={() => setActiveTab('system')}
        >
          <Text>通知</Text>
          <Text className={styles.systemBadge}></Text>
        </View>
      </View>

      {activeTab === 'chat' ? (
        <ScrollView scrollY enhanced>
          {conversations.length > 0 ? (
            <View className={styles.messageList}>
              {conversations.map((item, index) => (
                <View key={item.id}>
                  <MessageItem
                    conversation={item}
                    onClick={handleChatClick}
                  />
                  {index < conversations.length - 1 && (
                    <View className={styles.listDivider} />
                  )}
                </View>
              ))}
            </View>
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>💬</Text>
              <Text className={styles.emptyText}>暂无消息</Text>
            </View>
          )}
        </ScrollView>
      ) : (
        <ScrollView scrollY enhanced>
          <View className={styles.systemSection}>
            {systemMessages.map((msg) => {
              const iconInfo = getSystemIcon(msg.type);
              return (
                <View
                  key={msg.id}
                  className={styles.systemItem}
                  onClick={() => handleSystemClick(msg)}
                >
                  <View
                    className={styles.systemIcon}
                    style={{ background: iconInfo.bg }}
                  >
                    {iconInfo.icon}
                  </View>
                  <View className={styles.systemContent}>
                    <Text className={styles.systemTitle}>{msg.title}</Text>
                    <Text className={styles.systemDesc}>{msg.content}</Text>
                    {msg.type === 'request' && (
                      <View className={styles.actionBtns}>
                        <Button
                          className={`${styles.actionBtn} ${styles.accept}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            Taro.showToast({ title: '已同意', icon: 'success' });
                          }}
                        >
                          接受
                        </Button>
                        <Button
                          className={`${styles.actionBtn} ${styles.reject}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            Taro.showToast({ title: '已拒绝', icon: 'none' });
                          }}
                        >
                          拒绝
                        </Button>
                      </View>
                    )}
                  </View>
                  <Text className={styles.systemTime}>{msg.time}</Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default MessagePage;
