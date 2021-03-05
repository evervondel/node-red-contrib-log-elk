const winston = require('winston');
const winstonElasticSearch  = require('winston-elasticsearch');

const lineFormat = winston.format.printf( ({ level, message, timestamp , ...metadata}) => {
  let msg = `${timestamp} [${level}] ${message} `  
  if (metadata && Object.entries(metadata).length > 0) {
	  msg += JSON.stringify(metadata)
  }
  return msg
});


const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winstonElasticSearch.ElasticsearchTransport({
      level: 'info',
      clientOpts: { node: 'http://localhost:9200' }
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({ //we also log to console if we're not in production
    format: winston.format.combine(
      winston.format.timestamp(),
      lineFormat)
  }));
}

const miauwkes = { source: 'the one', line: 11};

logger.info("json test", miauwkes);

setInterval(function () {
  // logger.log('info', 'Hello distributed log files!');
  // logger.log('info', 'Hello distributed log files 222');
  logger.log('error', 'Hello again distributed logs');
  logger.warn("127.0.0.1 - there's no place like home");
}, 5000);



