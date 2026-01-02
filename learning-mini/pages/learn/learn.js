// pages/learn/learn.js
const app = getApp();
const learningData = require('../../utils/data.js');
const sha256 = require('../../utils/sha256_v2.js').sha256;

const YOUDAO_TTS_CONFIG = {
    APP_KEY: '1a88c11a7e8767f3',
    APP_SECRET: 'jnAEoemgbmkIl5dzdmWlsPeItwiFa2n2',
    URL: 'https://openapi.youdao.com/ttsapi'
};

const YS_CONFIG = {
    APP_KEY: "6vo4cqz4r4itar5srgldiadztclb2ephetjg2iag",
    SECRET: "5d6a3ebcab29ee9d6362e61ff3997bd4",
    WS_URL: "wss://wss-edu.hivoice.cn:443/ws/eval/"
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

    playAudioText(text) {
        if (!text) return;
        console.log('Playing audio (Youdao API):', text);

        const curtime = Math.floor(Date.now() / 1000).toString();
        const salt = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });

        // input = q (len<=20) OR q[0..9] + len + q[len-10..len] (len>20)
        let input = text;
        if (text.length > 20) {
            input = text.substring(0, 10) + text.length + text.substring(text.length - 10, text.length);
        }

        // input needs to be processed but NOT double-encoded if SHA256 lib handles it
        // BUT our SHA256 test matched. 
        // Let's stick to the logic that worked in browser: standard string operations.
        // Wait, the SHA256 test PASSED: 
        // learn.js? [sm]:228 SHA256 Test (abc): 953370... (Wait, this is WRONG)
        // Correct SHA256('abc') is ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad
        // 953370... is e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 ??? No
        // 95337015... is NOT 'abc'.
        // SHA256('abc') = ba7816...
        // Let's check what 953370... is.
        // It might be 'undefined' or empty string?
        // SHA256('') = e3b0...
        // The SHA256 lib is definitely broken or returning a different hash.

        // I will try to use a very simple, single-file SHA256 implementation that I know works.
        // The previous one (sha256_v2.js) clearly produced the wrong hash for 'abc'.


        const signStr = YOUDAO_TTS_CONFIG.APP_KEY + input + salt + curtime + YOUDAO_TTS_CONFIG.APP_SECRET;
        console.log('--- Mini Program New SHA256 ---');
        console.log('SignStr (Raw):', signStr);
        // Ensure sha256 receives string, verify output
        const sign = sha256(signStr);
        console.log('Sign (Generated):', sign);
        console.log('SHA256 Test(abc) -> ba78...:', sha256('abc'));

        wx.request({
            url: YOUDAO_TTS_CONFIG.URL,
            method: 'POST',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                q: text, // Send original text
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
                        const tempFilePath = `${wx.env.USER_DATA_PATH}/tts_${Date.now()}.mp3`;

                        fs.writeFile({
                            filePath: tempFilePath,
                            data: res.data,
                            encoding: 'binary',
                            success: () => {
                                if (this._audioCtx) {
                                    this._audioCtx.destroy();
                                }
                                this._audioCtx = wx.createInnerAudioContext();
                                this._audioCtx.src = tempFilePath;

                                this._audioCtx.onError((err) => {
                                    console.error('Audio Play Error:', err);
                                    wx.showToast({ title: '播放出错', icon: 'none' });
                                });
                                this._audioCtx.play();
                            },
                            fail: (err) => {
                                console.error('File Save Error:', err);
                            }
                        });
                    } else {
                        // Decode error message
                        try {
                            const uint8Arr = new Uint8Array(res.data);
                            let jsonStr = '';
                            for (let i = 0; i < uint8Arr.length; i++) {
                                jsonStr += String.fromCharCode(uint8Arr[i]);
                            }

                            console.error('TTS API did not return audio. Content-Type:', contentType);
                            console.error('API Response Body:', jsonStr);

                            const errRes = JSON.parse(jsonStr);
                            wx.showToast({ title: `语音失败: ${errRes.errorCode || '未知错误'}`, icon: 'none' });
                        } catch (e) {
                            console.error('Decode Error Response Failed:', e);
                            wx.showToast({ title: '语音生成失败', icon: 'none' });
                        }
                    }
                } else {
                    console.error('Request failed:', res);
                    wx.showToast({ title: '网络请求错误', icon: 'none' });
                }
            },
            fail: (err) => {
                console.error('Request Network Error:', err);
                wx.showToast({ title: '无法加载音频', icon: 'none' });
            }
        });
    },

    playSound() {
        if (this.data.currentWord) {
            this.playAudioText(this.data.currentWord.english);
        }
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
        if (this.socketTask) {
            this.socketTask.close();
        }
        if (this._audioCtx) {
            this._audioCtx.destroy();
        }
    },

    // ==================== Oral Practice Mode ====================

    toggleRecord() {
        const { status } = this.data.oral;
        if (status === 'IDLE') {
            this.startRecord();
        } else if (status === 'RECORDING') {
            this.stopRecord();
        }
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
