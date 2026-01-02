// pages/rank/rank.js
const app = getApp();

// 模拟排行榜数据（实际应从云数据库获取）
const mockRankData = [
    { id: 1, name: '学霸小明', avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0', score: 950, days: 6 },
    { id: 2, name: '英语达人', avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0', score: 880, days: 6 },
    { id: 3, name: '努力的小花', avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0', score: 720, days: 5 },
    { id: 4, name: '小小学习者', avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0', score: 650, days: 5 },
    { id: 5, name: '进步飞快', avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0', score: 540, days: 4 },
    { id: 6, name: '坚持不懈', avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0', score: 430, days: 4 },
    { id: 7, name: '加油少年', avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0', score: 320, days: 3 },
    { id: 8, name: '新手学员', avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0', score: 210, days: 2 },
    { id: 9, name: '初来乍到', avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0', score: 150, days: 2 },
    { id: 10, name: '小小新人', avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0', score: 80, days: 1 }
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
