# -*- coding: UTF-8 -*-
import json
import threading
from websocket import create_connection

cn_url = "ws://ws-edu.hivoice.cn:8081/ws/eval/pcm"
test2_text = "He found a ball, a toy car, a sticky sweet and a dusty sock"


class Client:

    def __init__(self):
        self.eof = "test-eof"
        self.ws = create_connection(cn_url)
        self.trecv = threading.Thread(target=self.recv)
        self.trecv.start()

    def send(self):

        first_msg = json.dumps({
            "appkey": "xxxxx",
            "audioFormat": "pcm",
            "displayText": test2_text,
            "eof": "test-eof",
            "mode": "para",
            "scoreCoefficient": "1"
        })
        self.ws.send(first_msg)

        file_object = open("./audio/test2.pcm", "rb")
        while True:
            chunk = file_object.read(1000)
            if not chunk:
                break
            self.ws.send(chunk)
            # time.sleep(0.01)

        self.ws.send(self.eof)
        # print("audio send end")

    def recv(self):
        result = str(self.ws.recv())
        if len(result) == 0:
            print("receive result end")
            return
        result_dict = json.loads(result)
        # 解析结果
        print(result)

    def close(self):
        self.ws.close()
        # print("websocket connection closed")


if __name__ == '__main__':
    client = Client()
    client.send()
    client.close()
