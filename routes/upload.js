const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const uploadDB = require('../app/modules/upload');
var fs = require('fs');


  router.post('/uploadphoto', upload.single('picture'), async(req, res) => {
    console.log(req.file);
    var img = fs.readFileSync(req.file.path);
    var encode_image = img.toString('base64');
    // Define a JSONobject for the image attributes for saving to database
    var finalImg = {
      contentType: req.file.mimetype,
      image:  Buffer.from(encode_image, 'base64')
    };

    const image = new uploadDB(finalImg);

    await image.save();

    return res.json({code: 1, message: 'success',image})


    
  })

  router.get('/photo/:id',async (req, res) => {
    var filename = req.params.id;
     
    uploadDB.findById(filename, (err, result) => {
      if (err) return console.log(err)
      res.contentType(result.contentType);
      const image =result.image;
      res.end(image)
    })
  })

  module.exports = router;