"use strict";

const fs             = require("fs");
const path           = require("path");
const bodyParser     = require("body-parser");
const hydraExpress   = require("hydra-express");
const ServerResponse = require("fwsp-server-response");

const ImageService   = require("../services/image.service");

const hydra          = hydraExpress.getHydra();
const express        = hydraExpress.getExpress();
const folderName     = "uploads";

let serverResponse = new ServerResponse();

express.response.sendError = function (err) {
    serverResponse.sendServerError(this, { result : { error : err }});
};

express.response.sendOk = function (result = null) {
    serverResponse.sendOk(this, { result });
};

let api = express.Router();

api.get(/\/thumbnail\.(jpg|png)/, ImageService.renderDefaultImage);

api.param("image", (request, response, next, image) => {
    if (!image.match(/\.(png|jpg)$/i)) {
        return response.status(request.method === "POST" ? 403 : 404).end();
    }

    request.image = image;
    request.localpath = path.join(__dirname, folderName, request.image);

    return next();
});

// URL:  curl -X POST -H 'Content-Type: image/png' --data-binary @/Users/victorchavarro/Desktop/hydra.png http://localhost:3000/uploads/hydra.png
api.post("/uploads/:image", bodyParser.raw({ limit : "3mb", type  : "image/*" }), (request, response) => {
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
api.head("/uploads/:image", (request, response) => {
    fs.access(
        request.localpath,
        fs.constants.R_OK,
        (error) => {
            response.status(error ? 404 : 200).end();
        },
    );
});

api.get("/uploads/:image", ImageService.downloadImage);

module.exports = api;