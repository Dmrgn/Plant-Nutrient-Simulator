class Particle {
    constructor(x, y, col, type) {
        this.x = x;
        this.y = y;
        this.vx = Math.random();
        this.vy = Math.random();
        const norm = normalize([this.vx, this.vy, 0]);
        this.vx = norm[0]*3;
        this.vy = norm[1]*3;
        this.permiable = false;
        this.col = col;
        this.stationary = false;
        this.size = Math.random()+2;
    }
    draw(ctx) {
        ctx.fillStyle = this.col;
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, this.size, this.size, 0, 0, 2 * Math.PI);
        ctx.fill();
        if (this.stationary) {
            this.vx = 0;
            this.vy = 0;
        }
    }
}

function crossProduct(ax, ay, az, bx, by, bz) {
    return [ay*bz-az*by, az*bx-ax*bz, ax*by-ay*bx];
}
function angle(vec1, vec2) {
    return Math.acos((vec1[0]*vec2[0]+vec1[1]*vec2[1])/(mag(vec1)*mag(vec2)));
}
function rotate(vec, ang) {
    const m = mag(vec); 
    const theta = Math.acos(vec[0]/m) + ang;
    return [Math.cos(theta)*m, Math.sin(theta)*m, 0]
}

function mag(vec) {
    return Math.sqrt(vec[0]**2 + vec[1]**2 + vec[2]**2);
}
function normalize(vec) {
    const m = mag(vec);
    return [vec[0]/m, vec[1]/m, vec[2]/m];
}