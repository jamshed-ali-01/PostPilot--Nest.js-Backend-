import { Module } from '@nestjs/common';
import { TestimonialsService } from './testimonials.service';
import { TestimonialsResolver } from './testimonials.resolver';

@Module({
    providers: [TestimonialsService, TestimonialsResolver],
    exports: [TestimonialsService],
})
export class TestimonialsModule { }
