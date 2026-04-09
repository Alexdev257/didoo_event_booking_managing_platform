import { mediaRequest } from "@/apiRequest/media";
import { handleErrorApi } from "@/lib/errors";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";


export const useMedia = () => {
    const uploadImage = useMutation({
        mutationFn: async (file: File) => {
            const result = await mediaRequest.upload(file);
            return result.data;
        },
        onSuccess: () => {
            toast.success("Upload ảnh thành công!");
        },
        onError: (error) => {
            handleErrorApi({ error })
        }
    });

    return {
        uploadImage
    };
};
