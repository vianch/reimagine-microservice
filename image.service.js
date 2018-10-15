'use strict';
const sharp         = require("sharp");
const path          = require("path");
const fs            = require("fs");

module.exports = class ImageService {
    static renderDefaultImage(request, response) {
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
    }

    static downloadImage(request, response) {
        fs.access(request.localpath, fs.constants.R_OK, (error) => {
            if (error) { response.status(404).end(); }

            let image = sharp(request.localpath);

            if (request.width && request.height) {
                image.ignoreAspectRatio();
            }

            if (request.width || request.height) {
                image.resize(request.width, request.height);
            }

            if (request.greyscale) {
                image.greyscale();
            }

            response.setHeader(
                "Content-Type",
                `image/${ path.extname(request.image).substr(1) }`
            );

            image.pipe(response);
        });
    }
}
