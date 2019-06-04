const sizeOf = require('image-size');
const sharp = require('sharp');
const crypto = require('crypto');

const { connectToDB } = require('./lib/mongo');
const { connectToRabbitMQ, getChannel } = require('./lib/rabbitmq');
const {
  getDownloadStreamById,
  updateImageChildren,
  getImageInfoById,
  insertNewPhoto
} = require('./models/photo');

async function main() {

  try {
    await connectToRabbitMQ('images');
    const channel = getChannel();
    channel.consume('images', (msg) => {
      if (msg) {
        const id = msg.content.toString();
        const downloadStream = getDownloadStreamById(id);
        const imageData = [];
        downloadStream.on('data', (data) => {
          imageData.push(data);
        });
        downloadStream.on('end', async () => {
          const info = await getImageInfoById(id);
          const dimensions = sizeOf(Buffer.concat(imageData));
          const height = dimensions.height;
          const width = dimensions.width;
          const urls = {};

          if(info.filename.toLowerCase().endsWith(".png")){
            const originalImage = await sharp(Buffer.concat(imageData))
            .toFormat('jpeg')
            .toFile("original.jpeg");
          
            const image = {
              path: "original.jpeg",
              filename: id + "-orig.jpeg",
            };
            
            const newid = await insertNewPhoto(image);
            urls.sOrig = "/media/photos/" + image.filename;
          }

          if(height > 1024 || width > 1024){
            const resizedImage = await sharp(Buffer.concat(imageData))
              .resize(1024, 1024, {fit: sharp.fit.inside})
              .toFormat('jpeg')
              .toFile("1024.jpeg");
            
            const image = {
              path: "1024.jpeg",
              filename: id + "-1024.jpeg",
            };
            
            const newid = await insertNewPhoto(image);
            urls.s1024 = "/media/photos/" + image.filename;          
          }

          if(height > 640 || width > 640){
            const resizedImage = await sharp(Buffer.concat(imageData))
              .resize(640, 640, {fit: sharp.fit.inside})
              .toFormat('jpeg')
              .toFile("640.jpeg");
            
            const image = {
              path: "640.jpeg",
              filename: id + "-640.jpeg",
            };
            
            const newid = await insertNewPhoto(image);
            urls.s640 = "/media/photos/" + image.filename;          
          }

          if(height > 256 || width > 256){
            const resizedImage = await sharp(Buffer.concat(imageData))
              .resize(256, 256, {fit: sharp.fit.inside})
              .toFormat('jpeg')
              .toFile("256.jpeg");
            
            const image = {
              path: "256.jpeg",
              filename: id + "-256.jpeg",
            };
            
            const newid = await insertNewPhoto(image);
            urls.s256 = "/media/photos/" + image.filename;          
          }

          if(height > 128 || width > 128){
            const resizedImage = await sharp(Buffer.concat(imageData))
              .resize(128, 128, {fit: sharp.fit.inside})
              .toFormat('jpeg')
              .toFile("128.jpeg");
            
            const image = {
              path: "128.jpeg",
              filename: id + "-128.jpeg",
            };

            const newid = await insertNewPhoto(image);
            urls.s128 = "/media/photos/" + image.filename;          
          }

          updateImageChildren(id, urls);
        });
      }
      channel.ack(msg);
    });
  } catch (err) {
    console.error(err);
  }
}
connectToDB(main);
