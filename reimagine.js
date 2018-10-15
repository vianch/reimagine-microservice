const express       = require("express");
const sharp         = require("sharp");
const app           = express();
const bodyParser    = require("body-parser");
const path          = require("path");
const fs         = require("fs");


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
    let image = request.params.image.toLowerCase();
    let imageLength;
    let fd;

    if (!image.match(/\.(png|jpg)$/)) {
        return response.status(403).end();
    }

    imageLength = request.body.length;
    fd  = fs.createWriteStream(path.join(__dirname, "uploads", image), {
        flags    : "w+",
        encoding : "binary"
    });

    fd.write(request.body);
    fd.end();

    fd.on("close", () => {
        response.send({ status : "ok", size: imageLength });
    });
});

app.head("/uploads/:image", (request, response) => {
    fs.access(
        path.join(__dirname, "uploads", request.params.image),
        fs.constants.R_OK,
        (error) => {
            response.status(error ? 404 : 200);
            response.end();
        },
    );
});