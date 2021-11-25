import React from 'react';
import BigNumber from 'bignumber.js';

import { useReload } from 'hooks/useReload';
import { useAsyncEffect } from 'hooks/useAsyncEffect';
import { useRefState } from 'hooks/useRefState';
import { useWallet } from 'wallets/wallet';
import { TokenMeta } from 'web3/types';
import { getGasValue, getHumanValue, getNonHumanValue } from 'web3/utils';
import Web3Contract, { BatchContractMethod } from 'web3/contract';
import { UNISWAPTokenMeta } from 'web3/contracts/uniswap';
import { UNIXTokenMeta } from 'web3/contracts/unix';

export const CONTRACT_STAKING_ADDR = String(
  process.env.REACT_APP_CONTRACT_STAKING_ADDR,
);

type StakingTokenData = {
  epochPoolSize?: BigNumber;
  nextEpochPoolSize?: BigNumber;
  balance?: BigNumber;
  epochUserBalance?: BigNumber;
  nextEpochUserBalance?: BigNumber;
};

type StakingContractData = {
  currentEpoch?: number;
  epoch1Start?: number;
  epochDuration?: number;
  currentEpochEnd?: number;
  uniswap: StakingTokenData;
  unix: StakingTokenData;
};

export type StakingContract = StakingContractData & {
  contract: Web3Contract;
  reload(): void;
  depositSend: (
    tokenMeta: TokenMeta,
    amount: BigNumber,
    gasPrice: number,
  ) => void;
  withdrawSend: (
    tokenMeta: TokenMeta,
    amount: BigNumber,
    gasPrice: number,
  ) => void;
  getEpochAt: (timestamp: number) => number | undefined;
  getEpochPeriod: (epoch: number) => [number, number] | undefined;
};

const InitialData: StakingContractData = {
  currentEpoch: undefined,
  epoch1Start: undefined,
  epochDuration: undefined,
  currentEpochEnd: undefined,
  uniswap: {
    epochPoolSize: undefined,
    nextEpochPoolSize: undefined,
    balance: undefined,
    epochUserBalance: undefined,
    nextEpochUserBalance: undefined,
  },
  unix: {
    epochPoolSize: undefined,
    nextEpochPoolSize: undefined,
    balance: undefined,
    epochUserBalance: undefined,
    nextEpochUserBalance: undefined,
  },
};

