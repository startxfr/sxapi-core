/* global require */

var expect = require("chai").expect;

var test = null;

/* Test suite for mysql resource */
describe("mysql resource component", function () {
    describe("app object", function () {
        test = require("../core/resource/mysql");
        test = test("test-mysql", {
            server: {
                "host": "172.17.42.1",
                "database": "test"
            }
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
        it("should have tools property", function () {
            expect(test).to.have.any.keys('tools');
            expect(test.tools).to.be.an('object');
        });
        describe("#tools", function () {
            describe("#generateParams4Template()", function () {
                it("should exist", function () {
                    expect(test.tools).to.have.any.keys('generateParams4Template');
                });
                it("should be a method", function () {
                    expect(test.tools.generateParams4Template).to.be.an('function');
                });
            });
            describe("#responseResourceDoesntExist()", function () {
                it("should exist", function () {
                    expect(test.tools).to.have.any.keys('responseResourceDoesntExist');
                });
                it("should be a method", function () {
                    expect(test.tools.responseResourceDoesntExist).to.be.an('function');
                });
            });
            describe("#responseOK()", function () {
                it("should exist", function () {
                    expect(test.tools).to.have.any.keys('responseOK');
                });
                it("should be a method", function () {
                    expect(test.tools.responseOK).to.be.an('function');
                });
            });
            describe("#responseNOK()", function () {
                it("should exist", function () {
                    expect(test.tools).to.have.any.keys('responseNOK');
                });
                it("should be a method", function () {
                    expect(test.tools.responseNOK).to.be.an('function');
                });
            });
            describe("#format()", function () {
                it("should exist", function () {
                    expect(test.tools).to.have.any.keys('format');
                });
                it("should be a method", function () {
                    expect(test.tools.format).to.be.an('function');
                });
            });
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
        describe("#query()", function () {
            it("should exist", function () {
                expect(test).to.have.any.keys('query');
            });
            it("should be a method", function () {
                expect(test.query).to.be.an('function');
            });
            describe("#__queryDefaultCallback()", function () {
                it("should exist", function () {
                    expect(test).to.have.any.keys('__queryDefaultCallback');
                });
                it("should be a method", function () {
                    expect(test.__queryDefaultCallback).to.be.an('function');
                });
            });
        });
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
        describe("#list()", function () {
            it("should exist", function () {
                expect(test.endpoints).to.have.any.keys('list');
            });
            it("should be a method", function () {
                expect(test.endpoints.list).to.be.an('function');
            });
            var result = test.endpoints.list({});
            it("should return a webserver callback", function () {
                expect(result).to.be.an('function');
            });
        });
        describe("#read()", function () {
            it("should exist", function () {
                expect(test.endpoints).to.have.any.keys('read');
            });
            it("should be a method", function () {
                expect(test.endpoints.read).to.be.an('function');
            });
            var result = test.endpoints.read({});
            it("should return a webserver callback", function () {
                expect(result).to.be.an('function');
            });
        });
        describe("#readOne()", function () {
            it("should exist", function () {
                expect(test.endpoints).to.have.any.keys('readOne');
            });
            it("should be a method", function () {
                expect(test.endpoints.readOne).to.be.an('function');
            });
            var result = test.endpoints.readOne({});
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