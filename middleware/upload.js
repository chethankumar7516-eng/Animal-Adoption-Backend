import multer from "multer";
import path from "path";
import fs from "fs";

// Create upload folder if it does not exist
const uploadDir = "uploads/pets";

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        const uniqueName =
            `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;

        cb(null, uniqueName);
    }
});

// Allow only image files
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;

    const extension = allowedTypes.test(
        path.extname(file.originalname).toLowerCase()
    );

    const mimeType = allowedTypes.test(file.mimetype);

    if (extension && mimeType) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Only JPG, JPEG, PNG and WEBP images are allowed"
            )
        );
    }
};

// Multer configuration
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB
    }
});

export default upload;