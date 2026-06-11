import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  Button,
  Input,
  Textarea,
  useRouter
} from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { buddyList } from '@/data/buddies';
import { useAppStore } from '@/store/useAppStore';
import {
  getStageLabel,
  getHoursLabel,
  getScheduleLabel,
  getSuperviseLabel,
  getOnlineStatusText,
  getOnlineStatusColor
} from '@/utils';
import type { Buddy } from '@/types';

const BuddyDetailPage: React.FC = () => {
  const router = useRouter();
  const buddyId = router.params.id || '1';
  const { sendBuddyRequest, addStudyRoom, acceptBuddyRequest } = useAppStore();

  const buddy: Buddy | undefined = useMemo(
    () => buddyList.find((b) => b.id === buddyId) || buddyList[0],
    [buddyId]
  );

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [checkinCycle, setCheckinCycle] = useState<number>(7);
  const [commonGoal, setCommonGoal] = useState('');
  const [applyMessage, setApplyMessage] = useState('');
  const [hasSent, setHasSent] = useState(false);

  const cycleOptions = [
    { value: 3, label: '3天' },
    { value: 7, label: '7天' },
    { value: 14, label: '14天' },
    { value: 30, label: '30天' },
    { value: 60, label: '60天' },
    { value: 100, label: '全程' }
  ];

  const goalPresets = [
    '共同完成强化阶段',
    '每天打卡8小时',
    '刷完近10年真题',
    '英语单词背完5500',
    '数学基础题全过一遍'
  ];

  const canSubmit = checkinCycle > 0 && commonGoal.trim().length > 0;

  const handleOpenModal = useCallback(() => {
    if (hasSent) {
      Taro.showToast({ title: '申请已发送，请等待回复', icon: 'none' });
      return;
    }
    setShowApplyModal(true);
  }, [hasSent]);

  const handleCloseModal = useCallback(() => {
    setShowApplyModal(false);
  }, []);

  const handleCycleSelect = useCallback((value: number) => {
    setCheckinCycle(value);
  }, []);

  const handleGoalPresetClick = useCallback((preset: string) => {
    setCommonGoal(preset);
  }, []);

  const handleSubmitApply = useCallback(() => {
    if (!canSubmit) {
      Taro.showToast({ title: '请填写打卡周期和共同目标', icon: 'none' });
      return;
    }

    const request = sendBuddyRequest(buddyId, {
      checkinCycle,
      commonGoal: commonGoal.trim(),
      message: applyMessage.trim() || undefined
    });

    if (request) {
      setHasSent(true);
      setShowApplyModal(false);
      Taro.showToast({ title: '申请已发送', icon: 'success' });
      console.log('[BuddyDetail] 结伴申请已发送:', request);
    }
  }, [canSubmit, checkinCycle, commonGoal, applyMessage, buddyId, sendBuddyRequest]);

  const handleChat = useCallback(() => {
    Taro.navigateTo({
      url: `/pages/chat/index?id=${buddyId}`
    });
  }, [buddyId]);

  const handleAcceptSimulate = useCallback(() => {
    if (!hasSent) return;
    acceptBuddyRequest(`req_test_${buddyId}`);
    addStudyRoom({
      name: `${buddy?.nickname || '搭子'}的自习室`,
      members: ['me', buddyId],
      commonGoal,
      checkinCycle
    });
    Taro.showToast({ title: '对方已接受！自习室已创建', icon: 'success' });
  }, [hasSent, buddyId, buddy?.nickname, commonGoal, checkinCycle, acceptBuddyRequest, addStudyRoom]);

  useDidShow(() => {
    console.log('[BuddyDetail] 页面显示, buddyId:', buddyId);
  });

  if (!buddy) {
    return (
      <View className={styles.detailPage}>
        <View style={{ padding: 100, textAlign: 'center', color: '#86909C' }}>
          搭子信息不存在
        </View>
      </View>
    );
  }

  return (
    <View className={styles.detailPage}>
      {/* 顶部用户信息 */}
      <View className={styles.header}>
        <View className={styles.userCard}>
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
            <View className={styles.nicknameRow}>
              <Text className={styles.nickname}>
                {buddy.isAnonymous ? '匿名用户' : buddy.nickname}
              </Text>
              {buddy.isAnonymous && (
                <Text className={styles.anonymousBadge}>🎭 匿名</Text>
              )}
            </View>

            <Text className={styles.target}>
              {buddy.targetSchool} · {buddy.targetMajor}
            </Text>

            <Text className={styles.matchBadge}>
              💗 匹配度 {buddy.matchRate}% · {getOnlineStatusText(buddy.onlineStatus)}
            </Text>
          </View>
        </View>
      </View>

      {/* 内容区 */}
      <View className={styles.content}>
        {/* 匹配信息卡片 */}
        <View className={styles.matchInfoCard}>
          <Text className={styles.matchInfoTitle}>
            🎯 你们的匹配分析
          </Text>
          <View className={styles.matchDetailItem}>
            <Text className={styles.matchLabel}>目标院校</Text>
            <Text className={styles.matchValue}>{buddy.targetSchool}</Text>
          </View>
          <View className={styles.matchDetailItem}>
            <Text className={styles.matchLabel}>目标专业</Text>
            <Text className={styles.matchValue}>{buddy.targetMajor}</Text>
          </View>
          <View className={styles.matchDetailItem}>
            <Text className={styles.matchLabel}>备考阶段</Text>
            <Text className={styles.matchValue}>{getStageLabel(buddy.studyStage)}</Text>
          </View>
          <View className={styles.matchDetailItem}>
            <Text className={styles.matchLabel}>所在地</Text>
            <Text className={styles.matchValue}>📍 {buddy.location}</Text>
          </View>
        </View>

        {/* 基本信息卡片 */}
        <View className={styles.infoCard}>
          <Text className={styles.cardTitle}>
            <Text className={styles.titleIcon}>📋</Text>
            备考信息
          </Text>
          <View className={styles.infoGrid}>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>备考阶段</Text>
              <Text className={styles.infoValue}>{getStageLabel(buddy.studyStage)}</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>每日时长</Text>
              <Text className={styles.infoValue}>{getHoursLabel(buddy.dailyHours)}</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>作息偏好</Text>
              <Text className={styles.infoValue}>{getScheduleLabel(buddy.scheduleType)}</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>监督方式</Text>
              <Text className={styles.infoValue}>{getSuperviseLabel(buddy.superviseType)}</Text>
            </View>
          </View>
        </View>

        {/* 备考计划 */}
        <View className={styles.infoCard}>
          <Text className={styles.cardTitle}>
            <Text className={styles.titleIcon}>�</Text>
            备考计划
          </Text>
          <Text className={styles.planContent}>{buddy.plan}</Text>
        </View>

        {/* 匿名标签 */}
        <View className={styles.infoCard}>
          <Text className={styles.cardTitle}>
            <Text className={styles.titleIcon}>🏷️</Text>
            个人标签
          </Text>
          <View className={styles.tagsWrap}>
            {buddy.tags.map((tag, index) => (
              <Text key={index} className={styles.tag}>{tag}</Text>
            ))}
          </View>
        </View>
      </View>

      {/* 底部操作栏 */}
      <View className={styles.bottomAction}>
        <Button className={styles.chatBtn} onClick={handleChat}>
          💬 私聊
        </Button>
        <Button
          className={classnames(
            styles.applyBtn,
            hasSent && styles.applyBtnDisabled
          )}
          onClick={handleOpenModal}
        >
          {hasSent ? '✅ 申请已发送' : '🤝 发起结伴'}
        </Button>
      </View>

      {/* 申请测试按钮（仅演示） */}
      {hasSent && (
        <View style={{
          position: 'fixed',
          bottom: 200,
          right: 32,
          zIndex: 50
        }}>
          <Button
            style={{
              height: 56,
              padding: '0 16px',
              background: '#00B42A',
              color: '#fff',
              fontSize: 12,
              borderRadius: 28
            }}
            onClick={handleAcceptSimulate}
          >
            模拟对方接受
          </Button>
        </View>
      )}

      {/* 结伴申请弹窗 */}
      {showApplyModal && (
        <View className={styles.modalMask} onClick={handleCloseModal}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>发起结伴申请</Text>
            <Text className={styles.modalSubtitle}>
              填写以下信息，帮助 {buddy.isAnonymous ? 'TA' : buddy.nickname} 了解你的学习计划
            </Text>

            {/* 打卡周期 */}
            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>
                <Text className={styles.formLabelRequired}>*</Text>
                约定打卡周期
              </Text>
              <View className={styles.cycleOptions}>
                {cycleOptions.map((opt) => (
                  <View
                    key={opt.value}
                    className={classnames(
                      styles.cycleOption,
                      checkinCycle === opt.value && styles.active
                    )}
                    onClick={() => handleCycleSelect(opt.value)}
                  >
                    <Text>{opt.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* 共同目标 */}
            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>
                <Text className={styles.formLabelRequired}>*</Text>
                设定共同目标
              </Text>
              <View className={styles.goalPresets}>
                {goalPresets.map((preset, i) => (
                  <View
                    key={i}
                    className={styles.goalPreset}
                    onClick={() => handleGoalPresetClick(preset)}
                  >
                    <Text>{preset}</Text>
                  </View>
                ))}
              </View>
              <Textarea
                className={styles.formTextarea}
                placeholder="请输入你们的共同学习目标（可使用上方快捷选项）"
                placeholderClass="input-placeholder"
                value={commonGoal}
                onInput={(e: any) => setCommonGoal(e.detail.value)}
                maxlength={100}
              />
            </View>

            {/* 附言 */}
            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>
                给TA写一句话（选填）
              </Text>
              <Textarea
                className={styles.formTextarea}
                placeholder="可以说说你的学习习惯，或者打个招呼~"
                placeholderClass="input-placeholder"
                value={applyMessage}
                onInput={(e: any) => setApplyMessage(e.detail.value)}
                maxlength={200}
              />
            </View>

            {/* 操作按钮 */}
            <View className={styles.modalActions}>
              <Button className={styles.cancelBtn} onClick={handleCloseModal}>
                取消
              </Button>
              <Button
                className={classnames(
                  styles.confirmBtn,
                  !canSubmit && styles.confirmBtnDisabled
                )}
                onClick={handleSubmitApply}
              >
                发送申请
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default BuddyDetailPage;
