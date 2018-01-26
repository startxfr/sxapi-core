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
  describe("#notif()", function () {
    it("should be a method", function () {
      expect(test).to.have.any.keys('notif');
      expect(test.notif).to.be.an('function');
    });
  });
  describe("#notify()", function () {
    it("should be a method", function () {
      expect(test).to.have.any.keys('notify');
      expect(test.notify).to.be.an('function');
    });
  });
  describe("#sqsInit()", function () {
    it("should be a method", function () {
      expect(test).to.have.any.keys('sqsInit');
      expect(test.sqsInit).to.be.an('function');
    });
  });
  describe("#couchbaseInit()", function () {
    it("should be a method", function () {
      expect(test).to.have.any.keys('couchbaseInit');
      expect(test.couchbaseInit).to.be.an('function');
    });
  });
});