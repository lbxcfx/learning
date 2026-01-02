// pages/profile/profile.js
const app = getApp();

Page({
    data: {
        userInfo: null,
        tempAvatarUrl: '',
        tempNickname: '',
        score: 0,
        coins: 0,
        learnedCount: 0,
        mistakesCount: 0,
        isNewVersion: true // 是否支持新版头像昵称API
    },

    onLoad() {
        // 检查SDK版本
        const isNew = this.checkVersion();
        this.setData({ isNewVersion: isNew });

        if (!isNew) {
            wx.showModal({
                title: '版本提示',
                content: '当前微信版本过低，部分功能可能无法正常使用，请升级微信',
                showCancel: false
            });
        }
    },

    onShow() {
        this.setData({
            userInfo: app.globalData.userInfo,
            score: app.globalData.score,
            coins: app.globalData.coins,
            learnedCount: app.globalData.learnedWords.length,
            mistakesCount: app.globalData.mistakes.length
        });
    },

    // 检查是否支持新版头像昵称API (需要基础库 2.21.2+)
    checkVersion() {
        const version = wx.getSystemInfoSync().SDKVersion;
        return this.compareVersion(version, "2.21.2") >= 0;
    },

    compareVersion(v1, v2) {
        v1 = v1.split(".");
        v2 = v2.split(".");
        const len = Math.max(v1.length, v2.length);
        while (v1.length < len) v1.push("0");
        while (v2.length < len) v2.push("0");
        for (let i = 0; i < len; i++) {
            const num1 = parseInt(v1[i]);
            const num2 = parseInt(v2[i]);
            if (num1 > num2) return 1;
            if (num1 < num2) return -1;
        }
        return 0;
    },

    onChooseAvatar(e) {
        const { avatarUrl } = e.detail;
        this.setData({
            tempAvatarUrl: avatarUrl
        });
    },

    onNicknameChange(e) {
        const nickname = e.detail.value;
        this.setData({
            tempNickname: nickname
        });
    },

    onNicknameInput(e) {
        // 实时获取输入值
        this.setData({
            tempNickname: e.detail.value
        });
    },

    submitLogin() {
        if (!this.data.tempAvatarUrl || !this.data.tempNickname) {
            wx.showToast({
                title: '请完善头像和昵称',
                icon: 'none'
            });
            return;
        }

        const userInfo = {
            avatarUrl: this.data.tempAvatarUrl,
            nickName: this.data.tempNickname
        };

        console.log('Submitting login with:', userInfo);

        // 获取登录凭证 code
        wx.login({
            success: res => {
                const code = res.code;
                console.log('Login successful, code:', code);
                // 这里可以发送 code 到后台
            }
        });

        app.globalData.userInfo = userInfo;
        app.globalData.isLoggedIn = true;
        wx.setStorageSync('userInfo', userInfo);

        this.setData({
            userInfo,
            tempAvatarUrl: '',
            tempNickname: ''
        });

        wx.showToast({
            title: '登录成功',
            icon: 'success'
        });
    },

    handleLogout() {
        wx.showModal({
            title: '确认退出',
            content: '退出登录后学习数据仍会保留',
            success: (res) => {
                if (res.confirm) {
                    app.globalData.userInfo = null;
                    app.globalData.isLoggedIn = false;
                    wx.removeStorageSync('userInfo');

                    this.setData({ userInfo: null });

                    wx.showToast({
                        title: '已退出登录',
                        icon: 'success'
                    });
                }
            }
        });
    },

    goToPage(e) {
        const page = e.currentTarget.dataset.page;

        wx.showToast({
            title: '功能开发中',
            icon: 'none'
        });

        // TODO: 跳转到对应页面
        // wx.navigateTo({
        //   url: `/pages/${page}/${page}`
        // });
    }
});
