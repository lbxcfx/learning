import { useState } from 'react';

export default function useDevicesModel() {
  const [appkey, setAppkey] = useState(
    '',
  );
  const [secret, setSecret] = useState('');
  const [path, setPath] = useState('wss://ws-stts.hivoice.cn/v1/tts');
  const [pathLong, setPathLong] = useState('https://ltts.hivoice.cn/');
  return {
    appkey,
    setAppkey,
    secret,
    setSecret,
    path,
    setPath,
    pathLong,
    setPathLong,
  };
}
