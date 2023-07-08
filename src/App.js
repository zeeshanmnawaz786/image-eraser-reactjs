import React, { useRef, useEffect, useState } from "react";
import Konva from "konva";
import { Stage, Layer, Image } from "react-konva";

const App = () => {
  const stageRef = useRef(null);
  const imageRef = useRef(null);
  const drawingLayerRef = useRef(null);
  const canvasRef = useRef(null);
  const fileUploadRef = useRef(null);
  const [lastPointerPosition, setLastPointerPosition] = useState({
    x: 0,
    y: 0,
  });
  const [mode, setMode] = useState("eraser");
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const stage = stageRef.current.getStage();

    const readImage = () => {
      const file = fileUploadRef.current.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new window.Image();
          img.onload = () => {
            const canvas = canvasRef.current;
            const context = canvas.getContext("2d");
            context.drawImage(img, 0, 0, canvas.width, canvas.height);

            const imageDataURL = canvas.toDataURL();
            const newImage = new window.Image();
            newImage.src = imageDataURL;

            imageRef.current.image(newImage);

            const layer = stage.findOne(".drawingLayer");
            layer.batchDraw();
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    };

    fileUploadRef.current.addEventListener("change", readImage, false);

    return () => {
      fileUploadRef.current.removeEventListener("change", readImage, false);
    };
  }, []);

  const handleToolChange = (e) => {
    const selectedMode = e.target.value;
    setMode(selectedMode);
  };

  const handleMouseDown = () => {
    setIsDrawing(true);
  };

  const handleMouseMove = (e) => {
    const stage = stageRef.current.getStage();
    const position = stage.getPointerPosition();

    if (isDrawing) {
      if (mode === "eraser") {
        const { x, y } = position;
        const radius = 5; // Adjust the radius as desired
        const imageWidth = imageRef.current.width();
        const imageHeight = imageRef.current.height();
        const imageX = imageRef.current.x();
        const imageY = imageRef.current.y();

        // Calculate the bounds of the green border
        const minX = imageX + radius;
        const minY = imageY + radius;
        const maxX = imageX + imageWidth - radius;
        const maxY = imageY + imageHeight - radius;

        // Check if the eraser is within the bounds of the green border
        if (x >= minX && y >= minY && x <= maxX && y <= maxY) {
          const newLine = new Konva.Circle({
            stroke: "white",
            strokeWidth: 20,
            radius: radius,
            globalCompositeOperation: "source-over",
            x: x,
            y: y,
          });

          drawingLayerRef.current.add(newLine);
          setLastPointerPosition(position);
          stage.batchDraw();
        }
      }
    }

    setLastPointerPosition(position);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleDownload = () => {
    const stage = stageRef.current.getStage();
    const dataURL = stage.toDataURL();
    const downloadLink = document.createElement("a");
    downloadLink.href = dataURL;
    downloadLink.download = "drawing.png";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div>
      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={window.innerHeight - 45}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <Layer>
          <Image
            ref={imageRef}
            x={stageRef.current?.getWidth() / 4}
            y={stageRef.current?.getHeight() / 4}
            stroke="green"
          />
        </Layer>
        <Layer ref={drawingLayerRef} name="drawingLayer"></Layer>
      </Stage>
      <canvas
        ref={canvasRef}
        width={stageRef.current?.getWidth() / 2}
        height={stageRef.current?.getHeight() / 2}
        style={{ display: "none" }}
      ></canvas>
      <div id="menuWrapper">
        <input type="file" ref={fileUploadRef} />
        Tool:
        <select id="tool" onChange={handleToolChange} value={mode}>
          <option value="eraser">Erase</option>
        </select>
        <button onClick={handleDownload}>Download</button>
      </div>
    </div>
  );
};

export default App;
