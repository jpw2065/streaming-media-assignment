const ms = require('./mediaStream');

class AudioStream extends ms {
  constructor(request, response) {
    super(request, response);

    this.contentType = 'audio/mpeg';
  }
}

module.exports = AudioStream;
