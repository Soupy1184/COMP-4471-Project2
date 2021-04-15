class Bacteria {

    constructor(bacteriaSize, sphereDiv){
        this.r = Math.round(Math.random()*255)/255;
        this.g = Math.round(Math.random()*255)/255;
        this.b = Math.round(Math.random()*255)/255;

        this.angle = Math.round(Math.random()*360);
        this.xAxis = Math.round(Math.random());
        this.yAxis = Math.round(Math.random());
        this.zAxis = Math.round(Math.random());

        this.alive = true;

        this.object = CreateSphere(bacteriaSize, {r : this.r, g : this.g, b : this.b}, 0, 0, 0);

        this.indices = [];
        
        for(i = 0; i < this.object.indices.length / sphereDiv; i++) {
            this.indices.push(this.object.indices[i]);
        }

        this.growth = 0;
        this.sphereDiv = sphereDiv;
    }

    bactDraw(mvpMatrix, u_MvpMatrix, gl) {
        mvpMatrix.rotate(this.angle, this.xAxis, this.yAxis, this.zAxis);
        gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

        if(this.alive) {
            draw(gl, this.object.vertices, this.object.colours, this.indices);
        }
    }

    grow() {
        this.growth++;

        var sect = (this.object.indices.length / this.sphereDiv);
        for (var i = sect * this.growth; i < sect * (this.growth+1); i++) {
            this.indices.push(this.object.indices[i]);
        }

    }

    getGrowth() {
        return this.growth;
    }

    getColor() {
        return {r:this.r * 255, g:this.g *255, b:this.b*255};
    }

    kill() {
        this.alive = false;
    }

    getAlive() {
        return this.alive;
    }


}