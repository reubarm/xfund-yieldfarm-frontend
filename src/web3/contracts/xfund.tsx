import React from 'react';
import BigNumber from 'bignumber.js';

import { useReload } from 'hooks/useReload';
import { useAsyncEffect } from 'hooks/useAsyncEffect';
import { TokenMeta } from 'web3/types';
import { getHumanValue } from 'web3/utils';
import { useWallet } from 'wallets/wallet';
import Web3Contract from 'web3/contract';
import { CONTRACT_STAKING_ADDR } from 'web3/contracts/staking';

import { ReactComponent as XFUNDIcon } from 'resources/svg/tokens/xfund.svg';

const CONTRACT_XFUND_ADDR = String(process.env.REACT_APP_CONTRACT_XFUND_ADDR).toLowerCase();

export const XFUNDTokenMeta: TokenMeta = {
    icon: <XFUNDIcon key="xfund" />,
    name: 'xFUND',
    address: CONTRACT_XFUND_ADDR,
    decimals: 9,
};

type XFUNDContractData = {
    balance?: BigNumber;
    allowance?: BigNumber;
};

export type XFUNDContract = XFUNDContractData & {
    contract: Web3Contract;
    reload(): void;
    approveSend(value: BigNumber): Promise<any>;
};

const InitialData: XFUNDContractData = {
    balance: undefined,
    allowance: undefined,
};

export function useXFUNDContract(): XFUNDContract {
    const [reload] = useReload();
    const wallet = useWallet();

    const contract = React.useMemo<Web3Contract>(() => {
        return new Web3Contract(
            require('web3/abi/xfund.json'),
            CONTRACT_XFUND_ADDR,
            'xFUND',
        );
    }, []);

    const [data, setData] = React.useState<XFUNDContractData>(InitialData);

    useAsyncEffect(async () => {
        let balance: BigNumber | undefined = undefined;
        let allowance: BigNumber | undefined;

        if (wallet.account) {
            [balance, allowance] = await contract.batch([
                {
                    method: 'balanceOf',
                    methodArgs: [wallet.account],
                    transform: (value: string) => getHumanValue(new BigNumber(value), XFUNDTokenMeta.decimals),
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
