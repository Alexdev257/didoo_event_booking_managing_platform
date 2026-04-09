import { z } from "zod";

const configSchema = z.object({
  EXPO_PUBLIC_BASE_URL: z.string().optional(),
  EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET: z.string().optional(),
  EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().optional(),
  EXPO_PUBLIC_MAPBOX_TOKEN: z.string().optional(),
  // RNMAPBOX_MAPS_DOWNLOAD_TOKEN: z.string().optional(),
});


const configProject = configSchema.safeParse({
  EXPO_PUBLIC_BASE_URL: process.env.EXPO_PUBLIC_BASE_URL,
  EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET: process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
  EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME,
  EXPO_PUBLIC_MAPBOX_TOKEN: process.env.EXPO_PUBLIC_MAPBOX_TOKEN,
  // RNMAPBOX_MAPS_DOWNLOAD_TOKEN: process.env.RNMAPBOX_MAPS_DOWNLOAD_TOKEN,
});

if (!configProject.success) {
  console.error("Invalid configuration:", configProject.error);
}

export const envconfig = configProject.data;
export default envconfig;
