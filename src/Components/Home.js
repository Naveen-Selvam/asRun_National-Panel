import React,{useEffect, useState} from 'react'
import moment from "moment"
import axios from "axios"
import pic from "/home/pi/reporting_app/report/src/Synamedia_Iris_logo_white_RGB.jpg"
import swal from 'sweetalert'

const Home = () => {
  const [date,setDate] = useState(moment().format("YYYY-MM-DD"))
  const [toggle, setToggle] = useState(false)
  const [startTime, setStartTime] = useState("00:01")
  const [endTime, setEndTime] = useState(moment().format("hh:mm"))
  const [uniqueObjData, setUniqObjData] = useState({})
  const [displayData, setDisplayData] = useState({})
  const [specifiedData, setSpecifiedData]= useState([])
  let btnDisplay = false
 
  useEffect(()=>{
    let selectedDate = {"date" : date}
    const obj = {
      date: date,
      startTime: startTime,
      endTime: endTime
    }
    axios.post("http://10.1.150.181:5000/jsonData",selectedDate)
    .then((res)=>{
      setToggle(true)
      specificDataCollector(res.data)
      setDisplayData(obj)
    })
    .catch((err)=>{
      console.log(err.message);
    })
  },[])

  const handleDate = (e) =>{
    setDate(e.target.value)
    if(e.target.value === moment().format("YYYY-MM-DD")){
      setStartTime("00:01")
      setEndTime(moment().format("hh:mm"))
    }
    else {
      setStartTime("00:01")
      setEndTime("23:59")
    }
  }

  const uniqueObjectCreator = (specificData) =>{
    let uniqueObject ={}
    specificData?.forEach((ele)=>{
      if(uniqueObject.hasOwnProperty(ele.campaign)){
        uniqueObject[ele.campaign][1] = uniqueObject[ele.campaign][1] + ele.impression
        uniqueObject[ele.campaign][0] = ele.asset
      }
      else {
        uniqueObject[ele.campaign] = [ele.asset,ele.impression]
      }
    })
    setUniqObjData(uniqueObject)
  }

  const specificDataCollector = (datas) => {
    let arrData = []
    datas?.forEach((data) => {
      let sd = data.start_datetime.split("T")[0].split(".")[0]
      let ed = data.end_datetime.split("T")[0].split(".")[0]
      let st = data.start_datetime.split("T")[1].split(".")[0]
      if(sd === date && ed === date){
        if((st >= startTime) && (st <= endTime))
        arrData.push(data)
      }
    });
    setSpecifiedData(arrData)
    uniqueObjectCreator(arrData)
  }

  const handleStartTime =(e) =>{
    setStartTime(e.target.value)
  }

  const handleEndTime = (e) => {
    setEndTime(e.target.value)
  }

  const handleSubmit = (e) =>{
    const obj = {
      date: date,
      startTime: startTime,
      endTime: endTime
    }
    e.preventDefault()
    const dateSelected = {"date" : date}
    axios.post("http://10.1.150.181:5000/jsonData",dateSelected)
    .then((res)=>{
      setUniqObjData({})
      setSpecifiedData([])
      specificDataCollector(res.data)
      setDisplayData(obj)
    })
    .catch((err)=>{
      console.log(err.message);
    })
  }

  if(startTime > endTime){
    swal("Warning!", "Please Check your Timings (from - to)", "warning");
    btnDisplay = true
  }else {
    btnDisplay = false
  }

  return (
    <div>
        <div className="p-3 mb-2 bg-dark text-white">
          <div className="d-flex ">
            <img src={pic} style={{width: "120px"}}/>
            <div className="p-2 flex-fill" >
              <h6 className="text-center" style={{paddingRight:"120px"}}>AsRun-National Panel Impression Reporting Tool - E2E HE</h6>
            </div>
          </div>
        </div>
        <div className="d-flex ">
          <div className="p-2">
            <form onSubmit={handleSubmit}>
              <span>Date:</span> <input className="w-30 p-1 m-1 form-control" type="date" onChange={handleDate} value={date} min="2022-04-03" max={moment().format("YYYY-MM-DD")} required/> <br />
              <span>From:</span> <input className="w-30 p-1 m-1 form-control" type="time" onChange={handleStartTime} value={startTime} min="0:01"/> <br />
              <span>To:</span> <input className="w-30 p-1 m-1 form-control" type="time" onChange={handleEndTime} value={endTime} max="23:59" /> <br />
              <button  className="btn btn-primary mt-3" disabled={btnDisplay}>Submit</button>
            </form>
          </div>
          <div className="p-2 flex-fill ">
            {
              toggle && 
              <div className='w-50 col-md-5 offset-md-2 text-center'>
                  <h5>
                  <span className=" m-2"> Date : </span>
                  <span className=" p-0.8" style={{backgroundColor:"#61bba5", borderRadius:"5px"}}>{displayData.date}</span>
                  <span className=" m-2"> Time : </span>
                  <span className=" p-0.8" style={{backgroundColor:"#61bba5", borderRadius:"5px"}}>{displayData.startTime}</span> 
                  <span> - </span>
                  <span className=" p-0.8" style={{backgroundColor:"#61bba5",  borderRadius:"5px"}}>{displayData.endTime}</span>
                  </h5>
                <table className="table table-bordered">
                  <thead className="table-dark">
                    <tr>
                      <th scope="col">Campaign</th>
                      <th scope="col">Asset</th>
                      <th scope="col">Impression</th>
                    </tr>
                  </thead>
                  {Object.keys(uniqueObjData).length === 0 && <h5 className="text-danger m-1">Data unavailable</h5>}
                  <tbody>
                    {
                      Object.keys(uniqueObjData)?.map((camp)=>{
                        return(
                          <tr key={camp} scope="row">
                            <td colSpan="1">{camp}</td>
                            <td>{uniqueObjData[camp][0]}</td>
                            <td >{uniqueObjData[camp][1]}</td>
                          </tr>
                        )
                      })
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
      </div>
    </div>
  )
}

export default Home