import React from 'react';

import Card from 'components/antd/card';
import Tooltip from 'components/antd/tooltip';
import Grid from 'components/custom/grid';
import { Heading, Label, Paragraph } from 'components/custom/typography';
import ExternalLink from 'components/custom/externalLink';

import { formatUNIXValue, formatETHValue, formatUSDValue } from 'web3/utils';
import { useWeb3Contracts } from 'web3/contracts';
import { UNIXTokenMeta } from 'web3/contracts/unix';
import { useWeekCountdown } from 'hooks/useCountdown';

import s from './styles.module.scss';

const PoolStats: React.FunctionComponent = () => {
  const { aggregated, uniswap, staking } = useWeb3Contracts();
  const epochEnd = React.useMemo<number | undefined>(() => {
    const [, end] = staking.getEpochPeriod(staking.currentEpoch!) ?? [];
    return end;
  }, [staking]);
  const [untilNextEpoch] = useWeekCountdown(epochEnd);

  const totalUnixReward = formatUNIXValue(aggregated.totalReward);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <br />
      <br />
      <br />
      <Grid
        gap={[32, 32]}
        justify="center"
        colsTemplate="repeat(auto-fit, minmax(286px, 1fr))">
        <Card className={s.hexagon}>
          <Grid flow="row" gap={38}>
            <div className={s.container}>
              <Grid flow="row" align="center">
                <Heading type="h3" className={s.subtitle}>
                  Total Value Locked
                </Heading>
                <Heading type="h1" className={s.value}>
                  {formatUSDValue(aggregated.totalStaked)}
                </Heading>
                <br />
                <Heading type="h3" className={s.subtitle}>
                  {formatUSDValue(aggregated.totalEffectiveStaked)}
                  <br />
                  epoch locked
                </Heading>
                <br />
                <Tooltip
                  type="info"
                  title={
                    <span>
                      This number shows the Total Value Locked across the
                      staking pool(s), and the effective Total Value Locked.
                      <br />
                      <br />
                      When staking tokens during an epoch that is currently
                      running, your effective deposit amount will be
                      proportionally reduced by the time that has passed from
                      that epoch. Once an epoch ends, your staked balance and
                      effective staked balance will be the equal, therefore TVL
                      and effective TVL will differ in most cases.
                    </span>
                  }
                />
              </Grid>
            </div>
          </Grid>
        </Card>

        <Card className={s.hexagon}>
          <Grid flow="row" gap={38}>
            <div className={s.container}>
              <Grid flow="row" align="center">
                <Heading type="h3" className={s.subtitle}>
                  UNiX Rewards
                </Heading>
                <Heading type="h1" className={s.value}>
                  {formatUNIXValue(aggregated.unixReward)}
                </Heading>
                <br />
                <Heading type="h3" className={s.subtitle}>
                  out of <br />
                  {totalUnixReward}
                </Heading>
                <br />
                <Tooltip
                  type="info"
                  title={`This number shows the UNiX token rewards distributed so far out of the total of ${totalUnixReward} that are going to be available for Yield Farming.`}
                />
              </Grid>
            </div>
          </Grid>
        </Card>

        <Card className={s.hexagon}>
          <Grid flow="row" gap={38}>
            <div className={s.container}>
              <Grid flow="row" align="center">
                <Heading type="h3" className={s.subtitle}>
                  UNiX Price
                </Heading>
                <Heading type="h1" className={s.value}>
                  {formatUSDValue(uniswap.unixPrice, 3)}
                </Heading>
                <br />
                <ExternalLink
                  href={`https://v2.app.uniswap.org/#/swap?inputCurrency=${process.env.REACT_APP_CONTRACT_USDC_ADDR}&outputCurrency=${UNIXTokenMeta.address}`}
                  className={s.link}>
                  Uniswap market
                </ExternalLink>
              </Grid>
            </div>
          </Grid>
        </Card>
      </Grid>
      <br />
      <br />
      <br />
      <Grid
        gap={[32, 32]}
        justify="start"
        colsTemplate="repeat(auto-fit, minmax(286px, 1fr))">
        <Card className={s.timerContainer}>
          <Grid flow="row" gap={48}>
            <Grid flow="col" align="center" justify="space-between">
              {/* <Label type="lb2" semiBold color="blue500">
              Time Left
            </Label> */}
              {/* <Tooltip
              type="info"
              title="This counter shows the time left in the current epoch. The pool(s) below are synchronized and have epochs that last 30 days. You can deposit to the pool(s) during the duration of an epoch and receive rewards proportional to the time they are staked, but the funds must stay staked until the clock runs out and the epoch ends in order to be able to harvest the rewards."
            /> */}
            </Grid>
            <Grid flow="row" gap={4}>
              <Heading type="h1" className={s.timer}>
                {untilNextEpoch}
              </Heading>
              {/* <Paragraph type="p1" color="grey500">
              until next epoch
            </Paragraph> */}
            </Grid>
          </Grid>
        </Card>
      </Grid>
    </div>
  );
};

export default PoolStats;
