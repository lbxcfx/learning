// 五年级英语学习乐园 - 主逻辑

// ==================== 状态管理 ====================
const gameState = {
  currentUnit: 1,
  currentMode: null,
  currentIndex: 0,
  totalItems: 0,
  coins: parseInt(localStorage.getItem('coins') || '0'),
  score: parseInt(localStorage.getItem('score') || '0'),
  streak: 0,
  mistakes: JSON.parse(localStorage.getItem('mistakes') || '{}'),
  isAnswered: false
};

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', () => {
  renderUnitNav();
  updateStats();
  loadSavedProgress();
  updateUnitBanner();
});

function loadSavedProgress() {
  // 从localStorage加载进度
  const savedUnit = localStorage.getItem('currentUnit');
  if (savedUnit) {
    gameState.currentUnit = parseInt(savedUnit);
    highlightActiveUnit();
  }
}

function saveProgress() {
  localStorage.setItem('currentUnit', gameState.currentUnit);
  localStorage.setItem('coins', gameState.coins);
  localStorage.setItem('score', gameState.score);
  localStorage.setItem('mistakes', JSON.stringify(gameState.mistakes));
}

// ==================== 单元信息横幅 ====================
function updateUnitBanner() {
  const unit = getCurrentUnit();
  const banner = document.getElementById('unitInfoBanner');
  const image = document.getElementById('unitBannerImage');
  const title = document.getElementById('unitBannerTitle');
  const subtitle = document.getElementById('unitBannerSubtitle');
  const stats = document.getElementById('unitBannerStats');
  
  if (unit && unit.banner) {
    image.src = unit.banner;
    image.alt = unit.title;
  }
  
  title.textContent = `Unit ${unit.id}: ${unit.title}`;
  subtitle.textContent = unit.titleCn;
  stats.textContent = `📚 ${unit.vocabulary.length}个单词 · 📝 ${unit.sentences.length}个句型 · 🎯 ${unit.dialogues.length}个对话`;
}

// ==================== UI 渲染 ====================
function renderUnitNav() {
  const nav = document.getElementById('unitNav');
  nav.innerHTML = learningData.units.map(unit => `
    <button class="unit-btn ${unit.id === gameState.currentUnit ? 'active' : ''}" 
            style="--unit-color: ${unit.color}"
            onclick="selectUnit(${unit.id})">
      <span class="unit-icon">${unit.icon}</span>
      <span>Unit ${unit.id}</span>
    </button>
  `).join('');
}

function highlightActiveUnit() {
  document.querySelectorAll('.unit-btn').forEach((btn, index) => {
    btn.classList.toggle('active', index + 1 === gameState.currentUnit);
  });
}

function updateStats() {
  document.getElementById('coinValue').textContent = gameState.coins;
  document.getElementById('scoreValue').textContent = gameState.score;
  document.getElementById('streakValue').textContent = gameState.streak;
}

function updateProgress() {
  const percent = ((gameState.currentIndex + 1) / gameState.totalItems) * 100;
  document.getElementById('progressFill').style.width = `${percent}%`;
  document.getElementById('progressText').textContent = `${gameState.currentIndex + 1}/${gameState.totalItems}`;
}

// ==================== 单元选择 ====================
function selectUnit(unitId) {
  gameState.currentUnit = unitId;
  highlightActiveUnit();
  updateUnitBanner();
  saveProgress();
}

function getCurrentUnit() {
  return learningData.units.find(u => u.id === gameState.currentUnit);
}

// ==================== 游戏模式 ====================
function startMode(mode) {
  gameState.currentMode = mode;
  gameState.currentIndex = 0;
  gameState.isAnswered = false;
  
  const unit = getCurrentUnit();
  
  // 挑战模式特殊处理
  if (mode === 'challenge') {
    document.getElementById('gameTitleIcon').textContent = '⏱️';
    document.getElementById('gameTitleText').textContent = '限时挑战';
    document.getElementById('modeGrid').classList.add('hidden');
    document.getElementById('unitInfoBanner').classList.add('hidden');
    document.getElementById('gameArea').classList.remove('hidden');
    startChallengeMode();
    return;
  }
  
  // 设置总数
  switch (mode) {
    case 'vocab':
    case 'match':
    case 'spelling':
      gameState.totalItems = unit.vocabulary.length;
      break;
    case 'sentence':
    case 'fill':
      gameState.totalItems = unit.sentences.length;
      break;
    case 'dialogue':
      gameState.totalItems = unit.dialogues.length;
      break;
  }

  // 设置标题
  const titles = {
    vocab: { icon: '📖', text: '单词卡片' },
    match: { icon: '🖼️', text: '看图选词' },
    spelling: { icon: '✍️', text: '拼写练习' },
    sentence: { icon: '🔀', text: '句子排序' },
    fill: { icon: '📝', text: '填空选择' },
    dialogue: { icon: '🎯', text: '情景对话' }
  };

  document.getElementById('gameTitleIcon').textContent = titles[mode].icon;
  document.getElementById('gameTitleText').textContent = titles[mode].text;

  // 显示游戏区域
  document.getElementById('modeGrid').classList.add('hidden');
  document.getElementById('unitInfoBanner').classList.add('hidden');
  document.getElementById('gameArea').classList.remove('hidden');

  // 渲染内容
  renderGameContent();
  updateProgress();
}

function exitGame() {
  // 清理挑战模式计时器
  if (challengeState.timerInterval) {
    clearInterval(challengeState.timerInterval);
    challengeState.timerInterval = null;
  }
  
  document.getElementById('modeGrid').classList.remove('hidden');
  document.getElementById('unitInfoBanner').classList.remove('hidden');
  document.getElementById('gameArea').classList.add('hidden');
  gameState.currentMode = null;
}

function nextQuestion() {
  gameState.currentIndex++;
  gameState.isAnswered = false;
  
  if (gameState.currentIndex >= gameState.totalItems) {
    // 完成所有题目
    showCompletionFeedback();
    return;
  }
  
  renderGameContent();
  updateProgress();
}

// ==================== 游戏内容渲染 ====================
function renderGameContent() {
  const content = document.getElementById('gameContent');
  
  switch (gameState.currentMode) {
    case 'vocab':
      renderVocabMode(content);
      break;
    case 'match':
      renderMatchMode(content);
      break;
    case 'spelling':
      renderSpellingMode(content);
      break;
    case 'sentence':
      renderSentenceMode(content);
      break;
    case 'fill':
      renderFillMode(content);
      break;
    case 'dialogue':
      renderDialogueMode(content);
      break;
  }
}

