import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import ReactFlow, { ReactFlowProvider, Background, Controls, useReactFlow } from 'reactflow';
import 'reactflow/dist/style.css';
import '../pages/Output.css';
import skillIcon from '../Monster/purple_icon.png';
import learnIcon from '../Monster/red_icon.png';
import iniEgg from '../Monster/egg.png';
import Open from '../Background/Open.png';
import Loading from '../Background/loading.gif';
import monsterNFT from '../Monster/AIGC-image-Goalagent/robotic_white.png';
import BigButton from '../components/BigButton';
import { ethers } from 'ethers';
import AIGC_NFT_ABI from '../contractABI/AIGC_NFT_ABI.json';



const Output = ({ userWalletAddress }) => {
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const [careerPlan, setCareerPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedNodes, setCompletedNodes] = useState({});
  const [isCollected, setIsCollected] = useState(false);
  const [isStudyProgressOpen, setIsStudyProgressOpen] = useState(false);
  const [unlockProgress, setUnlockProgress] = useState(0);
  const [walletConnected, setWalletConnected] = useState(false);
  const [focusedNodeId, setFocusedNodeId] = useState(null);
  const [historyStack, setHistoryStack] = useState([]);
  const contractAddress = '0x31e6c3b577a73afb176d925c7a6319c40128fc27';

  useEffect(() => {
    const storedPlan = localStorage.getItem('careerPlan');
    if (storedPlan) {
      const parsedPlan = JSON.parse(storedPlan);
      setCareerPlan(transformCareerPlanToFlow(parsedPlan));
    } else {
      const defaultPlan = createDefaultCareerPlan();
      setCareerPlan(transformCareerPlanToFlow(defaultPlan));
    }

    const savedCompletion = localStorage.getItem('nodeCompletion');
    if (savedCompletion) {
      setCompletedNodes(JSON.parse(savedCompletion));
    }

    checkWalletConnection();
    setLoading(false);
  }, [userWalletAddress]);

  const checkWalletConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) setWalletConnected(true);
      } catch (error) {
        console.error('Wallet connection error:', error);
      }
    }
  };
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

  const transformCareerPlanToFlow = (plan) => {
    let nodes = [];
    let edges = [];
    let globalX = 0;
  
    const traverse = (node, parentId = null, depth = 0) => {
      if (!node || !node.name) return;
  
      const id = node.id || node.name || `node-${Math.random().toString(36).substr(2, 9)}`;
  
      nodes.push({
        id,
        data: { label: node.name, skills: node.skills || [] },
        position: { x: globalX * 300, y: depth * 350 }
      });
  
      if (parentId) {
        edges.push({
          id: `${parentId}-${id}`,
          source: parentId,
          target: id
        });
      }
  
      if (node.children && Array.isArray(node.children) && node.children.length > 0) {
        node.children.forEach((child) => {
          globalX++;
          traverse(child, id, depth + 1);
        });
      }
    };
  
    traverse(plan);
  
    return { nodes, edges };
  };
  
  const defaultCareerPlan = {
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
  const { nodes, edges } = transformCareerPlanToFlow(defaultCareerPlan);

  

  const getContract = () => {
    if (!window.ethereum || !walletConnected) return null;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    return new ethers.Contract(contractAddress, AIGC_NFT_ABI, provider.getSigner());
  };

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
   

  const handleNodeClick = useCallback((event, node) => {
    setHistoryStack(prev => [...prev, focusedNodeId]);
    setFocusedNodeId(node.id);
  
    setTimeout(() => {
      if (reactFlowInstance) {
        const subtreeIds = findSubtree(node.id);
        const visibleNodes = transformCareerPlanToFlow(defaultCareerPlan).nodes.filter(n => subtreeIds.has(n.id));
        reactFlowInstance.fitView({ nodes: visibleNodes, padding: 0.2 });
      }
    }, 0);
  }, [focusedNodeId, reactFlowInstance]);

  // const handleNodeClick = useCallback((event, node) => {
  //   setHistoryStack(prev => [...prev, focusedNodeId]);
  //   setFocusedNodeId(node.id);
  // });

  const findSubtree = (startId) => {
    const result = new Set();
    const explore = (id) => {
      result.add(id);
      transformCareerPlanToFlow(defaultCareerPlan).edges.forEach(edge => {
        if (edge.source === id) {
          explore(edge.target);
        }
      });
    };
    explore(startId);
    return result;
  };


  const filterFocusedNodes = () => {
    console.log(focusedNodeId)
    console.log(focusedNodeId == null)
    if (focusedNodeId == null) {
      console.log('===no node fund=======');
      return transformCareerPlanToFlow(defaultCareerPlan).nodes;
      // return careerPlan.nodes; // Show full tree initially
    }
    console.log("121212")
    console.log(transformCareerPlanToFlow(defaultCareerPlan).nodes);
    const subtreeIds = findSubtree(focusedNodeId);
    console.log(subtreeIds);
    return transformCareerPlanToFlow(defaultCareerPlan).nodes.filter(node => subtreeIds.has(node.id));
  };
  
  const filterFocusedEdges = () => {
    
    if (focusedNodeId == null) {
      console.log('===no edge fund=======');
      console.log(transformCareerPlanToFlow(defaultCareerPlan));
      return transformCareerPlanToFlow(defaultCareerPlan).edges; // Show full tree initially
    }
    const subtreeIds = findSubtree(focusedNodeId);
    return transformCareerPlanToFlow(defaultCareerPlan).edges.filter(edge => subtreeIds.has(edge.source) && subtreeIds.has(edge.target));
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
      {historyStack.length > 0 && (
        <button
          onClick={() => {
            const prev = [...historyStack];
            const lastFocused = prev.pop();
            setHistoryStack(prev);
            setFocusedNodeId(lastFocused);

            setTimeout(() => {
              if (lastFocused && reactFlowInstance) {
                const subtreeIds = findSubtree(lastFocused);
                const visibleNodes = transformCareerPlanToFlow(defaultCareerPlan).nodes.filter(n => subtreeIds.has(n.id));
                reactFlowInstance.fitView({ nodes: visibleNodes, padding: 0.2 });
              } else if (reactFlowInstance) {
                reactFlowInstance.fitView({ padding: 0.2 }); // If no lastFocused, fit full tree
              }
            }, 0);

          }}
        >
          Go Back
        </button>
      )}

        <div className="tree">
          <ReactFlowProvider>
            <ReactFlow
              nodes={filterFocusedNodes()}
              edges={filterFocusedEdges()}
              onNodeClick={handleNodeClick}
              onInit={setReactFlowInstance}
              fitView
              proOptions={{ account: "paid" }}
            >
              <Background />
              <Controls />
            </ReactFlow>
          </ReactFlowProvider>
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
                      <div className="progress-fill" style={{ width: `${unlockProgress}%` }} />
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
