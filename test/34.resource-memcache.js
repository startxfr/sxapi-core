/* global require */

var expect = require("chai").expect;

var test = null;

/* Test suite for memcache resource */
describe("memcache resource component", function () {
    describe("app object", function () {
        test = require("../core/resource/memcache");
        test = test("test-memcache", {
            url: "memcache://localhost:6379"
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
        describe("#get()", function () {
            it("should exist", function () {
                expect(test).to.have.any.keys('get');
            });
            it("should be a method", function () {
                expect(test.get).to.be.an('function');
            });
            describe("#__getDefaultCallback()", function () {
                it("should exist", function () {
                    expect(test).to.have.any.keys('__getDefaultCallback');
                });
                it("should be a method", function () {
                    expect(test.__getDefaultCallback).to.be.an('function');
                });
            });
        });
        describe("#insert()", function () {
            it("should exist", function () {
                expect(test).to.have.any.keys('insert');
            });
            it("should be a method", function () {
                expect(test.insert).to.be.an('function');
            });
            describe("#__insertDefaultCallback()", function () {
                it("should exist", function () {
                    expect(test).to.have.any.keys('__insertDefaultCallback');
                });
                it("should be a method", function () {
                    expect(test.__insertDefaultCallback).to.be.an('function');
                });
            });
        });
        describe("#update()", function () {
            it("should exist", function () {
                expect(test).to.have.any.keys('update');
            });
            it("should be a method", function () {
                expect(test.update).to.be.an('function');
            });
            describe("#__updateDefaultCallback()", function () {
                it("should exist", function () {
                    expect(test).to.have.any.keys('__updateDefaultCallback');
                });
                it("should be a method", function () {
                    expect(test.__updateDefaultCallback).to.be.an('function');
                });
            });
        });
        describe("#delete()", function () {
            it("should exist", function () {
                expect(test).to.have.any.keys('delete');
            });
            it("should be a method", function () {
                expect(test.delete).to.be.an('function');
            });
            describe("#__deleteDefaultCallback()", function () {
                it("should exist", function () {
                    expect(test).to.have.any.keys('__deleteDefaultCallback');
                });
                it("should be a method", function () {
                    expect(test.__deleteDefaultCallback).to.be.an('function');
                });
            });
        });
    });
    describe("resource endpoints", function () {
        describe("#get()", function () {
            it("should exist", function () {
                expect(test.endpoints).to.have.any.keys('get');
            });
            it("should be a method", function () {
                expect(test.endpoints.get).to.be.an('function');
            });
            var result = test.endpoints.get({});
            it("should return a webserver callback", function () {
                expect(result).to.be.an('function');
            });
        });
        describe("#create()", function () {
            it("should exist", function () {
                expect(test.endpoints).to.have.any.keys('create');
            });
            it("should be a method", function () {
                expect(test.endpoints.create).to.be.an('function');
            });
            var result = test.endpoints.create({});
            it("should return a webserver callback", function () {
                expect(result).to.be.an('function');
            });
        });
        describe("#update()", function () {
            it("should exist", function () {
                expect(test.endpoints).to.have.any.keys('update');
            });
            it("should be a method", function () {
                expect(test.endpoints.update).to.be.an('function');
            });
            var result = test.endpoints.update({});
            it("should return a webserver callback", function () {
                expect(result).to.be.an('function');
            });
        });
        describe("#delete()", function () {
            it("should exist", function () {
                expect(test.endpoints).to.have.any.keys('delete');
            });
            it("should be a method", function () {
                expect(test.endpoints.delete).to.be.an('function');
            });
            var result = test.endpoints.delete({});
            it("should return a webserver callback", function () {
                expect(result).to.be.an('function');
            });
        });
    });
});