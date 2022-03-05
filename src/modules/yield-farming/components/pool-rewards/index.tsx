import React from 'react';

import Button from 'components/antd/button';
import Tooltip from 'components/antd/tooltip';
import Icons from 'components/custom/icon';
import Grid from 'components/custom/grid';
import { Heading, Label, Paragraph } from 'components/custom/typography';
import PoolHarvestModal from '../pool-harvest-modal';
import PoolHarvestModalV1 from '../pool-harvest-modal-v1';

import { useWallet } from 'wallets/wallet';
import { useWeb3Contracts } from 'web3/contracts';
import { formatUNIXValue } from 'web3/utils';
import useMergeState from 'hooks/useMergeState';

import s from './styles.module.scss';

type PoolRewardsState = {
  showHarvestModal: boolean;
  showHarvestModalV1: boolean;
};

const InitialState: PoolRewardsState = {
  showHarvestModal: false,
  showHarvestModalV1: false,
};

const PoolRewards: React.FunctionComponent = () => {
  const wallet = useWallet();
  const web3c = useWeb3Contracts();

  const [state, setState] = useMergeState<PoolRewardsState>(InitialState);

  return (
    <Grid flow="row" gap={16} padding={[24, 64]} className={s.component}>
      <Label type="lb2" semiBold color="blue500">
        My Rewards
      </Label>

      <Grid flow="col" gap={24}>
        <Grid flow="row" gap={4}>
          <Paragraph type="p2" color="grey500">
            Current reward
          </Paragraph>
          <Grid flow="col" gap={16} align="center">
            <Heading type="h3" bold color="grey900">
              {formatUNIXValue(web3c.aggregated.totalCurrentReward)}
            </Heading>
            <Icons name="unix-token" width="24" height="29" />
            {wallet.isActive && (
              <Button
                type="light"
                disabled={web3c.aggregated.totalCurrentReward?.isZero()}
                onClick={() => setState({ showHarvestModal: true })}>
                Claim
              </Button>
            )}
          </Grid>
        </Grid>
        <div className={s.delimiter} />
        <Grid flow="row" gap={4}>
          <Paragraph type="p2" color="grey500">
            UNiX Balance
          </Paragraph>
          <Grid flow="col" gap={16} align="center">
            <Heading type="h3" bold color="grey900">
              {formatUNIXValue(web3c.unix.balance)}
            </Heading>
            <Icons name="unix-token" width="24" height="29" />
          </Grid>
        </Grid>
        <div className={s.delimiter} />
        <Grid flow="row" gap={4}>
          <Grid flow="col" gap={8} align="center">
            <Paragraph type="p2" color="grey500">
              Potential reward this epoch
            </Paragraph>
            <Tooltip
              type="info"
              title={
                <span>
                  This number shows the UNiX rewards you would potentially be able to harvest this epoch,
                  but is subject to change - in case more users deposit, or you withdraw some of your stake.
                  <br />
                  <br />
                  NOTE: No rewards are distributed for epoch 0 - the information displayed during epoch 0 is
                  informational for projection
                </span>
              }
            />
          </Grid>
          <Grid flow="col" gap={16} align="center">
            <Heading type="h3" bold color="grey900">
              {formatUNIXValue(web3c.aggregated.totalPotentialReward)}
            </Heading>
            <Icons name="unix-token" width="24" height="29" />
          </Grid>
        </Grid>
        <div className={s.delimiter} />

        <Grid flow="col" gap={24}>
          <Grid flow="row" gap={4}>
            <Paragraph type="p2" color="grey500">
              Staking V1 reward
              <Tooltip
                type="info"
                title={
                  <span>
                    Claim all the rewards from previous epochs (1-3).
                  </span>
                }
              />
            </Paragraph>
            <Grid flow="col" gap={16} align="center">
              <Heading type="h3" bold color="grey900">
                {formatUNIXValue(web3c.aggregated.totalCurrentRewardV1)}
              </Heading>
              <Icons name="unix-token" width="24" height="29" />
              {wallet.isActive && (
                <Button
                  type="light"
                  disabled={web3c.aggregated.totalCurrentRewardV1?.isZero()}
                  onClick={() => setState({ showHarvestModalV1: true })}>
                  Claim
                </Button>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Grid>


      {state.showHarvestModal && (
        <PoolHarvestModal
          visible
          onCancel={() => setState({ showHarvestModal: false })}
        />
      )}
      {state.showHarvestModalV1 && (
        <PoolHarvestModalV1
          visible
          onCancel={() => setState({ showHarvestModalV1: false })}
        />
      )}
    </Grid>
  );
};

export default PoolRewards;
