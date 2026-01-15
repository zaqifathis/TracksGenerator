

# Constraint-Based Modular 3D Track Engine
A browser-based interactive 3D system built with React and React Three Fiber (R3F) that enables users to design modular track layouts using constraint-based snapping and precise spatial transforms.  
The engine is based on LEGO Duplo train tracks and implements LDraw Units (LDU) from this references. It supports drag-and-drop editing, deterministic connection rules, and serialization of track graphs for saving and loading layouts.
The architecture separates data representation, interaction logic, and rendering, allowing layouts to be serialized and restored consistently across sessions.


## Controls
- Add Track:
    - Select a track type and place it on the canvas
    - Right click for flip the curved track
    - Press ``ESC`` to unselect the active track
- Delete track: 
    - Hover over a placed track and click to remove it


## Available track components
- Standard straight track
- Standard curved track
- Y track
- X track 
- Bridge (planned)
- 

## Running the project
```bash
npm install         # install dependencies (first run only)
npm run dev         # start the development server
