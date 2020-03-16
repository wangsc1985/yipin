// miniprogram/pages/im/login/login.js
Page({

   /**
    * 页面的初始数据
    */
   data: {
      code: '',
      isAutoFocus: true,
      isDisabled:false,
   },

   onFocus: function(e) {
      console.log(e);
   },

   onBlur:function(e){
      console.log(e);
      var code = e.detail.value;
      if (code == '0000') {
         wx.navigateTo({
            url: '../../welcome/welcome',
         })
      }
   },

   login: function(e) {
      e.isAutoFocus=false;
      var code = e.detail.value;
      if (code.length == 4) {
         console.log(code);

         // 1. 获取数据库引用
         const db = wx.cloud.database()
         // 2. 构造查询语句
         // collection 方法获取一个集合的引用
         // where 方法传入一个对象，数据库返回集合中字段等于指定值的 JSON 文档。API 也支持高级的查询条件（比如大于、小于、in 等），具体见文档查看支持列表
         // get 方法会触发网络请求，往数据库取数据
         db.collection('user')
            .where({
               password: code
            })
            .get({
               success: function(res) {
                  // 输出 [{ "title": "The Catcher in the Rye", ... }]
                  if (res.data.length > 0) {
                     wx.setStorageSync('name', res.data[0].name);
                     wx.setStorageSync('avatar',res.data[0].avatar);
                     wx.navigateTo({
                        url: '../room/room?id=' + res.data[0]._id,
                     })
                  }
               }
            })
      }
   },

   /**
    * 生命周期函数--监听页面加载
    */
   onLoad: function(options) {
      console.log("生命周期函数--监听页面加载");
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
      console.log("生命周期函数--监听页面显示");
      this.setData({
         code: '',
         isDisabled:false,
         isAutoFocus: true,
      });
   },

   /**
    * 生命周期函数--监听页面隐藏
    */
   onHide: function() {
      console.log("生命周期函数--监听页面隐藏");
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