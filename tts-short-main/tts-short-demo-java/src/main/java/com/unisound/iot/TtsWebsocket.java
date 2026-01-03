package com.unisound.iot;

import com.unisound.iot.util.SignCheck;

import javax.websocket.ContainerProvider;
import javax.websocket.Session;
import javax.websocket.WebSocketContainer;
import java.net.URI;

/**
 * 类功能
 *
 * @author unisound
 * @date 2020/9/25
 */
public class TtsWebsocket {

    static String host = "wss://ws-stts.hivoice.cn/v1/tts?";

    static String appkey = "******************";
    static String secret = "******************";

    public static void main(String[] args) throws Exception {
        String fileName = System.currentTimeMillis()+".mp3";
        String text = "云知声专注于物联网人工智能服务，拥有完全自主知识产权，是世界领先的智能语音识别AI技术企业之一。公司成立于2012年6月29日，总部位于北京，在上海、深圳、厦门、合肥均设有分公司。";

        long time = System.currentTimeMillis();
        StringBuilder paramBuilder = new StringBuilder();
        paramBuilder.append(appkey).append(time).append(secret);
        String sign = SignCheck.getSHA256Digest(paramBuilder.toString());

        StringBuilder param = new StringBuilder();
        param.append("appkey=").append(appkey).append("&")
                .append("time=").append(time).append("&")
                .append("sign=").append(sign);
        String str = host + param.toString();
        System.out.println(str);
        URI uri = new URI(str);

        WebSocketContainer container = ContainerProvider.getWebSocketContainer();

        Session session = container.connectToServer(new TtsClientEndpoint(fileName, text), uri);
        //TODO  客户端要设置
        session.setMaxBinaryMessageBufferSize(1024 * 1024 * 10);

        while (true) {
            Thread.sleep(1000);
            if (!session.isOpen()) {
                break;
            }
        }
    }


}
