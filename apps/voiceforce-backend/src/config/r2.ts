export function buildR2Key(prefix: string, companyId: string, filename: string): string {
  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `${prefix}/${companyId}/${Date.now()}_${safeFilename}`;
}

export async function uploadBufferToR2(buffer: Buffer, key: string, mimetype: string): Promise<{ url: string; key: string }> {
  const publicBase = process.env.R2_PUBLIC_URL || process.env.STORAGE_PUBLIC_URL || 'https://storage.voiceforce.io';
  return {
    url: `${publicBase}/${key}`,
    key
  };
}
