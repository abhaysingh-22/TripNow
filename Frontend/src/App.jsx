import React, { useContext } from "react";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import UserLogin from "./pages/UserLogin";
import UserSignup from "./pages/UserSignup";
import UserLogout from "./pages/UserLogout";
import Captainlogin from "./pages/Captainlogin";
import CaptainLogout from "./pages/CaptainLogout";
import CaptainSignup from "./pages/CaptainSignup";
import Start from "./pages/Start";
import UserProtectedWrapper from "./pages/UserProtectedWrapper";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/signup" element={<UserSignup />} />
        <Route path="/logout" element={<UserLogout />} />
        <Route path="/captain-login" element={<Captainlogin />} />
        <Route path="/captain-logout" element={<CaptainLogout />} />
        <Route path="/captain-signup" element={<CaptainSignup />} />
        <Route
          path="/home"
          element={
            <UserProtectedWrapper>
              <Home />
            </UserProtectedWrapper>
          }
        />
        <Route path="/users/logout" element={
          <UserProtectedWrapper>
            <UserLogout />
          </UserProtectedWrapper>
        } />
      </Routes>
      {/* <div className="bg-gray-800 text-white p-4 rounded">Hello world!</div> */}
    </>
  );
}

export default App;
