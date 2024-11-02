// import multer from "multer"
// export const singleUpload = multer().single("photo")
// export const multiUpload = multer().array("photos", 10)
import multer from "multer";
// Set up multer with memory storage for handling files as buffers
const storage = multer.memoryStorage();
export const multiUpload = multer({ storage }).array("photos", 10);