// ==================== 单词卡片模式 ====================
function renderVocabMode(container) {
  const unit = getCurrentUnit();
  const word = unit.vocabulary[gameState.currentIndex];
  
  container.innerHTML = `
    <div class="vocab-container">
      <div class="vocab-card" id="vocabCard" onclick="flipCard()">
        <div class="vocab-card-inner">
          <div class="vocab-card-front">
            <div class="vocab-image-placeholder" style="font-size: 5rem; margin-bottom: 16px;">
              ${getWordEmoji(word.english)}
            </div>
            <div class="vocab-english">${word.english}</div>
            <div class="vocab-soundmark">${word.soundmark}</div>
            <button class="sound-btn" onclick="event.stopPropagation(); playWordSound('${word.english}')">🔊 再听一次</button>
          </div>
          <div class="vocab-card-back">
            <div class="vocab-chinese">${word.chinese}</div>
            <div class="vocab-soundmark" style="color: var(--text-secondary);">${word.soundmark}</div>
            <div class="vocab-english" style="color: var(--primary); font-size: 1.5rem;">${word.english}</div>
          </div>
        </div>
      </div>
      <p style="color: var(--text-secondary); text-align: center;">点击卡片翻转查看</p>
      <div class="vocab-nav">
        <button class="nav-btn secondary" onclick="prevVocab()" ${gameState.currentIndex === 0 ? 'disabled' : ''}>
          ← 上一个
        </button>
        <button class="nav-btn" onclick="nextVocab()">
          ${gameState.currentIndex === gameState.totalItems - 1 ? '完成 ✓' : '下一个 →'}
        </button>
      </div>
    </div>
  `;
  
  // 自动播放单词发音
  setTimeout(() => {
    playWordSound(word.english);
  }, 300);
}

function flipCard() {
  document.getElementById('vocabCard').classList.toggle('flipped');
}

function prevVocab() {
  if (gameState.currentIndex > 0) {
    gameState.currentIndex--;
    renderGameContent();
    updateProgress();
  }
}

function nextVocab() {
  if (gameState.currentIndex >= gameState.totalItems - 1) {
    addCoins(20);
    showFeedback(true, '单词学习完成！', '太棒了！你学完了本单元所有单词！', 20);
    setTimeout(() => exitGame(), 2000);
  } else {
    gameState.currentIndex++;
    renderGameContent();
    updateProgress();
  }
}

// ==================== 看图选词模式 ====================
function renderMatchMode(container) {
  const unit = getCurrentUnit();
  const word = unit.vocabulary[gameState.currentIndex];
  
  // 生成选项（包含正确答案和3个干扰项）
  const options = generateOptions(unit.vocabulary, word, 4);
  
  container.innerHTML = `
    <div class="match-container">
      <div class="match-image-wrapper">
        <div style="font-size: 8rem;">${getWordEmoji(word.english)}</div>
      </div>
      <button class="sound-btn" onclick="playWordSound('${word.english}')" style="margin: 16px 0;">🔊 再听一次</button>
      <div class="match-options" id="matchOptions">
        ${options.map(opt => `
          <button class="match-option" onclick="checkMatchAnswer('${opt.english}', '${word.english}', this)">
            ${opt.english}
          </button>
        `).join('')}
      </div>
    </div>
  `;
  
  // 自动播放单词发音
  setTimeout(() => {
    playWordSound(word.english);
  }, 300);
}

function checkMatchAnswer(selected, correct, element) {
  if (gameState.isAnswered) return;
  gameState.isAnswered = true;
  
  const unit = getCurrentUnit();
  const word = unit.vocabulary.find(w => w.english === correct);
  
  if (selected === correct) {
    element.classList.add('correct');
    handleCorrectAnswer(word);
  } else {
    element.classList.add('wrong');
    // 显示正确答案
    document.querySelectorAll('.match-option').forEach(btn => {
      if (btn.textContent.trim() === correct) {
        btn.classList.add('correct');
      }
    });
    handleWrongAnswer(word);
  }
  
  setTimeout(() => nextQuestion(), 1500);
}

function generateOptions(vocabulary, correctWord, count) {
  const options = [correctWord];
  const others = vocabulary.filter(w => w.id !== correctWord.id);
  
  // 随机选择干扰项
  while (options.length < count && others.length > 0) {
    const randomIndex = Math.floor(Math.random() * others.length);
    options.push(others.splice(randomIndex, 1)[0]);
  }
  
  // 打乱顺序
  return shuffleArray(options);
}

// ==================== 拼写练习模式 ====================
let spellingState = {
  answer: '',
  currentInput: ''
};

function renderSpellingMode(container) {
  const unit = getCurrentUnit();
  const word = unit.vocabulary[gameState.currentIndex];
  
  spellingState.answer = word.english.toLowerCase();
  spellingState.currentInput = '';
  
  const letterBoxes = word.english.split('').map((_, i) => `
    <div class="letter-box ${i === 0 ? 'active' : ''}" id="letterBox${i}"></div>
  `).join('');
  
  container.innerHTML = `
    <div class="spelling-container">
      <div class="spelling-prompt">
        <div style="font-size: 5rem; margin-bottom: 12px;">${getWordEmoji(word.english)}</div>
        <div class="spelling-chinese">${word.chinese}</div>
        <div class="spelling-hint">音标：${word.soundmark}</div>
      </div>
      <button class="sound-btn" onclick="playWordSound('${word.english}')" style="margin: 8px 0;">🔊 再听一次</button>
      <div class="spelling-input-wrapper" id="spellingBoxes">
        ${letterBoxes}
      </div>
      <div class="spelling-keyboard" id="spellingKeyboard">
        ${generateKeyboard()}
      </div>
      <button class="check-btn" onclick="checkSpelling()" id="spellingCheckBtn" disabled>检查答案</button>
    </div>
  `;
  
  // 自动播放单词发音
  setTimeout(() => {
    playWordSound(word.english);
  }, 300);
}

function generateKeyboard() {
  const rows = [
    'qwertyuiop',
    'asdfghjkl',
    'zxcvbnm'
  ];
  
  let html = '';
  rows.forEach(row => {
    html += '<div style="display: flex; gap: 6px; justify-content: center; width: 100%;">';
    row.split('').forEach(letter => {
      html += `<button class="key-btn" onclick="typeSpellingLetter('${letter}')">${letter}</button>`;
    });
    if (row === 'zxcvbnm') {
      html += `<button class="key-btn backspace" onclick="deleteSpellingLetter()">⌫</button>`;
    }
    html += '</div>';
  });
  
  return html;
}

