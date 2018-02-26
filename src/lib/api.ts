import axios from "axios";
import b64toBlob from "b64-to-blob";
import { IBufferedDetection } from "./recognition/logic";
import { imageDataToBlob } from "../utils/image";

const ROOT_DOMAIN = "personal-dashboard-api.herokuapp.com";
const ROOT = `https://${ROOT_DOMAIN}`;

export async function recognize(image: string): Promise<string[]> {
  const data = new FormData();

  data.append(
    "file",
    b64toBlob(image.replace("data:image/png;base64,", ""), "image/png")
  );

  const res = await axios.post(`${ROOT}/recognize`, data);
  return res.data.FaceMatches.map((match: any) => match.Face.ExternalImageId);
}

export async function transform(image: string): Promise<string> {
  const data = new FormData();

  data.append(
    "file",
    b64toBlob(image.replace("data:image/png;base64,", ""), "image/png")
  );

  const res = await axios.post(`${ROOT}/transform`, data);
  return res.data;
}

export async function createModelForFace(
  id: string,
  buffer: IBufferedDetection[]
) {
  await Promise.all(
    buffer.map(async item => {
      const data = new FormData();

      try {
        data.append("id", id);
        data.append("file", await imageDataToBlob(item.image, "image/png"));
        await axios.post(`${ROOT}/faces`, data);
      } catch (error) {
        console.log("error", error);
      }
    })
  );
}

export async function getMissingHours(userId: string) {
  const response = await axios.get(`${ROOT}/missing-hours/${userId}`);
  return response.data.missing;
}

export function connectWebsocket() {
  const ws = new WebSocket(`wss://${ROOT_DOMAIN}`, ["websocket"]);
  ws.binaryType = "arraybuffer";
  return ws;
}
