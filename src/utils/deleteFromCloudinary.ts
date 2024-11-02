import { v2 as cloudinary } from "cloudinary";

export const deleteFromCloudinary = async (publicIds: string[]) => {
    const promises = publicIds.map((id) => {
        return new Promise<void>((resolve, reject) => {
            cloudinary.uploader.destroy(id, (error, result) => {
                if (error) return reject(error);
                resolve();
            });
        });
    });

    await Promise.all(promises);
}