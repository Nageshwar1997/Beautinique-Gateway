import { Request, Response } from 'express';
import { TRegister } from '@beautinique/be-zod';
import { registerService } from '../../services';

class RegisterControllers {
  public async sendOtp(req: Request, res: Response) {
    const body = req.body as Pick<TRegister, 'email'>;
    const response = await registerService.sendOtp(body);
    console.log('response', response);
    res.json(response);
  }
}

export const registerControllers = new RegisterControllers();
