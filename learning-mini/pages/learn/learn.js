// pages/learn/learn.js
const app = getApp();
const learningData = require('../../utils/data.js');
const sha256 = require('../../utils/sha256_v2.js').sha256;
const md5 = require('../../utils/md5.js').md5;

// 云存储音频配置
const CLOUD_AUDIO_CONFIG = {
    // 云存储wavs文件夹的fileID前缀 (需要根据实际云环境调整)
    FILE_PREFIX: 'cloud://cloud1-9gyx98pv7e7f0bed.636c-cloud1-9gyx98pv7e7f0bed-1311874709/wavs/',
    // 云存储请求超时时间 (毫秒)
    TIMEOUT: 3000
};

// 云知声TTS配置 - 与语音评测使用相同的密钥
const YS_TTS_CONFIG = {
    APP_KEY: "6vo4cqz4r4itar5srgldiadztclb2ephetjg2iag",
    SECRET: "5d6a3ebcab29ee9d6362e61ff3997bd4",
    WS_URL: "wss://ws-stts.hivoice.cn/v1/tts",
    VOICE: "jenny-plus"  // 纯正美音发音人
};

const YS_CONFIG = {
    APP_KEY: "6vo4cqz4r4itar5srgldiadztclb2ephetjg2iag",
    SECRET: "5d6a3ebcab29ee9d6362e61ff3997bd4",
    WS_URL: "wss://wss-edu.hivoice.cn:443/ws/eval/"
};

const AUDIO_EFFECTS = {
    CORRECT: '/audio/correct.wav',
    INCORRECT: '/audio/incorrect.wav',
    FINISH: '/audio/finish.mp3'
};

function generateGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0,
            v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

// emoji映射表
const emojiMap = {
    'meat': '🥩', 'milk': '🥛', 'fruit': '🍇', 'vegetables': '🥬', 'bread': '🍞',
    'egg': '🥚', 'cake': '🎂', 'candy': '🍬', 'chip': '🍟', 'juice': '🧃',
    'water': '💧', 'bottle': '🍼', 'paper': '📄', 'plastic': '🧴', 'earth': '🌍',
    'tree': '🌳', 'recycle': '♻️', 'clean': '✨', 'waste': '🗑️', 'protect': '🛡️',
    'friend': '👫', 'share': '🤝', 'help': '🙋', 'happy': '😊', 'kind': '💕',
    'nice': '👍', 'together': '👨‍👩‍👧‍👦', 'play': '🎮', 'listen': '👂', 'respect': '🙏',
    'try': '💪', 'learn': '📚', 'practice': '🏃', 'goal': '🎯', 'brave': '🦁',
    'keep': '✊', 'fail': '😅', 'success': '🏆', 'dream': '💭', 'grow': '🌱',
    'future': '🔮', 'robot': '🤖', 'travel': '✈️', 'fly': '🕊️', 'space': '🚀',
    'car': '🚗', 'technology': '💻', 'smart': '🧠', 'live': '🏠', 'change': '🔄',
    'festival': '🎉', 'celebrate': '🎊', 'lantern': '🏮', 'dragon': '🐉', 'mooncake': '🥮',
    'firework': '🎆', 'dumpling': '🥟', 'wish': '🌟', 'luck': '🍀', 'gift': '🎁'
};

function getEmoji(word) {
    return emojiMap[word.toLowerCase()] || '📝';
}

