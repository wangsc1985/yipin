// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
   env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

// 云函数入口函数
exports.main = async(event, context) => {
   try {
      return await db.collection('contacts').aggregate()
         .match({
            _openid: event.openid,
            online:true
         })
         .lookup({
            from: 'user',
            localField: 'contact_openid',
            foreignField: '_openid',
            as: 'onlineUsers'
         })
         .end()
   } catch (err) {
      console.error(err)
   }
}