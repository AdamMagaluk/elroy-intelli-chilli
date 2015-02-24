var EventEmitter = require('events').EventEmitter;
var mdns = require('mdns');
var util = require('util');
var Scout = require('zetta-scout');

var Crockpot = require('./crockpot');

var MDNSScout = module.exports = function() {
  Scout.call(this); 

  var self = this;
  this.browser = mdns.createBrowser(mdns.tcp('intellichilli'));
  
  this.browser.on('serviceUp', function(service) {
    self.foundCrockpot(service.addresses[0]);
  });
};
util.inherits(MDNSScout, Scout);

MDNSScout.prototype.init = function(cb) {
  this.browser.start();
  cb();
};

MDNSScout.prototype.foundCrockpot = function(ip) {
  var self = this;
  var query = this.server.where({ type: 'crockpot', ip: ip });

  this.server.find(query, function(err, results) {
    if (results.length) {
      self.provision(results[0], Crockpot, ip);
    } else {
      self.discover(Crockpot, ip);
    }
  });

};


