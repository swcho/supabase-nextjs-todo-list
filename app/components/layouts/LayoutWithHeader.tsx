import * as React from 'react';
import { AppContextProvider } from '../AppContext';
import Header from '../Header/Header';

export type Props = React.PropsWithChildren;

function LayoutWithHeader(props: Props) {
  const {
    children,
  } = props;

  return (
    <AppContextProvider>
      <Header />
      {children}
    </AppContextProvider>
  );
}

export default React.memo(LayoutWithHeader)
