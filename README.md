#  RAILSNAP
## Constraint-Based Modular 3D Track
A browser-based interactive 3D system built with React and React Three Fiber (R3F) that enables users to design modular track layouts using constraint-based snapping and spatial transforms. The design is inspired by LEGO Duplo train tracks and implements LDraw Units (LDU). It supports drag-and-drop editing, deterministic connection rules, and serialization of track graphs for saving and loading layouts.

## Controls
- **Add Track**: 
    - Select a track type from the left toolbar and place it on the canvas.
    - While placing, **Right Click** to flip curved tracks (Left/Right).
    - Press **ESC** to unselect the active track tool.
- **Delete Track**: 
    - Hover over a placed track and click to remove it.
- **Navigation**:
    - **Left Click + Drag**: Rotate (3D mode) or Pan (2D mode).
    - **Right Click + Drag**: Pan.
    - **Scroll**: Zoom in/out.
- **View Management**:
    - Toggle between **2D (Top-down)** and **3D** perspectives.

## Available Track Components
The system currently supports the following modular components:
- Standard straight track
- Standard curved track
- Y-Switch track
- X-Cross track (60° and 90° variants)

## Key Technical Features
- **Deterministic Snapping**: Uses a port-based connection system where tracks automatically align and link their spatial coordinates.
- **State Management**: Track data (position, rotation, type, and connections) is managed via a custom `useTrackManager` hook and persisted using `useTrackStorage`.
- **Scene Persistence**: Export and import your track layouts as `.json` files via the right-side toolbar.

## Running the Project

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
