import React from 'react';
import * as Antd from 'antd';
import BigNumber from 'bignumber.js';

import Card from 'components/antd/card';
import Form from 'components/antd/form';
import Button from 'components/antd/button';
import Alert from 'components/antd/alert';
import Tooltip from 'components/antd/tooltip';
import Grid from 'components/custom/grid';
import Icons, { TokenIconNames } from 'components/custom/icon';
import TokenAmount from 'components/custom/token-amount';
import GasFeeList from 'components/custom/gas-fee-list';
import { Label, Paragraph, Small } from 'components/custom/typography';

import { TokenMeta } from 'web3/types';
import { formatBigValue, getNonHumanValue, MAX_UINT_256, PoolTypes, ZERO_BIG_NUMBER } from 'web3/utils';
import { useWeb3Contracts } from 'web3/contracts';
import { UNISWAPTokenMeta } from 'web3/contracts/uniswap';
import { UNIXTokenMeta } from 'web3/contracts/unix';
import useMergeState from 'hooks/useMergeState';

import s from './styles.module.scss';

export type PoolTokenRowProps = {
  token: TokenMeta;
  type: 'deposit' | 'withdraw';
  expanded?: boolean;
  poolType: PoolTypes;
};

type PoolTokenRowState = {
  enabling: boolean;
  enabled?: boolean;
  formDisabled: boolean;
  saving: boolean;
  expanded: boolean;
  walletBalance?: BigNumber;
  stakedBalance?: BigNumber;
  effectiveStakedBalance?: BigNumber;
  maxAllowance?: BigNumber;
};

const InitialState: PoolTokenRowState = {
  enabling: false,
  enabled: undefined,
  formDisabled: false,
  saving: false,
  expanded: false,
  walletBalance: undefined,
  stakedBalance: undefined,
  effectiveStakedBalance: undefined,
  maxAllowance: undefined,
};

type PoolTokenRowFormData = {
  amount?: BigNumber;
  gasFee?: number;
};

const InitialFormValues: PoolTokenRowFormData = {
  amount: undefined,
  gasFee: undefined,
};

