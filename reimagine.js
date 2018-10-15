const express       = require("express");
const sharp         = require("sharp");
const app           = express();
const bodyParser    = require("body-parser");
const path          = require("path");
const fs         = require("fs");
const folderName = "uploads";

app.listen(3000, () => {
    console.log("Reimagine started!");
});

app.get(/\/thumbnail\.(jpg|png)/, (request, response, next) => {
    let format    = request.params[0] === "png" ? "png" : "jpeg";
    let width     = +request.query.width || 300;
    let height    = +request.query.height || 200;
    let border    = +request.query.boder || 5;
    let bgColor   = request.query.bgcolor || "#fcfcfc";
    let fgColor   = request.query.fgcolor || "#ddd";
    let textColor = request.query.textcolor || "#aaa";
    let textSize  = +request.query.textsize || 24;
    let image     = sharp({
        create: {
            width       : width,
            height      : height,
            channels    : 4,
            background  : { r: 0, g: 0, b: 0 },
        }
    });

    const thumbnail = new Buffer(
        `<svg width="${width}" height="${height}">
            <rect
                x="0" y="0"
                width="${width}" height="${height}"
                fill="${fgColor}" />
            <rect
                x="${border}" y="${border}"
                width="${width - border * 2}" height="${height - border * 2}"
                fill="${bgColor}" />
            <line
                x1="${border * 2}" y1="${border * 2}"
                x2="${width - border * 2}" y2="${height - border * 2}"
                stroke-width="${border}" stroke="${fgColor}" />
            <line
                x1="${width - border * 2}" y1="${border * 2}"
                x2="${border * 2}" y2="${height - border * 2}"
                stroke-width="${border}" stroke="${fgColor}" />
            <rect
                x="${border}" y="${(height - textSize) / 2}"
                width="${width - border * 2}" height="${textSize}"
                fill="${bgColor}" />
            <text
                x="${width / 2}" y="${height / 2}" dy="8"
                font-family="Helvetica" font-size="${textSize}"
                fill="${textColor}" text-anchor="middle">${width} x ${height}</text>
        </svg>`
    );

    image.overlayWith(thumbnail)[format]().pipe(response);
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

app.get("/uploads/:image", (request, response) => {
    let fd = fs.createReadStream(request.localpath);

    fd.on("error", (error) => {
        response.status(error.code === "ENOENT" ? 404 : 500).end();
    });

    response.setHeader("Content-Type", `image/${path.extname(request.image).substr(1)}`);

    fd.pipe(response);
});

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