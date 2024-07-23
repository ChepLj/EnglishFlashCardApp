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
  const [filePathCheckOk, setFilePathCheckOk] = useState("");
  const [dbPathSetting, setDbPathSetting] = useState("");
  const [dataMain, setDataMain] = useState({});
  const [words, setWords] = useState([{ English: "English", Ipa: "Ipa", Vietnamese: "Vietnamese" }]);
  const [errorMessage, setErrorMessage] = useState("");
  const [randomMode, setRandomMode] = useState(false);
  const [selectedSheets, setSelectedSheets] = useState([]);

  const makeData = (data, sheetSelected) => {
    console.log("🚀 ~ makeData ~ sheetSelected:", sheetSelected)
    const array = sheetSelected?.map((item) => {
      return data[item];
    });
console.log(array.flat())
    return array.flat();
  };
  useEffect(() => {
    window.ipc.send("load-settings");
  }, []);
  useEffect(() => {
    window.ipc.receive("load-settings-reply", (data) => {
      console.log("🚀 ~ window.ipc.receive ~ data:", data)
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
        setDbPathSetting(data.filePath || "");
       
      }
    });
    window.ipc.receive("load-excel-file-startup-reply", (result) => {
      console.log(selectedSheets)
      if (result.success) {
        setDataMain(result.data);
        setWords(makeData(result.data, selectedSheets));
        setErrorMessage("");
        setFilePathCheckOk(result.filePath);
      } else {
        setErrorMessage(result.message);
        setFilePathCheckOk("");
        setShowSettings(true);
      }
        
    });
  }, []);
  useEffect(() => {
    if (dataMain) {
      console.log(selectedSheets)
      setWords(makeData(dataMain, selectedSheets));
  }}, [selectedSheets]);

  useEffect(() => {
    if (dbPathSetting) {
      console.log( dbPathSetting)
      window.ipc.send("load-excel-file-startup", dbPathSetting);
    } else {
      setErrorMessage("Select Excel file");
      setShowSettings(true);
    }
  }, [dbPathSetting]);

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
      if (randomMode) {
        console.log(words);
        const index = Math.floor(Math.random() * words.length);
        console.log("🚀 ~ changeCard ~ index:", index);
        setIndex(index);
      } else {
        setIndex((prevIndex) => {
          if (prevIndex < words.length - 1) return prevIndex + 1;
          else return 0;
        });
      }
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
          window.ipc.send("flashcard-size", {
            width: 0,
            height: 0,
          });
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
      setDataMain(result.data);
      console.log("🚀 ~ handleSelectFile ~ result.data:", result.data);
      setErrorMessage("");
      setFilePathCheckOk(result.filePath);
    } else {
      setErrorMessage(result.message);
      setFilePathCheckOk("");
    }
  };
  console.log(dataMain);
  console.log(words);
  console.log(index);

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
          filePath={filePathCheckOk}
          errorMessage={errorMessage}
          sheets={dataMain}
          handelSentFlashCardSize={handelSentFlashCardSize}
        />
      )}
    </section>
  );
};

export default FlashCard;
