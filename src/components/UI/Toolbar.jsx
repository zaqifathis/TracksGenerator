import { useState } from 'react';
import { glassStyle } from './glassStyle';
import { StraightIcon, CurveIcon, YIcon, XIcon, ActionIcon } from './Icons';

// UI Colors
const activeTrackColor = '#0ceda2'; 
const idleTrackColor = 'rgba(177, 174, 4, 0.89)'; 
const utilityColor = 'rgba(186, 186, 186, 0.89)'; 
const iconColor = '#222222'; 

const Toolbar = ({ activeTool, onSelectTool, onSave, onLoad, onReset }) => {
  const [hovered, setHovered] = useState(null);

  const tools = [
    { id: 'STRAIGHT', label: 'Straight Track', icon: <StraightIcon /> },
    { id: 'CURVED', label: 'Curve Track', icon: <CurveIcon /> },
    { id: 'Y_TRACK', label: 'Y-Switch', icon: <YIcon /> },
    { id: 'X_TRACK', label: 'X-Crossing', icon: <XIcon /> }
  ];

  // Construction Tools (Left Side) - Primary
  const leftWrapper = {
    position: 'absolute',
    top: '50%',
    left: '20px',
    transform: 'translateY(-50%)',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    zIndex: 1000
  };

  // Utility Actions (Right Side) - Secondary
  const rightWrapper = {
    position: 'absolute',
    top: '50%',
    right: '20px',
    transform: 'translateY(-50%)',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    zIndex: 1000
  };

  const groupContainer = {
    ...glassStyle,
    padding: '12px 8px', // Refined padding
    flexDirection: 'column',
    gap: '10px',
  };

  const utilityContainer = {
    ...groupContainer,
    padding: '10px 6px', // Smaller padding for the smaller utility side
    gap: '8px',
  };

  const getButtonStyle = (id, type = 'track') => {
    const isHovered = hovered === id;
    const isActive = activeTool === id;

    let bgColor = type === 'action' ? utilityColor : idleTrackColor;
    if (isActive || isHovered) bgColor = activeTrackColor;

    // Refined Sizes: 38px for tools, 32px for utilities
    const size = type === 'action' ? '32px' : '38px';

    return {
      width: size,
      height: size,
      borderRadius: '10px', // Slightly smaller radius to match new size
      border: 'none',
      outline: 'none',
      backgroundColor: bgColor,
      color: iconColor,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      transform: (isHovered || isActive) ? 'scale(1.1)' : 'scale(1)',
    };
  };

  return (
    <>
      {/* SECTION 1: Construction Tools (LEFT) */}
      <div style={leftWrapper}>
        <div style={groupContainer}>
          {tools.map((tool) => (
            <button
              key={tool.id}
              title={tool.label}
              style={getButtonStyle(tool.id, 'track')}
              onMouseEnter={() => setHovered(tool.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onSelectTool(activeTool === tool.id ? null : tool.id)}
            >
              {/* Ensure icons scale down if needed */}
              <div style={{ transform: 'scale(0.85)' }}>{tool.icon}</div>
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 2: File Management (RIGHT) */}
      <div style={rightWrapper}>
        <div style={utilityContainer}>
          <button 
            title="Reset Scene"
            style={getButtonStyle('reset', 'action')}
            onClick={onReset}
            onMouseEnter={() => setHovered('reset')} 
            onMouseLeave={() => setHovered(null)}
          >
            <div style={{ transform: 'scale(0.8)' }}><ActionIcon type="reset" /></div>
          </button>

          <button 
            title="Save Track Layout"
            style={getButtonStyle('save', 'action')}
            onClick={onSave}
            onMouseEnter={() => setHovered('save')} 
            onMouseLeave={() => setHovered(null)}
          >
            <div style={{ transform: 'scale(0.8)' }}><ActionIcon type="save" /></div>
          </button>

          <label 
            title="Load Track Layout"
            onMouseEnter={() => setHovered('load')} 
            onMouseLeave={() => setHovered(null)}
            style={{ ...getButtonStyle('load', 'action'), cursor: 'pointer' }}
          >
            <div style={{ transform: 'scale(0.8)' }}><ActionIcon type="load" /></div>
            <input type="file" accept=".json" style={{ display: 'none' }} onChange={onLoad} />
          </label>
        </div>
      </div>
    </>
  );
};

export default Toolbar;