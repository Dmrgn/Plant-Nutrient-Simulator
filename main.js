const can = document.getElementById("can");
const graph = document.getElementById("graph");
const insideCount = document.getElementById("inside");
const outsideCount = document.getElementById("outside");

const ctx = can.getContext("2d");
const gtx = graph.getContext("2d");
gtx.translate(0.5, 0.5);

let particles = []
const snapshots = []

const WIDTH = can.width;
const HEIGHT = can.height;
let paused = false;
let frameCount = 0;
let largestsnapshot = 0;

function game() {
    if (!paused) {
        ctx.fillStyle = "rgb(40, 20, 10)";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        // cell insides
        ctx.fillStyle = "rgb(100, 200, 100)";
        ctx.fillRect(WIDTH*4/5, 0, WIDTH/5, HEIGHT);

        insideCount.innerHTML = "0";
        outsideCount.innerHTML = "0";
        for (let i = 0; i < particles.length; i++) {
            if (particles[i].x > WIDTH*4/5 && particles[i].col == "white") insideCount.innerHTML = Number(insideCount.innerHTML)+1;
            if (particles[i].x <= WIDTH*4/5 && particles[i].col == "white") outsideCount.innerHTML = Number(outsideCount.innerHTML)+1;
            for (let j = i+1; j < particles.length; j++) {
                if (Math.sqrt((particles[i].x - particles[j].x)**2 + (particles[i].y - particles[j].y)**2) <= (particles[i].size/2 + particles[j].size/2)) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const ispeed = mag([particles[i].vx, particles[i].vy, 0]);
                    const jspeed = mag([particles[j].vx, particles[j].vy, 0]);
                    particles[i].vx += dx;
                    particles[i].vy += dy;
                    const ivel = normalize([particles[i].vx, particles[i].vy, 0]);
                    particles[i].vx = ivel[0] * ispeed;
                    particles[i].vy = ivel[1] * ispeed;
                    particles[j].vx -= dx;
                    particles[j].vy -= dy;
                    const jvel = normalize([particles[j].vx, particles[j].vy, 0]);
                    particles[j].vx = jvel[0] * jspeed;
                    particles[j].vy = jvel[1] * jspeed;
                }
            }
            norm = null;
            if (particles[i].x > WIDTH) norm = [-1, 0, 0];
            if (particles[i].x < 0) norm = [1, 0, 0];
            if (particles[i].y > HEIGHT) norm = [0, 1, 0];
            if (particles[i].y < 0) norm = [0, 1, 0];
            if (!particles[i].permiable && particles[i].x > WIDTH*4/5) norm = [-1, 0, 0];
            if (!particles[i].permiable && particles[i].x > WIDTH*4/5+30) particles[i].x = 0;
            if (norm !== null) {
                // cross product approach doesnt work lmao
                // const perp = crossProduct(norm[0], norm[1], 0, particles[i].vx, particles[i].vy, 0);
                // const newdir = crossProduct(particles[i].vx, particles[i].vy, 0, perp[0], perp[1], perp[2]);
                // const speed = mag([particles[i].vx, particles[i].vy, 0]);
                // console.log(newdir[2], speed);
                // const newvel = normalize([newdir[0], newdir[1], 0]);
                // particles[i].vx = newvel[0]*speed;
                // particles[i].vy = newvel[1]*speed;
                const m = mag([particles[i].vx, particles[i].vy,0]);
                const ang = angle([norm[0]*-1, norm[1]*-1, norm[2]*-1], [particles[i].vx, particles[i].vy, 0]);
                const rotated1 = rotate([norm[0]*m, norm[1]*m, norm[2]*m], ang);
                const rotated2 = rotate([norm[0]*m, norm[1]*m, norm[2]*m], -ang);
                const angdist1 = angle(rotated1, [particles[i].vx, particles[i].vy, 0]);
                const angdist2 = angle(rotated2, [particles[i].vx, particles[i].vy, 0]);
                if (angdist1 < angdist2) {
                    particles[i].vx = rotated1[0];
                    particles[i].vy = rotated1[1];
                } else {
                    particles[i].vx = rotated2[0];
                    particles[i].vy = rotated2[1];
                }
            }
            particles[i].x = Math.min(Math.max(1, particles[i].x), WIDTH-1);
            particles[i].y = Math.min(Math.max(1, particles[i].y), HEIGHT-1);
            particles[i].x += particles[i].vx;
            particles[i].y += particles[i].vy;
            particles[i].draw(ctx);
        }
        outsideCount.innerHTML = Math.round(Number(outsideCount.innerHTML)/4);

        // semi permiable membrane
        ctx.fillStyle = "green";
        ctx.fillRect(WIDTH*4/5, 0, 30, HEIGHT);
    }
    if(frameCount%60 == 0) {
        largestsnapshot = Math.max(largestsnapshot, Number(outsideCount.innerHTML), Number(insideCount.innerHTML));
        snapshots.push([Number(outsideCount.innerHTML), Number(insideCount.innerHTML)]);
        if (snapshots.length > 30) {
            snapshots.shift();
        }
        gtx.fillStyle = "rgb(40, 20, 10)";
        gtx.fillRect(0, 0, graph.width, graph.height);
        
        gtx.fillStyle = "white";
        gtx.font = "18px monospace";
        gtx.fillText("[N]", 15, graph.height/2);
        gtx.fillText("time", graph.width/2-20, graph.height-20);
        gtx.fillStyle = "white";
        gtx.fillRect(60, 30, graph.width-100, graph.height-80);
        gtx.strokeStyle = "green";
        gtx.lineWidth = 3;
        gtx.beginPath();
        gtx.moveTo(60, graph.height-50);
        for (let i = 0; i < snapshots.length; i++) {
            gtx.lineTo(i*(graph.width-100)/snapshots.length + 60, graph.height-50-snapshots[i][1]/largestsnapshot*(graph.height-80));
        }
        gtx.stroke();
        gtx.strokeStyle = "brown";
        gtx.beginPath();
        gtx.moveTo(60, graph.height-50);
        for (let i = 0; i < snapshots.length; i++) {
            gtx.lineTo(i*(graph.width-100)/snapshots.length + 60, graph.height-50-snapshots[i][0]/largestsnapshot*(graph.height-80));
        }
        gtx.stroke();
    }
    frameCount++;

    requestAnimationFrame(game);
}

// spawn iron(III)
for (let i = 0; i < 400; i++) {
    particles.push(new Particle(Math.random()*WIDTH*4/5, Math.random()*HEIGHT, "rgb(70, 10, 10)"));
    particles[particles.length-1].size +=4;
}

// spawn hydrogen ions
for (let i = 0; i < 1000; i++) {
    particles.push(new Particle(Math.random()*WIDTH*1/5, Math.random()*HEIGHT, "white"));
    particles[particles.length-1].permiable = true;
}

document.onkeydown = function(e) {
    console.log(e.key);
    switch (e.key) {
        case " ":
            paused = !paused;
            break;
    }
}

can.onclick = function(e) {
    const rect = can.getBoundingClientRect();
    for (let i = 0; i < 10; i++) {
        particles.push(new Particle((e.clientX - rect.left) / (rect.right - rect.left) * can.width + Math.random(), (e.clientY - rect.top) / (rect.bottom - rect.top) * can.height+Math.random(), "white"));
        particles[particles.length-1].permiable = true;
    }
}


game();