import { Provider } from "../decorator/provider";

@Provider()
class Log {
  private warnColor(text: string): string {
    return `\x1b[30;43m${text}\x1b[0m`
  };
  private infoColor(text: string): string {
    return `\x1b[30;46m${text}\x1b[0m`
  };
  private errorColor(text: string): string {
    return `\x1b[1;30;41m${text}\x1b[0m`
  };

  private static getTime() {
    return `${new Date().toLocaleString()}\n`;
  }

  public warn(...args: any[]):void {
    console.log(this.warnColor('[warn]'), Log.getTime(), ...args);
  }
  public info(...args: any[]):void {
    console.info(this.infoColor('[info]'), Log.getTime(), ...args);
  }
  public error(...args: any[]):void {
    console.error(this.errorColor('[error]'), Log.getTime(), ...args);
  }
}

export default Log;
