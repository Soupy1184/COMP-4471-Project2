class Bacteria {

    constructor(bacteriaSize, sphereDiv){
        this.r = Math.random();
        this.g = Math.random();
        this.b = Math.random();

        this.angle = Math.random()*360;
        this.xAxis = Math.round(Math.random());
        this.yAxis = Math.round(Math.random());
        this.zAxis = Math.round(Math.random());

        this.object = CreateSphere(bacteriaSize, {r : this.r, g : this.g, b : this.b});

        this.indices = []
        
        for(i = 0; i < this.object.indices.length / sphereDiv; i++) {
            this.indices.push(this.object.indices[i]);
        }

        this.growth = 0;

        this.sphereDiv = sphereDiv;
        
    }

    bactDraw(mvpMatrix, u_MvpMatrix, gl) {
        mvpMatrix.rotate(this.angle, this.xAxis, this.yAxis, this.zAxis);
        gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
        draw(gl, this.object.vertices, this.object.colours, this.indices);
    }

    grow() {
        this.growth++;

        var sect = (this.object.indices.length / this.sphereDiv);
        for (var i = sect * this.growth; i < sect * (this.growth+1); i++) {
            this.indices.push(this.object.indices[i]);
        }

    }


}