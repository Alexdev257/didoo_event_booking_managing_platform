import http from "@/lib/http";

export const mediaRequest = {
    upload: (file: File) => {
        const formData = new FormData();
        formData.append("file", file);

        return http.post<{ secure_url: string }>("/api/media", formData, {
            baseURL: "",
            skipAuth: true
        });
    }
};
