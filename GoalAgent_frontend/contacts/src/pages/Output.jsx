import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import '../pages/Output.css';
import skillIcon from '../Monster/purple_icon.png';
import learnIcon from '../Monster/red_icon.png';
import iniEgg from '../Monster/egg.png';
import Open from '../Background/Open.png';  
import Loading from '../Background/loading.gif';
import monsterNFT from '../Monster/AIGC-image-Goalagent/robotic_white.png';
import BigButton from '../components/BigButton';
import Tree from 'react-d3-tree';

// web3 related
import { ethers } from 'ethers';
import AIGC_NFT_ABI from '../contractABI/AIGC_NFT_ABI.json';

const Output = ({ userWalletAddress }) => {
  const [careerPlan, setCareerPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedNodes, setCompletedNodes] = useState({});
  const [isCollected, setIsCollected] = useState(false);
  const [isStudyProgressOpen, setIsStudyProgressOpen] = useState(false);
  const [unlockProgress, setUnlockProgress] = useState(0);
  const [walletConnected, setWalletConnected] = useState(false);
  const [userData, setUserData] = useState({
    questionnaire: null,
    category_scores: null,
    category_selection: null,
    career_selection: null,
    userInput: null
  });

  // For connecting to NFT solidity contract
  const contractAddress = '0x31e6c3b577a73afb176d925c7a6319c40128fc27';

  useEffect(() => {
    // Debug: Log all localStorage data
    console.log('=== Debug: LocalStorage Data ===');
    console.log('userWalletAddress:', userWalletAddress);
    
    // Load all user data from localStorage
    const storedData = {
      careerPlan: localStorage.getItem('careerPlan'),
      nodeCompletion: localStorage.getItem('nodeCompletion'),
      questionnaire: localStorage.getItem('questionnaire'),
      category_scores: localStorage.getItem('category_scores'),
      category_selection: localStorage.getItem('category_selection'),
      career_selection: localStorage.getItem('career_selection'),
      userInput: localStorage.getItem('userInput')
    };
    
    console.log('careerPlan:', storedData.careerPlan);
    console.log('nodeCompletion:', storedData.nodeCompletion);
    console.log('questionnaire:', storedData.questionnaire);
    console.log('category_scores:', storedData.category_scores);
    console.log('category_selection:', storedData.category_selection);
    console.log('career_selection:', storedData.category_selection);
    console.log('userInput:', storedData.userInput);
    console.log('================================');
    
    // Parse and set user data
    const parsedData = {};
    Object.keys(storedData).forEach(key => {
      if (storedData[key]) {
        try {
          parsedData[key] = JSON.parse(storedData[key]);
        } catch (e) {
          console.error(`Error parsing ${key}:`, e);
          parsedData[key] = null;
        }
      } else {
        parsedData[key] = null;
      }
    });
    
    setUserData(parsedData);
    console.log('Parsed user data:', parsedData);

    // Check if wallet is connected
    const checkWalletConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setWalletConnected(true);
            console.log('Wallet connected:', accounts[0]);
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };

    checkWalletConnection();
  }, [userWalletAddress]);

  useEffect(() => {
    // Load career plan and completion status from localStorage
    const savedPlan = localStorage.getItem('careerPlan');
    const savedCompletion = localStorage.getItem('nodeCompletion');
    
    // Debug: Log parsed data
    console.log('=== Debug: Parsed Data ===');
    if (savedPlan) {
      const parsedPlan = JSON.parse(savedPlan);
      console.log('Parsed careerPlan:', parsedPlan);
      
      // Transform the career plan into a proper tree structure
      const treeStructure = transformCareerPlanToTree(parsedPlan);
      console.log('Transformed tree structure:', treeStructure);
      
      setCareerPlan(treeStructure);
    } else {
      // Create a default career plan if none exists
      const defaultPlan = createDefaultCareerPlan();
      console.log('Default careerPlan:', defaultPlan);
      setCareerPlan(defaultPlan);
    }
    
    if (savedCompletion) {
      const parsedCompletion = JSON.parse(savedCompletion);
      console.log('Parsed nodeCompletion:', parsedCompletion);
      setCompletedNodes(parsedCompletion);
    }
    console.log('===========================');
    
    setLoading(false);
  }, []);

  // Transform career plan into a proper tree structure for react-d3-tree
  const transformCareerPlanToTree = (plan) => {
    if (!plan) return createDefaultCareerPlan();
    
    // Create a deep copy of the plan
    const treeStructure = JSON.parse(JSON.stringify(plan));
    
    // Process each year node
    if (treeStructure.children) {
      treeStructure.children = treeStructure.children.map(year => {
        // Create a new year node with proper structure
        const yearNode = {
          id: year.id,
          name: year.name,
          description: year.description,
          children: []
        };
        
        // Add milestones as children of the year node
        if (year.milestones && year.milestones.length > 0) {
          yearNode.children = year.milestones.map(milestone => ({
            id: milestone.id,
            name: milestone.name,
            description: milestone.description,
            skills: milestone.skills,
            resources: milestone.resources,
            achievements: milestone.achievements,
            children: milestone.children || [] // Include skill children if they exist
          }));
        }
        
        return yearNode;
      });
    }
    
    return treeStructure;
  };

  // Create a default career plan
  const createDefaultCareerPlan = () => {
    return {
      name: "Career Path",
      children: [
        {
          name: "Year 1",
          skills: ["HTML", "CSS", "JavaScript", "React", "Node.js", "Git"],
          children: [
            {
              name: "Frontend Basics",
              skills: ["HTML", "CSS", "JavaScript"]
            },
            {
              name: "Frontend Framework",
              skills: ["React", "Redux", "TypeScript"]
            },
            {
              name: "Backend Basics",
              skills: ["Node.js", "Express", "MongoDB"]
            }
          ]
        },
        {
          name: "Year 2",
          skills: ["System Design", "Cloud Services", "DevOps", "Testing", "Security"],
          children: [
            {
              name: "Advanced Frontend",
              skills: ["Next.js", "GraphQL", "WebSocket"]
            },
            {
              name: "Advanced Backend",
              skills: ["Microservices", "Docker", "Kubernetes"]
            },
            {
              name: "DevOps",
              skills: ["CI/CD", "AWS", "Monitoring"]
            }
          ]
        },
        {
          name: "Year 3",
          skills: ["Architecture", "Leadership", "Innovation", "Research", "Mentoring"],
          children: [
            {
              name: "System Architecture",
              skills: ["Distributed Systems", "Scalability", "Performance"]
            },
            {
              name: "Cloud & DevOps",
              skills: ["Multi-cloud", "Infrastructure as Code", "Automation"]
            },
            {
              name: "Expert Level",
              skills: ["Research", "Innovation", "Leadership"]
            }
          ]
        }
      ]
    };
  };

  // Initialize provider and contract only when wallet is connected
  const getContract = () => {
    if (!window.ethereum || !walletConnected) return null;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    return new ethers.Contract(contractAddress, AIGC_NFT_ABI, provider.getSigner());
  };

  // Check if a node and all its children are completed
  const isNodeCompleted = (node) => {
    if (!node) return false;
    
    // If node is already marked as completed, return true
    if (completedNodes[node.id]) return true;
    
    // If node has no children, check its own completion status
    if (!node.children || node.children.length === 0) {
      return completedNodes[node.id] || false;
    }
    
    // For nodes with children, check if all children are completed
    return node.children.every(child => isNodeCompleted(child));
  };

  // Calculate unlock progress based on completed year nodes
  const calculateUnlockProgress = () => {
    if (!careerPlan) return 0;
    
    const yearNodes = careerPlan.children || [];
    const completedYears = yearNodes.filter(year => isNodeCompleted(year)).length;
    const progress = (completedYears / yearNodes.length) * 100;
    
    // Debug: Log progress calculation
    console.log('=== Debug: Progress Calculation ===');
    console.log('Year nodes:', yearNodes);
    console.log('Completed years:', completedYears);
    console.log('Progress:', progress);
    console.log('=================================');
    
    return progress;
  };

  // Handle node completion
  const handleNodeComplete = async (nodeId) => {
    console.log('=== Debug: Node Completion ===');
    console.log('Completing node:', nodeId);
    
    const updatedCompletion = { ...completedNodes, [nodeId]: true };
    console.log('Updated completion:', updatedCompletion);
    
    setCompletedNodes(updatedCompletion);
    localStorage.setItem('nodeCompletion', JSON.stringify(updatedCompletion));
    
    // Update unlock progress
    const newProgress = calculateUnlockProgress();
    console.log('New progress:', newProgress);
    setUnlockProgress(newProgress);
    
    // If progress is 100% and NFT hasn't been collected, enable collection
    if (newProgress === 100 && !isCollected) {
      console.log('Progress is 100%, attempting to collect NFT');
      try {
        await collectNFT();
      } catch (error) {
        console.error('Error collecting NFT:', error);
      }
    }
    console.log('===============================');
  };

  // Collect NFT
  const collectNFT = async () => {
    if (!walletConnected) {
      console.log('Wallet not connected, cannot collect NFT');
      alert('Please connect your wallet first');
      return;
    }

    console.log('=== Debug: NFT Collection ===');
    console.log('Wallet address:', userWalletAddress);
    console.log('Contract address:', contractAddress);
    
    try {
      const contract = getContract();
      if (!contract) {
        throw new Error('Contract not initialized');
      }
      console.log('Contract initialized successfully');

      const transaction = await contract.transferFrom(contractAddress, userWalletAddress, 5);
      console.log('Transaction sent:', transaction.hash);
      
      await transaction.wait();
      console.log('Transaction confirmed');
      
      setIsCollected(true);
      console.log('NFT collected successfully');
    } catch (error) {
      console.error('Error collecting NFT:', error);
      alert('Failed to collect NFT. Please try again.');
    }
    console.log('===========================');
  };

  // Render custom node element
  const renderCustomNode = (nodeProps) => {
    const { nodeDatum, toggleNode } = nodeProps;
    const isCompleted = completedNodes[nodeDatum.name] || false;
    const isSkillNode = nodeDatum.skills && !nodeDatum.children;
    const radius = isSkillNode ? 40 : 60;

    return (
      <g onClick={toggleNode}>
        <circle
          r={radius}
          fill={isCompleted ? "#4CAF50" : "#fff"}
          stroke={isCompleted ? "#2E7D32" : "#2196F3"}
          strokeWidth={2}
        />
        <text
          dy=".35em"
          x={radius + 10}
          textAnchor="start"
          style={{ fontSize: "12px", fill: "#333" }}
        >
          {nodeDatum.name}
        </text>
        {isSkillNode && nodeDatum.skills && (
          <text
            dy="1.5em"
            x={radius + 10}
            textAnchor="start"
            style={{ fontSize: "10px", fill: "#666" }}
          >
            {nodeDatum.skills.join(", ")}
          </text>
        )}
      </g>
    );
  };

  const toggleStudyProgress = () => {
    setIsStudyProgressOpen(!isStudyProgressOpen);
  };

  if (loading) {
    return (
      <div className="output-container">
        <div className="loading">
          <img src={Loading} alt="Loading" />
          <p className="loading-text">Loading Career Plan...</p>
        </div>
      </div>
    );
  }

  if (!careerPlan) {
    return (
      <div className="output-container">
        <div className="error">
          <p>No career plan found. Please complete the previous steps.</p>
          <BigButton onClick={() => window.location.href = '/input'}>
            Go Back
          </BigButton>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <section className="output-container">
        <div className="tree">
          <Tree
            data={careerPlan}
            orientation="vertical"
            translate={{ x: 550, y: 200 }}
            renderCustomNodeElement={renderCustomNode}
            zoomable={true}
            draggable={true}
            separation={{ siblings: 2, nonSiblings: 2.5 }}
          />
          <div className={`study_progress ${isStudyProgressOpen ? 'open' : ''}`}>
            {isStudyProgressOpen && (
              <div className="monster-content">
                {unlockProgress === 100 ? (
                  <div>
                    <p className="ini-egg-text">Congratulations! You've completed all milestones!</p>
                    <img src={monsterNFT} alt="Monster NFT" className="monster-image" />
                    {isCollected ? (
                      <p className="ini-egg-text">NFT has been collected</p>
                    ) : (
                      <BigButton onClick={collectNFT} disabled={!walletConnected}>
                        {walletConnected ? 'Collect NFT' : 'Connect Wallet to Collect'}
                      </BigButton>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="ini-egg-text">STUDY PROGRESS</p>
                    <br/>
                    <img src={iniEgg} alt="Initial Egg" className="ini-egg-image" />
                    <p className="ini-egg-text">Complete all milestones to unlock your NFT</p>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${unlockProgress}%` }}
                      />
                    </div>
                    <p className="progress-text">{Math.round(unlockProgress)}% Complete</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <img
          src={Open}
          className={`toggle-button ${isStudyProgressOpen ? 'open' : ''}`}
          onClick={toggleStudyProgress}
        />
      </section>
    </div>
  );
};

Output.propTypes = {
  userWalletAddress: PropTypes.string.isRequired
};

export default Output;