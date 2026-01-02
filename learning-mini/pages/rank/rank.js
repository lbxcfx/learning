// pages/rank/rank.js
const app = getApp();

// 模拟排行榜数据（实际应从云数据库获取）
const mockRankData = [
    { id: 1, name: '学霸小明', avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0', score: 2580, days: 45 },
    { id: 2, name: '英语达人', avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0', score: 2340, days: 38 },
    { id: 3, name: '努力的小花', avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0', score: 2100, days: 32 },
    { id: 4, name: '小小学习者', avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0', score: 1890, days: 28 },
    { id: 5, name: '进步飞快', avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0', score: 1650, days: 25 },
    { id: 6, name: '坚持不懈', avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0', score: 1420, days: 22 },
    { id: 7, name: '加油少年', avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0', score: 1200, days: 18 },
    { id: 8, name: '新手学员', avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0', score: 980, days: 15 },
    { id: 9, name: '初来乍到', avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0', score: 750, days: 12 },
    { id: 10, name: '小小新人', avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0', score: 500, days: 8 }
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

        this.calculateMyRank();
    },

    loadRankData() {
        // TODO: 从云数据库加载真实排行榜数据
        // 现在使用模拟数据
        this.setData({
            rankList: mockRankData
        });
    },

    calculateMyRank() {
        const myScore = app.globalData.score;
        let myRank = 1;

        for (const item of mockRankData) {
            if (item.score > myScore) {
                myRank++;
            }
        }

        this.setData({ myRank, myScore });
    },

    goLogin() {
        wx.switchTab({
            url: '/pages/index/index'
        });
    }
});
