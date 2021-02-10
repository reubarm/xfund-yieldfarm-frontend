import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import * as Antd from 'antd';
import { isMobile } from 'react-device-detect';

import YieldFarmingView from 'modules/yield-farming';

import Warnings from 'components/custom/warnings';
import MobileMenu from 'components/custom/mobile-menu';
import ExternalLink from 'components/custom/externalLink';
import StayTuned from 'components/custom/stay-tuned';
import LayoutSideNav from 'layout/components/layout-side-nav';

import { XFUNDTokenMeta } from 'web3/contracts/xfund';

import s from './styles.module.scss';

const LayoutView: React.FunctionComponent = () => {
  return (
    <Antd.Layout className={s.container}>
      {!isMobile ? <LayoutSideNav /> : <MobileMenu />}
      <Antd.Layout className={s.main}>
        <Warnings>
          <Antd.Layout.Content className={s.content}>
            <Switch>
              <Route path="/yield-farming" component={YieldFarmingView} />
              {/*<Route path="/governance/:vt(\w+)" component={GovernanceView} />*/}
              {/*<Route path="/governance" component={GovernanceView} />*/}
              {/*<Route path="/bonds" render={() => <StayTuned />} />*/}
              <Redirect from="/" to="/yield-farming" />
            </Switch>
          </Antd.Layout.Content>
          <Antd.Layout.Footer className={s.footer}>
            <div className={s.footerLinks}>
              <ExternalLink href="http://www.barnbridge.com/">
                Website
              </ExternalLink>
              <ExternalLink href="https://discord.com/invite/FfEhsVk">
                Discord
              </ExternalLink>
              <ExternalLink href="https://twitter.com/barn_bridge">
                Twitter
              </ExternalLink>
              <ExternalLink href="https://github.com/BarnBridge/BarnBridge-Whitepaper">
                Whitepaper
              </ExternalLink>
              <ExternalLink href="https://github.com/BarnBridge/">
                Github
              </ExternalLink>
              <ExternalLink href="https://docs.barnbridge.com/">
                Docs
              </ExternalLink>
              <ExternalLink
                href={`https://app.uniswap.org/#/add/${XFUNDTokenMeta.address}/ETH`}>
                Uniswap v2 ETH/xFUND add liquidity
              </ExternalLink>
              <ExternalLink
                href={`https://app.uniswap.org/#/swap?inputCurrency=${XFUNDTokenMeta.address}&outputCurrency=ETH`}>
                Uniswap v2 ETH/xFUND market
              </ExternalLink>
            </div>
          </Antd.Layout.Footer>
        </Warnings>
      </Antd.Layout>
    </Antd.Layout>
  );
};

export default LayoutView;
