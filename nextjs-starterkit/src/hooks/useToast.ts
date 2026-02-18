import { toast } from "sonner";

export function useToast() {
  return {
    success: (message: string, description?: string) =>
      toast.success(message, { description }),

    error: (message: string, description?: string) =>
      toast.error(message, { description }),

    warning: (message: string, description?: string) =>
      toast.warning(message, { description }),

    info: (message: string, description?: string) =>
      toast.info(message, { description }),

    promise: <T>(
      promiseFn: Promise<T>,
      messages: { loading: string; success: string; error: string }
    ) =>
      toast.promise(promiseFn, {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      }),

    dismiss: (toastId?: string | number) => toast.dismiss(toastId),
  };
}
