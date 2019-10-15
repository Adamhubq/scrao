
import * as request from "request";
import * as fs from "fs";
export async function download(uri, filename) {
  return new Promise(resolve => {
    if (fs.existsSync(filename)) return resolve(true);
    request.head(uri, function (_err, _res, _body) {
      const fileStream = fs.createWriteStream(filename.toLowerCase());
      request(uri).pipe(fileStream).on('close', () => {
        console.log(filename);
        fileStream.close()
        return resolve(this);
      })
    })
  });
};
