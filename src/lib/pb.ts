import PocketBase from 'pocketbase';

export const PB_URL = import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090';

export const pb = new PocketBase(PB_URL);
pb.autoCancellation(false);

export function getFileUrl(record: { collectionId: string; id: string; [k: string]: unknown }, filename: string) {
  return pb.files.getUrl(record as never, filename);
}
