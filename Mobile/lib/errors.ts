import { UseFormSetError } from "react-hook-form";
import { ResponseError } from "@/types/base";
import { toast } from "./toast";

/* ================= ERROR CLASSES ================= */

export class HttpError extends Error {
  payload: ResponseError;

  constructor(payload: ResponseError) {
    super(payload.message);
    this.name = "HttpError";
    this.payload = payload;
  }
}

export class EntityError extends HttpError {
  constructor(payload: ResponseError) {
    super(payload);
    this.name = "EntityError";
  }
}

/* ================= HANDLE ERROR ================= */

interface HandleErrorParams {
  error: unknown;
  setError?: UseFormSetError<any>;
}

export const handleErrorApi = ({ error, setError }: HandleErrorParams) => {
  if (error instanceof EntityError) {
    if (!setError) {
      toast.error("Có lỗi xảy ra. Vui lòng thử lại sau.");
      return;
    }

    const errors = error.payload.listErrors ?? [];
    if (errors.length > 0) {
      errors.forEach((err) => {
        setError(err.field, { type: "server", message: err.detail });
      });
    }
    return;
  }

  if (error instanceof HttpError) {
    const message =
      error.payload?.statusCode === 500
        ? "Lỗi máy chủ. Vui lòng thử lại sau hoặc liên hệ hỗ trợ."
        : error.message;
    toast.error(message);
    return;
  }

  toast.error("Có lỗi không xác định xảy ra");
};
