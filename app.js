var IntelliChili = module.exports = function() {
  this.name = 'intellichili';
};

IntelliChili.prototype.init = function(elroy) {

  elroy.observe('type="crockpot"').subscribe(function(err,crockpot){
    elroy.expose(crockpot);

    elroy.observe('type="huehub"').subscribe(function(err,hub){
      crockpot.on('lid-closed',function(){
        hub.call('blink');
      });

      crockpot.on('lid-closed',function(){
        hub.call('blink');
      });
    });

  });

};

