import React from 'react';

import Button from 'components/antd/button';
import Tooltip from 'components/antd/tooltip';
import Icons from 'components/custom/icon';
import Grid from 'components/custom/grid';
import { Heading, Label, Paragraph } from 'components/custom/typography';
import PoolHarvestModal from '../pool-harvest-modal';

import { useWallet } from 'wallets/wallet';
import { useWeb3Contracts } from 'web3/contracts';
import { formatXFUNDValue } from 'web3/utils';
import useMergeState from 'hooks/useMergeState';

import s from './styles.module.scss';

type PoolRewardsState = {
  showHarvestModal: boolean;
};

const InitialState: PoolRewardsState = {
  showHarvestModal: false,
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
              {formatXFUNDValue(web3c.aggregated.totalCurrentReward)}
            </Heading>
            <Icons name="xfund-token" width="24" height="29" />
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
            xFUND Balance
          </Paragraph>
          <Grid flow="col" gap={16} align="center">
            <Heading type="h3" bold color="grey900">
              {formatXFUNDValue(web3c.xfund.balance)}
            </Heading>
            <Icons name="xfund-token" width="24" height="29" />
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
              title="This number shows the xFUND rewards you would potentially be able to harvest this epoch, but is subject to change - in case more users deposit, or you withdraw some of your stake."
            />
          </Grid>
          <Grid flow="col" gap={16} align="center">
            <Heading type="h3" bold color="grey900">
              {formatXFUNDValue(web3c.aggregated.totalPotentialReward)}
            </Heading>
            <Icons name="xfund-token" width="24" height="29" />
          </Grid>
        </Grid>
      </Grid>

      {state.showHarvestModal && (
        <PoolHarvestModal
          visible
          onCancel={() => setState({ showHarvestModal: false })}
        />
      )}
    </Grid>
  );
};

export default PoolRewards;
