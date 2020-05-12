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
      console.log(event._openid+'  -   '+evnet.online)
      console.log('==================================================')
      return await db.collection('contacts').where({
            contact_openid: event._openid
         })
         .update({
            data: {
               online: event.online
            },
         })
   } catch (e) {
      console.error(e)
   }
}