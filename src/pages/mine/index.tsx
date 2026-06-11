import React, { useState } from 'react';
import { View, Text, Image, Button, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAppStore } from '@/store/useAppStore';
import { getStageLabel, getHoursLabel } from '@/utils';

const MinePage: React.FC = () => {
  const { userProfile } = useAppStore();
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleEditProfile = () => {
    Taro.navigateTo({
      url: '/pages/profile-edit/index'
    });
  };

  const handlePrivacy = () => {
    Taro.showToast({ title: '隐私设置', icon: 'none' });
  };

  const handleBlacklist = () => {
    Taro.showToast({ title: '黑名单管理', icon: 'none' });
  };

  const handleRating = () => {
    Taro.showToast({ title: '匹配评价', icon: 'none' });
  };

  const toggleAnonymous = () => {
    setIsAnonymous(!isAnonymous);
    Taro.showToast({
      title: !isAnonymous ? '已开启匿名' : '已关闭匿名',
      icon: 'none'
    });
  };

  const handleFeedback = () => {
    Taro.showToast({ title: '意见反馈', icon: 'none' });
  };

  const handleAbout = () => {
    Taro.showToast({ title: '关于我们', icon: 'none' });
  };

  const handleClear = () => {
    Taro.showModal({
      title: '清除缓存',
      content: '确定要清除缓存吗？',
      confirmColor: '#FF7D00',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '清除成功', icon: 'success' });
        }
      }
    });
  };

  useDidShow(() => {
    console.log('[Mine] 页面显示');
  });

  const menuGroups = [
    {
      title: '学习管理',
      items: [
        {
          icon: '🔒',
          iconBg: '#E8F0FF',
          text: '隐私设置',
          onClick: handlePrivacy
        },
        {
          icon: '🚫',
          iconBg: '#FFECE8',
          text: '黑名单',
          onClick: handleBlacklist
        },
        {
          icon: '⭐',
          iconBg: '#FFF3E6',
          text: '匹配评价',
          badge: '3',
          onClick: handleRating
        }
      ]
    },
    {
      title: '其他',
      items: [
        {
          icon: '💬',
          iconBg: '#E8FFEE',
          text: '意见反馈',
          onClick: handleFeedback
        },
        {
          icon: 'ℹ️',
          iconBg: '#E8F0FF',
          text: '关于我们',
          value: 'v1.0.0',
          onClick: handleAbout
        },
        {
          icon: '🗑️',
          iconBg: '#F5F6F7',
          text: '清除缓存',
          value: '12.5MB',
          onClick: handleClear
        }
      ]
    }
  ];

  return (
    <ScrollView className={styles.minePage} scrollY enhanced>
      {/* 顶部用户信息 */}
      <View className={styles.header}>
        <View className={styles.userCard}>
          <Image
            className={styles.avatar}
            src={userProfile?.avatar || 'https://picsum.photos/id/64/200/200'}
            mode="aspectFill"
          />
          <View className={styles.userInfo}>
            <Text className={styles.nickname}>
              {userProfile?.nickname || '考研人'}
            </Text>
            <Text className={styles.target}>
              {userProfile?.targetSchool} · {userProfile?.targetMajor}
            </Text>
            <View className={styles.tags}>
              <Text className={styles.tag}>{getStageLabel(userProfile?.studyStage || 'strengthen')}</Text>
              <Text className={styles.tag}>{getHoursLabel(userProfile?.dailyHours || '8to10')}</Text>
            </View>
          </View>
          <Button className={styles.editBtn} onClick={handleEditProfile}>
            编辑资料
          </Button>
        </View>
      </View>

      {/* 数据统计卡 */}
      <View className={styles.statsCard}>
        <View className={styles.statItem}>
          <Text className={styles.statNum}>128h</Text>
          <Text className={styles.statLabel}>累计学习</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statNum}>45天</Text>
          <Text className={styles.statLabel}>打卡天数</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statNum}>3</Text>
          <Text className={styles.statLabel}>我的搭子</Text>
        </View>
      </View>

      {/* 匿名开关 */}
      <View className={styles.section}>
        <View className={styles.menuList}>
          <View className={styles.menuItem}>
            <View
              className={styles.menuIcon}
              style={{ background: '#FFF3E6' }}
            >
              👤
            </View>
            <Text className={styles.menuText}>匿名模式</Text>
            <View className={styles.anonymousToggle} onClick={toggleAnonymous}>
              <View
                className={classnames(styles.toggleSwitch, isAnonymous && styles.active)}
              />
            </View>
          </View>
        </View>
      </View>

      {/* 菜单组 */}
      {menuGroups.map((group, gIndex) => (
        <View key={gIndex} className={styles.section}>
          <Text className={styles.sectionTitle}>{group.title}</Text>
          <View className={styles.menuList}>
            {group.items.map((item, iIndex) => (
              <View
                key={iIndex}
                className={styles.menuItem}
                onClick={item.onClick}
              >
                <View
                  className={styles.menuIcon}
                  style={{ background: item.iconBg }}
                >
                  {item.icon}
                </View>
                <Text className={styles.menuText}>{item.text}</Text>
                {item.badge && (
                  <Text className={styles.badge}>{item.badge}</Text>
                )}
                {item.value && (
                  <Text className={styles.menuValue}>{item.value}</Text>
                )}
                <Text className={styles.menuArrow}>›</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

export default MinePage;
