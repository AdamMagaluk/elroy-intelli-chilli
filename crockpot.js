var IntelliChilliClient = require('intelli-chilli-client');
var extend = require('extend');

var client = null;

var CrockPot = module.exports = function(ip) {
  this.type = 'crockpot';
  this.name = 'Crockpot (' + ip + ')';
  this.data = { ip : ip };

  client = new IntelliChilliClient({address:ip});

  var self = this;
  client.on('lidopened',function(){
    self.call('lid-opened');
  });

  client.on('lidclosed',function(){
    self.call('lid-closed');
  });
  
  self.call('state');
  setInterval(function(){
    self.call('state');
  },30000);
};

CrockPot.prototype.init = function(config) {
  config
    .when('offline', { allow: [] })
    .when('off', { allow: ['turn-on','set-level','set-time','reset'] })
    .when('on', { allow: ['turn-off','set-level','set-time','reset'] })
    .map('turn-on', this.turnOn)
    .map('turn-off', this.turnOff)
    .map('set-time', this.setTime, [{ name: 'time', type: 'number' }])
    .map('set-level', this.setLevel, [{ name: 'level', type: 'text' }])
    .map('reset', this.reset)
    .map('state', this.state)
    .map('lid-opened', this.lidOpened)
    .map('lid-closed', this.lidClosed)
    .stream('value', this.streamTemp);
};

CrockPot.prototype.streamTemp = function(emitter) {
  this.tempEmitter = emitter;
};

CrockPot.prototype.turnOn = function(cb) {
  var self = this;
  client.startCook(function(err){
    if(err)
      return cb(err);

    
    self.state = 'on';
    cb();
  });
};

CrockPot.prototype.turnOff = function(cb) {
  var self = this;
  client.stopCook(function(err){
    if(err)
      return cb(err);

    self.state = 'off';
    cb();
  });
};

CrockPot.prototype.setLevel = function(value,cb) {
  var self = this;
  client.setCookTemp(value,function(err){
    if(err)
      return cb(err);
    return self._syncState(cb);
  });
};

CrockPot.prototype.setTime = function(value,cb) {
  var self = this;
  client.setCookTime(value,function(err){
    if(err)
      return cb(err);
    return self._syncState(cb);
  });
};

CrockPot.prototype.reset = function(cb) {
  client.resetDevice(cb);
};

CrockPot.prototype.state = function(cb) {
  this._syncState(cb);
};

CrockPot.prototype.lidOpened = function(cb) {
  return cb();
};

CrockPot.prototype.lidClosed = function(cb) {
  return cb();
};

CrockPot.prototype._syncState = function(cb) {
  var self = this;
  client.returnState(function(err,state) {
    if(err){
      this.state = 'offline';
      if(cb)
        cb(err);
      return;
    }

    extend(self.data,state);

    if(state.cooking){
      self.state = 'on';
    }else {
      self.state = 'off';
    }
    
    if(self.tempEmitter)
      self.tempEmitter.emit('data', self.data.currentTemp);

    if(cb)
      cb(null,state);
  });
};