function typeSpellingLetter(letter) {
  if (spellingState.currentInput.length >= spellingState.answer.length) return;
  
  spellingState.currentInput += letter;
  updateSpellingBoxes();
  
  // 检查是否完成输入
  if (spellingState.currentInput.length === spellingState.answer.length) {
    document.getElementById('spellingCheckBtn').disabled = false;
  }
}

function deleteSpellingLetter() {
  if (spellingState.currentInput.length === 0) return;
  
  spellingState.currentInput = spellingState.currentInput.slice(0, -1);
  updateSpellingBoxes();
  document.getElementById('spellingCheckBtn').disabled = true;
}

function updateSpellingBoxes() {
  spellingState.answer.split('').forEach((_, i) => {
    const box = document.getElementById(`letterBox${i}`);
    box.textContent = spellingState.currentInput[i] || '';
    box.classList.remove('active', 'correct', 'wrong');
    
    if (i === spellingState.currentInput.length) {
      box.classList.add('active');
    }
  });
}

function checkSpelling() {
  if (gameState.isAnswered) return;
  gameState.isAnswered = true;
  
  const unit = getCurrentUnit();
  const word = unit.vocabulary[gameState.currentIndex];
  const isCorrect = spellingState.currentInput.toLowerCase() === spellingState.answer;
  
  // 显示结果
  spellingState.answer.split('').forEach((letter, i) => {
    const box = document.getElementById(`letterBox${i}`);
    if (spellingState.currentInput[i]?.toLowerCase() === letter.toLowerCase()) {
      box.classList.add('correct');
    } else {
      box.classList.add('wrong');
    }
  });
  
  if (isCorrect) {
    handleCorrectAnswer(word);
  } else {
    handleWrongAnswer(word);
  }
  
  setTimeout(() => nextQuestion(), 2000);
}

// ==================== 句子排序模式 ====================
// 包含两种形式：60%排序题 + 40%配对题
let sentenceState = {
  words: [],
  placedWords: [],
  correctOrder: [],
  isPairingMode: false  // 是否是配对模式
};

// 配对模式状态
let wordPairingState = {
  pairs: [],           // 配对数据 [{chinese, english}]
  shuffledChinese: [], // 打乱的中文
  shuffledEnglish: [], // 打乱的英文
  selectedChinese: null,
  selectedEnglish: null,
  matchedPairs: [],    // 已匹配的对
  isProcessing: false  // 防止快速点击
};

function renderSentenceMode(container) {
  const unit = getCurrentUnit();
  const sentence = unit.sentences[gameState.currentIndex];
  
  // 40%概率使用配对模式，60%概率使用排序模式
  const usePairingMode = Math.random() < 0.4;
  sentenceState.isPairingMode = usePairingMode;
  
  if (usePairingMode) {
    renderWordPairingMode(container, sentence);
  } else {
    renderSentenceOrderingMode(container, sentence);
  }
}

// 传统句子排序模式
function renderSentenceOrderingMode(container, sentence) {
  // 分割句子并打乱
  sentenceState.correctOrder = sentence.english.replace(/[.,!?]/g, '').split(' ');
  sentenceState.words = shuffleArray([...sentenceState.correctOrder]);
  sentenceState.placedWords = [];
  
  container.innerHTML = `
    <div class="sentence-container">
      <div class="sentence-chinese">${sentence.chinese}</div>
      <button class="sound-btn" onclick="playSentenceSound('${sentence.english}')" style="margin: 8px 0;">🔊 听句子</button>
      <div class="sentence-dropzone" id="dropzone">
        <span style="color: var(--text-muted);">点击下方单词组成句子</span>
      </div>
      <div class="words-pool" id="wordsPool">
        ${sentenceState.words.map((word, i) => `
          <div class="word-chip" id="word${i}" onclick="placeWord(${i})">${word}</div>
        `).join('')}
      </div>
      <button class="check-btn" onclick="checkSentence()" id="sentenceCheckBtn" disabled>检查答案</button>
    </div>
  `;
  
  // 自动播放句子发音
  setTimeout(() => {
    playSentenceSound(sentence.english);
  }, 300);
}

// 单词配对模式 - 把一个句子拆成中英文单词进行配对
function renderWordPairingMode(container, sentence) {
  // 使用当前单元的词汇表建立中英文对照
  const unit = getCurrentUnit();
  
  // 获取句子中的英文单词
  const englishWords = sentence.english.replace(/[.,!?]/g, '').split(' ').filter(w => w.length > 0);
  
  // 为每个英文单词找到对应的中文翻译（从词汇表中查找）
  const pairs = [];
  const vocabMap = {};
  unit.vocabulary.forEach(v => {
    vocabMap[v.english.toLowerCase()] = v.chinese;
  });
  
  // 找出句子中能够配对的单词
  englishWords.forEach(word => {
    const lowerWord = word.toLowerCase();
    if (vocabMap[lowerWord]) {
      pairs.push({ chinese: vocabMap[lowerWord], english: word });
    }
  });
  
  // 如果找不到足够的配对单词，使用基本的句子词汇
  if (pairs.length < 3) {
    // 使用一些常见的词汇对照
    const commonPairs = [
      { chinese: '我', english: 'I' },
      { chinese: '你', english: 'you' },
      { chinese: '喜欢', english: 'like' },
      { chinese: '想要', english: 'want' },
      { chinese: '有', english: 'have' },
      { chinese: '是', english: 'is' },
      { chinese: '和', english: 'and' },
      { chinese: '这个', english: 'this' },
      { chinese: '那个', english: 'that' },
      { chinese: '什么', english: 'what' }
    ];
    
    englishWords.forEach(word => {
      const found = commonPairs.find(p => p.english.toLowerCase() === word.toLowerCase());
      if (found && !pairs.some(p => p.english.toLowerCase() === word.toLowerCase())) {
        pairs.push({ chinese: found.chinese, english: word });
      }
    });
  }
  
  // 确保至少有3个配对
  if (pairs.length < 3) {
    // 如果还不够，直接用排序模式
    renderSentenceOrderingMode(container, sentence);
    return;
  }
  
  // 限制最多6个配对
  const finalPairs = pairs.slice(0, Math.min(6, pairs.length));
  
  wordPairingState.pairs = finalPairs;
  wordPairingState.shuffledChinese = shuffleArray([...finalPairs.map(p => p.chinese)]);
  wordPairingState.shuffledEnglish = shuffleArray([...finalPairs.map(p => p.english)]);
  wordPairingState.selectedChinese = null;
  wordPairingState.selectedEnglish = null;
  wordPairingState.matchedPairs = [];
  wordPairingState.isProcessing = false;
  
  container.innerHTML = `
    <div class="pairing-container">
      <div class="pairing-instruction">
        <h3>🔗 配对句子中的单词</h3>
        <p>句子：${sentence.chinese}</p>
      </div>
      <button class="sound-btn" onclick="playSentenceSound('${sentence.english}')" style="margin-bottom: 16px;">🔊 听句子</button>
      <div class="pairing-columns">
        <div class="pairing-column chinese-column">
          ${wordPairingState.shuffledChinese.map((word, i) => `
            <div class="pairing-item chinese-item" id="wpChinese-${i}" onclick="selectWordPairingItem('chinese', ${i}, '${word}')">${word}</div>
          `).join('')}
        </div>
        <div class="pairing-column english-column">
          ${wordPairingState.shuffledEnglish.map((word, i) => `
            <div class="pairing-item english-item" id="wpEnglish-${i}" onclick="selectWordPairingItem('english', ${i}, '${word}')">${word}</div>
          `).join('')}
        </div>
      </div>
      <div class="pairing-progress">
        <span id="wordPairingProgressText">已配对: 0 / ${finalPairs.length}</span>
      </div>
    </div>
  `;
  
  // 自动播放句子发音
  setTimeout(() => {
    playSentenceSound(sentence.english);
  }, 300);
}

