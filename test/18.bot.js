/* global require */

var expect = require("chai").expect;
var sinon = require('sinon');

var test = null;

/* Test suite for log library */
describe("Bot core component", function () {
    describe("log object", function () {
        test = require("../core/bot");
        it("should be an object", function () {
            expect(test).to.be.an('object');
        });
        it("should have config property", function () {
            expect(test).to.have.any.keys('config');
            expect(test.config).to.be.an('object');
        });
        it("should have cronlib property", function () {
            expect(test).to.have.any.keys('cronlib');
            expect(test.cronlib).to.be.null;
        });
        it("should have lib property", function () {
            expect(test).to.have.any.keys('lib');
            expect(test.lib).to.be.null;
        });
        it("should have timers property", function () {
            expect(test).to.have.any.keys('timers');
            expect(test.timers).to.be.an('array');
        });
    });
    describe("#init()", function () {
        it("should be a method", function () {
            expect(test).to.have.any.keys('init');
            expect(test.init).to.be.an('function');
        });
    });
    describe("#_initCron()", function () {
        it("should be a method", function () {
            expect(test).to.have.any.keys('_initCron');
            expect(test._initCron).to.be.an('function');
        });
    });
    describe("#_initReaders()", function () {
        it("should be a method", function () {
            expect(test).to.have.any.keys('_initReaders');
            expect(test._initReaders).to.be.an('function');
        });
    });
    describe("#_initReaders()", function () {
        it("should be a method", function () {
            expect(test).to.have.any.keys('_initReaders');
            expect(test._initReaders).to.be.an('function');
        });
    });
    describe("#taskExist()", function () {
        it("should be a method", function () {
            expect(test).to.have.any.keys('taskExist');
            expect(test.taskExist).to.be.an('function');
        });
    });
    describe("#start()", function () {
        it("should be a method", function () {
            expect(test).to.have.any.keys('start');
            expect(test.start).to.be.an('function');
        });
    });
    describe("#stop()", function () {
        it("should be a method", function () {
            expect(test).to.have.any.keys('stop');
            expect(test.stop).to.be.an('function');
        });
    });
});