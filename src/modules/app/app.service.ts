import { Injectable } from '@nestjs/common';
import { ApiResponse } from 'src/common';

@Injectable()
export class AppService {
  health(): ApiResponse {
    return {
      status: 'success',
      message: 'Zeeh server running!',
    };
  }
}
