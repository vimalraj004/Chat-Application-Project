import React from 'react'
import style from "../CssFolder/Welcomepage.module.css"
import Commoncss from "../CssFolder/Commoncss.module.css" 
import bgimg from "../icons/aps_504x498_small_transparent-pad_600x600_f8f8f8.ico"
import { useNavigate } from 'react-router-dom'
import { useSelector } from "react-redux";
import {user} from "../common"

const Welcomepage = () => {
  const lighttheme = useSelector((state)=>state.themekey)
  let navigate = useNavigate()
  let userdata = user()
  if(!userdata){
    navigate("/")
  }
  return (
    <div className={`${style.welcomecontainer} ${!lighttheme ? Commoncss.dark:""}`}>
        <img src={bgimg} alt="applogo" className={style.welcomebgimg} />
        <p className={`${style.text} ${!lighttheme ? Commoncss.dark:""}`}>Welcome To  Tea kadai Talks {userdata?.data?.data?.name}</p>
      
    </div>
  )
}

export default Welcomepage
