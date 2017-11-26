/* global require */

var expect = require("chai").expect;

var test = null;

/* Test suite for http resource */
describe("http resource component", function () {
    describe("app object", function () {
        test = require("../core/resource/http");
        test = test("test-http", {
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
        describe("#call()", function () {
            it("should exist", function () {
                expect(test).to.have.any.keys('call');
            });
            it("should be a method", function () {
                expect(test.call).to.be.an('function');
            });
            describe("#__queryDefaultCallback()", function () {
                it("should exist", function () {
                    expect(test).to.have.any.keys('__queryDefaultCallback');
                });
                it("should be a method", function () {
                    expect(test.__queryDefaultCallback).to.be.an('function');
                });
            });
        });
        describe("#reader()", function () {
            it("should exist", function () {
                expect(test).to.have.any.keys('reader');
            });
            it("should be a method", function () {
                expect(test.reader).to.be.an('function');
            });
        });
    });
    describe("resource endpoints", function () {
        describe("#call()", function () {
            it("should exist", function () {
                expect(test.endpoints).to.have.any.keys('call');
            });
            it("should be a method", function () {
                expect(test.endpoints.call).to.be.an('function');
            });
            var result = test.endpoints.call({});
            it("should return a webserver callback", function () {
                expect(result).to.be.an('function');
            });
        });
    });
});