/* global require */

var expect = require("chai").expect;

var test = null;

/* Test suite for swagger resource */
describe("swagger resource component", function () {
    describe("app object", function () {
        test = require("../core/resource/swagger");
        test = test("test-swagger", {
        });
        it("should be an object", function () {
            expect(test).to.be.an('object');
        });
        it("should have config property", function () {
            expect(test).to.have.any.keys('config');
            expect(test.config).to.be.an('object');
        });
        it("should have id property", function () {
            expect(test).to.have.any.keys('id');
            expect(test.id).to.be.an('string');
        });
        it("should have endpoints property", function () {
            expect(test).to.have.any.keys('endpoints');
            expect(test.endpoints).to.be.an('object');
        });
    });
    describe("#init()", function () {
        it("should exist", function () {
            expect(test).to.have.any.keys('init');
        });
        it("should be a method", function () {
            expect(test.init).to.be.an('function');
        });
    });
    describe("#start()", function () {
        it("should exist", function () {
            expect(test).to.have.any.keys('start');
        });
        it("should be a method", function () {
            expect(test.start).to.be.an('function');
        });
    });
    describe("#stop()", function () {
        it("should exist", function () {
            expect(test).to.have.any.keys('stop');
        });
        it("should be a method", function () {
            expect(test.stop).to.be.an('function');
        });
    });
    describe("#open()", function () {
        it("should exist", function () {
            expect(test).to.have.any.keys('open');
        });
        it("should be a method", function () {
            expect(test.open).to.be.an('function');
        });
    });
    describe("resource methods", function () {
        describe("#getManifest()", function () {
            it("should exist", function () {
                expect(test).to.have.any.keys('getManifest');
            });
            it("should be a method", function () {
                expect(test.getManifest).to.be.an('function');
            });
            describe("#__getManifestDefaultCallback()", function () {
                it("should exist", function () {
                    expect(test).to.have.any.keys('__getManifestDefaultCallback');
                });
                it("should be a method", function () {
                    expect(test.__getManifestDefaultCallback).to.be.an('function');
                });
            });
        });
    });
    describe("resource endpoints", function () {
        describe("#manifest()", function () {
            it("should exist", function () {
                expect(test.endpoints).to.have.any.keys('manifest');
            });
            it("should be a method", function () {
                expect(test.endpoints.manifest).to.be.an('function');
            });
            var result = test.endpoints.manifest({});
            it("should return a webserver callback", function () {
                expect(result).to.be.an('function');
            });
        });
    });
});