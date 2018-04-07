/* global require */

var expect = require("chai").expect;

// add minimum lib for testing environment
require('../core/tools');
$timer = require('../core/timer');
$log = require('../core/log');
$log.init({}, true);

var test = null;

/* Test suite for ws library */
describe("Resource core component", function () {
  describe("ws object", function () {
    test = require("../core/ws");
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
    describe("#_initApp()", function () {
      it("should exist", function () {
        expect(test).to.have.any.keys('_initApp');
      });
      it("should be a method", function () {
        expect(test._initApp).to.be.an('function');
      });
    });
    describe("#_initEndpoints()", function () {
      it("should exist", function () {
        expect(test).to.have.any.keys('_initEndpoints');
      });
      it("should be a method", function () {
        expect(test._initEndpoints).to.be.an('function');
      });
    });
    describe("#_initEndpoint()", function () {
      it("should exist", function () {
        expect(test).to.have.any.keys('_initEndpoint');
      });
      it("should be a method", function () {
        expect(test._initEndpoint).to.be.an('function');
      });
    });
    describe("#_initEndpointConfig()", function () {
      it("should exist", function () {
        expect(test).to.have.any.keys('_initEndpointConfig');
      });
      it("should be a method", function () {
        expect(test._initEndpointConfig).to.be.an('function');
      });
    });
    describe("#__defaultEndpointCb()", function () {
      it("should exist", function () {
        expect(test).to.have.any.keys('__defaultEndpointCb');
      });
      it("should be a method", function () {
        expect(test.__defaultEndpointCb).to.be.an('function');
      });
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
  describe("#okResponse()", function () {
    it("should exist", function () {
      expect(test).to.have.any.keys('okResponse');
    });
    it("should be a method", function () {
      expect(test.okResponse).to.be.an('function');
    });
  });
  describe("#nokResponse()", function () {
    it("should exist", function () {
      expect(test).to.have.any.keys('nokResponse');
    });
    it("should be a method", function () {
      expect(test.nokResponse).to.be.an('function');
    });
  });
  describe("#response()", function () {
    it("should exist", function () {
      expect(test).to.have.any.keys('response');
    });
    it("should be a method", function () {
      expect(test.response).to.be.an('function');
    });
  });
  describe("#defaultRouter()", function () {
    it("should exist", function () {
      expect(test).to.have.any.keys('defaultRouter');
    });
    it("should be a method", function () {
      expect(test.defaultRouter).to.be.an('function');
    });
  });
  describe("#dynamicRequestHandlerTest()", function () {
    it("should exist", function () {
      expect(test).to.have.any.keys('dynamicRequestHandlerTest');
    });
    it("should be a method", function () {
      expect(test.dynamicRequestHandlerTest).to.be.an('function');
    });
  });
  describe("websockets", function () {
    it("should exist", function () {
      expect(test).to.have.any.keys('websockets');
    });
    it("should be a object", function () {
      expect(test.websockets).to.be.an('object');
    });
    describe("#websockets.start()", function () {
      it("should exist", function () {
        expect(test.websockets).to.have.any.keys('start');
      });
      it("should be a method", function () {
        expect(test.websockets.start).to.be.an('function');
      });
    });
    describe("#websockets._initClientEventCallback()", function () {
      it("should exist", function () {
        expect(test.websockets).to.have.any.keys('_initClientEventCallback');
      });
      it("should be a method", function () {
        expect(test.websockets._initClientEventCallback).to.be.an('function');
      });
    });
    describe("#websockets.onConnectionDefaultCallback()", function () {
      it("should exist", function () {
        expect(test.websockets).to.have.any.keys('onConnectionDefaultCallback');
      });
      it("should be a method", function () {
        expect(test.websockets.onConnectionDefaultCallback).to.be.an('function');
      });
    });
    describe("#websockets.onMessageDefaultCallback()", function () {
      it("should exist", function () {
        expect(test.websockets).to.have.any.keys('onMessageDefaultCallback');
      });
      it("should be a method", function () {
        expect(test.websockets.onMessageDefaultCallback).to.be.an('function');
      });
    });
  });
});