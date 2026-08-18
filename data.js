/* =========================================================================
 * 每日热点筛选 · 数据文件（由「每日热点筛选」自动化任务每日重写）
 * -------------------------------------------------------------------------
 * 本文件可被 index.html（前端展示）与 WorkBuddy 自动化任务（重写/降权）共用。
 * 字段说明见 README.md。请勿手写修改——交由自动化或运营导出覆盖。
 * ========================================================================= */

// 数据生成日期（展示用，自动化每日覆盖）
window.DATA_DATE = "2026-08-18";

// 账号分类（顶部①切换）
window.CATEGORIES = ["美食","摄影","情绪","穿搭","旅行","知识","美妆","萌宠","健身","搞笑","影视","音乐","母婴","家居","数码"];

// 渠道（顶部②切换）：综合=聚合/媒体报道（不在四平台专属榜）
window.CHANNELS = ["综合","抖音","小红书","快手","视频号"];

// 分类元数据 + 候选推文模板
window.CAT_META = {
  美食:{em:"🍜",h:"#美食 #吃法 #美食教程",lead:"蹭一波热度，今天这道必须安排上：",leadEn:"Food collab of the day — ",tail:"收藏起来周末就做！",tailEn:"Save it for the weekend."},
  摄影:{em:"📷",h:"#摄影 #手机摄影 #拍照技巧",lead:"出片党看过来，这个画面太适合练手了：",leadEn:"Photo op — ",tail:"下次出门带上相机/手机试试。",tailEn:"Grab your camera next trip."},
  情绪:{em:"💭",h:"#情绪 #治愈 #情感",lead:"看到这个突然被戳到了：",leadEn:"This hit different — ",tail:"愿你今天也被温柔以待。",tailEn:"Hope you're treated gently today."},
  穿搭:{em:"👗",h:"#穿搭 #OOTD #早秋穿搭",lead:"衣橱灵感来了，这么穿真的绝：",leadEn:"Fit inspo — ",tail:"照着搭不出错。",tailEn:"Steal this look."},
  旅行:{em:"✈️",h:"#旅行 #去班味 #小众目的地",lead:"又种草了一个目的地/玩法：",leadEn:"New travel seed — ",tail:"假期安排起来！",tailEn:"Add it to the list!"},
  知识:{em:"📚",h:"#干货 #知识 #科普",lead:"干货时间，这条信息差很有用：",leadEn:"Knowledge drop — ",tail:"记下来慢慢看。",tailEn:"Note it down."},
  美妆:{em:"💄",h:"#美妆 #护肤 #教程",lead:"护肤化妆党注意，这个信号很关键：",leadEn:"Beauty signal — ",tail:"按需抄作业。",tailEn:"Copy what fits."},
  萌宠:{em:"🐾",h:"#萌宠 #猫咪 #狗狗",lead:"毛孩子相关，铲屎官必看：",leadEn:"Pet parents — ",tail:"评论区晒晒你家主子。",tailEn:"Show us your furbaby."},
  健身:{em:"🏋️",h:"#健身 #减脂 #自律",lead:"练起来，今天的训练灵感：",leadEn:"Training inspo — ",tail:"坚持就是胜利。",tailEn:"Consistency wins."},
  搞笑:{em:"😂",h:"#搞笑 #梗 #段子",lead:"笑不活了，这个梗必须分享：",leadEn:"LOL — ",tail:"转发给那个爱笑的朋友。",tailEn:"Send to that friend."},
  影视:{em:"🎬",h:"#影视 #综艺 #追剧",lead:"追剧/综艺党集合，这个名场面：",leadEn:"Screen time — ",tail:"你看了没？",tailEn:"Have you seen it?"},
  音乐:{em:"🎵",h:"#音乐 #歌词 #治愈",lead:"单曲循环预警，这句歌词：",leadEn:"On repeat — ",tail:"戴上耳机感受一下。",tailEn:"Headphones on."},
  母婴:{em:"👶",h:"#母婴 #育儿 #辅食",lead:"宝妈宝爸看过来，这个话题：",leadEn:"Parenting — ",tail:"一起交流带娃经。",tailEn:"Share your tips."},
  家居:{em:"🏠",h:"#家居 #装修 #收纳",lead:"布置党狂喜，这个思路：",leadEn:"Home inspo — ",tail:"回家就能抄。",tailEn:"Steal it at home."},
  数码:{em:"📱",h:"#数码 #测评 #好物",lead:"数码党关注，这个动态：",leadEn:"Tech watch — ",tail:"按需入手不踩坑。",tailEn:"Buy smart."}
};

/* ============ 真实热点数据（2026-08-18 公开渠道） ============
 * 来源：抖音/小红书/视频号热榜 + 微博/百度热搜 + 公开报道（禁止编造，无精确热度标「在榜/声量飙升」）
 * channels: 实际走红的平台（综合=不在四平台专属榜、仅在聚合/媒体报道）
 * cats: 该热点天然相关的垂直分类
 * heatNum: 热度数值（万），无精确值则为 null
 * drafts: { 分类: { angle, cn, en } } 手工/优选候选推文（缺省则按分类模板生成）
 * 注：政治/社会负面/犯罪/家庭伦理/低俗八卦类热点（如刘慧被公诉、特朗普相关、高铁咸猪手、3孩非亲生、彭宇案、天安门悼念、青岛大学造谣、Jennie走光等）已按铁律不纳入。
 */

