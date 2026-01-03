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

        wx.showLoading({ title: '正在登录...' });

        const handleLoginSuccess = (permanentAvatarUrl) => {
            const userInfo = {
                avatarUrl: permanentAvatarUrl,
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

            // 更新全局状态
            app.globalData.userInfo = userInfo;
            app.globalData.isLoggedIn = true;

            // 持久化存储
            wx.setStorageSync('userInfo', userInfo);

            // 保存并同步到云端
            app.saveLearningData();

            this.setData({
                userInfo,
                tempAvatarUrl: '',
                tempNickname: ''
            });

            wx.hideLoading();
            wx.showToast({
                title: '登录成功',
                icon: 'success'
            });
        };

        // 处理头像持久化 (如果是临时路径)
        const avatarUrl = this.data.tempAvatarUrl;
        const isTempFile = avatarUrl.includes('tmp') || avatarUrl.startsWith('wxfile');

        if (isTempFile) {
            if (wx.cloud) {
                // 有云开发：上传到云存储
                const cloudPath = 'avatars/' + Date.now() + '-' + Math.floor(Math.random() * 1000) + (avatarUrl.match(/\.[^.]+?$/)?.[0] || '.jpg');

                wx.cloud.uploadFile({
                    cloudPath: cloudPath,
                    filePath: avatarUrl,
                    success: res => {
                        console.log('✅ Upload success:', res.fileID);
                        handleLoginSuccess(res.fileID);
                    },
                    fail: err => {
                        console.error('❌ Upload failed:', err);
                        // 上传失败尝试降级为本地保存
                        this.saveAvatarLocally(avatarUrl, handleLoginSuccess);
                    }
                });
            } else {
                // 无云开发：保存到本地文件系统
                this.saveAvatarLocally(avatarUrl, handleLoginSuccess);
            }
        } else {
            // 已经是永久路径 (如 cloud:// 或 http://)
            handleLoginSuccess(avatarUrl);
        }
    },

    // 辅助方法：保存图片到本地
    saveAvatarLocally(tempFilePath, callback) {
        wx.getFileSystemManager().saveFile({
            tempFilePath: tempFilePath,
            success: res => {
                console.log('✅ Saved locally:', res.savedFilePath);
                callback(res.savedFilePath);
            },
            fail: err => {
                console.error('❌ Save local failed:', err);
                wx.hideLoading();
                wx.showToast({
                    title: '保存头像失败',
                    icon: 'none'
                });
                // 极端情况：直接使用临时路径（下次启动可能会挂）
                callback(tempFilePath);
            }
        });
    },

    handleLogout() {
        wx.showModal({
            title: '确认退出',
            content: '确定要退出登录吗？',
            success: (res) => {
                if (res.confirm) {
                    // 调用全局退出方法，清理数据
                    app.logout();

                    // 更新当前页面显示
                    this.setData({
                        userInfo: null,
                        score: 0,
                        coins: 0,
                        learnedCount: 0,
                        mistakesCount: 0
                    });

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

        if (page === 'settings' || page === 'about') {
            wx.showToast({
                title: '功能开发中',
                icon: 'none'
            });
            return;
        }

        wx.navigateTo({
            url: `/pages/${page}/${page}`
        });
    }
});
