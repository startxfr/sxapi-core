/* global require */

var expect = require("chai").expect;

// add minimum lib for testing environment
require('../core/tools');
$timer = require('../core/timer');
$log = require('../core/log');
$log.init({}, true);

var test = null;

/* Test suite for session library */
describe("Session core component", function () {
    describe("session object", function () {
        test = require("../core/session");
        it("should be an object", function () {
            expect(test).to.be.an('object');
        });
        it("should have config property", function () {
            expect(test).to.have.any.keys('config');
            expect(test.config).to.be.an('object');
        });
        it("should have cached property", function () {
            expect(test).to.have.any.keys('cached');
            expect(test.cached).to.be.an('object');
        });
    });
    describe("#init()", function () {
        test.init({});
        it("should have config.auto_create default value", function () {
            expect(test.config).to.have.any.keys('auto_create');
            expect(test.config.auto_create).to.be.an('boolean');
        });
        it("should have config.duration default value", function () {
            expect(test.config).to.have.any.keys('duration');
            expect(test.config.duration).to.be.an('number');
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
    describe("#required()", function () {
        it("should exist", function () {
            expect(test).to.have.any.keys('required');
        });
        it("should be a method", function () {
            expect(test.required).to.be.an('function');
        });
    });
    describe("#transports ", function () {
        it("should exist", function () {
            expect(test).to.have.any.keys('transports');
        });
        it("should be an object", function () {
            expect(test.transports).to.be.an('object');
        });
        describe("#bearer ", function () {
            it("should exist", function () {
                expect(test.transports).to.have.any.keys('bearer');
            });
            it("should be an object", function () {
                expect(test.transports.bearer).to.be.an('object');
            });
            it("should have init() method", function () {
                expect(test.transports.bearer.init).to.be.an('function');
            });
            it("should have start() method", function () {
                expect(test.transports.bearer.start).to.be.an('function');
            });
            it("should have stop() method", function () {
                expect(test.transports.bearer.stop).to.be.an('function');
            });
            it("should have getSID() method", function () {
                expect(test.transports.bearer.getSID).to.be.an('function');
            });
            it("should have setSID() method", function () {
                expect(test.transports.bearer.setSID).to.be.an('function');
            });
        });
        describe("#cookie ", function () {
            it("should exist", function () {
                expect(test.transports).to.have.any.keys('cookie');
            });
            it("should be an object", function () {
                expect(test.transports.cookie).to.be.an('object');
            });
            it("should have init() method", function () {
                expect(test.transports.cookie.init).to.be.an('function');
            });
            it("should have start() method", function () {
                expect(test.transports.cookie.start).to.be.an('function');
            });
            it("should have stop() method", function () {
                expect(test.transports.cookie.stop).to.be.an('function');
            });
            it("should have getSID() method", function () {
                expect(test.transports.cookie.getSID).to.be.an('function');
            });
            it("should have setSID() method", function () {
                expect(test.transports.cookie.setSID).to.be.an('function');
            });
        });
        describe("#token ", function () {
            it("should exist", function () {
                expect(test.transports).to.have.any.keys('token');
            });
            it("should be an object", function () {
                expect(test.transports.token).to.be.an('object');
            });
            it("should have init() method", function () {
                expect(test.transports.token.init).to.be.an('function');
            });
            it("should have start() method", function () {
                expect(test.transports.token.start).to.be.an('function');
            });
            it("should have stop() method", function () {
                expect(test.transports.token.stop).to.be.an('function');
            });
            it("should have getSID() method", function () {
                expect(test.transports.token.getSID).to.be.an('function');
            });
            it("should have setSID() method", function () {
                expect(test.transports.token.setSID).to.be.an('function');
            });
        });
    });
    describe("#backends ", function () {
        it("should exist", function () {
            expect(test).to.have.any.keys('backends');
        });
        it("should be an object", function () {
            expect(test.backends).to.be.an('object');
        });
        describe("#mysql ", function () {
            it("should exist", function () {
                expect(test.backends).to.have.any.keys('mysql');
            });
            it("should be an object", function () {
                expect(test.backends.mysql).to.be.an('object');
            });
            it("should have init() method", function () {
                expect(test.backends.mysql.init).to.be.an('function');
            });
            it("should have start() method", function () {
                expect(test.backends.mysql.start).to.be.an('function');
            });
            it("should have stop() method", function () {
                expect(test.backends.mysql.stop).to.be.an('function');
            });
            it("should have getSession() method", function () {
                expect(test.backends.mysql.getSession).to.be.an('function');
            });
            it("should have createSession() method", function () {
                expect(test.backends.mysql.createSession).to.be.an('function');
            });
        });
        describe("#couchbase ", function () {
            it("should exist", function () {
                expect(test.backends).to.have.any.keys('couchbase');
            });
            it("should be an object", function () {
                expect(test.backends.couchbase).to.be.an('object');
            });
            it("should have init() method", function () {
                expect(test.backends.couchbase.init).to.be.an('function');
            });
            it("should have start() method", function () {
                expect(test.backends.couchbase.start).to.be.an('function');
            });
            it("should have stop() method", function () {
                expect(test.backends.couchbase.stop).to.be.an('function');
            });
            it("should have getSession() method", function () {
                expect(test.backends.couchbase.getSession).to.be.an('function');
            });
            it("should have createSession() method", function () {
                expect(test.backends.couchbase.createSession).to.be.an('function');
            });
        });
        describe("#memory ", function () {
            it("should exist", function () {
                expect(test.backends).to.have.any.keys('memory');
            });
            it("should be an object", function () {
                expect(test.backends.memory).to.be.an('object');
            });
            it("should have init() method", function () {
                expect(test.backends.memory.init).to.be.an('function');
            });
            it("should have start() method", function () {
                expect(test.backends.memory.start).to.be.an('function');
            });
            it("should have stop() method", function () {
                expect(test.backends.memory.stop).to.be.an('function');
            });
            it("should have getSession() method", function () {
                expect(test.backends.memory.getSession).to.be.an('function');
            });
            it("should have createSession() method", function () {
                expect(test.backends.memory.createSession).to.be.an('function');
            });
        });
        describe("#memcache ", function () {
            it("should exist", function () {
                expect(test.backends).to.have.any.keys('memcache');
            });
            it("should be an object", function () {
                expect(test.backends.memcache).to.be.an('object');
            });
            it("should have init() method", function () {
                expect(test.backends.memcache.init).to.be.an('function');
            });
            it("should have start() method", function () {
                expect(test.backends.memcache.start).to.be.an('function');
            });
            it("should have stop() method", function () {
                expect(test.backends.memcache.stop).to.be.an('function');
            });
            it("should have getSession() method", function () {
                expect(test.backends.memcache.getSession).to.be.an('function');
            });
            it("should have createSession() method", function () {
                expect(test.backends.memcache.createSession).to.be.an('function');
            });
        });
        describe("#redis ", function () {
            it("should exist", function () {
                expect(test.backends).to.have.any.keys('redis');
            });
            it("should be an object", function () {
                expect(test.backends.redis).to.be.an('object');
            });
            it("should have init() method", function () {
                expect(test.backends.redis.init).to.be.an('function');
            });
            it("should have start() method", function () {
                expect(test.backends.redis.start).to.be.an('function');
            });
            it("should have stop() method", function () {
                expect(test.backends.redis.stop).to.be.an('function');
            });
            it("should have getSession() method", function () {
                expect(test.backends.redis.getSession).to.be.an('function');
            });
            it("should have createSession() method", function () {
                expect(test.backends.redis.createSession).to.be.an('function');
            });
        });
    });
});