import React, { useState, useRef, useEffect } from 'react';
import './CanvasEditor.css'; 

const CanvasEditor = () => {
  const canvasRef = useRef(null);
  const [ctx, setCtx] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [captionText, setCaptionText] = useState('1 & 2 BHK Luxury Apartments at just Rs.34.97 Lakhs');
  const [ctaText, setCtaText] = useState('Shop Now');
  const [bgColor, setBgColor] = useState('#0369A1');
  const [templateData, setTemplateData] = useState({
    caption: {
      text: "1 & 2 BHK Luxury Apartments at just Rs.34.97 Lakhs",
      position: { x: 50, y: 50 },
      font_size: 44,
      alignment: "left",
      text_color: "#FFFFFF",
      max_characters_per_line: 31
    },
    cta: {
      text: "Shop Now",
      position: { x: 50, y: 100 }, 
      font_size: 30,
      text_color: "#000000",
      background_color: "#FFFFFF",
      padding: "2vw"
    },
    image_mask: { x: 56, y: 442, width: 970, height: 600 },
    urls: {
      mask: "https://d273i1jagfl543.cloudfront.net/templates/global_temp_landscape_temp_10_mask.png",
      stroke: "https://d273i1jagfl543.cloudfront.net/templates/global_temp_landscape_temp_10_Mask_stroke.png",
      design_pattern: "https://d273i1jagfl543.cloudfront.net/templates/global_temp_landscape_temp_10_Design_Pattern.png"
    }
  });
  const [pickedColors, setPickedColors] = useState([]);
  const [showColorPicker, setShowColorPicker] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    setCtx(context);
  }, []);

  const loadImage = (url) => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = (error) => reject(error);
      image.src = url;
    });
  };

  useEffect(() => {
    if (!ctx) return;

    const drawCanvas = async () => {

      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
      const designPattern = await loadImage(templateData.urls.design_pattern);
      ctx.drawImage(designPattern, 0, 0, canvasRef.current.width, canvasRef.current.height);
    
      const mask = await loadImage(templateData.urls.mask);
      ctx.drawImage(mask, templateData.image_mask.x, templateData.image_mask.y, templateData.image_mask.width, templateData.image_mask.height);
    

      if (uploadedImage) {
        ctx.globalCompositeOperation = 'source-atop';
        ctx.drawImage(uploadedImage, templateData.image_mask.x, templateData.image_mask.y, templateData.image_mask.width, templateData.image_mask.height);
        ctx.globalCompositeOperation = 'source-over';
      }
    

      ctx.font = `${templateData.caption.font_size}px Arial`;      // For Caption Text
      ctx.fillStyle = templateData.caption.text_color;
      ctx.textAlign = templateData.caption.alignment;
      const lines = getLines(ctx, captionText, templateData.caption.max_characters_per_line);
      const lineHeight = templateData.caption.font_size + 10; 
      lines.forEach((line, index) => {
        const yPos = templateData.caption.position.y + (index * lineHeight);
        ctx.fillText(line, templateData.caption.position.x, yPos);
      });
    

      ctx.font = `${templateData.cta.font_size}px Arial`;      // For CTA text
      ctx.fillStyle = templateData.cta.text_color;
      
      const ctaWidth = ctx.measureText(templateData.cta.text).width;
      const ctaX = templateData.cta.position.x;
      let ctaY = templateData.cta.position.y;
      ctaY += (lines.length * lineHeight) + 30; 
      ctx.fillStyle = templateData.cta.background_color;
      ctx.fillRect(ctaX, ctaY, ctaWidth + 40, templateData.cta.font_size + 20); 
      ctx.fillStyle = templateData.cta.text_color;
      ctx.fillText(templateData.cta.text, ctaX + 20, ctaY + 35);
    };
    
    const getLines = (ctx, text, maxCharsPerLine) => {
      const words = text.split(' ');
      const lines = [];
      let currentLine = '';

      words.forEach(word => {
        if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
          currentLine += ' ' + word;
        } else {
          lines.push(currentLine.trim());
          currentLine = word;
        }
      });
      lines.push(currentLine.trim());
      return lines;
    };
    
    drawCanvas();
  }, [ctx, uploadedImage, bgColor, captionText, templateData]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        setUploadedImage(img);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleCaptionChange = (event) => {
    setCaptionText(event.target.value);
  };

  const handleCtaChange = (event) => {
    setCtaText(event.target.value);
    setTemplateData(prevState => ({
      ...prevState,
      cta: {
        ...prevState.cta,
        text: event.target.value
      }
    }));
  };

  const handleBgColorChange = (event) => {
    setBgColor(event.target.value);
  };

  const handleColorPick = (color) => {
    setBgColor(color);
    setPickedColors(prevColors => [...prevColors.slice(-4), color]);
    setShowColorPicker(false);
  };

  const toggleColorPicker = () => {
    setShowColorPicker(prevState => !prevState);
  };

  return (
    <div className="CanvasEditorContainer">
      <div className="CanvasEditorCanvasContainer">
        <canvas
          ref={canvasRef}
          className="CanvasEditorCanvas"
          height={1080}
          width={1080}
        />
      </div>
      <div className="CanvasEditorCaptionContainer">
        <div className="CanvasEditorCaptionData">
          <div className="Top_part" ><b>Ad Customization</b></div>
          <div className="Top_below_part" >Customize the add and get template accordingly</div>
          <div className="CanvasEditorUpload">
            <label htmlFor="imageUpload" className="CanvasEditorLabel">Change the ad creative image</label><input type="file" id="imageUpload" accept="image/*" onChange={handleImageUpload} />
          </div>
          <div className="Top_below_part">Edit Contents</div>
          <hr></hr>
          <div className="CanvasEditorInput">
            <label className="CanvasEditorLabel">Ad Content:</label>
            <input type="text" value={captionText} onChange={handleCaptionChange} />
          </div>
          <div className="CanvasEditorInput">
            <label className="CanvasEditorLabel">CTA:</label>
            <input type="text" value={ctaText} onChange={handleCtaChange} />
          </div>
          <div className="CanvasEditorInput">
            
            <div className="ColorPickerContainer">
    
             <div className="CanvasEditorInput">
  <label className="CanvasEditorLabel">Choose your color:</label>
  <div className="ColorPickerContainer">

    <div className="ColorPalette">

     <input  className="CircularColor" type="color" value={"#00F0F0"} onChange={handleBgColorChange}/>
     <input  className="CircularColor" type="color" value={"#00FF00" } onChange={handleBgColorChange}/>
     <input  className="CircularColor" type="color" value={"#0000FF"} onChange={handleBgColorChange}/>
     <input  className="CircularColor" type="color" value={"#FFFF00" } onChange={handleBgColorChange}/>
     <input  className="CircularColor" type="color" value={"#0F0F0F" } onChange={handleBgColorChange}/>
      {/* <div className="CircularColor" style={{ backgroundColor: "#00FF00" }} onClick={() => setBgColor("#00FF00")}></div>
      <div className="CircularColor" style={{ backgroundColor: "#0000FF" }} onClick={() => setBgColor("#0000FF")}></div>
      <div className="CircularColor" style={{ backgroundColor: "#FFFF00" }} onClick={() => setBgColor("#FFFF00")}></div> */}
      <button className="ColorPickerButton" onClick={toggleColorPicker}>+</button>
      {showColorPicker && (
      <div className="ColorPickerPopover">
        <input className="CircularColor" type="color" value={bgColor} onChange={(e) => handleColorPick(e.target.value)} />
      </div>
    )}
    </div>
   
  </div>
</div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvasEditor;
