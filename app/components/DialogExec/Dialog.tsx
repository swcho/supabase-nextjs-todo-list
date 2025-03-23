import { Button } from "@/components/ui/button";
import {
  Credenza,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
} from "@/components/ui/credenza";
import { cn } from "@/lib/utils";
import * as React from "react";

export type Props = {
  severity?: "info" | "warning" | "error";
  open: boolean;
  title?: string;
  description?: string;
  cancelText?: string;
  confirmText?: string;
  onCancel?: () => void;
  onConfirm?: () => void;
};

function Dialog(props: Props) {
  const { severity, open, title, description, cancelText, confirmText, onCancel, onConfirm } = props;
  
  // console.log("ConfirmDialog", { severity });
  return (
    <Credenza open={open}>
      <CredenzaContent
        className={cn(severity === "error" && "border-destructive")}
      >
        <CredenzaHeader
          className={cn(severity === "error" && "text-destructive")}
        >
          {title}
        </CredenzaHeader>
        {description && (
          <CredenzaDescription className="px-4">{description}</CredenzaDescription>
        )}
        <CredenzaFooter>
          <Button variant="ghost" onClick={onCancel}>
            {cancelText ?? 'Cancel'}
          </Button>
          <Button
            className={cn(
              severity === "error" &&
                "bg-destructive text-destructive-foreground"
            )}
            onClick={onConfirm}
          >
            {confirmText ?? 'Confirm'}
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
}

export default React.memo(Dialog);
