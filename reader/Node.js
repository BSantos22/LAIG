function Node(parent, component_info, scene) {
    this.scene = scene;
    this.component_info = component_info;
    this.parent = parent;
    this.matrix;

    if (this.parent == null) {
        this.matrix = mat4.create();
    }
    else {
        this.matrix = mat4.clone(parent.matrix);
    }
    
    for (var i = component_info.transformations.length - 1; i >= 0; i--) {
        var m = this.createMatrix(component_info.transformations[i]);
        
        mat4.multiply(this.matrix,this.matrix,m);
    }

    for (var i = 0; i < this.matrix.length; i+=4) {
        console.log(this.matrix[i], this.matrix[i+1], this.matrix[i+2], this.matrix[i+3]);
    }

    console.log("");

    this.texture;
    if (component_info.texture == "inherit") {
        this.texture = parent.texture;
    }
    else {
        this.texture = component_info.texture;
    }

    this.materials = [];
    for (var i = 0; i < component_info.materials.length; i++) {
        var m;
        if (component_info.materials[i] == "inherit") {
            m = parent.materials[0];
        }
        else {
            m = component_info.materials[i];  
        }
        

        this.materials[i] = new CGFappearance(scene);
        this.materials[i].setAmbient(m.ambient.r, m.ambient.g, m.ambient.b, m.ambient.a);
        this.materials[i].setEmission(m.emission.r, m.emission.g, m.emission.b, m.emission.a);
        this.materials[i].setDiffuse(m.diffuse.r, m.diffuse.g, m.diffuse.b, m.diffuse.a);
        this.materials[i].setSpecular(m.specular.r, m.specular.g, m.specular.b, m.specular.a);
        this.materials[i].loadTexture(this.texture.file);
        this.materials[i].setTextureWrap(this.texture.length_s, this.texture.length_t);
    }

    this.children = [];
    for (var i = 0; i < component_info.children_components.length; i++) {
        this.children[i] = new Node(this, component_info.children_components[i], scene);
    }
}


Node.prototype.createMatrix = function(transformation) {
    var m = mat4.create();

    if (transformation instanceof Translation) {
        mat4.translate(m,m,vec3.fromValues(transformation.vector.x, transformation.vector.y, transformation.vector.z));
    }
    else if (transformation instanceof Rotation) {
        if (transformation.axis == "x") {
            mat4.rotateX(m,m,transformation.angle);
        }
        else if (transformation.axis = "y") {
            mat4.rotateY(m,m,transformation.angle);
        }
        else if (transformation.axis = "z") {
            mat4.rotateZ(m,m,transformation.angle);
        }

    }
    else if (transformation instanceof Scaling) {
        mat4.scale(m,m,vec3.fromValues(transformation.vector.x, transformation.vector.y, transformation.vector.z));
    }

    return m;
}

Node.prototype.display = function() {/*
    console.log(this.component_info.id);
    for (var i = 0; i < this.matrix.length; i+=4) {
        console.log(this.matrix[i], this.matrix[i+1],
                   this.matrix[i+2], this.matrix[i+3]);
    }
*/
    this.scene.pushMatrix();
    //this.materials[0].apply();
    this.scene.multMatrix(this.matrix);

/*
    for (var i = 0; i < this.matrix.length; i+=4) {
        console.log(this.matrix[i], this.matrix[i+1],
                   this.matrix[i+2], this.matrix[i+3]);
    }*/

    for (var i = 0; i < this.component_info.children_primitives.length; i++) {
        this.component_info.children_primitives[i].primitive.display();
    }
    
    this.scene.popMatrix();

    for (var i = 0; i < this.children.length; i++) {
        this.children[i].display();
    }
}