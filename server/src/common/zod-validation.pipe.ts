import {
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  private readonly logger = new Logger(ZodValidationPipe.name);
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    try {
      const parsedValue = this.schema.parse(value);

      const cleanedData = Object.fromEntries(
        Object.entries(parsedValue as Object)
          .filter(([, value]) => value !== undefined)
          .map(([key, value]) => {
            if (value === '') return [key, null];
            return [key, value];
          }),
      );

      return cleanedData;
    } catch (error: any) {
      this.logger.error('ZodValidationError:', error);
      // TODO: Improve error logging
      throw new BadRequestException(
        error.errors?.[0]?.message || 'Missing or invalid fields.',
      );
    }
  }
}
