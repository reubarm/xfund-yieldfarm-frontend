import React from 'react';
import * as ReCharts from 'recharts';
import BigNumber from 'bignumber.js';

import Select, { SelectOption } from 'components/antd/select';
import IconsSet from 'components/custom/icons-set';
import Grid from 'components/custom/grid';
import PoolTxChartProvider, {
  usePoolTxChart,
} from 'modules/yield-farming/components/pool-tx-chart-provider';

import {
  formatETHValue,
  formatUSDValue,
  getPoolIcons,
  getPoolNames,
  PoolTypes,
} from 'web3/utils';
import { useWeb3Contracts } from 'web3/contracts';

import { ReactComponent as EmptyChartSvg } from 'resources/svg/empty-chart.svg';

import s from './styles.module.css';

const PoolFilters: SelectOption[] = [
  {
    value: 'unilp',
    label: getPoolNames(PoolTypes.UNILP).join('/'),
  },
  {
    value: 'unix',
    label: getPoolNames(PoolTypes.UNIX).join('/'),
  },
];

const TypeFilters: SelectOption[] = [
  { value: 'all', label: 'All transactions' },
  { value: 'deposits', label: 'Deposits' },
  { value: 'withdrawals', label: 'Withdrawals' },
];

const PoolTransactionChartInner: React.FunctionComponent = () => {
  const web3c = useWeb3Contracts();
  const poolTxChart = usePoolTxChart();

  const [poolFilter, setPoolFilter] = React.useState<PoolTypes>(
    PoolTypes.UNILP,
  );
  const [periodFilter, setPeriodFilter] = React.useState<string | number>(
    'all',
  );
  const [typeFilter, setTypeFilter] = React.useState<string | number>('all');

  const PeriodFilters = React.useMemo<SelectOption[]>(() => {
    const filters = [{ value: 'all', label: 'All epochs' }];

    if (poolFilter === PoolTypes.UNILP) {
      for (let i = 0; i <= web3c.yfLPV2.currentEpoch!; i++) {
        filters.push({ value: String(i), label: `Epoch ${i}` });
      }
    } else if (poolFilter === PoolTypes.UNIX) {
      for (let i = 0; i <= web3c.yfUNIXV2.currentEpoch!; i++) {
        filters.push({ value: String(i), label: `Epoch ${i}` });
      }
    }

    return filters;
  }, [web3c.staking, web3c.yfLPV2, web3c.yfUNIXV2, poolFilter]);

  React.useEffect(() => {
    poolTxChart
      .load({
        pool: poolFilter,
        period: periodFilter !== 'all' ? String(periodFilter) : undefined,
        type: typeFilter !== 'all' ? String(typeFilter) : undefined,
      })
      .catch(x => x);
  }, [poolFilter, periodFilter, typeFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    poolTxChart.startPooling();

    return () => {
      poolTxChart.stopPooling();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const data = React.useMemo(() => {
    const price = web3c.getPoolUsdPrice(poolFilter);

    if (!price) {
      return poolTxChart.summaries;
    }

    return poolTxChart.summaries.map(summary => {
      const deposits = new BigNumber(summary.deposits)
        .multipliedBy(price)
        .toNumber();
      const withdrawals = new BigNumber(summary.withdrawals)
        .multipliedBy(price)
        .multipliedBy(-1)
        .toNumber();

      return {
        ...summary,
        deposits,
        withdrawals,
      };
    });
  }, [web3c, poolFilter, poolTxChart.summaries]);

  return (
    <div className={s.component}>
      <div className={s.header}>
        <div className={s.headerLabel}>
          <IconsSet className={s.iconSet} icons={getPoolIcons(poolFilter)} />
          <Select
            options={PoolFilters}
            value={poolFilter}
            onSelect={setPoolFilter}
          />
        </div>
        <div className={s.filters}>
          <Grid flow="col" gap={24}>
            <Select
              label="Period"
              options={PeriodFilters}
              value={periodFilter}
              onSelect={setPeriodFilter}
            />
            <Select
              label="Show"
              options={TypeFilters}
              value={typeFilter}
              onSelect={setTypeFilter}
            />
          </Grid>
        </div>
      </div>
      <div className={s.chart}>
        {poolTxChart.loaded && (
          <>
            {!poolTxChart.loading && data.length === 0 && (
              <div className={s.emptyBlock}>
                <EmptyChartSvg />
                <div className={s.emptyLabel}>
                  Not enough data to plot a graph
                </div>
              </div>
            )}
            {data.length > 0 && (
              <ReCharts.ResponsiveContainer width="100%" height={350}>
                <ReCharts.BarChart
                  data={data}
                  stackOffset="sign"
                  margin={{
                    top: 20,
                    right: 0,
                    left: 60,
                    bottom: 12,
                  }}>
                  <ReCharts.CartesianGrid
                    vertical={false}
                    stroke="#FFF"
                    strokeDasharray="3 3"
                  />
                  <ReCharts.XAxis
                    dataKey="timestamp"
                    tickMargin={24}
                    stroke="#FFF"
                  />
                  <ReCharts.YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value: any) => formatUSDValue(value)}
                    stroke="#FFF"
                  />
                  <ReCharts.Tooltip
                    formatter={(value: any) => formatETHValue(value)}
                    cursor={{ fill: '#441953' }}
                  />
                  <ReCharts.Legend
                    align="right"
                    verticalAlign="top"
                    iconType="circle"
                    wrapperStyle={{
                      top: 0,
                      right: 12,
                      color: '#FFF',
                    }}
                  />
                  <ReCharts.ReferenceLine y={0} stroke="#FFF" />
                  {(typeFilter === 'all' || typeFilter === 'deposits') && (
                    <ReCharts.Bar
                      dataKey="deposits"
                      name="Deposits"
                      fill="#E426B2"
                      stackId="stack"
                    />
                  )}
                  {(typeFilter === 'all' || typeFilter === 'withdrawals') && (
                    <ReCharts.Bar
                      dataKey="withdrawals"
                      name="Withdrawals"
                      fill="#201CE0"
                      stackId="stack"
                    />
                  )}
                </ReCharts.BarChart>
              </ReCharts.ResponsiveContainer>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const PoolTransactionChart: React.FunctionComponent = () => (
  <PoolTxChartProvider>
    <PoolTransactionChartInner />
  </PoolTxChartProvider>
);

export default PoolTransactionChart;
