import React, { FC, useState, useEffect } from 'react';
import { Col, Input, Layout, Row } from 'antd';
import styles from './index.less';
import cstyle from './common.less';
import { useModel } from 'umi';

interface IndexProps {
  children?: React.ReactNode;
}

const Index: FC<IndexProps> = ({ children }) => {
  let {
    appkey,
    setAppkey,
    secret,
    setSecret,
    path,
    setPath,
    pathLong,
    setPathLong,
  } = useModel('useSettingsModel');
  return (
    <div className={cstyle.bigBlock} id="test">
      <div className={cstyle.title}>基础设置</div>
      <Row className={cstyle.row}>
        <Col span={6} className={cstyle.label}>
          AppKey
        </Col>
        <Col span={16}>
          <Input
            value={appkey}
            onChange={e => {
              setAppkey(e.target.value);
            }}
          />
        </Col>
      </Row>
      <Row className={cstyle.row}>
        <Col span={6} className={cstyle.label}>
          AppSecret
        </Col>
        <Col span={16}>
          <Input
            value={secret}
            onChange={e => {
              setSecret(e.target.value);
            }}
          />
        </Col>
      </Row>
      <Row className={cstyle.row}>
        <Col span={6} className={cstyle.label}>
          试听地址 (WebSocket)
        </Col>
        <Col span={16}>
          <Input
            value={path}
            onChange={e => {
              setPath(e.target.value);
            }}
          />
        </Col>
      </Row>
      <Row className={cstyle.row}>
        <Col span={6} className={cstyle.label}>
          下载地址
        </Col>
        <Col span={16}>
          <Input
            value={pathLong}
            onChange={e => {
              setPathLong(e.target.value);
            }}
          />
        </Col>
      </Row>
    </div>
  );
};
export default Index;
