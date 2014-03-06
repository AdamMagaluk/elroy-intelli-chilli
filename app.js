var ug = require('usergrid');

var client = new ug.client({
  orgName:'mdobson',
  appName:'sandbox'
});

function logEvent(data, event) {
  var opts = {
    type:'logs',
    data: data,
    event: event
  };

  client.createEntity(opts, function(){});
}


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
      crockpot.call('state');

      crockpot.on('state',function(state){
        logEvent(state.currentTemp, 'temperature');
      });

      ['turn-on','turn-off','set-time','set-level','reset'].forEach(function(e){
        crockpot.on(e,function(){
         logEvent(e, 'transition');
        });
      });

    }

    if(device.type === 'huehub'){
      huehub = device;
    }

    if(huehub && crockpot){
      crockpot.on('lid-opened',function(){
        huehub.call('blink');
        logEvent('lid-opened', 'event');
      });

      crockpot.on('lid-closed',function(){
        huehub.call('blink');
        logEvent('lid-closed', 'event');
      });
    }

  });
};

