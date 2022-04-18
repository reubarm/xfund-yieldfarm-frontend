import React from 'react';

import Grid from 'components/custom/grid';
import { Heading } from 'components/custom/typography';
import ConnectedWallet from 'wallets/components/connected-wallet';

import s from './styles.module.scss';

export type LayoutHeaderProps = {
  title?: React.ReactNode;
};

const LayoutHeader: React.FunctionComponent<LayoutHeaderProps> = props => {
  const { title } = props;

  return (
    <Grid
      flow="col"
      align="center"
      className={s.component}>
      <img className={s.mobile} src="/footer-logo.png" width="200" height="auto" alt="Unix Yield" />
      <ConnectedWallet />
    </Grid>
  );
};

export default LayoutHeader;
