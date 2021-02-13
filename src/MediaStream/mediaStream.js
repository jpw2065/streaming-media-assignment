const MediaFile = require('./mediaFile');

class MediaStream {
  constructor(request, response) {
    this.request = request;
    this.response = response;
  }

  streamFile(filePath) {
    this.createStreamInFileStats(new MediaFile(filePath));
  }

  createStreamInFileStats(mediaFile) {
    mediaFile.loadStats(this.setFileLoadError.bind(this), this.createStreamFromFile.bind(this));
  }

  createStreamFromFile(mediaFile) {
    const byteLoadRange = this.getPositionMetaDataFromRequest();
    mediaFile.setPositionMetaData(byteLoadRange);

    this.setResponseHeadersFromFile(mediaFile);
    const stream = this.createStreamFromMediaFile(mediaFile);

    return stream;
  }

  createStreamFromMediaFile(mediaFile) {
    // Get the data from the file between the start and the end
    const stream = mediaFile.createReadStream();
    this.bindStreamOnOpenEvent(stream);
    this.bindStreamOnErrorEvent(stream);

    return stream;
  }

  getPositionMetaDataFromRequest() {
    const position = this.getRangeFromRequestHeaders();
    return position;
  }

  getRangeFromRequestHeaders() {
    let { range } = this.request.headers;

    if (!range) {
      range = 'bytes=0-';
    }

    return range.replace(/bytes=/, '').split('-');
  }

  setResponseHeadersFromFile(mediaFile) {
    // Write important repsonse data to the header.
    this.response.writeHead(206, {
      'Content-Range': mediaFile.getContentRangeHeader(),
      'Accept-Range': 'bytes',
      'Content-Length': mediaFile.getChunkSize(),
      'Content-Type': this.contentType,
    });
  }

  setFileLoadError(err) {
    if (err === 'ENOENT') this.response.writeHead(404);
    return this.response.end(err);
  }

  bindStreamOnOpenEvent(stream) {
    stream.on('open', () => {
      stream.pipe(this.response);
    });
  }

  bindStreamOnErrorEvent(stream) {
    stream.on('error', (streamErr) => {
      this.response.end(streamErr);
    });
  }
}

module.exports = MediaStream;
