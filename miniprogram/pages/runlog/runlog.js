// miniprogram/pages/runlog/runlog.js
Page({

   /**
    * 页面的初始数据
    */
   data: {
      runlogs: [],
      onlineUsers: [],
      isLoadingHidden:false
   },

   /**
    * 生命周期函数--监听页面加载
    */
   onLoad: function(options) {
      const db = wx.cloud.database();


      wx.cloud.callFunction({
         name: 'getOnlineUsers',
         data: {
            openid: wx.getStorageSync('_openid'),
         }
      })
      .then(res=>{
         console.log('8888888888888888888888888888888')
         console.log(res.result.list);
         // console.log(res.result.list[0].onlineUsers[0]);
         this.setData({
            onlineUsers: res.result.list,
            isLoadingHidden: true
         })
      })
      .catch(console.error)

      db.collection("user").doc( wx.getStorageSync('_openid'))
      .then(res=>{
         console.log("+++++++++++++++++++++++++++++++++++++");
         console.log(res);
      })
      .catch(console.error);
      // db.collection("contacts").where({
      //       _openid: wx.getStorageSync('_openid'),
      //       online: true,
      //    }).get()
      //    .then(res => {
      //       this.setData({
      //          onlineUsers: res.data
      //       })
      //    })

      db.collection('runlog').where({
            type: 'login'
         })
         .orderBy('timeTS', 'desc')
         .get()
         .then(res => {
            this.setData({
               runlogs: res.data
            })
            // for (var i = 0; i < res.data.length; i++) {
            //    console.log(res.data[i]);
            // }
         });

   },

   /**
    * 生命周期函数--监听页面初次渲染完成
    */
   onReady: function() {

   },

   /**
    * 生命周期函数--监听页面显示
    */
   onShow: function() {

   },

   /**
    * 生命周期函数--监听页面隐藏
    */
   onHide: function() {

   },

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