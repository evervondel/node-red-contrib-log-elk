module.exports = function (RED) {
    "use strict";
    var debuglength = RED.settings.debugMaxLength || 1000;
    var util = require("util");

    function LogElkLoggerNode(config) {
      var winston = require('winston');
      var winstonElasticSearch  = require('winston-elasticsearch');

      RED.nodes.createNode(this, config);
      this.logger = null;
      var transports = [];

      const lineFormat = winston.format.printf( ({ level, message, timestamp , ...metadata}) => {
        let msg = `${timestamp} [${level}] ${message} `  
        if (metadata && Object.entries(metadata).length > 0) {
          msg += JSON.stringify(metadata)
        }
        return msg
      });
      

      // ELK settings
      var elkLog = config.logelk;
      if (elkLog) {
        var url = config.url;
        if (url) {
          transports.push(new winstonElasticSearch.ElasticsearchTransport({
            clientOpts: { node: url }
          }));
        }
      }

      // File settings
      var fileLog = config.logfile;
      if (fileLog) {
        var filename = config.filename;
        if (filename) {
          var maxFiles = 1;
          var filesize = 1073741824;
          if (config.maxsize >= 1) filesize = config.maxsize * 1073741824;
          if (config.maxFiles >= 1) maxfiles = config.maxFiles;

          transports.push(new (winston.transports.File)({
            filename: filename,
            maxsize: filesize,
            maxFiles: maxFiles,
            handleExceptions: true,
            format: winston.format.combine(winston.format.timestamp(), lineFormat)       
            })
          );
        }
      }    

      // Console settings
      var consoleLog = config.logconsole;
      if (consoleLog) {
        transports.push(new (winston.transports.Console)({
          handleExceptions: true,
          format: winston.format.combine(winston.format.timestamp(), lineFormat)       
        }));
      }

      this.debugLog = config.logdebug;

      if (elkLog || fileLog || consoleLog) {
        this.logger = new winston.createLogger({
        exitOnError: false,
        level: 'debug',
        transports: transports
        });

        this.debug("log-elk logger created");
      }

      this.on('close', function(removed, done) {
        // close logger
        if (this.loggger)
        {
          this.logger.close();
        }

        this.debug("log-elk logger closed");

        if (done) done();
      });
    }  

  
    function sendDebug(msg) {
      if (msg.msg instanceof Error) {
        msg.format = "error";
        msg.msg = msg.msg.toString();
      } else if (msg.msg instanceof Buffer) {
        msg.format = "buffer [" + msg.msg.length + "]";
        msg.msg = msg.msg.toString('hex');
      } else if (msg.msg && typeof msg.msg === 'object') {
        var seen = [];
        try {
          msg.format = msg.msg.constructor.name || "Object";
        } catch (err) {
          msg.format = "Object";
        }
        var isArray = util.isArray(msg.msg);
        if (isArray) {
          msg.format = "array [" + msg.msg.length + "]";
        }
        if (isArray || (msg.format === "Object")) {
          msg.msg = JSON.stringify(msg.msg, function (key, value) {
            if (typeof value === 'object' && value !== null) {
              if (seen.indexOf(value) !== -1) {
                return "[circular]";
              }
              seen.push(value);
            }
            return value;
          }, " ");
        } else {
          try {
            msg.msg = msg.msg.toString();
          }
          catch (e) {
            msg.msg = "[Type not printable]";
          }
        }
        seen = null;
      } else if (typeof msg.msg === "boolean") {
        msg.format = "boolean";
        msg.msg = msg.msg.toString();
      } else if (typeof msg.msg === "number") {
        msg.format = "number";
        msg.msg = msg.msg.toString();
      } else if (msg.msg === 0) {
        msg.format = "number";
        msg.msg = "0";
      } else if (msg.msg === null || typeof msg.msg === "undefined") {
        msg.format = (msg.msg === null) ? "null" : "undefined";
        msg.msg = "(undefined)";
      } else {
        msg.format = "string [" + msg.msg.length + "]";
        msg.msg = msg.msg;
      }
  
      if (msg.msg.length > debuglength) {
        msg.msg = msg.msg.substr(0, debuglength) + " ....";
      }
      RED.comms.publish("debug", msg);
    }
  

    RED.nodes.registerType("log-elk-logger", LogElkLoggerNode);

    LogElkLoggerNode.prototype.addToLog = function addTolog(loglevel, msg, complete) {
      if (complete === true || complete === "complete" || complete === "true") {
        if (this.debugLog === true || this.debugLog === "true") {
          sendDebug({id: this.id, name: this.name, topic: msg.topic, msg: msg, _path: msg._path});
        }
        if (this.logger) {
          this.logger.log(loglevel, JSON.stringify(msg));
        }
      }
      else if (complete !== undefined && complete !== null && complete !== "" && complete !== false && complete !== "false") {
        if (this.debugLog === true || this.debugLog === "true") {
          sendDebug({id: this.id, name: this.name, topic: msg.topic, msg: msg[complete], _path: msg._path});
        }
        if (this.logger) {
          this.logger.log(loglevel, JSON.stringify(msg[complete]));
        }
      }
    }
  };