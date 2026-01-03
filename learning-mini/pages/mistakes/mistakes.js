const app = getApp();
const sha256 = require('../../utils/sha256_v2.js').sha256;
const md5 = require('../../utils/md5.js').md5;

// 云存储音频配置
const CLOUD_AUDIO_CONFIG = {
    FILE_PREFIX: 'cloud://cloud1-9gyx98pv7e7f0bed.636c-cloud1-9gyx98pv7e7f0bed-1311874709/wavs/',
    TIMEOUT: 3000
};

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

    /**
     * 获取文本对应的云存储音频文件ID
     */
    getCloudAudioFileId(text) {
        const normalizedText = text.trim().toLowerCase();
        const hash = md5(normalizedText);
        return `${CLOUD_AUDIO_CONFIG.FILE_PREFIX}${hash}.wav`;
    },

    /**
     * 播放音频文本 (主入口)
     * 优先尝试云存储，超时或失败后回退到云知声TTS API
     */
    playAudioText(text) {
        if (!text) return;
        console.log('TTS: 播放文本:', text);

        this.stopTTS();
        this.playAudioFromCloudStorage(text);
    },

    /**
     * 从云存储播放音频 (带超时回退)
     */
    playAudioFromCloudStorage(text) {
        const fileID = this.getCloudAudioFileId(text);
        console.log('TTS: 尝试从云存储获取:', fileID);

        let isResolved = false;

        const timeoutId = setTimeout(() => {
            if (!isResolved) {
                isResolved = true;
                console.log('TTS: 云存储请求超时，回退到云知声API');
                this.playAudioFromTTSApi(text);
            }
        }, CLOUD_AUDIO_CONFIG.TIMEOUT);

        wx.cloud.getTempFileURL({
            fileList: [fileID],
            success: res => {
                if (isResolved) return;

                if (res.fileList && res.fileList.length > 0 && res.fileList[0].tempFileURL) {
                    isResolved = true;
                    clearTimeout(timeoutId);

                    const tempUrl = res.fileList[0].tempFileURL;
                    console.log('TTS: 云存储音频获取成功:', tempUrl);
                    this.playAudioUrl(tempUrl);
                } else {
                    if (!isResolved) {
                        isResolved = true;
                        clearTimeout(timeoutId);
                        console.log('TTS: 云存储文件不存在，回退到云知声API');
                        this.playAudioFromTTSApi(text);
                    }
                }
            },
            fail: err => {
                if (!isResolved) {
                    isResolved = true;
                    clearTimeout(timeoutId);
                    console.warn('TTS: 云存储获取失败:', err, '，回退到云知声API');
                    this.playAudioFromTTSApi(text);
                }
            }
        });
    },

    /**
     * 播放音频URL
     */
    playAudioUrl(url) {
        if (this._audioCtx) {
            this._audioCtx.destroy();
        }

        this._audioCtx = wx.createInnerAudioContext();
        this._audioCtx.src = url;

        this._audioCtx.onCanplay(() => {
            console.log('TTS: 音频就绪，开始播放');
            this._audioCtx.play();
        });

        this._audioCtx.onError((err) => {
            console.error('TTS: 音频播放错误:', err);
        });

        this._audioCtx.onEnded(() => {
            console.log('TTS: 播放完成');
        });
    },

    /**
     * 使用云知声TTS API播放音频 (回退方案)
     */
    playAudioFromTTSApi(text) {
        if (!text) return;
        console.log('TTS: 使用云知声API播放:', text);

        const tm = +new Date();
        const signStr = `${YS_TTS_CONFIG.APP_KEY}${tm}${YS_TTS_CONFIG.SECRET}`;
        const sign = sha256(signStr).toUpperCase();

        const wsUrl = `${YS_TTS_CONFIG.WS_URL}?appkey=${YS_TTS_CONFIG.APP_KEY}&time=${tm}&sign=${sign}`;

        console.log('TTS: 正在连接云知声TTS服务...');

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
            this.playCollectedAudio(text);
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

    playCollectedAudio(text) {
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

                // 自动上传到云存储
                if (text) {
                    this.uploadToCloud(tempFilePath, text);
                }
            },
            fail: (err) => {
                console.error('TTS: 保存WAV文件失败:', err);
                wx.showToast({ title: '音频保存失败', icon: 'none' });
            }
        });

        this._ttsAudioBuffers = [];
    },

    /**
     * 上传音频到云存储
     */
    uploadToCloud(filePath, text) {
        if (!wx.cloud) return;

        const cloudPath = `wavs/${md5(text.trim().toLowerCase())}.wav`;
        console.log('TTS: ☁️ 正在后台上传到云存储:', cloudPath);

        wx.cloud.uploadFile({
            cloudPath: cloudPath,
            filePath: filePath,
            success: res => {
                console.log('TTS: ✅ 云存储上传成功', res.fileID);
            },
            fail: err => {
                console.error('TTS: ❌ 云存储上传失败', err);
            }
        });
    }
});
