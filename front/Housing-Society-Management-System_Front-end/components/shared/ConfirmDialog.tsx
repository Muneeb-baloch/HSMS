"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

interface ConfirmOptions {
  title?: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
}

interface AlertOptions {
  title?: string;
  description: string;
  confirmLabel?: string;
}

type DialogState =
  | { type: "confirm"; options: ConfirmOptions; resolve: (v: boolean) => void }
  | { type: "alert"; options: AlertOptions; resolve: () => void }
  | null;

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  alert: (options: AlertOptions) => Promise<void>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function ConfirmDialogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [dialog, setDialog] = useState<DialogState>(null);
  const resolveRef = useRef<((v: any) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
      setDialog({ type: "confirm", options, resolve });
    });
  }, []);

  const alert = useCallback((options: AlertOptions): Promise<void> => {
    return new Promise<void>((resolve) => {
      resolveRef.current = resolve;
      setDialog({ type: "alert", options, resolve });
    });
  }, []);

  const handleClose = (result?: boolean) => {
    if (dialog?.type === "confirm") {
      dialog.resolve(result ?? false);
    } else if (dialog?.type === "alert") {
      dialog.resolve();
    }
    setDialog(null);
    resolveRef.current = null;
  };

  return (
    <ConfirmContext.Provider value={{ confirm, alert }}>
      {children}

      <AlertDialog
        open={!!dialog}
        onOpenChange={(open) => {
          if (!open) handleClose(false);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dialog?.options.title ||
                (dialog?.type === "destructive" ? "Are you sure?" : "Confirm")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dialog?.options.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {dialog?.type === "confirm" && (
              <AlertDialogCancel onClick={() => handleClose(false)}>
                {dialog.options.cancelLabel || "Cancel"}
              </AlertDialogCancel>
            )}
            <AlertDialogAction
              variant={
                dialog?.type === "confirm" && dialog.options.variant === "destructive"
                  ? "destructive"
                  : "default"
              }
              onClick={() => handleClose(true)}
            >
              {dialog?.type === "confirm"
                ? dialog.options.confirmLabel || "Confirm"
                : dialog?.options.confirmLabel || "OK"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useConfirm must be used within ConfirmDialogProvider");
  }
  return ctx;
}
