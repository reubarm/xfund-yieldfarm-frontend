import React from 'react';

import PoolCard from '../pool-card';
import PoolTransactionChart from '../pool-transaction-chart';
import PoolTransactionTable from '../pool-transaction-table';

import s from './styles.module.scss';

const PoolOverview: React.FunctionComponent = () => {
  return (
    <div>
      <div className={s.title}>Pools</div>
      <div className={s.subtitle}>Overview</div>
      <div className={s.cards}>
        <PoolCard unilpToken />
        <PoolCard unixToken />
      </div>
      <PoolTransactionChart />
      <PoolTransactionTable
        label="Transactions"
        unilpToken
        unixToken
      />
    </div>
  );
};

export default PoolOverview;
