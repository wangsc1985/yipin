const app = getApp()

Page({
   data: {
      avatarUrl: './user-unlogin.png',
      logged: false,
      takeSession: false,
      requestResult: '',
      chatRoomCollection: 'chatroom',
      chatRoomGroupId: 'demo',
      chatRoomGroupName: '聊天室',
   },

   dateFormat(fmt, date) {
      let ret;
      const opt = {
         "Y+": date.getFullYear().toString(), // 年
         "m+": (date.getMonth() + 1).toString(), // 月
         "d+": date.getDate().toString(), // 日
         "H+": date.getHours().toString(), // 时
         "M+": date.getMinutes().toString(), // 分
         "S+": date.getSeconds().toString() // 秒
         // 有其他格式化字符需求可以继续添加，必须转化成字符串
      };
      for (let k in opt) {
         ret = new RegExp("(" + k + ")").exec(fmt);
         if (ret) {
            fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
         };
      };
      return fmt;
   },
   onShow: function() {

      console.log('===========================================')
      console.log('============      显示    =================')
      console.log('===========================================')

      /**
       * 登陆状态更新
       */
      const db = wx.cloud.database();
      wx.cloud.callFunction({
            name: 'updateOnline',
            data: {
               _openid: getApp().globalData._openid,
               online: true
            }
         })
         .then(res => {
            console.log(getApp().globalData.name + '已向所有联系人更新自己状态')
            console.log(res)
         })
         .catch(console.error)

      db.collection('runlog').add({
            data: {
               time: this.dateFormat("mm-dd HH:MM:SS", new Date()),
               type: 'login',
               item: '【' + getApp().globalData.name + '】上线',
               timeTS: new Date().getTime(),
               summary: '',
            }
         })
         .then(res => {
            console.log(getApp().globalData.name + '上线')
            getApp().globalData.loginTime = new Date().getTime();
         })
         .catch(console.error);
   },


   onHide: function() {
      console.log('===========================================')
      console.log('============      隐藏    =================')
      console.log('===========================================')
      /**
       * 转到登录界面
       */
      wx.navigateBack()

      /**
       * 登陆状态更新
       */
      const db = wx.cloud.database();

      wx.cloud.callFunction({
            name: 'updateOnline',
            data: {
               _openid: getApp().globalData._openid,
               online: false,
            }
         })
         .then(res => {
            console.log(getApp().globalData.name + '已向所有联系人更新自己状态')
            console.log(res)
         })
         .catch(console.error)

      try {
         var span = (new Date().getTime()) - getApp().globalData.loginTime;
         span = span / 1000;
         const minite = parseInt(span / 60);
         const second = parseInt(span % 60);
         db.collection('runlog').add({
               data: {
                  time: '(' + (minite == 0 ? '' : (minite + '分')) + second + '秒）' +
                     this.dateFormat("HH:MM:SS", new Date()),
                  type: 'login',
                  item: '【' + getApp().globalData.name + '】离线',
                  timeTS: new Date().getTime(),
                  summary: '',
               }
            })
            .then(res => {
               console.log(getApp().globalData.name + '离线')
            })
            .catch(console.error);
      } catch (error) {
         console.log(error)
      }
   },

   onLoad: function() {

      wx.getSystemInfo({
         success: res => {
            console.log('system info', res)
            if (res.safeArea) {
               const {
                  top,
                  bottom
               } = res.safeArea
               this.setData({
                  containerStyle: `padding-top: ${(/ios/i.test(res.system) ? 10 : 20) + top}px; padding-bottom: ${20 + res.windowHeight - bottom}px`,
               })
            }
         },
      })
   },
})