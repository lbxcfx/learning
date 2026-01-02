package com.youdao.aicloud.translate;

import com.youdao.aicloud.translate.utils.AuthV3Util;
import com.youdao.aicloud.translate.utils.FileUtil;
import com.youdao.aicloud.translate.utils.HttpUtil;

import java.io.IOException;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.Map;

/**
 * 网易有道智云语音合成服务api调用demo
 * api接口: https://openapi.youdao.com/ttsapi
 */
public class TtsDemo {

    private static final String APP_KEY = "";     // 您的应用ID
    private static final String APP_SECRET = "";  // 您的应用密钥

    // 合成音频保存路径, 例windows路径：PATH = "C:\\tts\\media.mp3";
    private static final String PATH = "";

    public static void main(String[] args) throws NoSuchAlgorithmException, IOException {
        // 添加请求参数
        Map<String, String[]> params = createRequestParams();
        // 添加鉴权相关参数
        AuthV3Util.addAuthParams(APP_KEY, APP_SECRET, params);
        // 请求api服务
        byte[] result = HttpUtil.doPost("https://openapi.youdao.com/ttsapi", null, params, "audio");
        // 打印返回结果
        if (result != null) {
            String path = FileUtil.saveFile(PATH, result, false);
            System.out.println("save path:" + path);
        }
        System.exit(1);
    }

    private static Map<String, String[]> createRequestParams() {
        /*
         * note: 将下列变量替换为需要请求的参数
         */
        String q = "待合成文本";
        String voiceName = "发言人名称";
        String format = "mp3";

        return new HashMap<String, String[]>() {{
            put("q", new String[]{q});
            put("voiceName", new String[]{voiceName});
            put("format", new String[]{format});
        }};
    }
}
