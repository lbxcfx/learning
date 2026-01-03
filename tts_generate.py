#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
阿里云CosyVoice TTS批量合成脚本
合成所有单词和句子的MP3文件，保存到wavs文件夹
"""

import os
import time
import hashlib
from pathlib import Path

import dashscope
from dashscope.audio.tts_v2 import SpeechSynthesizer, AudioFormat

# ==================== 配置 ====================
DASHSCOPE_API_KEY = "sk-48e5e88388384e06938acb67198b655a"
TTS_MODEL = "cosyvoice-v2"
TTS_VOICE = "loongdonna_v2"  # 美式英文女声
TTS_FORMAT = AudioFormat.MP3_16000HZ_MONO_128KBPS

OUTPUT_DIR = Path(__file__).parent / "wavs"

# ==================== 学习内容 ====================
# 所有需要合成的单词
WORDS = [
    # Unit 1
    "meat", "milk", "fruit", "vegetables", "bread", "egg", "cake", "candy", "chip", "juice",
    # Unit 2
    "water", "bottle", "paper", "plastic", "earth", "tree", "recycle", "clean", "waste", "protect",
    # Unit 3
    "friend", "share", "help", "happy", "kind", "nice", "together", "play", "listen", "respect",
    # Unit 4
    "try", "learn", "practice", "goal", "brave", "keep", "fail", "success", "dream", "grow",
    # Unit 5
    "future", "robot", "travel", "fly", "space", "car", "technology", "smart", "live", "change",
    # Unit 6
    "festival", "celebrate", "lantern", "dragon", "mooncake", "firework", "dumpling", "wish", "luck", "gift"
]

# 所有需要合成的句子
SENTENCES = [
    # Unit 1
    "We should eat more vegetables.",
    "Don't eat too much candy.",
    "Milk is good for your health.",
    "We should drink more water.",
    "Don't eat too fast.",
    # Unit 2
    "Please don't waste water.",
    "We can recycle old paper.",
    "Let's protect the earth.",
    "Don't use too much plastic.",
    "We should plant more trees.",
    # Unit 3
    "We often play together.",
    "Good friends share with each other.",
    "I like to help my friends.",
    "Be kind to everyone.",
    "Listen to your friends.",
    # Unit 4
    "I'm going to learn swimming.",
    "Keep going, don't give up!",
    "It's okay to fail.",
    "I want to be a better me.",
    "Practice makes perfect.",
    # Unit 5
    "Will robots help us in the future?",
    "Yes, they will.",
    "We will travel to space.",
    "Cars will fly in the future.",
    "The world will change a lot.",
    # Unit 6
    "How do you celebrate Spring Festival?",
    "We eat dumplings and watch fireworks.",
    "I'm going to visit my grandparents.",
    "Happy New Year!",
    "What do people do at Mid-Autumn Festival?"
]


def get_filename(text: str) -> str:
    """生成文件名：使用文本的MD5哈希"""
    return hashlib.md5(text.lower().encode('utf-8')).hexdigest() + ".mp3"


def synthesize(text: str, output_path: Path) -> bool:
    """合成单个文本"""
    try:
        synthesizer = SpeechSynthesizer(
            model=TTS_MODEL,
            voice=TTS_VOICE,
            format=TTS_FORMAT
        )
        audio = synthesizer.call(text)
        if audio:
            with open(output_path, 'wb') as f:
                f.write(audio)
            return True
    except Exception as e:
        print(f"  ❌ 错误: {e}")
    return False


def main():
    print("🎙️ CosyVoice TTS 批量合成")
    print(f"音色: {TTS_VOICE} (美式英文女声)")
    print(f"输出: {OUTPUT_DIR}")
    print("-" * 50)
    
    dashscope.api_key = DASHSCOPE_API_KEY
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    success, failed = 0, 0
    
    # 合成单词
    print("\n📖 合成单词...")
    for word in WORDS:
        filename = get_filename(word)
        filepath = OUTPUT_DIR / filename
        
        if filepath.exists():
            print(f"  ⏭️ {word} -> {filename} (已存在)")
            continue
        
        print(f"  🔊 {word} -> {filename}", end=" ")
        if synthesize(word, filepath):
            print("✅")
            success += 1
        else:
            print("❌")
            failed += 1
        time.sleep(0.2)
    
    # 合成句子
    print("\n📝 合成句子...")
    for sentence in SENTENCES:
        filename = get_filename(sentence)
        filepath = OUTPUT_DIR / filename
        
        if filepath.exists():
            print(f"  ⏭️ {sentence[:30]}... -> {filename} (已存在)")
            continue
        
        print(f"  🔊 {sentence[:30]}... -> {filename}", end=" ")
        if synthesize(sentence, filepath):
            print("✅")
            success += 1
        else:
            print("❌")
            failed += 1
        time.sleep(0.2)
    
    print("\n" + "=" * 50)
    print(f"✅ 完成! 成功: {success}, 失败: {failed}")
    print(f"📁 文件保存在: {OUTPUT_DIR}")
    print("\n💡 小程序调用示例:")
    print(f'   const filename = md5("hello") + ".mp3";')
    print(f'   const url = "cloud://xxx/audio/" + filename;')


if __name__ == "__main__":
    main()
