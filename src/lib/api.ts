import axios from "axios";
import b64toBlob from "b64-to-blob";

export async function recognize(image: string): Promise<string[]> {
  const data = new FormData();

  data.append(
    "file",
    b64toBlob(image.replace("data:image/png;base64,", ""), "image/png")
  );

  const res = await axios.post(
    "https://naama-app-face-recognizer.herokuapp.com/recognize",
    data
  );
  return res.data.FaceMatches.map((match: any) => match.Face.ExternalImageId);
}

export function createModelForFace(id: string, image: string) {
  const data = new FormData();

  data.append("id", id);
  data.append(
    "file",
    b64toBlob(image.replace("data:image/png;base64,", ""), "image/png")
  );

  return axios.post(
    "https://naama-app-face-recognizer.herokuapp.com/faces",
    data
  );
}
