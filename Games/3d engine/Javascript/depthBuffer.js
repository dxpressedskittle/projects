export class depthBuffer {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.buffer = new Float32Array(width * height);
        this.clear();
    }
    
    clear() {
        this.buffer.fill(Infinity);
    }

    get(x, y) {
        return this.buffer[y * this.width + x];
    }
    
    set(x, y, depth) {
        this.buffer[y * this.width + x] = depth;
    }

    calculateDepth(z, w) {
        return z / w;
    }

    testAndSet(x, y, z, w) {
        const depth = this.calculateDepth(z, w);
        const currentDepth = this.get(x, y);
        if (depth < currentDepth) {
            this.set(x, y, depth);
            return true; // Pixel is visible
        }
        return false; // Pixel is occluded
    }
    

    
}