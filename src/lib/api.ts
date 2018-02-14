import axios from "axios";

export async function recognize(image: Blob): Promise<string[]> {
  const data = new FormData();

  data.append("file", image);

  const res = await axios.post(
    "https://naama-app-face-recognizer.herokuapp.com/recognize",
    data
  );
  return res.data.FaceMatches.map((match: any) => match.Face.ExternalImageId);
}

export function createModelForFace(id: string, image: Blob) {
  const data = new FormData();

  data.append("id", id);
  data.append("file", image);

  return axios.post(
    "https://naama-app-face-recognizer.herokuapp.com/faces",
    data
  );
}
