/* global require */

var expect = require("chai").expect;

// add minimum lib for testing environment
require('../core/tools');
$timer = require('../core/timer');
$log = require('../core/log');
$log.init({}, true);

var test = null;

/* Test suite for resource library */
describe("Resource core component", function () {
  describe("resource object", function () {
    test = require("../core/resource");
    it("should be an object", function () {
      expect(test).to.be.an('object');
    });
    it("should have config property", function () {
      expect(test).to.have.any.keys('config');
      expect(test.config).to.be.an('object');
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
  describe("#starts()", function () {
    it("should exist", function () {
      expect(test).to.have.any.keys('start');
    });
    it("should be a method", function () {
      expect(test.start).to.be.an('function');
    });
  });
  describe("#stops()", function () {
    it("should exist", function () {
      expect(test).to.have.any.keys('stop');
    });
    it("should be a method", function () {
      expect(test.stop).to.be.an('function');
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
  describe("#add()", function () {
    it("should exist", function () {
      expect(test).to.have.any.keys('add');
    });
    it("should be a method", function () {
      expect(test.add).to.be.an('function');
    });
  });
  describe("#get()", function () {
    it("should exist", function () {
      expect(test).to.have.any.keys('get');
    });
    it("should be a method", function () {
      expect(test.get).to.be.an('function');
    });
  });
  describe("#exist()", function () {
    it("should exist", function () {
      expect(test).to.have.any.keys('exist');
    });
    it("should be a method", function () {
      expect(test.exist).to.be.an('function');
    });
  });
});