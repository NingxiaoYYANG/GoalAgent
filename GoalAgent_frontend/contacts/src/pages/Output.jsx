import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import ReactFlow, { 
  ReactFlowProvider, 
  Background, 
  Controls, 
  useReactFlow,
  MarkerType,
  EdgeTypes,
  getSmoothStepPath,
  Position,
  Handle
} from 'reactflow';
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

// 自定义边样式
const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}) => {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <path
      id={id}
      style={{
        ...style,
        strokeWidth: 2,
        stroke: '#555',
      }}
      className="react-flow__edge-path"
      d={edgePath}
      markerEnd={markerEnd}
    />
  );
};

const edgeTypes = {
  custom: CustomEdge,
};

// 自定义节点样式
const CustomNode = ({ data }) => {
  return (
    <div className={`custom-node ${data.type}`}>
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#555' }}
      />
      <div className="node-content">
        <div className="node-label">{data.label}</div>
        {data.skills && data.skills.length > 0 && (
          <div className="node-skills">
            {data.skills.map((skill, index) => (
              <span key={index} className="skill-tag">{skill}</span>
            ))}
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#555' }}
      />
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

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
  const [expandedNodes, setExpandedNodes] = useState({});
  const [loadingNode, setLoadingNode] = useState(null);
  const [viewMode, setViewMode] = useState('overview'); // 'overview' or 'year-detail'
  const contractAddress = '0x31e6c3b577a73afb176d925c7a6319c40128fc27';

  useEffect(() => {
    const storedPlan = localStorage.getItem('careerPlan');
    console.log('Stored plan:', storedPlan);
    if (storedPlan) {
      try {
        const parsedPlan = JSON.parse(storedPlan);
        console.log('Parsed plan:', parsedPlan);
        const flowData = transformCareerPlanToFlow(parsedPlan);
        console.log('Transformed flow data:', flowData);
        setCareerPlan(flowData);
      } catch (error) {
        console.error('Error parsing stored plan:', error);
        const defaultPlan = createDefaultCareerPlan();
        setCareerPlan(transformCareerPlanToFlow(defaultPlan));
      }
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
    console.log('Transforming plan:', plan);
    let nodes = [];
    let edges = [];
    let globalX = 0;
  
    const traverse = (node, parentId = null, depth = 0, xOffset = 0) => {
      if (!node || !node.name) return;
  
      const id = node.id || node.name || `node-${Math.random().toString(36).substr(2, 9)}`;
      const nodeType = depth === 0 ? 'root' : 
                      depth === 1 ? 'year' : 
                      depth === 2 ? 'milestone' : 'skill';
  
      const newNode = {
        id,
        type: 'custom',
        data: { 
          label: node.name, 
          skills: node.skills || [],
          type: nodeType,
          year: depth === 1 ? node.name : null,
          specialization: node.specialization || '',
          description: node.description || ''
        },
        position: { x: xOffset * 300, y: depth * 350 },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      };
      
      console.log('Creating node:', newNode);
      nodes.push(newNode);
  
      if (parentId) {
        const newEdge = {
          id: `${parentId}-${id}`,
          source: parentId,
          target: id,
          type: 'custom',
          animated: false,
          style: { stroke: '#555' },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: '#555',
          },
          sourceHandle: 'source',
          targetHandle: 'target'
        };
        console.log('Creating edge:', newEdge);
        edges.push(newEdge);
      }
  
      if (node.children && Array.isArray(node.children) && node.children.length > 0) {
        node.children.forEach((child, index) => {
          traverse(child, id, depth + 1, xOffset + index);
        });
      }
  
      // Handle milestones array if it exists
      if (node.milestones && Array.isArray(node.milestones)) {
        node.milestones.forEach((milestone, index) => {
          const milestoneId = `${id}-milestone-${index}`;
          const milestoneNode = {
            id: milestoneId,
            type: 'custom',
            data: {
              label: milestone,
              type: 'milestone',
              parentNode: id
            },
            position: { x: xOffset * 300 + (index * 200), y: (depth + 1) * 350 },
            sourcePosition: Position.Bottom,
            targetPosition: Position.Top
          };
          nodes.push(milestoneNode);
          
          const milestoneEdge = {
            id: `${id}-${milestoneId}`,
            source: id,
            target: milestoneId,
            type: 'custom',
            animated: false,
            style: { stroke: '#555' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
              color: '#555',
            },
            sourceHandle: 'source',
            targetHandle: 'target'
          };
          edges.push(milestoneEdge);
        });
      }
    };
  
    traverse(plan);
    console.log('Final nodes:', nodes);
    console.log('Final edges:', edges);
  
    return { nodes, edges };
  };

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
  
    // console.log('=== Debug: NFT Collection ===');
    // console.log('Wallet address:', userWalletAddress);
    // console.log('Contract address:', contractAddress);
  
    try {
      const contract = getContract();
      if (!contract) {
        throw new Error('Contract not initialized');
      }
      // console.log('Contract initialized successfully');
  
      const transaction = await contract.transferFrom(contractAddress, userWalletAddress, 5);
      // console.log('Transaction sent:', transaction.hash);
  
      await transaction.wait();
      // console.log('Transaction confirmed');
  
      setIsCollected(true);
      // console.log('NFT collected successfully');
    } catch (error) {
      console.error('Error collecting NFT:', error);
      alert('Failed to collect NFT. Please try again.');
    }
    // console.log('===========================');
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
   

  const fetchMilestoneDetails = async (nodeId, nodeData) => {
    try {
      setLoadingNode(nodeId);
      console.log('Node data received:', nodeData);
      
      const requestData = {
        milestone_name: nodeData.label,
        context: {
          career_path: careerPlan?.name || 'Web Development',
          specialization: nodeData.specialization || '',
          year: nodeData.year || '',
          parent_node: nodeData.parentNode || '',
          node_type: nodeData.type || 'milestone'
        }
      };
      
      console.log('Sending request to expand_milestone:', requestData);
      console.log('Request data milestone_name:', requestData.milestone_name);
      
      const response = await fetch('http://localhost:5000/expand_milestone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      const responseData = await response.json();
      console.log('Received milestone details:', responseData);

      if (!response.ok) {
        console.error('Error response:', responseData);
        throw new Error(`Failed to fetch milestone details: ${responseData.error || response.statusText}`);
      }

      if (responseData.error) {
        console.error('Error in response data:', responseData.error);
        throw new Error(responseData.error);
      }

      if (!responseData.skills || !Array.isArray(responseData.skills)) {
        console.error('Invalid response format:', responseData);
        throw new Error('Invalid response format: missing skills array');
      }
      
      // 创建技能节点
      const skillNodes = responseData.skills.map((skill, index) => ({
        id: `${nodeId}-skill-${index}`,
        data: { 
          label: skill,
          type: 'skill',
          parentNode: nodeId
        },
        position: { 
          x: nodeData.position.x + 300, 
          y: nodeData.position.y + (index * 100)
        }
      }));

      // 创建技能节点到父节点的边
      const skillEdges = skillNodes.map((skillNode, index) => ({
        id: `${nodeId}-${skillNode.id}`,
        source: nodeId,
        target: skillNode.id
      }));

      // 更新节点和边
      setCareerPlan(prev => {
        const newNodes = [...prev.nodes, ...skillNodes];
        const newEdges = [...prev.edges, ...skillEdges];
        return { nodes: newNodes, edges: newEdges };
      });

      // 记录已展开的节点
      setExpandedNodes(prev => ({
        ...prev,
        [nodeId]: true
      }));

    } catch (error) {
      console.error('Error fetching milestone details:', error);
      // 可以在这里添加错误提示UI
    } finally {
      setLoadingNode(null);
    }
  };

  const handleNodeClick = useCallback((event, node) => {
    console.log('Clicked node:', node);
    
    if (node.data.type === 'year') {
      setViewMode('year-detail');
      setFocusedNodeId(node.id);
      setHistoryStack(prev => [...prev, { mode: 'overview', nodeId: null }]);
    } else if (node.data.type === 'root') {
      setViewMode('overview');
      setFocusedNodeId(null);
    }
  
    setTimeout(() => {
      if (reactFlowInstance) {
        const visibleNodes = filterFocusedNodes();
        reactFlowInstance.fitView({ nodes: visibleNodes, padding: 0.2 });
      }
    }, 0);
  }, [reactFlowInstance, viewMode]);

  const handleBack = () => {
    if (historyStack.length > 0) {
      const prev = [...historyStack];
      const lastState = prev.pop();
      setHistoryStack(prev);
      setViewMode(lastState.mode);
      setFocusedNodeId(lastState.nodeId);

      setTimeout(() => {
        if (reactFlowInstance) {
          const visibleNodes = filterFocusedNodes();
          reactFlowInstance.fitView({ nodes: visibleNodes, padding: 0.2 });
        }
      }, 0);
    }
  };

  const filterFocusedNodes = () => {
    if (!careerPlan) return [];
    
    if (viewMode === 'overview') {
      // 在概览模式下，只显示根节点和年份节点
      return careerPlan.nodes.filter(node => 
        node.data.type === 'root' || node.data.type === 'year'
      );
    } else if (viewMode === 'year-detail' && focusedNodeId) {
      // 在年份详情模式下，只显示选中的年份节点和其里程碑
      return careerPlan.nodes.filter(node => 
        node.id === focusedNodeId || 
        (node.data.type === 'milestone' && node.data.parentNode === focusedNodeId)
      );
    }
    
    return careerPlan.nodes;
  };
  
  const filterFocusedEdges = () => {
    if (!careerPlan) return [];
    
    if (viewMode === 'overview') {
      // 在概览模式下，只显示根节点到年份节点的边
      return careerPlan.edges.filter(edge => {
        const sourceNode = careerPlan.nodes.find(n => n.id === edge.source);
        const targetNode = careerPlan.nodes.find(n => n.id === edge.target);
        return sourceNode?.data.type === 'root' && targetNode?.data.type === 'year';
      });
    } else if (viewMode === 'year-detail' && focusedNodeId) {
      // 在年份详情模式下，只显示选中年份节点到其里程碑的边
      return careerPlan.edges.filter(edge => 
        edge.source === focusedNodeId && 
        careerPlan.nodes.find(n => n.id === edge.target)?.data.type === 'milestone'
      );
    }
    
    return careerPlan.edges;
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
            className="back-button"
            onClick={handleBack}
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
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
              proOptions={{ account: "paid" }}
              defaultEdgeOptions={{
                type: 'custom',
                animated: false,
                style: { stroke: '#555' },
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  width: 20,
                  height: 20,
                  color: '#555',
                },
              }}
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
