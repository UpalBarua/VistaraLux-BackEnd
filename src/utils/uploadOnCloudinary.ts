import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { Readable } from "stream";

export const uploadOnCloudinary = async (files: Express.Multer.File[]) => {
    const uploadPromises = files.map((file) => {
        return new Promise<UploadApiResponse>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { resource_type: "image" },
                (error, result) => {
                    if (error) {
                        console.error("Cloudinary upload error:", error); // Log error for troubleshooting
                        return reject(error);
                    }
                    resolve(result!);
                    console.log("Cloudinary upload result:", result)
                }
            );

            // Create a readable stream from the buffer and pipe it to Cloudinary's upload stream
            Readable.from(file.buffer).pipe(uploadStream);
        });
    });

    const results = await Promise.all(uploadPromises);
    return results.map((result) => ({
        public_id: result.public_id,
        url: result.secure_url,
    }));
};