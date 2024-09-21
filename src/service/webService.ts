import { Provider } from "../decorator/provider";

@Provider()
export class WebService {
  getListSync() {
    return [1, 2, 3];
  }
  getListAsync() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve([1, 2, 3]);
      }, 2000);
    })
  }
};
