/* global require */

var expect = require("chai").expect;

var test = null;

/* Test suite for websocket-client resource */
describe("websocket-client resource component", function () {
  describe("app object", function () {
    test = require("../core/resource/websocket-client");
    test = test("test-websocket-client", {host:"localhost:8080"}, {
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
    it("should have host property", function () {
      expect(test.config).to.have.any.keys('host');
      expect(test.config.host).to.be.an('string');
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
  describe("resource methods", function () {
    describe("#on()", function () {
      it("should exist", function () {
        expect(test).to.have.any.keys('on');
      });
      it("should be a method", function () {
        expect(test.on).to.be.an('function');
      });
    });
    describe("#emit()", function () {
      it("should exist", function () {
        expect(test).to.have.any.keys('emit');
      });
      it("should be a method", function () {
        expect(test.emit).to.be.an('function');
      });
    });
  });
  describe("resource endpoints", function () {
    describe("#emit()", function () {
      it("should exist", function () {
        expect(test.endpoints).to.have.any.keys('emit');
      });
      it("should be a method", function () {
        expect(test.endpoints.emit).to.be.an('function');
      });
      var result = test.endpoints.emit({});
      it("should return a webserver callback", function () {
        expect(result).to.be.an('function');
      });
    });
  });
});