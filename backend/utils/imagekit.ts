import ImageKit from "imagekit";
import {
  IMAGEKIT_PUBLIC_KEY,
  IMAGEKIT_PRIVATE_KEY,
  IMAGEKIT_URL_ENDPOINT,
} from "../constants/config";

if (!IMAGEKIT_PUBLIC_KEY || !IMAGEKIT_PRIVATE_KEY || !IMAGEKIT_URL_ENDPOINT) {
  throw new Error("ImageKit configuration is missing in environment variables");
}

const imagekit = new ImageKit({
  publicKey: IMAGEKIT_PUBLIC_KEY,
  privateKey: IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: IMAGEKIT_URL_ENDPOINT,
});

/**
 * Upload content to ImageKit
 */
export const uploadToImageKit = async (
  content: string,
  fileName: string,
  folder: string = "mdgo/documents"
) => {
  try {
    // ImageKit doesn't like completely empty files, providing a fallback space
    const fileContent = content || " ";
    const response = await imagekit.upload({
      file: Buffer.from(fileContent).toString("base64"),
      fileName: fileName,
      folder: folder,
      useUniqueFileName: true,
    });
    return response;
  } catch (error) {
    console.error("ImageKit Upload Error:", error);
    throw error;
  }
};

/**
 * Delete file from ImageKit
 */
export const deleteFromImageKit = async (fileId: string) => {
  try {
    await imagekit.deleteFile(fileId);
  } catch (error) {
    console.error("ImageKit Deletion Error:", error);
    throw error;
  }
};

export default imagekit;
