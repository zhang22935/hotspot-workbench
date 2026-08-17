/* =========================================================================
 * 每日热点筛选 · 数据文件（由「每日热点筛选」自动化任务每日重写）
 * -------------------------------------------------------------------------
 * 本文件可被 index.html（前端展示）与 WorkBuddy 自动化任务（重写/降权）共用。
 * 字段说明见 README.md。请勿手写修改——交由自动化或运营导出覆盖。
 * ========================================================================= */

// 数据生成日期（展示用，自动化每日覆盖）
window.DATA_DATE = "2026-08-17";

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

/* ============ 真实热点数据（2026-08-17 公开渠道） ============
 * channels: 实际走红的平台（综合=不在四平台专属榜、仅在聚合/媒体报道）
 * cats: 该热点天然相关的垂直分类
 * heatNum: 热度数值（万），无精确值则为 null
 * drafts: { 分类: { angle, cn, en } } 手工/优选候选推文（缺省则按分类模板生成）
 */
window.HOTSPOT_DATA = [
  // —— 美食（含此前手工草稿）——
  {id:"C01",title:"立秋仪式感经济：茶饮团购涨24%、贴秋膘红烧肉涨75%",channels:["抖音","小红书"],cats:["美食","知识"],source:"中国日报/东方网、抖音生活服务",heat:"茶饮+24%、红烧肉+75%",heatNum:null,
    summary:"抖音生活服务数据：立秋前夕果汁茶饮团购同比+24%；红烧肉团购+75%、辣椒炒肉+53%、小炒黄牛肉+33%；“秋天的第一杯奶茶”成标配",
    hook:"用官方数据做「立秋吃什么」指南",hookEn:"official data for an autumn-eats guide",
    drafts:{美食:{angle:"强节点！出「立秋贴秋膘」红烧肉教程 + “秋天第一杯奶茶”情感向，用官方数据背书做「立秋吃什么」指南",
      cn:"数据说话：立秋这天红烧肉团购涨了75%！“秋天的第一杯奶茶”你也安排上了吗？今天教你一道入口即化的红烧肉，贴秋膘从这道菜开始🍖 #立秋 #贴秋膘 #红烧肉 #秋天的第一杯奶茶",
      en:"Data drop: braised pork group-buy sales jumped 75% around 'Start of Autumn' in China. The 'first cup of milk tea for autumn' is the new ritual. What's your autumn comfort food? #StartOfAutumn #comfortfood"}}},
  {id:"C02",title:"8月网红美食趋势（水泥麻辣烫/芋泥麻薯/地锅鸡/月饼内卷）",channels:["抖音","小红书"],cats:["美食"],source:"今日头条、网易",heat:"抖音/小红书声量飙升",heatNum:null,
    summary:"8月全网刷屏5款：水泥麻辣烫（黑芝麻酱乌黑汤底）、芋泥拉丝麻薯、贴秋膘红烧肉、无名地锅鸡、提前内卷月饼",
    hook:"做猎奇探店/试吃或大盘点",hookEn:"a tasting or round-up",
    drafts:{美食:{angle:"“8月爆款美食大盘点，你打卡了几个？”合集向；或对水泥麻辣烫做猎奇探店/试吃",
      cn:"8月刷屏的5款网红美食，第1个我直接看傻了——水泥色的麻辣烫你敢吃吗？🤎 芋泥拉丝麻薯、贴秋膘红烧肉…你打卡了几个？ #网红美食 #美食打卡 #水泥麻辣烫",
      en:"5 viral Chinese foods blowing up this August: 'cement' malatang, cheese-pull taro mochi, braised pork for 'autumn fat'... which would you try? #Chinesefood #foodtrend"}}},
  {id:"C03",title:"沪上阿姨玩梗命名陷争议（Zhen珠奶茶/爆打0檬茶）",channels:["抖音"],cats:["美食"],source:"九派娱乐、腾讯新闻",heat:"微博/抖音热搜在榜",heatNum:null,
    summary:"沪上阿姨多款饮品以“Zhen珠奶茶”“爆打0檬茶”谐音玩梗《我的前半生》登热搜；剧方与品牌均否认联名，小程序菜单已下架",
    hook:"做轻松向奶茶玩梗，避开发酵争议",hookEn:"a light-hearted pun-drink angle",
    drafts:{美食:{angle:"借势做「奶茶取名翻车/奶茶界玩梗大赛」轻松向，或「品牌玩梗边界」科普向；避开发酵争议，主打趣味",
      cn:"最近奶茶圈因为“玩梗”上热搜了——“Zhen珠奶茶”“爆打0檬茶”你喝过没？今天盘一盘那些让人社死的奶茶名字😂 #奶茶 #品牌玩梗 #沪上阿姨",
      en:"A milk tea brand is trending for pun-naming drinks after a hit drama — some call it clever, others cringe. Which pun drink name would you actually buy? #milktea #branding"}}},
  {id:"C04",title:"兰州拉面集体更名（地域品牌/商标规范）",channels:[],cats:["美食","知识"],source:"微博热搜",heat:"约32万",heatNum:32,
    summary:"兰州拉面集体更名引发地域品牌、商标规范与餐饮身份认同讨论；规范化不应一刀切改名，需给中小商户清晰路径",
    hook:"科普兰州牛肉面 vs 兰州拉面区别",hookEn:"a guide to Lanzhou noodle identity",
    drafts:{美食:{angle:"“你吃的‘兰州拉面’正宗吗？”科普兰州牛肉面 vs 兰州拉面区别；或探店正宗兰州牛肉面",
      cn:"热搜上的“兰州拉面集体更名”到底咋回事？其实你常吃的可能是“兰州拉面”，不是“兰州牛肉面”！一分钟讲清区别🍜 #兰州拉面 #美食科普 #牛肉面",
      en:"Why are Lanzhou noodle shops renaming themselves? A quick guide to the 'Lanzhou lamian vs beef noodle' identity debate. #Lanzhou #noodles #foodculture"}}},
  {id:"C05",title:"“漂亮饭”成现象级餐饮风口（高颜值/氛围感）",channels:["抖音","小红书"],cats:["美食"],source:"红餐网《中国餐饮发展报告2026》",heat:"08-17发布，声量飙升",heatNum:null,
    summary:"红餐网报告：高颜值、氛围感、仪式感“漂亮饭”持续升温，从西餐渗透至韩餐、云贵菜、江西菜、火锅、烤肉；抖音小红书话题声量飙升",
    hook:"做「在家做漂亮饭」教程向",hookEn:"a 'pretty meal at home' tutorial",
    drafts:{美食:{angle:"“什么叫漂亮饭？为什么年轻人愿为颜值买单？”盘点高颜值家常菜/摆盘；或「在家也能做漂亮饭」教程",
      cn:"最近超火的“漂亮饭”到底是啥？不是贵，是要“出片”！今天教你3道在家也能做的颜值菜，发朋友圈被问爆📸 #漂亮饭 #高颜值美食 #在家做饭",
      en:"'Pretty meals' are the new dining trend in China — less about price, more about the photo. 3 easy photogenic dishes you can make at home. #prettymeal #homecooking"}}},
  {id:"C06",title:"东南亚榴莲价格“崩了”",channels:[],cats:["美食"],source:"百度热搜",heat:"在榜",heatNum:null,
    summary:"东南亚榴莲价格大幅下跌（多方报道“价格崩了”），与丰收、出口变化相关，利好国内消费者",
    hook:"榴莲挑选/吃法教程",hookEn:"durian picking & eating tips",
    drafts:{美食:{angle:"“榴莲自由来了？”榴莲挑选/吃法教程；或“今年榴莲为什么这么便宜”科普",
      cn:"听说榴莲价格“崩了”？今年可能是最接近“榴莲自由”的一年！教你怎么挑一个肉厚又甜的榴莲🫛 #榴莲 #水果 #榴莲自由",
      en:"Durian prices in Southeast Asia are crashing — could this be the year of 'durian freedom'? Here's how to pick a perfectly sweet one. #durian #fruit"}}},
  {id:"C07",title:"南海开渔（伏季休渔8.16结束）",channels:["快手","抖音"],cats:["美食"],source:"百度百科热搜、快手热榜",heat:"08-16/17在榜",heatNum:null,
    summary:"8月16日12时，为期三个半月的南海伏季休渔期正式结束，渔船出海，新鲜海货上市",
    hook:"开渔最肥海货+做法时令向",hookEn:"the freshest catch of the season",
    drafts:{美食:{angle:"“开渔了！最鲜的海货来了”海鲜挑选/做法；或“休渔期结束，这几种鱼现在最肥”",
      cn:"南海开渔啦！三个月的等待，最鲜的海货今天上岸🌊 这几种鱼现在最肥最便宜，附3种家常做法，手慢无！ #开渔 #海鲜 #伏季休渔",
      en:"South China Sea fishing ban just lifted — the freshest catch of the year is here. These are the fish to grab right now. #seafood #fishingseason"}}},
  {id:"C09",title:"糖拌西红柿参赛给谢霆锋整不会了",channels:["抖音"],cats:["美食","搞笑"],source:"百度热搜",heat:"在榜（热）",heatNum:null,
    summary:"综艺中“糖拌西红柿”参赛作品让谢霆锋等评委困惑/整不会，相关话题登热搜，引发“家常菜参赛”讨论",
    hook:"做「3秒童年味道」反差萌向",hookEn:"a 3-second childhood snack",
    drafts:{美食:{angle:"轻松搞笑向“被糖拌西红柿整不会的何止谢霆锋”，做“全网最简单糖拌西红柿”反差萌",
      cn:"糖拌西红柿把谢霆锋整不会了？？这道“菜”我从小吃到大啊😂 今天挑战3秒搞定的童年味道，夏天必吃！ #糖拌西红柿 #夏日美食 #童年味道",
      en:"A plate of 'tomato with sugar' left a celebrity chef speechless on a cooking show. The ultimate 3-second summer snack from Chinese childhood. #simplesnack #summer"}}},
  {id:"C10",title:"好想来回应111.35元零食复称64.8元",channels:[],cats:["美食"],source:"百度热搜",heat:"在榜",heatNum:null,
    summary:"量贩零食店“好想来”被曝111.35元订单商家实收仅64.8元（称重/分装争议），品牌已回应",
    hook:"中立「称重避坑/捡漏攻略」",hookEn:"a neutral 'avoid the weight trap' guide",
    drafts:{美食:{angle:"偏争议/避坑向“买零食怎么不被称重刺客坑”；或“量贩零食店捡漏攻略”，保持中立不拉踩",
      cn:"买零食也能被“称重”背刺？最近量贩零食店这事儿闹得挺大。今天聊怎么买零食不被坑，顺手分享几个真正划算的逛吃攻略🛒 #零食 #避坑 #量贩零食",
      en:"Bulk snack stores are under fire for 'weighing' disputes. A quick guide to snacking smart and avoiding the 'weight trap'. #snacks #shoppingtips"}}},

  // —— 抖音 ——
  {id:"D01",title:"17日24时起国内油价上调",channels:["抖音"],cats:[],source:"抖音热点榜",heat:"1210.82万",heatNum:1210,summary:"国内成品油价格于8月17日24时起上调，登抖音热榜首位",hook:"",hookEn:""},
  {id:"D02",title:"当30年前的中专生写高考作文",channels:["抖音"],cats:["知识","情绪"],source:"抖音热点榜",heat:"1203.61万",heatNum:1203,summary:"一代人高考记忆被唤醒，引发代际共鸣与青春回忆讨论",hook:"一代人的青春记忆被唤醒",hookEn:"a generation's youth memory reawakened"},
  {id:"D03",title:"就业新风口来了",channels:["抖音"],cats:["知识","职场"],source:"抖音热点榜",heat:"1177.15万",heatNum:1177,summary:"新兴职业与就业趋势讨论走热，普通人机会成焦点",hook:"普通人也能抓住的新机会",hookEn:"new openings for ordinary people"},
  {id:"D04",title:"第一眼直觉点评穿搭",channels:["抖音"],cats:["穿搭"],source:"抖音热点榜",heat:"1170.22万",heatNum:1170,summary:"“第一眼直觉点评穿搭”挑战走红，用户晒穿搭求点评",hook:"一眼看穿你的穿搭风格",hookEn:"rate your fit at a glance"},
  {id:"D05",title:"复刻煎蟹女王翡翠炒蟹肉",channels:["抖音"],cats:["美食"],source:"抖音热点榜",heat:"1048.49万",heatNum:1048,summary:"美食博主复刻高端蟹料理“翡翠炒蟹肉”走红，引发在家复刻潮",hook:"在家复刻餐厅级蟹肉",hookEn:"recreate restaurant-grade crab at home"},
  {id:"D06",title:"慢充才是旅行最佳打开方式",channels:["抖音"],cats:["旅行","情绪"],source:"抖音热点榜",heat:"1038.94万",heatNum:1038,summary:"“慢充式旅行”理念走红，反对高强度赶路、主张松弛回血",hook:"把节奏慢下来才叫旅行",hookEn:"slow down — that's travel"},
  {id:"D07",title:"餐桌上的东方美学有多绝",channels:["抖音"],cats:["美食","摄影"],source:"抖音热点榜",heat:"926.92万",heatNum:926,summary:"中式餐桌美学内容走红，一桌饭也能拍出高级感",hook:"一桌饭也能拍出高级感",hookEn:"a meal can look high-end"},
  {id:"D08",title:"好不好给我个拥抱",channels:["抖音"],cats:["情绪","音乐"],source:"抖音热点榜",heat:"921.06万",heatNum:921,summary:"情感向音乐/文案“好不好给我个拥抱”走红，戳中情绪共鸣",hook:"一句歌词戳中泪点",hookEn:"a lyric that hits the heart"},
  {id:"D09",title:"人生要多一些支点",channels:["抖音"],cats:["情绪","知识"],source:"抖音热点榜",heat:"891.51万",heatNum:891,summary:"“人生要多一些支点”哲思文案爆火，呼吁稳住内核",hook:"稳住内核的清醒宣言",hookEn:"a calm manifesto for inner stability"},
  {id:"D10",title:"把千年古画端上桌",channels:["抖音"],cats:["美食","摄影","知识"],source:"抖音热点榜",heat:"872.42万",heatNum:872,summary:"把古画里的美食复原上桌的内容走红，文物美食二创升温",hook:"把文物里的美食做出来",hookEn:"cook the food from ancient paintings"},
  {id:"D11",title:"DeepSeek API峰谷定价8.17生效",channels:["抖音"],cats:["数码","知识"],source:"抖音/知乎热榜",heat:"在榜",heatNum:null,summary:"DeepSeek V4全系列上线，API采用峰谷定价，8月17日0时生效",hook:"AI成本账这样算才懂",hookEn:"make sense of AI cost"},
  {id:"Z06",title:"熊出没给00后的一封信",channels:["抖音"],cats:["影视","搞笑"],source:"抖音热榜",heat:"1529.7万",heatNum:1529,summary:"“熊出没给00后的一封信”情怀向内容刷屏，童年IP引发回忆杀",hook:"童年IP的催泪信",hookEn:"a tear-jerking letter from a childhood IP"},

  // —— 小红书 ——
  {id:"X01",title:"耗时三年拍下古诗词里的中国",channels:["小红书"],cats:["摄影","旅行","知识"],source:"小红书热榜",heat:"911万",heatNum:911,summary:"博主用三年把“落霞与孤鹜齐飞”等诗词还原成实景，评论区直呼“语文课本没骗我”",hook:"语文课本里的中国活了",hookEn:"the China from textbooks, alive"},
  {id:"X02",title:"原来古诗词里的河南真的存在",channels:["小红书"],cats:["旅行","知识"],source:"小红书热榜",heat:"805万",heatNum:805,summary:"从嵩山到黄河，诗词里的中原意象在河南都能找到实景，文化自信拉满",hook:"去河南赴一场诗词之约",hookEn:"a poetic date with Henan"},
  {id:"X03",title:"你可以永远相信赛里木湖",channels:["小红书"],cats:["旅行","摄影"],source:"小红书热榜",heat:"849万",heatNum:849,summary:"“大西洋最后一滴眼泪”赛里木湖蓝得不像真实世界，暑期自驾热度暴涨",hook:"此生必去的蓝",hookEn:"the blue you must see"},
  {id:"X04",title:"定格日照金山",channels:["小红书"],cats:["摄影"],source:"小红书热榜",heat:"858万",heatNum:858,summary:"自然摄影集体冲榜，“定格日照金山”成出片打卡热点",hook:"日照金山的拍摄时机",hookEn:"catch the golden light"},
  {id:"X05",title:"我拍到了海鸥雨",channels:["小红书"],cats:["摄影"],source:"小红书热榜",heat:"887万",heatNum:887,summary:"城市自然摄影“我拍到了海鸥雨”走红，捕捉日常里的小惊喜",hook:"在城市里捕捉自然瞬间",hookEn:"capture nature in the city"},
  {id:"X06",title:"洱海的丁达尔效应",channels:["小红书"],cats:["摄影","旅行"],source:"小红书热榜",heat:"698万",heatNum:698,summary:"“洱海的丁达尔效应”光影摄影内容热门，追光成为旅行仪式",hook:"追一束丁达尔光",hookEn:"chase a beam of light"},
  {id:"X07",title:"我的家庭旅行更像是打副本",channels:["小红书"],cats:["旅行","情绪"],source:"小红书热榜",heat:"816万",heatNum:816,summary:"“规划行程是接任务、孩子闹脾气是BOSS战”比喻引发同款爸妈共鸣",hook:"带娃出游像打怪升级",hookEn:"family trips feel like a game"},
  {id:"X08",title:"奶香爆米花馒头",channels:["小红书"],cats:["美食"],source:"小红书热榜",heat:"声量上涨",heatNum:null,summary:"手工美食“奶香爆米花馒头”在小红书上涨，家常面食受捧",hook:"一口爆米花香的家常馒头",hookEn:"a popcorn-scented homemade bun"},
  {id:"X09",title:"去班味小城话题量破5亿",channels:["小红书"],cats:["旅行"],source:"小红书/去哪儿《2026暑期旅行趋势报告》",heat:"5.6亿浏览",heatNum:null,summary:"“去班味小城”话题浏览量达5.6亿，“假期反向旅行”搜索同比增长287%",hook:"避开人潮的小城清单",hookEn:"a list of crowd-free towns"},
  {id:"X10",title:"早秋穿搭（梨形/通勤松弛感）",channels:["小红书"],cats:["穿搭"],source:"小红书热榜(8.12)",heat:"收藏信号强",heatNum:null,summary:"早秋穿搭搜索飙升，梨形身材、牛仔外套、通勤松弛感成高频形态",hook:"早秋通勤穿搭公式",hookEn:"an early-autumn office formula"},
  {id:"X11",title:"休息焦虑/靠辞职休息",channels:["小红书"],cats:["情绪","职场"],source:"小红书热议",heat:"持续热议",heatNum:null,summary:"“中国人只能靠辞职来休息”引发共鸣，反映休息需理由的时间焦虑",hook:"当代人的休息 guilt",hookEn:"the guilt of resting"},
  {id:"X12",title:"中式审美霸榜（暑期旅行）",channels:["小红书","视频号"],cats:["摄影","旅行"],source:"小红书/视频号热榜",heat:"700-900万",heatNum:800,summary:"“中式审美+暑期旅行”双霸榜，古诗词实景、赛里木湖、日照金山等集体冲榜",hook:"把东方美学拍进旅途",hookEn:"shoot Eastern aesthetics into your trip"},
  {id:"Z03",title:"宝宝辅食（小红书高频）",channels:["小红书"],cats:["母婴"],source:"小红书内容样本",heat:"高频",heatNum:null,summary:"宝宝辅食内容在小红书高频出现，辅食工具、月龄清单、失败经验成收藏点",hook:"0-12月辅食清单",hookEn:"a 0-12mo weaning list"},
  {id:"Z04",title:"装修避坑（小红书高频）",channels:["小红书"],cats:["家居"],source:"小红书内容样本",heat:"收藏高",heatNum:null,summary:"装修避坑内容收藏高，美缝、干湿分离、增项甲醛等成具体切口",hook:"装修增项避坑清单",hookEn:"a renovation pitfall list"},
  {id:"Z05",title:"健身打卡/刷脂期（小红书）",channels:["小红书"],cats:["健身"],source:"小红书内容样本",heat:"持续热",heatNum:null,summary:"健身打卡、刷脂期、有氧40分钟等内容持续热门，连续追更特征明显",hook:"刷脂期训练计划",hookEn:"a fat-burning plan"},

  // —— 快手 ——
  {id:"K01",title:"白海豚走了 梭子蟹来了",channels:["快手"],cats:["美食"],source:"快手热榜",heat:"1157.3万",heatNum:1157,summary:"开渔季梭子蟹上市，“白海豚走了梭子蟹来了”成快手热门梗",hook:"第一波梭子蟹怎么吃",hookEn:"how to eat the first crabs"},
  {id:"K02",title:"胖东来许昌老店关闭周边商户发声",channels:["快手","抖音"],cats:["美食","情绪"],source:"快手/抖音热榜",heat:"约1021万",heatNum:1021,summary:"胖东来许昌老店年底关闭，周边商户称“超市赚钱房东才涨租”，引发情怀讨论",hook:"一家店带活一条街",hookEn:"one store lit up a whole street",
    drafts:{美食:{angle:"“为什么胖东来的熟食那么火？”拆解爆款逻辑；或“被胖东来带火的几款吃的”",
      cn:"胖东来休一天，整条街都没人出摊了？一家超市怎么把一条街带活了。今天扒一扒它家那些“排队王”熟食🥟 #胖东来 #超市美食 #探店",
      en:"When this beloved supermarket closed for a day, the whole street went quiet. A look at the 'queued-up' deli items that built its cult following. #retail #foodculture"}}},
  {id:"K03",title:"卫龙辣条不好卖了",channels:["快手"],cats:["美食"],source:"快手热榜",heat:"1024.4万",heatNum:1024,summary:"国民辣条品牌销量下滑引讨论，被解读为消费偏好变化信号",hook:"国民辣条怎么了",hookEn:"what happened to the classic snack",caution:"可做中立科普，勿拉踩单一品牌"},
  {id:"K04",title:"南海开渔季渔民大哥广普喊话",channels:["快手"],cats:["美食"],source:"快手热榜",heat:"1006.2万",heatNum:1006,summary:"南海开渔季渔民喊话走红，新鲜海货上市成快手美食热点",hook:"开渔第一网海鲜",hookEn:"the first catch of the season"},
  {id:"K05",title:"下周三就七夕了",channels:["快手"],cats:["情绪","穿搭"],source:"快手热榜",heat:"1180.2万",heatNum:1180,summary:"七夕临近，“下周三就七夕了”成热门，送礼/穿搭/情感内容蓄势",hook:"七夕送礼穿搭灵感",hookEn:"Qixi gift & fit ideas"},
  {id:"K06",title:"跟着盗墓笔记去旅行",channels:["快手"],cats:["旅行"],source:"快手热榜",heat:"1166.1万",heatNum:1166,summary:"“跟着盗墓笔记去旅行”IP引流文旅热，取景地打卡升温",hook:"打卡盗笔取景地",hookEn:"visit the filming spots"},
  {id:"K07",title:"TMEA音乐盛典红毯",channels:["快手"],cats:["音乐"],source:"快手热榜",heat:"1122.9万",heatNum:1122,summary:"TMEA音乐盛典红毯引发造型热议，名场面频出",hook:"红毯造型名场面",hookEn:"red carpet moments"},

  // —— 视频号 ——
  {id:"V01",title:"视频号818农货专场GMV破2.1亿",channels:["视频号"],cats:["美食","知识"],source:"视频号电商/微博",heat:"2.1亿GMV",heatNum:null,summary:"8月10日视频号818农货专场，农货直播开播量环比增50%，GMV破2.1亿",hook:"助农好物清单",hookEn:"a list of farm-fresh picks"},
  {id:"V02",title:"脱友3视频号爆款（亲情/成长）",channels:["视频号"],cats:["搞笑","情绪","影视"],source:"视频号/网易",heat:"21条10万赞",heatNum:null,summary:"《脱口秀和Ta的朋友们3》在视频号引爆，亲情/成长生活流段子引发强共鸣",hook:"那些戳心的生活流段子",hookEn:"those heart-tugging stand-up bits"},
  {id:"V03",title:"视频号美妆护肤成交5.7亿",channels:["视频号"],cats:["美妆","知识"],source:"视频号/青眼情报",heat:"5.7亿",heatNum:null,summary:"7月视频号美妆护肤总成交额5.7亿，面部护肤占83%，功效国货领跑",hook:"功效国货值得跟",hookEn:"performing local brands worth watching"},
  {id:"V04",title:"新手跟妆/防晒实测（视频号美妆周榜）",channels:["视频号"],cats:["美妆"],source:"视频号美妆周榜",heat:"周榜热",heatNum:null,summary:"新手跟妆、防晒横测、成人痘解释类内容在视频号美妆榜表现突出",hook:"新手跟妆避坑",hookEn:"beginner makeup, pitfall-free"},

  // —— 综合/媒体报道（仅综合渠道显示）——
  {id:"Z01",title:"朴朴超市配送员虐猫被辞退",channels:[],cats:["萌宠","情绪"],source:"九派新闻",heat:"在榜",heatNum:null,summary:"广州一朴朴超市配送员踢踹踩踏猫被拍，平台辞退，引发文明养宠公愤",hook:"文明养宠警示",hookEn:"a reminder on pet kindness",caution:"可做文明养宠倡导，避免二次传播暴力画面"},
  {id:"Z02",title:"水亦诗“当妈后弄丢自己”",channels:[],cats:["母婴","情绪"],source:"腾讯/雪融情绪地图",heat:"上热搜",heatNum:null,summary:"水亦诗谈“成为妈妈后把自己弄丢了”引发母职与自我认同讨论",hook:"当妈后如何找回自己",hookEn:"how moms find themselves again"},
  {id:"Z07",title:"电影《八仙！》票房破15亿",channels:[],cats:["影视"],source:"票房榜",heat:"15亿",heatNum:null,summary:"电影《八仙！》上映27天总票房突破15亿，进入国产动画票房榜前七",hook:"国漫又出爆款",hookEn:"another domestic animation hit"},
  {id:"Z08",title:"长鑫科技成中国市值最高上市公司",channels:[],cats:["数码","知识"],source:"IT热榜",heat:"在榜",heatNum:null,summary:"长鑫科技市值登顶，半导体国产化受关注",hook:"国产芯片里程碑",hookEn:"a domestic chip milestone"},
  {id:"Z09",title:"苹果首款折叠屏iPhone Ultra",channels:[],cats:["数码"],source:"IT热榜",heat:"在榜",heatNum:null,summary:"消息称苹果首款折叠屏iPhone Ultra产能有限，首批货源优先供应美国",hook:"折叠屏值不值得等",hookEn:"is the foldable worth the wait"}
];
