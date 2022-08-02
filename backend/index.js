const express = require("express")
const app = express()
const port = 5000
const fs = require('fs')
const cors = require('cors');
app.use(express.json())
app.use(cors({ origin: true }));

/* Store the converted result into an array */
let csvToJsonResult = [];
let error = ""

function jsonCreator(year,month,date) {
    const path = `/home/pi/asRun_National_Data/evo/Report/${year}/${month}/${date}`
    let fileObjs
    if(fs.existsSync(path)) {
        fileObjs = fs.readdirSync(path, { withFileTypes: true })
    }
    else {
        error = "File not found"
    }
    if(fileObjs?.length > 0) {
        fileObjs.forEach((obj)=>{
            let fileName = obj.name
            let csv = fs.readFileSync(`/home/pi/asRun_National_Data/evo/Report/${year}/${month}/${date}/${fileName}`)
            const array = csv.toString().split("\n");
            array.forEach((dt)=>{ 
                if (dt) {
                    const jsonObject = {}
                    let data = JSON.stringify(dt).split(',')
                    jsonObject["start_datetime"] = data[0].slice(1)
                    jsonObject["end_datetime"] = data[1]
                    jsonObject["campaign"] = data[2]
                    jsonObject["asset"] = data[3]
                    jsonObject["impression"] = parseInt(data[4])
                    csvToJsonResult.push(jsonObject)
                }
            })
        })
    }
    return csvToJsonResult
}

app.get('/',(req,res)=>{
    res.send("staring my server")
})

app.get('/jsonData',(req,res)=>{
    let response = csvToJsonResult
    res.json(response)
})

app.post('/jsonData',(req,res)=>{
    csvToJsonResult = [];
    const body = req.body
    let details = body?.date?.split("-")
    jsonCreator(details[0],details[1],details[2])
    date = String(body.date)
    let futureDate = new Date(date)
    futureDate.setDate(futureDate.getDate()+1)
    fd = futureDate.toISOString().split("T")[0]
    fd = fd.split("-")
    jsonCreator(fd[0],fd[1],fd[2])
    res.json(csvToJsonResult)
})

app.listen(port,()=>{
    console.log("server is running in the port",port);
})