// cloudfunctions/getRankings/index.js
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
    console.log('📊 getRankings 云函数被调用')

    try {
        // 使用管理员权限获取所有用户数据
        // 云函数中 db.collection 默认有管理员权限，不受安全规则限制
        const result = await db.collection('users')
            .orderBy('score', 'desc')
            .limit(100) // 获取更多数据以确保排行榜完整
            .field({
                _openid: true,
                userInfo: true,
                score: true,
                streak: true,
                coins: true
            })
            .get()

        console.log('📊 查询结果数量:', result.data.length)
        console.log('📊 查询结果:', JSON.stringify(result.data.slice(0, 5))) // 只打印前5条避免日志过长

        return {
            data: result.data,
            success: true,
            count: result.data.length
        }
    } catch (err) {
        console.error('❌ getRankings 错误:', err)
        return {
            success: false,
            errMsg: err.message || String(err),
            data: []
        }
    }
}
