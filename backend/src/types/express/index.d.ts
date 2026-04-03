import { RoleName } from "../auth";

declare global {
  namespace Express {
    interface Request {
      authUser?: {
        userId: number;
        tenantId: number;
        email: string;
        roles: RoleName[];
      };
    }
  }
}

export {};
