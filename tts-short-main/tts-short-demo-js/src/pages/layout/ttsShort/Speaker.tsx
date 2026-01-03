import React from 'react';
import style from './speaker.less';

interface Props {
  imgPath: any;
  name: string;
  desc: string;
  scence: string;
  isSelect: boolean;
  isQuality?: boolean;
  isTobe?: boolean;
  onClick?: any;
}

export default ({
  imgPath,
  name,
  desc,
  scence,
  isSelect,
  isQuality,
  isTobe,
  onClick,
}: Props) => {
  console.log('isSelect:', isSelect);
  return (
    <div
      className={`${style.speaker} ${isSelect ? style.active : ''} ${
        isTobe ? style.disabled : ''
      }`}
      onClick={onClick}
    >
      {isQuality && <span className={style.quality}>精品</span>}
      {isTobe && <span className={style.tobe}>敬请期待</span>}
      <div className={style.top}>
        <img src={imgPath} className={style.img} />
        <div className={style.text}>
          <div className={style.title}>{name}</div>
          <div className={style.desc}>{desc}</div>
        </div>
      </div>
      <div className={style.scence}>{scence}</div>
    </div>
  );
};
