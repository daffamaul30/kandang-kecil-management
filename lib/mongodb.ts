import { MongoClient } from 'mongodb';
const uri=process.env.MONGODB_URI;
if(!uri) throw new Error('Set MONGODB_URI in environment variables');
const globalWithMongo=globalThis as typeof globalThis & {mongo?:MongoClient};
const client=globalWithMongo.mongo ?? new MongoClient(uri);
if(process.env.NODE_ENV!=='production') globalWithMongo.mongo=client;
export const clientPromise=client.connect();
export async function db(){const c=await clientPromise;return c.db(process.env.MONGODB_DB||'kandang_kecil');}
