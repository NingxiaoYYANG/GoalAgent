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
const CustomNode = ({ data, isLoading }) => {
  return (
    <div className={`custom-node ${data.type}`} data-difficulty={data.difficulty} style={{
      border: data.type === 'milestone' ? '3px solid #FFD600' :
             data.type === 'root' ? '3px solid #00BFFF' :
             data.type === 'year' ? '3px solid #7CFC00' :
             data.type === 'subtask' ? '2px dashed #aaa' :
             '1px solid #ccc',
      background: data.type === 'milestone' ? '#fffbe6' :
                  data.type === 'root' ? '#e6f7ff' :
                  data.type === 'year' ? '#f0fff0' :
                  data.type === 'subtask' ? '#f9f9f9' :
                  '#fff',
      boxShadow: data.type === 'milestone' ? '0 0 10px #FFD60055' :
                 data.type === 'root' ? '0 0 10px #00BFFF55' :
                 data.type === 'year' ? '0 0 10px #7CFC0055' :
                 'none',
      position: 'relative'
    }}>
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#555' }}
      />
      <div className="node-content">
        <div className="node-label">{data.label}</div>
        {data.description && (
          <div className="node-description">{data.description}</div>
        )}
        {data.skills && data.skills.length > 0 && (
          <div className="node-skills">
            {data.skills.map((skill, index) => (
              <span key={index} className="skill-tag">{skill}</span>
            ))}
          </div>
        )}
      </div>
      {data.difficulty && (
        <div className={`difficulty-badge ${data.difficulty}`}>
          {data.difficulty.charAt(0).toUpperCase()}
        </div>
      )}
      {isLoading && (
        <div className="milestone-loading-overlay">
          <img src={Loading} alt="Loading..." className="milestone-loading-spinner" />
        </div>
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#555' }}
      />
    </div>
  );
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
  const [viewMode, setViewMode] = useState('overview');
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });
  const [rootNodePosition, setRootNodePosition] = useState({ x: 0, y: 0 });
  const contractAddress = '0x31e6c3b577a73afb176d925c7a6319c40128fc27';

  useEffect(() => {
    const storedPlan = localStorage.getItem('careerPlan');
    console.log('Stored plan:', storedPlan);
    if (storedPlan) {
      try {
        const parsedPlan = JSON.parse(storedPlan);
        const flowData = transformCareerPlanToFlow(parsedPlan);
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
          description: node.description || '',
          difficulty: node.difficulty || 'medium'
        },
        position: { x: xOffset * 300, y: depth * 350 },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      };
      
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
        edges.push(newEdge);
      }
  
      if (node.children && Array.isArray(node.children) && node.children.length > 0) {
        node.children.forEach((child, index) => {
          traverse(child, id, depth + 1, xOffset + index);
        });
      }
  
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
  
    try {
      const contract = getContract();
      if (!contract) {
        throw new Error('Contract not initialized');
      }
  
      const transaction = await contract.transferFrom(contractAddress, userWalletAddress, 5);
  
      await transaction.wait();
  
      setIsCollected(true);
    } catch (error) {
      console.error('Error collecting NFT:', error);
      alert('Failed to collect NFT. Please try again.');
    }
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
    
    return progress;
  };

  const handleNodeComplete = async (nodeId) => {
    const updatedCompletion = { ...completedNodes, [nodeId]: true };
    setCompletedNodes(updatedCompletion);
    localStorage.setItem('nodeCompletion', JSON.stringify(updatedCompletion));
    
    // Update unlock progress
    const newProgress = calculateUnlockProgress();
    setUnlockProgress(newProgress);
    
    // If progress is 100% and NFT hasn't been collected, enable collection
    if (newProgress === 100 && !isCollected) {
      try {
        await collectNFT();
      } catch (error) {
        console.error('Error collecting NFT:', error);
      }
    }
  };
   

  const fetchMilestoneDetails = async (nodeId, nodeData) => {
    try {
      setLoadingNode(nodeId);
      
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
      
      const response = await fetch('http://localhost:5000/expand_milestone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(`Failed to fetch milestone details: ${responseData.error || response.statusText}`);
      }

      if (responseData.error) {
        throw new Error(responseData.error);
      }

      if (!responseData.skills || !Array.isArray(responseData.skills)) {
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
    if (loadingNode) return; // 正在加载时禁止点击
    if (node.data.type === 'year') {
      if (focusedNodeId === node.id) {
        return;
      }

      setViewMode('year-detail');
      setFocusedNodeId(node.id);
      setHistoryStack(prev => [...prev, { mode: 'overview', nodeId: null }]);
      setBreadcrumbs(prev => [...prev, { 
        id: `${node.id}_${Date.now()}`, 
        nodeId: node.id,
        label: node.data.label 
      }]);
      
      setTimeout(() => {
        if (reactFlowInstance) {
          reactFlowInstance.fitView({
            padding: 0.2,
            duration: 300,
            includeHiddenNodes: false
          });
        }
      }, 100);
    } else if (node.data.type === 'root') {
      setViewMode('overview');
      setFocusedNodeId(null);
      setBreadcrumbs([]);
      
      setTimeout(() => {
        if (reactFlowInstance) {
          reactFlowInstance.fitView({
            padding: 0.2,
            duration: 300,
            includeHiddenNodes: false
          });
        }
      }, 100);
    } else if (node.data.type === 'milestone') {
      if (node.data.isExpanded) return; // 已展开则不响应
      setLoadingNode(node.id);
      // 获取所有用户输入数据
      const completeUserData = JSON.parse(localStorage.getItem('completeUserData') || '{}');
      const requestData = {
        milestone_name: node.data.label,
        context: {
          ...completeUserData, // 全部带上
          career_path: careerPlan?.name || 'Web Development',
          specialization: node.data.specialization || '',
          year: node.data.year || '',
          parent_node: node.data.parentNode || '',
          node_type: 'milestone'
        }
      };
      fetch('http://localhost:5000/expand_milestone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })
      .then(response => response.json())
      .then(data => {
        console.log('Expanded milestone response:', data);
        
        if (data.error) {
          throw new Error(data.error);
        }

        // 只更新原有 milestone 节点，补充详细信息，保持原有位置
        const updatedNode = {
          ...node,
          data: {
            ...node.data,
            isExpanded: true,
            description: data.description || node.data.description,
            skills: data.skills || node.data.skills,
            difficulty: data.difficulty || node.data.difficulty
          },
          position: node.position // 保持原有位置
        };

        // 只将 children 转为新节点，水平分布
        const { nodes: newNodes, edges: newEdges } = transformSubtreeToFlow(
          { children: data.children || [] }, 
          node.id,
          node.position // 传递milestone节点的position
        );

        setCareerPlan(prev => {
          const updatedNodes = prev.nodes.map(n => 
            n.id === node.id ? updatedNode : n
          ).concat(newNodes);
          const updatedEdges = prev.edges.concat(newEdges);
          return { nodes: updatedNodes, edges: updatedEdges };
        });

        setViewMode('milestone-detail');
        setFocusedNodeId(node.id);
        setHistoryStack(prev => [...prev, { mode: 'year-detail', nodeId: focusedNodeId }]);
        setBreadcrumbs(prev => [...prev, { 
          id: `${node.id}_${Date.now()}`, 
          nodeId: node.id,
          label: node.data.label 
        }]);

        setTimeout(() => {
          if (reactFlowInstance) {
            reactFlowInstance.fitView({
              padding: 0.2,
              duration: 300,
              includeHiddenNodes: false
            });
          }
        }, 100);
      })
      .catch(error => {
        console.error('Error expanding milestone:', error);
      })
      .finally(() => {
        setLoadingNode(null);
      });
    }
  }, [reactFlowInstance, viewMode, focusedNodeId, careerPlan, loadingNode]);

  // 递归计算子树宽度
  function getSubtreeWidth(node) {
    if (!node.children || node.children.length === 0) return 1;
    return node.children.reduce((sum, child) => sum + getSubtreeWidth(child), 0);
  }

  // 优化 transformSubtreeToFlow 使子节点水平分布且不重叠
  const transformSubtreeToFlow = (data, parentId, parentPosition = {x: 0, y: 0}) => {
    const nodes = [];
    const edges = [];
    let nodeIdCounter = 0;
    const spread = 250;

    function traverse(node, parentNodeId, depth = 0, xStart = 0, y = 0, parentPos = {x: 0, y: 0}) {
      const nodeId = `${parentId}-subtree-${nodeIdCounter++}`;
      const subtreeWidth = getSubtreeWidth(node);
      const nodeX = xStart + (subtreeWidth / 2 - 0.5) * spread;
      const nodeY = y;
      const newNode = {
        id: nodeId,
        type: 'custom',
        data: {
          label: node.name,
          type: node.type || 'subtask',
          skills: node.skills || [],
          description: node.description || '',
          difficulty: node.difficulty || 'medium',
          parentNode: parentNodeId
        },
        position: { x: nodeX, y: nodeY },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      };
      nodes.push(newNode);
      if (parentNodeId) {
        edges.push({
          id: `${parentNodeId}-${nodeId}`,
          source: parentNodeId,
          target: nodeId,
          type: 'custom',
          animated: false,
          style: { 
            stroke: node.difficulty === 'hard' ? '#ff4444' : 
                   node.difficulty === 'medium' ? '#ffaa00' : '#44aa44'
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: node.difficulty === 'hard' ? '#ff4444' : 
                   node.difficulty === 'medium' ? '#ffaa00' : '#44aa44',
          }
        });
      }
      if (node.children && node.children.length > 0) {
        let childX = xStart;
        node.children.forEach(child => {
          const childWidth = getSubtreeWidth(child);
          traverse(child, nodeId, depth + 1, childX, nodeY + 200, {x: nodeX, y: nodeY});
          childX += childWidth * spread;
        });
      }
    }

    // 只遍历 children，水平分布且不重叠
    if (data.children && Array.isArray(data.children)) {
      const totalWidth = getSubtreeWidth({children: data.children});
      let xStart = parentPosition.x - (totalWidth * spread) / 2 + spread / 2;
      data.children.forEach(child => {
        const childWidth = getSubtreeWidth(child);
        traverse(child, parentId, 1, xStart, parentPosition.y + 200, parentPosition);
        xStart += childWidth * spread;
      });
    }

    return { nodes, edges };
  };

  const handleBack = () => {
    if (historyStack.length > 0) {
      const prev = [...historyStack];
      const lastState = prev.pop();
      setHistoryStack(prev);
      setViewMode(lastState.mode);
      setFocusedNodeId(lastState.nodeId);
      setBreadcrumbs(prev => prev.slice(0, -1));

      setTimeout(() => {
        if (reactFlowInstance) {
          const visibleNodes = filterFocusedNodes();
          reactFlowInstance.fitView({ nodes: visibleNodes, padding: 0.2 });
        }
      }, 0);
    }
  };

  const navigateToBreadcrumb = (index) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
    
    if (index === -1) {
      // 返回根视图
      setViewMode('overview');
      setFocusedNodeId(null);
      setHistoryStack([]);
    } else {
      // 返回到选中的层级
      const targetNode = careerPlan.nodes.find(n => n.id === newBreadcrumbs[index].nodeId);
      if (targetNode) {
        setViewMode('year-detail');
        setFocusedNodeId(targetNode.id);
        setHistoryStack(Array(index).fill({ mode: 'overview', nodeId: null }));
      }
    }

    setTimeout(() => {
      if (reactFlowInstance) {
        const visibleNodes = filterFocusedNodes();
        reactFlowInstance.fitView({ nodes: visibleNodes, padding: 0.2 });
      }
    }, 0);
  };

  const filterFocusedNodes = () => {
    if (!careerPlan) return [];
    
    if (viewMode === 'overview') {
      return careerPlan.nodes.filter(node => 
        node.data.type === 'root' || node.data.type === 'year'
      );
    } else if (viewMode === 'year-detail' && focusedNodeId) {
      return careerPlan.nodes.filter(node => 
        node.id === focusedNodeId || 
        (node.data.type === 'milestone' && node.data.parentNode === focusedNodeId) ||
        // 保留已展开的里程碑的子树
        (node.data.type === 'subtask' && node.id.startsWith(`${focusedNodeId}-subtree`))
      );
    } else if (viewMode === 'milestone-detail' && focusedNodeId) {
      return careerPlan.nodes.filter(node => 
        node.id === focusedNodeId || 
        node.id.startsWith(`${focusedNodeId}-subtree`)
      );
    }
    
    return careerPlan.nodes;
  };
  
  const filterFocusedEdges = () => {
    if (!careerPlan) return [];
    
    if (viewMode === 'overview') {
      return careerPlan.edges.filter(edge => {
        const sourceNode = careerPlan.nodes.find(n => n.id === edge.source);
        const targetNode = careerPlan.nodes.find(n => n.id === edge.target);
        return sourceNode?.data.type === 'root' && targetNode?.data.type === 'year';
      });
    } else if (viewMode === 'year-detail' && focusedNodeId) {
      return careerPlan.edges.filter(edge => {
        const sourceNode = careerPlan.nodes.find(n => n.id === edge.source);
        const targetNode = careerPlan.nodes.find(n => n.id === edge.target);
        return (
          // 年份节点到里程碑的边
          (edge.source === focusedNodeId && targetNode?.data.type === 'milestone') ||
          // 已展开的里程碑的子树边
          (sourceNode?.id.startsWith(`${focusedNodeId}-subtree`) && 
           targetNode?.id.startsWith(`${focusedNodeId}-subtree`))
        );
      });
    } else if (viewMode === 'milestone-detail' && focusedNodeId) {
      return careerPlan.edges.filter(edge => 
        edge.source.startsWith(`${focusedNodeId}-subtree`) || 
        edge.target.startsWith(`${focusedNodeId}-subtree`)
      );
    }
    
    return careerPlan.edges;
  };

  const toggleStudyProgress = () => {
    setIsStudyProgressOpen(!isStudyProgressOpen);
  };

  const handleMove = useCallback((event, viewport) => {
    setViewport(viewport);
    // 更新根节点位置
    if (careerPlan) {
      const rootNode = careerPlan.nodes.find(node => node.data.type === 'root');
      if (rootNode) {
        const newX = rootNode.position.x * viewport.zoom + viewport.x;
        const newY = rootNode.position.y * viewport.zoom + viewport.y;
        setRootNodePosition({ x: newX, y: newY });
      }
    }
  }, [careerPlan]);

  const handleMoveEnd = useCallback(() => {
    if (!reactFlowInstance) return;
    
    // 使用 fitView 确保所有可见节点都在视图中
    reactFlowInstance.fitView({
      padding: 0.2,
      duration: 300,
      includeHiddenNodes: false
    });
  }, [reactFlowInstance]);

  // nodeTypes 需要在组件内部定义，才能访问 loadingNode
  const nodeTypes = {
    custom: (props) => <CustomNode {...props} isLoading={props.id === loadingNode} />,
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
        <div className="navigation-controls">
          <div className="breadcrumb">
            <button 
              className="breadcrumb-item home"
              onClick={() => navigateToBreadcrumb(-1)}
            >
              🏠
            </button>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.id}>
                <span className="breadcrumb-separator">/</span>
                <button 
                  className="breadcrumb-item"
                  onClick={() => navigateToBreadcrumb(index)}
                >
                  {crumb.label}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="tree">
          <ReactFlowProvider>
            <ReactFlow
              nodes={filterFocusedNodes()}
              edges={filterFocusedEdges()}
              onNodeClick={handleNodeClick}
              onInit={setReactFlowInstance}
              onMoveEnd={handleMoveEnd}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              minZoom={0.5}
              maxZoom={1.5}
              panOnDrag={false}
              fitView
              fitViewOptions={{
                padding: 0.2,
                includeHiddenNodes: false,
                duration: 300
              }}
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
