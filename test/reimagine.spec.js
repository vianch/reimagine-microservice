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

    after(done => {
        done();
    });
});