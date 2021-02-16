import React from 'react';
import { useHistory } from 'react-router';
import BigNumber from 'bignumber.js';

import Button from 'components/antd/button';
import Tooltip from 'components/antd/tooltip';
import Grid from 'components/custom/grid';
import IconsSet from 'components/custom/icons-set';
import { Label, Paragraph } from 'components/custom/typography';
import PoolStakeShareBar, { PoolTokenShare } from '../pool-stake-share-bar';

import {
  formatBigValue,
  formatXFUNDValue,
  formatUSDValue,
  formatETHValue,
  getPoolIcons,
  getPoolNames,
  PoolTypes,
} from 'web3/utils';
import { useWallet } from 'wallets/wallet';
import { useWeb3Contracts } from 'web3/contracts';
import { UNISWAPTokenMeta } from 'web3/contracts/uniswap';
import { XFUNDTokenMeta } from 'web3/contracts/xfund';

import s from './styles.module.scss';

export type PoolCardProps = {
  stableToken?: boolean;
  unilpToken?: boolean;
  xfundToken?: boolean;
};

type PoolCardState = {
  type?: PoolTypes;
  enabled?: boolean;
  isEnded?: boolean;
  currentEpoch?: number;
  totalEpochs?: number;
  epochReward?: BigNumber;
  potentialReward?: BigNumber;
  balance?: BigNumber;
  myBalance?: BigNumber;
  effectiveBalance?: BigNumber;
  myEffectiveBalance?: BigNumber;
  shares?: PoolTokenShare[];
  myShares?: PoolTokenShare[];
};

