const VideoStream = require('./MediaStream/videoStream');
const AudioStream = require('./MediaStream/audioStream');

const getParty = (request, response) => {
  const videoStream = new VideoStream(request, response);
  videoStream.streamFile('../../client/party.mp4');
};

const getBling = (request, response) => {
  const audioStream = new AudioStream(request, response);
  audioStream.streamFile('../../client/bling.mp3');
};

const getBird = (request, response) => {
  const videoStream = new VideoStream(request, response);
  videoStream.streamFile('../../client/bird.mp4');
};

module.exports.getParty = getParty;
module.exports.getBling = getBling;
module.exports.getBird = getBird;
