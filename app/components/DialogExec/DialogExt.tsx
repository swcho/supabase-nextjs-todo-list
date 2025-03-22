import {
  Credenza,
  CredenzaContent,
  CredenzaHeader,
} from "@/components/ui/credenza";
import * as React from "react";

export type Props = {
  title: string;
};

function DialogExt(props: Props) {
  const { title } = props;
  return (
    <Credenza>
      <CredenzaContent>
        <CredenzaHeader>{title}</CredenzaHeader>
      </CredenzaContent>
    </Credenza>
  );
}

export default React.memo(DialogExt);
