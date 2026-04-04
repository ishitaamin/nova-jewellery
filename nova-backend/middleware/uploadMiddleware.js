import multer from "multer";

// Configure multer to temporarily store files on disk before sending to Cloudinary
const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

export default upload;