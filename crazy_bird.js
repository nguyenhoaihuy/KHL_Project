import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;

class Cube extends Shape {
    constructor() {
        super("position", "normal",);
        // Loop 3 times (for each axis), and inside loop twice (for opposing cube sides):
        this.arrays.position = Vector3.cast(
            [-1, -1, -1], [1, -1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, -1], [-1, 1, -1], [1, 1, 1], [-1, 1, 1],
            [-1, -1, -1], [-1, -1, 1], [-1, 1, -1], [-1, 1, 1], [1, -1, 1], [1, -1, -1], [1, 1, 1], [1, 1, -1],
            [-1, -1, 1], [1, -1, 1], [-1, 1, 1], [1, 1, 1], [1, -1, -1], [-1, -1, -1], [1, 1, -1], [-1, 1, -1]);
        this.arrays.normal = Vector3.cast(
            [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0],
            [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0],
            [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1]);
        // Arrange the vertices into a square shape in texture space too:
        this.indices.push(0, 1, 2, 1, 3, 2, 4, 5, 6, 5, 7, 6, 8, 9, 10, 9, 11, 10, 12, 13,
            14, 13, 15, 14, 16, 17, 18, 17, 19, 18, 20, 21, 22, 21, 23, 22);
    }
}

class Cube_Outline extends Shape {
    constructor() {
        super("position", "color");
        //  TODO (Requirement 5).
        // When a set of lines is used in graphics, you should think of the list entries as
        // broken down into pairs; each pair of vertices will be drawn as a line segment.
        // Note: since the outline is rendered with Basic_shader, you need to redefine the position and color of each vertex
    }
}

class Cube_Single_Strip extends Shape {
    constructor() {
        super("position", "normal");
        // TODO (Requirement 6)
    }
}


class Base_Scene extends Scene {
    /**
     *  **Base_scene** is a Scene that can be added to any display canvas.
     *  Setup the shapes, materials, camera, and lighting here.
     */
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();
        this.hover = this.swarm = false;
        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            'bird': new defs.Subdivision_Sphere(4),
            'cube': new defs.Cylindrical_Tube(2,3),
            'pipe': new Cube(),
            'pipe2': new Cube(),
            'outline': new Cube_Outline(),
            'sphere4': new defs.Subdivision_Sphere(4)
        };

        // *** Materials
        this.materials = {
            plastic: new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#ffffff")}),
            plasticlose: new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#ffffff")}),
        };
        // The white material and basic shader are used for drawing the outline.
        this.white = new Material(new defs.Basic_Shader());
        this.initial_camera_location = Mat4.translation(5, -15, -50).times(Mat4.rotation(-Math.PI/2, 0, 1, 0)) ;
        this.third_person_camera = Mat4.translation(5, -15, -50);
        this.change_view = false;
        this.pipes = [{Matrix:Mat4.identity().times(Mat4.translation(0,-2.5,-20)),height:this.randomNumber(4,12)}];
        
    }

    display(context, program_state) {
        // display():  Called once per frame of animation. Here, the base class's display only does
        // some initial setup.

        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(this.initial_camera_location);
            
        }
        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, 1, 100);

        // *** Lights: *** Values of vector or point lights.
        const light_position = vec4(0, 5, 5, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];
    }

    randomNumber(min, max) { 
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    } 
}

export class CrazyBird extends Base_Scene {
    /**
     * This Scene object can be added to any display canvas.
     * We isolate that code so it can be experimented with on its own.
     * This gives you a very small code sandbox for editing a simple scene, and for
     * experimenting with matrix transformations.
     */
    
    set_colors() {
        // TODO:  Create a class member variable to store your cube's colors.
        // Hint:  You might need to create a member variable at somewhere to store the colors, using `this`.
        // Hint2: You can consider add a constructor for class Assignment2, or add member variables in Base_Scene's constructor.
    }

    make_control_panel() {
        
        this.key_triggered_button("Jump", ["b"], () => {
            this.force = 0.6;
        });
        this.key_triggered_button("Side view", ["t"], () => {
            this.change_view = !this.change_view;
        });
        this.v = 0;
        this.x = 15;
        this.pipe_position = -30;
    }

    draw_box(context, program_state, model_transform, height) {
        
        const green = hex_color("#57c94f");
        const gap = 4;
        const height_limit = 20;

        // draw bottom pipe
        for (let i=1; i<height; i++){
            this.shapes.pipe.draw(context, program_state, model_transform, this.materials.plastic.override({color:green}))
            model_transform = model_transform.times(Mat4.translation(0,2,0));
        }

        //gap between 2 pipe
        model_transform = model_transform.times(Mat4.translation(0,gap*2,0));

        // draw top pipe
        let top_count = height_limit - height - gap;
        for (let i=1; i<top_count; i++){
            this.shapes.pipe.draw(context, program_state, model_transform, this.materials.plastic.override({color:green}))
            model_transform = model_transform.times(Mat4.translation(0,2,0));
        }
    }

    display(context, program_state) {
        super.display(context, program_state);
        const blue = hex_color("#1a9ffa");
        const green = hex_color("#57c94f");

        if (this.change_view){
            program_state.set_camera(this.third_person_camera);
        } else {
            program_state.set_camera(this.initial_camera_location);
        }

        let model_transform_bird = Mat4.identity().times(Mat4.translation(0,5,10));

        let g = -0.015 + this.force;
        this.v = Math.min(this.v + g,0.5);
        this.x = Math.max(this.x + this.v,-7.5);
        
        model_transform_bird = model_transform_bird.times(Mat4.translation(0,this.x,0));
        
        // Draw pipes dynamically
        this.force = 0;
        const pipe_position = 0.1;
        for (let i=0; i < this.pipes.length; i++){
            this.pipes[i].Matrix = this.pipes[i].Matrix.times(Mat4.translation(0,0,pipe_position));
            this.draw_box(context, program_state,this.pipes[i].Matrix,this.pipes[i].height);
        }

        // Check if need to add new pipe matrix
        console.log(this.pipes[this.pipes.length-1])
        if (this.pipes[this.pipes.length-1].Matrix[2][3] > -20){
            let new_matrix = {Matrix:Mat4.identity().times(Mat4.translation(0,-2.5,-40)),height:this.randomNumber(4,12)};
            this.pipes.push(new_matrix);
        }

        // Check if need to remove the first matrix in the pipes array
        if (this.pipes.length > 0 && this.pipes[0].Matrix[2][3] > 50){
            this.pipes.shift();
        }
        
        // draw floor
        let floor_transform = Mat4.identity().times(Mat4.translation(-12, -4, 0)).times(Mat4.scale(50, 0.5, 100));
        this.shapes.cube.draw(context, program_state, floor_transform, this.materials.plasticlose);
        
        // draw bird
        this.shapes.bird.draw(context, program_state, model_transform_bird, this.materials.plastic.override({color:blue}));
        
        // reset force from keyboard press
        this.force = 0;
        
    }
}