export function useStakingContract(): StakingContract {
  const [reload] = useReload();
  const wallet = useWallet();

  const contract = React.useMemo<Web3Contract>(() => {
    return new Web3Contract(
      require('web3/abi/staking.json'),
      CONTRACT_STAKING_ADDR,
      'STAKING',
    );
  }, []);

  const [data, setData, dataRef] = useRefState<StakingContractData>(
    InitialData,
  );

  useAsyncEffect(async () => {
    const [currentEpoch, epoch1Start, epochDuration] = await contract.batch([
      {
        method: 'getCurrentEpoch',
        transform: (value: string) => Number(value),
      },
      {
        method: 'epoch1Start',
        transform: (value: string) => Number(value) * 1_000,
      },
      {
        method: 'epochDuration',
        transform: (value: string) => Number(value) * 1_000,
      },
    ]);

    setData(prevState => ({
      ...prevState,
      currentEpoch,
      epoch1Start,
      epochDuration,
      currentEpochEnd: epoch1Start + currentEpoch * epochDuration,
    }));

    const [
      uniEpochPoolSize,
      uniNextEpochPoolSize,
      unixEpochPoolSize,
      unixNextEpochPoolSize,
    ] = await contract.batch([
      ...[
        UNISWAPTokenMeta,
        UNIXTokenMeta,
      ].reduce((ac: BatchContractMethod[], token) => {
        return [
          ...ac,
          {
            method: 'getEpochPoolSize',
            methodArgs: [token.address, currentEpoch],
            transform: (value: string) =>
              getHumanValue(new BigNumber(value), token.decimals),
          },
          {
            method: 'getEpochPoolSize',
            methodArgs: [token.address, currentEpoch + 1],
            transform: (value: string) =>
              getHumanValue(new BigNumber(value), token.decimals),
          },
        ];
      }, []),
    ]);

    setData(prevState => ({
      ...prevState,
      uniswap: {
        ...prevState.uniswap,
        epochPoolSize: uniEpochPoolSize,
        nextEpochPoolSize: uniNextEpochPoolSize,
      },
      unix: {
        ...prevState.unix,
        epochPoolSize: unixEpochPoolSize,
        nextEpochPoolSize: unixNextEpochPoolSize,
      },
    }));
  }, [reload]);

  useAsyncEffect(async () => {
    const { currentEpoch } = data;

    let uniswapBalance: BigNumber | undefined;
    let uniswapEpochUserBalance: BigNumber | undefined;
    let uniswapNextEpochUserBalance: BigNumber | undefined;
    let unixBalance: BigNumber | undefined;
    let unixEpochUserBalance: BigNumber | undefined;
    let unixNextEpochUserBalance: BigNumber | undefined;

    if (wallet.account && currentEpoch !== undefined) {
      [
        uniswapBalance,
        uniswapEpochUserBalance,
        uniswapNextEpochUserBalance,
        unixBalance,
        unixEpochUserBalance,
        unixNextEpochUserBalance,
      ] = await contract.batch([
        ...[
          UNISWAPTokenMeta,
          UNIXTokenMeta,
        ].reduce(
          (ac: BatchContractMethod[], token) => [
            ...ac,
            {
              method: 'balanceOf',
              methodArgs: [wallet.account, token.address],
              transform: (value: string) =>
                getHumanValue(new BigNumber(value), token.decimals),
            },
            {
              method: 'getEpochUserBalance',
              methodArgs: [wallet.account, token.address, currentEpoch],
              transform: (value: string) =>
                getHumanValue(new BigNumber(value), token.decimals),
            },
            {
              method: 'getEpochUserBalance',
              methodArgs: [wallet.account, token.address, currentEpoch + 1],
              transform: (value: string) =>
                getHumanValue(new BigNumber(value), token.decimals),
            },
          ],
          [],
        ),
      ]);
    }

    setData(prevState => ({
      ...prevState,
      uniswap: {
        ...prevState.uniswap,
        balance: uniswapBalance,
        epochUserBalance: uniswapEpochUserBalance,
        nextEpochUserBalance: uniswapNextEpochUserBalance,
      },
      unix: {
        ...prevState.unix,
        balance: unixBalance,
        epochUserBalance: unixEpochUserBalance,
        nextEpochUserBalance: unixNextEpochUserBalance,
      },
    }));
  }, [reload, wallet.account, data.currentEpoch]);

  const depositSend = React.useCallback(
    (tokenMeta: TokenMeta, amount: BigNumber, gasPrice: number) => {
      if (!wallet.account) {
        return Promise.reject();
      }

      return contract
        .send(
          'deposit',
          [tokenMeta.address, getNonHumanValue(amount, tokenMeta.decimals)],
          {
            from: wallet.account,
            gasPrice: getGasValue(gasPrice),
          },
        )
        .then(reload);
    },
    [reload, contract, wallet.account],
  );

  const withdrawSend = React.useCallback(
    (tokenMeta: TokenMeta, amount: BigNumber, gasPrice: number) => {
      if (!wallet.account) {
        return Promise.reject();
      }

      return contract
        .send(
          'withdraw',
          [tokenMeta.address, getNonHumanValue(amount, tokenMeta.decimals)],
          {
            from: wallet.account,
            gasPrice: getGasValue(gasPrice),
          },
        )
        .then(reload);
    },
    [reload, contract, wallet.account],
  );

  const getEpochAt = React.useCallback(
    (timestamp: number): number | undefined => {
      const { epoch1Start, epochDuration } = dataRef.current;

      if (epoch1Start === undefined || epochDuration === undefined) {
        return;
      }

      return Math.floor((timestamp - epoch1Start) / epochDuration);
    },
    [dataRef],
  );

  const getEpochPeriod = React.useCallback(
    (epoch: number): [number, number] | undefined => {
      const { epoch1Start, epochDuration } = dataRef.current;

      if (epoch1Start === undefined || epochDuration === undefined) {
        return;
      }

      const start = epoch1Start + (epoch - 1) * epochDuration;
      const end = start + epochDuration;

      return [start, end];
    },
    [dataRef],
  );

  return React.useMemo<StakingContract>(
    () => ({
      ...data,
      contract,
      reload,
      depositSend,
      withdrawSend,
      getEpochAt,
      getEpochPeriod,
    }),
    [
      data,
      contract,
      reload,
      depositSend,
      withdrawSend,
      getEpochAt,
      getEpochPeriod,
    ],
  );
}
