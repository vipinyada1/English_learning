const request = require("request");
const fs = require("fs");
var subscriptionKey = "dd3d283b4c524a63adda8b8608c5830d" // replace this with your subscription key
var region = "centralindia" ;
module.exports=async function (referenceText,fileName,response){
    // var referenceText = "hello";
var pronAssessmentParamsJson = `{"ReferenceText":"${referenceText}","GradingSystem":"HundredMark","Dimension":"Comprehensive"}`;
var pronAssessmentParams = Buffer.from(pronAssessmentParamsJson, 'utf-8').toString('base64');

// build request
var options = {
    method: 'POST',
    baseUrl: `https://${region}.stt.speech.microsoft.com/`,
    url: 'speech/recognition/conversation/cognitiveservices/v1?language=en-us',
    headers: {
        'Accept': 'application/json;text/xml',
        'Connection': 'Keep-Alive',
        'Content-Type': 'audio/wav; codecs=audio/pcm; samplerate=16000',
        'Transfer-Encoding': 'chunked',
        'Expect': '100-continue',
        'Ocp-Apim-Subscription-Key': subscriptionKey,
        'Pronunciation-Assessment': pronAssessmentParams
    }
};

var uploadFinishTime;

var req = request.post(options);
 req.on("response", (resp) => {
    resp.on("data", (chunk) => {
        var result = chunk.toString('utf-8');
        // console.log("Pronunciation assessment result:\n");
        var res=JSON.parse(result)
        // console.log(res); // the result is a JSON string, you can parse it with JSON.parse() when consuming it
        var getResponseTime = Date.now();
        console.log(`\nLatency = ${getResponseTime - uploadFinishTime}ms`);
        response.status(200).json(res);
    });
});
// a common wave header, with zero audio length
// since stream data doesn't contain header, but the API requires header to fetch format information, so you need post this header as first chunk for each query
// const waveHeader16K16BitMono = Buffer.from([82, 73, 70, 70, 78, 128, 0, 0, 87, 65, 86, 69, 102, 109, 116, 32, 18, 0, 0, 0, 1, 0, 1, 0, 128, 62, 0, 0, 0, 125, 0, 0, 2, 0, 16, 0, 0, 0, 100, 97, 116, 97, 0, 0, 0, 0]);
// req.write(waveHeader16K16BitMono);

// send request with chunked data
var audioStream = fs.createReadStream("voices/"+fileName, { highWaterMark: 1024 });
audioStream.on("data", (data) => {
    sleep(data.length / 32); // to simulate human speaking rate
});
audioStream.on("end", () => {
    uploadFinishTime = Date.now();
});

audioStream.pipe(req);

function sleep(milliseconds) {
    var startTime = Date.now();
    var endTime = Date.now();
    while (endTime < startTime + milliseconds) {
        endTime = Date.now();
    }
}
}
