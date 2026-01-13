
import { glassStyle } from './glassStyle';

const buttonColor = 'rgba(153, 153, 153, 0.4)'

const TrackCounter = ({ tracks = [] }) => {
  const straightCount = tracks.filter(t => t.type === 'STRAIGHT').length;
  const curveCount = tracks.filter(t => t.type === 'CURVED').length;

  const containerStyle = {
    ...glassStyle,
    position: 'absolute',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    alignItems: 'center',
    gap: '25px', // Gap between the Straight group and Curve group
    padding: '6px 12px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: '13px',
    color: 'white',
    pointerEvents: 'none'
  };

  // Style for the text "pills" that look like the toolbar buttons
  const labelPillStyle = (color) => ({
    backgroundColor: color,
    padding: '4px 12px',
    borderRadius: glassStyle.borderRadius,
    fontWeight: '500',
    display: 'inline-block',
  });

  const sectionStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px' // Gap between the label pill and the number
  };

  const numberStyle = {
    fontWeight: 'bold',
    fontSize: '14px',
    minWidth: '15px',
    color: 'black'
  };

  return (
    <div style={containerStyle}>
      {/* Straight Section */}
      <div style={sectionStyle}>
        <div style={labelPillStyle(buttonColor)}>Straight</div>
        <div style={numberStyle}>{straightCount}</div>
      </div>

      {/* Curve Section */}
      <div style={sectionStyle}>
        <div style={labelPillStyle(buttonColor)}>Curve</div>
        <div style={numberStyle}>{curveCount}</div>
      </div>
    </div>
  );
};

export default TrackCounter;