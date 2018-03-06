import axios from "axios";
import b64toBlob from "b64-to-blob";
import { IBufferedDetection } from "./recognition/logic";
import { imageDataToBlob } from "../utils/image";
import { API_ROOT, WEBSOCKET_ADDRESS } from "../utils/config";

export interface IPerson {
  username: string;
  first: string;
  last: string;
  team: string;
  competence: string;
  supervisor: string;
  supervisorName: string;
  start: string;
  end?: string;
  active: string;
  missingHours: number;
}

export async function recognize(image: string): Promise<IPerson[]> {
  const data = new FormData();

  data.append(
    "file",
    b64toBlob(image.replace("data:image/png;base64,", ""), "image/png")
  );

  const res = await axios.post(`${API_ROOT}/recognize`, data);
  return res.data;
}

export async function transform(image: string): Promise<string> {
  const data = new FormData();

  data.append(
    "file",
    b64toBlob(image.replace("data:image/png;base64,", ""), "image/png")
  );

  const res = await axios.post(`${API_ROOT}/transform`, data);
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
        await axios.post(`${API_ROOT}/faces`, data);
      } catch (error) {
        console.log("error", error);
      }
    })
  );
}

export async function getMissingHours(userId: string) {
  const response = await axios.get(`${API_ROOT}/missing-hours/${userId}`);
  return response.data.missing;
}

export async function getPeople(search: string): Promise<IPerson[]> {
  const res = await axios.get(`${API_ROOT}/people/?q=${search}`);
  return res.data;
}

export async function getPerson(username: string): Promise<IPerson> {
  const res = await axios.get(`${API_ROOT}/people/${username}`);
  return res.data;
}

export function connectWebsocket() {
  const ws = new WebSocket(WEBSOCKET_ADDRESS, ["websocket"]);
  ws.binaryType = "arraybuffer";
  return ws;
}
