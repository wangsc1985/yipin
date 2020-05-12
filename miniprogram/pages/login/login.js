// miniprogram/pages/im/login/login.js
Page({

   /**
    * 页面的初始数据
    */
   data: {
      code: '',
      isAutoFocus: true,
      isDisabled: false,
   },

   onFocus: function(e) {
      console.log(e);
   },

   login: function(e) {
      e.isAutoFocus = false;
      var code = e.detail.value;
      if (code.length == 4) {
         console.log(code);

         if (code == '0000') {
            wx.hideKeyboard({
               success: console.log("success"),
            })
            wx.navigateTo({
               url: '../welcome/welcome',
            })
            return;
         } else if (code == '5123') {
            wx.hideKeyboard({
               success: console.log("success"),
            })
            wx.navigateTo({
               url: '../runlog/runlog',
            })
            return;
         }
         // 1. 获取数据库引用
         const db = wx.cloud.database();
         const _ = db.command;
         // 2. 构造查询语句
         // collection 方法获取一个集合的引用
         // where 方法传入一个对象，数据库返回集合中字段等于指定值的 JSON 文档。API 也支持高级的查询条件（比如大于、小于、in 等），具体见文档查看支持列表
         // get 方法会触发网络请求，往数据库取数据
         db.collection('user').where({
               password: code
            }).get()
            .then(res => {
               // 输出 [{ "title": "The Catcher in the Rye", ... }]
               if (res.data.length > 0) {
                  try {
                     const user = res.data[0];
                     var globalData = getApp().globalData;
                     globalData.name = user.name;
                     globalData.sex = user.sex;
                     globalData.avatar = user.avatar;
                     globalData._openid = user._openid;
                     globalData._id = user._id;


                     console.log('--------------------------------------------')
                     console.log('-----------------  登录界面  ----------------')
                     console.log('--------------------------------------------')
                     /**
                      * 重置contacts的unread为false，因为联系人的unread标记为true就不会再给他发送订阅消息了，为了保证每次新登录后再有新留言，通知所有联系人，就把所有联系人的unread置为false。
                      */
                     wx.cloud.callFunction({
                           name: 'updateUnread',
                           data: {
                              _openid: user._openid
                           }
                        }).then(res => {
                           console.log('已经重置' + user.name + '的所有联系人unread字段。');
                           console.log(res);
                        })
                        .catch(console.error);

                     /**
                      * 设置屏幕常亮
                      */
                     wx.setKeepScreenOn({
                        keepScreenOn: true,
                     })

                     /**
                      * 转到页面
                      */
                     wx.navigateTo({
                        url: '../room/room',
                     })
                  } catch (err) {
                     console.log(err);
                  }
               }
            })
      }
   },

   getOpenId: function() {
      wx.cloud.callFunction({
         name: "login",
      }).then(res => {
         console.log("========================== " + res.result.openid);
         return res.result.openid;
      }).catch(console.error)
   },
   /**
    * 生命周期函数--监听页面加载
    */
   onLoad: function(options) {},

   /**
    * 生命周期函数--监听页面初次渲染完成
    */
   onReady: function() {

   },

   /**
    * 生命周期函数--监听页面显示
    */
   onShow: function() {
      this.setData({
         code: '',
         isDisabled: false,
         isAutoFocus: true,
      });
   },

   /**
    * 生命周期函数--监听页面隐藏
    */
   onHide: function() {},

   /**
    * 生命周期函数--监听页面卸载
    */
   onUnload: function() {

   },

   /**
    * 页面相关事件处理函数--监听用户下拉动作
    */
   onPullDownRefresh: function() {

   },

   /**
    * 页面上拉触底事件的处理函数
    */
   onReachBottom: function() {

   },

   /**
    * 用户点击右上角分享
    */
   onShareAppMessage: function() {

   }
})