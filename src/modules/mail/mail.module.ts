import { Module, Global } from '@nestjs/common';
import { MailService } from './mail.service.js';

@Global()
@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
