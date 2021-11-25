import React from 'react';
import BigNumber from 'bignumber.js';

import { useReload } from 'hooks/useReload';
import { useAsyncEffect } from 'hooks/useAsyncEffect';
import { TokenMeta } from 'web3/types';
import { getHumanValue } from 'web3/utils';
import { useWallet } from 'wallets/wallet';
import Web3Contract from 'web3/contract';
import { CONTRACT_STAKING_ADDR } from 'web3/contracts/staking';

import { ReactComponent as UNIXIcon } from 'resources/svg/tokens/unix.svg';

const CONTRACT_UNIX_ADDR = String(process.env.REACT_APP_CONTRACT_UNIX_ADDR).toLowerCase();

export const UNIXTokenMeta: TokenMeta = {
    icon: <UNIXIcon key="unix" name="unix-token" />,
    name: 'UniX',
    address: CONTRACT_UNIX_ADDR,
    decimals: 18,
};

type UNIXContractData = {
    balance?: BigNumber;
    allowance?: BigNumber;
};

export type UNIXContract = UNIXContractData & {
    contract: Web3Contract;
    reload(): void;
    approveSend(value: BigNumber): Promise<any>;
};

const InitialData: UNIXContractData = {
    balance: undefined,
    allowance: undefined,
};

export function useUNIXContract(): UNIXContract {
    const [reload] = useReload();
    const wallet = useWallet();

    const contract = React.useMemo<Web3Contract>(() => {
        return new Web3Contract(
            require('web3/abi/unix.json'),
            CONTRACT_UNIX_ADDR,
            'UniX',
        );
    }, []);

    const [data, setData] = React.useState<UNIXContractData>(InitialData);

    useAsyncEffect(async () => {
        let balance: BigNumber | undefined = undefined;
        let allowance: BigNumber | undefined;

        if (wallet.account) {
            [balance, allowance] = await contract.batch([
                {
                    method: 'balanceOf',
                    methodArgs: [wallet.account],
                    transform: (value: string) => getHumanValue(new BigNumber(value), UNIXTokenMeta.decimals),
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
    }, [reload, contract, wallet.account]);

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

    return React.useMemo(() => ({
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
