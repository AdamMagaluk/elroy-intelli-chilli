var hue = require("node-hue-api")
  , lightState = hue.lightState;

var HueBulbDriver = module.exports = function(data,hue) {
  this.type = 'huebulb';
  this.name = data.id;
  this.data = data;
  this.hue = hue;
  this.state = 'off';
};

HueBulbDriver.prototype.init = function(config) {
  config
    .when('on', { allow: ['turn-off', 'toggle'] })
    .when('off', { allow: ['turn-on', 'toggle'] })
    .map('turn-on', this.turnOn)
    .map('turn-off', this.turnOff)
    .map('toggle', this.toggle)
};

HueBulbDriver.prototype.turnOn = function(cb) {
  var self = this;
  var state = lightState.create().on();
  this.hue.setLightState(this.data.id,state,function(err){
    if(err)
      return cb(err);

    self.state = 'on';
    cb();  
  });
};

HueBulbDriver.prototype.turnOff = function(cb) {
  var self = this;
  var state = lightState.create().off();
  this.hue.setLightState(this.data.id,state,function(err){
    if(err)
      return cb(err);

    self.state = 'off';
    cb();  
  });
};

HueBulbDriver.prototype.toggle = function(cb) {
  if (this.state === 'off') {
    this.call('turn-on');
    cb();
  } else if (this.state === 'on') {
    this.call('turn-off');
    cb();
  } else {
    cb(new Error('Invalid state - Valid states are "on" and "off".'));
  }
};
