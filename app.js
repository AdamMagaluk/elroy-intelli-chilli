var Nightlight = require('./nightlight');

var HelloApp = module.exports = function() {
  this.name = 'hello';
};

HelloApp.prototype.init = function(elroy) {

  var crockpot = null;
  var huehub = null;

  var self = this;
  elroy.on('deviceready',function(device){
    if(device.type === 'crockpot'){
      crockpot = device;
      elroy.expose(device);
      crockpot.on('state',function(state){
        console.log(state);
      })
    }

    if(device.type === 'huehub'){
      huehub = device;
    }

    if(huehub && crockpot){
      crockpot.on('lid-opened',function(){
        huehub.call('blink');
      });

      crockpot.on('lid-closed',function(){
        huehub.call('blink');
      });
    }

  });
};

