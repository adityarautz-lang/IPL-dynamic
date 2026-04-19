// lib/useDb.ts
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri);
  global._mongoClientPromise = client.connect();
}

// eslint-disable-next-line prefer-const
clientPromise = global._mongoClientPromise;

export default async function getMongoDb() {
  const client = await clientPromise;
  return client.db("ipl");
}