// 单词配对选择
function selectWordPairingItem(type, index, word) {
  if (wordPairingState.isProcessing) return;
  
  const element = document.getElementById(`wp${type === 'chinese' ? 'Chinese' : 'English'}-${index}`);
  
  // 如果已匹配，不能再选
  if (element.classList.contains('matched')) return;
  
  // 取消之前的选择
  if (type === 'chinese') {
    if (wordPairingState.selectedChinese !== null) {
      const prevEl = document.getElementById(`wpChinese-${wordPairingState.selectedChinese.index}`);
      if (prevEl && !prevEl.classList.contains('matched')) {
        prevEl.classList.remove('selected');
      }
    }
    wordPairingState.selectedChinese = { index, word };
    element.classList.add('selected');
  } else {
    if (wordPairingState.selectedEnglish !== null) {
      const prevEl = document.getElementById(`wpEnglish-${wordPairingState.selectedEnglish.index}`);
      if (prevEl && !prevEl.classList.contains('matched')) {
        prevEl.classList.remove('selected');
      }
    }
    wordPairingState.selectedEnglish = { index, word };
    element.classList.add('selected');
    
    // 播放英文单词发音
    playWordSound(word);
  }
  
  // 检查是否两边都选了
  if (wordPairingState.selectedChinese && wordPairingState.selectedEnglish) {
    checkWordPairingMatch();
  }
}

// 检查单词配对是否正确
function checkWordPairingMatch() {
  wordPairingState.isProcessing = true;
  
  const chineseWord = wordPairingState.selectedChinese.word;
  const englishWord = wordPairingState.selectedEnglish.word;
  const chineseEl = document.getElementById(`wpChinese-${wordPairingState.selectedChinese.index}`);
  const englishEl = document.getElementById(`wpEnglish-${wordPairingState.selectedEnglish.index}`);
  
  // 检查是否匹配
  const isMatch = wordPairingState.pairs.some(p => p.chinese === chineseWord && p.english === englishWord);
  
  if (isMatch) {
    // 配对成功
    chineseEl.classList.remove('selected');
    englishEl.classList.remove('selected');
    chineseEl.classList.add('correct');
    englishEl.classList.add('correct');
    
    // 短暂显示绿色后变灰
    setTimeout(() => {
      chineseEl.classList.remove('correct');
      englishEl.classList.remove('correct');
      chineseEl.classList.add('matched');
      englishEl.classList.add('matched');
      
      wordPairingState.matchedPairs.push({ chinese: chineseWord, english: englishWord });
      updateWordPairingProgress();
      
      wordPairingState.selectedChinese = null;
      wordPairingState.selectedEnglish = null;
      wordPairingState.isProcessing = false;
      
      // 检查是否全部完成
      if (wordPairingState.matchedPairs.length === wordPairingState.pairs.length) {
        handleWordPairingComplete();
      }
    }, 600);
    
    // 增加分数
    gameState.score += 5;
    gameState.streak++;
    updateStats();
  } else {
    // 配对失败
    chineseEl.classList.remove('selected');
    englishEl.classList.remove('selected');
    chineseEl.classList.add('wrong');
    englishEl.classList.add('wrong');
    
    // 短暂显示红色后恢复
    setTimeout(() => {
      chineseEl.classList.remove('wrong');
      englishEl.classList.remove('wrong');
      
      wordPairingState.selectedChinese = null;
      wordPairingState.selectedEnglish = null;
      wordPairingState.isProcessing = false;
    }, 500);
    
    // 重置连击
    gameState.streak = 0;
    updateStats();
  }
}

function updateWordPairingProgress() {
  const progressText = document.getElementById('wordPairingProgressText');
  if (progressText) {
    progressText.textContent = `已配对: ${wordPairingState.matchedPairs.length} / ${wordPairingState.pairs.length}`;
  }
}

function handleWordPairingComplete() {
  const unit = getCurrentUnit();
  const sentence = unit.sentences[gameState.currentIndex];
  
  setTimeout(() => {
    handleCorrectAnswer(sentence);
    setTimeout(() => nextQuestion(), 1500);
  }, 500);
}

function placeWord(index) {
  const wordElement = document.getElementById(`word${index}`);
  if (wordElement.classList.contains('placed')) return;
  
  wordElement.classList.add('placed');
  sentenceState.placedWords.push(sentenceState.words[index]);
  
  updateDropzone();
  
  // 检查是否所有单词都已放置
  if (sentenceState.placedWords.length === sentenceState.correctOrder.length) {
    document.getElementById('sentenceCheckBtn').disabled = false;
  }
}

function updateDropzone() {
  const dropzone = document.getElementById('dropzone');
  if (sentenceState.placedWords.length === 0) {
    dropzone.innerHTML = '<span style="color: var(--text-muted);">点击下方单词组成句子</span>';
  } else {
    dropzone.innerHTML = sentenceState.placedWords.map((word, i) => `
      <div class="word-chip placed" onclick="removeWord(${i})">${word}</div>
    `).join('');
  }
}

