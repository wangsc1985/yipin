// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
   env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command
// 云函数入口函数
exports.main = async(event, context) => {
   const wxContext = cloud.getWXContext()

   try {
      console.log('==================================================')
      console.log(event._openid)
      console.log('==================================================')
      return await db.collection('contacts').where(
            _.or([{
               _openid: event._openid
            }, {
               contact_openid: event._openid
            }]))
         .update({
            data: {
               unread: false
            },
         })
   } catch (e) {
      console.error(e)
   }
}