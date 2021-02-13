const fs = require('fs'); // pull in the file system module
const path = require('path');

class MediaFile {
  constructor(filePath) {
    this.loadFile(filePath);
  }

  loadFile(filePath) {
    this.file = path.resolve(__dirname, filePath);
  }

  loadStats(errorClosue, successClosure) {
    fs.stat(this.file, (err, stats) => {
      if (err) {
        errorClosue(err);
      } else {
        this.total = stats.size;
        successClosure(this);
      }
    });
  }

  createReadStream() {
    const { start } = this;
    const { end } = this;

    const stream = fs.createReadStream(this.file, { start, end });

    return stream;
  }

  setPositionMetaData(position) {
    let start = parseInt(position[0], 10);
    const end = position[1] ? parseInt(position[1], 10) : this.total - 1;

    if (start > end) {
      start = end - 1;
    }

    this.start = start;
    this.end = end;
  }

  getChunkSize() {
    return (this.end - this.start) + 1;
  }

  getContentRangeHeader() {
    return `bytes ${this.start}-${this.end}/${this.total}`;
  }
}

module.exports = MediaFile;
