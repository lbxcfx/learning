// pages/index/index.js
const app = getApp();
const learningData = require('../../utils/data.js');

Page({
    data: {
        userInfo: null,
        coins: 0,
        score: 0,
        streak: 0,
        currentUnit: 1,
        currentUnitData: null,
        units: [],
        modes: [
            { key: 'vocab', icon: '📖', title: '单词卡片', desc: '翻卡学习核心词汇', color: '#6366f1' },
            { key: 'match', icon: '🖼️', title: '看图选词', desc: '看图片选择正确单词', color: '#f59e0b' },
            { key: 'oral', icon: '🎤', title: '口语练习', desc: '看中文说英文', color: '#10b981' },
            { key: 'sentence', icon: '🔀', title: '句子排序', desc: '将打乱的单词排成句子', color: '#8b5cf6' },
            { key: 'fill', icon: '📝', title: '填空选择', desc: '选词填空完成句子', color: '#ec4899' },
            { key: 'challenge', icon: '⏱️', title: '限时挑战', desc: '60秒内答对更多题目', color: '#ef4444' }
        ]
    },

    onLoad() {
        // 初始化单元数据
        const units = learningData.units.map(u => ({
            id: u.id,
            icon: u.icon
        }));

        this.setData({
            units: units,
            currentUnitData: learningData.units[0]
        });
    },

    onShow() {
        // 从全局获取数据
        this.setData({
            userInfo: app.globalData.userInfo,
            coins: app.globalData.coins,
            score: app.globalData.score,
            streak: app.globalData.streak
        });
    },

    // 微信登录 - 跳转到"我的"页面填写头像和昵称
    handleLogin() {
        wx.switchTab({
            url: '/pages/profile/profile'
        });
    },

    // 选择单元
    selectUnit(e) {
        const unitId = e.currentTarget.dataset.id;
        const unitData = learningData.units.find(u => u.id === unitId);

        this.setData({
            currentUnit: unitId,
            currentUnitData: unitData
        });
    },

    // 开始学习模式
    startMode(e) {
        const mode = e.currentTarget.dataset.mode;

        wx.navigateTo({
            url: `/pages/learn/learn?mode=${mode}&unit=${this.data.currentUnit}`
        });
    }
});
