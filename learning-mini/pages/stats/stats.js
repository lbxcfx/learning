const app = getApp();

Page({
    data: {
        score: 0,
        coins: 0,
        streak: 0,
        learnedWordsCount: 0,
        accuracy: 92, // Simulated for now
        weeklyActivity: [
            { day: '一', height: 40, active: false },
            { day: '二', height: 60, active: false },
            { day: '三', height: 30, active: false },
            { day: '四', height: 80, active: true }, // Today approximation
            { day: '五', height: 0, active: false },
            { day: '六', height: 0, active: false },
            { day: '日', height: 0, active: false }
        ]
    },

    onShow() {
        const { score, coins, streak, learnedWords } = app.globalData;

        // Simple logic to highlight "today" in chart (just random for demo)
        const day = new Date().getDay(); // 0 is Sunday
        const days = ['日', '一', '二', '三', '四', '五', '六'];
        const todayLabel = days[day];

        const weeklyActivity = this.data.weeklyActivity.map(item => ({
            ...item,
            active: item.day === todayLabel,
            height: item.day === todayLabel ? Math.min((score / 500) * 100, 100) : item.height // height depends on score somewhat
        }));

        this.setData({
            score,
            coins,
            streak,
            learnedWordsCount: learnedWords.length,
            weeklyActivity
        });
    }
});
