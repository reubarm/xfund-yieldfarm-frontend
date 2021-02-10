import React from 'react';
import BigNumber from 'bignumber.js';

import { useReload } from 'hooks/useReload';
import { useAsyncEffect } from 'hooks/useAsyncEffect';
import { TokenMeta } from 'web3/types';
import { getHumanValue } from 'web3/utils';
import { useWallet } from 'wallets/wallet';
import Web3Contract from 'web3/contract';
import { CONTRACT_STAKING_ADDR } from 'web3/contracts/staking';

import { ReactComponent as WETHIcon } from 'resources/svg/tokens/weth.svg';

const CONTRACT_WETH_ADDR = String(process.env.REACT_APP_CONTRACT_WETH_ADDR).toLowerCase();

export const WETHTokenMeta: TokenMeta = {
    icon: <WETHIcon key="eth" />,
    name: 'ETH',
    address: CONTRACT_WETH_ADDR,
    decimals: 18,
};

type WETHContractData = {
    balance?: BigNumber;
    allowance?: BigNumber;
};

export type WETHContract = WETHContractData & {
    contract: Web3Contract;
    reload(): void;
    approveSend(value: BigNumber): Promise<any>;
};

const InitialData: WETHContractData = {
    balance: undefined,
    allowance: undefined,
};

export function useWETHContract(): WETHContract {
    const [reload] = useReload();
    const wallet = useWallet();

    const contract = React.useMemo<Web3Contract>(() => {
        return new Web3Contract(
            require('web3/abi/weth.json'),
            CONTRACT_WETH_ADDR,
            'ETH',
        );
    }, []);

    const [data, setData] = React.useState<WETHContractData>(InitialData);

    useAsyncEffect(async () => {
        let balance: BigNumber | undefined;
        let allowance: BigNumber | undefined;

        if (wallet.account) {
            [balance, allowance] = await contract.batch([
                {
                    method: 'balanceOf',
                    methodArgs: [wallet.account],
                    transform: (value: string) => getHumanValue(new BigNumber(value), WETHTokenMeta.decimals),
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

    const approveSend = React.useCallback((value: BigNumber): Promise<any> => {
        if (!wallet.account) {
            return Promise.reject();
        }

        return contract.send('approve', [
            CONTRACT_STAKING_ADDR,
            value,
        ], {
            from: wallet.account,
        }).then(reload);
    }, [reload, contract, wallet.account]);

    return React.useMemo<WETHContract>(() => ({
        ...data,
        contract,
        reload,
        approveSend,
    }), [
        data,
        contract,
        reload,
        approveSend,
    ]);
}
