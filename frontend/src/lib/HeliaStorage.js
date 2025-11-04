import { createHelia } from 'helia';
import { unixfs } from '@helia/unixfs';
import { http } from '@helia/http';

class HeliaStorage {
  constructor() {
    this.helia = null;
    this.fs = null;
  }

  async init() {
    if (!this.helia) {
      this.helia = await createHelia({
        libp2p: {
          addresses: {
            listen: []
          }
        }
      });
      this.fs = unixfs(this.helia);
    }
    return this.helia;
  }

  async uploadFile(file) {
    await this.init();
    
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(file));
    
    const cid = await this.fs.addBytes(data);
    return cid.toString();
  }

  async downloadFile(cid) {
    await this.init();
    
    const decoder = new TextDecoder();
    const chunks = [];
    
    for await (const chunk of this.fs.cat(cid)) {
      chunks.push(chunk);
    }
    
    const data = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
    let offset = 0;
    for (const chunk of chunks) {
      data.set(chunk, offset);
      offset += chunk.length;
    }
    
    return JSON.parse(decoder.decode(data));
  }

  async uploadCanvas(canvasData) {
    const fileData = {
      type: 'neural-canvas',
      timestamp: Date.now(),
      data: canvasData
    };
    
    return await this.uploadFile(fileData);
  }

  async downloadCanvas(cid) {
    const fileData = await this.downloadFile(cid);
    return fileData.data;
  }

  async stop() {
    if (this.helia) {
      await this.helia.stop();
      this.helia = null;
      this.fs = null;
    }
  }
}

export default HeliaStorage;