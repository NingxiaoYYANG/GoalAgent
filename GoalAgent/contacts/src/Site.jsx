import React from "react";
import {
  Routes,
  Route,
  useNavigate,
  Link
} from 'react-router-dom';

import Web3 from "web3";

// Components
import Welcome from "./components/Welcome";
import BigButton from "./components/BigButton";
import logo from "./Background/Skillverse.png";
import profile from "./Background/profile.png";
import Output from './pages/Output.jsx';
import Input from './pages/Input.jsx';

import './Site.css'

function Site() {
  const [userWalletAddress, setUserWalletAddress] = React.useState(null);
  const [web3, setWeb3] = React.useState(null);
  const [userInput, setUserInput] = React.useState(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const hasInput = localStorage.getItem('userInput');

    if (hasInput) {
      setUserInput(hasInput);
    }

    async function load() {
      if (window.ethereum) {
        setWeb3(new Web3(window.ethereum));
      } else {
        alert("Please install MetaMask or any Ethereum Extension Wallet");
      }

      const storedAddress = window.localStorage.getItem("userWalletAddress");
      setUserWalletAddress(storedAddress);
      showUserDashboard();
    }

    load();
  }, []);

  const loginWithEth = async () => {
    try {
      if (web3) {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const selectedAccount = accounts[0];

        setUserWalletAddress(selectedAccount);
        window.localStorage.setItem("userWalletAddress", selectedAccount);

        showUserDashboard();
      } else {
        alert("Wallet not found");
      }
    } catch (error) {
      alert(error);
    }
  };

  const logout = () => {
    setUserWalletAddress(null);
    window.localStorage.removeItem("userWalletAddress");
    showUserDashboard();
  };

  const showUserDashboard = async () => {
    if (!userWalletAddress) {
      document.title = "Web3 Login";
      return;
    }

    document.title = "Web3 Dashboard";
  };

  const monsterInputBtn = () => {
    navigate('/monster-input');
  }
  
  return (
    <div className="site-container">
      <nav className="navbar">
        <div className="navbar-content">
          <Link to="/" className="logo">
            <img src={logo} alt="Skillverse Logo" className="logo" />
          </Link>
          <div className="nav-links">
            <Link to="/about" className="about">ABOUT US</Link>
            <Link to="/features" className="features">FEATURES</Link>
            <Link to="/premium" className="premium">PREMIUM</Link>
          </div>
          <div className="user-section">
            {userWalletAddress ? (
              <div className="user-info">
                <img src={profile} alt="Profile" className="profile" />
                <BigButton className="logout-btn" onClick={logout}>DISCONNECT</BigButton>
              </div>
            ) : (
              <BigButton className="login-btn" onClick={loginWithEth}>CONNECT A WALLET</BigButton>
            )}
          </div>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<Welcome monsterInputBtnFn={monsterInputBtn} userConnected={userWalletAddress} />} />
        <Route path='/monster-output' element={<Output userInput={userInput} userWalletAddress={userWalletAddress} />} />
        <Route path='/monster-input' element={<Input setUserInputFn={setUserInput} />} />
      </Routes>
    </div>
  );
}

export default Site;
