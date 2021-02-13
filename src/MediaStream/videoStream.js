const ms = require('./mediaStream');

class VideoStream extends ms {
  constructor(request, response) {
    super(request, response);

    this.contentType = 'video/mp4';
  }
}

module.exports = VideoStream;
