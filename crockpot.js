var util = require('util');
var Device = require('zetta-device');
var IntelliChilliClient = require('intelli-chilli-client');

var CrockPot = module.exports = function(ip) {
  Device.call(this);
  var self = this;

  this.ip = ip;
  this.currentTemp = NaN;

  this._client = new IntelliChilliClient({ address: ip });
  this._client.on('lidopened',function() {
    self.call('lid-opened');
  });

  this._client.on('lidclosed',function() {
    self.call('lid-closed');
  });
  
  self._syncState();
  setInterval(function() {
    self._syncState();
  }, 30000);

};
util.inherits(CrockPot, Device);

CrockPot.prototype.init = function(config) {
  config
    .type('crockpot')
    .name('Crockpot ('+ this.ip +')')
    .state('offline')
    .when('offline', { allow: [] })
    .when('off', { allow: ['turn-on','set-level','set-time','reset'] })
    .when('on', { allow: ['turn-off','set-level','set-time','reset'] })
    .map('turn-on', this.turnOn)
    .map('turn-off', this.turnOff)
    .map('set-time', this.setTime, [{ name: 'time', type: 'number' }])
    .map('set-level', this.setLevel, [{ name: 'level', type: 'text' }])
    .map('reset', this.reset)
    .map('lid-opened', this.lidOpened)
    .map('lid-closed', this.lidClosed)
    .monitor('currentTemp')
    .monitor('lid')
    .monitor('cookTimeLeft');

};

CrockPot.prototype.turnOn = function(cb) {
  var self = this;
  self._client.startCook(function(err){
    if(err) {
      return cb(err);
    }
    
    self.state = 'on';
    cb();
  });
};

CrockPot.prototype.turnOff = function(cb) {
  var self = this;
  self._client.stopCook(function(err){
    if(err) {
      return cb(err);
    }

    self.state = 'off';
    cb();
  });
};

CrockPot.prototype.setLevel = function(value,cb) {
  var self = this;
  self._client.setCookTemp(value,function(err){
    if(err) {
      return cb(err);
    }
    return self._syncState(cb);
  });
};

CrockPot.prototype.setTime = function(value,cb) {
  var self = this;
  self._client.setCookTime(value,function(err){
    if(err) {
      return cb(err);
    }
    return self._syncState(cb);
  });
};

CrockPot.prototype.reset = function(cb) {
  self._client.resetDevice(cb);
};

CrockPot.prototype.lidOpened = function(cb) {
  return cb();
};

CrockPot.prototype.lidClosed = function(cb) {
  return cb();
};

CrockPot.prototype._syncState = function(cb) {
  var self = this;
  if (!cb) {
    cb = function(){};
  }

  self._client.returnState(function(err,state) {
    if (err) {
      self.state = 'offline';
      return cb(err);
    }
    
    self.cookTimeRange = state.cookTimeRange;
    self.cookTempRange = state.cookTempRange;

    self.heaterOn = state.heaterOn;
    self.lid = state.lidState;
    self.currentTemp = state.currentTemp;
    self.cookTemp = state.cookTemp;
    self.cookTime = state.cookTime;
    self.cookTimeLeft = state.cookTimeLeft;

    if (state.cooking) {
      self.state = 'on';
    } else {
      self.state = 'off';
    }



    cb(null, state);
  });
};
