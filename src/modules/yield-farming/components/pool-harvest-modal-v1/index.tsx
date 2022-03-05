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

  async function handleYFLPHarvest() {
    setYFLPHarvesting(true);

    try {
      await yfLP.massHarvestSend();
      unix.reload();
    } catch (e) {
    }

    setYFLPHarvesting(false);
  }

  async function handleYFUNIXHarvest() {
    setYfUNIXHarvesting(true);

    try {
      await yfUNIX.massHarvestSend();
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
        <Grid flow="col" gap={24} colsTemplate="repeat(auto-fit, 240px)">
          <PoolHarvestSelect
            icons={getPoolIcons(PoolTypes.UNILP)}
            label={getPoolNames(PoolTypes.UNILP).join('/')}
            reward={yfLP?.currentReward}
            loading={yfLPHarvesting}
            onClick={handleYFLPHarvest}
          />
          <PoolHarvestSelect
            icons={getPoolIcons(PoolTypes.UNIX)}
            label={getPoolNames(PoolTypes.UNIX).join('/')}
            reward={yfUNIX?.currentReward}
            loading={yfUNIXHarvesting}
            onClick={handleYFUNIXHarvest}
          />
        </Grid>
      </Grid>
    </Modal>
  );
};

export default PoolHarvestModalV1;
