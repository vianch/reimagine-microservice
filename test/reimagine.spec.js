const fs = require("fs");
const path          = require("path");
const chai        = require('chai');
const chaiHttp    = require('chai-http');
const expect      = require('chai').expect;

const reimagine   = require("../reimagine");
const sampleImage   = fs.readFileSync(path.join(__dirname, "test-assets", "bulbasaur.png"));

chai.use(chaiHttp);

describe("Upload image", () => {
    beforeEach((done) => {
        chai.request(reimagine)
        .delete("/uploads/bulbasaur.png")
        .end(() => {
            return done();
        });
    });

    it("Should accept only images" , (done) => {
        chai.request(reimagine)
            .post("/uploads/bulbasaur.png")
            .set("Content-Type", "image/png")
            .send(sampleImage)
            .end((error, response) => {
                if (!error) {
                    expect(response).to.have.status(200);
                    expect(response.body).to.have.status("ok");
                } else {
                    console.log("Error: ", error);
                }

                return done();
            });
    });

    it("Should response 403 when the extention is not png or jpg (POST)" , (done) => {
        chai.request(reimagine)
            .post("/uploads/bulbasaur.text")
            .set("Content-Type", "image/txt")
            .send(sampleImage)
            .end((error, response) => {
                if (!error) {
                    expect(response).to.have.status(403);
                } else {
                    console.log("Error: ", error);
                }

                return done();
            });
    });

    it("Should response 404 when the extention is not png or jpg (GET)", (done) => {
        chai
        .request(reimagine)
        .get("/uploads/test.txt")
        .end((error, response) => {
            expect(response).to.have.status(404);

            return done();
        });
    });

    it("Should response 404 when the image does not exist (GET CALL)", (done) => {
        chai
        .request(reimagine)
        .get("/uploads/pikachu.png")
        .end((error, response) => {
            expect(response).to.have.status(404);

            return done();
        });
    });

    it("Should response 404 when the image does not exist (HEAD CALL)", (done) => {
        chai
        .request(reimagine)
        .head("/uploads/pikachu.png")
        .end((error, response) => {
            expect(response).to.have.status(404);

            return done();
        });
    });

    it("Should response 200 when the image does not exist (HEAD CALL)", (done) => {
        chai
        .request(reimagine)
        .head("/uploads/bulbasaur.png")
        .end((error, response) => {
            expect(response).to.have.status(200);

            return done();
        });
    });

    after(done => {
        done();
    });

    it("Should open thumbnail option", (done) => {
        chai
        .request(reimagine)
        .get("/uploads/thumbnail.png")
        .end((error, response) => {
            expect(response).to.have.status(200);

            return done();
        });
    });

    it("Should download image", (done) => {
        chai
        .request(reimagine)
        .get("/uploads/bulbasaur.png")
        .end((error, response) => {
            expect(response).to.have.status(200);

            return done();
        });
    });

    it("Should download image in greyscale", (done) => {
        chai
        .request(reimagine)
        .get("/uploads/bulbasaur.png?greyscale=yes")
        .end((error, response) => {
            expect(response).to.have.status(200);

            return done();
        });
    });

    it("Should download image resized", (done) => {
        chai
        .request(reimagine)
        .get("/uploads/bulbasaur.png?width=50")
        .end((error, response) => {
            expect(response).to.have.status(200);

            return done();
        });
    });


});
