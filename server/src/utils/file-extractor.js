import { Buffer } from "buffer";
import officeParser from "officeparser";

export class FileExtractor {
  constructor() {}

  extractFromPptx = async (base64) => {
    const buffer = Buffer.from(base64, "base64");
    const config = {
      newlineDelimiter: "\n",
      ignoreNotes: true,
    };
    return await officeParser
      .parseOfficeAsync(buffer, config)
      .then((data) => {
        return data;
      })
      .catch((err) => console.error(err));
  };
}
