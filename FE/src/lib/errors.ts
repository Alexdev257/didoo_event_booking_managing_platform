import { toast } from "sonner";
import { UseFormSetError } from "react-hook-form";
import { ResponseData, ResponseError } from "@/types/base";




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

export const handleErrorApi = ({
    error,
    setError,
}: HandleErrorParams) => {


    if (error instanceof EntityError || (error instanceof HttpError && error.payload?.listErrors?.length)) {
        const errors = (error as HttpError).payload?.listErrors;

        if (setError && errors && errors.length > 0) {
            // Group errors by field to show all related constraints
            const fieldErrors: Record<string, string[]> = {};
            errors.forEach((err) => {
                // Convert PascalCase (e.g. "Password") to camelCase (e.g. "password")
                const camelField = err.field ? err.field.charAt(0).toLowerCase() + err.field.slice(1) : "";
                if (camelField) {
                    if (!fieldErrors[camelField]) {
                        fieldErrors[camelField] = [];
                    }
                    fieldErrors[camelField].push(err.detail);
                }
            });

            Object.keys(fieldErrors).forEach((field) => {
                setError(field, {
                    type: "server",
                    message: fieldErrors[field].map(msg => `• ${msg}`).join('\n'),
                });
            });
            return;
        } else if (errors && errors.length > 0) {
            // Fallback to toast if no setError is provided
            toast.error(errors[0].detail);
            return;
        }
    }

    if (error instanceof HttpError) {
        toast.error(error.message || "Có lỗi xảy ra");
        return;
    }


    toast.error("Có lỗi không xác định xảy ra");
};