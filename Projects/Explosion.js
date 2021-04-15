class Particle {
    constructor(x, y, xdir, ydir) {
        this.x = x;
        this.y = y;
        this.xdir = xdir;
        this.ydir = ydir;
    }
    move() {
        this.x += this.xdir;
        this.y += this.ydir;
    }
    getVert(){ //send back a triangle
        return [this.x,     this.y,     0,
                this.x + 1, this.y,     0,
                this.x,     this.y + 1, 0];
      }
}
class Explosion {
    constructor(x, y, size) {
        this.particles = []
        this.particleNum = (size*4) + 5;
        for(var i = 0; i < this.particleNum; i++) {
            this.particles.push(new Particle(x, y, Math.random()*((size*4) + 5), Math.random()*((size*4) + 5)));
        }
        this.lifetime = size* 12;
    }

    step() {
        if(lifetime < 0) {
            //get rid of all particles
            this.particles.splice(0, this.particles.length);
        }
        lifetime++;

        //move all particles
        for(var i = 0; i < this.particles.length; i++) {
            this.particles[i].move();
        }
    }

    getVert() {
        var verts = [];
        for(var i = 0; i < this.particles.length; i++) {
            verts.concat(particles[i].getVert());
        }
        return verts;
    }
}