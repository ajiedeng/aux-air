import React, { useMemo, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import Props, { IconInfo } from './props';
import style from './style.module.scss';
import classNames from 'classnames';
import jssdk from 'jssdk';
import { getName } from '@root/deviceStateSlice';
import { useToggle } from '@common/hooks';
export default function Navbar({
  subtitle,
  title,
  color = '#111111',
  exit,
  right = [],
  opacity,
  className: _className,
  leftHandle,
  save,
}: Props) {
  const height = useSelector((state: any) => state.global.statusBarHeight);
  const devName = useSelector(getName);
  const history = useHistory();
  const [showHover, toggleHover] = useToggle(false);




  const backIcon = useMemo(
    () => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" >
        <path fillRule="evenodd" clipRule="evenodd" d="M2.85714 10.5L10 17.5833L8.57143 19L0 10.5L8.57143 2L10 3.41667L2.85714 10.5Z" fill={color} />
      </svg>
    ),
    [color]
  );

  const moreIcon = useMemo(
    () => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path fillRule="evenodd" clipRule="evenodd" d="M3 10.5C3 11.3284 2.32843 12 1.5 12C0.671573 12 0 11.3284 0 10.5C0 9.67157 0.671573 9 1.5 9C2.32843 9 3 9.67157 3 10.5ZM11.5 10.5C11.5 11.3284 10.8284 12 10 12C9.17157 12 8.5 11.3284 8.5 10.5C8.5 9.67157 9.17157 9 10 9C10.8284 9 11.5 9.67157 11.5 10.5ZM18.5 12C19.3284 12 20 11.3284 20 10.5C20 9.67157 19.3284 9 18.5 9C17.6716 9 17 9.67157 17 10.5C17 11.3284 17.6716 12 18.5 12Z" fill={color} />
      </svg>
    ),
    [color]
  );

  const onMoreClick = useCallback((e: Event) => {
    e.stopPropagation();
    toggleHover();
    // jssdk.platformSDK.openDevicePropertyPage();
  }, [toggleHover]);

  const onBackClick = () => {
    if (exit) return jssdk.platformSDK.closeWebView();
    if (leftHandle) {
      leftHandle();
    } else {
      history.goBack();
    }
  };
  const getIcon = useCallback(
    (IconSetting: IconInfo) => {
      const { icon: iconName, onClick } = IconSetting;
      return <div onClick={onClick}>{iconName}</div>;
    },
    []
  );

  const rightIcons = useMemo(() => {
    if (Array.isArray(right)) {
      return right.map((IconSetting, i) => (
        <React.Fragment key={i}>{getIcon(IconSetting)}</React.Fragment>
      ));
    } else {
      return [getIcon(right)];
    }
  }, [right, getIcon]);

  useEffect(() => {
    jssdk.platformSDK.navbar.hide();
  }, [])
  useEffect(() => {
    const hideHover = () => toggleHover(false);
    rightIcons.length > 0 && document.body.addEventListener('click', hideHover);
    if (rightIcons.length > 0) {
      return () => document.body.removeEventListener('click', hideHover)
    }
  }, [toggleHover, rightIcons]);

  console.log('----title---', title, devName);

  return (
    <div
      style={{ paddingTop: height }}
      className={classNames(style.navbarBox, _className)}
    >
      <div className={style.leftRightBox}>
        <div className={style.back} onClick={onBackClick}>
          {backIcon}
        </div>
        {rightIcons.length > 0 && !save &&
          <div className={style.rightBtnsBox}><div onClick={onMoreClick as any}>{moreIcon}</div></div>}
        {save &&
          <div className={classNames(style.rightBtnsBox, style.saveStyle)} onClick={save.onSave as any}><span >{save.name}</span></div>}
      </div>
      <div className={style.title} style={{ color, top: `` }}>
        {title || devName}
      </div>
      {showHover && <div className={style.rightHoverBox}>{rightIcons}</div>}
    </div>
  );
}
