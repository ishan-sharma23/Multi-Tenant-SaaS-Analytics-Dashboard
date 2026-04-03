import { ResultSetHeader, RowDataPacket } from "mysql2";
import { query, queryRows } from "../config/database";

type RefreshTokenRow = RowDataPacket & {
  id: number;
  user_id: number;
  token_id: string;
  token_hash: string;
  expires_at: Date;
  revoked_at: Date | null;
  replaced_by_token_id: string | null;
};

export async function createRefreshTokenRecord(params: {
  userId: number;
  tokenId: string;
  tokenHash: string;
  expiresAt: Date;
}): Promise<void> {
  await query<ResultSetHeader>(
    `INSERT INTO refresh_tokens (user_id, token_id, token_hash, expires_at)
     VALUES (?, ?, ?, ?)`,
    [params.userId, params.tokenId, params.tokenHash, params.expiresAt]
  );
}

export async function findUsableRefreshTokenByHash(tokenHash: string): Promise<RefreshTokenRow | null> {
  const rows = await queryRows<RefreshTokenRow>(
    `SELECT id, user_id, token_id, token_hash, expires_at, revoked_at, replaced_by_token_id
     FROM refresh_tokens
     WHERE token_hash = ?
       AND revoked_at IS NULL
       AND expires_at > NOW()
     LIMIT 1`,
    [tokenHash]
  );

  return rows[0] ?? null;
}

export async function revokeRefreshTokenByHash(params: {
  tokenHash: string;
  replacedByTokenId?: string;
}): Promise<void> {
  await query<ResultSetHeader>(
    `UPDATE refresh_tokens
     SET revoked_at = NOW(),
         replaced_by_token_id = COALESCE(?, replaced_by_token_id)
     WHERE token_hash = ?
       AND revoked_at IS NULL`,
    [params.replacedByTokenId ?? null, params.tokenHash]
  );
}
