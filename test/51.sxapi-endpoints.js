/* global require, $log, $timer */

var $app = null;
//Require the dev-dependencies
var chai = require('chai');
var expect = require("chai").expect;
chai.use(require('chai-http'));

/* Test suite for testing live application */
describe("test running application", function () {
    $app = require("../core/app");
    it("should init the application", function () {
        expect($app).to.be.an('object');
    });
    //Start the application
    $app.launch("/conf/sxapi.json", function () {
        it("should start the application", function () {
            expect($app.ws).to.be.an('object');
        });
        it("should use /conf/sxapi.json", function () {
            expect($app.config).to.be.an('object');
        });
        var url = "/";
        describe("GET " + url, function () {
            it("should not return an error", function () {
                chai.request($app.ws.app).get(url).end(function (err, res) {
                    expect(err).to.be.null;
                });
            });
            it("should return a Http 200 response code", function () {
                chai.request($app.ws.app).get(url).end(function (err, res) {
                    expect(res).to.have.status(200);
                });
            });
//            it("should return an html body response", function () {
//                chai.request($app.ws.app).get(url).end(function (err, res) {
//                    expect(res).to.be.html;
//                });
//            });
        });
        url = "/health";
        describe("GET " + url, function () {
            it("should not return an error", function () {
                chai.request($app.ws.app).get(url).end(function (err, res) {
                    expect(err).to.be.null;
                });
            });
            it("should return a Http 200 response code", function () {
                chai.request($app.ws.app).get(url).end(function (err, res) {
                    expect(res).to.have.status(200);
                });
            });
            it("should return an json response", function () {
                chai.request($app.ws.app).get(url).end(function (err, res) {
                    expect(res).to.be.json;
                });
            });
        });
    });
});
