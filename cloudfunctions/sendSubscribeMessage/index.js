// 云函数入口文件

const cloud = require("wx-server-sdk")
cloud.init()

exports.main = async(event, context) => {
   try {
      const {OPENID} = cloud.getWXContext()
      const result = await cloud.openapi.subscribeMessage.send({
         touser: event.openid,
         page: 'pages/login/login',
         lang: 'zh_CN',
         data: {
            "name2": {
               value: event.name2,
            },
            "date3": {
               value: event.date3,
            },
         },
         templateId: event.tmpId,
         miniprogramState: 'developer'
      })

      return {
         result:result,
         openId:OPENDID,
         tmpId:getApp().globalData.tmpId,
      }
   } catch (error) {
      console.log(error)
      return error
   }
}