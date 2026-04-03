import { RoleName } from "../auth";

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
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
