const FATAL_REBUILD_TOLERANCE = 10
const SETDATA_SCROLL_TO_BOTTOM = {
   scrollTop: 100000,
   scrollWithAnimation: true,
}

Component({
   properties: {
      envId: String,
      collection: String,
      groupId: String,
      groupName: String,
      userInfo: Object,
      onGetUserInfo: {
         type: Function,
      },
   },

   data: {
      chats: [],
      textInputValue: '',
      openId: '',
      scrollTop: 0,
      scrollToMessage: '',
      hasKeyboard: false,
      isSendBtnShow: false,
      isAutoFocus: true,
      sex: getApp().globalData.sex,
      noticed: false, // 标记本次登录后，发消息后是否发送了消息通知。用于实现仅仅每次登录的第一条消息发送消息通知
      subscriptionButtonShow: false
   },

   methods: {
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
      /**
       * 获取订阅消息权限
       */
      requestMsg() {
         return new Promise((resolve, reject) => {
            wx.requestSubscribeMessage({
               tmplIds: [getApp().globalData.tmpId], // 此处可填写多个模板 ID，但低版本微信不兼容只能授权一个
               success: (res) => {
                  if (res[getApp().globalData.tmpId] === 'accept') {
                     const db = wx.cloud.database();

                     db.collection("user")
                        .doc(getApp().globalData._id)
                        .update({
                           data: {
                              subscription: getApp().globalData.tmpId,
                           },
                        })
                        .then(res => {
                           this.setData({
                              subscriptionButtonShow: false,
                           })
                           console.log(res);
                           wx.showToast({
                              title: '订阅成功！',
                              duration: 2000,
                           })
                        })
                        .catch(console.error)
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
       * -----------------------------------------
       * 发送消息
       * 
       *    本地用户每次登陆后第一条新信息，都要向所有未登录用户发送订阅消息。
       *    1、遍历所有没有登陆的联系人，检查本地用户登陆后，是否已经给当前联系人发送过信息？（如果已经发送过，就不要发送了，
       *       每一个联系人在本地用户当前登陆session中只能发送一次。）
       *          A、每一次登陆本地用户都遍历联系人(_openid==自己)，将unread设置为false。（为的是可以向所有对方账户有发信息的条件）
       *          B、每一次登陆本地用户，将自己为联系人的联系人的联系人(contact_openid==自己)unread设置为false。允许自己在退出登录后，对方用户会再次通知一次消息。
       * 
       *    2、每一次本地用户发送新消息，都作如下检查和操作：
       *       1、遍历所有没有登陆的联系人，检查此用户的unread是否为false？
       *       2、如果为false，则给此联系人发送消息，并将此联系人的unread设置为true；
       * 
       * -----------------------------------------
       */
      sendMsg() {
         const now = new Date()
         const month = now.getMonth() + 1 < 10 ? "0" + (now.getMonth() + 1) : "" + (now.getMonth() + 1);
         const date = now.getDate() < 10 ? "0" + now.getDate() : "" + now.getDate();
         const hours = now.getHours() < 10 ? "0" + now.getDate() : "" + now.getHours();
         const minutes = now.getMinutes() < 10 ? "0" + now.getMinutes() : "" + now.getMinutes();
         const seconds = now.getSeconds() < 10 ? "0" + now.getSeconds() : "" + now.getSeconds();
         var dateStr = now.getFullYear() + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
         // var dateStr = now.getFullYear() + "." + (now.getMonth() + 1) + "." + now.getDate() + " " +
         //    now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds()

         const db = wx.cloud.database();
         const _ = db.command


         /**
          *
          给符合下面条件的用户发送订阅消息
               自己的联系人（_openid==user._openid）
               登陆状态是离线（online==false）
               没有未读消息（unread==false）
          */
         db.collection("contacts")
            .where({
               _openid: getApp().globalData._openid,
               online: false,
               unread: false
            }).get()
            .then(res => {
               if (res.data.length > 0) {
                  for (var i = 0; i < res.data.length; i++) {
                     const contact = res.data[i];

                     /**
                      * 短信通知
                      * 
                      */
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

         // 将符合上面条件的用户的unread全部重置为true。在本地用户下次登录时，会把自己所有好友的unread重置为false，但是在此之前，
         // 不会再向这些人发送订阅消息。每次登陆只发送一次订阅消息。
         db.collection("contacts")
            .where({
               _openid: getApp().globalData._openid,
               online: false,
               unread: false
            })
            .update({
               data: {
                  unread: true,
               }
            })
            .then(res => {
               console.log('重置unread完毕！');
            })
      },
      isameDay(d1, d2) {
         if (d1.getFullYear() == d2.getFullYear() && d1.getMonth() == d2.getMonth() && d1.getDate() == d2.getDate()) {
            return true;
         } else {
            return false;
         }
      },
      isToday(d) {
         return this.isameDay(d, new Date());
      },
      isYesterday(d) {
         var today = new Date();
         var yesterday = new Date((new Date().getTime() - 3600000 * 24));

         if (this.isameDay(d, yesterday)) {
            return true;
         } else {
            return false;
         }
      },

      /**
       * ----------------------------------------------------------
       * 在聊天数据中，整合入dateStr，isDateHidden属性，提供给页面调用
       * ----------------------------------------------------------
       */
      subjoinInfo(list) {
         list.sort((x, y) => x.sendTimeTS - y.sendTimeTS)

         var preTime = new Date(0);
         console.log(preTime.toDateString()) //
         for (var i = 0; i < list.length; i++) {
            var time = list[i].sendTime;
            var hourStr = time.getHours() < 10 ? "0" + time.getHours() : time.getHours();
            var minuteStr = time.getMinutes() < 10 ? "0" + time.getMinutes() : time.getMinutes();

            list[i].timeStr = hourStr + ":" + minuteStr;

            if (!this.isameDay(preTime, time)) {
               list[i].isDateHidden = false;
               preTime = time;
            } else {
               list[i].isDateHidden = true;
            }

            if (this.isToday(time))
               list[i].dateStr = (time.getMonth() + 1) + "月" + time.getDate() + "日 今天";
            else if (this.isYesterday(time))
               list[i].dateStr = (time.getMonth() + 1) + "月" + time.getDate() + "日 昨天";
            else
               list[i].dateStr = (time.getMonth() + 1) + "月" + time.getDate() + "日";
         }
      },


      /**
       * -------------------------------------
       *  当输入框文本发生变化时调用
       * -------------------------------------
       */
      onTextChange(e) {
         if (e.detail.value.length > 0) {
            this.setData({
               textInputValue: e.detail.value,
               isSendBtnShow: true,
            })
         } else {
            this.setData({
               textInputValue: e.detail.value,
               isSendBtnShow: false,
            })
         }
      },
      onGetUserInfo(e) {
         this.properties.onGetUserInfo(e)
      },

      mergeCommonCriteria(criteria) {
         return {
            groupId: this.data.groupId,
            ...criteria,
         }
      },

      /**
       * -------------------------------------
       * 初始化聊天室
       * -------------------------------------
       */
      async initRoom() {
         this.try(async() => {
            await this.initOpenID()

            const {
               envId,
               collection
            } = this.properties
            const db = this.db = wx.cloud.database({
               env: envId,
            })
            const _ = db.command
            const {
               data: initList
            } = await db.collection(collection).where(this.mergeCommonCriteria()).orderBy('sendTimeTS', 'desc').get()

            console.log('init query chats', initList)

            // initList.reverse()
            this.subjoinInfo(initList)

            this.setData({
               chats: initList,
               scrollTop: 10000,
            })

            this.initWatch(initList.length ? {
               sendTimeTS: _.gt(initList[initList.length - 1].sendTimeTS),
            } : {})
         }, '初始化失败')
      },

      async initOpenID() {
         return this.try(async() => {
            const openId = getApp().globalData._openid;

            this.setData({
               openId,
            })
         }, '初始化 openId 失败')
      },

      /**
       * -----------------------------
       * 监控聊天信息变化
       * -----------------------------
       */
      async initWatch(criteria) {
         this.try(() => {
            const {
               collection
            } = this.properties
            const db = this.db
            const _ = db.command

            console.warn(`开始监听`, criteria)
            this.messageListener = db.collection(collection).where(this.mergeCommonCriteria(criteria)).watch({
               onChange: this.onRealtimeMessageSnapshot.bind(this),
               onError: e => {
                  if (!this.inited || this.fatalRebuildCount >= FATAL_REBUILD_TOLERANCE) {
                     this.showError(this.inited ? '监听错误，已断开' : '初始化监听失败', e, '重连', () => {
                        this.initWatch(this.data.chats.length ? {
                           sendTimeTS: _.gt(this.data.chats[this.data.chats.length - 1].sendTimeTS),
                        } : {})
                     })
                  } else {
                     this.initWatch(this.data.chats.length ? {
                        sendTimeTS: _.gt(this.data.chats[this.data.chats.length - 1].sendTimeTS),
                     } : {})
                  }
               },
            })
         }, '初始化监听失败')
      },

      /**
       * ----------------------
       *  有新消息时，执行此方法
       * ----------------------
       */
      onRealtimeMessageSnapshot(snapshot) {
         console.log(`----------------------------------`)
         console.log(`---******* 南无阿弥陀佛 ********---`)
         console.log(`----------------------------------`)
         console.log(`---------------------------------- snapshot.type`, snapshot.type)
         console.log(`---------------------------------- snapshot.docs`, snapshot.docs)
         console.log(`---------------------------------- snapshot.docChanges`, snapshot.docChanges)

         if (snapshot.type === 'init') {
            this.subjoinInfo(snapshot.docs);

            this.setData({
               ...this.data.chats,
               ...snapshot.docs,
            })
            this.scrollToBottom()
            this.inited = true
         } else {
            let hasNewMessage = false
            let hasOthersMessage = false
            let chats = [...this.data.chats]
            for (const docChange of snapshot.docChanges) {
               console.log(`---------------------------------- docChange`, docChange)
               console.log("----------------------- docChange.queueType : " + docChange.queueType);
               switch (docChange.queueType) {
                  case 'enqueue':
                     {
                        hasOthersMessage = docChange.doc._openid !== this.data.openId
                        const ind = chats.findIndex(chat => chat._id === docChange.doc._id)
                        if (ind > -1) {
                           if (chats[ind].msgType === 'image' && chats[ind].tempFilePath) {
                              chats.splice(ind, 1, {
                                 ...docChange.doc,
                                 tempFilePath: chats[ind].tempFilePath,
                              })
                           } else chats.splice(ind, 1, docChange.doc)
                        } else {
                           hasNewMessage = true
                           // console.log(doc);
                           chats.push(docChange.doc)
                        }
                        break
                     }
               }
            }

            this.subjoinInfo(chats);


            // 聊天信息按时间顺序排序
            this.setData({
               chats: chats,
            })

            // 如果有新信息，聊天信息列表移到底部
            if (hasOthersMessage || hasNewMessage) {
               this.scrollToBottom()
            }

            // 如果有他人新信息，播放声音。
            if (hasOthersMessage) {

               wx.vibrateShort({
                  success: console.log("phone was short vibrate"),
               })
               // const innerAudioContext = wx.createInnerAudioContext(); //新建一个createInnerAudioContext();
               // innerAudioContext.autoplay = true; //音频自动播放设置
               // innerAudioContext.src = 'cloud://yipinshangdu-4wk7z.7969-yipinshangdu-4wk7z-1301432092/noke.wav'; //链接到音频的地址
               // innerAudioContext.onPlay(() => {}); //播放音效
               // innerAudioContext.onError((res) => { //打印错误
               //    console.log(res.errMsg); //错误信息
               //    console.log(res.errCode); //错误码
               // });
            }
         }
      },

      /**
       * ----------------
       * 发送文字
       * ----------------
       */
      async onConfirmSendText(e) {
         e.detail.value = this.data.textInputValue;
         const reg = "想 *你|想 *我|爱 *你|爱 *我";
         if (this.data.textInputValue.search(reg) != -1) {
            wx.showToast({
               title: '包含敏感字',
               icon: 'none',
               duration: 3000,
            })
            return;
         }
         this.try(async() => {
            if (!e.detail.value) {
               return
            }

            const {
               collection
            } = this.properties
            const db = this.db
            const _ = db.command
            const globalData = getApp().globalData;

            const doc = {
               _id: `${Math.random()}_${Date.now()}`,
               groupId: this.data.groupId,
               avatar: globalData.avatar,
               nickName: globalData.name,
               sex: globalData.sex,
               msgType: 'text',
               textContent: e.detail.value,
               sendTime: new Date(),
               sendTimeTS: Date.now(), // fallback
            }
            this.data.chats = [
               ...this.data.chats,
               {
                  ...doc,
                  _openid: this.data.openId,
                  writeStatus: 'pending',
               },
            ]
            this.subjoinInfo(this.data.chats)


            this.setData({
               textInputValue: '',
               chats: this.data.chats,
            })
            this.scrollToBottom(true)

            // 发送订阅消息
            if (this.data.noticed == false) {
               this.sendMsg();
               this.data.noticed = true;
            }
            //

            await db.collection(collection).add({
               data: doc,
            })

            var time = doc.sendTime;
            var hourStr = time.getHours() < 10 ? "0" + time.getHours() : time.getHours();
            var minuteStr = time.getMinutes() < 10 ? "0" + time.getMinutes() : time.getMinutes();
            // const chatsLength = this.data.chats.length;
            // var hidden = false;
            // var lastTime = this.data.chats[this.data.chats.length-1]

            this.setData({
               isSendBtnShow: false,
               chats: this.data.chats.map(chat => {
                  if (chat._id === doc._id) {
                     return {
                        ...chat,
                        writeStatus: 'written',
                        // isDateHidden: true,
                        // timeStr: hourStr + ":" + minuteStr,
                     }
                  } else return chat
               }),
            })
         }, '发送文字失败')
      },

      /**
       * ------------------
       * 发送图片
       * ------------------
       */
      async onChooseImage(e) {
         wx.chooseImage({
            count: 1,
            sourceType: ['album', 'camera'],
            success: async res => {
               const {
                  envId,
                  collection
               } = this.properties
               const globalData = getApp().globalData;
               const doc = {
                  _id: `${Math.random()}_${Date.now()}`,
                  groupId: this.data.groupId,
                  avatar: globalData.avatar,
                  nickName: globalData.name,
                  sex: globalData.sex,
                  msgType: 'image',
                  sendTime: new Date(),
                  sendTimeTS: Date.now(), // fallback
               }

               var time = doc.sendTime;
               var hourStr = time.getHours() < 10 ? "0" + time.getHours() : time.getHours();
               var minuteStr = time.getMinutes() < 10 ? "0" + time.getMinutes() : time.getMinutes();

               this.data.chats = [
                  ...this.data.chats,
                  {
                     ...doc,
                     _openid: this.data.openId,
                     tempFilePath: res.tempFilePaths[0],
                     writeStatus: 0,
                  },
               ]
               this.subjoinInfo(this.data.chats);
               this.setData({
                  chats: this.data.chats
               })
               this.scrollToBottom(true)

               // 发送订阅消息
               if (this.data.noticed == false) {
                  this.sendMsg();
                  this.data.noticed = true;
               }
               //

               const uploadTask = wx.cloud.uploadFile({
                  cloudPath: `${this.data.openId}/${Math.random()}_${Date.now()}.${res.tempFilePaths[0].match(/\.(\w+)$/)[1]}`,
                  filePath: res.tempFilePaths[0],
                  config: {
                     env: envId,
                  },
                  success: res => {
                     this.try(async() => {
                        await this.db.collection(collection).add({
                           data: {
                              ...doc,
                              imgFileID: res.fileID,
                           },
                        })
                     }, '发送图片失败')
                  },
                  fail: e => {
                     this.showError('发送图片失败', e)
                  },
               })


               uploadTask.onProgressUpdate(({
                  progress
               }) => {
                  this.setData({
                     chats: this.data.chats.map(chat => {
                        if (chat._id === doc._id) {
                           return {
                              ...chat,
                              writeStatus: progress,
                           }
                        } else return chat
                     })
                  })
               })
            },
         })
      },

      onMessageImageTap(e) {
         wx.previewImage({
            urls: [e.target.dataset.fileid],
         })
      },

      /**
       * ------------------------------------
       * 当有新信息时，重新定位底部
       * ------------------------------------
       */
      scrollToBottom(force) {
         if (force) {
            console.log('force scroll to bottom')
            this.setData(SETDATA_SCROLL_TO_BOTTOM)
            return
         }

         this.createSelectorQuery().select('.body').boundingClientRect(bodyRect => {
            this.createSelectorQuery().select(`.body`).scrollOffset(scroll => {
               if (scroll.scrollTop + bodyRect.height * 3 > scroll.scrollHeight) {
                  console.log('should scroll to bottom')
                  this.setData(SETDATA_SCROLL_TO_BOTTOM)
               }
            }).exec()
         }).exec()
      },

      /**
       * --------------------
       * 上滑到顶，加载更多数据。
       * --------------------
       */
      async onScrollToUpper() {
         if (this.db && this.data.chats.length) {
            const {
               collection
            } = this.properties
            const _ = this.db.command
            const {
               data
            } = await this.db.collection(collection).where(this.mergeCommonCriteria({
               sendTimeTS: _.lt(this.data.chats[0].sendTimeTS),
            })).orderBy('sendTimeTS', 'desc').get()

            // data.reverse();
            this.subjoinInfo(data);

            this.data.chats.unshift(...data)

            this.setData({
               chats: this.data.chats,
               scrollToMessage: `item-${data.length}`,
               scrollWithAnimation: true,
            })
         }
      },

      async try (fn, title) {
         try {
            await fn()
         } catch (e) {
            this.showError(title, e)
         }
      },

      showError(title, content, confirmText, confirmCallback) {
         console.error(title, content)
         wx.showModal({
            title,
            content: content.toString(),
            showCancel: confirmText ? true : false,
            confirmText,
            success: res => {
               res.confirm && confirmCallback()
            },
         })
      },
   },

   /**
    * ------------------------
    * 生命周期函数
    * ------------------------
    */
   lifetimes: {

      attached: function() {

         const db = wx.cloud.database();

         /**
          * ----------------------------------
          * 检查用户是否已经订阅消息，确定是否显示订阅消息按钮
          * ----------------------------------
          */
         db.collection('user').doc(getApp().globalData._id).get().then(res => {
            const user = res.data;
            if (user.subscription.match(getApp().globalData.tmpId) == null) {
               this.setData({
                  subscriptionButtonShow: true,
               })
            } else {
               this.setData({
                  subscriptionButtonShow: false,
               })
            }
         });

      },

      detached: function() {

         console.log('===========================================')
         console.log('============      退出    =================')
         console.log('===========================================')
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
      }

   },

   /**
    * 生命周期回调—监听页面初次渲染完成
    */
   ready() {
      global.chatroom = this
      this.initRoom()
      this.fatalRebuildCount = 0
   },


})