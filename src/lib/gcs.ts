import { Storage } from "@google-cloud/storage";

let storage: Storage | undefined;

export function getBucket() {
  storage ??= new Storage();
  return storage.bucket(process.env.GCS_BUCKET_NAME!);
}
