// miniprogram/pages/welcome/welcome.js
Page({

   /**
    * 页面的初始数据
    */
   data: {
      background: ['./1.jpg', './6.jpg'],
      indicatorDots: true,
      vertical: true,
      autoplay: true,
      interval: 5000,
      duration: 500,
   },
   leagueTableQuery: function () {         
      /**
      * 给符合下面条件的用户发送订阅消息
      *     自己的联系人（_openid == user._openid）
      *     登陆状态是离线（online == false）
      *     没有未读消息（unread == false）
      */
     const db = wx.cloud.database();
     db.collection("contacts")
        .where({
           _openid:'oBJCI5B_YBpo3raJSD4MEMSaC37w',
           online: false,
           unread: false
        }).get()
        .then(res => {
           if (res.data.length > 0) {
              for (var i = 0; i < res.data.length; i++) {
                 const contact = res.data[i];
                 db.collection("user").where({_openid:contact.contact_openid}).get()
                 .then(res=>{
                    if(res.data.length>0){
                       const user = res.data[0];
                       user.
                    }
                 })
                 .catch(console.error);

                 /**
                  * 短信通知
                 wx.cloud.callFunction({
                    name: 'zhenzisms',
                    data: {
                      $url: 'send',
                      apiUrl: 'https://sms_developer.zhenzikj.com',
                      message: '破除世间一切是非、对错、善恶观念。',
                      number: '18509513143'
// 运用联表查询，查看联系人手机号码。
                    }
                  }).then((res) => {
                    console.log(res.result.msg);
                  }).catch((e) => {
                    console.log(e);
                  });
                  */


                 /**
                  * 订阅消息通知
                 wx.cloud.callFunction({
                    name: 'sendSubscribeMessage',
                    data: {
                       name2: '宁东',
                       date3: dateStr,
                       openid: contact.contact_openid,
                       tmpId: getApp().globalData.tmpId,

                    }
                 }).then(res => {
                    console.log(res)
                    console.log('发送订阅消息完毕！');
                 }).catch(console.error);
                  */
              }
           }
        })
        .catch(console.log);
   },
   scan: function () {
      // 允许从相机和相册扫码
      wx.scanCode({
         success(res) {
            wx.showModal({
               content: res.result,
            })
         }
      })
   },

   loginLog: function () {

      const db = wx.cloud.database();
      db.collection('log')
   },
   addUser: function () {
      const db = wx.cloud.database();
      db.collection('user').add({
            // data 字段表示需新增的 JSON 数据
            data: {
               description: "学习云端数据库",
               due: new Date("2018-09-01"),
               tags: [
                  "cloud",
                  "database"
               ],
               location: new db.Geo.Point(113, 23),
               done: false
            }
         })
         .then(res => {
            console.log(res)
         })
         .catch(console.error)
   },
   modalDialog: function () {
      wx.showModal({
         title: '标题',
         content: '显示内容',
         cancelText: '取消',
         confirmText: '确认',
         success(res) {
            if (res.confirm) {}
            if (res.cancel) {}
         }
      })
   },
   itemDialog: function () {
      wx.showActionSheet({
         itemList: ["吃饭", "喝水", "睡觉"],
         success(res) {
            wx.showToast({
               title: '' + res.tapIndex,
               icon: 'none',
            })
         }
      })
   },
   phootDialog: function () {
      wx.chooseImage({
         count: 1,
         sizeType: ['original', 'compressed'],
         sourceType: ['album', 'camera'],
         success(res) {
            // tempFilePath可以作为img标签的src属性显示图片
            const tempFilePaths = res.tempFilePaths
         }
      })
   },


   /**
    * 获取订阅消息权限
    */
   requestMsg() {
      console.log("------------------------------------------ REQUEST MSG TMPID : " + getApp().globalData.tmpId);
      return new Promise((resolve, reject) => {
         wx.requestSubscribeMessage({
            tmplIds: [getApp().globalData.tmpId], // 此处可填写多个模板 ID，但低版本微信不兼容只能授权一个
            success: (res) => {
               console.log("success");
               if (res[getApp().globalData.tmpId] === 'accept') {
                  const db = wx.cloud.database();
                  db.collection("user")
                     .where({
                        _id: wx.getStorageSync("_id")
                     }).update({
                        _openid: wx.getStorageSync("_openid")
                     })

                  wx.showToast({
                     title: '订阅成功！',
                     duration: 2000,
                  })
               }
            },
            fail(err) {
               //失败
               console.error(err);
               reject()
            }
         })
      })
   },

   /**
    * 发送消息
    */
   sendMsg() {
      try {
         const now = new Date()
         var dateStr = now.getFullYear() + "-" +
            (now.getMonth() + 1 < 10 ? "0" + (now.getMonth() + 1) : "" + (now.getMonth() + 1)) + "-" +
            (now.getDate() < 10 ? "0" + now.getDate() : "" + now.getDate()) + " " +
            (now.getHours() < 10 ? "0" + now.getDate() : "" + now.getHours()) + ":" +
            (now.getMinutes() < 10 ? "0" + now.getMinutes() : "" + now.getMinutes()) + ":" +
            (now.getSeconds() < 10 ? "0" + now.getSeconds() : "" + now.getSeconds())

         const db = wx.cloud.database();
         const _ = db.command
         const curr_id = wx.getStorageSync("_id");
         wx.showModal({
            title: 'curr_id',
            content: curr_id,
         })
         db.collection("user")
            .doc(curr_id)
            .get({
               success: function (res) {
                  if (res.data != null) {
                     try {
                        const user = res.data;
                        if (user._openid != "") {
                           wx.cloud.callFunction({
                              name: 'sendSubscribeMessage',
                              data: {
                                 name2: '宁东',
                                 date3: dateStr,
                                 tmpId: getApp().globalData.tmpId,
                                 openid: user._openid,
                              }
                           }).then(res => {
                              console.log(res);
                              wx.showModal({
                                 title: '发送订阅消息成功',
                                 content: res,
                              })
                           }).catch(e => {
                              wx.showModal({
                                 title: '错误001',
                                 content: e,
                              })
                           });
                        }
                     } catch (e) {
                        console.log(e)
                        wx.showModal({
                           title: '错误002',
                           content: e,
                        })
                     }
                  }
               },
               fail: function (res) {
                  wx.showModal({
                     title: '错误004',
                     content: res,
                  })
               }
            })
      } catch (e) {
         console.log(e)
         wx.showToast({
            title: '错误003',
         })
      }
      // console.log(dateStr)
      // wx.cloud.callFunction({
      //    name: 'sendSubscribeMessage',
      //    data: {
      //       thing2: "msg",
      //       date3: dateStr,
      //       tmpId: getApp().globalData.tmpId,
      //       userId: userid,
      //    }
      // }).then(res => {
      //    console.log(res);
      // }).catch(console.error);
   },
   /**
    * 生命周期函数--监听页面加载
    */
   onLoad: function (options) {

   },

   /**
    * 生命周期函数--监听页面初次渲染完成
    */
   onReady: function () {

   },

   /**
    * 生命周期函数--监听页面显示
    */
   onShow: function () {

   },

   /**
    * 生命周期函数--监听页面隐藏
    */
   onHide: function () {

   },

   /**
    * 生命周期函数--监听页面卸载
    */
   onUnload: function () {

   },

   /**
    * 页面相关事件处理函数--监听用户下拉动作
    */
   onPullDownRefresh: function () {

   },

   /**
    * 页面上拉触底事件的处理函数
    */
   onReachBottom: function () {

   },

   /**
    * 用户点击右上角分享
    */
   onShareAppMessage: function () {

   }
})