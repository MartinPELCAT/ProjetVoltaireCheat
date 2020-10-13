import { MessageType } from "../types/ChromeRuntime";

export const scriptVoltaire = async function () {
  if (!document.getElementById("cardou")) {
    const card = document.createElement("div");
    card.id = "cardou";
    card.style.position = "fixed";
    card.style.bottom = "0";
    card.style.left = "0";
    card.style.width = "600px";
    card.style.height = "200px";
    card.style.zIndex = "9999";
    card.style.padding = "10px";
    card.style.backgroundColor = "gray";

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
        //Found a diff!
        if (currentRange === undefined) {
          //Start a new range
          currentRange = [i];
        }
      }
      if (currentRange !== undefined && text1[i] === text2[i]) {
        //End of range!
        currentRange.push(i);
        diffRange.push(currentRange);
        currentRange = undefined;
      }
    }
    //Push any last range if there's still one at the end
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

  chrome.runtime.onConnect.addListener((port) => {
    port.onMessage.addListener((message: MessageType) => {
      const lastSentences: string[] = [];
      if (message.type === "startSession") {
        port.postMessage(getSentence());
        const { observe } = new MutationObserver(() => {
          const sentence = getSentence();
          changeCardSpan(sentence);
          if (!lastSentences.includes(sentence)) {
            lastSentences.push(sentence);
            port.postMessage(sentence);
          }
        });

        observe(document, {
          subtree: true,
          attributes: true,
          childList: true,
        });
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
          changeCardSpan(`<h1>Correct</h1>`);
        }
        // changeCardSpan(JSON.stringify(message.value));
      }
    });
  });
};
