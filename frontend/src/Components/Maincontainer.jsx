import { createContext, React, useState } from "react";
import style from "../CssFolder/Maincontainer.module.css";
import Sidebar from "./Sidebar";
import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";

export const myContext = createContext();
const Maincontainer = () => {
  const [refresh, setrefresh] = useState(false);
  const lighttheme = useSelector((state) => state.themekey);
  return (
    <div className={`${style.maincontainer} ${!lighttheme ? style.dark : ""}`}>
      <myContext.Provider value={{ refresh: refresh, setrefresh: setrefresh }}>
        <Sidebar />

        <Outlet />
      </myContext.Provider>
    </div>
  );
};

export default Maincontainer;
