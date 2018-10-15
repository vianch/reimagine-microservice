const ImageService  = require("./image.service");
const express       = require("express");
const app           = express();
const bodyParser    = require("body-parser");
const path          = require("path");
const fs            = require("fs");
const folderName    = "uploads";

app.listen(3000, () => {
    console.log("Reimagine started!");
});

app.get(/\/thumbnail\.(jpg|png)/, ImageService.renderDefaultImage);

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

app.get("/uploads/:width(\\d+)x:height(\\d+)-:image", ImageService.downloadImage);
app.get("/uploads/_x:height(\\d+)-:image", ImageService.downloadImage);
app.get("/uploads/:width(\\d+)x_-:image", ImageService.downloadImage);
app.get("/uploads/:image", ImageService.downloadImage);

app.param("image", (request, response, next, image) => {
    if (!image.match(/\.(png|jpg)$/i)) {
        return response.status(request.method === "POST" ? 403 : 404).end();
    }

    request.image = image;
    request.localpath = path.join(__dirname, folderName, request.image);

    return next();
});

app.param("width", (request, response, next, width) => {
    request.width = +width;

    return next();
});

app.param("height", (request, response, next, height) => {
    request.height = +height;

    return next();
});