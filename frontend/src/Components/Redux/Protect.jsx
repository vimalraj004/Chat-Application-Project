import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Protect = (x) => {
    let navigate  = useNavigate()
    let Data = x.data
    useEffect(()=>{
        let entry = localStorage.getItem("userdata")
        if(!entry){
            navigate("/")
        }
    })

  return (
    <>
    {Data}
    </>
      
  
  )
}

export default Protect
