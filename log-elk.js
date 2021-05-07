module.exports = function (RED) {
    "use strict";
  
    function LogElkNode(config) {
      RED.nodes.createNode(this, config);
      const node = this;

      this.logger = RED.nodes.getNode(config.logger);

      var complete = config.complete;
      var loglevel = config.loglevel || "debug";

      this.on('input', function(msg, send, done) {
        if (node.logger)
        {
          var level;
          if (loglevel === "error" || loglevel === "warn" || loglevel === "info" || loglevel === "debug") {
            // fixed level
            level = loglevel;
          } else {
            // get loglevel from message
            try { level = RED.util.getMessageProperty(msg, loglevel); }
            catch(err) {
              level = "debug";
            }
    
            if (!(level === "error" || level === "warn" || level === "info" || level === "debug")) {
              // invalid log level, default to debug
              level = "debug";
            }
          }

          node.logger.addToLog(level, msg, complete);
        }

        if (done) done();
      });
    }

    RED.nodes.registerType("log-elk", LogElkNode);
  };