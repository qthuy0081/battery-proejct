
import './App.css'
import './dark.css'
import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import BatteryStatus from './pages/BatteryStatus'

const W3CWebsocket = require('websocket').w3cwebsocket
const client = W3CWebsocket('ws://localhost:8080/', 'echo-protocol') 
function App() {
  const { register, handleSubmit } = useForm()
  const [batteryPercent, setBatteryPercent] = useState(0.10)
  const onSubmit = async data => {
    console.log(data.dataFile[0])
    const fileName = data.dataFile[0].name
    const xhr = new XMLHttpRequest()
    const url = `http://localhost:8080/api/get-signed-url?fileName=${fileName}`
    makeRequest('GET', url).then(res => {
      console.log(res)
      const json = JSON.parse(res)
      const signedUrl = json.signedUrl
      console.log(signedUrl)
      makeRequest('PUT', signedUrl, data.dataFile[0],true)
    }).then(()=> {
      client.send('GetResult')
    }).catch(console.error)
  }

  useEffect(()=> {
    client.onopen = () => {
      console.log('Connected server.')
    }
    client.onmessage = (message) => {
      console.log(message.data)
      if(typeof message.data === 'string') {
        setBatteryPercent(message.data)
      }
    }
    
  },[])
  return (
    <>
    <BatteryStatus percent={batteryPercent} />
    <form onSubmit={handleSubmit(onSubmit)} className="text-center">
      <input {...register('dataFile', { required: true })} type="file" />
       <button>Submit</button>
     </form>
    </>
  )
}
function makeRequest(method, url, data = '', cloud_storage = false) {

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {

      if (xhr.readyState === 4) {
        resolve(xhr.responseText)
      }

    }
    xhr.open(method, url, true)
    if (cloud_storage) {
      xhr.setRequestHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    }
    xhr.send(data)
  })

}
export default App
