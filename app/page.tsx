import * as React from "react";
import Header from "./components/Header";

export type Props = {};

function page(props: Props) {
  const {} = props;

  return (
    <div>
      <Header />
      page
    </div>
  );
}

export default React.memo(page);
