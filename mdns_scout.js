var EventEmitter = require('events').EventEmitter;
var mdns = require('mdns');
var util = require('util');

var CrockPotDriver = require('./crockpot');

var MDNSScout = module.exports = function() {
 EventEmitter.call(this); 

 this.drivers = ['crockpot'];

 this.browser = mdns.createBrowser(mdns.tcp('intellichilli'));

  var self = this;
  this.browser.on('serviceUp', function(service) {
    var ipAddr = service.addresses[0];
    self.emit('discover', CrockPotDriver,ipAddr);
  });
};
util.inherits(MDNSScout, EventEmitter);

MDNSScout.prototype.provision = function(device) {
  return [CrockPotDriver,device.data.ip];
};

MDNSScout.prototype.init = function() {
  this.browser.start();
};
