import axios from "axios";
import envconfig from "@/config";

/** React Native: { uri, type, name } từ ImagePicker hoặc DocumentPicker */
export interface MediaFileInput {
  uri: string;
  type: string;
  name: string;
}

const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${envconfig.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;

/**
 * Upload ảnh trực tiếp lên Cloudinary (không qua Next.js proxy)
 * Dùng axios gọi thẳng Cloudinary API
 */
export const mediaRequest = {
  upload: (file: MediaFileInput) => {
    const formData = new FormData();
    formData.append("file", {
      uri: file.uri,
      type: file.type || "image/jpeg",
      name: file.name || "image.jpg",
    } as unknown as Blob);
    formData.append("upload_preset", envconfig.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
    formData.append("cloud_name", envconfig.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME);
    formData.append("folder", "EXE");

    return axios.post<{ secure_url: string; url: string }>(
      CLOUDINARY_UPLOAD_URL,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },
};
