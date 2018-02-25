import axios from "axios";
import b64toBlob from "b64-to-blob";
import { IBufferedDetection } from "./recognition/logic";

const ROOT_DOMAIN = "personal-dashboard-api.herokuapp.com";

export async function recognize(image: string): Promise<string[]> {
  const data = new FormData();

  data.append(
    "file",
    b64toBlob(image.replace("data:image/png;base64,", ""), "image/png")
  );

  const res = await axios.post(`https://${ROOT_DOMAIN}/recognize`, data);
  return res.data.FaceMatches.map((match: any) => match.Face.ExternalImageId);
}

export async function transform(image: string): Promise<string> {
  const data = new FormData();

  data.append(
    "file",
    b64toBlob(image.replace("data:image/png;base64,", ""), "image/png")
  );

  const res = await axios.post(`https://${ROOT_DOMAIN}/transform`, data);
  return res.data;
}

export async function createModelForFace(
  id: string,
  bufferItem: IBufferedDetection[]
) {
  for (const item of bufferItem) {
    const data = new FormData();

    data.append("id", id);
    data.append(
      "file",
      b64toBlob(item.image.replace("data:image/png;base64,", ""), "image/png")
    );
    try {
      await axios.post(`https://${ROOT_DOMAIN}/faces`, data);
      // tslint:disable
    } catch (error) {
      console.log("error", error);
    }
  }
}

export async function getMissingHours(userId: string) {
  const response = await axios.get(
    `https://${ROOT_DOMAIN}/missing-hours/${userId}`
  );
  return response.data.missing;
}

export function connectWebsocket() {
  return new WebSocket(`wss://${ROOT_DOMAIN}`, ["websocket"]);
}
