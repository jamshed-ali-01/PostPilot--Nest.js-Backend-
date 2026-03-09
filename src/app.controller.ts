import { Controller, Get, Param, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { join } from 'path';
import * as fs from 'fs';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('uploads/:filename')
  async getUpload(@Param('filename') filename: string, @Res() res: any) {
    const filePath = join(process.cwd(), 'src/uploads', filename);
    if (fs.existsSync(filePath)) {
      const stream = fs.createReadStream(filePath);
      return res.type('image/jpeg').send(stream);
    }
    return res.status(404).send('File not found');
  }
}
