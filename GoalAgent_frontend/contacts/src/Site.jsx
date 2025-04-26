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
import logo from "./Background/Goalagent.png";
import profile from "./Background/profile.png";
import Output from './pages/Output.jsx';
import Input from './pages/Input.jsx';
import Quiz from './pages/Quiz.jsx';
import Questionnaire from './pages/Questionnaire.jsx';
import CategorySelection from './pages/CategorySelection.jsx';
import CareerSelection from './pages/CareerSelection.jsx';

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
    navigate('/quiz');
  }
  
  return (
    <div className="site-container">
      <nav className="navbar">
        <div className="navbar-content">
          <Link to="/" className="logo">
            <img src={logo} alt="Goalagent Logo" className="logo" />
          </Link>
          <div className="nav-links">
            <Link to="/about" className="about">ABOUT US</Link>
            <Link to="/features" className="features">FEATURES</Link>
            <Link to="/premium" className="premium">PREMIUM</Link>
          </div>
          <div className="user-section">
            {userWalletAddress ? (
              <>
                <img src={profile} alt="Profile" className="profile" />
                <span className="wallet-address">
                  {userWalletAddress.slice(0, 6)}...{userWalletAddress.slice(-4)}
                </span>
                <button onClick={logout} className="logout-btn">Logout</button>
              </>
            ) : (
              <button onClick={loginWithEth} className="login-btn">Login with ETH</button>
            )}
          </div>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<Welcome userConnected={true} monsterInputBtnFn={monsterInputBtn} />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/questionnaire" element={<Questionnaire />} />
        <Route path="/category-selection" element={<CategorySelection />} />
        <Route path="/career-selection/:category" element={<CareerSelection />} />
        <Route path="/input" element={<Input />} />
        <Route 
          path="/output" 
          element={
            userWalletAddress ? (
              <Output userWalletAddress={userWalletAddress} />
            ) : (
              <div className="wallet-required">
                <h2>Wallet Connection Required</h2>
                <p>Please connect your wallet to view your career path.</p>
                <button onClick={loginWithEth} className="login-btn">Connect Wallet</button>
              </div>
            )
          } 
        />
      </Routes>
    </div>
  );
}

export default Site;
