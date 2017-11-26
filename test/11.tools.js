/* global require */

var expect = require("chai").expect;

require("../core/tools");

/* Test suite for tools library */
describe("Tools library", function () {
    describe("JSON", function () {
        describe("#isParsable()", function () {
            it("should be a property", function () {
                expect(JSON.isParsable).to.be.an('function');
            });
            it("should return boolean", function () {
                expect(JSON.isParsable('{"xx":"yy"}')).to.be.true;
                expect(JSON.isParsable('xxxxx')).to.be.false;
            });
        });
        describe("#cleanObject()", function () {
            it("should be a property", function () {
                expect(JSON.cleanObject).to.be.an('function');
            });
            it("should return object", function () {
                expect(JSON.cleanObject({"xx": "yy"})).to.be.an('object');
            });
        });
    });
});