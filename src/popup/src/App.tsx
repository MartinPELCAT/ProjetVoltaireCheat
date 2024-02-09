import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { scriptVoltaire } from "./script-voltaire/script.voltaire";
import { MessageType } from "./types/ChromeRuntime";
import Button from "./components/Button";

export function App() {
  const [sentence, setSentence] = useState("");

  const fetchSentence = useCallback(async (string: string) => {
    return axios.post("https://orthographe.reverso.net/api/v1/Spelling", {
      language: "fra",
      text: string,
      autoReplace: true,
      interfaceLanguage: "fr",
      locale: "Indifferent",
      origin: "interactive",
      generateSynonyms: false,
      getCorrectionDetails: true,
    });
  }, []);

  const startScript = useCallback(() => {
    chrome.tabs.executeScript(
      {
        code: `(${scriptVoltaire})()`,
      },
      async () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const port = chrome.tabs.connect(tabs[0].id as number);
          const initSession: MessageType = { type: "startSession" };
          port.postMessage(initSession);
          port.onMessage.addListener(async (response) => {
            if (sentence !== response) {
              setSentence((res) => res);

              const { data } = await fetchSentence(response);
              const sentenceResponse: MessageType = {
                type: "sentenceResponse",
                value: data,
              };
              port.postMessage(sentenceResponse);
            }
          });
        });
      }
    );
  }, []);

  useEffect(() => {
    chrome.runtime.connect();
    startScript();
  }, []);

  return (
    <div className="bg-gray-400 text-center lg:px-4 w-64 p-2">
      <Button onClick={startScript}>Lancer une session !!</Button>
    </div>
  );
}
