/* global require */

var expect = require("chai").expect;

var test = null;

/* Test suite for serviceinfo resource */
describe("serviceinfo resource component", function () {
  describe("app object", function () {
    test = require("../core/resource/serviceinfo");
    test = test("test-serviceinfo", {
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
    describe("#read()", function () {
      it("should exist", function () {
        expect(test).to.have.any.keys('read');
      });
      it("should be a method", function () {
        expect(test.read).to.be.an('function');
      });
      describe("#__readDefaultCallback()", function () {
        it("should exist", function () {
          expect(test).to.have.any.keys('__readDefaultCallback');
        });
        it("should be a method", function () {
          expect(test.__readDefaultCallback).to.be.an('function');
        });
      });
    });
    describe("#health()", function () {
      it("should exist", function () {
        expect(test).to.have.any.keys('health');
      });
      it("should be a method", function () {
        expect(test.health).to.be.an('function');
      });
      describe("#__healthDefaultCallback()", function () {
        it("should exist", function () {
          expect(test).to.have.any.keys('__healthDefaultCallback');
        });
        it("should be a method", function () {
          expect(test.__healthDefaultCallback).to.be.an('function');
        });
      });
    });
  });
  describe("resource endpoints", function () {
    describe("#info()", function () {
      it("should exist", function () {
        expect(test.endpoints).to.have.any.keys('info');
      });
      it("should be a method", function () {
        expect(test.endpoints.info).to.be.an('function');
      });
      var result = test.endpoints.info({});
      it("should return a webserver callback", function () {
        expect(result).to.be.an('function');
      });
    });
    describe("#health()", function () {
      it("should exist", function () {
        expect(test.endpoints).to.have.any.keys('health');
      });
      it("should be a method", function () {
        expect(test.endpoints.health).to.be.an('function');
      });
      var result = test.endpoints.health({});
      it("should return a webserver callback", function () {
        expect(result).to.be.an('function');
      });
    });
  });
});