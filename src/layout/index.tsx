import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import * as Antd from 'antd';
import { isMobile } from 'react-device-detect';

import YieldFarmingView from 'modules/yield-farming';

import Warnings from 'components/custom/warnings';
import MobileMenu from 'components/custom/mobile-menu';
import ExternalLink from 'components/custom/externalLink';
// import StayTuned from 'components/custom/stay-tuned';
import LayoutSideNav from 'layout/components/layout-side-nav';

import { UNIXTokenMeta } from 'web3/contracts/unix';
import { CONTRACT_STAKING_ADDR } from 'web3/contracts/staking'
import { CONTRACT_YIELD_FARM_LP_ADDR } from 'web3/contracts/yieldFarmLP'
import { CONTRACT_YIELD_FARM_UNIX_ADDR } from 'web3/contracts/yieldFarmUNIX'

import s from './styles.module.scss';

const LayoutView: React.FunctionComponent = () => {
  return (
    <Antd.Layout className={s.container}>
      {/*{!isMobile ? <LayoutSideNav /> : <MobileMenu />}*/}
      <Antd.Layout className={s.main}>
        <Warnings>
          <Antd.Layout.Content className={s.content}>
            <Switch>
              <Route path="/yield-farming" component={YieldFarmingView} />
              <Redirect from="/" to="/yield-farming" />
            </Switch>
          </Antd.Layout.Content>
          <Antd.Layout.Footer className={s.footer}>
            <div className={s.footerLinks}>
              <ExternalLink href="http://www.unification.com/">
                Website
              </ExternalLink>
              <ExternalLink href="https://discord.gg/SeB69w5">
                Discord
              </ExternalLink>
              <ExternalLink href="https://twitter.com/unificationund">
                Twitter
              </ExternalLink>
              <ExternalLink href="https://go.unification.com/whitepaper">
                Whitepaper
              </ExternalLink>
              <ExternalLink href="https://github.com/unification-com/">
                Github
              </ExternalLink>
              <ExternalLink href="https://docs.unification.io/">
                Docs
              </ExternalLink>
              <ExternalLink
                href={`https://app.uniswap.org/#/add/v2/${UNIXTokenMeta.address}/ETH`}>
                Uniswap v2 ETH/UNiX add liquidity
              </ExternalLink>
              <ExternalLink
                href={`https://app.uniswap.org/#/swap?inputCurrency=${UNIXTokenMeta.address}&outputCurrency=ETH`}>
                Uniswap v2 ETH/UNiX market
              </ExternalLink>
              <br/>
              <ExternalLink
                href={`https://etherscan.io/address/${CONTRACT_STAKING_ADDR}#code`}>
                Staking Contract
              </ExternalLink>
              <ExternalLink
                href={`https://etherscan.io/address/${CONTRACT_YIELD_FARM_LP_ADDR}#code`}>
                LP Farm Contract
              </ExternalLink>
              <ExternalLink
                href={`https://etherscan.io/address/${CONTRACT_YIELD_FARM_UNIX_ADDR}#code`}>
                UNiX Farm Contract
              </ExternalLink>
            </div>
          </Antd.Layout.Footer>
        </Warnings>
      </Antd.Layout>
    </Antd.Layout>
  );
};

export default LayoutView;
