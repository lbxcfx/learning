const app = getApp();
const sha256 = require('../../utils/sha256_v2.js').sha256;

// Reusing TTS Logic (simplified version of learn.js logic)
const YOUDAO_TTS_CONFIG = {
    APP_KEY: '1a88c11a7e8767f3',
    APP_SECRET: 'jnAEoemgbmkIl5dzdmWlsPeItwiFa2n2',
    URL: 'https://openapi.youdao.com/ttsapi'
};

Page({
    data: {
        mistakes: []
    },

    onShow() {
        this.setData({
            mistakes: app.globalData.mistakes || []
        });
    },

    playSound(e) {
        const text = e.currentTarget.dataset.word;
        this.playAudioText(text);
    },

    removeMistake(e) {
        const index = e.currentTarget.dataset.index;
        const mistakes = this.data.mistakes;
        const removedItem = mistakes.splice(index, 1)[0];

        this.setData({ mistakes });

        // Update global and cloud
        app.globalData.mistakes = mistakes;

        // Call app.js method to sync (which we will add)
        if (app.updateCloudData) {
            app.updateCloudData();
        } else {
            app.saveLearningData(); // Fallback to local
        }

        wx.showToast({
            title: '已移除',
            icon: 'success'
        });
    },

    goLearn() {
        wx.switchTab({
            url: '/pages/learn/learn',
        });
    },

    // Audio playback (duplicated for independence, ideally refactored to util)
    playAudioText(text) {
        if (!text) return;
        const curtime = Math.floor(Date.now() / 1000).toString();
        const salt = Date.now().toString();
        let input = text;
        if (text.length > 20) {
            input = text.substring(0, 10) + text.length + text.substring(text.length - 10, text.length);
        }
        const signStr = YOUDAO_TTS_CONFIG.APP_KEY + input + salt + curtime + YOUDAO_TTS_CONFIG.APP_SECRET;
        const sign = sha256(signStr);

        wx.request({
            url: YOUDAO_TTS_CONFIG.URL,
            method: 'POST',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            data: {
                q: text,
                langType: 'en',
                appKey: YOUDAO_TTS_CONFIG.APP_KEY,
                salt: salt,
                curtime: curtime,
                sign: sign,
                signType: 'v3'
            },
            responseType: 'arraybuffer',
            success: (res) => {
                if (res.statusCode === 200) {
                    const contentType = res.header['Content-Type'] || res.header['content-type'];
                    if (contentType && contentType.toLowerCase().includes('audio')) {
                        const fs = wx.getFileSystemManager();
                        const tempFilePath = `${wx.env.USER_DATA_PATH}/tts_mistake_${Date.now()}.mp3`;
                        fs.writeFile({
                            filePath: tempFilePath,
                            data: res.data,
                            encoding: 'binary',
                            success: () => {
                                if (this._audioCtx) this._audioCtx.destroy();
                                this._audioCtx = wx.createInnerAudioContext();
                                this._audioCtx.src = tempFilePath;
                                this._audioCtx.play();
                            }
                        });
                    }
                }
            }
        });
    }
});
