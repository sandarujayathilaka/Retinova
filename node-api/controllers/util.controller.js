const { nanoid } = require("nanoid");
const { s3 } = require("../config/aws");

const uploadImage = async (req, res) => {
  try {
    console.log(req.file);
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded." });
    }

    // Generate unique file name
    const fileName = `images/${nanoid()}_${req.file.originalname}`;

    // S3 Upload Parameters
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      ACL: "public-read",
    };

    // Upload Image
    const uploadResult = await s3.upload(params).promise();
    return res.status(200).json(uploadResult);
  } catch (error) {
    console.error("S3 Upload Error:", error);
    return res.status(500).json({ error: "Image upload failed. Try again." });
  }
};

const removeImage = async (req, res) => {
  try {
    const { key } = req.body;

    if (!key) {
      return res.status(400).json({ error: "Image key is required." });
    }

    // S3 Delete Parameters
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key, // The file path in the S3 bucket
    };

    // Delete image from S3
    await s3.deleteObject(params).promise();

    return res.status(200).json({ message: "Image deleted successfully." });
  } catch (error) {
    console.error("S3 Delete Error:", error);
    return res.status(500).json({ error: "Image deletion failed. Try again." });
  }
};

module.exports = {
  uploadImage,
  removeImage,
};