const PoolTokenRow: React.FunctionComponent<PoolTokenRowProps> = props => {
  const web3c = useWeb3Contracts();
  const [form] = Antd.Form.useForm<PoolTokenRowFormData>();

  const { type, token, poolType, expanded = false } = props;
  const isDeposit = type === 'deposit';
  const isWithdraw = type === 'withdraw';

  const [state, setState] = useMergeState<PoolTokenRowState>(InitialState);

  const icon = React.useMemo<TokenIconNames | undefined>(() => {
    switch (token) {
      case UNISWAPTokenMeta:
        return 'unix-token';
      case UNIXTokenMeta:
        return 'unix-token';
      default:
        return;
    }
  }, [token]);

  React.useEffect(() => {
    let walletBalance: BigNumber | undefined;
    let allowance: BigNumber | undefined;
    let stakedBalance: BigNumber | undefined;
    let effectiveStakedBalance: BigNumber | undefined;
    let isEnded: boolean | undefined;

    switch (poolType) {
      case PoolTypes.UNILP:
        walletBalance = web3c.uniswap.balance;
        allowance = web3c.uniswap.allowance;
        stakedBalance = web3c.staking.uniswap.balance;
        effectiveStakedBalance = web3c.staking.uniswap.epochUserBalance;
        isEnded = web3c.yfLPV2.isEnded;
        break;
      case PoolTypes.UNIX:
        walletBalance = web3c.unix.balance;
        allowance = web3c.unix.allowance;
        stakedBalance = web3c.staking.unix.balance;
        effectiveStakedBalance = web3c.staking.unix.epochUserBalance;
        isEnded = web3c.yfUNIXV2.isEnded;
        break;
      default:
        return;
    }

    setState({
      walletBalance,
      stakedBalance,
      effectiveStakedBalance,
      maxAllowance: BigNumber.min(
        allowance ?? ZERO_BIG_NUMBER,
        walletBalance ?? ZERO_BIG_NUMBER,
      ),
      enabled: allowance?.gt(ZERO_BIG_NUMBER) ?? false,
      formDisabled: isEnded === true && isDeposit,
      expanded,
    });
  }, [web3c, token]);

  const activeBalance = React.useMemo<BigNumber | undefined>(() => {
    if (isDeposit) {
      return state.maxAllowance;
    } else if (isWithdraw) {
      return state.stakedBalance;
    }
  }, [isDeposit, isWithdraw, state]);

  const maxAmount = React.useMemo<number>(() => {
    return getNonHumanValue(activeBalance ?? 0, token.decimals).toNumber();
  }, [activeBalance, token]);

  async function handleSwitchChange(checked: boolean) {
    const value = checked ? MAX_UINT_256 : ZERO_BIG_NUMBER;

    setState({ enabling: true });

    try {
      switch (token) {
        case UNISWAPTokenMeta:
          await web3c.uniswap.approveSend(value);
          break;
        case UNIXTokenMeta:
          await web3c.unix.approveSend(value);
          break;
        default:
          break;
      }
    } catch (e) {
    }

    setState({ enabling: false });
  }

  async function handleSubmit(values: any) {
    setState({ saving: true });

    try {
      const { amount, gasFee } = values;

      const amountValue = amount;
      const feeValue = gasFee.value;

      if (isDeposit) {
        await web3c.staking.depositSend(token, amountValue, feeValue);
      } else if (isWithdraw) {
        await web3c.staking.withdrawSend(token, amountValue, feeValue);
      }

      switch (token) {
        case UNISWAPTokenMeta:
          web3c.uniswap.reload();
          web3c.yfLPV2.reload();
          break;
        case UNIXTokenMeta:
          web3c.unix.reload();
          web3c.yfUNIXV2.reload();
          break;
      }
    } catch (e) {
    }

    setState({ saving: false });
  }

  const CardTitle = (
    <Grid flow="col" gap={24} colsTemplate="1fr 1fr 1fr" align="center">
      <Grid flow="col" gap={12} align="center">
        {icon && <Icons name={icon} width={40} height={49} />}
        <Paragraph type="p1" semiBold color="grey900">
          {token.name}
        </Paragraph>
      </Grid>

      <Grid flow="row" gap={4}>
        <Small semiBold color="grey500">
          Wallet Balance
        </Small>
        <Paragraph type="p1" semiBold color="grey900">
          {formatBigValue(state.walletBalance, token.decimals)}
        </Paragraph>
      </Grid>

      {isDeposit && (!state.formDisabled || state.enabled === true) && (
        <Grid flow="row" gap={4}>
          <Small semiBold color="grey500">
            Enable Token
          </Small>
          <Antd.Switch
            style={{ justifySelf: 'flex-start' }}
            checked={state.enabled}
            loading={state.enabled === undefined || state.enabling}
            onChange={handleSwitchChange}
          />
        </Grid>
      )}
    </Grid>
  );

  return (
    <Card
      title={CardTitle}
      noPaddingBody
      showExpandButton={state.enabled || isWithdraw}
      expanded={state.expanded}>
      <Form
        form={form}
        initialValues={InitialFormValues}
        validateTrigger={['onSubmit']}
        onFinish={handleSubmit}>
        <Grid colsTemplate="1fr 1fr">
          <Grid flow="row" gap={4} padding={24} className={s.balanceBlock}>
            <Label type="lb2" semiBold color="grey500">
              Staked Balance
            </Label>
            <Paragraph type="p1" semiBold color="grey900">
              {formatBigValue(state.stakedBalance, token.decimals)}
            </Paragraph>
          </Grid>
          <Grid flow="row" gap={4} padding={24} className={s.balanceBlock}>
            <Grid flow="col" gap={8}>
              <Label type="lb2" semiBold color="grey500">
                Effective Staked Balance
              </Label>
              <Tooltip
                type="info"
                title="This value represents your 'effective stake' in this pool - meaning the portion of your total staked balance that is earning rewards this epoch. When depositing new tokens during an epoch that is currently running, your effective deposit amount will be proportionally sized by the time that has passed from that epoch. Once an epoch ends, your staked balance and effective staked balance will become equal."
              />
            </Grid>
            <Paragraph type="p1" semiBold color="grey900">
              {formatBigValue(state.effectiveStakedBalance, token.decimals)}
            </Paragraph>
          </Grid>
        </Grid>
        <Grid flow="row" gap={32} padding={24}>
          <Grid flow="col" gap={48} colsTemplate="1fr 1fr">
            <Grid flow="row" gap={32}>
              <Form.Item
                name="amount"
                label="Amount"
                rules={[
                  { required: true, message: 'Required' },
                  {
                    validator: (rule: any, value: BigNumber | undefined, cb: Function) => {
                      if (value?.isEqualTo(ZERO_BIG_NUMBER)) {
                        cb('Should be greater than zero');
                      } else if (value?.isGreaterThan(maxAmount)) {
                        cb(`Should be less than ${maxAmount}`);
                      } else {
                        cb();
                      }
                    },
                  }
                ]}>
                <TokenAmount
                  tokenIcon={icon}
                  max={activeBalance}
                  maximumFractionDigits={token.decimals}
                  displayDecimals={token === UNISWAPTokenMeta ? 8 : 4}
                  disabled={state.formDisabled || state.saving}
                  slider
                />
              </Form.Item>
              {isDeposit && (
                <Alert
                  message="Deposits made after an epoch started will be considered as pro-rata figures in relation to the length of the epoch." />
              )}
              {isWithdraw && (
                <Alert
                  message="Any funds withdrawn before the end of this epoch will not accrue any rewards for this epoch." />
              )}
            </Grid>
            <Grid flow="row">
              <Form.Item
                name="gasFee"
                label="Gas Fee (Gwei)"
                hint="This value represents the gas price you're willing to pay for each unit of gas. Gwei is the unit of ETH typically used to denominate gas prices and generally, the more gas fees you pay, the faster the transaction will be mined."
                rules={[{ required: true, message: 'Required' }]}>
                <GasFeeList disabled={state.formDisabled || state.saving} />
              </Form.Item>
            </Grid>
          </Grid>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={state.saving}
            disabled={(!state.enabled && isDeposit) || state.formDisabled}
            style={{ width: 121 }}>
            {isDeposit && 'Deposit'}
            {isWithdraw && 'Withdraw'}
          </Button>
        </Grid>
      </Form>
    </Card>
  );
};

export default PoolTokenRow;
