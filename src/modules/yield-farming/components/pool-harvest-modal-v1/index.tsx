import React from 'react';
import BigNumber from 'bignumber.js';

import {
  formatUNIXValue,
  getPoolIcons,
  getPoolNames,
  PoolTypes,
} from 'web3/utils';
import { useWeb3Contracts } from 'web3/contracts';

import Modal, { ModalProps } from 'components/antd/modal';
import Button from 'components/antd/button';
import Grid from 'components/custom/grid';
import { Heading, Label, Paragraph } from 'components/custom/typography';
import IconsSet from 'components/custom/icons-set';

import s from './styles.module.scss';

export type PoolHarvestModalProps = ModalProps & {};

type PoolHarvestSelectProps = {
  icons: React.ReactNode[];
  label: React.ReactNode;
  reward?: BigNumber;
  loading: boolean;
  onClick: () => void;
};

const PoolHarvestSelect: React.FunctionComponent<PoolHarvestSelectProps> = props => {
  const { icons, label, reward, loading, onClick } = props;

  return (
    <Button
      className={s.btn}
      type="select"
      loading={loading}
      disabled={reward?.isEqualTo(0) !== false}
      onClick={onClick}>
      <Grid flow="row" gap={24} width="100%">
        <Grid flow="row" gap={8} align="start">
          <IconsSet icons={icons} />
          <Paragraph type="p1" semiBold color="grey900">
            {label}
          </Paragraph>
        </Grid>
        <Grid flow="row" gap={8}>
          <Label type="lb2" semiBold color="grey500">
            Reward
          </Label>
          <Grid flow="col" gap={4}>
            <Paragraph type="p1" semiBold color="grey900">
              {formatUNIXValue(reward)}
            </Paragraph>
            <Paragraph type="p2" color="grey500">
              UNiX
            </Paragraph>
          </Grid>
        </Grid>
      </Grid>
    </Button>
  );
};

const PoolHarvestModalV1: React.FunctionComponent<PoolHarvestModalProps> = props => {
  const { ...modalProps } = props;

  const { yfLP, yfUNIX, unix } = useWeb3Contracts();
  const [yfLPHarvesting, setYFLPHarvesting] = React.useState<boolean>(false);
  const [yfUNIXHarvesting, setYfUNIXHarvesting] = React.useState<boolean>(
    false,
  );

  async function handleYFLPHarvest(epoch: number) {
    setYFLPHarvesting(true);

    try {
      await yfLP.harvestSend(epoch);
      unix.reload();
    } catch (e) {
    }

    setYFLPHarvesting(false);
  }

  async function handleYFUNIXHarvest(epoch: number) {
    setYfUNIXHarvesting(true);

    try {
      await yfUNIX.harvestSend(epoch);
      unix.reload();
    } catch (e) {
    }

    setYfUNIXHarvesting(false);
  }


  return (
    <Modal width={832} centered {...modalProps}>
      <Grid flow="row" gap={32}>
        <Grid flow="row" gap={8}>
          <Heading type="h3" semiBold color="grey900">
            Claim your reward
          </Heading>
          <Paragraph type="p2" semiBold color="grey500">
            Select the pool you want to claim your reward from
          </Paragraph>
        </Grid>
        {yfLP?.userLastEpochIdHarvested < 3 && !yfLP?.userLastReward?.isZero() &&
          <Grid flow="col" gap={24} colsTemplate="repeat(auto-fit, 240px)">
            <Paragraph type="p2" semiBold color="grey500">
              Claim epoch {yfLP?.userLastEpochIdHarvested + 1}/3 <br />
              {yfLP?.userLastEpochIdHarvested < 2 &&
                  `*You will be able to claim epoch ${yfLP?.userLastEpochIdHarvested + 1} after claiming epoch ${yfLP?.userLastEpochIdHarvested}`
              }
            </Paragraph>
            <PoolHarvestSelect
              icons={getPoolIcons(PoolTypes.UNILP)}
              label={getPoolNames(PoolTypes.UNILP).join('/')}
              reward={yfLP?.userLastReward}
              loading={yfLPHarvesting}
              onClick={() => handleYFLPHarvest(yfLP?.userLastEpochIdHarvested + 1)}
            />
          </Grid>
        }

        {yfUNIX?.userLastEpochIdHarvested < 3 && !yfUNIX?.userLastReward?.isZero() &&
          <Grid flow="col" gap={24} colsTemplate="repeat(auto-fit, 240px)">
            <Paragraph type="p2" semiBold color="grey500">
              Claim epoch {yfUNIX?.userLastEpochIdHarvested + 1}/3 <br />
              {yfUNIX?.userLastEpochIdHarvested < 2 &&
                  `*You will be able to claim epoch ${yfUNIX?.userLastEpochIdHarvested + 1} after claiming epoch ${yfUNIX?.userLastEpochIdHarvested}`
              }
            </Paragraph>
            <PoolHarvestSelect
              icons={getPoolIcons(PoolTypes.UNIX)}
              label={getPoolNames(PoolTypes.UNIX).join('/')}
              reward={yfUNIX?.userLastReward}
              loading={yfUNIXHarvesting}
              onClick={() => handleYFUNIXHarvest(yfUNIX?.userLastEpochIdHarvested + 1)}
            />    
          </Grid>
        }

        {(yfLP?.userLastEpochIdHarvested >= 3 || yfLP?.userLastReward?.isZero())
          && (yfUNIX?.userLastEpochIdHarvested >= 3 || yfUNIX?.userLastReward?.isZero()) &&
          <Grid flow="col" gap={24} colsTemplate="repeat(auto-fit, 240px)">
            <Paragraph type="p2" semiBold color="grey500">
              No rewards to claim.
            </Paragraph>
          </Grid>
        }
      </Grid>
    </Modal>
  );
};

export default PoolHarvestModalV1;