const PoolCard: React.FunctionComponent<PoolCardProps> = props => {
  const history = useHistory();
  const wallet = useWallet();
  const web3c = useWeb3Contracts();

  const { stableToken = false, unilpToken = false, xfundToken = false } = props;

  const [state, setState] = React.useState<PoolCardState>({});

  React.useEffect(() => {
    if (unilpToken) {
      setState(prevState => ({
        ...prevState,
        type: PoolTypes.UNILP,
        enabled: true,
        isEnded: web3c.yfLP.isEnded,
        currentEpoch: web3c.yfLP.currentEpoch,
        totalEpochs: web3c.yfLP.totalEpochs,
        epochReward: web3c.yfLP.epochReward,
        potentialReward: web3c.yfLP.potentialReward,
        balance: web3c.aggregated.yfLPStakedValue,
        myBalance: web3c.aggregated.myLPStakedValue,
        effectiveBalance: web3c.aggregated.yfLPEffectiveStakedValue,
        myEffectiveBalance: web3c.aggregated.myLPEffectiveStakedValue,
        shares: [
          {
            icon: UNISWAPTokenMeta.icon,
            name: UNISWAPTokenMeta.name,
            color: 'var(--text-color-3)',
            value: formatBigValue(
              web3c.yfLP.nextPoolSize,
              UNISWAPTokenMeta.decimals,
            ),
            share:
              web3c.staking.uniswap.nextEpochPoolSize
                ?.multipliedBy(100)
                .div(web3c.yfLP.nextPoolSize ?? 1)
                .toNumber() ?? 0,
          },
        ],
        myShares: [
          {
            icon: UNISWAPTokenMeta.icon,
            name: UNISWAPTokenMeta.name,
            color: 'var(--text-color-3)',
            value: formatBigValue(
              web3c.yfLP.nextEpochStake,
              UNISWAPTokenMeta.decimals,
            ),
            share:
              web3c.staking.uniswap.nextEpochUserBalance
                ?.multipliedBy(100)
                .div(web3c.yfLP.nextEpochStake ?? 1)
                .toNumber() ?? 0,
          },
        ],
      }));
    } else if (xfundToken) {
      setState(prevState => ({
        ...prevState,
        type: PoolTypes.XFUND,
        enabled: true,
        isEnded: web3c.yfXFUND.isEnded,
        currentEpoch: web3c.yfXFUND.currentEpoch,
        totalEpochs: web3c.yfXFUND.totalEpochs,
        epochReward: web3c.yfXFUND.epochReward,
        potentialReward: web3c.yfXFUND.potentialReward,
        balance: web3c.aggregated.yfXFUNDStakedValue,
        myBalance: web3c.aggregated.myXFUNDStakedValue,
        effectiveBalance: web3c.aggregated.yfXFUNDEffectiveStakedValue,
        myEffectiveBalance: web3c.aggregated.myXFUNDEffectiveStakedValue,
        shares: [
          {
            icon: XFUNDTokenMeta.icon,
            name: XFUNDTokenMeta.name,
            color: 'var(--text-color-3)',
            value: formatBigValue(
              web3c.yfXFUND.nextPoolSize,
              XFUNDTokenMeta.decimals,
            ),
            share:
              web3c.staking.xfund.nextEpochPoolSize
                ?.multipliedBy(100)
                .div(web3c.yfXFUND.nextPoolSize ?? 1)
                .toNumber() ?? 0,
          },
        ],
        myShares: [
          {
            icon: XFUNDTokenMeta.icon,
            name: XFUNDTokenMeta.name,
            color: 'var(--text-color-3)',
            value: formatBigValue(
              web3c.yfXFUND.nextEpochStake,
              XFUNDTokenMeta.decimals,
            ),
            share:
              web3c.staking.xfund.nextEpochUserBalance
                ?.multipliedBy(100)
                .div(web3c.yfXFUND.nextEpochStake ?? 1)
                .toNumber() ?? 0,
          },
        ],
      }));
    }
  }, [stableToken, unilpToken, xfundToken, web3c]);

  function handleStaking() {
    if (unilpToken) {
      history.push('/yield-farming/unilp');
    } else if (xfundToken) {
      history.push('/yield-farming/xfund');
    }
  }

  return (
    <div className={s.component}>
      {state.type && (
        <div className={s.header}>
          <IconsSet className={s.iconSet} icons={getPoolIcons(state.type)} />
          <div className={s.infoWrap}>
            <Paragraph type="p1" semiBold className={s.nameLabel}>
              {getPoolNames(state.type).join('/')}
            </Paragraph>
            <Label type="lb2" semiBold className={s.epochLabel}>
              EPOCH {state.currentEpoch ?? '-'}/{state.totalEpochs ?? '-'}
            </Label>
          </div>
          {wallet.isActive && (
            <Button
              type="primary"
              className={s.stakingBtn}
              disabled={!state.enabled}
              onClick={handleStaking}>
              Staking
            </Button>
          )}
        </div>
      )}

      <div className={s.body}>
        {!state.isEnded && (
          <>
            <div className={s.row}>
              <Label type="lb2" semiBold className={s.label}>
                Reward
              </Label>
              <Paragraph type="p1" semiBold className={s.value}>
                {formatXFUNDValue(state.epochReward)} XFUND
              </Paragraph>
            </div>
            {wallet.isActive && (
              <div className={s.row}>
                <Label type="lb2" semiBold className={s.label}>
                  My Potential Reward
                </Label>
                <Paragraph type="p1" semiBold className={s.value}>
                  {formatXFUNDValue(state.potentialReward)} XFUND
                </Paragraph>
              </div>
            )}

            <div className={s.row}>
              <div className={s.labelWrap}>
                <Label type="lb2" semiBold className={s.label}>
                  Pool Balance
                </Label>
                <Tooltip
                  type="info"
                  title={
                    <span>
                  This number shows the total staked balance of the pool, and
                  the effective balance of the pool.
                  <br />
                  <br />
                  When staking tokens during an epoch that is currently running,
                  your effective deposit amount will be proportionally reduced
                  by the time that has passed from that epoch. Once an epoch
                  ends, your staked balance and effective staked balance will be
                  the equal, therefore pool balance and effective pool balance
                  will differ in most cases.
                </span>
                  }
                />
              </div>
              <Paragraph type="p1" semiBold className={s.value}>
                {formatETHValue(state.balance)}
              </Paragraph>
              <Paragraph type="p2" className={s.hint}>
                {formatETHValue(state.effectiveBalance)} effective epoch balance
              </Paragraph>
              <PoolStakeShareBar shares={state.shares} />
            </div>
          </>
        )}
        {wallet.isActive && (
          <>
          {!state.isEnded && (
          <div className={s.row}>

            <div className={s.labelWrap}>
              <Label type="lb2" semiBold className={s.label}>
                My Pool Balance
              </Label>
              <Tooltip
                type="info"
                title={
                  <span>
                    This number shows your total staked balance in the pool, and
                    your effective staked balance in the pool.
                    <br />
                    <br />
                    When staking tokens during an epoch that is currently
                    running, your effective deposit amount will be
                    proportionally reduced by the time that has passed from that
                    epoch. Once an epoch ends, your staked balance and effective
                    staked balance will be the equal, therefore your pool
                    balance and your effective pool balance will differ in most
                    cases.
                  </span>
                }
              />
            </div>

            <Paragraph type="p1" semiBold className={s.value}>
              {formatETHValue(state.myBalance)}
            </Paragraph>
            <Paragraph type="p2" className={s.hint}>
              {formatETHValue(state.myEffectiveBalance)} effective epoch balance
            </Paragraph>
              <PoolStakeShareBar shares={state.myShares} />

          </div>
              )}
          </>
        )}
        {state.isEnded && (
          <div className={s.box}>
            <Grid flow="row" align="start">
              <Paragraph type="p2" semiBold color="grey500">
                This staking pool has ended. Deposits are now disabled, but
                you can still withdraw your tokens and collect any unclaimed rewards.
              </Paragraph>
            </Grid>
          </div>
        )}
      </div>
    </div>
  );
};

export default PoolCard;
