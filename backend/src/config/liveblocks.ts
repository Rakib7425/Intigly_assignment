// src/config/liveblocks.ts
import { Liveblocks } from "@liveblocks/node";

const liveblocksClient = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY,
});

export { liveblocksClient };
