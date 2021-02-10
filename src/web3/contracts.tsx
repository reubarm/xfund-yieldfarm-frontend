import React from 'react';
import * as Antd from 'antd';
import BigNumber from 'bignumber.js';

import { useWallet } from 'wallets/wallet';
import { PoolTypes, ZERO_BIG_NUMBER } from 'web3/utils';
import Web3Contract from 'web3/contract';
import {
  XFUNDContract,
  XFUNDTokenMeta,
  useXFUNDContract,
} from 'web3/contracts/xfund';
import {
  UNISWAPContract,
  UNISWAPTokenMeta,
  useUNISWAPContract,
} from 'web3/contracts/uniswap';
import {
  useYieldFarmLPContract,
  YieldFarmLPContract,
} from 'web3/contracts/yieldFarmLP';
import {
  useYieldFarmXFUNDContract,
  YieldFarmXFUNDContract,
} from 'web3/contracts/yieldFarmXFUND';
import { StakingContract, useStakingContract } from 'web3/contracts/staking';

import UserRejectedModal from 'web3/components/user-rejected-modal';

export type Web3ContractsData = {
  xfund: XFUNDContract;
  uniswap: UNISWAPContract;
  yfLP: YieldFarmLPContract;
  yfXFUND: YieldFarmXFUNDContract;
  staking: StakingContract;
  aggregated: {
    yfLPStakedValue?: BigNumber;
    myLPStakedValue?: BigNumber;
    yfLPEffectiveStakedValue?: BigNumber;
    myLPEffectiveStakedValue?: BigNumber;
    yfXFUNDStakedValue?: BigNumber;
    myXFUNDStakedValue?: BigNumber;
    yfXFUNDEffectiveStakedValue?: BigNumber;
    myXFUNDEffectiveStakedValue?: BigNumber;
    totalStaked?: BigNumber;
    totalEffectiveStaked?: BigNumber;
    totalCurrentReward?: BigNumber;
    totalPotentialReward?: BigNumber;
    totalXfundReward?: BigNumber;
    xfundReward?: BigNumber;
    xfundLockedPrice?: BigNumber;
  };
};

export type Web3Contracts = Web3ContractsData & {
  getPoolUsdPrice(poolType: PoolTypes): BigNumber | undefined;
  getTokenUsdPrice(tokenAddress: string): BigNumber | undefined;
};

const Web3ContractsContext = React.createContext<Web3Contracts>({} as any);

export function useWeb3Contracts(): Web3Contracts {
  return React.useContext(Web3ContractsContext);
}

