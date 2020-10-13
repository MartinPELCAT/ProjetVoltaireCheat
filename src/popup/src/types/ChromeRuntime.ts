export type MessageType =
  | {
      type: "startSession" | "sentenceChange";
    }
  | { type: "sentenceResponse"; value: any };
