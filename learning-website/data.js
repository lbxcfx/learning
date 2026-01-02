// 五年级英语学习数据
const learningData = {
  units: [
    {
      id: 1,
      title: "Eat Healthily",
      titleCn: "健康饮食",
      icon: "🍎",
      color: "#10b981",
      banner: "images/unit1_food_banner_1767280843711.png",
      vocabulary: [
        { id: "u1w1", english: "meat", chinese: "肉", soundmark: "/miːt/", image: "meat" },
        { id: "u1w2", english: "milk", chinese: "牛奶", soundmark: "/mɪlk/", image: "milk" },
        { id: "u1w3", english: "fruit", chinese: "水果", soundmark: "/fruːt/", image: "fruit" },
        { id: "u1w4", english: "vegetables", chinese: "蔬菜", soundmark: "/ˈvedʒtəblz/", image: "vegetables" },
        { id: "u1w5", english: "bread", chinese: "面包", soundmark: "/bred/", image: "bread" },
        { id: "u1w6", english: "egg", chinese: "鸡蛋", soundmark: "/eɡ/", image: "egg" },
        { id: "u1w7", english: "cake", chinese: "蛋糕", soundmark: "/keɪk/", image: "cake" },
        { id: "u1w8", english: "candy", chinese: "糖果", soundmark: "/ˈkændi/", image: "candy" },
        { id: "u1w9", english: "chip", chinese: "薯片", soundmark: "/tʃɪp/", image: "chip" },
        { id: "u1w10", english: "juice", chinese: "果汁", soundmark: "/dʒuːs/", image: "juice" },
        { id: "u1w11", english: "fish", chinese: "鱼", soundmark: "/fɪʃ/", image: "fish" },
        { id: "u1w12", english: "beef", chinese: "牛肉", soundmark: "/biːf/", image: "beef" },
        { id: "u1w13", english: "noodle", chinese: "面条", soundmark: "/ˈnuːdl/", image: "noodle" },
        { id: "u1w14", english: "soup", chinese: "汤", soundmark: "/suːp/", image: "soup" },
        { id: "u1w15", english: "chicken", chinese: "鸡肉", soundmark: "/ˈtʃɪkɪn/", image: "chicken" },
        { id: "u1w16", english: "apple", chinese: "苹果", soundmark: "/ˈæpl/", image: "apple" },
        { id: "u1w17", english: "potato", chinese: "土豆", soundmark: "/pəˈteɪtəʊ/", image: "potato" },
        { id: "u1w18", english: "chocolate", chinese: "巧克力", soundmark: "/ˈtʃɒklət/", image: "chocolate" },
        { id: "u1w19", english: "cola", chinese: "可乐", soundmark: "/ˈkəʊlə/", image: "cola" },
        { id: "u1w20", english: "biscuit", chinese: "饼干", soundmark: "/ˈbɪskɪt/", image: "biscuit" }
      ],
      sentences: [
        { english: "We should eat more vegetables.", chinese: "我们应该多吃蔬菜。" },
        { english: "Don't eat too much candy.", chinese: "不要吃太多糖果。" },
        { english: "Milk is good for your health.", chinese: "牛奶对你的健康有益。" },
        { english: "We should drink more water.", chinese: "我们应该多喝水。" },
        { english: "Don't eat too fast.", chinese: "不要吃太快。" }
      ],
      dialogues: [
        {
          scene: "在餐厅",
          context: "妈妈和小明在讨论今天吃什么",
          speakerA: "What should we eat for dinner?",
          options: [
            { text: "We should eat some vegetables and meat.", correct: true },
            { text: "I want to eat candy.", correct: false },
            { text: "Let's play games.", correct: false }
          ]
        },
        {
          scene: "在学校",
          context: "老师在教同学们健康饮食",
          speakerA: "Why should we eat fruit every day?",
          options: [
            { text: "Because it's colorful.", correct: false },
            { text: "Because fruit is good for our health.", correct: true },
            { text: "Because I like the taste.", correct: false }
          ]
        }
      ]
    },
    {
      id: 2,
      title: "A Green Life",
      titleCn: "绿色生活",
      icon: "🌱",
      color: "#22c55e",
      banner: "images/unit2_green_banner_1767280863892.png",
      vocabulary: [
        { id: "u2w1", english: "water", chinese: "水", soundmark: "/ˈwɔːtər/", image: "water" },
        { id: "u2w2", english: "bottle", chinese: "瓶子", soundmark: "/ˈbɒtl/", image: "bottle" },
        { id: "u2w3", english: "paper", chinese: "纸", soundmark: "/ˈpeɪpər/", image: "paper" },
        { id: "u2w4", english: "plastic", chinese: "塑料", soundmark: "/ˈplæstɪk/", image: "plastic" },
        { id: "u2w5", english: "earth", chinese: "地球", soundmark: "/ɜːθ/", image: "earth" },
        { id: "u2w6", english: "tree", chinese: "树", soundmark: "/triː/", image: "tree" },
        { id: "u2w7", english: "recycle", chinese: "回收", soundmark: "/riːˈsaɪkl/", image: "recycle" },
        { id: "u2w8", english: "clean", chinese: "干净的", soundmark: "/kliːn/", image: "clean" },
        { id: "u2w9", english: "waste", chinese: "浪费", soundmark: "/weɪst/", image: "waste" },
        { id: "u2w10", english: "protect", chinese: "保护", soundmark: "/prəˈtekt/", image: "protect" }
      ],
      sentences: [
        { english: "Please don't waste water.", chinese: "请不要浪费水。" },
        { english: "We can recycle old paper.", chinese: "我们可以回收旧纸。" },
        { english: "Let's protect the earth.", chinese: "让我们保护地球。" },
        { english: "Don't use too much plastic.", chinese: "不要使用太多塑料。" },
        { english: "We should plant more trees.", chinese: "我们应该种更多的树。" }
      ],
      dialogues: [
        {
          scene: "在公园",
          context: "小明看到有人乱扔垃圾",
          speakerA: "Look! Someone is throwing trash on the ground.",
          options: [
            { text: "We should pick it up and recycle it.", correct: true },
            { text: "That's okay, it doesn't matter.", correct: false },
            { text: "Let's go home.", correct: false }
          ]
        },
        {
          scene: "在家里",
          context: "妈妈发现小明在刷牙时没关水龙头",
          speakerA: "You should turn off the water when brushing your teeth.",
          options: [
            { text: "Sorry, I will save water from now on.", correct: true },
            { text: "But I like the sound of water.", correct: false },
            { text: "It's just a little water.", correct: false }
          ]
        }
      ]
    },
    {
      id: 3,
      title: "Happy Together",
      titleCn: "快乐相处",
      icon: "🤝",
      color: "#f59e0b",
      banner: "images/unit3_friendship_banner_1767280884242.png",
      vocabulary: [
        { id: "u3w1", english: "friend", chinese: "朋友", soundmark: "/frend/", image: "friend" },
        { id: "u3w2", english: "share", chinese: "分享", soundmark: "/ʃeər/", image: "share" },
        { id: "u3w3", english: "help", chinese: "帮助", soundmark: "/help/", image: "help" },
        { id: "u3w4", english: "happy", chinese: "快乐的", soundmark: "/ˈhæpi/", image: "happy" },
        { id: "u3w5", english: "kind", chinese: "友善的", soundmark: "/kaɪnd/", image: "kind" },
        { id: "u3w6", english: "nice", chinese: "好的", soundmark: "/naɪs/", image: "nice" },
        { id: "u3w7", english: "together", chinese: "一起", soundmark: "/təˈɡeðər/", image: "together" },
        { id: "u3w8", english: "play", chinese: "玩", soundmark: "/pleɪ/", image: "play" },
        { id: "u3w9", english: "listen", chinese: "听", soundmark: "/ˈlɪsn/", image: "listen" },
        { id: "u3w10", english: "respect", chinese: "尊重", soundmark: "/rɪˈspekt/", image: "respect" }
      ],
      sentences: [
        { english: "We often play together.", chinese: "我们经常一起玩。" },
        { english: "Good friends share with each other.", chinese: "好朋友互相分享。" },
        { english: "I like to help my friends.", chinese: "我喜欢帮助我的朋友。" },
        { english: "Be kind to everyone.", chinese: "对每个人都要友善。" },
        { english: "Listen to your friends.", chinese: "倾听你的朋友。" }
      ],
      dialogues: [
        {
          scene: "在教室",
          context: "小红忘记带铅笔了",
          speakerA: "Oh no, I forgot my pencil!",
          options: [
            { text: "Don't worry, I can share mine with you.", correct: true },
            { text: "That's too bad.", correct: false },
            { text: "You should remember next time.", correct: false }
          ]
        },
        {
          scene: "在操场",
          context: "新同学不知道怎么加入游戏",
          speakerA: "Can I play with you?",
          options: [
            { text: "Of course! Come and join us!", correct: true },
            { text: "No, we have enough players.", correct: false },
            { text: "Maybe later.", correct: false }
          ]
        }
      ]
    },
    {
      id: 4,
      title: "A Better Me",
      titleCn: "更好的我",
      icon: "⭐",
      color: "#8b5cf6",
      banner: "images/unit4_better_me_banner_1767280943575.png",
      vocabulary: [
        { id: "u4w1", english: "try", chinese: "尝试", soundmark: "/traɪ/", image: "try" },
        { id: "u4w2", english: "learn", chinese: "学习", soundmark: "/lɜːn/", image: "learn" },
        { id: "u4w3", english: "practice", chinese: "练习", soundmark: "/ˈpræktɪs/", image: "practice" },
        { id: "u4w4", english: "goal", chinese: "目标", soundmark: "/ɡəʊl/", image: "goal" },
        { id: "u4w5", english: "brave", chinese: "勇敢的", soundmark: "/breɪv/", image: "brave" },
        { id: "u4w6", english: "keep", chinese: "坚持", soundmark: "/kiːp/", image: "keep" },
        { id: "u4w7", english: "fail", chinese: "失败", soundmark: "/feɪl/", image: "fail" },
        { id: "u4w8", english: "success", chinese: "成功", soundmark: "/səkˈses/", image: "success" },
        { id: "u4w9", english: "dream", chinese: "梦想", soundmark: "/driːm/", image: "dream" },
        { id: "u4w10", english: "grow", chinese: "成长", soundmark: "/ɡrəʊ/", image: "grow" }
      ],
      sentences: [
        { english: "I'm going to learn swimming.", chinese: "我打算学游泳。" },
        { english: "Keep going, don't give up!", chinese: "继续加油，不要放弃！" },
        { english: "It's okay to fail.", chinese: "失败没关系。" },
        { english: "I want to be a better me.", chinese: "我想成为更好的自己。" },
        { english: "Practice makes perfect.", chinese: "熟能生巧。" }
      ],
      dialogues: [
        {
          scene: "在操场",
          context: "小明学骑自行车摔倒了",
          speakerA: "I fell down again. I can't do it!",
          options: [
            { text: "Keep trying! You can do it!", correct: true },
            { text: "Maybe you should stop.", correct: false },
            { text: "That's too hard for you.", correct: false }
          ]
        }
      ]
    },
    {
      id: 5,
      title: "Look Into the Future",
      titleCn: "展望未来",
      icon: "🚀",
      color: "#3b82f6",
      banner: "images/unit5_future_banner_1767280910855.png",
      vocabulary: [
        { id: "u5w1", english: "future", chinese: "未来", soundmark: "/ˈfjuːtʃər/", image: "future" },
        { id: "u5w2", english: "robot", chinese: "机器人", soundmark: "/ˈrəʊbɒt/", image: "robot" },
        { id: "u5w3", english: "travel", chinese: "旅行", soundmark: "/ˈtrævl/", image: "travel" },
        { id: "u5w4", english: "fly", chinese: "飞", soundmark: "/flaɪ/", image: "fly" },
        { id: "u5w5", english: "space", chinese: "太空", soundmark: "/speɪs/", image: "space" },
        { id: "u5w6", english: "car", chinese: "汽车", soundmark: "/kɑːr/", image: "car" },
        { id: "u5w7", english: "technology", chinese: "科技", soundmark: "/tekˈnɒlədʒi/", image: "technology" },
        { id: "u5w8", english: "smart", chinese: "聪明的", soundmark: "/smɑːt/", image: "smart" },
        { id: "u5w9", english: "live", chinese: "生活", soundmark: "/lɪv/", image: "live" },
        { id: "u5w10", english: "change", chinese: "改变", soundmark: "/tʃeɪndʒ/", image: "change" }
      ],
      sentences: [
        { english: "Will robots help us in the future?", chinese: "未来机器人会帮助我们吗？" },
        { english: "Yes, they will.", chinese: "是的，它们会的。" },
        { english: "We will travel to space.", chinese: "我们将去太空旅行。" },
        { english: "Cars will fly in the future.", chinese: "未来汽车会飞。" },
        { english: "The world will change a lot.", chinese: "世界将会改变很多。" }
      ],
      dialogues: [
        {
          scene: "在学校",
          context: "老师问同学们对未来的想象",
          speakerA: "What do you think the future will be like?",
          options: [
            { text: "I think robots will help us do homework!", correct: true },
            { text: "I don't know.", correct: false },
            { text: "The future is scary.", correct: false }
          ]
        }
      ]
    },
    {
      id: 6,
      title: "Festivals",
      titleCn: "节日庆典",
      icon: "🎊",
      color: "#e11d48",
      banner: "images/unit5_future_banner_1767280910855.png",
      vocabulary: [
        { id: "u6w1", english: "festival", chinese: "节日", soundmark: "/ˈfestɪvl/", image: "festival" },
        { id: "u6w2", english: "celebrate", chinese: "庆祝", soundmark: "/ˈselɪbreɪt/", image: "celebrate" },
        { id: "u6w3", english: "lantern", chinese: "灯笼", soundmark: "/ˈlæntən/", image: "lantern" },
        { id: "u6w4", english: "dragon", chinese: "龙", soundmark: "/ˈdræɡən/", image: "dragon" },
        { id: "u6w5", english: "mooncake", chinese: "月饼", soundmark: "/ˈmuːnkeɪk/", image: "mooncake" },
        { id: "u6w6", english: "firework", chinese: "烟花", soundmark: "/ˈfaɪəwɜːk/", image: "firework" },
        { id: "u6w7", english: "dumpling", chinese: "饺子", soundmark: "/ˈdʌmplɪŋ/", image: "dumpling" },
        { id: "u6w8", english: "wish", chinese: "祝愿", soundmark: "/wɪʃ/", image: "wish" },
        { id: "u6w9", english: "luck", chinese: "运气", soundmark: "/lʌk/", image: "luck" },
        { id: "u6w10", english: "gift", chinese: "礼物", soundmark: "/ɡɪft/", image: "gift" },
        { id: "u6w11", english: "party", chinese: "派对", soundmark: "/ˈpɑːti/", image: "party" },
        { id: "u6w12", english: "candle", chinese: "蜡烛", soundmark: "/ˈkændl/", image: "candle" }
      ],
      sentences: [
        { english: "How do you celebrate Spring Festival?", chinese: "你怎么庆祝春节？" },
        { english: "We eat dumplings and watch fireworks.", chinese: "我们吃饺子看烟花。" },
        { english: "I'm going to visit my grandparents.", chinese: "我打算去看望爷爷奶奶。" },
        { english: "Happy New Year!", chinese: "新年快乐！" },
        { english: "What do people do at Mid-Autumn Festival?", chinese: "人们在中秋节做什么？" },
        { english: "They eat mooncakes and watch the moon.", chinese: "他们吃月饼赏月。" }
      ],
      dialogues: [
        {
          scene: "在家里",
          context: "春节前夕，家人在准备过年",
          speakerA: "How are you going to celebrate Spring Festival?",
          options: [
            { text: "I'm going to eat dumplings and watch fireworks with my family.", correct: true },
            { text: "I will go to school.", correct: false },
            { text: "I don't like festivals.", correct: false }
          ]
        },
        {
          scene: "在学校",
          context: "老师在介绍不同的节日",
          speakerA: "What festival do you like best?",
          options: [
            { text: "I like Spring Festival best because we can get red packets!", correct: true },
            { text: "I don't know any festivals.", correct: false },
            { text: "Festivals are boring.", correct: false }
          ]
        }
      ]
    }
  ],

  // 鼓励语
  encouragements: [
    "太棒了！🎉",
    "真聪明！⭐",
    "你是最棒的！🏆",
    "继续加油！💪",
    "Perfect！🌟",
    "Excellent！👏",
    "Great job！🎯",
    "Well done！✨",
    "Amazing！🚀",
    "你真厉害！👍"
  ],

  // 错误提示
  errorMessages: [
    "再想想哦~",
    "加油，你可以的！",
    "别灰心，再试一次！",
    "差一点点，再来！",
    "没关系，继续努力！"
  ]
};

// 导出数据
if (typeof module !== 'undefined' && module.exports) {
  module.exports = learningData;
}