function shuffleArray(array) {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
}

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
    view.setUint32(16, 16, true); // fmt chunk size
    view.setUint16(20, 1, true);  // PCM format
    view.setUint16(22, channels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * channels * 2, true); // byte rate
    view.setUint16(32, channels * 2, true); // block align
    view.setUint16(34, 16, true); // bits per sample

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
        mode: 'vocab',
        unitId: 1,
        currentIndex: 0,
        totalItems: 0,
        score: 0,
        progress: 0,
        isFlipped: false,
        currentWord: null,
        currentSentence: null,
        options: [],
        shuffledWords: [],
        placedWords: [],
        correctOrder: [],
        // Fill Mode State
        fillSentence: null,
        fillOptions: [],
        fillAnswer: null,
        fillBlankIndex: -1,
        fillDisplayWord: '_____',
        // Challenge Mode State
        challenge: {
            timer: 60,
            timerInterval: null,
            correctCount: 0,
            totalCount: 0,
            questions: [],
            currentQuestion: null,
            isActive: false
        },
        feedback: {
            show: false,
            success: false,
            title: '',
            title: '',
            message: ''
        },
        // Oral Mode State
        oral: {
            status: 'IDLE', // IDLE, CONNECTING, RECORDING, EVALUATING
            score: 0,
            recognizedText: '',
            isCorrect: false,
            retryCount: 0
        }
    },

    // TTS WebSocket实例
    _ttsSocketTask: null,
    _ttsAudioBuffers: [],

    onLoad(options) {
        const mode = options.mode || 'vocab';
        const unitId = parseInt(options.unit) || 1;
        const unit = learningData.units.find(u => u.id === unitId);

        let totalItems = 0;
        if (mode === 'vocab' || mode === 'match' || mode === 'oral') {
            totalItems = unit.vocabulary.length;
        } else if (mode === 'sentence' || mode === 'fill') {
            totalItems = unit.sentences.length;
        }

        this.setData({
            mode,
            unitId,
            totalItems,
            score: app.globalData.score
        });

        this.loadCurrentItem();
    },

    loadCurrentItem() {
        const { mode, unitId, currentIndex } = this.data;
        const unit = learningData.units.find(u => u.id === unitId);

        if (mode === 'vocab' || mode === 'match' || mode === 'oral') {
            const word = unit.vocabulary[currentIndex];
            this.setData({
                currentWord: {
                    ...word,
                    emoji: getEmoji(word.english)
                },
                isFlipped: false,
                progress: ((currentIndex + 1) / this.data.totalItems) * 100
            });

            if (mode === 'match') {
                this.generateOptions(unit);
            } else if (mode === 'oral') {
                // Reset oral state
                this.setData({
                    'oral.status': 'IDLE',
                    'oral.score': 0,
                    'oral.recognizedText': '',
                    'oral.isCorrect': false
                });
            }
        } else if (mode === 'sentence') {
            const sentence = unit.sentences[currentIndex];
            const correctOrder = sentence.english.replace(/[.,!?]/g, '').split(' ');
            const shuffled = shuffleArray(correctOrder).map((w, i) => ({
                word: w,
                index: i,
                placed: false
            }));

            this.setData({
                currentSentence: sentence,
                correctOrder,
                shuffledWords: shuffled,
                placedWords: [],
                progress: ((currentIndex + 1) / this.data.totalItems) * 100
            });
        } else if (mode === 'fill') {
            this.generateFillQuestion(unit);
        } else if (mode === 'challenge') {
            if (!this.data.challenge.isActive) {
                this.startChallengeMode(unit);
            }
        }

        // Auto-play audio immediately when page loads
        if (mode === 'vocab' || mode === 'match' || mode === 'oral') {
            this.playSound();
        } else if (mode === 'sentence') {
            this.playSentenceSound();
        }
    },

    generateOptions(unit) {
        const { currentIndex } = this.data;
        const correctWord = unit.vocabulary[currentIndex];
        const otherWords = unit.vocabulary.filter((_, i) => i !== currentIndex);
        const shuffled = shuffleArray(otherWords).slice(0, 3);
        const options = shuffleArray([correctWord, ...shuffled]).map(w => ({
            ...w,
            selected: false,
            correct: w.id === correctWord.id
        }));

        this.setData({ options });
    },

    flipCard() {
        this.setData({ isFlipped: !this.data.isFlipped });
    },

    /**
     * 获取文本对应的云存储音频文件ID
     * @param {string} text - 音频文本
     * @returns {string} - 云存储fileID
     */
    getCloudAudioFileId(text) {
        // 使用小写、去除首尾空格后的文本生成MD5
        const normalizedText = text.trim().toLowerCase();
        const hash = md5(normalizedText);
        return `${CLOUD_AUDIO_CONFIG.FILE_PREFIX}${hash}.wav`;
    },

    /**
     * 播放音频文本 (主入口)
     * 优先尝试云存储，超时或失败后回退到云知声TTS API
     * @param {string} text - 要播放的文本
     */
    playAudioText(text) {
        if (!text) return;
        console.log('TTS: 播放文本:', text);

        // 关闭之前的连接和播放
        this.stopTTS();

        // 尝试从云存储获取音频
        this.playAudioFromCloudStorage(text);
    },

    /**
     * 从云存储播放音频 (带超时回退)
     * @param {string} text - 音频文本
     */
    playAudioFromCloudStorage(text) {
        const fileID = this.getCloudAudioFileId(text);
        console.log('TTS: 尝试从云存储获取:', fileID);

        let isResolved = false;

        // 设置超时定时器
        const timeoutId = setTimeout(() => {
            if (!isResolved) {
                isResolved = true;
                console.log('TTS: 云存储请求超时，回退到云知声API');
                this.playAudioFromTTSApi(text);
            }
        }, CLOUD_AUDIO_CONFIG.TIMEOUT);

        // 获取临时链接
        wx.cloud.getTempFileURL({
            fileList: [fileID],
            success: res => {
                if (isResolved) return; // 已超时，忽略结果

                if (res.fileList && res.fileList.length > 0 && res.fileList[0].tempFileURL) {
                    isResolved = true;
                    clearTimeout(timeoutId);

                    const tempUrl = res.fileList[0].tempFileURL;
                    console.log('TTS: 云存储音频获取成功:', tempUrl);
                    this.playAudioUrl(tempUrl);
                } else {
                    // 文件不存在
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
     * @param {string} url - 音频URL
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
     * @param {string} text - 要播放的文本
     */
    playAudioFromTTSApi(text) {
        if (!text) return;
        console.log('TTS: 使用云知声API播放:', text);

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
            // 发送TTS请求
            this._ttsSocketTask.send({
                data: JSON.stringify({
                    format: 'pcm',
                    vcn: YS_TTS_CONFIG.VOICE,  // jenny-plus 美音
                    text: text,
                    sample: 16000,
                    speed: 40,           // 语速稍慢，适合学习
                    volume: 50,
                    pitch: 50,
                    bright: 50,
                })
            });
        });

        this._ttsSocketTask.onMessage((res) => {
            const data = res.data;

            // 检查是否是字符串（错误响应）
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
                // 二进制音频数据
                this._ttsAudioBuffers.push(data);
            }
        });

        this._ttsSocketTask.onClose(() => {
            console.log('TTS: WebSocket连接关闭');
            // 合并所有音频数据并播放，同时传入text用于上传
            this.playCollectedAudio(text);
        });

        this._ttsSocketTask.onError((e) => {
            console.error('TTS: WebSocket连接错误', e);
            wx.showToast({ title: '语音连接失败', icon: 'none' });
        });
    },

    // 播放收集到的音频数据，并在成功后上传到云存储
    playCollectedAudio(text) {
        if (this._ttsAudioBuffers.length === 0) {
            console.log('TTS: 没有收到音频数据');
            return;
        }

        console.log('TTS: 合并音频数据，共', this._ttsAudioBuffers.length, '个片段');

        // 计算总长度
        let totalLength = 0;
        for (const buffer of this._ttsAudioBuffers) {
            totalLength += buffer.byteLength;
        }

        // 合并所有PCM数据
        const pcmData = new ArrayBuffer(totalLength);
        const pcmView = new Uint8Array(pcmData);
        let offset = 0;
        for (const buffer of this._ttsAudioBuffers) {
            pcmView.set(new Uint8Array(buffer), offset);
            offset += buffer.byteLength;
        }

        console.log('TTS: PCM数据总长度:', totalLength, 'bytes');

        // 转换为WAV格式
        const wavData = pcmToWav(pcmData, 16000, 1);

        // 保存到临时文件并播放
        const fs = wx.getFileSystemManager();
        const tempFilePath = `${wx.env.USER_DATA_PATH}/tts_${Date.now()}.wav`;

        fs.writeFile({
            filePath: tempFilePath,
            data: wavData,
            encoding: 'binary',
            success: () => {
                console.log('TTS: WAV文件保存成功:', tempFilePath);

                // 播放音频
                this.playAudioUrl(tempFilePath);

                // 播放完成后删除临时文件，但在删除前先上传
                this._audioCtx.onEnded(() => {
                    console.log('TTS: 播放完成');
                    // 上传完成后再删除，或者不用等上传完成
                });

                // ⚡️ 核心改动：自动上传到云存储（静默执行）
                if (text) {
                    this.uploadToCloud(tempFilePath, text);
                }
            },
            fail: (err) => {
                console.error('TTS: 保存WAV文件失败:', err);
                wx.showToast({ title: '音频保存失败', icon: 'none' });
            }
        });

        // 清空缓冲区
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
            filePath: filePath, // 本地文件路径
            success: res => {
                console.log('TTS: ✅ 云存储上传成功', res.fileID);
                // 上传成功后，可以删除本地临时文件(如果还没删)
                // 这里不做额外处理，依赖playAudioUrl中的流程或系统清理
            },
            fail: err => {
                // 如果是“文件已存在”或者是权限问题，记录一下
                console.error('TTS: ❌ 云存储上传失败', err);
            }
        });
    },

    // 停止TTS
    stopTTS() {
        if (this._ttsSocketTask) {
            this._ttsSocketTask.close();
            this._ttsSocketTask = null;
        }
        if (this._audioCtx) {
            this._audioCtx.stop();
        }
    },



    playSound() {
        if (this.data.currentWord) {
            this.playAudioText(this.data.currentWord.english);
        }
    },

    playLocalSound(path) {
        const ctx = wx.createInnerAudioContext();
        ctx.src = path;
        ctx.onError((e) => console.error('Local Sound Error:', e));
        ctx.onEnded(() => ctx.destroy());
        ctx.play();
    },

    playSentenceSound() {
        if (this.data.currentSentence) {
            this.playAudioText(this.data.currentSentence.english);
        }
    },

    selectOption(e) {
        const index = e.currentTarget.dataset.index;
        const options = [...this.data.options];

        if (options.some(o => o.selected)) return;

        options[index].selected = true;
        this.setData({ options });

        const isCorrect = options[index].correct;

        if (isCorrect) {
            const newScore = this.data.score + 10;
            app.addScore(10);
            this.setData({ score: newScore });

            this.showFeedback(true, '🎉 太棒了！', learningData.encouragements[Math.floor(Math.random() * learningData.encouragements.length)]);
        } else {
            // Add to mistakes
            if (this.data.currentWord) {
                app.addMistake(this.data.currentWord);
            }
            this.showFeedback(false, '💪 再接再厉', learningData.errorMessages[Math.floor(Math.random() * learningData.errorMessages.length)]);
        }

        setTimeout(() => this.nextItem(), 1500);
    },

    placeWord(e) {
        const index = e.currentTarget.dataset.index;
        const shuffledWords = [...this.data.shuffledWords];

        if (shuffledWords[index].placed) return;

        shuffledWords[index].placed = true;
        const placedWords = [...this.data.placedWords, shuffledWords[index].word];

        this.setData({ shuffledWords, placedWords });
    },

    removeWord(e) {
        const index = e.currentTarget.dataset.index;
        const placedWords = [...this.data.placedWords];
        const removedWord = placedWords.splice(index, 1)[0];

        const shuffledWords = this.data.shuffledWords.map(w => ({
            ...w,
            placed: w.word === removedWord ? false : w.placed
        }));

        this.setData({ shuffledWords, placedWords });
    },

    checkSentence() {
        const { placedWords, correctOrder } = this.data;
        const isCorrect = placedWords.join(' ') === correctOrder.join(' ');

        if (isCorrect) {
            const newScore = this.data.score + 15;
            app.addScore(15);
            this.setData({ score: newScore });

            this.showFeedback(true, '🎉 完全正确！', '句子排序成功！');
        } else {
            // 句子排序较难直接定义“错词”，但可以作为一种错误记录，暂时不加入错题本，或者加入整个句子？
            // 用户需求主要是“错题本”，通常指单词。这里暂不处理句子。
            this.showFeedback(false, '💪 再想想', '顺序好像不太对哦~');
        }

        setTimeout(() => this.nextItem(), 1500);
    },

    prevItem() {
        if (this.data.currentIndex > 0) {
            this.setData({ currentIndex: this.data.currentIndex - 1 });
            this.loadCurrentItem();
        }
    },

    nextItem() {
        if (this.data.currentIndex < this.data.totalItems - 1) {
            this.setData({ currentIndex: this.data.currentIndex + 1 });
            this.loadCurrentItem();
        } else {
            // 完成学习
            app.addCoins(20);
            this.playLocalSound(AUDIO_EFFECTS.FINISH);
            wx.showModal({
                title: '🎉 学习完成！',
                content: `获得20金币！\n本次得分：${this.data.score}`,
                showCancel: false,
                success: () => {
                    wx.navigateBack();
                }
            });
        }
    },

    showFeedback(success, title, message) {
        this.playLocalSound(success ? AUDIO_EFFECTS.CORRECT : AUDIO_EFFECTS.INCORRECT);
        this.setData({
            feedback: {
                show: true,
                success,
                title,
                message
            }
        });

        setTimeout(() => {
            this.setData({
                'feedback.show': false
            });
        }, 1200);
    },

    // ==================== Fill Mode ====================
    generateFillQuestion(unit) {
        const { currentIndex } = this.data;
        const sentence = unit.sentences[currentIndex];

        // Randomly select a word to blank out
        const words = sentence.english.split(' ');
        const blankIndex = Math.floor(Math.random() * words.length);
        const correctAnswer = words[blankIndex].replace(/[.,!?]/g, '');

        // Generate options
        const allWords = unit.vocabulary.map(v => v.english);
        let options = [correctAnswer];
        while (options.length < 4) {
            const randomWord = allWords[Math.floor(Math.random() * allWords.length)];
            if (!options.includes(randomWord)) {
                options.push(randomWord);
            }
        }
        options = shuffleArray(options).map(o => ({
            text: o,
            correct: o === correctAnswer,
            selected: false
        }));

        this.setData({
            currentSentence: sentence,
            fillSentence: words,
            fillOptions: options,
            fillAnswer: correctAnswer,
            fillBlankIndex: blankIndex,
            fillDisplayWord: '_____',
            progress: ((currentIndex + 1) / this.data.totalItems) * 100
        });
    },

    checkFillAnswer(e) {
        if (this.data.feedback.show) return;

        const index = e.currentTarget.dataset.index;
        const options = [...this.data.fillOptions];
        const selectedOption = options[index];

        options[index].selected = true;
        this.setData({
            fillOptions: options,
            fillDisplayWord: selectedOption.text
        });

        if (selectedOption.correct) {
            this.showFeedback(true, '🎉 正确！', '填空成功');
            app.addScore(15);
        } else {
            // Add to mistakes
            // 构造一个简单的单词对象
            app.addMistake({
                english: this.data.fillAnswer,
                chinese: '填空题', // 既然只有答案，上下文在句子中
                soundmark: ''
            });
            this.showFeedback(false, '💪 错误', '正确答案: ' + this.data.fillAnswer);
        }

        setTimeout(() => this.nextItem(), 1500);
    },

    // ==================== Challenge Mode ====================
    startChallengeMode(unit) {
        // Generate mixed questions
        let questions = [];
        unit.vocabulary.forEach(word => {
            const otherWords = unit.vocabulary.filter(w => w.id !== word.id);
            const shuffled = shuffleArray(otherWords).slice(0, 3);
            const options = shuffleArray([word, ...shuffled]).map(w => ({
                ...w,
                correct: w.id === word.id
            }));

            questions.push({
                type: 'match',
                data: word,
                options: options
            });
        });

        questions = shuffleArray(questions);

        this.setData({
            'challenge.questions': questions,
            'challenge.isActive': true,
            'challenge.timer': 60,
            'challenge.correctCount': 0,
            'challenge.totalCount': 0
        });

        this.nextChallengeQuestion();
        this.startTimer();
    },

    startTimer() {
        const timerInterval = setInterval(() => {
            if (this.data.challenge.timer <= 0) {
                this.endChallenge();
            } else {
                this.setData({
                    'challenge.timer': this.data.challenge.timer - 1
                });
            }
        }, 1000);

        this.setData({ 'challenge.timerInterval': timerInterval });
    },

    nextChallengeQuestion() {
        const questions = this.data.challenge.questions;
        if (questions.length === 0) {
            this.endChallenge();
            return;
        }

        const currentQuestion = questions.shift();
        this.setData({
            'challenge.currentQuestion': currentQuestion,
            'challenge.questions': questions,
            // Re-use currentWord for convenience in template if needed, or just specific fields
            currentWord: currentQuestion.data,
            options: currentQuestion.options.map(o => ({ ...o, selected: false })) // Reset selection
        });

        this.playSound(); // Auto play for the new word
    },

    checkChallengeAnswer(e) {
        if (this.data.feedback.show) return;

        const index = e.currentTarget.dataset.index;
        const options = [...this.data.options];
        const isCorrect = options[index].correct;

        options[index].selected = true;
        this.setData({ options });

        let { correctCount, totalCount } = this.data.challenge;
        totalCount++;
        if (isCorrect) {
            correctCount++;
            app.addScore(5);
            this.showFeedback(true, '⚡ +5', '回答正确');
        } else {
            // Add to mistakes (challenge mode)
            if (this.data.challenge.currentQuestion && this.data.challenge.currentQuestion.data) {
                app.addMistake(this.data.challenge.currentQuestion.data);
            }
            this.showFeedback(false, '❌ 错误', '继续加油');
        }

        this.setData({
            'challenge.correctCount': correctCount,
            'challenge.totalCount': totalCount
        });

        setTimeout(() => this.nextChallengeQuestion(), 800);
    },

    endChallenge() {
        clearInterval(this.data.challenge.timerInterval);
        const { correctCount, totalCount } = this.data.challenge;
        const bonus = correctCount * 10;
        app.addCoins(bonus);

        wx.showModal({
            title: '🏆 挑战结束',
            content: `正确率: ${correctCount}/${totalCount}\n获得金币: ${bonus}`,
            showCancel: false,
            success: () => {
                wx.navigateBack();
            }
        });
    },

    onUnload() {
        if (this.data.challenge.timerInterval) {
            clearInterval(this.data.challenge.timerInterval);
        }
        this.stopRecord();
        this.stopTTS();
        if (this.socketTask) {
            this.socketTask.close();
        }
        if (this._audioCtx) {
            this._audioCtx.destroy();
        }
    },

    // ==================== Oral Practice Mode ====================

    startRecordHandler() {
        if (this.data.oral.status !== 'IDLE') return;
        this.stopRequested = false;
        this.startRecord();
    },

    stopRecordHandler() {
        this.stopRequested = true;
        const { status } = this.data.oral;
        if (status === 'RECORDING') {
            this.stopRecord();
        }
        // If CONNECTING, the stopRequested flag will handle it in onOpen or onStart
    },

    startRecord() {
        console.log('=== Start Recording ===');
        this.setData({ 'oral.status': 'CONNECTING' });

        // 1. Connect WebSocket
        this.socketTask = wx.connectSocket({
            url: YS_CONFIG.WS_URL,
            success: () => console.log('Socket connecting...')
        });

        this.socketTask.onOpen(() => {
            if (this.stopRequested) {
                console.log('User released before connection opened - cancelling');
                this.socketTask.close();
                this.setData({ 'oral.status': 'IDLE' });
                return;
            }

            console.log('Socket connected');
            this.sid = generateGuid();

            // Send Init Params
            const params = {
                mode: 'sent',
                appkey: YS_CONFIG.APP_KEY,
                displayText: this.data.currentWord.english,
                audioFormat: 'pcm',
                eof: this.sid
            };
            this.socketTask.send({ data: JSON.stringify(params) });

            // 2. Start Recorder
            this.initRecorder();
        });

        this.socketTask.onMessage((res) => {
            this.handleEvalResult(res.data);
        });

        this.socketTask.onError((err) => {
            console.error('Socket Error', err);
            this.showFeedback(false, '连接失败', '无法连接评测服务器');
            this.setData({ 'oral.status': 'IDLE' });
        });

        this.socketTask.onClose(() => {
            console.log('Socket Closed');
        });
    },

    initRecorder() {
        const recorderManager = wx.getRecorderManager();

        recorderManager.onStart(() => {
            console.log('Recorder started');
            this.setData({ 'oral.status': 'RECORDING' });

            if (this.stopRequested) {
                console.log('Stop requested during init - stopping immediately');
                this.stopRecord();
            }
        });

        recorderManager.onFrameRecorded((res) => {
            const { frameBuffer, isLastFrame } = res;
            if (this.socketTask && this.data.oral.status === 'RECORDING') {
                // Send PCM data
                this.socketTask.send({ data: frameBuffer });
            }
        });

        recorderManager.onError((err) => {
            console.error('Recorder Error', err);
            this.showFeedback(false, '录音失败', '请检查麦克风权限');
            this.setData({ 'oral.status': 'IDLE' });
            if (this.socketTask) this.socketTask.close();
        });

        // Config for Yunzhisheng: 16k, 16bit, mono
        // frameSize: 1.25KB = 1280 bytes
        recorderManager.start({
            format: 'PCM',
            sampleRate: 16000,
            numberOfChannels: 1,
            frameSize: 1.25
        });

        this.recorderManager = recorderManager;
    },

    stopRecord() {
        if (this.data.oral.status !== 'RECORDING') return;

        console.log('=== Stop Recording ===');
        this.recorderManager.stop();
        this.setData({ 'oral.status': 'EVALUATING' });

        // Send EOF
        if (this.socketTask) {
            this.socketTask.send({ data: this.sid });
        }
    },

    handleEvalResult(data) {
        try {
            const result = JSON.parse(data);
            console.log('Eval Result:', result);

            if (result.errcode === 0) {
                const res = result.result;
                const score = res.score;
                const isCorrect = score >= 60;

                this.setData({
                    'oral.score': score,
                    'oral.isCorrect': isCorrect,
                    'oral.recognizedText': res.lines && res.lines[0] ? res.lines[0].text : ''
                });

                if (isCorrect) {
                    this.showFeedback(true, '发音正确! 🎉', `得分: ${Math.round(score)}`);
                    app.addScore(10);
                    // 1.5s next
                    setTimeout(() => this.nextItem(), 1500);
                    if (this.socketTask) this.socketTask.close();
                    this.setData({ 'oral.status': 'IDLE' });
                } else {
                    this.showFeedback(false, '发音不准', `得分: ${Math.round(score)} / 60`);
                    if (this.socketTask) this.socketTask.close();
                    this.setData({ 'oral.status': 'IDLE' });
                }
            } else {
                console.error('Eval API Error:', result);
                this.showFeedback(false, '评测出错', result.errmsg);
                if (this.socketTask) this.socketTask.close();
                this.setData({ 'oral.status': 'IDLE' });
            }
        } catch (e) {
            // Ignore non-JSON messages if any, or handle legacy
            console.error('Parse Error', e);
        }
    }
});
