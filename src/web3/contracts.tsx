import React from 'react';
import * as Antd from 'antd';
import BigNumber from 'bignumber.js';

import { useWallet } from 'wallets/wallet';
import { getHumanValue, PoolTypes, ZERO_BIG_NUMBER } from 'web3/utils';
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
import {
  useYieldFarmLPContractV2,
  YieldFarmLPContractV2,
} from 'web3/contracts/yieldFarmLPV2';
import {
  useYieldFarmUNIXContractV2,
  YieldFarmUNIXContractV2,
} from 'web3/contracts/yieldFarmUNIXV2';

import { StakingContract, useStakingContract } from 'web3/contracts/staking';

import UserRejectedModal from 'web3/components/user-rejected-modal';

export type Web3ContractsData = {
  unix: UNIXContract;
  uniswap: UNISWAPContract;
  yfLP: YieldFarmLPContract;
  yfUNIX: YieldFarmUNIXContract;
  yfLPV2: YieldFarmLPContractV2;
  yfUNIXV2: YieldFarmUNIXContractV2;
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
    totalCurrentRewardV1?: BigNumber;
    totalPotentialReward?: BigNumber;
    totalReward?: BigNumber;
    unixReward?: BigNumber;
    unixLockedPrice?: BigNumber;
    estUnixApy?: BigNumber;
    estLPApy?: BigNumber;
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
  const yfLPContractV2 = useYieldFarmLPContractV2();
  const yfUNIXContractV2 = useYieldFarmUNIXContractV2();
  const stakingContract = useStakingContract();

  const [userRejectedVisible, setUserRejectedVisible] = React.useState<boolean>(
    false,
  );

  React.useEffect(() => {
    const contracts = [
      unixContract.contract,
      uniswapContract.contract,
      yfLPContract.contract,
      yfUNIXContractV2.contract,
      yfLPContractV2.contract,
      yfUNIXContractV2.contract,
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
      yfLPContractV2.contract,
      yfUNIXContractV2.contract,
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
    const poolSize = yfLPContractV2.nextPoolSize;
    const price = uniswapContract.unilpPrice;

    if (poolSize === undefined || price === undefined) {
      return undefined;
    }

    return poolSize.multipliedBy(price);
  }

  function myLPStakedValue() {
    const epochStake = yfLPContractV2.nextEpochStake;
    const price = uniswapContract.unilpPrice;

    if (epochStake === undefined || price === undefined) {
      return undefined;
    }

    return epochStake.multipliedBy(price);
  }

  function yfLPEffectiveStakedValue() {
    const poolSize = yfLPContractV2.poolSize;
    const price = uniswapContract.unilpPrice;

    if (poolSize === undefined || price === undefined) {
      return undefined;
    }

    return poolSize.multipliedBy(price);
  }

  function myLPEffectiveStakedValue() {
    const epochStake = yfLPContractV2.epochStake;
    const price = uniswapContract.unilpPrice;

    if (epochStake === undefined || price === undefined) {
      return undefined;
    }

    return epochStake.multipliedBy(price);
  }


  function yfUNIXStakedValue() {
    const poolSize = yfUNIXContractV2.nextPoolSize;
    const price = uniswapContract.unixPrice;

    if (poolSize === undefined || price === undefined) {
      return undefined;
    }

    return poolSize.multipliedBy(price);
  }

  function myUNIXStakedValue() {
    const epochStake = yfUNIXContractV2.nextEpochStake;
    const price = uniswapContract.unixPrice;

    if (epochStake === undefined || price === undefined) {
      return undefined;
    }

    return epochStake.multipliedBy(price);
  }

  function yfUNIXEffectiveStakedValue() {
    const poolSize = yfUNIXContractV2.poolSize;
    const price = uniswapContract.unixPrice;

    if (poolSize === undefined || price === undefined) {
      return undefined;
    }

    return poolSize.multipliedBy(price);
  }

  function myUNIXEffectiveStakedValue() {
    const epochStake = yfUNIXContractV2.epochStake;
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
      yfLPContractV2.currentEpoch === 0
        ? ZERO_BIG_NUMBER
        : yfLPContractV2.currentReward;
    const yfUNIXReward =
      yfUNIXContractV2.currentEpoch === 0
        ? ZERO_BIG_NUMBER
        : yfUNIXContractV2.currentReward;

    if (
      yfLPReward === undefined ||
      yfUNIXReward === undefined
    )
      return undefined;

    return yfLPReward.plus(yfUNIXReward);
  }

  function totalCurrentRewardV1(): BigNumber | undefined {
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
    const yfLPReward = yfLPContractV2.potentialReward;
    const yfUNIXReward = yfUNIXContractV2.potentialReward;

    if (
      yfLPReward === undefined ||
      yfUNIXReward === undefined
    )
      return undefined;

    let total = ZERO_BIG_NUMBER;

    if (yfLPContractV2.isEnded === false) {
      total = total.plus(yfLPReward);
    }

    if (yfUNIXContractV2.isEnded === false) {
      total = total.plus(yfUNIXReward);
    }

    return total;
  }

  function totalReward(): BigNumber | undefined {
    const yfLPTotalReward = yfLPContractV2.totalReward;
    const yfUNIXTotalReward = yfUNIXContractV2.totalReward;
    const yfLPTotalRewardV1 = yfLPContract.totalReward;
    const yfUNIXTotalRewardV1 = yfUNIXContract.totalReward;

    if (
      yfLPTotalReward === undefined ||
      yfUNIXTotalReward === undefined ||
      yfLPTotalRewardV1 === undefined ||
      yfUNIXTotalRewardV1 === undefined
    )
      return undefined;

    return yfLPTotalReward.plus(yfUNIXTotalReward).plus(yfLPTotalRewardV1.div(2)).plus(yfUNIXTotalRewardV1.div(2));
  }

  function unixReward(): BigNumber | undefined {
    const yfLPReward = yfLPContractV2.unixReward;
    const yfUNIXReward = yfUNIXContractV2.unixReward;
    const yfLPRewardV1 = yfLPContract.unixReward;
    const yfUNIXRewardV1 = yfUNIXContract.unixReward;
    if (
      yfLPReward === undefined ||
      yfUNIXReward === undefined ||
      yfLPRewardV1 === undefined ||
      yfUNIXRewardV1 === undefined
    )
      return undefined;

    return yfLPReward.plus(yfUNIXReward).plus(yfLPRewardV1).plus(yfUNIXRewardV1);
  }

  function estUnixApy(): BigNumber | undefined {
    const yfUnixReward = yfUNIXContractV2.epochReward
    const epochLength = stakingContract.epochDuration
    const yfUnixStake = yfUNIXContractV2.nextPoolSize

    if (
      yfUnixReward === undefined ||
      yfUnixStake === undefined ||
      epochLength === undefined
    )
      return undefined;

    const epochLengthSecs = epochLength / 1_000
    const epochDays = new BigNumber(epochLengthSecs).dividedBy(86400)
    const rewardPerDay = yfUnixReward.dividedBy(epochDays)

    const annualReward = rewardPerDay.multipliedBy(365)

    return annualReward.dividedBy(yfUnixStake).multipliedBy(100)
  }

  function estLPApy(): BigNumber | undefined {
    const yfLpReward = yfLPContractV2.epochReward
    const yfLpStaked = yfLPStakedValue()
    const price = uniswapContract.unixPrice;
    const numEpochs = yfLPContractV2.totalEpochs
    const epochLength = stakingContract.epochDuration

    if (
      yfLpReward === undefined ||
      yfLpStaked === undefined ||
      price === undefined ||
      numEpochs === undefined ||
      epochLength === undefined
    )
      return undefined;

    const epochLengthSecs = epochLength / 1_000
    const epochDays = new BigNumber(epochLengthSecs).dividedBy(86400)
    const rewardPerDay = yfLpReward.dividedBy(epochDays)

    const rewardValue = rewardPerDay.multipliedBy(price)

    const annualReward = rewardValue.multipliedBy(365)
    return annualReward.dividedBy(yfLpStaked).multipliedBy(100)
  }

  const value = {
    unix: unixContract,
    uniswap: uniswapContract,
    yfLP: yfLPContract,
    yfUNIX: yfUNIXContract,
    yfLPV2: yfLPContractV2,
    yfUNIXV2: yfUNIXContractV2,
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
      get totalStaked(): BigNumber | undefined {
        return totalStaked();
      },
      get totalEffectiveStaked(): BigNumber | undefined {
        return totalEffectiveStaked();
      },
      get totalCurrentReward(): BigNumber | undefined {
        return totalCurrentReward();
      },
      get totalCurrentRewardV1(): BigNumber | undefined {
        return totalCurrentRewardV1();
      },
      get totalPotentialReward(): BigNumber | undefined {
        return totalPotentialReward();
      },
      get totalReward(): BigNumber | undefined {
        return totalReward();
      },
      get unixReward(): BigNumber | undefined {
        return unixReward();
      },
      get estUnixApy(): BigNumber | undefined {
        return estUnixApy();
      },
      get estLPApy(): BigNumber | undefined {
        return estLPApy();
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
