// pages/rank/rank.js
const app = getApp();

// 模拟排行榜数据 (用于填充，营造氛围)
const mockRankData = [
    { id: 'mock1', name: '英语达人', avatar: '', score: 950, days: 15, isMock: true },
    { id: 'mock2', name: '学无止境', avatar: '', score: 880, days: 12, isMock: true },
    { id: 'mock3', name: '天天向上', avatar: '', score: 720, days: 8, isMock: true },
    { id: 'mock4', name: '单词小能手', avatar: '', score: 650, days: 5, isMock: true },
    { id: 'mock5', name: 'KeepLearning', avatar: '', score: 540, days: 4, isMock: true },
    { id: 'mock6', name: '追光者', avatar: '', score: 430, days: 3, isMock: true },
    { id: 'mock7', name: 'FutureStar', avatar: '', score: 320, days: 2, isMock: true },
];

Page({
    data: {
        userInfo: null,
        myScore: 0,
        myRank: 0,
        rankList: []
    },

    onLoad() {
        this.loadRankData();
    },

    onShow() {
        this.setData({
            userInfo: app.globalData.userInfo,
            myScore: app.globalData.score
        });

        // 每次显示都重新加载数据，确保获取最新排行
        this.loadRankData();
    },

    loadRankData() {
        wx.showLoading({ title: '加载排行榜' });

        console.log('📊 开始加载排行榜数据...');

        wx.cloud.callFunction({
            name: 'getRankings',
            success: res => {
                wx.hideLoading();
                console.log('📊 云函数返回结果:', res);

                if (res.result && res.result.success && res.result.data) {
                    const cloudData = res.result.data;
                    console.log('📊 云端用户数据数量:', cloudData.length);
                    console.log('📊 云端用户数据:', cloudData);

                    // 1. 处理真实云端数据
                    let realList = cloudData.map((item) => ({
                        id: item._id,
                        openid: item._openid,
                        name: item.userInfo ? item.userInfo.nickName : '神秘学员',
                        avatar: item.userInfo ? item.userInfo.avatarUrl : '/images/avatar_default.png',
                        score: item.score || 0,
                        days: item.streak || 1,
                        isMock: false,
                        isMe: item._openid === app.globalData.openid // 标记是否是自己
                    }));

                    // 2. 确保自己的最新数据在列表中（使用本地最新分数）
                    const myOpenId = app.globalData.openid;
                    if (myOpenId) {
                        const myIndex = realList.findIndex(item => item.openid === myOpenId);
                        const myLatestData = {
                            id: myIndex !== -1 ? realList[myIndex].id : 'my-local-id',
                            openid: myOpenId,
                            name: app.globalData.userInfo ? app.globalData.userInfo.nickName : '我',
                            avatar: app.globalData.userInfo ? app.globalData.userInfo.avatarUrl : '/images/avatar_default.png',
                            score: app.globalData.score, // 使用本地最新分数
                            days: app.globalData.streak || 1,
                            isMock: false,
                            isMe: true
                        };

                        if (myIndex !== -1) {
                            // 用本地最新分数更新
                            realList[myIndex] = myLatestData;
                        } else {
                            // 自己不在列表中，添加进去
                            realList.push(myLatestData);
                        }

                        console.log('📊 我的最新数据:', myLatestData);
                    }

                    // 3. 合并模拟数据（只有在真实用户少的时候才用于填充）
                    let combinedList = [...realList];

                    // 如果真实用户少于5个，添加一些模拟数据来丰富列表
                    if (realList.length < 5) {
                        combinedList = [...realList, ...mockRankData];
                    }

                    // 4. 按分数降序排序（分数高的在前面）
                    combinedList.sort((a, b) => {
                        // 首先按分数排序
                        if (b.score !== a.score) {
                            return b.score - a.score;
                        }
                        // 分数相同时，真实用户排在模拟用户前面
                        if (a.isMock !== b.isMock) {
                            return a.isMock ? 1 : -1;
                        }
                        return 0;
                    });

                    console.log('📊 排序后的列表:', combinedList.map(item => ({
                        name: item.name,
                        score: item.score,
                        isMe: item.isMe,
                        isMock: item.isMock
                    })));

                    // 5. 取前 50 名
                    combinedList = combinedList.slice(0, 50);

                    this.setData({ rankList: combinedList }, () => {
                        this.calculateMyRank();
                    });
                } else {
                    console.error('📊 云函数返回数据异常:', res.result);
                    // 失败时用模拟数据 + 自己
                    this.loadFallbackData();
                }
            },
            fail: err => {
                wx.hideLoading();
                console.error('❌ 调用云函数失败:', err);
                // 失败时用模拟数据 + 自己
                this.loadFallbackData();
            }
        });
    },

    // 加载备用数据（当云函数调用失败时）
    loadFallbackData() {
        let fallbackList = [...mockRankData];

        // 添加自己
        const myOpenId = app.globalData.openid;
        if (myOpenId || app.globalData.userInfo) {
            fallbackList.push({
                id: 'my-local-id',
                openid: myOpenId || 'local',
                name: app.globalData.userInfo ? app.globalData.userInfo.nickName : '我',
                avatar: app.globalData.userInfo ? app.globalData.userInfo.avatarUrl : '/images/avatar_default.png',
                score: app.globalData.score || 0,
                days: app.globalData.streak || 1,
                isMock: false,
                isMe: true
            });
        }

        // 排序
        fallbackList.sort((a, b) => b.score - a.score);

        this.setData({ rankList: fallbackList }, () => {
            this.calculateMyRank();
        });
    },

    calculateMyRank() {
        const myScore = app.globalData.score;
        const rankList = this.data.rankList || [];

        // 在排序后的列表中找到自己的索引
        let rankIndex = rankList.findIndex(item => item.isMe);

        let myRank;
        if (rankIndex !== -1) {
            myRank = rankIndex + 1;
        } else {
            // 如果列表里没找到自己，估算排名
            const betterCount = rankList.filter(item => item.score > myScore).length;
            myRank = betterCount + 1;
            if (myRank > 50) myRank = '50+';
        }

        console.log('📊 我的排名:', myRank, '我的分数:', myScore);
        this.setData({ myRank, myScore });
    },

    goLogin() {
        wx.switchTab({
            url: '/pages/index/index'
        });
    }
});
