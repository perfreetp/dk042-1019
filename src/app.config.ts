export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/match/index',
    'pages/checkin/index',
    'pages/message/index',
    'pages/mine/index',
    'pages/buddy-detail/index',
    'pages/study-room/index',
    'pages/pomodoro/index',
    'pages/chat/index',
    'pages/profile-edit/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FF7D00',
    navigationBarTitleText: '考研搭子',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#FF7D00',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/match/index',
        text: '匹配'
      },
      {
        pagePath: 'pages/checkin/index',
        text: '打卡'
      },
      {
        pagePath: 'pages/message/index',
        text: '消息'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
