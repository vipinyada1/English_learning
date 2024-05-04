const express=require('express');
const bodyParser=require('body-parser');
const multer = require('multer');
const checkAccuracy=require("./speechRecog");
const app=express();
const fileStorageEngine=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,"./voices")
    },
    filename:(req,file,cb)=>{
        cb(null,file.originalname);
    },
});
const upload = multer({storage:fileStorageEngine});
const cors=require('cors')
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.post('/',upload.single("audio_data"),async (req,res)=>{
    console.log(req.file);
    let result=await checkAccuracy(req.body.word,req.file.originalname,res);
     console.log(result);
})
app.listen(3000,()=>{
    console.log("server is running");
})