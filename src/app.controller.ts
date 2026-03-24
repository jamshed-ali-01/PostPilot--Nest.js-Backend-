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
      const ext = filename.split('.').pop()?.toLowerCase();
      const mimeTypes: Record<string, string> = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'heic': 'image/heic',
        'mp4': 'video/mp4',
        'mov': 'video/quicktime',
        'avi': 'video/x-msvideo',
        'webm': 'video/webm'
      };
      
      const contentType = (ext && mimeTypes[ext]) || 'application/octet-stream';
      const stream = fs.createReadStream(filePath);
      return res.type(contentType).send(stream);
    }
    return res.status(404).send('File not found');
  }
}
