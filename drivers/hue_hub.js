var HueApi = require("node-hue-api").HueApi;
var async = require('async');

var HueHubDriver = module.exports = function(data) {
  this.type = 'huehub';
  this.name = data.id;
  this.data = data;

  if(!data.registered)
    this.state = 'unregistered';
  else{
    this.state = 'registered';
    this.hue = new HueApi(this.data.ipaddress, this.data.user);
  }
};

HueHubDriver.prototype.init = function(config) {
  config
    .when('unregistered', { allow: ['register'] })
    .when('registered', { allow: ['blink'] })
    .map('register', this.register)
    .map('blink', this.blink)
};

HueHubDriver.prototype.register = function(cb) {
  var self = this;
  var hue = new HueApi();
  hue.createUser(this.data.ipaddress, null, null, function(err, user) {
    if (err)
      return cb(err);

    self.data.user = user;
    self.data.registered = true;
    self.state = 'registered';
    self.hue = new HueApi(self.data.ipaddress, self.data.user);
  });
};

HueHubDriver.prototype.blink = function(cb) {
  console.log('blinking all hue bulbs');

  var self = this;
  function blink(group){  
    return function(callback){
      self.hue.setGroupLightState(group, {alert : "select"},callback);
    }
  }

  function delay(time){
    return function(callback){
      setTimeout(callback,time);
    }
  }

  async.series([
      blink(0),
      delay(500),
      blink(0),
      delay(500),
      blink(0),
  ],cb);

};
