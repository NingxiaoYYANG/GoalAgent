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

const Output = (props) => {
  const [prevSkill, setPrevSkill] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skillArrays, setSkillArrays] = useState([]);
  const [learnedSkills, setLearnedSkills] = useState({});
  const [isCollected, setIsCollected] = useState(false);
  const [isStudyProgressOpen, setIsStudyProgressOpen] = useState(false);

  // For connecting to NFT solidity contract
  const contractAddress = '0x31e6c3b577a73afb176d925c7a6319c40128fc27'; // Replace with the actual contract address

  // Initialize the contract instance
  // Provider for sending transactions (using MetaMask)
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  
  // Initialize the contract instance using the ABI and the provider
  const contract = new ethers.Contract(contractAddress, AIGC_NFT_ABI, provider.getSigner());

  // For getting response from AI
  const getSkillInfos = async () => {
    const filtered_Input = `what skills do I need to learn if I want to become a ${props.userInput}? Answer in tree data structure format without any extra words, if learning skill1 depending on skill2 then skill 2 should be parent node of skill 1.\n
  Answer in the following format with no empty string:\n\
Skill, SkillID, Parent, ParentID, isLearned|\n\
Here is an example to follow:\n\
HTML, 1, None, 0, false|CSS, 2, None, 0, false|JavaScript, 3, None, 0, false|DOM Manipulation, 4, JavaScript, 3, false|CSS Frameworks, 5, CSS, 2, false|Bootstrap, 6, CSS Frameworks, 5, false|JavaScript Libraries, 7, JavaScript, 3, false|jQuery, 8, JavaScript Libraries, 7, false|React, 9, JavaScript Libraries, 7, false|Redux, 10, React, 9, false|Angular, 11, JavaScript Libraries, 7, false`;
  
const options = {
    method: 'POST',
    headers: {
      "Content-type": 'application/json',
    },
    body: JSON.stringify({
      message: filtered_Input,
    })
  };

  try {
    const response = await fetch('http://localhost:8000/completions', options);
    const data = await response.json();
    const MsgContent = data.choices[0].message.content;
    // Split message into skillInfos
    const skillInfos = MsgContent.split("|");
    for (const InfoString of skillInfos) {
      const InfoArray = InfoString.split(", ");
      setSkillArrays( prevs => (
        [...prevs,   
            {
                Skill: InfoArray[0],
                SkillID: InfoArray[1],
                Parent: InfoArray[2],
                ParentID: InfoArray[3],  
                isLearned: InfoArray[4],      
            }
        ]
      ))
    }
    
    setLoading(false);
    console.log(skillInfos);
  } catch (error) {
    console.log(error);
    setLoading(false);
  }
};

  // For generating the tree diagram
  const findChildrenSkills = (parentId) => {
    // Recursively find children skills of the given parent ID
    return skillArrays.filter((skill) => skill.ParentID === parentId);
  };

  const createSkillTree = (parentId) => {
    const childrenSkills = findChildrenSkills(parentId);
    return childrenSkills.map((skill) => {
      const children = createSkillTree(skill.SkillID);
      return { ...skill, children };
    });
  };

  const areAllSkillsLearned = (node) => {
    if (!node.children || node.children.length === 0) {
      // Leaf node, check if it is learned
      return learnedSkills[node.id];
    } else {
      // Non-leaf node, check if all children are learned
      return node.children.every(areAllSkillsLearned);
    }
  };

  const createReactD3TreeData = (node) => {
    return {
      name: node.Skill,
      id: node.SkillID,
      children: node.children.map(createReactD3TreeData),
    };
  };

  const toggleStudyProgress = () => {
    setIsStudyProgressOpen(!isStudyProgressOpen);
  };
  
  const clickSkillNode = (nodeDatum) => {
    if (nodeDatum.id === 0) {
      return; // Disable clicking on the root node
    }

    // Check if the skill is learned
    const isLearned = learnedSkills[nodeDatum.id];

    // If the skill is already learned, do not show the alert
    if (isLearned) {
      return;
    }

    // Prompt the user for an answer to the question
    const answer = prompt("1 + 1 = ?");

    // Check if the answer is correct
    if (answer && answer.trim() === "2") {
      // If the answer is correct, show an alert with a success message
      alert("Correct! You answered 1 + 1 = 2");

      // Update the learnedSkills state with the learned skill
      setLearnedSkills((prevLearnedSkills) => ({
        ...prevLearnedSkills,
        [nodeDatum.id]: true,
      }));
    } else {
      // If the answer is incorrect or empty, show an alert with an error message
      alert("Incorrect answer. Please try again.");
    }
  };

  // A Cheating function that learns all skills
  const completeAllQuiz = () => {
    // Create a copy of the learnedSkills object
    const updatedLearnedSkills = { ...learnedSkills };
  
    // Mark all skills as learned
    skillArrays.forEach(skill => {
      updatedLearnedSkills[skill.SkillID] = true;
    });
  
    // Update the learnedSkills state
    setLearnedSkills(updatedLearnedSkills);
  };
  
  const SkillNode = ({ nodeDatum }) => {
    // Check if the skill is learned
    const isLearned = learnedSkills[nodeDatum.id];

    // Check if the root node is clicked (id: 0)
    if (nodeDatum.id === 0) {
      // Change root node image based on the condition
      const iconImage = areAllSkillsLearned(nodeDatum) ? learnIcon : skillIcon;

      return (
        <g transform={`translate(-30,-25)`}>
          <image
            xlinkHref={iconImage}
            alt="Skill Icon"
            className="icon"
            onClick={nodeDatum.id === 0 ? undefined : () => clickSkillNode(nodeDatum)}
          />
        </g>
      );
    }

    // Change icon image for other nodes based on isLearned
    const iconImage = isLearned ? learnIcon : skillIcon;

    return (
      <g transform={`translate(-30,-25)`}>
        <image
          xlinkHref={iconImage}
          alt="Skill Icon"
          className="icon"
          onClick={() => clickSkillNode(nodeDatum)}
        />
      </g>
    );
  };
  
  const renderRectSvgNode = ({ nodeDatum }) => (
    <g>
      <SkillNode nodeDatum={nodeDatum} />
      <text className='text' fill="white" strokeWidth="1" x="20">  
        {nodeDatum.name}
      </text>
    </g>
  );

  // for collecting NFT to user's wallet
  const collectNft = async () => {
    try {
      // Transfer the NFT from contract to user's wallet using the signer (MetaMask wallet)
      // Only for demo, This will definetly get the robotic_white NFT by passing token ID 5
      const transaction = await contract.transferFrom(contractAddress, props.userWalletAddress, 5);

      // Set the isCollected to be true to hide the collect button
      setIsCollected(true);

      // Wait for the transaction to be mined and get the receipt
      await transaction.wait();

    } catch (error) {
      console.error('Error calling safeTransferFrom():', error);
    }
  };

  // For Initialisation

  useEffect(() => {
    getSkillInfos();
  }, []);

  useEffect(() => {
    if (props.userInput && skillArrays.length > 0) {
      const tree = createSkillTree('0');
      setPrevSkill(tree);
      setLoading(false);
    }
  }, [props.userInput, skillArrays]);


  return (
    <div className="app">
      <section className="output-container">
        {loading ? (
          <div className="loading">
            <br/>
            <img src={Loading} alt="Loading" />
            <p className='loading-text'> GENERATING SKILL BOARD... </p>
          </div>
        ) : (
          <div>
            <div className="tree">
              <Tree 
                data={createReactD3TreeData({ Skill: props.userInput, SkillID: 0, children: prevSkill })}
                orientation="vertical"
                translate={{ x: 550, y: 200 }}
                renderCustomNodeElement={renderRectSvgNode}
                zoomable={false}
                separation={{ siblings: 2, nonSiblings: 2 }}
              />
              <div className={`study_rogress ${isStudyProgressOpen ? 'open' : ''}`}>
                {isStudyProgressOpen && (
                  <div className="monster-content">
                    {areAllSkillsLearned(createReactD3TreeData({ Skill: props.userInput, SkillID: 0, children: prevSkill })) ? (
                      <div>
                        <p className='ini-egg-text'>Congratulations, You Got It!!!</p>
                        <img src={monsterNFT} alt="Monster NFT" className="monster-image" />
                        {isCollected ? 
                        (
                          <p className='ini-egg-text'> You have already collect it</p>
                        ) : (
                          <BigButton onClick={collectNft}> COLLECT NTF </BigButton>
                        )}
                      </div>
                    ) : (
                      <div>
                        <p className='ini-egg-text'>STUDY PROGRESS</p>
                        <br/>
                        <img src={iniEgg} alt="Initial Egg" className="ini-egg-image" />
                        <p className='ini-egg-text'>LIGHT UP ALL SKILLS TO UNLOCK YOUR MONSTER</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className='complete'>
                <BigButton onClick={completeAllQuiz}> Complete All Quiz</BigButton>
              </div>
            </div>
            <img
              src={Open}
              className={`toggle-button ${isStudyProgressOpen ? 'open' : ''}`}
              onClick={toggleStudyProgress}
            />
          </div>
        )}
      </section>
    </div>
  );
};

Output.propTypes = {
  userInput: PropTypes.any,
  userWalletAddress: PropTypes.string
}

export default Output;