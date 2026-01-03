const app = getApp();
const sha256 = require('../../utils/sha256_v2.js').sha256;

// 云知声TTS配置 - 与语音评测使用相同的密钥
const YS_TTS_CONFIG = {
    APP_KEY: "6vo4cqz4r4itar5srgldiadztclb2ephetjg2iag",
    SECRET: "5d6a3ebcab29ee9d6362e61ff3997bd4",
    WS_URL: "wss://ws-stts.hivoice.cn/v1/tts",
    VOICE: "jenny-plus"  // 纯正美音发音人
};

// PCM转WAV工具函数
function pcmToWav(pcmData, sampleRate, channels) {
    const dataLength = pcmData.byteLength;
    const buffer = new ArrayBuffer(44 + dataLength);
    const view = new DataView(buffer);

    // RIFF标识
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(view, 8, 'WAVE');

    // fmt块
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, channels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * channels * 2, true);
    view.setUint16(32, channels * 2, true);
    view.setUint16(34, 16, true);

    // data块
    writeString(view, 36, 'data');
    view.setUint32(40, dataLength, true);

    // 复制PCM数据
    const pcmView = new Uint8Array(pcmData);
    const wavView = new Uint8Array(buffer, 44);
    wavView.set(pcmView);

    return buffer;
}

function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

Page({
    data: {
        mistakes: []
    },

    // TTS WebSocket实例
    _ttsSocketTask: null,
    _ttsAudioBuffers: [],

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
            url: '/pages/index/index',
        });
    },

    onUnload() {
        this.stopTTS();
        if (this._audioCtx) {
            this._audioCtx.destroy();
        }
    },

    // 使用云知声TTS播放音频
    playAudioText(text) {
        if (!text) return;
        console.log('TTS: 播放文本 (云知声API):', text);

        // 关闭之前的连接
        this.stopTTS();

        // 生成签名
        const tm = +new Date();
        const signStr = `${YS_TTS_CONFIG.APP_KEY}${tm}${YS_TTS_CONFIG.SECRET}`;
        const sign = sha256(signStr).toUpperCase();

        // 创建WebSocket连接
        const wsUrl = `${YS_TTS_CONFIG.WS_URL}?appkey=${YS_TTS_CONFIG.APP_KEY}&time=${tm}&sign=${sign}`;

        console.log('TTS: 正在连接云知声TTS服务...');

        // 重置音频缓冲区
        this._ttsAudioBuffers = [];

        this._ttsSocketTask = wx.connectSocket({
            url: wsUrl,
            success: () => console.log('TTS: Socket连接中...')
        });

        this._ttsSocketTask.onOpen(() => {
            console.log('TTS: WebSocket连接成功，发送合成请求...');
            this._ttsSocketTask.send({
                data: JSON.stringify({
                    format: 'pcm',
                    vcn: YS_TTS_CONFIG.VOICE,
                    text: text,
                    sample: 16000,
                    speed: 40,
                    volume: 50,
                    pitch: 50,
                    bright: 50,
                })
            });
        });

        this._ttsSocketTask.onMessage((res) => {
            const data = res.data;

            if (typeof data === 'string') {
                try {
                    const result = JSON.parse(data);
                    if (result.code !== 0) {
                        console.error('TTS错误:', result);
                        wx.showToast({ title: '语音合成失败', icon: 'none' });
                    }
                } catch (e) {
                    console.error('TTS: 解析响应失败', e);
                }
                this._ttsSocketTask.close();
            } else {
                this._ttsAudioBuffers.push(data);
            }
        });

        this._ttsSocketTask.onClose(() => {
            console.log('TTS: WebSocket连接关闭');
            this.playCollectedAudio();
        });

        this._ttsSocketTask.onError((e) => {
            console.error('TTS: WebSocket连接错误', e);
            wx.showToast({ title: '语音连接失败', icon: 'none' });
        });
    },

    stopTTS() {
        if (this._ttsSocketTask) {
            this._ttsSocketTask.close();
            this._ttsSocketTask = null;
        }
        if (this._audioCtx) {
            this._audioCtx.stop();
        }
    },

    playCollectedAudio() {
        if (this._ttsAudioBuffers.length === 0) {
            console.log('TTS: 没有收到音频数据');
            return;
        }

        console.log('TTS: 合并音频数据，共', this._ttsAudioBuffers.length, '个片段');

        let totalLength = 0;
        for (const buffer of this._ttsAudioBuffers) {
            totalLength += buffer.byteLength;
        }

        const pcmData = new ArrayBuffer(totalLength);
        const pcmView = new Uint8Array(pcmData);
        let offset = 0;
        for (const buffer of this._ttsAudioBuffers) {
            pcmView.set(new Uint8Array(buffer), offset);
            offset += buffer.byteLength;
        }

        console.log('TTS: PCM数据总长度:', totalLength, 'bytes');

        const wavData = pcmToWav(pcmData, 16000, 1);

        const fs = wx.getFileSystemManager();
        const tempFilePath = `${wx.env.USER_DATA_PATH}/tts_mistake_${Date.now()}.wav`;

        fs.writeFile({
            filePath: tempFilePath,
            data: wavData,
            encoding: 'binary',
            success: () => {
                console.log('TTS: WAV文件保存成功:', tempFilePath);

                if (this._audioCtx) {
                    this._audioCtx.destroy();
                }
                this._audioCtx = wx.createInnerAudioContext();
                this._audioCtx.src = tempFilePath;

                this._audioCtx.onError((err) => {
                    console.error('TTS: 音频播放错误:', err);
                });

                this._audioCtx.onEnded(() => {
                    console.log('TTS: 播放完成');
                    fs.unlink({
                        filePath: tempFilePath,
                        fail: () => { }
                    });
                });

                this._audioCtx.play();
            },
            fail: (err) => {
                console.error('TTS: 保存WAV文件失败:', err);
                wx.showToast({ title: '音频保存失败', icon: 'none' });
            }
        });

        this._ttsAudioBuffers = [];
    }
});
