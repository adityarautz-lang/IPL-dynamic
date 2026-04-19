import clientPromise from "./mongodb";
import { Db } from "mongodb";

export default async function getDb(dbName = "ipl"): Promise<Db> {
  const client = await clientPromise;
  return client.db(dbName);
}
