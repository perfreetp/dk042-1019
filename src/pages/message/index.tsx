import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, Button, ScrollView, Image } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import MessageItem from '@/components/MessageItem';
import { useAppStore } from '@/store/useAppStore';
import { buddyList } from '@/data/buddies';
import type { Conversation, BuddyRequest } from '@/types';

type ExpandedState = Record<string, boolean>;

const MessagePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'system'>('chat');
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const {
    buddyRequests,
    conversations,
    acceptBuddyRequest,
    rejectBuddyRequest,
    chatMessages
  } = useAppStore();

  const totalUnread = useMemo(() => {
    return conversations.reduce((sum, c) => sum + c.unreadCount, 0);
  }, [conversations]);

  const pendingRequests = useMemo(
    () => buddyRequests.filter(r => r.status === 'pending'),
    [buddyRequests]
  );

  const handleChatClick = useCallback((conversation: Conversation) => {
    Taro.navigateTo({
      url: `/pages/chat/index?id=${conversation.id}`
    });
  }, []);

  const formatCreateTime = useCallback((isoStr: string): string => {
    const date = new Date(isoStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}小时前`;
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }, []);

  const getBuddyInfo = useCallback((userId: string) => {
    const isFromMe = userId === 'me';
    const otherUserId = isFromMe ? '' : userId;
    const info = buddyList.find(b => b.id === (isFromMe ? '' : userId));
    return {
      isFromMe,
      nickname: info
        ? (info.isAnonymous ? '匿名搭子' : info.nickname)
        : (isFromMe ? '我' : '搭子'),
      avatar: info?.avatar || 'https://picsum.photos/id/1025/200/200'
    };
  }, []);

  const toggleExpand = useCallback((requestId: string) => {
    setExpanded(prev => ({
      ...prev,
      [requestId]: !prev[requestId]
    }));
  }, []);

  const handleAccept = useCallback((requestId: string, e: any) => {
    e.stopPropagation();
    acceptBuddyRequest(requestId);
    Taro.showToast({ title: '已接受，自习室已创建', icon: 'success' });
    setTimeout(() => {
      Taro.navigateTo({ url: '/pages/study-room/index' });
    }, 1000);
  }, [acceptBuddyRequest]);

  const handleReject = useCallback((requestId: string, e: any) => {
    e.stopPropagation();
    rejectBuddyRequest(requestId);
    Taro.showToast({ title: '已拒绝', icon: 'none' });
  }, [rejectBuddyRequest]);

  const renderRequestCard = (req: BuddyRequest) => {
    const isFromMe = req.fromUserId === 'me';
    const otherUserId = isFromMe ? req.toUserId : req.fromUserId;
    const buddyInfo = getBuddyInfo(otherUserId);
    const isExpanded = expanded[req.id];

    return (
      <View
        key={req.id}
        className={styles.requestCard}
      >
        <View
          className={styles.requestHeader}
          onClick={() => toggleExpand(req.id)}
        >
          <Image
            className={styles.requestAvatar}
            src={buddyInfo.avatar}
            mode="aspectFill"
          />
          <View className={styles.requestInfo}>
            <View className={styles.requestTitleRow}>
              <Text className={styles.requestTitle}>
                {isFromMe ? '我' : buddyInfo.nickname} 发起了结伴申请
              </Text>
              <Text className={styles.requestTime}>
                {formatCreateTime(req.createdAt)}
              </Text>
            </View>
            <Text className={styles.requestSubtitle}>
              {isFromMe ? '等待对方回复' : '需要您处理'}
            </Text>
          </View>
          <View className={classnames(styles.arrowIcon, isExpanded && styles.arrowUp)}>
            <Text>▼</Text>
          </View>
        </View>

        {isExpanded && (
          <View className={styles.requestDetail}>
            <View className={styles.detailGrid}>
              {req.checkinCycle && (
                <View className={styles.detailItem}>
                  <Text className={styles.detailLabel}>打卡周期</Text>
                  <Text className={styles.detailValue}>
                    {req.checkinCycle >= 100 ? '全程' : `${req.checkinCycle} 天`}
                  </Text>
                </View>
              )}
              {req.commonGoal && (
                <View className={styles.detailItem}>
                  <Text className={styles.detailLabel}>共同目标</Text>
                  <Text className={styles.detailValue}>{req.commonGoal}</Text>
                </View>
              )}
              {(req.applyNote || req.message) && (
                <View className={styles.detailItem} style={{ width: '100%' }}>
                  <Text className={styles.detailLabel}>附言</Text>
                  <Text className={styles.detailValue}>
                    {req.applyNote || req.message}
                  </Text>
                </View>
              )}
            </View>

            {req.status === 'pending' && (
              <View className={styles.requestActions}>
                <Button
                  className={classnames(styles.reqActionBtn, styles.reqReject)}
                  onClick={(e) => handleReject(req.id, e)}
                >
                  拒绝
                </Button>
                <Button
                  className={classnames(styles.reqActionBtn, styles.reqAccept)}
                  onClick={(e) => handleAccept(req.id, e)}
                >
                  接受
                </Button>
              </View>
            )}

            {req.status === 'accepted' && (
              <View className={styles.requestStatusBar}>
                <Text className={styles.statusAccepted}>✅ 已接受 - 已创建自习室</Text>
              </View>
            )}

            {req.status === 'rejected' && (
              <View className={styles.requestStatusBar}>
                <Text className={styles.statusRejected}>❌ 已拒绝</Text>
              </View>
            )}
          </View>
        )}

        {!isExpanded && req.status === 'pending' && !isFromMe && (
          <View className={styles.requestActionsCollapsed}>
            <Button
              className={classnames(styles.reqActionBtn, styles.reqReject)}
              onClick={(e) => handleReject(req.id, e)}
            >
              拒绝
            </Button>
            <Button
              className={classnames(styles.reqActionBtn, styles.reqAccept)}
              onClick={(e) => handleAccept(req.id, e)}
            >
              接受
            </Button>
          </View>
        )}
      </View>
    );
  };

  useDidShow(() => {
    console.log('[Message] 页面显示, pendingRequests:', pendingRequests.length);
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
          {pendingRequests.length > 0 && (
            <Text className={styles.tabBadge}>
              {pendingRequests.length}
            </Text>
          )}
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
              <Text className={styles.emptySubtext}>
                去匹配页找到合适的搭子，开始聊天吧~
              </Text>
            </View>
          )}
        </ScrollView>
      ) : (
        <ScrollView scrollY enhanced>
          <View className={styles.systemSection}>
            {pendingRequests.length > 0 && (
              <View>
                <Text className={styles.sectionHeaderText}>结伴申请</Text>
                {pendingRequests.map(renderRequestCard)}
              </View>
            )}

            {buddyRequests.filter(r => r.status !== 'pending').length > 0 && (
              <View style={{ marginTop: 24 }}>
                <Text className={styles.sectionHeaderText}>历史记录</Text>
                {buddyRequests
                  .filter(r => r.status !== 'pending')
                  .map(renderRequestCard)}
              </View>
            )}

            {buddyRequests.length === 0 && (
              <View className={styles.emptyState}>
                <Text className={styles.emptyIcon}>🔔</Text>
                <Text className={styles.emptyText}>暂无通知</Text>
                <Text className={styles.emptySubtext}>
                  向搭子发起结伴申请，会在这里显示
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default MessagePage;
