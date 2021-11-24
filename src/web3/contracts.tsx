import React from 'react';
import * as Antd from 'antd';
import BigNumber from 'bignumber.js';

import { useWallet } from 'wallets/wallet';
import { PoolTypes, ZERO_BIG_NUMBER } from 'web3/utils';
import Web3Contract from 'web3/contract';
import {
  UNIXContract,
  UNIXTokenMeta,
  useUNIXContract,
} from 'web3/contracts/unix';
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
  useYieldFarmUNIXContract,
  YieldFarmUNIXContract,
} from 'web3/contracts/yieldFarmUNIX';

import { StakingContract, useStakingContract } from 'web3/contracts/staking';

import UserRejectedModal from 'web3/components/user-rejected-modal';

export type Web3ContractsData = {
  unix: UNIXContract;
  uniswap: UNISWAPContract;
  yfLP: YieldFarmLPContract;
  yfUNIX: YieldFarmUNIXContract;
  staking: StakingContract;
  aggregated: {
    yfLPStakedValue?: BigNumber;
    myLPStakedValue?: BigNumber;
    yfLPEffectiveStakedValue?: BigNumber;
    myLPEffectiveStakedValue?: BigNumber;
    yfUNIXStakedValue?: BigNumber;
    myUNIXStakedValue?: BigNumber;
    yfUNIXEffectiveStakedValue?: BigNumber;
    myUNIXEffectiveStakedValue?: BigNumber;
    totalStaked?: BigNumber;
    totalEffectiveStaked?: BigNumber;
    totalCurrentReward?: BigNumber;
    totalPotentialReward?: BigNumber;
    totalUnixReward?: BigNumber;
    unixReward?: BigNumber;
    unixLockedPrice?: BigNumber;
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
  const unixContract = useUNIXContract();
  const uniswapContract = useUNISWAPContract();
  const yfLPContract = useYieldFarmLPContract();
  const yfUNIXContract = useYieldFarmUNIXContract();
  const stakingContract = useStakingContract();

  const [userRejectedVisible, setUserRejectedVisible] = React.useState<boolean>(
    false,
  );

  React.useEffect(() => {
    const contracts = [
      unixContract.contract,
      uniswapContract.contract,
      yfLPContract.contract,
      yfUNIXContract.contract,
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
      unixContract.contract,
      uniswapContract.contract,
      yfLPContract.contract,
      yfUNIXContract.contract,
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
      case PoolTypes.UNIX:
        return uniswapContract.unixPrice;
      default:
        return undefined;
    }
  }

  function getTokenUsdPrice(tokenAddress: string): BigNumber | undefined {
    switch (tokenAddress) {
      case UNISWAPTokenMeta.address:
        return getPoolUsdPrice(PoolTypes.UNILP);
      case UNIXTokenMeta.address:
        return getPoolUsdPrice(PoolTypes.UNIX);
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


  function yfUNIXStakedValue() {
    const poolSize = yfUNIXContract.nextPoolSize;
    const price = uniswapContract.unixPrice;

    if (poolSize === undefined || price === undefined) {
      return undefined;
    }

    return poolSize.multipliedBy(price);
  }

  function myUNIXStakedValue() {
    const epochStake = yfUNIXContract.nextEpochStake;
    const price = uniswapContract.unixPrice;

    if (epochStake === undefined || price === undefined) {
      return undefined;
    }

    return epochStake.multipliedBy(price);
  }

  function yfUNIXEffectiveStakedValue() {
    const poolSize = yfUNIXContract.poolSize;
    const price = uniswapContract.unixPrice;

    if (poolSize === undefined || price === undefined) {
      return undefined;
    }

    return poolSize.multipliedBy(price);
  }

  function myUNIXEffectiveStakedValue() {
    const epochStake = yfUNIXContract.epochStake;
    const price = uniswapContract.unixPrice;

    if (epochStake === undefined || price === undefined) {
      return undefined;
    }

    return epochStake.multipliedBy(price);
  }

  function totalStaked(): BigNumber | undefined {
    const yfLPStaked = yfLPStakedValue();
    const yfUNIXStaked = yfUNIXStakedValue();

    if (
      yfLPStaked === undefined ||
      yfUNIXStaked === undefined
    ) {
      return undefined;
    }

    return yfLPStaked.plus(yfUNIXStaked);
  }

  function totalEffectiveStaked(): BigNumber | undefined {
    const yfLPStaked = yfLPEffectiveStakedValue();
    const yfUNIXStaked = yfUNIXEffectiveStakedValue();

    if (
      yfLPStaked === undefined ||
      yfUNIXStaked === undefined
    ) {
      return undefined;
    }

    return yfLPStaked.plus(yfUNIXStaked);
  }

  function totalCurrentReward(): BigNumber | undefined {
    const yfLPReward =
      yfLPContract.currentEpoch === 0
        ? ZERO_BIG_NUMBER
        : yfLPContract.currentReward;
    const yfUNIXReward =
      yfUNIXContract.currentEpoch === 0
        ? ZERO_BIG_NUMBER
        : yfUNIXContract.currentReward;

    if (
      yfLPReward === undefined ||
      yfUNIXReward === undefined
    )
      return undefined;

    return yfLPReward.plus(yfUNIXReward);
  }

  function totalPotentialReward(): BigNumber | undefined {
    const yfLPReward = yfLPContract.potentialReward;
    const yfUNIXReward = yfUNIXContract.potentialReward;

    if (
      yfLPReward === undefined ||
      yfUNIXReward === undefined
    )
      return undefined;

    let total = ZERO_BIG_NUMBER;

    if (yfLPContract.isEnded === false) {
      total = total.plus(yfLPReward);
    }

    if (yfUNIXContract.isEnded === false) {
      total = total.plus(yfUNIXReward);
    }

    return total;
  }

  function totalUNIXReward(): BigNumber | undefined {
    const yfLPTotalReward = yfLPContract.totalReward;
    const yfUNIXTotalReward = yfUNIXContract.totalReward;

    if (
      yfLPTotalReward === undefined ||
      yfUNIXTotalReward === undefined
    )
      return undefined;

    return yfLPTotalReward.plus(yfUNIXTotalReward);
  }

  function unixReward(): BigNumber | undefined {
    const yfLPReward = yfLPContract.unixReward;
    const yfUNIXReward = yfUNIXContract.unixReward;

    if (
      yfLPReward === undefined ||
      yfUNIXReward === undefined
    )
      return undefined;

    return yfLPReward.plus(yfUNIXReward);
  }

  const value = {
    unix: unixContract,
    uniswap: uniswapContract,
    yfLP: yfLPContract,
    yfUNIX: yfUNIXContract,
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
      get yfUNIXStakedValue(): BigNumber | undefined {
        return yfUNIXStakedValue();
      },
      get myUNIXStakedValue(): BigNumber | undefined {
        return myUNIXStakedValue();
      },
      get yfUNIXEffectiveStakedValue(): BigNumber | undefined {
        return yfUNIXEffectiveStakedValue();
      },
      get myUNIXEffectiveStakedValue(): BigNumber | undefined {
        return myUNIXEffectiveStakedValue();
      },
      ////////////////

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
      get totalUNIXReward(): BigNumber | undefined {
        return totalUNIXReward();
      },
      get unixReward(): BigNumber | undefined {
        return unixReward();
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
