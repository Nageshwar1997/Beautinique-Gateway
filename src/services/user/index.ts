import { ApiRequest } from "@/classes/ApiRequest";

export class UserService extends ApiRequest {
  constructor() {
    super('http://localhost:3001/api');
  }
}
