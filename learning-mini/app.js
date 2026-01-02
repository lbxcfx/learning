// app.js
App({
    onLaunch() {
        // 初始化云开发
        if (wx.cloud) {
            wx.cloud.init({
                env: 'cloud1-9gyx98pv7e7f0bed', // 需替换为真实云环境ID
                traceUser: true
            });
            this.db = wx.cloud.database();
            this.usersCollection = this.db.collection('users');
        }

        // 检查用户登录状态
        this.checkLogin();

        // 获取OpenID并尝试从云端拉取数据
        if (wx.cloud) {
            this.cloudLogin();
        }
    },

    globalData: {
        userInfo: null,
        isLoggedIn: false,
        openid: '',
        // 学习数据
        score: 0,
        coins: 0,
        streak: 1, // 默认为1天
        learnedWords: [],
        mistakes: []
    },

    // 检查本地登录状态
    checkLogin() {
        const userInfo = wx.getStorageSync('userInfo');
        if (userInfo) {
            this.globalData.userInfo = userInfo;
            this.globalData.isLoggedIn = true;
        }

        // 加载本地学习数据 (先显示本地，防止白屏，随后云端覆盖)
        this.loadLearningData();
    },

    cloudLogin() {
        console.log('☁️ attempting cloud login...');
        wx.cloud.callFunction({
            name: 'learninglogin',
            success: res => {
                console.log('✅ Cloud Login Raw Response:', res);
                console.log('✅ Cloud Login Result:', res.result);

                if (res.result && res.result.openid) {
                    this.globalData.openid = res.result.openid;
                    this.syncFromCloud();
                } else {
                    console.error('❌ Cloud Login Success but NO OPENID. Check cloud function return.', res.result);
                }
            },
            fail: err => {
                console.error('❌ Cloud login failed callback:', err);
                // 降级：只使用本地数据
            }
        });
    },

    // 从云端同步数据
    syncFromCloud() {
        if (!this.globalData.openid) return;

        this.usersCollection.where({
            _openid: this.globalData.openid
        }).get({
            success: res => {
                if (res.data.length > 0) {
                    const cloudData = res.data[0];
                    console.log('☁️ Cloud data loaded:', cloudData);

                    // 合并策略：
                    // 1. 数值类取最大值
                    this.globalData.score = Math.max(this.globalData.score, cloudData.score || 0);
                    this.globalData.coins = Math.max(this.globalData.coins, cloudData.coins || 0);

                    // 2. 数组类：如果云端有数据，以云端为准；如果云端为空但本地有，保留本地
                    if (cloudData.mistakes && cloudData.mistakes.length > 0) {
                        this.globalData.mistakes = cloudData.mistakes;
                    }
                    if (cloudData.learnedWords && cloudData.learnedWords.length > 0) {
                        this.globalData.learnedWords = cloudData.learnedWords;
                    }

                    // 3. 用户信息：云端有则覆盖，云端无则保留本地
                    if (cloudData.userInfo) {
                        this.globalData.userInfo = cloudData.userInfo;
                        wx.setStorageSync('userInfo', cloudData.userInfo);
                        this.globalData.isLoggedIn = true;
                    }

                    console.log('🔄 Data merged, saving to local...');
                    // 保存合并后的数据到本地
                    this.saveLearningData();
                } else {
                    // 新用户，上传初始数据
                    console.log('🆕 New user detected, creating cloud record...');
                    this.updateCloudData();
                }
            }
        });
    },

    // 加载本地学习数据
    loadLearningData() {
        const learningData = wx.getStorageSync('learningData');
        if (learningData) {
            this.globalData.score = learningData.score || 0;
            this.globalData.coins = learningData.coins || 0;
            this.globalData.streak = learningData.streak || 1;
            this.globalData.learnedWords = learningData.learnedWords || [];
            this.globalData.mistakes = learningData.mistakes || [];
        }
    },

    // 保存学习数据 (本地 + 云端)
    saveLearningData() {
        // 1. 本地保存
        wx.setStorageSync('learningData', {
            score: this.globalData.score,
            coins: this.globalData.coins,
            streak: this.globalData.streak,
            learnedWords: this.globalData.learnedWords,
            mistakes: this.globalData.mistakes
        });

        // 2. 云端保存 (防抖或实时)
        this.updateCloudData();
    },

    // 更新云端数据
    updateCloudData() {
        console.log('🚀 updateCloudData called');
        if (!wx.cloud) {
            console.warn('⚠️ Cloud update skipped: wx.cloud not available');
            return;
        }

        if (!this.globalData.openid) {
            console.warn('⚠️ Cloud update skipped: OpenID missing, attempting to login...');
            this.cloudLogin(); // 尝试重新获取 OpenID
            return;
        }

        const _ = this.db.command;
        let dataToUpdate = {
            score: this.globalData.score,
            coins: this.globalData.coins,
            mistakes: this.globalData.mistakes,
            learnedWords: this.globalData.learnedWords,
            updateTime: new Date()
        };

        // Special handling for userInfo to avoid "Cannot create field ... in ... null" error
        // We use _.set() to force replacement of the userInfo field instead of merging
        if (this.globalData.userInfo) {
            dataToUpdate.userInfo = _.set(this.globalData.userInfo);
        }

        console.log('📤 Uploading data:', dataToUpdate);

        // 查找并更新，如果不存在则创建
        // 由于没有 docId，先查询 (实际生产建议保存 docId 到 globalData)
        this.usersCollection.where({
            _openid: this.globalData.openid
        }).get({
            success: res => {
                if (res.data.length > 0) {
                    const docId = res.data[0]._id;
                    this.usersCollection.doc(docId).update({
                        data: dataToUpdate,
                        success: res => console.log('✅ Sync to Cloud Success (Update)', res),
                        fail: err => console.error('❌ Sync to Cloud Failed (Update)', err)
                    });
                } else {
                    // For create, we don't need _.set
                    // We need to revert the .set() wrapper for add() because add() doesn't support command operators like .set() usually?
                    // actually add() takes raw data.
                    // Let's reconstruct raw data for add
                    const rawData = { ...dataToUpdate };
                    if (this.globalData.userInfo) {
                        rawData.userInfo = this.globalData.userInfo;
                    }

                    this.usersCollection.add({
                        data: rawData,
                        success: res => console.log('✅ Sync to Cloud Success (Create)', res),
                        fail: err => console.error('❌ Sync to Cloud Failed (Create)', err)
                    });
                }
            },
            fail: err => {
                console.error('❌ Query user failed before update:', err);
            }
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
    },

    // 添加错题
    addMistake(word) {
        console.log('📝 addMistake called for:', word);
        // 避免重复添加
        const exists = this.globalData.mistakes.some(w => w.english === word.english);
        if (!exists) {
            this.globalData.mistakes.push(word);
            this.saveLearningData();
        } else {
            console.log('📝 Mistake already exists, skipping.');
        }
    }
});
