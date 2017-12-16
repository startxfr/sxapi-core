/* global require */

var expect = require("chai").expect;

console.isEhanced = true;
require("../core/tools");

/* Test suite for tools library */
describe("Tools library", function () {
    describe("JSON", function () {
        describe("#isDeserializable()", function () {
            it("should be a property", function () {
                expect(JSON.isDeserializable).to.be.an('function');
            });
            it("should return boolean", function () {
                expect(JSON.isDeserializable('{"xx":"yy"}')).to.be.true;
                expect(JSON.isDeserializable('xxxxx')).to.be.false;
            });
        });
        describe("#isSerializable()", function () {
            it("should be a property", function () {
                expect(JSON.isSerializable).to.be.an('function');
            });
            it("should return boolean", function () {
                expect(JSON.isSerializable({"xx":"yy"})).to.be.true;
                expect(JSON.isSerializable('xxxxx')).to.be.false;
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