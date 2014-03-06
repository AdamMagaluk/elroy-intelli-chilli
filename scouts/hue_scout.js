var util = require('util')
  , EventEmitter = require('events').EventEmitter
  , hue = require("node-hue-api")
  , HueHubDriver = require('../drivers/hue_hub');

var HueScout = module.exports = function() {
  this.interval = 15000;
  EventEmitter.call(this);
  this.drivers = ['huehub'];
};
util.inherits(HueScout, EventEmitter);

HueScout.prototype.init = function(next) {
  // start search logic
  this.search();
  setInterval(this.search.bind(this),this.interval);
  next();
};

HueScout.prototype.provision = function(device) {
  return [HueHubDriver,device.data];
};

HueScout.prototype.search = function() {
  var self = this;
  hue.locateBridges(function(err, hubs) {
    if(err)
      return;

    hubs.forEach(function(hueHub){
      self.emit('discover', HueHubDriver,hueHub);
    });

  });
};

HueScout.prototype.compare = function(a,b) {
  return (a.data.id === b.data.id);
};
