import React, { useState, useEffect, useRef } from "react";
import "./FlashCard.css";
import settingIcon from "./resources/icon-setting.png";
import speakerIcon from "./resources/icon-speaker.png";
import muteIcon from "./resources/icon-mute.png";
import Setting from "./Setting.js";


const FlashCard = () => {
  const [index, setIndex] = useState(0);
  const [show, setShow] = useState(true);
  const flashCardRef = useRef(null);
  // const words = data[1];
  const [showSettings, setShowSettings] = useState(false);
  const [showEnglish, setShowEnglish] = useState(true);
  const [showIpa, setShowIpa] = useState(true);
  const [showVietnamese, setShowVietnamese] = useState(true);
  const [displayTime, setDisplayTime] = useState(5);
  const [delayTime, setDelayTime] = useState(3);
  const timeoutIdRef = useRef(null);
  const timeoutReZeroSizeIdRef = useRef(null);
  const intervalIdRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false); // State to keep track of mute state
  const [filePath, setFilePath] = useState("");
  const [words, setWords] = useState([{ English: "English", Ipa: "Ipa", Vietnamese: "Vietnamese" }]);
  const [errorMessage, setErrorMessage] = useState("");
  const [randomMode, setRandomMode] = useState(false);
  const [selectedSheets, setSelectedSheets] = useState([]);



  const makeData = (data,sheetSelected, isRandom) => {
    const array = sheetSelected?.map((item) => data[item]);
    console.log("🚀 ~ makeData ~ array:", array)
    if (isRandom) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      console.log("🚀 ~ makeData ~ array:", array)
      return array;
    }
      
    return array;
  
  }
  useEffect(() => {
    window.ipc.send("load-settings");
  }, []);
  useEffect(() => {
    window.ipc.receive("load-settings-reply", (data) => {
      if (data) {
        setShowEnglish(data.showEnglish || false);
        setShowIpa(data.showIpa || false);
        setShowVietnamese(data.showVietnamese || false);
        // setMaleVoice(data.maleVoice || false);
        // setFemaleVoice(data.femaleVoice || false);
        // setChildVoice(data.childVoice || false);
        // setMaleVoiceRepeat(data.maleVoiceRepeat || 1);
        // setFemaleVoiceRepeat(data.femaleVoiceRepeat || 1);
        // setChildVoiceRepeat(data.childVoiceRepeat || 1);
        setDisplayTime(data.displayTime || 5);
        setDelayTime(data.delayTime || 3);
        setRandomMode(data.randomMode || false);
        setSelectedSheets(data.selectedSheets || []);
        // // setDbPath(data.dbPath || "");
        if (data.filePath) {
          window.ipc.send("load-excel-file-startup", data.filePath);
        } else {
          setErrorMessage("Select Excel file");
          setShowSettings(true);
        }
      }
    });
    window.ipc.receive("load-excel-file-startup-reply", (result) => {
      if (result.success) {
        setWords(result.data["t Sounds"]);
        console.log(makeData(result.data, selectedSheets, randomMode))
        setErrorMessage("");
        setFilePath(result.filePath);
      } else {
        setErrorMessage(result.message);
        setFilePath("");
        setShowSettings(true);
      }
    });
  }, []);

  useEffect(() => {
    if (!showSettings) {
      startCardRotation();
    } else {
      setShow(true);
    }

    return () => {
      clearTimers();
    };
  }, [showSettings, displayTime, delayTime]);

  const startCardRotation = () => {
    const changeCard = () => {
      setIndex((prevIndex) => {
        if (prevIndex < words.length - 1) return prevIndex + 1;
        else return 0;
      });
      setShow(true);
      const timeoutId = setTimeout(() => {
        !showSettings && setShow(false);
      }, displayTime * 1000);
      timeoutIdRef.current = timeoutId;
    };

    changeCard();
    const intervalId = setInterval(changeCard, (parseInt(delayTime) + parseInt(displayTime) + 1) * 1000);
    intervalIdRef.current = intervalId;
  };

  const clearTimers = () => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }
    if (timeoutReZeroSizeIdRef.current) {
      clearTimeout(timeoutReZeroSizeIdRef.current);
    }
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
    }
  };
  useEffect(() => {
    handelSentFlashCardSize();
  }, [showSettings]);

  const handelSentFlashCardSize = () => {
    if (flashCardRef.current) {
      const rect = flashCardRef.current.getBoundingClientRect();
      window.ipc.send("flashcard-size", {
        width: rect.width,
        height: rect.height,
      });
    }
  };

  useEffect(() => {
    // Gửi kích thước của phần tử flashcard về main process
    if (show) {
      handelSentFlashCardSize();
    } else {
      const timeoutId = setTimeout(() => {
        if (!showSettings) {
          // window.ipc.send("flashcard-size", {
          //   width: 0,
          //   height: 0,
          // });
        }
      }, 1500);
      timeoutReZeroSizeIdRef.current = timeoutId;
      return () => {
        if (timeoutReZeroSizeIdRef.current) {
          clearTimeout(timeoutReZeroSizeIdRef.current);
        }
      };
    }
  }, [index, show]); // Gửi kích thước mỗi lần flashcard thay đổi
  const handleOpenSettings = () => {
    window.ipc.send("load-settings");
    setShowSettings(true);
    clearTimers();
    setShow(true);
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
    // handelSentFlashCardSize()
  };

  const handleToggleMute = () => {
    setIsMuted((prevIsMuted) => !prevIsMuted); // Toggle mute state
  };

  const handleSelectFile = async () => {
    const result = await window.electron.selectExcelFile();
    if (result.success) {
      setWords(result.data);
      console.log("🚀 ~ handleSelectFile ~ result.data:", result.data);
      setErrorMessage("");
      setFilePath(result.filePath);
    } else {
      setErrorMessage(result.message);
      setFilePath("");
    }
  };
  console.log(words);
  console.log(index)

  return (
    <section className="main" ref={flashCardRef}>
      <div className={`flashcard ${show ? "show" : ""}`}>
        <div className="dragGroup">
          {showEnglish && <div className="text">{words?.[index]?.English}</div>}
          {showIpa && <div className="ipa">{words?.[index]?.Ipa}</div>}
          {showVietnamese && <div className="translate">{words?.[index]?.Vietnamese}</div>}
        </div>
        <img src={isMuted ? muteIcon : speakerIcon} alt="Mute Icon" className="install-icon" onClick={handleToggleMute} />

        <img src={settingIcon} alt="Install Icon" className="install-icon" onClick={handleOpenSettings} />
      </div>
      {showSettings && (
        <Setting
          onClose={handleCloseSettings}
          showSettings={showSettings}
          handleSelectFile={handleSelectFile}
          filePath={filePath}
          errorMessage={errorMessage}
          sheets={words}
          handelSentFlashCardSize={handelSentFlashCardSize}
        />
      )}
    </section>
  );
};

export default FlashCard;
