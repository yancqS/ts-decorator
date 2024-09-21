import fs from 'node:fs';
import fsPromise from 'node:fs/promises'
import path from 'node:path';
import {Config} from '../decorator/configDecorator';
import {Provider} from '../decorator/provider';
import {Body, Controller, Get, Post, Query} from '../decorator/controllerDecorator';
import {Inject} from '../decorator/injectDecorator';
import {Upload} from "../decorator/uploadDecorator";
import {WebService} from '../service/webService';
import Log from "../utils/log";
import {type IMulitlePartType, TypeEnum} from "../interface";

@Provider()
@Controller('/web')
export class WebController {
  @Config('token')
  token: string;

  @Config('uploadPath')
  uploadPath: string;

  @Inject()
  webService: WebService;

  @Inject()
  log: Log;

  pipeStream (path: string, writeStream: fs.WriteStream) {
    return new Promise<void>(resolve => {
      const readStream = fs.createReadStream(path);
      readStream.on("end", () => {
        fs.unlinkSync(path);
        resolve();
      });
      readStream.pipe(writeStream);
    });
  }

  @Get('/list_async')
  async getListAsync(@Query('id') id: string) {
    this.log.info('id: ', id);
    const data = await this.webService.getListAsync();
    return {
      success: true,
      code: 200,
      msg: 'ASYNC',
      id,
      data,
      token: this.token,
    };
  }

  @Get('/list_sync')
  getListSync(@Query('time') time: string, @Query('key') key_name: string, @Query('id') id: string) {
    this.log.info('id: ', id);
    this.log.info('time: ', time);
    this.log.info('key_name: ', key_name);
    const data = this.webService.getListSync();
    return {
      success: true,
      code: 200,
      msg: 'SYNC',
      id,
      data,
      token: this.token,
    };
  }

  @Get('/list_all')
  getListAll(@Query(TypeEnum.ALL) query: Record<string, unknown>) {
    this.log.info('query', query);
    const data = this.webService.getListSync();
    return {
      success: true,
      code: 200,
      msg: 'SYNC',
      data,
      query,
      token: this.token,
    };
  }
  
  @Post('/update_id')
  updateId(@Body('test') test: string, @Body('id') uid: string) {
    return {
      success: true,
      data: test,
      uid,
    }
  }

  @Post('/update_all')
  updateAll(@Body(TypeEnum.ALL) params: Record<string, unknown>) {
    return {
      success: true,
      data: params,
    }
  }

  @Post('/upload')
  @Upload()
  async upload(data: IMulitlePartType) {
    const {fields, files} = data;
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath);
    }
    const [chunk] = files.chunk;
    const [chunkHash] = fields.chunkHash;
    const [fileHash] = fields.fileHash;
    const [fileName] = fields.fileName;
    if (!fs.existsSync(`${this.uploadPath}/${fileHash}`)) {
      fs.mkdirSync(`${this.uploadPath}/${fileHash}`);
    }
    await fsPromise.rename(chunk.filepath, `${this.uploadPath}/${fileHash}/${chunkHash}`);
    this.log.info(`Received chunk,it's size is ${chunk.size} byte, hash is ${chunkHash}, file name is ${fileName}`);
    return {
      success: true,
      size: chunk.size,
      chunkHash,
      fileHash,
    }
  }

  @Post('/merge')
  async merge(
    @Body('fileName') fileName: string,
    @Body('size') size: number,
    @Body('fileHash') fileHash: string,
  ) {
    const chunkDir = path.resolve(`${this.uploadPath}/${fileHash}`);
    const {ext} = path.parse(fileName);
    if (!fs.existsSync(chunkDir)) {
      fs.mkdirSync(chunkDir);
    }
    const filePath = path.resolve(chunkDir, `${fileHash}${ext}`);
    const fileNameList = await fsPromise.readdir(chunkDir);
    fileNameList.sort((a, b) => Number(a.split("-")[1]) - Number(b.split("-")[1]));
    // 并发写入文件
    await Promise.all(
      fileNameList.map((chunkPath, index) => {
        const fullPath = path.resolve(chunkDir, chunkPath);
        const writer = fs.createWriteStream(filePath, {
          start: index * size,
        });
        return this.pipeStream(fullPath, writer);
      })
    )
    return {
      success: true,
      data: fileName,
    }
  }

  @Post('/verify')
  async verify(@Body(TypeEnum.ALL) params: {fileHash: string, fileName: string}) {
    const {fileHash, fileName} = params;
    const {ext} = path.parse(fileName);
    const filePath = path.resolve(this.uploadPath, fileHash, `${fileHash}${ext}`);
    const foldPath = path.resolve(this.uploadPath, fileHash);
    if(fs.existsSync(filePath)) {
      return {
        success: true,
        uploaded: true,
      }
    } else {
      let uploadedList = [];
      try {
        uploadedList = await fsPromise.readdir(foldPath);
      } catch (e) {
        uploadedList = [];
      }
      return {
        success: true,
        uploaded: false,
        uploadedList,
      }
    }
  }
}
