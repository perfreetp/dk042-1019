import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Button,
  Input,
  useRouter
} from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAppStore } from '@/store/useAppStore';
import { buddyList } from '@/data/buddies';
import {
  getStageLabel,
  getHoursLabel,
  getScheduleLabel,
  getSuperviseLabel
} from '@/utils';
import type { ChatMessage, StudyStage, DailyHours, ScheduleType, SuperviseType } from '@/types';

type PlanAdjustPayload = {
  studyStage?: StudyStage;
  dailyHours?: DailyHours;
  scheduleType?: ScheduleType;
  superviseType?: SuperviseType;
  commonGoal?: string;
  checkinCycle?: number;
  reason?: string;
};

type ModalType = 'none' | 'link' | 'plan';

const stageOptions = [
  { value: 'early', label: '早期准备' },
  { value: 'foundation', label: '基础阶段' },
  { value: 'strengthen', label: '强化阶段' },
  { value: 'sprint', label: '冲刺阶段' }
];

const hoursOptions = [
  { value: 'h4', label: '4小时以内' },
  { value: 'h6', label: '4-6小时' },
  { value: 'h8', label: '6-8小时' },
  { value: 'h10', label: '8-10小时' },
  { value: 'h12', label: '10小时以上' }
];

const scheduleOptions = [
  { value: 'early_bird', label: '早起党 5-9点' },
  { value: 'daytime', label: '日间学 8-18点' },
  { value: 'night_owl', label: '夜猫子 18-24点' },
  { value: 'free', label: '随时灵活' }
];

const superviseOptions = [
  { value: 'daily_checkin', label: '每日打卡' },
  { value: 'mutual_supervise', label: '互相监督' },
  { value: 'weekly_report', label: '周报复盘' },
  { value: 'soft_reminder', label: '软性提醒' }
];

const linkPresets = [
  {
    icon: '📘',
    title: '李永乐高数强化讲义.pdf',
    meta: 'PDF · 4.8 MB',
    desc: '高数强化阶段必备，包含例题精讲和思维导图',
    url: 'https://example.com/docs/lee-yongle-advanced.pdf'
  },
  {
    icon: '📝',
    title: '英语一近10年真题',
    meta: 'ZIP · 18 MB',
    desc: '2015-2024英语一真题+答案解析，含作文范文',
    url: 'https://example.com/docs/english-i-10years.zip'
  },
  {
    icon: '📺',
    title: '徐涛政治冲刺串讲课程',
    meta: '链接 · 网盘资源',
    desc: '徐涛老师政治冲刺班，配套讲义和背诵手册',
    url: 'https://pan.example.com/s/abc123xyz'
  },
  {
    icon: '📋',
    title: '考研时间规划表.xlsx',
    meta: 'Excel · 86 KB',
    desc: '全程备考规划+周计划模板，可自行调整',
    url: 'https://example.com/docs/study-plan-template.xlsx'
  }
];

