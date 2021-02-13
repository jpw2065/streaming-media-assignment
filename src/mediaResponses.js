const fs = require('fs'); // pull in the file system module
const path = require('path');


const getParty = (request, response) => {

    let videoStream = new VideoStream(request, response);
    videoStream.streamFile('../client/party.mp4');

};

const getBling = (request, response) => {

    let audioStream = new AudioStream(request, response);
    audioStream.streamFile('../client/bling.mp3');

};

const getBird = (request, response) => {
    let videoStream = new VideoStream(request, response);
    videoStream.streamFile('../client/bird.mp4');
};


class MediaFile{


    constructor(filePath){

        this.file = this.loadFile(filePath);

    }

    loadFile(filePath)
    {
        return path.resolve(__dirname, filePath);
    }

    loadStats(closure){

        fs.stat(this.file, (err, stats) =>{
            this.total = stats.size;

            closure(err);
        })

    }

    checkFileOpenedSuccesfully(err){
        if(err) return true;
        return false;
    }

    checkIfFileCouldNotBeFound(err){
        if(err == "ENOENT") return true;
        return false;
    }

    createReadStream(){
        let start = this.start;
        let end = this.end;

        const stream = fs.createReadStream(this.file, { start, end });

        return stream;
    }

    setPositionMetaData(position)
    {

        let start = parseInt(position[0], 10);
        const end = position[1] ? parseInt(position[1], 10) : this.total - 1;

        if(start > end) {
            start = end - 1;
        }

        this.start = start;
        this.end = end;

    }

    getChunkSize()
    {
        return (this.end - this.start) + 1;
    }

    getContentRangeHeader()
    {
        return `bytes ${this.start}-${this.end}/${this.total}`;
    }

}

class MediaStream{


    constructor(request, response){

        this.request = request;
        this.response = response;

    }

    streamFile(filePath)
    {
        this.createStreamInFileStats(new MediaFile(filePath));
    }


    createStreamInFileStats(mediaFile)
    {
        mediaFile.loadStats((err) =>{

            if(mediaFile.checkFileOpenedSuccesfully(err))
            {
                if(mediaFile.checkIfFileCouldNotBeFound(err)) this.response.writeHead(404);
                return this.response.end(err);
            }
            else
            {
                let byteLoadRange = this.getPositionMetaDataFromRequest();
                mediaFile.setPositionMetaData(byteLoadRange);

                this.setResponseHeadersFromFile(mediaFile);
                const stream = this.createStreamFromMediaFile(mediaFile);

                return stream;
            }
            
        });
    }

    createStreamFromMediaFile(mediaFile){

        // Get the data from the file between the start and the end
        const stream = mediaFile.createReadStream();
        this.bindStreamOnOpenEvent(stream);
        this.bindStreamOnErrorEvent(stream);

        return stream;
    }


    getPositionMetaDataFromRequest()
    {
        let position = this.getRangeFromRequestHeaders();
        return position;
    }

    getRangeFromRequestHeaders()
    {

        let { range } = this.request.headers;

        if(!range)
        {
            range = 'bytes=0-'
        }

        return range.replace(/bytes=/, '').split('-');
    }


    setResponseHeadersFromFile(mediaFile){

        // Write important repsonse data to the header.
        this.response.writeHead(206, {
            'Content-Range' : mediaFile.getContentRangeHeader(),
            'Accept-Range'  : `bytes`,
            'Content-Length': mediaFile.getChunkSize(),
            'Content-Type'  : this.contentType
        });

    }

    bindStreamOnOpenEvent(stream)
    {
        stream.on('open', ()=>{
            stream.pipe(this.response);
        });
    }

    bindStreamOnErrorEvent(stream)
    {
        stream.on('error', (streamErr) => {
            this.response.end(streamErr);
        });
    }

}

class AudioStream extends MediaStream{

    constructor(request, response){
        super(request, response);
        
        this.contentType = "audio/mpeg"
    }

}


class VideoStream extends MediaStream{

    constructor(request, response){
        super(request, response);
        
        this.contentType = "video/mp4"
    }

}

module.exports.getParty = getParty;
module.exports.getBling = getBling;
module.exports.getBird = getBird;


