/* global require */

var expect = require("chai").expect;
var sinon = require('sinon');

var test = null;

/* Test suite for log library */
describe("Log core component", function () {
  describe("log object", function () {
    test = require("../core/log");
    it("should be an object", function () {
      expect(test).to.be.an('object');
    });
    it("should have config property", function () {
      expect(test).to.have.any.keys('config');
      expect(test.config).to.be.an('object');
    });
    it("should have isDebug property", function () {
      expect(test).to.have.any.keys('isDebug');
      expect(test.isDebug).to.be.an('boolean');
    });
    it("should have booted property", function () {
      expect(test).to.have.any.keys('booted');
      expect(test.booted).to.be.an('boolean');
    });
    it("should have format property", function () {
      expect(test).to.have.any.keys('format');
    });
    it("should have tools property", function () {
      expect(test).to.have.any.keys('tools');
    });
  });
  describe("#init()", function () {
    var test2 = sinon.spy(test, 'init');
    test.init({}, false);
    it("should be booted", function () {
      expect(test.booted).to.be.true;
    });
    it('should call init once', function () {
      sinon.assert.calledOnce(test2);
    });
    test2.restore();
  });
  describe("#isExcluded()", function () {
    var test2 = sinon.spy(test, 'isExcluded');
    it("should be a method", function () {
      expect(test).to.have.any.keys('isExcluded');
      expect(test.isExcluded).to.be.an('function');
    });
    it('should return true for debug type', function () {
      test.isExcluded("debug", 0);
      test2.returned(true);
    });
    it('should return true for fake type', function () {
      test.isExcluded("fake", 10);
      test2.returned(false);
    });
    test2.restore();
  });
  describe("#error()", function () {
    it("should be a method", function () {
      expect(test).to.have.any.keys('error');
      expect(test.error).to.be.an('function');
    });
    it('should display an error message', function () {
      var test3 = sinon.spy(console, 'error');
      test.error("message", 0, false);
      sinon.assert.called(test3);
      test3.restore();
    });
  });
  describe("#warn()", function () {
    it("should be a method", function () {
      expect(test).to.have.any.keys('warn');
      expect(test.warn).to.be.an('function');
    });
    it('should display a warn message', function () {
      var test2 = sinon.spy(console, 'warn');
      test.warn("message", 0, false);
      sinon.assert.called(test2);
      test2.restore();
    });
  });
  describe("#info()", function () {
    it("should be a method", function () {
      expect(test).to.have.any.keys('info');
      expect(test.info).to.be.an('function');
    });
    it('should display an info message', function () {
      var test2 = sinon.spy(console, 'info');
      test.info("message", 0, false);
      sinon.assert.called(test2);
      test2.restore();
    });
  });
  describe("#debug()", function () {
    it("should be a method", function () {
      expect(test).to.have.any.keys('debug');
      expect(test.debug).to.be.an('function');
    });
    it('should not display a debug message', function () {
      var test2 = sinon.spy(console, 'log');
      test.isDebug = true;
      test.debug("message", 0, 0, false);
      test.isDebug = false;
      sinon.assert.called(test2);
      test2.restore();
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
    describe("#log()", function () {
      it("should be a method", function () {
        expect(test.sqs).to.have.any.keys('log');
        expect(test.sqs.log).to.be.an('function');
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
    describe("#log()", function () {
      it("should be a method", function () {
        expect(test.couchbase).to.have.any.keys('log');
        expect(test.couchbase.log).to.be.an('function');
      });
    });
  });
  describe("toolkit", function () {
    it("should be an object", function () {
      expect(test.tools).to.be.an('object');
    });
    describe("#endpointPrefix()", function () {
      it("should be a method", function () {
        expect(test.tools).to.have.any.keys('endpointPrefix');
        expect(test.tools.endpointPrefix).to.be.an('function');
      });
    });
    describe("#endpointMessage()", function () {
      it("should be a method", function () {
        expect(test.tools).to.have.any.keys('endpointMessage');
        expect(test.tools.endpointMessage).to.be.an('function');
      });
    });
    describe("#endpointDebug()", function () {
      it("should be a method", function () {
        expect(test.tools).to.have.any.keys('endpointDebug');
        expect(test.tools.endpointDebug).to.be.an('function');
      });
    });
    describe("#endpointInfo()", function () {
      it("should be a method", function () {
        expect(test.tools).to.have.any.keys('endpointInfo');
        expect(test.tools.endpointInfo).to.be.an('function');
      });
    });
    describe("#endpointWarn()", function () {
      it("should be a method", function () {
        expect(test.tools).to.have.any.keys('endpointWarn');
        expect(test.tools.endpointWarn).to.be.an('function');
      });
    });
    describe("#endpointError()", function () {
      it("should be a method", function () {
        expect(test.tools).to.have.any.keys('endpointError');
        expect(test.tools.endpointError).to.be.an('function');
      });
    });
    describe("#endpointDebugAndAnswer()", function () {
      it("should be a method", function () {
        expect(test.tools).to.have.any.keys('endpointDebugAndAnswer');
        expect(test.tools.endpointDebugAndAnswer).to.be.an('function');
      });
    });
    describe("#endpointInfoAndAnswer()", function () {
      it("should be a method", function () {
        expect(test.tools).to.have.any.keys('endpointInfoAndAnswer');
        expect(test.tools.endpointInfoAndAnswer).to.be.an('function');
      });
    });
    describe("#endpointWarnAndAnswer()", function () {
      it("should be a method", function () {
        expect(test.tools).to.have.any.keys('endpointWarnAndAnswer');
        expect(test.tools.endpointWarnAndAnswer).to.be.an('function');
      });
    });
    describe("#endpointWarnAndAnswerNoResource()", function () {
      it("should be a method", function () {
        expect(test.tools).to.have.any.keys('endpointWarnAndAnswerNoResource');
        expect(test.tools.endpointWarnAndAnswerNoResource).to.be.an('function');
      });
    });
    describe("#endpointErrorAndAnswer()", function () {
      it("should be a method", function () {
        expect(test.tools).to.have.any.keys('endpointErrorAndAnswer');
        expect(test.tools.endpointErrorAndAnswer).to.be.an('function');
      });
    });
    describe("#resourcePrefix()", function () {
      it("should be a method", function () {
        expect(test.tools).to.have.any.keys('resourcePrefix');
        expect(test.tools.resourcePrefix).to.be.an('function');
      });
    });
    describe("#resourceMessage()", function () {
      it("should be a method", function () {
        expect(test.tools).to.have.any.keys('resourceMessage');
        expect(test.tools.resourceMessage).to.be.an('function');
      });
    });
    describe("#resourceDebug()", function () {
      it("should be a method", function () {
        expect(test.tools).to.have.any.keys('resourceDebug');
        expect(test.tools.resourceDebug).to.be.an('function');
      });
    });
    describe("#resourceInfo()", function () {
      it("should be a method", function () {
        expect(test.tools).to.have.any.keys('resourceInfo');
        expect(test.tools.resourceInfo).to.be.an('function');
      });
    });
    describe("#resourceWarn()", function () {
      it("should be a method", function () {
        expect(test.tools).to.have.any.keys('resourceWarn');
        expect(test.tools.resourceWarn).to.be.an('function');
      });
    });
    describe("#resourceError()", function () {
      it("should be a method", function () {
        expect(test.tools).to.have.any.keys('resourceError');
        expect(test.tools.resourceError).to.be.an('function');
      });
    });
  });
});