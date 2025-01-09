import style from "./CssFolder/App.module.css";
import Commoncss from "./CssFolder/Commoncss.module.css";
import Maincontainer from "./Components/Maincontainer";
import Loginpage from "./Components/Loginpage";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Welcomepage from "./Components/Welcomepage";
import Chatarea from "./Components/Chatarea";
import Usergroup from "./Components/Usergroup";
import Creategroupepage from "./Components/Creategroupepage";
import Onlineusers from "./Components/Onlineusers";
import { useSelector } from "react-redux";
import Protect from "./Components/Redux/Protect";

const App = () => {
  const lighttheme = useSelector((state) => state.themekey);
  return (
    <div className={`${style.app} ${!lighttheme ? Commoncss.dark : ""}`}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Loginpage />} />
          <Route path="home" element={<Protect data={<Maincontainer />} />}>
            <Route
              path="welcomepage"
              element={<Protect data={<Welcomepage />} />}
            />
            <Route
              path="chatarea/:_id"
              element={<Protect data={<Chatarea />} />}
            />
            <Route
              path="usergroup"
              element={<Protect data={<Usergroup />} />}
            />
            <Route
              path="onlineusers"
              element={<Protect data={<Onlineusers />} />}
            />
            <Route
              path="creategroupepage"
              element={<Protect data={<Creategroupepage />} />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
      {/* <Loginpage /> */}
      {/* <Maincontainer /> */}
    </div>
  );
};
export default App;