const Web3ContractsProvider: React.FunctionComponent = props => {
  const wallet = useWallet();
  const xfundContract = useXFUNDContract();
  const uniswapContract = useUNISWAPContract();
  const yfLPContract = useYieldFarmLPContract();
  const yfXFUNDContract = useYieldFarmXFUNDContract();
  const stakingContract = useStakingContract();

  const [userRejectedVisible, setUserRejectedVisible] = React.useState<boolean>(
    false,
  );

  React.useEffect(() => {
    const contracts = [
      xfundContract.contract,
      uniswapContract.contract,
      yfLPContract.contract,
      yfXFUNDContract.contract,
      stakingContract.contract,
    ];

    function handleError(
      err: Error & { code: number },
      contract: Web3Contract,
      { method }: any,
    ) {
      console.error(`${contract.name}:${method}`, { error: err });

      if (err.code === 4001) {
        setUserRejectedVisible(true);
      } else {
        Antd.notification.error({
          message: err.message,
        });
      }
    }

    contracts.forEach((contract: Web3Contract) => {
      contract.on('error', handleError);
    });

    return () => {
      contracts.forEach((contract: Web3Contract) => {
        contract.off('error', handleError);
      });
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    const contracts = [
      xfundContract.contract,
      uniswapContract.contract,
      yfLPContract.contract,
      yfXFUNDContract.contract,
      stakingContract.contract,
    ];

    contracts.forEach(contract => {
      contract.setProvider(wallet.provider);
    });
  }, [wallet.provider]); // eslint-disable-line react-hooks/exhaustive-deps

  function getPoolUsdPrice(poolType: PoolTypes): BigNumber | undefined {
    switch (poolType) {
      case PoolTypes.STABLE:
        return uniswapContract.stablePrice;
      case PoolTypes.UNILP:
        return uniswapContract.unilpPrice;
      case PoolTypes.XFUND:
        return uniswapContract.xfundPrice;
      default:
        return undefined;
    }
  }

  function getTokenUsdPrice(tokenAddress: string): BigNumber | undefined {
    switch (tokenAddress) {
      case UNISWAPTokenMeta.address:
        return getPoolUsdPrice(PoolTypes.UNILP);
      case XFUNDTokenMeta.address:
        return getPoolUsdPrice(PoolTypes.XFUND);
      default:
        return undefined;
    }
  }

  function yfLPStakedValue() {
    const poolSize = yfLPContract.nextPoolSize;
    const price = uniswapContract.unilpPrice;

    if (poolSize === undefined || price === undefined) {
      return undefined;
    }

    return poolSize.multipliedBy(price);
  }

  function myLPStakedValue() {
    const epochStake = yfLPContract.nextEpochStake;
    const price = uniswapContract.unilpPrice;

    if (epochStake === undefined || price === undefined) {
      return undefined;
    }

    return epochStake.multipliedBy(price);
  }

  function yfLPEffectiveStakedValue() {
    const poolSize = yfLPContract.poolSize;
    const price = uniswapContract.unilpPrice;

    if (poolSize === undefined || price === undefined) {
      return undefined;
    }

    return poolSize.multipliedBy(price);
  }

  function myLPEffectiveStakedValue() {
    const epochStake = yfLPContract.epochStake;
    const price = uniswapContract.unilpPrice;

    if (epochStake === undefined || price === undefined) {
      return undefined;
    }

    return epochStake.multipliedBy(price);
  }

  function yfXFUNDStakedValue() {
    const poolSize = yfXFUNDContract.nextPoolSize;
    const price = uniswapContract.xfundPrice;

    if (poolSize === undefined || price === undefined) {
      return undefined;
    }

    return poolSize.multipliedBy(price);
  }

  function myXFUNDStakedValue() {
    const epochStake = yfXFUNDContract.nextEpochStake;
    const price = uniswapContract.xfundPrice;

    if (epochStake === undefined || price === undefined) {
      return undefined;
    }

    return epochStake.multipliedBy(price);
  }

  function yfXFUNDEffectiveStakedValue() {
    const poolSize = yfXFUNDContract.poolSize;
    const price = uniswapContract.xfundPrice;

    if (poolSize === undefined || price === undefined) {
      return undefined;
    }

    return poolSize.multipliedBy(price);
  }

  function myXfundEffectiveStakedValue() {
    const epochStake = yfXFUNDContract.epochStake;
    const price = uniswapContract.xfundPrice;

    if (epochStake === undefined || price === undefined) {
      return undefined;
    }

    return epochStake.multipliedBy(price);
  }

  function totalStaked(): BigNumber | undefined {
    const yfLPStaked = yfLPStakedValue();
    const yfXFUNDStaked = yfXFUNDStakedValue();

    if (
      yfLPStaked === undefined ||
      yfXFUNDStaked === undefined
    ) {
      return undefined;
    }

    return yfLPStaked.plus(yfXFUNDStaked);
  }

  function totalEffectiveStaked(): BigNumber | undefined {
    const yfLPStaked = yfLPEffectiveStakedValue();
    const yfXFUNDStaked = yfXFUNDEffectiveStakedValue();

    if (
      yfLPStaked === undefined ||
      yfXFUNDStaked === undefined
    ) {
      return undefined;
    }

    return yfLPStaked.plus(yfXFUNDStaked);
  }

  function totalCurrentReward(): BigNumber | undefined {
    const yfLPReward =
      yfLPContract.currentEpoch === 0
        ? ZERO_BIG_NUMBER
        : yfLPContract.currentReward;
    const yfXFUNDReward =
      yfXFUNDContract.currentEpoch === 0
        ? ZERO_BIG_NUMBER
        : yfXFUNDContract.currentReward;

    if (
      yfLPReward === undefined ||
      yfXFUNDReward === undefined
    )
      return undefined;

    return yfLPReward.plus(yfXFUNDReward);
  }

  function totalPotentialReward(): BigNumber | undefined {
    const yfLPReward = yfLPContract.potentialReward;
    const yfXFUNDReward = yfXFUNDContract.potentialReward;

    if (
      yfLPReward === undefined ||
      yfXFUNDReward === undefined
    )
      return undefined;

    let total = ZERO_BIG_NUMBER;

    if (yfLPContract.isEnded === false) {
      total = total.plus(yfLPReward);
    }

    if (yfXFUNDContract.isEnded === false) {
      total = total.plus(yfXFUNDReward);
    }

    return total;
  }

  function totalXfundReward(): BigNumber | undefined {
    const yfLPTotalReward = yfLPContract.totalReward;
    const yfXFUNDTotalReward = yfXFUNDContract.totalReward;

    if (
      yfLPTotalReward === undefined ||
      yfXFUNDTotalReward === undefined
    )
      return undefined;

    return yfLPTotalReward.plus(yfXFUNDTotalReward);
  }

  function xfundReward(): BigNumber | undefined {
    const yfLPReward = yfLPContract.xfundReward;
    const yfXFUNDReward = yfXFUNDContract.xfundReward;

    if (
      yfLPReward === undefined ||
      yfXFUNDReward === undefined
    )
      return undefined;

    return yfLPReward.plus(yfXFUNDReward);
  }

  const value = {
    xfund: xfundContract,
    uniswap: uniswapContract,
    yfLP: yfLPContract,
    yfXFUND: yfXFUNDContract,
    staking: stakingContract,
    aggregated: {
      get yfLPStakedValue(): BigNumber | undefined {
        return yfLPStakedValue();
      },
      get myLPStakedValue(): BigNumber | undefined {
        return myLPStakedValue();
      },
      get yfLPEffectiveStakedValue(): BigNumber | undefined {
        return yfLPEffectiveStakedValue();
      },
      get myLPEffectiveStakedValue(): BigNumber | undefined {
        return myLPEffectiveStakedValue();
      },
      get yfXFUNDStakedValue(): BigNumber | undefined {
        return yfXFUNDStakedValue();
      },
      get myXFUNDStakedValue(): BigNumber | undefined {
        return myXFUNDStakedValue();
      },
      get yfXFUNDEffectiveStakedValue(): BigNumber | undefined {
        return yfXFUNDEffectiveStakedValue();
      },
      get myXfundEffectiveStakedValue(): BigNumber | undefined {
        return myXfundEffectiveStakedValue();
      },
      get totalStaked(): BigNumber | undefined {
        return totalStaked();
      },
      get totalEffectiveStaked(): BigNumber | undefined {
        return totalEffectiveStaked();
      },
      get totalCurrentReward(): BigNumber | undefined {
        return totalCurrentReward();
      },
      get totalPotentialReward(): BigNumber | undefined {
        return totalPotentialReward();
      },
      get totalXfundReward(): BigNumber | undefined {
        return totalXfundReward();
      },
      get xfundReward(): BigNumber | undefined {
        return xfundReward();
      },
    },
    getPoolUsdPrice,
    getTokenUsdPrice,
  };

  return (
    <Web3ContractsContext.Provider value={value}>
      {userRejectedVisible && (
        <UserRejectedModal
          visible
          onCancel={() => setUserRejectedVisible(false)}
        />
      )}
      {props.children}
    </Web3ContractsContext.Provider>
  );
};

export default Web3ContractsProvider;