const ChatPage: React.FC = () => {
  const router = useRouter();
  const buddyId = router.params.id || '2';

  const { chatMessages, sendChatMessage, conversations } = useAppStore();

  const buddy = useMemo(
    () => buddyList.find((b) => b.id === buddyId) || buddyList[0],
    [buddyId]
  );

  const conversation = useMemo(() => {
    const conv = conversations.find((c) => c.id === buddyId);
    return conv;
  }, [conversations, buddyId]);

  const messages: ChatMessage[] = useMemo(() => {
    const msgs = chatMessages[buddyId] || [];
    if (msgs.length === 0) {
      return [
        {
          id: 'm_hello',
          conversationId: buddyId,
          senderId: buddyId,
          content: `嗨！我也在备考${buddy?.targetMajor || '研究生'}，很高兴认识你！`,
          type: 'text',
          timestamp: Date.now() - 3600000,
          read: true
        },
        {
          id: 'm_hello2',
          conversationId: buddyId,
          senderId: 'me',
          content: '你好呀~你现在复习进度怎么样啦？',
          type: 'text',
          timestamp: Date.now() - 3000000,
          read: true
        },
        {
          id: 'm_link1',
          conversationId: buddyId,
          senderId: buddyId,
          content: '这是我整理的一些资料，你可以看看',
          type: 'text',
          timestamp: Date.now() - 2400000,
          read: true,
          link: {
            url: 'https://example.com/docs/advanced-math-notes.pdf',
            title: '考研数学高分笔记（完整版）',
            icon: '📘',
            meta: 'PDF · 12.5 MB',
            desc: '包含线代、高数、概率三部分核心考点总结'
          }
        }
      ];
    }
    return msgs;
  }, [chatMessages, buddyId, buddy?.targetMajor]);

  const [inputText, setInputText] = useState('');
  const [modalType, setModalType] = useState<ModalType>('none');
  const [planPayload, setPlanPayload] = useState<PlanAdjustPayload>({});
  const [customLinkUrl, setCustomLinkUrl] = useState('');
  const [customLinkTitle, setCustomLinkTitle] = useState('');

  const listRef = useRef<any>(null);

  const canSend = inputText.trim().length > 0;

  const canSubmitPlan = useMemo(() => {
    const { studyStage, dailyHours, scheduleType, superviseType, commonGoal, checkinCycle } = planPayload;
    return !!(studyStage || dailyHours || scheduleType || superviseType || commonGoal || checkinCycle);
  }, [planPayload]);

  const formatTime = useCallback((timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday =
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate();
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    if (isToday) return `${h}:${m}`;
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday =
      date.getFullYear() === yesterday.getFullYear() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getDate() === yesterday.getDate();
    if (isYesterday) return `昨天 ${h}:${m}`;
    return `${date.getMonth() + 1}/${date.getDate()} ${h}:${m}`;
  }, []);

  const handleSendText = useCallback(() => {
    if (!canSend) return;

    // 检测是否为链接
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const hasUrl = urlRegex.test(inputText.trim());

    sendChatMessage(buddyId, {
      content: inputText.trim(),
      type: 'text',
      link: hasUrl ? {
        url: inputText.trim().match(urlRegex)?.[0] || inputText.trim(),
        title: '分享的链接',
        icon: '🔗',
        meta: '网页链接'
      } : undefined
    });

    setInputText('');

    // 模拟对方回复
    setTimeout(() => {
      sendChatMessage(buddyId, {
        senderId: buddyId,
        content: '收到~ 我看看资料先，有问题再聊！',
        type: 'text'
      });
    }, 1500);
  }, [canSend, inputText, buddyId, sendChatMessage]);

  const handleSendPresetLink = useCallback((preset: typeof linkPresets[0]) => {
    sendChatMessage(buddyId, {
      content: '这个资料给你参考一下~',
      type: 'text',
      link: {
        url: preset.url,
        title: preset.title,
        icon: preset.icon,
        meta: preset.meta,
        desc: preset.desc
      }
    });

    setModalType('none');
    Taro.showToast({ title: '已发送', icon: 'success' });

    // 模拟回复
    setTimeout(() => {
      sendChatMessage(buddyId, {
        senderId: buddyId,
        content: '太棒了！正好需要这个，感谢分享 🙏',
        type: 'text'
      });
    }, 2000);
  }, [buddyId, sendChatMessage]);

  const handleSendCustomLink = useCallback(() => {
    if (!customLinkUrl.trim()) {
      Taro.showToast({ title: '请输入链接地址', icon: 'none' });
      return;
    }
    sendChatMessage(buddyId, {
      content: '分享一个有用的链接',
      type: 'text',
      link: {
        url: customLinkUrl.trim(),
        title: customLinkTitle.trim() || customLinkUrl.trim(),
        icon: '🔗',
        meta: '自定义链接'
      }
    });

    setCustomLinkUrl('');
    setCustomLinkTitle('');
    setModalType('none');
    Taro.showToast({ title: '已发送', icon: 'success' });
  }, [buddyId, customLinkUrl, customLinkTitle, sendChatMessage]);

  const handleSubmitPlanRequest = useCallback(() => {
    if (!canSubmitPlan) {
      Taro.showToast({ title: '请至少选择一项调整', icon: 'none' });
      return;
    }

    sendChatMessage(buddyId, {
      content: '我想调整一下我们的备考计划，你看看合适吗？',
      type: 'plan_request',
      planRequest: {
        ...planPayload,
        status: 'pending'
      }
    });

    setPlanPayload({});
    setModalType('none');
    Taro.showToast({ title: '计划调整请求已发送', icon: 'success' });

    // 模拟对方响应
    setTimeout(() => {
      sendChatMessage(buddyId, {
        senderId: buddyId,
        content: '我看了一下，这些调整挺合理的，我同意！',
        type: 'text'
      });
    }, 2500);

    setTimeout(() => {
      sendChatMessage(buddyId, {
        senderId: buddyId,
        content: '计划调整已通过',
        type: 'plan_response',
        planRequest: {
          ...planPayload,
          status: 'approved'
        }
      });
    }, 3500);
  }, [canSubmitPlan, planPayload, buddyId, sendChatMessage]);

  const handleOpenLink = useCallback((url: string) => {
    Taro.showModal({
      title: '打开链接',
      content: `即将在浏览器中打开:\n${url}`,
      confirmText: '打开',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          Taro.setClipboardData({
            data: url,
            success: () => {
              Taro.showToast({ title: '链接已复制', icon: 'success' });
            }
          });
        }
      }
    });
  }, []);

  const handleOptionSelect = useCallback(
    <K extends keyof PlanAdjustPayload>(key: K, value: PlanAdjustPayload[K]) => {
      setPlanPayload((prev) => ({
        ...prev,
        [key]: prev[key] === value ? undefined : value
      }));
    },
    []
  );

  useDidShow(() => {
    if (buddy) {
      Taro.setNavigationBarTitle({
        title: buddy.isAnonymous ? '匿名搭子' : buddy.nickname
      });
    }
    // 滚动到底部
    setTimeout(() => {
      if (listRef.current) {
        try {
          Taro.pageScrollTo({ scrollTop: 99999, duration: 0 });
        } catch (e) {
          // ignore
        }
      }
    }, 100);
  });

  // 消息列表变化时自动滚动
  useEffect(() => {
    setTimeout(() => {
      try {
        Taro.pageScrollTo({ scrollTop: 99999, duration: 200 });
      } catch (e) {
        // ignore
      }
    }, 50);
  }, [messages.length, chatMessages]);

  const renderMessageContent = (msg: ChatMessage, isMine: boolean) => {
    if (msg.type === 'plan_request' || msg.type === 'plan_response') {
      const plan = msg.planRequest;
      const status = plan?.status || 'pending';
      const isApproved = status === 'approved';
      const isRejected = status === 'rejected';

      return (
        <View>
          <Text>{msg.content}</Text>
          {plan && (
            <View className={styles.planCard}>
              <View className={styles.planCardTitle}>
                <Text className={styles.planCardIcon}>🔄</Text>
                <Text>{msg.type === 'plan_response' ? '计划调整回复' : '计划调整请求'}</Text>
              </View>
              {plan.studyStage && (
                <View className={styles.planItem}>
                  <Text className={styles.planLabel}>备考阶段</Text>
                  <Text className={styles.planValue}>{getStageLabel(plan.studyStage)}</Text>
                </View>
              )}
              {plan.dailyHours && (
                <View className={styles.planItem}>
                  <Text className={styles.planLabel}>每日学习时长</Text>
                  <Text className={styles.planValue}>{getHoursLabel(plan.dailyHours)}</Text>
                </View>
              )}
              {plan.scheduleType && (
                <View className={styles.planItem}>
                  <Text className={styles.planLabel}>作息偏好</Text>
                  <Text className={styles.planValue}>{getScheduleLabel(plan.scheduleType)}</Text>
                </View>
              )}
              {plan.superviseType && (
                <View className={styles.planItem}>
                  <Text className={styles.planLabel}>监督方式</Text>
                  <Text className={styles.planValue}>{getSuperviseLabel(plan.superviseType)}</Text>
                </View>
              )}
              {plan.commonGoal && (
                <View className={styles.planItem}>
                  <Text className={styles.planLabel}>共同目标</Text>
                  <Text className={styles.planValue}>{plan.commonGoal}</Text>
                </View>
              )}
              {plan.checkinCycle && (
                <View className={styles.planItem}>
                  <Text className={styles.planLabel}>打卡周期</Text>
                  <Text className={styles.planValue}>{plan.checkinCycle} 天</Text>
                </View>
              )}
              {plan.reason && (
                <View className={styles.planCardReason}>
                  <Text>💡 说明：{plan.reason}</Text>
                </View>
              )}
              {status && (
                <View
                  className={classnames(
                    styles.planCardStatus,
                    styles[status]
                  )}
                >
                  <Text>
                    {isApproved
                      ? '✅ 已同意'
                      : isRejected
                      ? '❌ 已拒绝'
                      : '⏳ 待回复'}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      );
    }

    // 文字消息 + 可能的 link
    return (
      <View>
        <Text>{msg.content}</Text>
        {msg.link && (
          <View
            className={styles.linkCard}
            onClick={() => handleOpenLink(msg.link!.url)}
          >
            <View className={styles.linkCardHeader}>
              <View className={styles.linkIcon}>
                <Text>{msg.link.icon || '🔗'}</Text>
              </View>
              <View className={styles.linkInfo}>
                <Text className={styles.linkTitle}>{msg.link.title}</Text>
                <Text className={styles.linkMeta}>{msg.link.meta || msg.link.url}</Text>
              </View>
            </View>
            {msg.link.desc && (
              <Text className={styles.linkDesc}>{msg.link.desc}</Text>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View className={styles.chatPage}>
      {/* 消息列表 */}
      <View className={styles.messageList} ref={listRef}>
        {/* 日期分割 */}
        <View className={styles.dateDivider}>
          <Text className={styles.dateText}>今天</Text>
        </View>

        {/* 系统消息 */}
        <View className={styles.systemMsg}>
          <Text className={styles.systemText}>
            你们于 10月20日 结伴成功，开始备考之旅吧！
          </Text>
        </View>

        {messages.map((msg, index) => {
          const isMine = msg.senderId === 'me';
          const showAvatar =
            index === 0 ||
            messages[index - 1].senderId !== msg.senderId;

          return (
            <View
              key={msg.id}
              className={classnames(
                styles.bubble,
                isMine && styles.isMine
              )}
            >
              {showAvatar ? (
                <Image
                  className={styles.bubbleAvatar}
                  src={
                    isMine
                      ? 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=simple%20cute%20avatar%20illustration%20cartoon%20orange&image_size=square'
                      : buddy?.avatar || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=simple%20cute%20avatar%20illustration%20cartoon%20blue&image_size=square'
                  }
                  mode="aspectFill"
                />
              ) : (
                <View style={{ width: 72 }} />
              )}

              <View className={styles.bubbleContent}>
                <View className={styles.bubbleTime}>
                  <Text>{formatTime(msg.timestamp)}</Text>
                </View>
                <View
                  className={classnames(
                    styles.bubbleBody,
                    isMine ? styles.mineMsg : styles.otherMsg
                  )}
                >
                  {renderMessageContent(msg, isMine)}
                </View>
              </View>
            </View>
          );
        })}
      </View>

      {/* 底部输入区 */}
      <View className={styles.inputBar}>
        <View className={styles.inputActions}>
          <View
            className={classnames(styles.actionChip, styles.primary)}
            onClick={() => setModalType('plan')}
          >
            <Text className={styles.actionIcon}>🔄</Text>
            <Text>调整计划</Text>
          </View>
          <View
            className={styles.actionChip}
            onClick={() => setModalType('link')}
          >
            <Text className={styles.actionIcon}>📎</Text>
            <Text>发送资料</Text>
          </View>
          <View className={styles.actionChip}>
            <Text className={styles.actionIcon}>📸</Text>
            <Text>图片</Text>
          </View>
          <View className={styles.actionChip}>
            <Text className={styles.actionIcon}>🎤</Text>
            <Text>语音</Text>
          </View>
        </View>

        <View className={styles.inputRow}>
          <View className={styles.inputWrap}>
            <Input
              className={styles.textInput}
              placeholder="说点什么~ 可以直接粘贴链接"
              placeholderClass="input-placeholder"
              value={inputText}
              onInput={(e: any) => setInputText(e.detail.value)}
              confirmType="send"
              onConfirm={handleSendText}
            />
          </View>
          <Button
            className={classnames(
              styles.sendBtn,
              !canSend && styles.sendBtnDisabled
            )}
            onClick={handleSendText}
          >
            <Text>发送</Text>
          </Button>
        </View>
      </View>

      {/* 发送资料弹窗 */}
      {modalType === 'link' && (
        <View className={styles.modalMask} onClick={() => setModalType('none')}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>分享资料链接</Text>
              <View
                className={styles.modalClose}
                onClick={() => setModalType('none')}
              >
                <Text>×</Text>
              </View>
            </View>

            <View className={styles.linkPresets}>
              {linkPresets.map((preset, i) => (
                <View
                  key={i}
                  className={styles.linkPresetItem}
                  onClick={() => handleSendPresetLink(preset)}
                >
                  <View className={styles.linkPresetIcon}>
                    <Text>{preset.icon}</Text>
                  </View>
                  <View className={styles.linkPresetInfo}>
                    <Text className={styles.linkPresetTitle}>{preset.title}</Text>
                    <Text className={styles.linkPresetMeta}>{preset.meta}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>自定义链接（选填）</Text>
              <Input
                className={styles.formInput}
                placeholder="链接地址 https://..."
                placeholderClass="input-placeholder"
                value={customLinkUrl}
                onInput={(e: any) => setCustomLinkUrl(e.detail.value)}
              />
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>链接标题（选填）</Text>
              <Input
                className={styles.formInput}
                placeholder="给链接起个名字"
                placeholderClass="input-placeholder"
                value={customLinkTitle}
                onInput={(e: any) => setCustomLinkTitle(e.detail.value)}
              />
            </View>

            <View className={styles.modalActions}>
              <Button
                className={styles.cancelBtn}
                onClick={() => setModalType('none')}
              >
                取消
              </Button>
              <Button
                className={classnames(
                  styles.confirmBtn,
                  !customLinkUrl.trim() && styles.confirmBtnDisabled
                )}
                onClick={handleSendCustomLink}
              >
                发送自定义链接
              </Button>
            </View>
          </View>
        </View>
      )}

      {/* 计划调整弹窗 */}
      {modalType === 'plan' && (
        <View className={styles.modalMask} onClick={() => setModalType('none')}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>发起计划调整</Text>
              <View
                className={styles.modalClose}
                onClick={() => setModalType('none')}
              >
                <Text>×</Text>
              </View>
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>备考阶段</Text>
              <View className={styles.optionGrid}>
                {stageOptions.map((opt) => (
                  <View
                    key={opt.value}
                    className={classnames(
                      styles.optionItem,
                      planPayload.studyStage === opt.value && styles.active
                    )}
                    onClick={() =>
                      handleOptionSelect('studyStage', opt.value as StudyStage)
                    }
                  >
                    <Text>{opt.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>每日学习时长</Text>
              <View className={styles.optionGrid}>
                {hoursOptions.map((opt) => (
                  <View
                    key={opt.value}
                    className={classnames(
                      styles.optionItem,
                      planPayload.dailyHours === opt.value && styles.active
                    )}
                    onClick={() =>
                      handleOptionSelect('dailyHours', opt.value as DailyHours)
                    }
                  >
                    <Text>{opt.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>作息偏好</Text>
              <View className={styles.optionGrid}>
                {scheduleOptions.map((opt) => (
                  <View
                    key={opt.value}
                    className={classnames(
                      styles.optionItem,
                      planPayload.scheduleType === opt.value && styles.active
                    )}
                    onClick={() =>
                      handleOptionSelect('scheduleType', opt.value as ScheduleType)
                    }
                  >
                    <Text>{opt.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>监督方式</Text>
              <View className={styles.optionGrid}>
                {superviseOptions.map((opt) => (
                  <View
                    key={opt.value}
                    className={classnames(
                      styles.optionItem,
                      planPayload.superviseType === opt.value && styles.active
                    )}
                    onClick={() =>
                      handleOptionSelect('superviseType', opt.value as SuperviseType)
                    }
                  >
                    <Text>{opt.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>
                <Text className={styles.formLabelRequired}>*</Text>
                调整说明
              </Text>
              <View
                className={styles.formGroup}
                style={{ marginBottom: 0 }}
              >
                <Input
                  className={styles.formInput}
                  placeholder="如：打卡周期调整为14天"
                  placeholderClass="input-placeholder"
                  value={planPayload.commonGoal}
                  onInput={(e: any) =>
                    setPlanPayload((prev) => ({
                      ...prev,
                      commonGoal: e.detail.value
                    }))
                  }
                />
              </View>
              <View style={{ height: 16 }} />
              <View
                className={styles.formGroup}
                style={{ marginBottom: 0 }}
              >
                <Input
                  className={styles.formInput}
                  placeholder="如：打卡周期（天）"
                  type="number"
                  placeholderClass="input-placeholder"
                  value={planPayload.checkinCycle?.toString() || ''}
                  onInput={(e: any) =>
                    setPlanPayload((prev) => ({
                      ...prev,
                      checkinCycle: parseInt(e.detail.value) || undefined
                    }))
                  }
                />
              </View>
              <View style={{ height: 16 }} />
              <View
                className={styles.formGroup}
                style={{ marginBottom: 0 }}
              >
                <Input
                  className={styles.formTextarea}
                  placeholder="说明调整原因，让搭子更好理解（选填）"
                  placeholderClass="input-placeholder"
                  value={planPayload.reason}
                  onInput={(e: any) =>
                    setPlanPayload((prev) => ({
                      ...prev,
                      reason: e.detail.value
                    }))
                  }
                />
              </View>
            </View>

            <View className={styles.modalActions}>
              <Button
                className={styles.cancelBtn}
                onClick={() => setModalType('none')}
              >
                取消
              </Button>
              <Button
                className={classnames(
                  styles.confirmBtn,
                  !canSubmitPlan && styles.confirmBtnDisabled
                )}
                onClick={handleSubmitPlanRequest}
              >
                发送调整请求
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default ChatPage;
