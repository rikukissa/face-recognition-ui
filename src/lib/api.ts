import axios from "axios";
import b64toBlob from "b64-to-blob";
import { IBufferedDetection } from "./recognition/logic";
import { imageDataToBlob } from "../utils/image";

const WS_HOST = document.location.host;
const API_ROOT = "/api";

export async function recognize(image: string): Promise<string[]> {
  const data = new FormData();

  data.append(
    "file",
    b64toBlob(image.replace("data:image/png;base64,", ""), "image/png")
  );

  const res = await axios.post(`${API_ROOT}/recognize`, data);
  return res.data.FaceMatches.map((match: any) => match.Face.ExternalImageId);
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
export interface IPerson {
  id: string;
  firstname: string;
  lastname: string;
  office: string;
}

export async function getPeople(): Promise<IPerson[]> {
  return Promise.resolve([
    {
      firstname: "Rob",
      lastname: "Ace",
      office: "London",
      id: "acer"
    },
    {
      firstname: "Matilda",
      lastname: "Braxton",
      office: "London",
      id: "bram"
    },
    {
      firstname: "Tiia",
      lastname: "Maunu",
      office: "Tampere",
      id: "maut"
    },
    {
      firstname: "Simo",
      lastname: "Antti",
      office: "Helsinki",
      id: "ants"
    },
    {
      firstname: "Marianna",
      lastname: "Aatos",
      office: "Helsinki",
      id: "aatm"
    },
    {
      firstname: "Hulda",
      lastname: "Helen",
      office: "Stockholm",
      id: "helh"
    },
    {
      firstname: "Bengta",
      lastname: "Torvald",
      office: "Stockholm",
      id: "todb"
    }
  ]);
}

export function connectWebsocket() {
  const ws = new WebSocket(`wss://${WS_HOST}/api`, ["websocket"]);
  ws.binaryType = "arraybuffer";
  return ws;
}
