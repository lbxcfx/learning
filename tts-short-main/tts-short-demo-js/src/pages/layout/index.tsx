import React, { FC, useState, useEffect } from 'react';
import { Col, Layout, Row } from 'antd';
import styles from './index.less';

interface IndexProps {
  children?: React.ReactNode;
}
import BaseSetting from './BaseSetting';
import TtsShort from './ttsShort/Test';
import TtsLong from './ttsLong/Test';
const { Content } = Layout;
const Index: FC<IndexProps> = ({ children }) => {
  return (
    <Layout className={styles.page}>
      <Content className={styles.content}>
        <BaseSetting />
        <TtsShort />
        {/* <TtsLong /> */}
      </Content>
    </Layout>
  );
};
export default Index;
