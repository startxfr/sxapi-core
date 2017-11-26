/* global require */

var expect = require("chai").expect;

var test = null;
//test.start('app');

/* Test suite for timer core component */
describe("Timer core component", function () {
    describe("#init()", function () {
        test = require('../core/timer');
        it("should be an object", function () {
            expect(test).to.be.an('object');
        });
        it("should have timer property", function () {
            expect(test).to.have.any.keys('timer');
        });
    });
    describe("#start()", function () {
        it("should exist", function () {
            expect(test).to.have.any.keys('start');
        });
        it("should be a method", function () {
            expect(test).to.respondTo('start');
        });
        it("should return data", function () {
            expect(test.start("test")).to.not.be.empty;
        });
    });
    describe("#stop()", function () {
        it("should exist", function () {
            expect(test).to.have.any.keys('stop');
        });
        it("should be a method", function () {
            expect(test).to.respondTo('stop');
        });
        it("should return data", function () {
            expect(test.stop("test")).to.not.be.empty;
        });
    });
    describe("#get()", function () {
        it("should exist", function () {
            expect(test).to.have.any.keys('get');
        });
        it("should be a method", function () {
            expect(test).to.respondTo('get');
        });
        it("should return time-machine instance", function () {
            expect(test.get("test")).to.not.be.empty;
        });
    });
    describe("#time()", function () {
        it("should exist", function () {
            expect(test).to.have.any.keys('time');
        });
        it("should be a method", function () {
            expect(test).to.respondTo('time');
        });
        it("should return time", function () {
            expect(test.time("test")).to.be.a('number');
        });
    });
    describe("#timeStop()", function () {
        it("should exist", function () {
            expect(test).to.have.any.keys('timeStop');
        });
        it("should be a method", function () {
            expect(test).to.respondTo('timeStop');
        });
        it("should return time", function () {
            expect(test.timeStop("test")).to.be.a('number');
        });
    });
});