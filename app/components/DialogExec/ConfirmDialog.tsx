import { Button } from "@/components/ui/button";
import {
  Credenza,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
} from "@/components/ui/credenza";
import * as React from "react";

export type Props = {
  severity: "info" | "warning" | "error";
  open: boolean;
  title: string;
  description?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

function ConfirmDialog(props: Props) {
  const { severity, open, title, description, onCancel, onConfirm } = props;

  return (
    <Credenza open={open}>
      <CredenzaContent>
        <CredenzaHeader>{title}</CredenzaHeader>
        {description && (
          <CredenzaDescription>{description}</CredenzaDescription>
        )}
        <CredenzaFooter>
          <Button size="sm" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button size="sm" onClick={onConfirm}>
            Confirm
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
}

export default React.memo(ConfirmDialog);
