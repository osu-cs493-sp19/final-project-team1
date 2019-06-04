/*
 * API sub-router for businesses collection endpoints.
 */
const multer = require('multer');
const crypto = require('crypto');
const router = require('express').Router();

const { validateAgainstSchema } = require('../lib/validation');
const { getChannel } = require('../lib/rabbitmq');

const {
  PhotoSchema,
  insertNewPhoto,
  getPhotoById,
  removeUploadedFile,
  getDownloadStreamByFilename
} = require('../models/photo');

const imageTypes = {
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

const upload = multer({
  storage: multer.diskStorage({
    destination: `${__dirname}/uploads`,
    filename: (req, file, callback) => {
      const basename = crypto.pseudoRandomBytes(16).toString('hex');
      const extension = imageTypes[file.mimetype];
      callback(null, `${basename}.${extension}`);
    }
  }),
  fileFilter: (req, file, callback) => {
    callback(null, !!imageTypes[file.mimetype])
  }
});

/*
 * Route to create a new photo.
 */
router.post('/', upload.single('image'), async (req, res) => {
  if (validateAgainstSchema(req.body, PhotoSchema) && req.file) {
    try {
      const image = {
        path: req.file.path,
        filename: req.file.filename,
        contentType: req.file.mimetype,
        businessid: req.body.businessid,
        caption: req.body.caption
      };
      const id = await insertNewPhoto(image);
      await removeUploadedFile(req.file);

      const channel = getChannel();
      channel.sendToQueue('images', Buffer.from(id.toString()));

      res.status(200).send({
        id: id,
        links: {
          photo: `/photos/${id}`,
          business: `/businesses/${req.body.businessid}`
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Error inserting photo into DB.  Please try again later."
      });
    }
  } else {
    res.status(400).send({
      error: "Request body is not a valid photo object"
    });
  }
});

/*
 * Route to fetch info about a specific photo.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const photo = await getPhotoById(req.params.id);
    if (photo) {
      res.status(200).send(photo);
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Unable to fetch photo.  Please try again later."
    });
  }
});


module.exports = router;
