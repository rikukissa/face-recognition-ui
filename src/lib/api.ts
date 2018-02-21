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

export async function transform(image: string): Promise<string> {
  const data = new FormData();

  data.append(
    "file",
    b64toBlob(image.replace("data:image/png;base64,", ""), "image/png")
  );

  const res = await axios.post(
    "https://naama-app-face-recognizer.herokuapp.com/transform",
    data
  );
  return res.data;
}

export async function createModelForFace(id: string, images: string[]) {
  for (const image of images) {
    const data = new FormData();

    data.append("id", id);
    data.append(
      "file",
      b64toBlob(image.replace("data:image/png;base64,", ""), "image/png")
    );
    try {
      await axios.post(
        "https://naama-app-face-recognizer.herokuapp.com/faces",
        data
      );
      // tslint:disable
    } catch (error) {
      console.log("error", error);
    }
  }
}
