// app.js
App({
    onLaunch() {
        // 初始化云开发
        if (wx.cloud) {
            wx.cloud.init({
                traceUser: true
            });
        }

        // 检查用户登录状态
        this.checkLogin();

        // 登录
        wx.login({
            success: res => {
                // 发送 res.code 到后台换取 openId, sessionKey, unionId
                console.log('wx.login success, code:', res.code);
            },
            fail: err => {
                console.error('wx.login failed:', err);
            }
        });
    },

    globalData: {
        userInfo: null,
        isLoggedIn: false,
        // 学习数据
        score: 0,
        coins: 0,
        streak: 0,
        learnedWords: [],
        mistakes: []
    },

    // 检查登录状态
    checkLogin() {
        const userInfo = wx.getStorageSync('userInfo');
        if (userInfo) {
            this.globalData.userInfo = userInfo;
            this.globalData.isLoggedIn = true;
        }

        // 加载学习数据
        this.loadLearningData();
    },

    // 加载学习数据
    loadLearningData() {
        const learningData = wx.getStorageSync('learningData');
        if (learningData) {
            this.globalData.score = learningData.score || 0;
            this.globalData.coins = learningData.coins || 0;
            this.globalData.streak = learningData.streak || 0;
            this.globalData.learnedWords = learningData.learnedWords || [];
            this.globalData.mistakes = learningData.mistakes || [];
        }
    },

    // 保存学习数据
    saveLearningData() {
        wx.setStorageSync('learningData', {
            score: this.globalData.score,
            coins: this.globalData.coins,
            streak: this.globalData.streak,
            learnedWords: this.globalData.learnedWords,
            mistakes: this.globalData.mistakes
        });
    },

    // 添加分数
    addScore(points) {
        this.globalData.score += points;
        this.saveLearningData();
    },

    // 添加金币
    addCoins(amount) {
        this.globalData.coins += amount;
        this.saveLearningData();
    }
});
