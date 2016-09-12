var LogstashClient = require('logstash-client');

function Logger(host, port) {
  this.client = new LogstashClient({
    type: 'udp',
    host: host,
    port: port
  });
}

Logger.prototype.info = function(message) {
  this.client.send({
    '@timestamp': new Date(),
    'message': message,
    'level': 'info'
  });
};

Logger.prototype.error = function(message) {
  this.client.send({
    '@timestamp': new Date(),
    'message': message,
    'level': 'error'
  });
};

module.exports = Logger;
