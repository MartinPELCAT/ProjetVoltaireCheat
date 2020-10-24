import { MessageType } from "../types/ChromeRuntime";

export const scriptVoltaire = async function () {
  if (!document.getElementById("cardou")) {
    const close = document.createElement("div");
    close.innerHTML = "X";
    close.style.color = "white";
    close.style.position = "absolute";
    close.style.top = "2px";
    close.style.right = "2px";

    const card = document.createElement("div");
    card.appendChild(close);
    card.id = "cardou";
    card.style.position = "fixed";
    card.style.bottom = "0";
    card.style.left = "0";
    card.style.width = "600px";
    card.style.height = "200px";
    card.style.zIndex = "9999";
    card.style.padding = "10px";
    card.style.backgroundColor = "gray";
    close.addEventListener("click", () => {
      card.remove();
    });
    const span = document.createElement("span");
    span.id = "mySpan";
    card.appendChild(span);
    document.getElementsByTagName("body")[0].appendChild(card);
  }

  const changeCardSpan = (value: string) => {
    document.getElementById("mySpan")!.innerHTML = value;
  };

  const getDiff = (text1: string, text2: string) => {
    var diffRange = [];
    var currentRange = undefined;
    for (var i = 0; i < text1.length; i++) {
      if (text1[i] !== text2[i]) {
        if (currentRange === undefined) {
          currentRange = [i];
        }
      }
      if (currentRange !== undefined && text1[i] === text2[i]) {
        currentRange.push(i);
        diffRange.push(currentRange);
        currentRange = undefined;
      }
    }
    if (currentRange !== undefined) {
      currentRange.push(i);
      diffRange.push(currentRange);
    }
    return diffRange;
  };

  const getSentence = () => {
    const sentenceArray: string[] = [];
    document
      .getElementsByClassName("sentence")[0]
      .childNodes.forEach((node) => {
        sentenceArray.push(node.textContent!);
      });
    return sentenceArray.join("");
  };

  const listener = (port: any) => {
    port.onMessage.addListener((message: MessageType) => {
      if (message.type === "startSession") {
        port.postMessage(getSentence());
        chrome.runtime.onConnect.removeListener(listener);
      } else if (message.type === "sentenceResponse") {
        const { value } = message;
        const card = document.getElementById("cardou")!;
        const span = document.getElementById("mySpan")!;
        if (value.corrections.length > 0) {
          card.style.backgroundColor = "#ff0033";
          span.style.color = "white";
          const diff = getDiff(getSentence(), message.value.text);
          let sen = getSentence();
          //We have to loop backwards, because
          for (var i = diff.length - 1; i >= 0; i--) {
            var range = diff[i];
            //Inject spans around the range
            var s = range[0]; //start
            var e = range[1]; //end
            sen =
              sen.slice(0, s) +
              "<strong style='color: lawngreen'>" +
              sen.slice(s, e) +
              "</strong>" +
              sen.slice(e);
          }
          changeCardSpan(`<h1>Faux</h1>
            <div>
            <span>Bon: ${message.value.text}</span>
            </div>
            <div>
              <span>Faux: ${sen}</span>
            </div>

          `);
        } else {
          card.style.backgroundColor = "#28a745";
          span.style.color = "white";
          changeCardSpan(`<h1>Correct</h1>
          <div>
          <span>Bon: ${message.value.text}</span>
          </div>
          `);
        }
      }
    });
  };

  chrome.runtime.onConnect.addListener(listener);
};
