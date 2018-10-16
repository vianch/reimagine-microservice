const ImageService  = require("./services/image.service");
const express       = require("express");
const app           = express();
const bodyParser    = require("body-parser");
const path          = require("path");
const fs            = require("fs");
const folderName    = "uploads";
const port          = 3000;

app.listen(port, () => {
    console.log(`Reimagine started port ${port}!`);
});

app.get(/\/thumbnail\.(jpg|png)/, ImageService.renderDefaultImage);

app.param("image", (request, response, next, image) => {
    if (!image.match(/\.(png|jpg)$/i)) {
        return response.status(request.method === "POST" ? 403 : 404).end();
    }

    request.image = image;
    request.localpath = path.join(__dirname, folderName, request.image);

    return next();
});

// URL:  curl -X POST -H 'Content-Type: image/png' --data-binary @/Users/victorchavarro/Desktop/hydra.png http://localhost:3000/uploads/hydra.png
app.post("/uploads/:image", bodyParser.raw({ limit : "3mb", type  : "image/*" }), (request, response) => {
    let fd  = fs.createWriteStream(request.localpath, {
        flags    : "w+",
        encoding : "binary"
    });

    fd.end(request.body);

    fd.on("close", () => {
        response.send({ status : "ok", size: request.body.length });
    });
});

// URL: curl --head 'http://localhost:3000/uploads/otro.png'
app.head("/uploads/:image", (request, response) => {
    fs.access(
        request.localpath,
        fs.constants.R_OK,
        (error) => {
            response.status(error ? 404 : 200).end();
        },
    );
});

app.get("/uploads/:image", ImageService.downloadImage);

module.exports = app;