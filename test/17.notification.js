/* global require */

var expect = require("chai").expect;
var sinon = require('sinon');

var test = null;

/* Test suite for notification library */
describe("Notification core component", function () {
    describe("notification object", function () {
        test = require("../core/notification");
        it("should be an object", function () {
            expect(test).to.be.an('object');
        });
        it("should have config property", function () {
            expect(test).to.have.any.keys('config');
            expect(test.config).to.be.an('object');
        });
    });
    describe("#init()", function () {
        var test2 = sinon.spy(test, 'init');
        test.init({}, false);
        it('should call init once', function () {
            sinon.assert.calledOnce(test2);
        });
        test2.restore();
    });
    describe("#notify()", function () {
        it("should be a method", function () {
            expect(test).to.have.any.keys('notify');
            expect(test.notify).to.be.an('function');
        });
    });
    describe("SQS backend", function () {
        it("should be an object", function () {
            expect(test.sqs).to.be.an('object');
        });
        it("should have isActive property", function () {
            expect(test.sqs).to.have.any.keys('isActive');
            expect(test.sqs.isActive).to.be.an('boolean');
        });
        it("should be inactive", function () {
            expect(test.sqs.isActive).to.be.false;
        });
        describe("#init()", function () {
            it("should be a method", function () {
                expect(test.sqs).to.have.any.keys('init');
                expect(test.sqs.init).to.be.an('function');
            });
        });
        describe("#notify()", function () {
            it("should be a method", function () {
                expect(test.sqs).to.have.any.keys('notify');
                expect(test.sqs.notify).to.be.an('function');
            });
        });
    });
    describe("Couchbase backend", function () {
        it("should be an object", function () {
            expect(test.couchbase).to.be.an('object');
        });
        it("should have isActive property", function () {
            expect(test.couchbase).to.have.any.keys('isActive');
            expect(test.couchbase.isActive).to.be.an('boolean');
        });
        it("should be inactive", function () {
            expect(test.couchbase.isActive).to.be.false;
        });
        describe("#init()", function () {
            it("should be a method", function () {
                expect(test.couchbase).to.have.any.keys('init');
                expect(test.couchbase.init).to.be.an('function');
            });
        });
        describe("#notify()", function () {
            it("should be a method", function () {
                expect(test.couchbase).to.have.any.keys('notify');
                expect(test.couchbase.notify).to.be.an('function');
            });
        });
    });
});