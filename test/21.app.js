/* global require */

var expect = require("chai").expect;

var test = null;

/* Test suite for app library */
describe("Application core component", function () {
  describe("app object", function () {
    test = require("../core/app");
    it("should be an object", function () {
      expect(test).to.be.an('object');
    });
    it("should have config property", function () {
      expect(test).to.have.any.keys('config');
      expect(test.config).to.be.an('object');
    });
    it("should have package property", function () {
      expect(test).to.have.any.keys('package');
      expect(test.package).to.be.an('object');
    });
    it("should have timer property", function () {
      expect(test).to.have.any.keys('timer');
      expect(test.timer).to.be.an('object');
    });
    it("should have log property", function () {
      expect(test).to.have.any.keys('log');
      expect(test.log).to.be.an('object');
    });
    it("should have resources property", function () {
      expect(test).to.have.any.keys('resources');
      expect(test.resources).to.be.an('object');
    });
    it("should have session property", function () {
      expect(test).to.have.any.keys('session');
      expect(test.session).to.be.an('object');
    });
    it("should have ws property", function () {
      expect(test).to.have.any.keys('ws');
      expect(test.ws).to.be.an('object');
    });
    it("should have _onstopQueue property", function () {
      expect(test).to.have.any.keys('_onstopQueue');
      expect(test._onstopQueue).to.be.an('array');
    });
    it("should have _onstartQueue property", function () {
      expect(test).to.have.any.keys('_onstartQueue');
      expect(test._onstartQueue).to.be.an('array');
    });
  });
  describe("#init()", function () {
    it("should exist", function () {
      expect(test).to.have.any.keys('init');
    });
    it("should be a method", function () {
      expect(test.init).to.be.an('function');
    });
    describe("#_initCheckEnv()", function () {
      it("should exist", function () {
        expect(test).to.have.any.keys('_initCheckEnv');
      });
      it("should be a method", function () {
        expect(test._initCheckEnv).to.be.an('function');
      });
    });
    describe("#_initLoadConfigFiles()", function () {
      it("should exist", function () {
        expect(test).to.have.any.keys('_initLoadConfigFiles');
      });
      it("should be a method", function () {
        expect(test._initLoadConfigFiles).to.be.an('function');
      });
    });
    describe("#_initProcessSignals()", function () {
      it("should exist", function () {
        expect(test).to.have.any.keys('_initProcessSignals');
      });
      it("should be a method", function () {
        expect(test._initProcessSignals).to.be.an('function');
      });
    });
  });
  describe("#getConfig()", function () {
    it("should exist", function () {
      expect(test).to.have.any.keys('getConfig');
    });
    it("should be a method", function () {
      expect(test.getConfig).to.be.an('function');
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
  describe("#onStart()", function () {
    it("should exist", function () {
      expect(test).to.have.any.keys('onStart');
    });
    it("should be a method", function () {
      expect(test.onStart).to.be.an('function');
    });
  });
  describe("#onStop()", function () {
    it("should exist", function () {
      expect(test).to.have.any.keys('onStop');
    });
    it("should be a method", function () {
      expect(test.onStop).to.be.an('function');
    });
  });
  describe("#fatalError()", function () {
    it("should exist", function () {
      expect(test).to.have.any.keys('fatalError');
    });
    it("should be a method", function () {
      expect(test.fatalError).to.be.an('function');
    });
  });
  describe("#launch()", function () {
    it("should exist", function () {
      expect(test).to.have.any.keys('launch');
    });
    it("should be a method", function () {
      expect(test.launch).to.be.an('function');
    });
  });
});