import React, { useEffect, useState } from 'react';
import style from './tts.less';
import Speaker from './Speaker';
import { Slider, Button, Popover, message, Modal } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import { QuestionCircleOutlined } from '@ant-design/icons';

import PCMPlayer from '@/utils/PCMPlayer';
import { sha256 } from 'js-sha256';
import { useModel } from 'umi';
import Axios from 'axios';
interface Props {
  voiceList: Array<any>;
  maxLength: number;
}

let ws: any;
let player: any;
let timer: any;
export default ({ voiceList = [], maxLength = 500 }: Props) => {
  const [selected, setSelected] = useState<any>(
    voiceList.length > 0 ? voiceList[0] : null,
  );
  const { appkey, secret, path, pathLong } = useModel('useSettingsModel');
  // const { appkey, secret, path } = Config[AiCode.TTSShort];

  const [speed, setSpeed] = useState<number>(50);
  const [volume, setVolume] = useState<number>(50);
  const [pitch, setPitch] = useState<number>(50);
  const [bright, setBright] = useState<number>(50);
  const [buildStatus, setStatus] = useState<number>(0);
  const [playing, setPlaying] = useState<boolean>(false);
  useEffect(() => {
    if (voiceList.length > 0) {
      setSelected(voiceList[0]);
      if (voiceList[0].playText) {
        setPlayText(voiceList[0].playText);
      }
    }
  }, [voiceList]);

  const [playText, setPlayText] = useState<string>(
    '云知声智能科技股份有限公司，成立于2012年6月29日，是语音行业发展最快的移动互联网公司。',
  );
  function stopPlay() {
    setPlaying(false);
    player && player.destroy();
    player = null;
    ws && ws.close();
    ws = null;
  }

  function startWs() {
    stopPlay();

    let selectedText: any = window.getSelection();
    if (selectedText.focusNode && selectedText.focusNode.id === 'textPlay') {
      selectedText = selectedText.toString();
    } else {
      selectedText = '';
    }
    // alert(selectedText)
    if (!selectedText) selectedText = playText;

    if (selectedText.length > 500) {
      Modal.info({
        title: '提醒',
        content: '试听文本长度需 <=500 个字符，可通过鼠标选中文本进行试听',
        okText: '知道了',
        maskClosable: true,
      });
      return;
    }
    setPlaying(true);
    const tm: number = +new Date();
    const sign = sha256(`${appkey}${tm}${secret}`).toUpperCase();

    let context: any;
    try {
      context = new window.AudioContext();
    } catch (e) {
      message.error('您当前的浏览器不支持Web Audio API ');
      return;
    }
    ws = new WebSocket(`${path}?appkey=${appkey}&time=${tm}&sign=${sign}`);

    ws.binaryType = 'arraybuffer';
    if (player) player.destroy();
    player = new PCMPlayer({
      inputCodec: 'Int16',
      channels: 1,
      sampleRate: 16000,
      flushTime: 100,
    });
    player.inputFininshed = false;
    player.onEnded = () => {
      stopPlay();
      // player = null;
    };
    let dataCount = 0;
    let startTime: Date;
    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          format: 'pcm',
          vcn: selected.code,
          text: selectedText,
          sample: 16000,
          speed,
          volume,
          pitch,
          bright,
        }),
      );
      dataCount = 0;
      startTime = new Date();
    };

    ws.onmessage = (res: any) => {
      try {
        const result = JSON.parse(res.data);
        ws.close();
        if (result.code !== 0) {
          message.error('合成遇到点问题，请稍后再试~');
          setPlaying(false);
          player && player.destroy();
        }
      } catch (e) {
        dataCount += res.data.byteLength;
        player && player.feed(res.data);
      }
    };

    ws.onclose = e => {
      console.log('ws.onclose ', e);
      player && (player.inputFininshed = true);
      ws = null;
    };
  }

  function startDownLoad() {
    const tm: number = +new Date();
    const sign = sha256(`${appkey}${tm}${secret}`).toUpperCase();

    setStatus(1);
    Axios.post(`${pathLong}/start`, {
      appkey: appkey,
      time: tm,
      sign: sign,
      user_id: 'test_123123',
      format: 'wav',
      vcn: selected.code,
      text: playText,
      sample: 16000,
      speed,
      volume,
      pitch,
      bright,
    })
      .then((res: any) => {
        let taskId = res.data.task_id;
        if (taskId) {
          getResult(taskId);
          Axios.post('/manager/product/experience', {
            aiCode: 'tts-long',
            sid: taskId,
          });
        } else {
          message.error(res.data.message);
          setStatus(0);
        }
      })
      .catch(() => {
        setStatus(0);
      });
    // let timer: number
    function getResult(taskId: string | number) {
      Axios.post(`${pathLong}/progress`, {
        appkey: appkey,
        time: tm,
        sign: sign,
        user_id: 'test_123123',
        task_id: taskId,
      })
        .then((res: any) => {
          if (res.data.task_status !== 'done') {
            setTimeout(() => {
              getResult(taskId);
            }, 1000);
          } else {
            // // alert(res.audio_address);
            // if (audio.current) {
            //   setStatus(2);
            //   audio.current.src = res.data.audio_address;
            //   audio.current.play();
            // }
            window.open(res.data.audio_address);
            setStatus(0);
            // setUrl(res.audio_address);
          }
        })
        .catch(() => {
          setStatus(0);
        });
    }
  }

  return (
    <div className={style.tts}>
      <div className={style.voice}>
        <div className={style.speakers}>
          {voiceList.map((item: any) => {
            return (
              <Speaker
                key={item.code}
                onClick={() => {
                  setSelected(item);
                  if (item.playText) {
                    setPlayText(item.playText);
                  }
                  stopPlay();
                }}
                {...item}
                isSelect={item.code === (selected && selected.code)}
              />
            );
          })}
        </div>
        <div className={style.settings}>
          <div className={style.row}>
            <span className={style.label}>音量：</span>
            <span className={style.tag}>小</span>
            <span className={style.slider}>
              <Slider
                value={volume}
                onChange={(v: number) => {
                  setVolume(v);
                }}
              />
            </span>
            <span className={style.tag}>大</span>
          </div>
          <div className={style.row}>
            <span className={style.label}>语速：</span>
            <span className={style.tag}>慢</span>
            <span className={style.slider}>
              <Slider
                value={speed}
                tipFormatter={(value: number | undefined = 50) => {
                  return (
                    <span> {Math.round((value + 50) / 10) / 10 + 'X'} </span>
                  );
                }}
                onChange={(v: number) => {
                  setSpeed(v);
                }}
              />
            </span>
            <span className={style.tag}>快</span>
          </div>
          <div className={style.row}>
            <span className={style.label}>
              音高：
              <Popover
                content="代表调子高低，人耳感受上越高则越尖，越低则越粗犷，此参数建议保持默认值。"
                overlayStyle={{ width: 215 }}
              >
                <QuestionCircleOutlined />
              </Popover>
            </span>
            <span className={style.tag}>低</span>
            <span className={style.slider}>
              <Slider
                value={pitch}
                onChange={(v: number) => {
                  setPitch(v);
                }}
              />
            </span>
            <span className={style.tag}>高</span>
          </div>
          <div className={style.row}>
            <span className={style.label}>
              亮度：
              <Popover
                content="代表声音的清晰程度，适当的提高亮度可以让声音听起来更加清晰，过度的增加则会导致细节丢失。此参数建议保持默认值。"
                overlayStyle={{ width: 215 }}
              >
                <QuestionCircleOutlined />
              </Popover>
            </span>
            <span className={style.tag}>低</span>
            <span className={style.slider}>
              <Slider
                value={bright}
                onChange={(v: number) => {
                  if (v < 50) {
                    setBright(50);
                  } else {
                    setBright(v);
                  }
                }}
              />
            </span>
            <span className={style.tag}>高</span>
          </div>
        </div>
      </div>
      <div className={style.textPlay} id="textPlay">
        <TextArea
          className={style.textarea}
          value={playText}
          onChange={(e: any) => {
            setPlayText(e.target.value);
            stopPlay();
          }}
          maxLength={maxLength}
        />
        <div className={style.btns}>
          <div className={style.textCount}>
            {playText.length}/{maxLength}
          </div>
          <div>
            <Button
              type="primary"
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                if (!playing) {
                  startWs();
                } else {
                  stopPlay();
                }
              }}
              style={{ marginRight: 20 }}
            >
              {playing ? '停止' : '试听'}
            </Button>
            <Button
              type="primary"
              loading={buildStatus === 1}
              onClick={() => {
                if (buildStatus === 0) {
                  startDownLoad();
                }
              }}
            >
              {buildStatus === 0 && '下载'}
              {buildStatus === 1 && '合成中'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
