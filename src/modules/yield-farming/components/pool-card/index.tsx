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
  formatETHValue,
  formatUNIXValue,
  formatUSDValue,
  getPoolIcons,
  getPoolNames,
  PoolTypes
} from 'web3/utils';
import { useWallet } from 'wallets/wallet';
import { useWeb3Contracts } from 'web3/contracts';
import { UNISWAPTokenMeta } from 'web3/contracts/uniswap';
import { UNIXTokenMeta } from 'web3/contracts/unix';

import s from './styles.module.scss';

export type PoolCardProps = {
  unilpToken?: boolean;
  unixToken?: boolean;
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
  estApy?: BigNumber;
};

const PoolCard: React.FunctionComponent<PoolCardProps> = props => {
  const history = useHistory();
  const wallet = useWallet();
  const web3c = useWeb3Contracts();

  const { unilpToken = false, unixToken = false } = props;

  const [state, setState] = React.useState<PoolCardState>({});

  React.useEffect(() => {
    if (unilpToken) {
      setState(prevState => ({
        ...prevState,
        type: PoolTypes.UNILP,
        enabled: true,
        isEnded: web3c.yfLPV2.isEnded,
        currentEpoch: web3c.yfLPV2.currentEpoch,
        totalEpochs: web3c.yfLPV2.totalEpochs,
        epochReward: web3c.yfLPV2.epochReward,
        potentialReward: web3c.yfLPV2.potentialReward,
        balance: web3c.aggregated.yfLPStakedValue,
        myBalance: web3c.aggregated.myLPStakedValue,
        effectiveBalance: web3c.aggregated.yfLPEffectiveStakedValue,
        myEffectiveBalance: web3c.aggregated.myLPEffectiveStakedValue,
        estApy: web3c.aggregated.estLPApy,
        shares: [
          {
            icon: UNISWAPTokenMeta.icon,
            name: UNISWAPTokenMeta.name,
            color: 'var(--text-color-3)',
            value: formatBigValue(
              web3c.yfLPV2.nextPoolSize,
              UNISWAPTokenMeta.decimals,
            ),
            share:
              web3c.staking.uniswap.nextEpochPoolSize
                ?.multipliedBy(100)
                .div(web3c.yfLPV2.nextPoolSize ?? 1)
                .toNumber() ?? 0,
          },
        ],
        myShares: [
          {
            icon: UNISWAPTokenMeta.icon,
            name: UNISWAPTokenMeta.name,
            color: 'var(--text-color-3)',
            value: formatBigValue(
              web3c.yfLPV2.nextEpochStake,
              UNISWAPTokenMeta.decimals,
            ),
            share:
              web3c.staking.uniswap.nextEpochUserBalance
                ?.multipliedBy(100)
                .div(web3c.yfLPV2.nextEpochStake ?? 1)
                .toNumber() ?? 0,
          },
        ],
      }));
    } else if (unixToken) {
      setState(prevState => ({
        ...prevState,
        type: PoolTypes.UNIX,
        enabled: true,
        isEnded: web3c.yfUNIXV2.isEnded,
        currentEpoch: web3c.yfUNIXV2.currentEpoch,
        totalEpochs: web3c.yfUNIXV2.totalEpochs,
        epochReward: web3c.yfUNIXV2.epochReward,
        potentialReward: web3c.yfUNIXV2.potentialReward,
        balance: web3c.aggregated.yfUNIXStakedValue,
        myBalance: web3c.aggregated.myUNIXStakedValue,
        effectiveBalance: web3c.aggregated.yfUNIXEffectiveStakedValue,
        myEffectiveBalance: web3c.aggregated.myUNIXEffectiveStakedValue,
        estApy: web3c.aggregated.estUnixApy,
        shares: [
          {
            icon: UNIXTokenMeta.icon,
            name: UNIXTokenMeta.name,
            color: 'var(--text-color-3)',
            value: formatBigValue(
              web3c.yfUNIXV2.nextPoolSize,
              UNIXTokenMeta.decimals,
            ),
            share:
              web3c.staking.unix.nextEpochPoolSize
                ?.multipliedBy(100)
                .div(web3c.yfUNIXV2.nextPoolSize ?? 1)
                .toNumber() ?? 0,
          },
        ],
        myShares: [
          {
            icon: UNIXTokenMeta.icon,
            name: UNIXTokenMeta.name,
            color: 'var(--text-color-3)',
            value: formatBigValue(
              web3c.yfUNIXV2.nextEpochStake,
              UNIXTokenMeta.decimals,
            ),
            share:
              web3c.staking.unix.nextEpochUserBalance
                ?.multipliedBy(100)
                .div(web3c.yfUNIXV2.nextEpochStake ?? 1)
                .toNumber() ?? 0,
          },
        ],
      }));

    }
  }, [unilpToken, unixToken, web3c]);

  function handleStaking() {
    if (unilpToken) {
      history.push('/yield-farming/unilp');
    } else if (unixToken) {
      history.push('/yield-farming/unix');
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
              <div className={s.labelWrap}>
              <Label type="lb2" semiBold className={s.label}>
                Reward
              </Label>
              <Tooltip
                  type="info"
                  title="APY is estimated using the formula (Total Reward Per Day * 365) / Total Pool Size"
              />
              </div>
              <Paragraph type="p1" semiBold className={s.value}>
                {formatUNIXValue(state.epochReward)} UniX
              </Paragraph>
              <Paragraph type="p1" semiBold className={s.value}>
                {formatBigValue(state.estApy, 1)}% APY
              </Paragraph>
            </div>
            {wallet.isActive && (
              <div className={s.row}>
                <div className={s.labelWrap}>
                <Label type="lb2" semiBold className={s.label}>
                  My Potential Reward
                </Label>
                <Tooltip
                  type="info"
                  title="NOTE: No rewards are distributed for epoch 0 - the information displayed during epoch 0 is informational for projection"
                />
                <Paragraph type="p1" semiBold className={s.value}>
                  {formatUNIXValue(state.potentialReward)} UniX
                </Paragraph>
                </div>
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
                {formatUSDValue(state.balance)}
              </Paragraph>
              <Paragraph type="p2" className={s.hint}>
                {formatUSDValue(state.effectiveBalance)} effective epoch balance
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
              {formatUSDValue(state.myBalance)}
            </Paragraph>
            <Paragraph type="p2" className={s.hint}>
              {formatUSDValue(state.myEffectiveBalance)} effective epoch balance
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
