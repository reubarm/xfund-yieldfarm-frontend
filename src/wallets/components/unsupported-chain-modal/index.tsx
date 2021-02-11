import React from 'react';
import * as Antd from 'antd';
import { ModalProps } from 'antd/lib/modal';

import Button from 'components/antd/button';
import { useWallet } from 'wallets/wallet';
import { getNetworkName } from 'web3/utils';

import s from './styles.module.css';

const WEB3_CHAIN_ID = Number(process.env.REACT_APP_WEB3_CHAIN_ID);

export type UnsupportedChainModalProps = ModalProps & {};

const UnsupportedChainModal: React.FunctionComponent<UnsupportedChainModalProps> = props => {
  const { ...modalProps } = props;

  const wallet = useWallet();

  return (
    <Antd.Modal
      className={s.component}
      centered
      closable={false}
      footer={[]}
      {...modalProps}>
      <div className={s.headerLabel}>Wrong network</div>
      <div className={s.text}>
        Please switch your wallet network to <b>{getNetworkName(WEB3_CHAIN_ID)}</b> to use the app
      </div>
      <div className={s.text}>
        If you still encounter problems, you may want to switch to a different
        wallet
      </div>
      <Button
        type="ghost"
        className={s.switchBtn}
        onClick={(ev: React.MouseEvent<HTMLElement>) => {
          props.onCancel?.(ev);
          wallet.showWalletsModal();
        }}>
        Switch wallet
      </Button>
    </Antd.Modal>
  );
};

export default UnsupportedChainModal;
