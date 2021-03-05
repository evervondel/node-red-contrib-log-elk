module.exports = function (RED) {
    "use strict";
  
    function LogElkNode(config) {
      RED.nodes.createNode(this, config);
      const node = this;

      this.logger = RED.nodes.getNode(config.logger);

      var complete = config.complete;
      var loglevel = config.loglevel;
 
      this.on('input', function (msg) {
        if (node.logger)
        {
          node.logger.addToLog(loglevel, msg, complete);
        }
      });
    }

    RED.nodes.registerType("log-elk", LogElkNode);
  };