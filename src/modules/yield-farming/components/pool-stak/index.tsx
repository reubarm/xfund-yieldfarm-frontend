import React from 'react';
import { useHistory } from 'react-router';
import * as Antd from 'antd';

import PoolTokenRow from 'modules/yield-farming/components/pool-token-row';
import PoolTransactionTable from 'modules/yield-farming/components/pool-transaction-table';

import Button from 'components/antd/button';
import Icons from 'components/custom/icon';

import { getPoolNames, PoolTypes } from 'web3/utils';
import { UNISWAPTokenMeta } from 'web3/contracts/uniswap';
import { XFUNDTokenMeta } from 'web3/contracts/xfund';

import s from './styles.module.css';

export type PoolStakProps = {
  stableToken?: boolean;
  unilpToken?: boolean;
  xfundToken?: boolean;
};

const PoolStak: React.FunctionComponent<PoolStakProps> = props => {
  const history = useHistory();

  React.useEffect(() => {
    document.documentElement.scrollTop = 0;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function goBack() {
    history.replace('/yield-farming');
  }

  return (
    <div className={s.component}>
      <Button
        type="link"
        className={s.headerLabel}
        icon={<Icons name="left-arrow" />}
        onClick={goBack}>
        {props.unilpToken && getPoolNames(PoolTypes.UNILP).join('/')}
        {props.xfundToken && getPoolNames(PoolTypes.XFUND).join('/')}
      </Button>

      <Antd.Tabs className={s.tabs} defaultActiveKey="deposit">
        <Antd.Tabs.TabPane key="deposit" tab="Deposit">
          <div className={s.dataRows}>
            {props.unilpToken && (
              <PoolTokenRow token={UNISWAPTokenMeta} type="deposit" expanded />
            )}
            {props.xfundToken && (
              <PoolTokenRow token={XFUNDTokenMeta} type="deposit" expanded />
            )}
          </div>
          <PoolTransactionTable
            className={s.table}
            label="My Transactions"
            ownTransactions
            deposits
            unilpToken={props.unilpToken}
            xfundToken={props.xfundToken}
          />
        </Antd.Tabs.TabPane>
        <Antd.Tabs.TabPane key="withdraw" tab="Withdraw">
          <div className={s.dataRows}>
            {props.unilpToken && (
              <PoolTokenRow token={UNISWAPTokenMeta} type="withdraw" expanded />
            )}
            {props.xfundToken && (
              <PoolTokenRow token={XFUNDTokenMeta} type="withdraw" expanded />
            )}
          </div>
          <PoolTransactionTable
            className={s.table}
            label="My Transactions"
            ownTransactions
            withdrawals
            unilpToken={props.unilpToken}
            xfundToken={props.xfundToken}
          />
        </Antd.Tabs.TabPane>
      </Antd.Tabs>
    </div>
  );
};

export default PoolStak;
