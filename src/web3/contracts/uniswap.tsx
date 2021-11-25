import React from 'react';
import BigNumber from 'bignumber.js';

import Icons from 'components/custom/icon';

import { useReload } from 'hooks/useReload';
import { useAsyncEffect } from 'hooks/useAsyncEffect';
import { useWallet } from 'wallets/wallet';
import { TokenMeta } from 'web3/types';
import { getHumanValue } from 'web3/utils';
import Web3Contract from 'web3/contract';
import { CONTRACT_STAKING_ADDR } from 'web3/contracts/staking';
import { WETHTokenMeta } from 'web3/contracts/weth';
import { UNIXTokenMeta } from 'web3/contracts/unix';

import { ReactComponent as UNIXIcon } from 'resources/svg/tokens/unix.svg';

export const CONTRACT_UNISWAP_ADDR = String(
  process.env.REACT_APP_CONTRACT_UNISWAP_V2_ADDR,
).toLowerCase();

export const UNISWAPTokenMeta: TokenMeta = {
  icon: <UNIXIcon key="unix" name="unix-token" />,
  name: 'ETH-UNIX Uniswap LP',
  address: CONTRACT_UNISWAP_ADDR,
  decimals: 18,
};

type UNISWAPContractData = {
  totalSupply?: BigNumber;
  wethReserve?: BigNumber;
  unixReserve?: BigNumber;
  stablePrice: BigNumber;
  unilpPrice?: BigNumber;
  unixPrice?: BigNumber;
  balance?: BigNumber;
  allowance?: BigNumber;
};

export type UNISWAPContract = UNISWAPContractData & {
  contract: Web3Contract;
  reload(): void;
  approveSend(value: BigNumber): Promise<any>;
};

const InitialData: UNISWAPContractData = {
  totalSupply: undefined,
  wethReserve: undefined,
  unixReserve: undefined,
  stablePrice: new BigNumber(1),
  unilpPrice: undefined,
  unixPrice: undefined,
  balance: undefined,
  allowance: undefined,
};

export function useUNISWAPContract(): UNISWAPContract {
  const [reload] = useReload();
  const wallet = useWallet();

  const contract = React.useMemo<Web3Contract>(() => {
    return new Web3Contract(
      require('web3/abi/uniswap_v2.json'),
      CONTRACT_UNISWAP_ADDR,
      'UNISWAP',
    );
  }, []);

  const [data, setData] = React.useState<UNISWAPContractData>(InitialData);

  useAsyncEffect(async () => {
    const [totalSupply, reserves, token0, token1] = await contract.batch([
      {
        method: 'totalSupply',
        transform: (value: string) =>
          getHumanValue(new BigNumber(value), UNISWAPTokenMeta.decimals),
      },
      {
        method: 'getReserves',
        transform: (value: string[]) => [
          new BigNumber(value[0]),
          new BigNumber(value[1]),
        ],
      },
      {
        method: 'token0',
        transform: (value: string) => value.toLowerCase(),
      },
      {
        method: 'token1',
        transform: (value: string) => value.toLowerCase(),
      },
    ]);

    let wethReserve: BigNumber | undefined;
    let unixReserve: BigNumber | undefined;

    if (token0 === WETHTokenMeta.address) {
      wethReserve = getHumanValue(reserves[0], WETHTokenMeta.decimals);
      unixReserve = getHumanValue(reserves[1], UNIXTokenMeta.decimals);
    } else if (token1 === WETHTokenMeta.address) {
      wethReserve = getHumanValue(reserves[1], WETHTokenMeta.decimals);
      unixReserve = getHumanValue(reserves[0], UNIXTokenMeta.decimals);
    }

    const lpPrice = wethReserve?.div(totalSupply ?? 1);

    //amountB = amountA.mul(reserveB) / reserveA;
    const unixPrice = wethReserve?.div(unixReserve ?? 1);

    setData(prevState => ({
      ...prevState,
      totalSupply,
      wethReserve: wethReserve,
      unilpPrice: lpPrice,
      unixReserve: unixReserve,
      unixPrice: unixPrice,
    }));
  }, []);

  useAsyncEffect(async () => {
    let balance: BigNumber | undefined;
    let allowance: BigNumber | undefined;

    if (wallet.account) {
      [balance, allowance] = await contract.batch([
        {
          method: 'balanceOf',
          methodArgs: [wallet.account],
          transform: (value: string) =>
            getHumanValue(new BigNumber(value), UNISWAPTokenMeta.decimals),
        },
        {
          method: 'allowance',
          methodArgs: [wallet.account, CONTRACT_STAKING_ADDR],
          transform: (value: string) => new BigNumber(value),
        },
      ]);
    }

    setData(prevState => ({
      ...prevState,
      balance,
      allowance,
    }));
  }, [reload, wallet.account]);

  const approveSend = React.useCallback(
    (value: BigNumber): Promise<any> => {
      if (!wallet.account) {
        return Promise.reject();
      }

      return contract
        .send('approve', [CONTRACT_STAKING_ADDR, value], {
          from: wallet.account,
        })
        .then(reload);
    },
    [reload, contract, wallet.account],
  );

  return React.useMemo<UNISWAPContract>(
    () => ({
      ...data,
      contract,
      reload,
      approveSend,
    }),
    [data, contract, reload, approveSend],
  );
}