window.HOTSPOT_DATA = [
  // —— 美食（今日强相关，多平台共振）——
  {id:"F01",title:"榴莲价格彻底崩了（猫山王148→14.8元/公斤）",channels:[],cats:["美食","知识"],source:"微博热搜(约30万)/百度热搜",heat:"微博热搜在榜(热度约30万)",heatNum:30,
    summary:"猫山王榴莲从约148元/公斤跌至14.8元/公斤（跌幅超90%），泰国金枕约19.9元/斤、越南低至11元/斤，多方报道“价格彻底崩了”，“榴莲自由”来袭",
    hook:"榴莲自由来了？挑选+吃法教程",hookEn:"durian freedom? picking & eating",
    drafts:{美食:{angle:"“榴莲自由”来了？教挑肉厚甜榴莲+3种吃法（榴莲冻、榴莲千层、榴莲炖鸡）",
      cn:"榴莲价格“崩了”！猫山王从148跌到14.8一公斤，今年可能是最接近榴莲自由的一年🤯 教你怎么挑一个肉厚又甜的，附3种神仙吃法 #榴莲 #榴莲自由 #水果",
      en:"Durian prices in China are crashing — cat mountain king dropped from ~¥148 to ¥14.8 per kg. Is 'durian freedom' finally here? How to pick a sweet one + 3 ways to eat it. #durian"}}},
  {id:"F02",title:"开渔后第一顿海鲜有多鲜",channels:["抖音"],cats:["美食"],source:"抖音热点榜",heat:"抖音热榜第2(1138.9万)",heatNum:1139,
    summary:"南海/东海开渔后第一网海鲜上岸，“开渔后第一顿海鲜有多鲜”登抖音热榜第二(1138.9万)，梭子蟹、皮皮虾、黄鱼成抢手货",
    hook:"开渔最鲜海货+家常做法",hookEn:"the freshest catch + home recipes",
    drafts:{美食:{angle:"“开渔啦！最鲜的海货来了”海鲜挑选+3种家常做法（葱油梭子蟹、盐水皮皮虾、清蒸黄鱼）",
      cn:"开渔后第一顿海鲜到底有多鲜？刚上岸的梭子蟹、皮皮虾、小黄鱼，鲜到舌头掉下来🌊 今天教3道零失败家常做法，手慢无！ #开渔 #海鲜 #海鲜做法",
      en:"The first seafood after the fishing ban lifted — how fresh is too fresh? 3 fail-proof home recipes for crab, shrimp and yellow croaker. #seafood #fishingseason"}}},
  {id:"F03",title:"人类对鸡蛋的开发不足万分之一",channels:["抖音"],cats:["美食","知识"],source:"抖音热点榜",heat:"抖音热榜第4(1104.3万)",heatNum:1104,
    summary:"“人类对鸡蛋的开发不足万分之一”登抖音热榜第四(1104.3万)，引发鸡蛋创意吃法与营养讨论",
    hook:"一颗鸡蛋的100种吃法",hookEn:"100 ways with one egg",
    drafts:{美食:{angle:"“鸡蛋只用来炒番茄？”盘点被低估的鸡蛋神仙吃法（溏心蛋、云朵舒芙蕾、日式玉子烧）",
      cn:"热搜说“人类对鸡蛋的开发不足万分之一”？那你只拿它炒番茄就亏大了🥚 今天盘点8种被低估的神仙吃法，最后一个绝了 #鸡蛋 #美食教程 #鸡蛋的神仙吃法",
      en:"'Humans have only explored 1/10000 of what eggs can do' is trending. Here are 8 underrated egg recipes you've been missing. #egg #food"}}},
  {id:"F04",title:"泡面突然又行了（医生辟谣防腐剂）",channels:["抖音"],cats:["美食","知识"],source:"抖音热点榜/百度热搜",heat:"抖音热榜(650.1万)+百度热议",heatNum:650,
    summary:"抖音“医生：泡面不健康不是因为防腐剂”(650.1万)与百度“泡面突然又行了”共振，泡面口碑回暖，配料/吃法二创走热",
    hook:"泡面好吃不健康的真相",hookEn:"the truth about instant noodles",
    drafts:{美食:{angle:"“泡面不健康是因为防腐剂？医生辟谣”科普+升级吃法（加蛋加菜、非油炸）",
      cn:"医生说：泡面不健康真不是因为防腐剂！那到底为啥？今天扒一扒，再教你把泡面吃出营养感的3个搭配🍜 #泡面 #美食科普 #泡面吃法",
      en:"A doctor says instant noodles aren't unhealthy because of preservatives — so what's the real deal? Plus 3 ways to make them healthier. #instantnoodles #foodfacts"}}},
  {id:"F05",title:"3个小男孩“投资”的小店生意又好了",channels:["抖音"],cats:["美食","搞笑","知识"],source:"抖音热点榜",heat:"抖音热榜(435.7万)",heatNum:436,
    summary:"此前3个小男孩“投资”的小店因暖心故事走红，抖音再登热榜(435.7万)“生意又好了”，探店/公益向内容",
    hook:"小孩投资的店又火了",hookEn:"the kids' invested shop is back",
    drafts:{美食:{angle:"暖心探店向“3个小孩投资的小店复活了”，做温情+美食",
      cn:"还记得那3个小孩“投资”的小店吗？它又活过来了🥹 今天带你们去这家店，不止为了吃，更为了这份温柔 #探店 #暖心 #美食",
      en:"Remember the tiny shop 'invested' by 3 kids? It's thriving again. A warm visit — for the food and the story. #food #heartwarming"}}},
  {id:"F06",title:"胖东来闭店后员工安置与房东争议",channels:["抖音"],cats:["美食","情绪","知识"],source:"抖音热点榜/微博热搜",heat:"抖音热榜(588.2万)+微博(约12万)",heatNum:588,
    summary:"抖音“胖东来员工回应工资及闭店后安置”(588.2万)与微博“胖东来被房东逼走房东纳税了吗”(约12万)共振，胖东来闭店、员工安置与房东争议成焦点",
    hook:"一家店带活一条街的尽头",hookEn:"the end of a street-lifting store",caution:"可做“为什么胖东来的熟食火”中立拆解，勿拉踩房东/品牌",
    drafts:{美食:{angle:"“胖东来为啥闭店还能上热搜？”拆解其爆款熟食逻辑（月饼、红丝绒、大月饼）",
      cn:"胖东来休一天整条街都没人出摊？一家超市怎么把一条街带活又带走的。今天扒它家那些“排队王”熟食🥟 #胖东来 #超市美食 #探店",
      en:"When this beloved supermarket closes, the whole street goes quiet. A look at the deli items that built its cult following. #retail #foodculture"}}},
  {id:"F07",title:"《欢迎来龙餐馆》票房破十亿",channels:["抖音"],cats:["影视","美食"],source:"抖音热点榜",heat:"抖音热榜(915.7万)",heatNum:916,
    summary:"电影《欢迎来龙餐馆》票房突破十亿，美食+喜剧题材带动“餐馆/美食电影”讨论",
    hook:"美食电影里的馋人镜头",hookEn:"drool-worthy food-movie scenes",
    drafts:{美食:{angle:"“票房破十亿的美食电影”盘点片中最馋人的菜，顺势出教程",
      cn:"《欢迎来龙餐馆》票房破十亿！这部电影把多少人看饿了🍜 盘点片中最馋人的几道菜，附家常复刻 #美食电影 #欢迎来龙餐馆 #美食",
      en:"'Welcome to Dragon Restaurant' just crossed ¥1B. The food scenes made everyone hungry — here are the dishes to recreate. #foodmovie"}}},
  {id:"F08",title:"所长有人送来个大冰箱（微博热梗）",channels:[],cats:["搞笑","美食"],source:"微博热搜(08-18 02:04 主持人思禹发布)",heat:"微博热梗在榜",heatNum:null,
    summary:"8月18日凌晨微博热梗“所长有人送来个大冰箱”（主持人思禹发布）走红，所长系列玩梗持续发酵，美食/搞笑向",
    hook:"所长又整活了",hookEn:"the chief is at it again",caution:"玩梗轻量化，避免谐音涉政",
    drafts:{美食:{angle:"轻松玩梗向“所长收到的大冰箱”做美食开箱/冰箱食材挑战",
      cn:"所长又双叒整活了！“有人送来个大冰箱”是什么神仙梗😂 今天用这个梗做个冰箱食材大挑战 #梗 #搞笑 #美食",
      en:"The 'chief got sent a giant fridge' meme is blowing up — a fun fridge-challenge angle. #meme #funny"}}},

  // —— 影视 ——
  {id:"M02",title:"电影《牛来》票房逆袭（首日342元→预测1800万）",channels:["小红书"],cats:["影视"],source:"小红书(20万+笔记)/抖音(10亿播放)",heat:"小红书声量飙升/抖音10亿播放",heatNum:null,
    summary:"小成本电影《牛来》从上映首日342元票房逆袭，预测冲1800万；小红书20万+笔记、抖音相关播放破10亿，口碑驱动",
    hook:"票房逆袭的黑马",hookEn:"the box-office dark horse",
    drafts:{影视:{angle:"“首日342元到预测1800万”复盘《牛来》逆袭，做影视解读",
      cn:"一部电影首日只卖了342块，现在预测要冲1800万？《牛来》凭什么逆袭🔥 聊聊这部黑马 #电影牛来 #影视 #票房逆袭",
      en:"A film that opened with ¥342 is now projected at ¥18M. How 'Niu Lai' became the dark horse. #film #boxoffice"}}},
  {id:"M03",title:"蓝盈莹承认新恋情",channels:["抖音"],cats:["影视","情绪","美妆"],source:"抖音热点榜",heat:"抖音热榜(969.8万)",heatNum:970,
    summary:"蓝盈莹在节目中承认新恋情登抖音热榜(969.8万)，情感/明星话题升温",
    hook:"明星恋情里的情感课",hookEn:"the relationship talk from a star",
    drafts:{影视:{angle:"轻量情感向“从蓝盈莹承认恋情看独立女性”，不嚼八卦",
      cn:"蓝盈莹承认新恋情，评论区却在聊“她终于松弛了”。比起嗑糖，我更想聊这份松弛感💫 #蓝盈莹 #情感 #女性成长",
      en:"Lan Yingying confirmed a new relationship — but the comments talk about her new calm. A light note on self-assurance. #celebrity #growth"}}},
  {id:"M04",title:"童年动漫照见00后的青春底色",channels:["抖音"],cats:["影视","情绪"],source:"抖音热点榜",heat:"抖音热榜(935.2万)",heatNum:935,
    summary:"“童年动漫照见00后的青春底色”登抖音热榜(935.2万)，经典国漫情怀杀拉满",
    hook:"你的青春是哪部动漫",hookEn:"which anime was your youth",
    drafts:{影视:{angle:"情怀向“那些承包我们青春的国产动漫”，做回忆杀混剪",
      cn:"“童年动漫照见00后的青春底色”上热搜了。你的青春是哪一部？今天盘一盘那些年追过的国产动漫📺 #童年动漫 #回忆杀 #00后",
      en:"'Childhood anime mirrors Gen-Z's youth' is trending. Which show was YOUR youth? A nostalgia reel. #anime #nostalgia"}}},
  {id:"M05",title:"《我们的少年时代2》招新看我的",channels:["抖音"],cats:["影视","情绪"],source:"抖音热点榜",heat:"抖音热榜(904.3万)",heatNum:904,
    summary:"《我们的少年时代2》招新“看我的”登抖音热榜(904.3万)，青春剧续作引发期待",
    hook:"青春剧续作回来了",hookEn:"the youth drama sequel is back",
    drafts:{影视:{angle:"“青春剧续作招募”做IP情怀向，聊为什么我们爱青春片",
      cn:"《我们的少年时代2》招新“看我的”冲上热榜！谁的青春DNA动了⚾ #我们的少年时代 #青春剧 #回忆",
      en:"'Our Youth' season 2 is casting — who else feels the nostalgia? Why we love school dramas. #drama #youth"}}},

  // —— 音乐 ——
  {id:"S01",title:"“这是酷狗音乐吗”是什么梗",channels:["抖音"],cats:["音乐"],source:"抖音热点榜",heat:"抖音热榜(876.3万)",heatNum:876,
    summary:"“这是酷狗音乐吗”登抖音热榜(876.3万)，疑似音乐平台功能/界面玩梗或神曲二创",
    hook:"神曲还是bug？",hookEn:"a banger or a glitch?",
    drafts:{音乐:{angle:"轻松玩梗向“这是酷狗音乐吗”聊近期洗脑神曲",
      cn:"“这是酷狗音乐吗”是什么鬼梗？最近这些歌单真的上头🎵 盘点近期洗脑神曲，你中了几首 #神曲 #酷狗 #音乐",
      en:"'Is this KuGou Music?' meme explained — plus the earworm songs looping in your head. #music #meme"}}},

  // —— 情绪 ——
  {id:"E01",title:"10后给00后的一封信",channels:["抖音"],cats:["情绪","影视"],source:"抖音热点榜",heat:"抖音热榜(1046.6万)",heatNum:1047,
    summary:"“10后给00后的一封信”登抖音热榜(1046.6万)，代际对话戳中情绪共鸣",
    hook:"10后写给00后的真心话",hookEn:"a letter from Gen Alpha to Zoomers",
    drafts:{情绪:{angle:"情感向“当10后开始给00后写信”，做代际共情文案",
      cn:"“10后给00后的一封信”看哭了。原来在更小的他们眼里，我们也是这样长大的📩 #10后 #00后 #情感",
      en:"'A letter from Gen Alpha to Gen Z' is making people cry. A generational empathy piece. #emotion #generation"}}},
  {id:"E02",title:"并不是每个女孩都想变得很可爱",channels:["抖音"],cats:["情绪","穿搭"],source:"抖音热点榜",heat:"抖音热榜(862.9万)",heatNum:863,
    summary:"“并不是每个女孩都想变得很可爱”登抖音热榜(862.9万)，女性自我表达与多元审美讨论",
    hook:"可爱不是唯一审美",hookEn:"cute isn't the only aesthetic",
    drafts:{情绪:{angle:"情感向“女性不必都可爱”，做多元审美/自我接纳",
      cn:"“并不是每个女孩都想变得很可爱”破防了。温柔、酷飒、中性都可以，你不必活成一种模板💪 #女性成长 #多元审美 #情感",
      en:"'Not every girl wants to be cute' — a note on owning your own aesthetic. #selflove #feminism"}}},
  {id:"E03",title:"大家为啥不借钱了",channels:[],cats:["情绪","知识"],source:"百度热搜",heat:"百度热搜在榜",heatNum:null,
    summary:"百度热搜“大家为啥不借钱了”引发消费观/储蓄焦虑讨论，反映当下情绪底色",
    hook:"这届人为啥不爱借钱了",hookEn:"why we stopped borrowing",
    drafts:{情绪:{angle:"轻量洞察向“年轻人为什么不爱借钱了”，做情绪共鸣",
      cn:"“大家为啥不借钱了”上热搜。不是不想花，是更想踏实。聊聊这届人的消费清醒🧾 #消费观 #情绪 #年轻人",
      en:"'Why nobody wants to borrow anymore' is trending. A calm take on the new saving mindset. #money #mindset"}}},

  // —— 穿搭 ——
  {id:"T01",title:"早秋穿搭爆火（黑衬衫/棕色阔腿裤/长裙/马思纯）",channels:["小红书"],cats:["穿搭"],source:"小红书热榜",heat:"小红书早秋穿搭集体冲榜",heatNum:null,
    summary:"小红书早秋穿搭集体冲榜：黑色衬衫、棕色阔腿裤、入秋长裙替代短裙、马思纯初秋穿搭，早秋通勤松弛感成主流",
    hook:"早秋通勤穿搭公式",hookEn:"an early-autumn office formula",
    drafts:{穿搭:{angle:"“早秋这样穿才高级”黑色衬衫+棕色阔腿裤公式，附3套",
      cn:"入秋后短裙不兴了，今年早秋爆火的是这身：黑色衬衫+棕色阔腿裤，马思纯都在穿👗 3套照着搭不出错 #早秋穿搭 #棕色阔腿裤 #OOTD",
      en:"Short skirts out, long skirts in. This early-autumn fit (black shirt + brown wide-leg pants) is everywhere. 3 ways to wear it. #ootd #fallfashion"}}},
  {id:"T02",title:"七夕临近（2026-08-19 明日）",channels:[],cats:["情绪","穿搭"],source:"公开日历/去年快手热榜(1180万)预热",heat:"明日七夕，预热信号强",heatNum:null,
    summary:"七夕为2026年8月19日（明日），送礼/约会穿搭/情感内容蓄势；去年“下周三就七夕了”曾登快手热榜1180万，今年预热信号强",
    hook:"明日七夕送礼穿搭灵感",hookEn:"tomorrow's Qixi gift & fit ideas",
    drafts:{穿搭:{angle:"“明天就七夕了”约会穿搭+礼物清单（轻量不煽情）",
      cn:"明天就七夕了！还在愁穿什么去约会？3套温柔又出片的约会穿搭+礼物清单，照抄不出错💞 #七夕 #约会穿搭 #礼物",
      en:"Qixi is tomorrow! 3 date-night outfits + a low-key gift list. Copy-paste ready. #qixi #dating"}}},

  // —— 旅行 ——
  {id:"R01",title:"交换一张徒步背影照",channels:["抖音"],cats:["旅行","摄影"],source:"抖音热点榜",heat:"抖音热榜(928.7万)",heatNum:929,
    summary:"“交换一张徒步背影照”登抖音热榜(928.7万)，户外/徒步打卡与摄影共鸣",
    hook:"用一张背影开启徒步",hookEn:"start a hike with one photo",
    drafts:{旅行:{angle:"“交换一张徒步背影照”做户外打卡+出片机位",
      cn:"“交换一张徒步背影照”活动火了🥾 你最近一次徒步是哪里？分享3个超好出片的徒步机位 #徒步 #旅行 #户外",
      en:"'Swap a hiking photo' challenge is trending. Share your best trail shot + 3 photogenic spots. #hiking #travel"}}},
  {id:"R02",title:"视频号南极直播走热",channels:["视频号"],cats:["旅行","摄影"],source:"视频号",heat:"视频号在榜",heatNum:null,
    summary:"视频号南极直播内容走热，极地旅行/科普视角受关注",
    hook:"在视频号看南极",hookEn:"watching Antarctica live",
    drafts:{旅行:{angle:"“视频号能看南极直播了”做极地旅行种草/科普",
      cn:"没想到在视频号就能看南极直播了❄️ 这片白色大陆到底有多绝？今天种草一波人生清单 #南极 #旅行 #直播",
      en:"You can now watch Antarctica live on WeChat Channels. A bucket-list seed. #Antarctica #travel"}}},
  {id:"R03",title:"去班味小城/慢充旅行（持续热）",channels:["小红书"],cats:["旅行"],source:"小红书(话题曾破5亿)/去哪儿报告",heat:"暑期持续热",heatNum:null,
    summary:"“去班味小城”话题在小红书持续高热（此前浏览破5亿），反向旅行/小城慢游仍是暑期主流",
    hook:"避开人潮的小城清单",hookEn:"a list of crowd-free towns",
    drafts:{旅行:{angle:"“去班味小城”清单更新，3个冷门但出片的小城",
      cn:"“去班味小城”热度还在涨！不想人挤人？这3个冷门小城又出片又松弛🚆 #去班味 #小城旅行 #反向旅行",
      en:"'De-bureaucratize hometown' trips are still hot. 3 crowd-free, photogenic towns. #travel #slowtravel"}}},

  // —— 摄影 ——
  {id:"P01",title:"古诗词里的中国/赛里木湖/日照金山（持续热）",channels:["小红书"],cats:["摄影","旅行"],source:"小红书热榜",heat:"摄影内容持续冲榜",heatNum:null,
    summary:"小红书“耗时三年拍下古诗词里的中国”“赛里木湖”“日照金山”等摄影内容持续冲榜，出片打卡热",
    hook:"把诗词拍成实景",hookEn:"shoot poetry into reality",
    drafts:{摄影:{angle:"“古诗词里的中国怎么拍”3个出片机位+参数",
      cn:"有人用三年把“落霞与孤鹜齐飞”拍成了实景📷 古诗词里的中国到底怎么拍？3个机位+参数给你 #摄影 #古诗词 #出片",
      en:"Someone spent 3 years shooting China's classical poems as real scenes. 3 spots + settings to try. #photography"}}},

  // —— 知识 ——
  {id:"K01",title:"未来5年我国能源蓝图划重点",channels:["抖音"],cats:["知识"],source:"抖音热点榜/百度热搜(十五五油气规划)",heat:"抖音热榜(1115.3万)+百度",heatNum:1115,
    summary:"抖音“未来5年我国能源蓝图划重点”(1115.3万)与百度“石油天然气发展十五五规划印发”共振，能源/油气规划成焦点",
    hook:"5年能源蓝图一图看懂",hookEn:"the 5-year energy plan in one chart",caution:"政策类内容保持客观，不引申预测",
    drafts:{知识:{angle:"“一张图看懂未来5年能源蓝图”做科普拆解",
      cn:"未来5年能源蓝图划重点了！油气、新能源怎么变？一张图给你讲明白⚡ #能源 #十五五 #科普",
      en:"China's next-5-year energy blueprint is out. A one-chart explainer on oil, gas and renewables. #energy #policy"}}},
  {id:"K02",title:"1-7月全国铁路固定资产投资4406亿",channels:["抖音"],cats:["知识"],source:"抖音热点榜",heat:"抖音热榜(1184.5万)",heatNum:1184,
    summary:"“1-7月全国铁路固定资产投资4406亿”登抖音热榜(1184.5万)，基建数据引关注",
    hook:"4406亿砸向铁路意味着啥",hookEn:"what ¥440.6B in rail means",caution:"数据类，客观陈述不引申",
    drafts:{知识:{angle:"“4406亿铁路投资”做数据科普，聊出行变化",
      cn:"1-7月铁路投资4406亿，钱都花哪了？以后回家是不是更快了🚄 一分钟看懂 #铁路 #基建 #数据",
      en:"China invested ¥440.6B in rail Jan-Jul. Where's it going and what it means for travel. #rail #data"}}},
  {id:"K03",title:"公积金用途又变多",channels:[],cats:["知识"],source:"百度热搜",heat:"百度热搜在榜",heatNum:null,
    summary:"百度热搜“公积金用途又变多”，公积金使用范围扩容引关注",
    hook:"公积金还能这么用",hookEn:"new ways to use your housing fund",
    drafts:{知识:{angle:"“公积金用途又变多”做实用科普，列可提取场景",
      cn:"公积金用途又变多了？除了买房还能干啥，今天一次说清🏠 #公积金 #干货 #科普",
      en:"Your housing fund can now be used for more. A practical rundown of withdrawal scenarios. #housingfund #tips"}}},
  {id:"K04",title:"大批AI博主停更了",channels:[],cats:["数码","知识"],source:"微博热搜(57.8万)",heat:"微博热搜(约57.8万)",heatNum:null,
    summary:"微博“大批AI博主停更了”(约57.8万)引发AI内容泡沫/创作可持续讨论",
    hook:"AI博主为什么停更了",hookEn:"why AI creators are quitting",
    drafts:{数码:{angle:"“大批AI博主停更”做行业观察，聊AI内容可持续",
      cn:"“大批AI博主停更了”登上热搜。是泡沫破了，还是洗牌开始？聊聊AI创作的下一站🤖 #AI #创作 #观察",
      en:"'Many AI creators are quitting' is trending. Bubble or reshuffle? Thoughts on sustainable AI content. #ai #creator"}}},
  {id:"K05",title:"老板一句帮看下房他留守深山25年",channels:["抖音"],cats:["知识","情绪"],source:"抖音热点榜",heat:"抖音热榜(718.4万)",heatNum:718,
    summary:"“老板一句帮看下房他留守深山25年”登抖音热榜(718.4万)，坚守/信任故事引发讨论",
    hook:"一句托付守了25年",hookEn:"a 25-year promise kept",
    drafts:{知识:{angle:"正能量故事向“一句托付守25年”，做人物叙事",
      cn:"老板随口一句“帮我看下房”，他守了深山25年🌲 这个故事看完有点鼻酸 #正能量 #人物 #故事",
      en:"A boss casually asked him to 'watch the house' — he stayed 25 years. A moving story. #story #positive"}}},

  // —— 数码 ——
  {id:"D01",title:"宇树科技8月19日上市 + 超人机器人跳高2米",channels:["抖音"],cats:["数码"],source:"抖音热点榜",heat:"抖音热榜(1179.4万)+跳高梗(356.8万)",heatNum:1179,
    summary:"宇树科技将于8月19日上市登抖音热榜(1179.4万)，其“超人机器人原地跳高约2米”(356.8万)同步刷屏，机器人赛道高热",
    hook:"国产机器人要上市了",hookEn:"a Chinese robot firm goes public",caution:"财经类，做科普不荐股",
    drafts:{数码:{angle:"“宇树科技明日上市”科普机器人赛道+跳高机器人演示",
      cn:"宇树科技明天就要上市了！它家“超人机器人”原地跳高2米，国产机器人这次真的支棱起来了🤖 #宇树科技 #机器人 #科技",
      en:"Unitree lists tomorrow — and its 'superhuman' robot jumps 2m high. A look at China's robotics rise. #robotics #tech"}}},
  {id:"D02",title:"长鑫跌超3%",channels:["抖音"],cats:["数码","知识"],source:"抖音热点榜",heat:"抖音热榜(866.6万)",heatNum:867,
    summary:"“长鑫跌超3%”登抖音热榜(866.6万)，半导体龙头股价波动引关注",
    hook:"国产存储怎么了",hookEn:"what's up with domestic memory",caution:"股市内容仅科普不荐股",
    drafts:{数码:{angle:"“长鑫跌超3%”做半导体科普，不谈买卖",
      cn:"“长鑫跌超3%”冲上热榜。它是干嘛的？国产存储到底走到哪一步了💾 只科普不聊买卖 #长鑫 #半导体 #科普",
      en:"'ChangXin down 3%+' trending. What does this memory chip maker do, and where's domestic semis at? Explainer only. #semiconductor"}}},
  {id:"D03",title:"苹果首款折叠屏iPhone Ultra",channels:[],cats:["数码"],source:"IT热榜",heat:"IT热榜在榜",heatNum:null,
    summary:"消息称苹果首款折叠屏iPhone Ultra产能有限，首批优先供应美国，折叠屏热度延续",
    hook:"折叠屏值不值得等",hookEn:"is the foldable worth the wait",
    drafts:{数码:{angle:"“苹果折叠屏来了”做科普+值不值得等",
      cn:"苹果首款折叠屏iPhone Ultra要来了？产能有限首批给美国。折叠屏到底值不值得等📱 #苹果 #折叠屏 #数码",
      en:"Apple's first foldable iPhone Ultra is coming (limited supply). Worth the wait? #apple #foldable"}}},

  // —— 健身 ——
  {id:"G01",title:"中国U17女足6:0拜仁",channels:["抖音"],cats:["健身"],source:"抖音热点榜",heat:"抖音热榜(926.1万)",heatNum:926,
    summary:"“中国U17女足6:0拜仁”登抖音热榜(926.1万)，青少年足球刷屏",
    hook:"女足小将太猛了",hookEn:"the young women's team is on fire",
    drafts:{健身:{angle:"“U17女足6:0拜仁”做体育正能量+居家体能训练",
      cn:"中国U17女足6:0横扫拜仁！这批小将太猛了⚽ 顺便教你怎么在家练出同款体能 #女足 #健身 #体能",
      en:"China U17 women beat Bayern 6-0! Plus a home workout to build that stamina. #football #fitness"}}},
  {id:"G02",title:"中国男篮又输了对手仅集训5天",channels:[],cats:["健身"],source:"百度热搜",heat:"百度热搜在榜",heatNum:null,
    summary:"百度热搜“中国男篮又输了对手仅集训5天”，引发篮球情绪讨论",
    hook:"男篮输给集训5天的队",hookEn:"lost to a 5-day team",
    drafts:{健身:{angle:"“男篮又输了”做轻量体育情绪+篮球基础训练",
      cn:"“中国男篮又输了，对手只集训5天”上热搜。输球不丢人，但得复盘。附3个篮球基本功训练🏀 #男篮 #篮球 #健身",
      en:"'China lost to a team that trained 5 days' trending. A light sports take + 3 basketball drills. #basketball"}}},

  // —— 美妆 ——
  {id:"B01",title:"女子想烫大波浪结果烫成钢丝球",channels:[],cats:["美妆"],source:"微博热搜(约12.2万)",heat:"微博热搜在榜(约12.2万)",heatNum:null,
    summary:"“女子想烫大波浪结果烫成钢丝球”登微博热搜，烫发翻车成美妆避坑热点",
    hook:"烫发翻车避坑",hookEn:"perm fails to avoid",
    drafts:{美妆:{angle:"“烫发翻车”做避坑教程，列沟通话术+选杠技巧",
      cn:"女子想烫大波浪，结果烫成钢丝球😂 烫发翻车谁懂啊！今天教你怎么跟tony沟通不翻车 #烫发 #美妆避坑 #发型",
      en:"A woman wanted waves, got a scouring pad. Perm-fail avoidance: how to brief your stylist. #hairstyle #beauty"}}},

  // —— 萌宠（持续高频，低频监测）——
  {id:"Q01",title:"萌宠日常/文明养宠（持续高频）",channels:[],cats:["萌宠","情绪"],source:"抖音/小红书内容样本",heat:"持续高频",heatNum:null,
    summary:"萌宠内容在抖音/小红书持续高频，文明养宠、品种科普、日常整活成收藏点",
    hook:"今天也被主子治愈了",hookEn:"healed by the furbaby again",
    drafts:{萌宠:{angle:"“毛孩子日常”做轻松萌宠向，或文明养宠倡导",
      cn:"今天也被自家主子治愈了🐾 你们家毛孩子今天又整什么活了？评论区晒出来 #萌宠 #猫咪 #狗狗",
      en:"Healed by the furbaby again. Show us your pet's latest chaos. #pet #cat #dog"}}},

  // —— 搞笑 ——
  {id:"J01",title:"“胆子真是肥嘟嘟的啊”是什么梗",channels:["抖音"],cats:["搞笑"],source:"抖音热点榜",heat:"抖音热榜(853.3万)",heatNum:853,
    summary:"“胆子真是肥嘟嘟的啊”登抖音热榜(853.3万)，新梗催生二创/配音玩梗",
    hook:"新梗怎么玩",hookEn:"how to play the new meme",
    drafts:{搞笑:{angle:"“胆子真是肥嘟嘟的啊”梗科普+二创玩法",
      cn:"“胆子真是肥嘟嘟的啊”是什么鬼梗？今天手把手教你玩，评论区交作业的笑不活了😂 #梗 #搞笑 #二创",
      en:"'Bold little chubby one' — what meme is this and how to use it. #meme #funny"}}},
  {id:"J02",title:"红车误入婚车车队成主角",channels:["抖音"],cats:["搞笑","情绪"],source:"抖音热点榜",heat:"抖音热榜(1071.8万)",heatNum:1072,
    summary:"“红车误入婚车车队成主角”登抖音热榜(1071.8万)，乌龙喜事引发轻松热议",
    hook:"红车变婚车主角",hookEn:"the red car that crashed a wedding",
    drafts:{搞笑:{angle:"轻松玩梗向“红车误入婚车车队”，做喜事乌龙",
      cn:"一辆红车误入婚车车队，结果成了全场主角😂 这波乌龙喜事谁懂啊 #搞笑 #婚车 #乌龙",
      en:"A red car wandered into a wedding convoy and became the star. A wholesome mix-up. #funny #wedding"}}},
  {id:"J03",title:"小孩曾卓君CEO夺冠",channels:["抖音"],cats:["搞笑","知识"],source:"抖音热点榜",heat:"抖音热榜(928.4万)",heatNum:928,
    summary:"“小孩曾卓君CEO夺冠”登抖音热榜(928.4万)，电竞/少年天才话题轻松走热",
    hook:"小孩CEO夺冠名场面",hookEn:"the kid CEO's championship",
    drafts:{搞笑:{angle:"轻松向“小孩CEO夺冠”做少年天才/电竞梗",
      cn:"“小孩”曾卓君CEO夺冠名场面来了！这波少年天才谁不服😎 #电竞 #搞笑 #少年",
      en:"'Kid' Zeng Zhuoju wins CEO title — a genius teen moment. #esports #funny"}}},

  // —— 母婴（持续高频，低频监测）——
  {id:"Y01",title:"宝宝辅食（小红书高频）",channels:["小红书"],cats:["母婴"],source:"小红书内容样本",heat:"高频",heatNum:null,
    summary:"宝宝辅食内容在小红书高频出现，辅食工具、月龄清单、失败经验成收藏点",
    hook:"0-12月辅食清单",hookEn:"a 0-12mo weaning list",
    drafts:{母婴:{angle:"“0-12月辅食清单”做实用整理",
      cn:"新手爸妈收藏！0-12月宝宝辅食清单，按月龄安排不踩坑🍼 #辅食 #母婴 #育儿",
      en:"A 0-12 month baby-food list by age. Save it. #weaning #parenting"}}},

  // —— 家居（持续高频，低频监测）——
  {id:"H01",title:"装修避坑（小红书高频）",channels:["小红书"],cats:["家居"],source:"小红书内容样本",heat:"收藏高",heatNum:null,
    summary:"装修避坑内容在小红书收藏高，美缝、干湿分离、增项甲醛等成具体切口",
    hook:"装修增项避坑清单",hookEn:"a renovation pitfall list",
    drafts:{家居:{angle:"“装修增项避坑”做清单整理",
      cn:"装修最容易踩的坑都在这了！增项、美缝、干湿分离，收藏前先看完🏠 #装修 #家居 #避坑",
      en:"The renovation pitfalls to dodge — extras, tiling, wet/dry separation. Save before you build. #home #reno"}}}
];
