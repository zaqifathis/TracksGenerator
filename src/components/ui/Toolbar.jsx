import React from 'react';

const borderRad = '50px';

const Toolbar = () => {
  const buttonStyle = {
    padding: '10px 15px',
    margin: '0 5px',
    borderRadius: borderRad,
    border: 'none',
    backgroundColor: '#999999',
    color: 'white',
    cursor: 'pointer'
  };

  return (
    <div style={{
      position: 'absolute',
      bottom: '30px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      backgroundColor: 'rgba(248, 248, 248, 0.5)',
      padding: '15px',
      borderRadius: borderRad,
      boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
      backdropFilter: 'blur(4px)'
    }}>
      <button style={buttonStyle}>Straight</button>
      <button style={buttonStyle}>Curve Left</button>
      <button style={buttonStyle}>Curve Right</button>
      <div style={{ width: '30px' }} /> {/* Spacer */}
      <button style={{ ...buttonStyle, backgroundColor: '#52c796' }}>Save</button>
      <button style={{ ...buttonStyle, backgroundColor: '#4758cb' }}>Load</button>
    </div>
  );
};

export default Toolbar;