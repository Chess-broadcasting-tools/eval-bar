import React, { useState } from 'react';
import { MuiColorInput } from 'mui-color-input';
import './CustomizeEvalBar.css'; // Ensure this CSS file is correctly linked

function CustomizeEvalBar({ customStyles, setCustomStyles }) {
    const [selectedComponent, setSelectedComponent] = useState('');
    const [showCustomization, setShowCustomization] = useState(false);

    const componentsList = [
        { value: 'evalContainerBg', label: 'Eval Container Background' },
        { value: 'blackBarColor', label: 'Black Bar Color' },
        { value: 'whiteBarColor', label: 'White Bar Color' },
        { value: 'whitePlayerColor', label: 'White Player Color' },
        { value: 'blackPlayerColor', label: 'Black Player Color' },
        { value: 'whitePlayerNameColor', label: 'White Player Name Color' },
        { value: 'blackPlayerNameColor', label: 'Black Player Name Color' },
        { value: 'evalContainerBorderColor', label: 'Eval Container Border Color' }
    ];

    const handleChangeComplete = (color) => {
        if (selectedComponent) {
            setCustomStyles({ ...customStyles, [selectedComponent]: color });
        }
    };

    const handleSaveStyles = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(customStyles));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "colorProfile.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleImportStyles = (event) => {
        const fileReader = new FileReader();
        fileReader.readAsText(event.target.files[0], "UTF-8");
        fileReader.onload = e => {
            const importedStyles = JSON.parse(e.target.result);
            setCustomStyles(importedStyles);
        };
    };

    return (
        <div className="customize-eval-bar">
            <button onClick={() => setShowCustomization(!showCustomization)} className="primary-button">
                Customize the Bars
            </button>

            <input type="file" id="fileInput" style={{ display: 'none' }} onChange={handleImportStyles} />
            <label htmlFor="fileInput" className="primary-button">Import Theme</label>

            {showCustomization && (
                <div className="customization-content">
                    <select value={selectedComponent} onChange={e => setSelectedComponent(e.target.value)}>
                        <option value="">Select Component to Customize</option>
                        {componentsList.map((component) => (
                            <option key={component.value} value={component.value}>{component.label}</option>
                        ))}
                    </select>

                    <button className="save-button" onClick={handleSaveStyles}>Save</button>

                    {selectedComponent && (
                        <div className="color-picker-container">
                            <p className="customizing-label">Customizing: {selectedComponent.split(/(?=[A-Z])/).join(" ")}</p>
                            <MuiColorInput
                                value={customStyles[selectedComponent]}
                                onChange={(color) => handleChangeComplete(color)}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default CustomizeEvalBar;
