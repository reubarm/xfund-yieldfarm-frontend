import React from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import * as Antd from 'antd';
import cx from 'classnames';

import Button from 'components/antd/button';
import Tooltip from 'components/antd/tooltip';
import Grid from 'components/custom/grid';
import { Paragraph } from 'components/custom/typography';
import Icons, { NavIconNames } from 'components/custom/icon';
import { useTheme } from 'components/providers/theme-provider';

import s from './styles.module.scss';

export type NavLinkProps = {
  icon: NavIconNames;
  label: string;
  path: string;
  expanded: boolean;
  iconWidth: number;
  iconHeight: number;
};

const NavLink: React.FunctionComponent<NavLinkProps> = props => {
  const { icon, label, path, expanded, iconWidth, iconHeight } = props;

  const history = useHistory();
  const isActivePath = Boolean(useRouteMatch({ path, exact: path === '/' }));

  function handleClick() {
    history.push(path);
  }

  return (
    <Tooltip title={label} placement="right">
      <Grid flow="col" className={cx(s.navLink, isActivePath && s.isActive)}>
        <div className={s.activeTick} />
        <Button type="light" onClick={handleClick}>
          <Icons name={icon} width={iconWidth} height={iconHeight} />
          {expanded && (
            <Paragraph type="p2" semiBold className={s.linkLabel}>{label}</Paragraph>
          )}
        </Button>
      </Grid>
    </Tooltip>
  );
};

export type LayoutSideNavProps = {
  className?: string;
};

const LayoutSideNav: React.FunctionComponent<LayoutSideNavProps> = props => {
  const { toggleDarkTheme, isDarkTheme } = useTheme();
  const [expanded, setExpanded] = React.useState<boolean>(false);

  function handleExpand() {
    setExpanded(prevState => !prevState);
  }

  function handleThemeToggle() {
    toggleDarkTheme();
  }

  return (
    <Antd.Layout.Sider
      className={cx(s.component, expanded && s.expanded)}
      collapsed={!expanded}
      collapsedWidth={72}
      width={200}>
      <Grid flow="row" gap={48} className={s.headerWrap}>
        <Grid flow="col" gap={12}>
          <NavLink
            label=""
            icon="unix-token"
            path="/"
            expanded={expanded}
            iconWidth={24}
            iconHeight={29}
          />
        </Grid>
        <Grid flow="row" gap={24}>
          <NavLink
            label="Pools"
            icon="savings-outlined"
            path="/yield-farming"
            expanded={expanded}
            iconWidth={24}
            iconHeight={24}
          />
        </Grid>
      </Grid>
      <Grid flow="row" gap={48} className={s.footerWrap} colsTemplate="48px">
        <Button type="light" onClick={handleThemeToggle}>
          <Icons name={isDarkTheme ? 'sun' : 'moon'} />
          {expanded && (
            <Paragraph type="p2" semiBold className={s.linkLabel}>
              {isDarkTheme ? 'Light Theme' : 'Dark Theme'}
            </Paragraph>
          )}
        </Button>
        <Button type="light" className={s.hideLink} onClick={handleExpand}>
          <Icons name="right-arrow-circle-outlined" />
          {expanded && (
            <Paragraph type="p2" semiBold className={s.linkLabel}>Hide menu</Paragraph>
          )}
        </Button>
      </Grid>
    </Antd.Layout.Sider>
  );
};

export default LayoutSideNav;
