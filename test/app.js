/* global require */
var expect = require("chai").expect;

/* Test suite for init library */
describe("Testing Application", function () {
    describe("method init()", function () {
        describe("config property", function () {
            it("exist", function () {
                expect({}).to.be.an('object');
            });
        });
    });
});