function removeWord(index) {
  const removedWord = sentenceState.placedWords.splice(index, 1)[0];
  
  // 找到原始位置并恢复
  sentenceState.words.forEach((word, i) => {
    if (word === removedWord && document.getElementById(`word${i}`).classList.contains('placed')) {
      document.getElementById(`word${i}`).classList.remove('placed');
    }
  });
  
  updateDropzone();
  document.getElementById('sentenceCheckBtn').disabled = true;
}

function checkSentence() {
  if (gameState.isAnswered) return;
  gameState.isAnswered = true;
  
  const unit = getCurrentUnit();
  const sentence = unit.sentences[gameState.currentIndex];
  const isCorrect = sentenceState.placedWords.join(' ') === sentenceState.correctOrder.join(' ');
  
  if (isCorrect) {
    handleCorrectAnswer({ english: sentence.english, chinese: sentence.chinese });
  } else {
    handleWrongAnswer({ english: sentence.english, chinese: sentence.chinese });
    // 显示正确答案
    const dropzone = document.getElementById('dropzone');
    dropzone.innerHTML = `
      <div style="color: var(--error); margin-bottom: 8px;">正确答案：</div>
      ${sentenceState.correctOrder.map(word => `
        <div class="word-chip" style="background: var(--success); color: white; border-color: var(--success);">${word}</div>
      `).join('')}
    `;
  }
  
  setTimeout(() => nextQuestion(), 2000);
}

