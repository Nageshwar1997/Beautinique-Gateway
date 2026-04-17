import type { Request, Response } from 'express';
import type { TRegister } from '@beautinique/be-zod';
import { registerService } from '../../services';

class RegisterControllers {
  public async sendOtp(req: Request, res: Response) {
    const body = req.body as Pick<TRegister, 'email'>;
    const { message, statusCode, data } = await registerService.sendOtp(body);
    res.success(statusCode, message, { data });
  }
}

export const registerControllers = new RegisterControllers();
