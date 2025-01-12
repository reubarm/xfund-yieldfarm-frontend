import React from 'react';
import * as Antd from 'antd';
import { ColumnsType } from 'antd/lib/table/interface';
import BigNumber from 'bignumber.js';
import { formatDistance } from 'date-fns';
import capitalize from 'lodash/capitalize';
import cx from 'classnames';

import Button from 'components/antd/button';
import Tooltip from 'components/antd/tooltip';
import ExternalLink from 'components/custom/externalLink';
import Grid from 'components/custom/grid';
import Select, { SelectOption } from 'components/antd/select';
import PoolTxListProvider, {
  PoolTxListItem,
  usePoolTxList,
} from 'modules/yield-farming/components/pool-tx-list-provider';
import {
  formatBigValue,
  formatETHValue, formatUSDValue,
  getEtherscanTxUrl,
  getTokenMeta,
  shortenAddr,
} from 'web3/utils';
import { useWallet } from 'wallets/wallet';
import { useWeb3Contracts } from 'web3/contracts';
import { UNISWAPTokenMeta } from 'web3/contracts/uniswap';
import { UNIXTokenMeta } from 'web3/contracts/unix';

import { ReactComponent as EmptyBoxSvg } from 'resources/svg/empty-box.svg';

import s from './styles.module.css';

const DEPOSITS_KEY = 'deposits';
const WITHDRAWALS_KEY = 'withdrawals';

const TypeFilters: SelectOption[] = [
  { value: 'all', label: 'All transactions' },
  { value: DEPOSITS_KEY, label: 'Deposits' },
  { value: WITHDRAWALS_KEY, label: 'Withdrawals' },
];

const Columns: ColumnsType<any> = [
  {
    title: '',
    dataIndex: 'token',
    width: 24,
    className: s.iconCol,
    render: (value: string) => {
      return <div className={s.icon}>{getTokenMeta(value)?.icon}</div>;
    },
  },
  {
    title: 'From',
    dataIndex: 'user',
    render: (value: string) => shortenAddr(value),
  },
  {
    title: 'TX Hash',
    dataIndex: 'txHash',
    render: (value: string) => (
      <ExternalLink href={getEtherscanTxUrl(value)}>
        {shortenAddr(value)}
      </ExternalLink>
    ),
  },
  {
    title: 'Time',
    dataIndex: 'blockTimestamp',
    render: (value: number) =>
      formatDistance(new Date(value), new Date(), {
        addSuffix: true,
      }),
  },
  {
    title: 'Amount',
    dataIndex: 'usdAmount',
    align: 'right',
    render: (value: BigNumber, record: PoolTxListItem) => {
      const tokenMeta = getTokenMeta(record.token);

      return (
        <Tooltip
          title={
            <span>
              <strong>{formatBigValue(record.amount, 12)}</strong>&nbsp;
              {tokenMeta?.name}
            </span>
          }>
          {formatUSDValue(value)}
        </Tooltip>
      );
    },
  },
  {
    title: 'Type',
    dataIndex: 'type',
    render: capitalize,
  },
];

export type PoolTransactionTableProps = {
  className?: string;
  label: string;
  ownTransactions?: boolean;
  deposits?: boolean;
  withdrawals?: boolean;
  stableToken?: boolean;
  unilpToken?: boolean;
  unixToken?: boolean;
  sslpToken?: boolean;
};

const PoolTransactionTableInner: React.FunctionComponent<PoolTransactionTableProps> = props => {
  const { ownTransactions } = props;

  const web3c = useWeb3Contracts();
  const wallet = useWallet();
  const poolTxList = usePoolTxList();

  const [, forceRender] = React.useState<{}>({});

  const tokenFilterOptions = React.useMemo<SelectOption[]>(() => {
    const options: SelectOption[] = [];

    if (props.unilpToken) {
      options.push({
        value: UNISWAPTokenMeta.address,
        label: UNISWAPTokenMeta.name,
      });
    }

    if (props.unixToken) {
      options.push({ value: UNIXTokenMeta.address, label: UNIXTokenMeta.name });
    }

    if (options.length !== 1) {
      options.unshift({ value: 'all', label: 'All tokens' });
    }

    return options;
  }, [props.unilpToken, props.unixToken, props.sslpToken]);

  let tokenDefaultOptions: string = String(tokenFilterOptions[0].value);
  let typeDefaultOption: string = 'all';

  if (props.deposits) {
    typeDefaultOption = DEPOSITS_KEY;
  } else if (props.withdrawals) {
    typeDefaultOption = WITHDRAWALS_KEY;
  }

  const tokenFilterRef = React.useRef<string | number>(tokenDefaultOptions);
  const typeFilterRef = React.useRef<string | number>(typeDefaultOption);

  React.useEffect(() => {
    poolTxList
      .load({
        user: ownTransactions ? wallet.account?.toLowerCase() : undefined,
        token:
          tokenFilterRef.current !== 'all'
            ? String(tokenFilterRef.current)
            : undefined,
        type:
          typeFilterRef.current !== 'all'
            ? String(typeFilterRef.current)
            : undefined,
      })
      .catch(x => x);
  }, [
    // eslint-disable-line react-hooks/exhaustive-deps
    ownTransactions,
    tokenFilterRef.current,
    typeFilterRef.current,
  ]);

  React.useEffect(() => {
    poolTxList.startPooling();

    return () => {
      poolTxList.stopPooling();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const data = React.useMemo<
    (PoolTxListItem & { usdAmount: BigNumber | undefined })[]
  >(() => {
    return poolTxList.transactions.map(tx => {
      const price = web3c.getTokenUsdPrice(tx.token);

      return {
        ...tx,
        usdAmount: price ? tx.amount.multipliedBy(price) : undefined,
      };
    });
  }, [web3c, poolTxList.transactions]);

  return (
    <div className={cx(s.component, props.className)}>
      <div className={s.header}>
        <div className={s.headerLabel}>{props.label}</div>
        <div className={s.filters}>
          <Grid flow="col" gap={24}>
            <Select
              label="Tokens"
              options={tokenFilterOptions}
              disabled={poolTxList.loading}
              value={tokenFilterRef.current}
              onSelect={(value: string | number) => {
                tokenFilterRef.current = String(value);
                forceRender({});
              }}
            />
            <Select
              label="Show"
              options={TypeFilters}
              disabled={poolTxList.loading}
              value={typeFilterRef.current}
              onSelect={(value: string | number) => {
                typeFilterRef.current = String(value);
                forceRender({});
              }}
            />
          </Grid>
        </div>
      </div>
      <Antd.Table
        className={s.table}
        loading={!poolTxList.loaded && poolTxList.loading}
        columns={Columns}
        rowKey="txHash"
        dataSource={data}
        scroll={{ x: true }}
        locale={{
          emptyText: (
            <div className={s.emptyBlock}>
              <EmptyBoxSvg />
              <div className={s.emptyLabel}>
                There are no transactions to show
              </div>
            </div>
          ),
        }}
        showSorterTooltip={false}
        pagination={false}
        footer={() => (
          <>
            {!poolTxList.isEnd && (
              <Button
                type="light"
                disabled={poolTxList.loading}
                onClick={poolTxList.loadNext}>
                Load more transactions
              </Button>
            )}
          </>
        )}
      />
    </div>
  );
};

const PoolTransactionTable: React.FunctionComponent<PoolTransactionTableProps> = props => (
  <PoolTxListProvider>
    <PoolTransactionTableInner {...props} />
  </PoolTxListProvider>
);

export default PoolTransactionTable;
