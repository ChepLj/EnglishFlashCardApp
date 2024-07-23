import { useState, useEffect } from "react";
import "./Setting.css";

const Setting = ({ onClose, showSettings, handleSelectFile, filePath, errorMessage, sheets, handelSentFlashCardSize }) => {
  const [showEnglish, setShowEnglish] = useState(true);
  const [showIpa, setShowIpa] = useState(true);
  const [showVietnamese, setShowVietnamese] = useState(true);

  const [maleVoice, setMaleVoice] = useState(true);
  const [femaleVoice, setFemaleVoice] = useState(true);
  const [childVoice, setChildVoice] = useState(true);

  const [maleVoiceRepeat, setMaleVoiceRepeat] = useState(1);
  const [femaleVoiceRepeat, setFemaleVoiceRepeat] = useState(1);
  const [childVoiceRepeat, setChildVoiceRepeat] = useState(1);

  const [displayTime, setDisplayTime] = useState(5);
  const [delayTime, setDelayTime] = useState(3);
  const [randomMode, setRandomMode] = useState(false);
  const [selectedSheets, setSelectedSheets] = useState([]);

  useEffect(() => {
    window.ipc.receive("load-settings-reply", (data) => {
      if (data) {
        setShowEnglish(data.showEnglish || false);
        setShowIpa(data.showIpa || false);
        setShowVietnamese(data.showVietnamese || false);
        setMaleVoice(data.maleVoice || false);
        setFemaleVoice(data.femaleVoice || false);
        setChildVoice(data.childVoice || false);
        setMaleVoiceRepeat(data.maleVoiceRepeat || 1);
        setFemaleVoiceRepeat(data.femaleVoiceRepeat || 1);
        setChildVoiceRepeat(data.childVoiceRepeat || 1);
        setDisplayTime(data.displayTime || 5);
        setDelayTime(data.delayTime || 3);

        setRandomMode(data.randomMode || false);
        setSelectedSheets(data.selectedSheets || []);
      }
    });
  }, []);

  const handleSaveSettings = () => {
    if (filePath) {
      if(selectedSheets.length === 0) {
        alert("Please select at least one collection to display");
        return;
      }
      const settings = {
        showEnglish,
        showIpa,
        showVietnamese,
        maleVoice,
        femaleVoice,
        childVoice,
        maleVoiceRepeat,
        femaleVoiceRepeat,
        childVoiceRepeat,
        displayTime,
        delayTime,
        filePath,
        randomMode,
        selectedSheets,
      };
      window.ipc.send("save-settings", settings);
    } else {
      alert("Error to save ! \nCan't find database \nPlease select database file");
    }
  };

  const handleDisplayChange = (e) => {
    const { name, checked } = e.target;

    const totalChecked = [showEnglish, showIpa, showVietnamese].filter(Boolean).length;

    // Ensure at least one option is checked
    if (totalChecked === 1 && !checked) {
      return;
    }
    if (name === "showEnglish") setShowEnglish(checked);
    if (name === "showIpa") setShowIpa(checked);
    if (name === "showVietnamese") setShowVietnamese(checked);
  };

  const handleVoiceChange = (e) => {
    const { name, checked } = e.target;
    if (name === "maleVoice") setMaleVoice(checked);
    if (name === "femaleVoice") setFemaleVoice(checked);
    if (name === "childVoice") setChildVoice(checked);
  };

  const handleVoiceRepeatChange = (e) => {
    const { name, value } = e.target;
    if (name === "maleVoiceRepeat") setMaleVoiceRepeat(value);
    if (name === "femaleVoiceRepeat") setFemaleVoiceRepeat(value);
    if (name === "childVoiceRepeat") setChildVoiceRepeat(value);
  };

  const handleSpeedChange = (e) => {
    const { name, value } = e.target;
    if (name === "displayTime") setDisplayTime(value);
    if (name === "delayTime") setDelayTime(value);
  };

  const handleSheetChange = (e) => {
    const { name, checked } = e.target;
    
    setSelectedSheets((prev) => (checked ? [...prev, name] : prev.filter((sheet) => sheet !== name)));
  };
  useEffect(() => {
    handelSentFlashCardSize();
    setSelectedSheets([])
  }, [filePath]);
  console.log(sheets)
  return (
    <div className="setting">
      <div className="left-section">
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
        <div className="group display-options">
          <h3>Hiển thị</h3>
          <label>
            <input type="checkbox" checked={showEnglish} onChange={handleDisplayChange} name="showEnglish" />
            Hiển thị tiếng Anh
          </label>
          <label>
            <input type="checkbox" checked={showIpa} onChange={handleDisplayChange} name="showIpa" />
            Hiển thị Ipa
          </label>
          <label>
            <input type="checkbox" checked={showVietnamese} onChange={handleDisplayChange} name="showVietnamese" />
            Hiển thị tiếng Việt
          </label>
        </div>
        <div className="group sound-options">
          <h3>Âm thanh</h3>
          <div className="voice-option">
            <label>
              <input type="checkbox" checked={maleVoice} onChange={handleVoiceChange} name="maleVoice" />
              Giọng nam
            </label>
            <input type="number" value={maleVoiceRepeat} onChange={handleVoiceRepeatChange} name="maleVoiceRepeat" min="1" />
          </div>
          <div className="voice-option">
            <label>
              <input type="checkbox" checked={femaleVoice} onChange={handleVoiceChange} name="femaleVoice" />
              Giọng nữ
            </label>
            <input type="number" value={femaleVoiceRepeat} onChange={handleVoiceRepeatChange} name="femaleVoiceRepeat" min="1" />
          </div>
          <div className="voice-option">
            <label>
              <input type="checkbox" checked={childVoice} onChange={handleVoiceChange} name="childVoice" />
              Giọng trẻ em
            </label>
            <input type="number" value={childVoiceRepeat} onChange={handleVoiceRepeatChange} name="childVoiceRepeat" min="1" />
          </div>
        </div>
        <div className="group speed-options">
          <h3>Tốc độ</h3>
          <div className="speed-option">
            <label>Time hiển thị cộng thêm(s)</label>
            <input type="number" value={displayTime} onChange={handleSpeedChange} name="displayTime" min="1" />
          </div>
          <div className="speed-option">
            <label>Thời gian ẩn(s)</label>
            <input type="number" value={delayTime} onChange={handleSpeedChange} name="delayTime" min="1" />
          </div>
        </div>
        <div className="group database-options">
          <h3>Database</h3>
          <div className="database-option">
            <button onClick={handleSelectFile}>Select Excel File</button>
            <div className={filePath ? "database-option_text" : "database-option_label"}>{filePath || "Data not found"}</div>
            <div className="database-option_label">{errorMessage}</div>
          </div>
        </div>
        <button className="save-setting-button" onClick={handleSaveSettings}>
          Save Settings
        </button>
      </div>
      {filePath && (
        <div className="right-section">
          <div className="group sheet-options">
            <h3>Database</h3>
            <ol className="sheet-option-list">
              {sheets &&
                Object.keys(sheets).map((sheet, index) => (
                  <li key={index} className="sheet-option-item">
                    <label>
                      <input type="checkbox" checked={selectedSheets.includes(sheet)} onChange={handleSheetChange} name={sheet} />
                      {sheet}
                    </label>
                    <label className="label">{sheets[sheet].length} words</label>
                  </li>
                ))}
            </ol>
          </div>
          <div className="group random-mode">
            <label>
              <input type="checkbox" checked={randomMode} onChange={(e) => setRandomMode(e.target.checked)} />
              Random Mode
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default Setting;
