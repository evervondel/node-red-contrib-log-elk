module.exports = function (RED) {
    "use strict";
    var debuglength = RED.settings.debugMaxLength || 1000;
    const safeJSONStringify = require("json-stringify-safe");

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
        var user = this.credentials.username || '';
        var pass = this.credentials.password || ''; 
        if (url) {
          transports.push(new winstonElasticSearch.ElasticsearchTransport({
            clientOpts: { 
              node: url,
              auth: {
                username: user,
                password: pass
              },
              ssl: {
                // accept any
                rejectUnauthorized: false
              }
            },
            transformer: transformer
          }));
        }
      }

      // File settings
      var fileLog = config.logfile;
      if (fileLog) {
        var filename = config.filename;
        if (filename) {
          var maxfiles = 1;
          var filesize = 1048576;
          if (config.maxsize >= 1) filesize = config.maxsize * 1048576;
          if (config.maxfiles >= 1) maxfiles = config.maxfiles;

          transports.push(new (winston.transports.File)({
            filename: filename,
            maxsize: filesize,
            maxFiles: maxfiles,
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

    function transformer(logData) {
      const transformed = {};
      transformed['@timestamp'] = logData.timestamp ? logData.timestamp : new Date().toISOString();
      transformed.message = logData.message;
      transformed.severity = logData.level;
      transformed.level = logData.level;
      transformed.fields = logData.meta;
    
      if (logData.meta['transaction.id']) transformed.transaction = { id: logData.meta['transaction.id'] };
      if (logData.meta['trace.id']) transformed.trace = { id: logData.meta['trace.id'] };
      if (logData.meta['span.id']) transformed.span = { id: logData.meta['span.id'] };
    
      return transformed;
    };


    function sendDebug(msg) {
      msg = RED.util.encodeObject(msg, {maxLength:debuglength});
      RED.comms.publish("debug",msg);
    }

    RED.nodes.registerType("log-elk-logger", LogElkLoggerNode,
    {
      credentials: {
          username: {type:"text"},
          password: {type:"password"}
      }
    });

    LogElkLoggerNode.prototype.addToLog = function addTolog(loglevel, msg, complete) {
      if (complete === true || complete === "complete" || complete === "true") {
        // Log complete message
        if (this.debugLog === true || this.debugLog === "true") {
          sendDebug({id: this.id, name: this.name, topic: msg.topic, msg: msg, _path: msg._path});
        }
        if (this.logger) {
          this.logger.log(loglevel, safeJSONStringify(msg), msg.meta);
        }
      }
      else if (complete !== undefined && complete !== null && complete !== "" && complete !== false && complete !== "false") {
        // Log part of message
        var output;
        try { output = RED.util.getMessageProperty(msg, complete); }
        catch(err) {
          node.error(err);
          return;
        }

        if (this.debugLog === true || this.debugLog === "true") {
          sendDebug({id: this.id, name: this.name, topic: msg.topic, msg: output, _path: msg._path});
        }
        if (this.logger) {
          if (typeof output === "string") {
            this.logger.log(loglevel, output, msg.meta);
          } else if (typeof output === "object") {
            this.logger.log(loglevel, safeJSONStringify(output), msg.meta);
          } else {
            this.logger.log(loglevel, safeJSONStringify(output), msg.meta);
          }
        }
      }
    }
  };