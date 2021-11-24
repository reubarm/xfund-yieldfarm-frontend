import React from 'react';
import { useHistory } from 'react-router';
import * as Antd from 'antd';

import PoolTokenRow from 'modules/yield-farming/components/pool-token-row';
import PoolTransactionTable from 'modules/yield-farming/components/pool-transaction-table';

import Button from 'components/antd/button';
import Icons from 'components/custom/icon';

import { getPoolNames, PoolTypes } from 'web3/utils';
import { UNISWAPTokenMeta } from 'web3/contracts/uniswap';
import { UNIXTokenMeta } from 'web3/contracts/unix';

import s from './styles.module.css';
import { Paragraph } from '../../../../components/custom/typography';

export type PoolStakProps = {
  unilpToken?: boolean;
  unixToken?: boolean;
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
        {props.unixToken && getPoolNames(PoolTypes.UNIX).join('/')}
      </Button>

      <Antd.Tabs className={s.tabs} defaultActiveKey="deposit">
        <Antd.Tabs.TabPane key="deposit" tab="Deposit">
          <div className={s.dataRows}>
            {props.unilpToken && (
              <PoolTokenRow token={UNISWAPTokenMeta} type="deposit" poolType={PoolTypes.UNILP} expanded />
            )}
            {props.unixToken && (
              <PoolTokenRow token={UNIXTokenMeta} type="deposit" poolType={PoolTypes.UNIX} expanded />
            )}
          </div>
          <PoolTransactionTable
            className={s.table}
            label="My Transactions"
            ownTransactions
            deposits
            unilpToken={props.unilpToken}
            unixToken={props.unixToken}
          />
        </Antd.Tabs.TabPane>
        <Antd.Tabs.TabPane key="withdraw" tab="Withdraw">
          <div className={s.dataRows}>
            {props.unilpToken && (
              <PoolTokenRow token={UNISWAPTokenMeta} type="withdraw" poolType={PoolTypes.UNILP} expanded />
            )}
            {props.unixToken && (
              <PoolTokenRow token={UNIXTokenMeta} type="withdraw" poolType={PoolTypes.UNIX} expanded />
            )}
          </div>
          <PoolTransactionTable
            className={s.table}
            label="My Transactions"
            ownTransactions
            withdrawals
            unilpToken={props.unilpToken}
            unixToken={props.unixToken}
          />
        </Antd.Tabs.TabPane>
      </Antd.Tabs>
    </div>
  );
};

export default PoolStak;