// ==================== 填空选择模式 ====================
function renderFillMode(container) {
  const unit = getCurrentUnit();
  const sentence = unit.sentences[gameState.currentIndex];
  
  // 随机选择一个单词作为填空
  const words = sentence.english.split(' ');
  const blankIndex = Math.floor(Math.random() * words.length);
  const correctAnswer = words[blankIndex].replace(/[.,!?]/g, '');
  
  // 生成选项
  const allWords = unit.vocabulary.map(v => v.english);
  let options = [correctAnswer];
  while (options.length < 4) {
    const randomWord = allWords[Math.floor(Math.random() * allWords.length)];
    if (!options.includes(randomWord)) {
      options.push(randomWord);
    }
  }
  options = shuffleArray(options);
  
  // 构建带空白的句子
  const sentenceWithBlank = words.map((word, i) => 
    i === blankIndex ? '<span class="fill-blank" id="fillBlank">_____</span>' : word
  ).join(' ');
  
  container.innerHTML = `
    <div class="fill-container">
      <div class="sentence-chinese" style="margin-bottom: 24px;">${sentence.chinese}</div>
      <div class="fill-sentence" id="fillSentence">${sentenceWithBlank}</div>
      <div class="fill-options" id="fillOptions">
        ${options.map(opt => `
          <button class="fill-option" onclick="checkFillAnswer('${opt}', '${correctAnswer}', this)">
            ${opt}
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

function checkFillAnswer(selected, correct, element) {
  if (gameState.isAnswered) return;
  gameState.isAnswered = true;
  
  const unit = getCurrentUnit();
  const sentence = unit.sentences[gameState.currentIndex];
  
  document.getElementById('fillBlank').textContent = selected;
  
  if (selected === correct) {
    element.classList.add('correct');
    handleCorrectAnswer({ english: sentence.english, chinese: sentence.chinese });
  } else {
    element.classList.add('wrong');
    document.querySelectorAll('.fill-option').forEach(btn => {
      if (btn.textContent.trim() === correct) {
        btn.classList.add('correct');
      }
    });
    handleWrongAnswer({ english: sentence.english, chinese: sentence.chinese });
  }
  
  setTimeout(() => nextQuestion(), 1500);
}

// ==================== 情景对话模式 ====================
function renderDialogueMode(container) {
  const unit = getCurrentUnit();
  const dialogue = unit.dialogues[gameState.currentIndex];
  
  if (!dialogue) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📚</div>
        <div class="empty-text">本单元暂无情景对话题</div>
      </div>
    `;
    return;
  }
  
  container.innerHTML = `
    <div class="dialogue-container">
      <div class="dialogue-scene">
        <div class="scene-label">场景</div>
        <div class="scene-text">${dialogue.scene} - ${dialogue.context}</div>
      </div>
      <div class="dialogue-bubble speaker-a">
        <div class="speaker-name">Speaker A</div>
        <div class="bubble-text">${dialogue.speakerA}</div>
      </div>
      <div style="text-align: center; color: var(--text-secondary); font-weight: 600;">选择你的回应：</div>
      <div class="dialogue-options" id="dialogueOptions">
        ${dialogue.options.map((opt, i) => `
          <button class="dialogue-option" onclick="checkDialogueAnswer(${opt.correct}, this, ${i})">
            ${opt.text}
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

function checkDialogueAnswer(isCorrect, element, optionIndex) {
  if (gameState.isAnswered) return;
  gameState.isAnswered = true;
  
  const unit = getCurrentUnit();
  const dialogue = unit.dialogues[gameState.currentIndex];
  const correctOption = dialogue.options.find(o => o.correct);
  
  if (isCorrect) {
    element.classList.add('correct');
    handleCorrectAnswer({ english: correctOption.text, chinese: dialogue.context });
  } else {
    element.classList.add('wrong');
    document.querySelectorAll('.dialogue-option').forEach(btn => {
      const opt = dialogue.options[Array.from(btn.parentNode.children).indexOf(btn)];
      if (opt && opt.correct) {
        btn.classList.add('correct');
      }
    });
    handleWrongAnswer({ english: dialogue.speakerA, chinese: dialogue.context });
  }
  
  setTimeout(() => nextQuestion(), 1500);
}

// ==================== 答题处理 ====================
function handleCorrectAnswer(item) {
  gameState.streak++;
  const bonusCoins = 10 + Math.floor(gameState.streak / 3) * 5;
  addCoins(bonusCoins);
  addScore(10);
  
  playSound('correct');
  showFeedback(true, getRandomEncouragement(), `+${bonusCoins} 金币`, bonusCoins);
  
  if (gameState.streak % 5 === 0) {
    showConfetti();
  }
  
  updateStats();
  saveProgress();
}

function handleWrongAnswer(item) {
  gameState.streak = 0;
  
  // 添加到错题本
  const key = `${item.english}`;
  if (!gameState.mistakes[key]) {
    gameState.mistakes[key] = {
      english: item.english,
      chinese: item.chinese,
      count: 0,
      unit: gameState.currentUnit
    };
  }
  gameState.mistakes[key].count++;
  
  playSound('wrong');
  showFeedback(false, getRandomErrorMessage(), item.english);
  
  updateStats();
  saveProgress();
}

function addCoins(amount) {
  gameState.coins += amount;
  animateCoinAdd();
}

function addScore(amount) {
  gameState.score += amount;
}

function animateCoinAdd() {
  const coinDisplay = document.getElementById('coinDisplay');
  coinDisplay.style.transform = 'scale(1.2)';
  setTimeout(() => {
    coinDisplay.style.transform = 'scale(1)';
  }, 200);
}

// ==================== 反馈系统 ====================
function showFeedback(isSuccess, title, message, coins = 0) {
  const overlay = document.getElementById('feedbackOverlay');
  const icon = document.getElementById('feedbackIcon');
  const titleEl = document.getElementById('feedbackTitle');
  const messageEl = document.getElementById('feedbackMessage');
  const coinReward = document.getElementById('coinReward');
  const coinValue = document.getElementById('coinRewardValue');
  
  icon.textContent = isSuccess ? '🎉' : '💪';
  titleEl.textContent = title;
  titleEl.className = `feedback-title ${isSuccess ? 'success' : 'error'}`;
  messageEl.textContent = message;
  
  if (isSuccess && coins > 0) {
    coinReward.classList.remove('hidden');
    coinValue.textContent = `+${coins}`;
  } else {
    coinReward.classList.add('hidden');
  }
  
  overlay.classList.add('show');
  
  // 自动关闭
  setTimeout(() => closeFeedback(), 1200);
}

function closeFeedback() {
  document.getElementById('feedbackOverlay').classList.remove('show');
}

function showCompletionFeedback() {
  const bonusCoins = 50;
  addCoins(bonusCoins);
  showConfetti();
  
  setTimeout(() => {
    showFeedback(true, '挑战完成！🏆', `获得 ${bonusCoins} 金币奖励！`, bonusCoins);
    setTimeout(() => exitGame(), 2000);
  }, 500);
}

function getRandomEncouragement() {
  return learningData.encouragements[Math.floor(Math.random() * learningData.encouragements.length)];
}

function getRandomErrorMessage() {
  return learningData.errorMessages[Math.floor(Math.random() * learningData.errorMessages.length)];
}

// ==================== 错题本 ====================
function showMistakeBook() {
  const overlay = document.getElementById('mistakeBookOverlay');
  const list = document.getElementById('mistakesList');
  
  const mistakes = Object.values(gameState.mistakes);
  
  if (mistakes.length === 0) {
    list.innerHTML = `
      <div class="empty-state" style="min-height: 150px;">
        <div class="empty-icon">✨</div>
        <div class="empty-text">还没有错题，继续保持！</div>
      </div>
    `;
  } else {
    list.innerHTML = mistakes.sort((a, b) => b.count - a.count).map(item => `
      <div class="mistake-item">
        <div class="mistake-content">
          <div class="mistake-english">${item.english}</div>
          <div class="mistake-chinese">${item.chinese}</div>
        </div>
        <div class="mistake-count">
          <span>错误</span>
          <span>${item.count}次</span>
        </div>
      </div>
    `).join('');
  }
  
  overlay.classList.add('show');
}

function closeMistakeBook() {
  document.getElementById('mistakeBookOverlay').classList.remove('show');
}

// ==================== 音效系统 ====================
function playSound(type) {
  // 使用Web Audio API生成简单音效
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  if (type === 'correct') {
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
    oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.4);
  } else if (type === 'wrong') {
    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  }
}

function playWordSound(word) {
  // 使用Web Speech API朗读单词
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
  }
}

// ==================== 特效 ====================
function showConfetti() {
  const container = document.getElementById('confettiContainer');
  container.classList.remove('hidden');
  container.innerHTML = '';
  
  const colors = ['#6366f1', '#f59e0b', '#10b981', '#ec4899', '#3b82f6'];
  
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti-piece';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDelay = Math.random() * 0.5 + 's';
    container.appendChild(confetti);
  }
  
  setTimeout(() => {
    container.classList.add('hidden');
    container.innerHTML = '';
  }, 3000);
}

// ==================== 工具函数 ====================
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

function getWordEmoji(word) {
  // 根据单词返回对应的emoji
  const emojiMap = {
    // Unit 1 - Food
    'meat': '🥩',
    'milk': '🥛',
    'fruit': '🍎',
    'vegetables': '🥬',
    'bread': '🍞',
    'egg': '🥚',
    'cake': '🎂',
    'candy': '🍬',
    'chip': '🍟',
    'juice': '🧃',
    
    // Unit 2 - Environment
    'water': '💧',
    'bottle': '🍶',
    'paper': '📄',
    'plastic': '🥤',
    'earth': '🌍',
    'tree': '🌳',
    'recycle': '♻️',
    'clean': '✨',
    'waste': '🗑️',
    'protect': '🛡️',
    
    // Unit 3 - Friendship
    'friend': '👫',
    'share': '🤝',
    'help': '🙋',
    'happy': '😊',
    'kind': '💖',
    'nice': '👍',
    'together': '👨‍👩‍👧‍👦',
    'play': '🎮',
    'listen': '👂',
    'respect': '🙏',
    
    // Unit 4 - Self-improvement
    'try': '💪',
    'learn': '📚',
    'practice': '🏃',
    'goal': '🎯',
    'brave': '🦁',
    'keep': '🔄',
    'fail': '📉',
    'success': '🏆',
    'dream': '💭',
    'grow': '🌱',
    
    // Unit 5 - Future
    'future': '🔮',
    'robot': '🤖',
    'travel': '✈️',
    'fly': '🦅',
    'space': '🚀',
    'car': '🚗',
    'technology': '💻',
    'smart': '🧠',
    'live': '🏠',
    'change': '🔄',
    
    // Unit 1 - Additional Food
    'fish': '🐟',
    'beef': '🥩',
    'noodle': '🍜',
    'soup': '🥣',
    'chicken': '🍗',
    'apple': '🍎',
    'potato': '🥔',
    'chocolate': '🍫',
    'cola': '🥤',
    'biscuit': '🍪',
    
    // Unit 6 - Festivals
    'festival': '🎉',
    'celebrate': '🎊',
    'lantern': '🏮',
    'dragon': '🐉',
    'mooncake': '🥮',
    'firework': '🎆',
    'dumpling': '🥟',
    'wish': '⭐',
    'luck': '🍀',
    'gift': '🎁',
    'party': '🎈',
    'candle': '🕯️'
  };
  
  return emojiMap[word.toLowerCase()] || '📝';
}

// ==================== 限时挑战模式 ====================
let challengeState = {
  timer: 60,
  timerInterval: null,
  correctCount: 0,
  totalCount: 0,
  questions: [],
  currentQuestion: null
};

function startChallengeMode() {
  const unit = getCurrentUnit();
  
  // 准备混合题目
  challengeState.questions = [];
  challengeState.timer = 60;
  challengeState.correctCount = 0;
  challengeState.totalCount = 0;
  
  // 添加词汇选择题
  unit.vocabulary.forEach(word => {
    challengeState.questions.push({
      type: 'match',
      data: word,
      options: generateOptions(unit.vocabulary, word, 4)
    });
  });
  
  // 打乱问题顺序
  challengeState.questions = shuffleArray(challengeState.questions);
  
  // 开始计时
  challengeState.timerInterval = setInterval(updateChallengeTimer, 1000);
  
  // 显示第一题
  nextChallengeQuestion();
}

function updateChallengeTimer() {
  challengeState.timer--;
  
  const timerEl = document.getElementById('challengeTimer');
  if (timerEl) {
    timerEl.textContent = challengeState.timer;
    if (challengeState.timer <= 10) {
      timerEl.classList.add('warning');
    }
  }
  
  if (challengeState.timer <= 0) {
    endChallenge();
  }
}

function nextChallengeQuestion() {
  if (challengeState.questions.length === 0) {
    endChallenge();
    return;
  }
  
  gameState.isAnswered = false;
  challengeState.currentQuestion = challengeState.questions.shift();
  renderChallengeQuestion();
}

function renderChallengeQuestion() {
  const container = document.getElementById('gameContent');
  const q = challengeState.currentQuestion;
  
  container.innerHTML = `
    <div class="challenge-timer">
      <span class="timer-icon">⏱️</span>
      <span class="timer-value" id="challengeTimer">${challengeState.timer}</span>
      <span style="font-size: 1rem; color: var(--text-secondary);">秒</span>
      <span style="margin-left: 24px;" class="challenge-score">
        ✅ ${challengeState.correctCount} / ${challengeState.totalCount}
      </span>
    </div>
    <div class="match-container">
      <div class="match-image-wrapper">
        <div style="font-size: 6rem;">${getWordEmoji(q.data.english)}</div>
      </div>
      <div class="spelling-chinese" style="margin: 16px 0;">${q.data.chinese}</div>
      <div class="match-options" id="challengeOptions">
        ${q.options.map(opt => `
          <button class="match-option" onclick="checkChallengeAnswer('${opt.english}', '${q.data.english}', this)">
            ${opt.english}
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

function checkChallengeAnswer(selected, correct, element) {
  if (gameState.isAnswered) return;
  gameState.isAnswered = true;
  
  challengeState.totalCount++;
  
  if (selected === correct) {
    element.classList.add('correct');
    challengeState.correctCount++;
    addCoins(5);
    playSound('correct');
  } else {
    element.classList.add('wrong');
    document.querySelectorAll('.match-option').forEach(btn => {
      if (btn.textContent.trim() === correct) {
        btn.classList.add('correct');
      }
    });
    playSound('wrong');
  }
  
  updateStats();
  
  setTimeout(() => nextChallengeQuestion(), 800);
}

function endChallenge() {
  clearInterval(challengeState.timerInterval);
  
  const bonusCoins = challengeState.correctCount * 10;
  addCoins(bonusCoins);
  
  showConfetti();
  
  const container = document.getElementById('gameContent');
  container.innerHTML = `
    <div style="text-align: center; padding: 40px;">
      <div style="font-size: 4rem; margin-bottom: 16px;">🏆</div>
      <h2 style="font-size: 2rem; margin-bottom: 16px; color: var(--primary);">挑战结束！</h2>
      <div style="font-size: 1.5rem; color: var(--text-primary); margin-bottom: 8px;">
        正确率: ${challengeState.correctCount} / ${challengeState.totalCount}
      </div>
      <div style="font-size: 1.2rem; color: var(--text-secondary); margin-bottom: 24px;">
        ${Math.round((challengeState.correctCount / challengeState.totalCount) * 100) || 0}%
      </div>
      <div class="coin-reward" style="justify-content: center; margin-bottom: 24px;">
        <span>🪙</span>
        <span>+${bonusCoins} 金币奖励</span>
      </div>
      <button class="nav-btn" onclick="exitGame()">返回</button>
    </div>
  `;
  
  saveProgress();
}

// ==================== 学习统计系统 ====================
const learningStats = {
  totalAnswers: parseInt(localStorage.getItem('totalAnswers') || '0'),
  correctAnswers: parseInt(localStorage.getItem('correctAnswers') || '0'),
  maxStreak: parseInt(localStorage.getItem('maxStreak') || '0'),
  studyStartTime: null,
  totalStudyTime: parseInt(localStorage.getItem('totalStudyTime') || '0'), // 分钟
  weeklyData: JSON.parse(localStorage.getItem('weeklyData') || '{}'),
  unitProgress: JSON.parse(localStorage.getItem('unitProgress') || '{}')
};

// 开始记录学习时间
document.addEventListener('DOMContentLoaded', () => {
  learningStats.studyStartTime = Date.now();
});

// 页面关闭前保存学习时间
window.addEventListener('beforeunload', () => {
  if (learningStats.studyStartTime) {
    const sessionMinutes = Math.floor((Date.now() - learningStats.studyStartTime) / 60000);
    learningStats.totalStudyTime += sessionMinutes;
    localStorage.setItem('totalStudyTime', learningStats.totalStudyTime);
  }
  
  // 更新今日学习数据
  const today = new Date().toISOString().split('T')[0];
  learningStats.weeklyData[today] = (learningStats.weeklyData[today] || 0) + 1;
  localStorage.setItem('weeklyData', JSON.stringify(learningStats.weeklyData));
});

function recordAnswer(isCorrect) {
  learningStats.totalAnswers++;
  if (isCorrect) {
    learningStats.correctAnswers++;
  }
  
  if (gameState.streak > learningStats.maxStreak) {
    learningStats.maxStreak = gameState.streak;
    localStorage.setItem('maxStreak', learningStats.maxStreak);
  }
  
  localStorage.setItem('totalAnswers', learningStats.totalAnswers);
  localStorage.setItem('correctAnswers', learningStats.correctAnswers);
  
  // 更新今日数据
  const today = new Date().toISOString().split('T')[0];
  learningStats.weeklyData[today] = (learningStats.weeklyData[today] || 0) + 1;
  localStorage.setItem('weeklyData', JSON.stringify(learningStats.weeklyData));
}

function showStatsPanel() {
  updateStatsData();
  renderUnitProgress();
  renderWeeklyChart();
  document.getElementById('statsPanelOverlay').classList.add('show');
}

function closeStatsPanel() {
  document.getElementById('statsPanelOverlay').classList.remove('show');
}

function updateStatsData() {
  // 计算已学单词
  const totalWords = learningData.units.reduce((sum, unit) => sum + unit.vocabulary.length, 0);
  document.getElementById('statsTotalWords').textContent = totalWords;
  
  // 正确率
  const correctRate = learningStats.totalAnswers > 0 
    ? Math.round((learningStats.correctAnswers / learningStats.totalAnswers) * 100) 
    : 0;
  document.getElementById('statsCorrectRate').textContent = `${correctRate}%`;
  
  // 最长连击
  document.getElementById('statsMaxStreak').textContent = learningStats.maxStreak;
  
  // 学习时长
  const currentSessionMinutes = learningStats.studyStartTime 
    ? Math.floor((Date.now() - learningStats.studyStartTime) / 60000)
    : 0;
  const totalMinutes = learningStats.totalStudyTime + currentSessionMinutes;
  document.getElementById('statsStudyTime').textContent = `${totalMinutes}分钟`;
}

function renderWeeklyChart() {
  const chart = document.getElementById('weeklyChart');
  const days = ['日', '一', '二', '三', '四', '五', '六'];
  const today = new Date();
  
  // 获取最近7天的数据
  const weekData = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    weekData.push({
      day: days[date.getDay()],
      count: learningStats.weeklyData[dateStr] || 0,
      isToday: i === 0
    });
  }
  
  // 找到最大值
  const maxCount = Math.max(...weekData.map(d => d.count), 1);
  
  chart.innerHTML = weekData.map(d => `
    <div class="chart-bar ${d.isToday ? 'active' : ''}" 
         style="--bar-height: ${Math.max((d.count / maxCount) * 100, 5)}%">
      <span>${d.day}</span>
    </div>
  `).join('');
}

function renderUnitProgress() {
  const list = document.getElementById('unitProgressList');
  
  list.innerHTML = learningData.units.map(unit => {
    // 计算进度（这里简化为基于错题本的数据）
    const unitMistakes = Object.values(gameState.mistakes).filter(m => m.unit === unit.id).length;
    const totalWords = unit.vocabulary.length;
    const masteredWords = Math.max(0, totalWords - unitMistakes);
    const progress = Math.round((masteredWords / totalWords) * 100);
    
    return `
      <div class="unit-progress-item">
        <div class="unit-progress-icon">${unit.icon}</div>
        <div class="unit-progress-info">
          <div class="unit-progress-name">Unit ${unit.id}: ${unit.title}</div>
          <div class="unit-progress-bar-container">
            <div class="unit-progress-bar-fill" style="width: ${progress}%"></div>
          </div>
        </div>
        <div class="unit-progress-percent">${progress}%</div>
      </div>
    `;
  }).join('');
}

function exportLearningRecord() {
  const data = {
    exportDate: new Date().toLocaleString('zh-CN'),
    studentName: '五年级学生',
    summary: {
      totalCoins: gameState.coins,
      totalScore: gameState.score,
      totalAnswers: learningStats.totalAnswers,
      correctAnswers: learningStats.correctAnswers,
      correctRate: learningStats.totalAnswers > 0 
        ? Math.round((learningStats.correctAnswers / learningStats.totalAnswers) * 100) + '%'
        : '0%',
      maxStreak: learningStats.maxStreak,
      totalStudyTime: learningStats.totalStudyTime + '分钟'
    },
    mistakes: Object.values(gameState.mistakes),
    weeklyData: learningStats.weeklyData
  };
  
  // 创建文本报告
  let report = `
╔══════════════════════════════════════════════════════════════╗
║                    📊 英语学习报告                           ║
╚══════════════════════════════════════════════════════════════╝

📅 导出时间: ${data.exportDate}

═══════════════════ 学习概况 ═══════════════════

🪙 获得金币: ${data.summary.totalCoins}
⭐ 总积分: ${data.summary.totalScore}
📝 答题总数: ${data.summary.totalAnswers}
✅ 正确数: ${data.summary.correctAnswers}
📈 正确率: ${data.summary.correctRate}
🔥 最长连击: ${data.summary.maxStreak}
⏱️ 学习时长: ${data.summary.totalStudyTime}

═══════════════════ 错题记录 ═══════════════════
`;
  
  if (data.mistakes.length > 0) {
    data.mistakes.forEach((m, i) => {
      report += `\n${i + 1}. ${m.english} - ${m.chinese} (错误${m.count}次)`;
    });
  } else {
    report += '\n🎉 太棒了！没有错题记录！';
  }
  
  report += '\n\n═══════════════════ 继续加油！ ═══════════════════\n';
  
  // 下载文件
  const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `英语学习报告_${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showFeedback(true, '导出成功！', '学习报告已下载', 0);
}

// 在正确/错误答案处理中记录统计
const originalHandleCorrectAnswer = handleCorrectAnswer;
handleCorrectAnswer = function(item) {
  recordAnswer(true);
  originalHandleCorrectAnswer(item);
};

const originalHandleWrongAnswer = handleWrongAnswer;
handleWrongAnswer = function(item) {
  recordAnswer(false);
  originalHandleWrongAnswer(item);
};

// ==================== 增强音频发音功能 ====================
// 使用多种TTS API提供更好的发音体验
async function playWordSound(word) {
  // 首先尝试使用浏览器自带的语音合成
  if ('speechSynthesis' in window) {
    // 取消正在播放的语音
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.8; // 稍慢一点，适合学习
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // 尝试找到更好的英语声音
    const voices = speechSynthesis.getVoices();
    const englishVoice = voices.find(v => 
      v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Microsoft'))
    ) || voices.find(v => v.lang.startsWith('en-US'));
    
    if (englishVoice) {
      utterance.voice = englishVoice;
    }
    
    speechSynthesis.speak(utterance);
    
    // 添加视觉反馈
    const soundBtns = document.querySelectorAll('.sound-btn');
    soundBtns.forEach(btn => {
      btn.style.transform = 'scale(1.2)';
      setTimeout(() => {
        btn.style.transform = 'scale(1)';
      }, 200);
    });
  }
}

// 播放句子
function playSentenceSound(sentence) {
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.lang = 'en-US';
    utterance.rate = 0.75; // 句子读慢一点
    utterance.pitch = 1.0;
    
    speechSynthesis.speak(utterance);
  }
}

// 确保voices已加载
if ('speechSynthesis' in window) {
  speechSynthesis.onvoiceschanged = () => {
    // Voices loaded
  };
}

