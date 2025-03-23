import { useCallback, useRef, useState } from "react";
import Dialog, { Props as DialogProps } from "./Dialog";

declare namespace useDialog {
  export type Params = {};
  export type ExecParams = Omit<DialogProps, 'open'>;
}

export function useDialog<ReturnType>(params: useDialog.Params = {}) {
  const {} = params;

  const refResolve = useRef<(value?: ReturnType) => void>();
  const [execParams, setExecParams] = useState<useDialog.ExecParams>();

  const exec = useCallback((params: useDialog.ExecParams) => {
    setExecParams(params);
    return new Promise<ReturnType | undefined>((resolve) => {
      refResolve.current = resolve;
    });
  }, []);

  const handleClose = useCallback<(value?: ReturnType) => void>((ret) => {
    refResolve.current?.(ret);
    setExecParams(undefined);
  }, []);

  const render = useCallback(() => {
    console.log("Dialog", { execParams });
    return (
      <Dialog
        open={Boolean(execParams)}
        onCancel={() => handleClose()}
        {...execParams} />
    );
  }, [execParams]);
  return [exec, render, handleClose] as const;
}

export function useConfirmDialog() {
  const [_exec, render, handleClose] = useDialog<boolean>();
  const exec = useCallback((params: useDialog.ExecParams) => {
    return _exec({
      ...params,
      onConfirm: () => {
        handleClose(true);
      }
    });
  }, [_exec]);
  return [exec, render] as const;
}
