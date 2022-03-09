import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture
} = tiny;

const {Textured_Phong} = defs
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

        //keep track of the score (number of pipes passed)
        this.score = 0;
        this.lost = false;
        this.prevLocation;

        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            'square':new defs.Square(),
            'bird': new defs.Subdivision_Sphere(4),
            'cube': new defs.Cylindrical_Tube(2,3),
            'pipe': new Cube(),
            'pipe2': new Cube(),
            'outline': new Cube_Outline(),
            'sphere4': new defs.Subdivision_Sphere(4)
        };

        // *** Materials
        this.materials = {
            flame: new Material(new Textured_Phong(), {
                //color: hex_color("#ff3939"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/hell.jpg")
            }),
            texture_plastic: new Material(new Textured_Phong(),
                {ambient: .4, diffusivity: .6, color: hex_color("#50a127"), texture: new Texture("assets/green_texture.jpg")}),
            background: new Material(new Texture_Scroll_X(),
                {ambient: .4, diffusivity: .6, color: hex_color("#f5a631"), texture: new Texture("assets/green_texture.jpg")}),
            plastic: new Material(new defs.Phong_Shader(),
                {ambient: 0.7, diffusivity: 1.0, specularity: 1.0, color: hex_color("#8c0b0b")}),
            bird: new Material(new defs.Phong_Shader(),
                {ambient: 1.0, diffusivity: 0.5, specularity: 1.0, color: hex_color("#ffcb02")}),
            //plastic: new Material(new defs.Phong_Shader(),
            //   {ambient: .4, diffusivity: .6, color: hex_color("#ffffff")}),
            plastic_close: new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#ffffff")}),
        };

        this.sounds = {
            theme_song: new Audio ("assets/guitar_loop.wav"),
        }
        this.playing = true;

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
            this.shapes.pipe.draw(context, program_state, model_transform, this.materials.plastic)
            model_transform = model_transform.times(Mat4.translation(0,2,0));
        }

        //gap between 2 pipe
        model_transform = model_transform.times(Mat4.translation(0,gap*2,0));

        // draw top pipe
        let top_count = height_limit - height - gap;
        for (let i=1; i<top_count; i++){
            this.shapes.pipe.draw(context, program_state, model_transform, this.materials.plastic)
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



        if (!this.lost){
            model_transform_bird = model_transform_bird.times(Mat4.translation(0,this.x,0));
            let g = -0.015 + this.force;
            this.v = Math.min(this.v + g,0.5);
            this.x = Math.max(this.x + this.v,-7.5);
            this.prevLocation = model_transform_bird;
        }else{
            //model_transform_bird = model_transform_bird.times(Mat4.translation(0,-7.5,0));
            model_transform_bird = this.prevLocation;

        }

        // Draw pipes dynamically
        this.force = 0;
        let pipe_position = 0.1;

        if (this.lost){
            pipe_position = 0;
        }
        for (let i=0; i < this.pipes.length; i++){
            this.pipes[i].Matrix = this.pipes[i].Matrix.times(Mat4.translation(0,0,pipe_position));
            this.draw_box(context, program_state,this.pipes[i].Matrix,this.pipes[i].height);

            //check if the bird has hit the pipe
            let pipe_height = this.pipes[i].height; //number of 2by2by2 cubes in the pipe, measuring the
            //top of the gap //gap is 4 cubes

            let gap_bottom = this.pipes[i].Matrix[1][3] + 2*(this.pipes[i].height-4);
            let gap_top = this.pipes[i].Matrix[1][3] + 2*(this.pipes[i].height);

            let bird_bottom = this.x - 1;
            let bird_top = this.x + 1;
            let pipe_z = this.pipes[i].Matrix[2][3];

            if (pipe_z > 8.0 && pipe_z < 12.0){
                if ((bird_bottom < gap_bottom) || (bird_top > gap_top+0.25) ){
                    console.log("you lose");
                    this.lost = true;
                }else if (!this.lost){
                    this.score += 1;
                    console.log(this.score);
                }
            }

        }

        // Check if need to add new pipe matrix
        //console.log(this.pipes[this.pipes.length-1])
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
        this.shapes.cube.draw(context, program_state, floor_transform, this.materials.flame);

        //if bird hits the floor or hits a pillar, game over
        //floor has y value of -7.5, sphere has radius of 1
        if (this.x <= -7.5){
            console.log("you lose");
            this.lost = true;
            this.prevLocation = model_transform_bird;
        }
        //this.shapes.bird.draw(context, program_state, model_transform_bird, this.materials.plastic.override({color:blue}));
        //this.shapes.bird.draw(context, program_state, model_transform_bird.times(Mat4.translation(0, 1, 0)), this.materials.plastic.override({color:blue}));



        // draw bird
        this.shapes.bird.draw(context, program_state, model_transform_bird, this.materials.bird);

        // draw background

        // reset force from keyboard press
        this.force = 0;


    }
}



// Extra
class Texture_Scroll_X extends Textured_Phong {
    // TODO:  Modify the shader below (right now it's just the same fragment shader as Textured_Phong) for requirement #6.
    fragment_glsl_code() {
        return this.shared_glsl_code() + `
            varying vec2 f_tex_coord;
            uniform sampler2D texture;
            uniform float animation_time;
            
            void main(){
                // COURTESY OF DISCUSSION 1C SKELETON CODE :D !
                // Sample the texture image in the correct place:
                float scale_factor = -2.0 * mod(animation_time, 4.0); // rotation needs 4 so it isn't skippy, but it is lenient for texture scroll
                vec2 new_tex_coord = vec2(f_tex_coord.x + scale_factor, f_tex_coord.y); // scroll x axis, to the right
                vec4 tex_color = texture2D( texture, new_tex_coord);
                
                // Modified from TA demo code
                float u = mod(new_tex_coord.x, 1.0);
                float v = mod(new_tex_coord.y, 1.0);
                if ((u >= 0.75 && u <= 0.85) && (v <= 0.85 && v >= 0.15))
                {
                    tex_color = vec4(0, 0, 0, 1.0);
                }
                if ((u >= 0.15 && u <= 0.25) && (v <= 0.85 && v >= 0.15))
                {
                    tex_color = vec4(0, 0, 0, 1.0);
                }
                if ((v >= 0.75 && v <= 0.85) && (u <= 0.85 && u >= 0.15))
                {
                        tex_color = vec4(0, 0, 0, 1.0);
                }
                if ((v >= 0.15 && v <= 0.25)&& (u <= 0.85 && u >= 0.15))
                {
                        tex_color = vec4(0, 0, 0, 1.0);
                }
                if( tex_color.w < .01 ) discard;
                                                                         // Compute an initial (ambient) color:
                gl_FragColor = vec4( ( tex_color.xyz + shape_color.xyz ) * ambient, shape_color.w * tex_color.w ); 
                                                                         // Compute the final color with contributions from lights:
                gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
        } `;
    }
}

