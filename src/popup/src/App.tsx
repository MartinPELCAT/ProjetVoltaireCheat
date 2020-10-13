import Axios from "axios";
import React, { useEffect } from "react";
import Button from "./components/Button";
import { scriptVoltaire } from "./scriptVoltaire/scriptVoltaire";
import { MessageType } from "./types/ChromeRuntime";

function App() {
  useEffect(() => {
    chrome.runtime.connect();
    startScript();
  }, []);

  const fetchSentence = async (sentence: string) => {
    return await Axios.post("https://orthographe.reverso.net/api/v1/Spelling", {
      language: "fra",
      text: sentence,
      autoReplace: true,
      interfaceLanguage: "fr",
      locale: "Indifferent",
      origin: "interactive",
      generateSynonyms: false,
      getCorrectionDetails: true,
    });
  };

  const startScript = () => {
    function connect() {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const port = chrome.tabs.connect(tabs[0].id as number);
        const initSession: MessageType = { type: "startSession" };

        port.postMessage(initSession);
        port.onMessage.addListener(async (response) => {
          const { data } = await fetchSentence(response);
          const sentenceResponse: MessageType = {
            type: "sentenceResponse",
            value: data,
          };
          port.postMessage(sentenceResponse);
        });
      });
    }
    chrome.tabs.executeScript(
      {
        code: `(${scriptVoltaire})()`,
      },
      async () => {
        connect();
      }
    );
  };

  return (
    <div className="bg-gray-400 text-center lg:px-4 w-64 p-2">
      <Button buttonText="Lancer une session !!" onClick={startScript} />
    </div>
  );
}

export default App;
