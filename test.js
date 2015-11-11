// Measurement values are in SI units; EG: kg, meters, and seconds

var scale = 10, // So that the physics engine works properly
    drone_Depth = 0.02 * scale,
    drone_Height = 0.01 * scale,
    drone_Width = 0.02 * scale,
    motor_Diameter = 0.008 * scale,
    starting_Height = 0 * scale,
    drone_Body_Weight = 0.2 * scale,
    drone_Motor_Weight = 0.1 * scale,
    drone_Weight = (drone_Body_Weight + drone_Motor_Weight * 4) * scale,
    gravity_Strength = 9.8 * scale,
    camera_Distance = 1 * scale,
    floor_Size = 5 * scale,
    floor_Thickness = 0.5 * scale,
    power = true,
    throttle = 4.915 * scale,
    motor_Increment = 0.01 * scale,
    control_Increment = 1 * scale,
    pitch_Offset = 0,
    roll_Offset = 0,
    yaw_Offset = 0,
    motor_Max = 10 * scale,
    motor_Min = 0,
    motor_Power = [0, 0, 0, 0],
    motor_Angle = [0, 0, 0, 0], // Made global for helper arrows
    roll_Control = 0,
    pitch_Control = 0,
    debug = true,
    helper_Arrow_Scale = 0.03;

document.addEventListener(
    'keydown',
    function(event) {
        if (event.keyCode == 13) { // "Enter" key
            var death_Ball = new Physijs.SphereMesh(
                new THREE.SphereGeometry(drone_Width * 1.5, 8, 8),
                motor_Material,
                drone_Weight / 1000
            );

            death_Ball.position.x = drone_Body.position.x + drone_Width / 2;
            death_Ball.position.y = drone_Body.position.y + drone_Height * 10;
            death_Ball.position.z = drone_Body.position.z + drone_Width / 2;

            death_Ball.castShadow = true;

            death_Ball.setCcdMotionThreshold(drone_Height / 2);
            death_Ball.setCcdSweptSphereRadius(drone_Height / 2);

            scene.add(death_Ball);
        } else if (event.keyCode == 32) { // Spacebar
            power = !power;
            // console.log("Toggling motors");
        } else if (event.keyCode == 38) { // Up arrow
            throttle += motor_Increment;
            // console.log("Increasing motor power");
        } else if (event.keyCode == 40) { // Down arrow
            throttle -= motor_Increment;
            // console.log("Decreasing motor power");
        } else if (event.keyCode == 65) { // "A" key
            roll_Control = -control_Increment;
        } else if (event.keyCode == 68) { // "D" key
            roll_Control = control_Increment;
        } else if (event.keyCode == 83) { // "S" key
            pitch_Control = control_Increment;
        } else if (event.keyCode == 87) { // "W" key
            pitch_Control = -control_Increment;
        }
    }
);

document.addEventListener( // Kill user controls if we're not hitting a key
    'keyup',
    function(event) {
        if (event.keyCode == 65) { // "A" key
            roll_Control = 0;
        } else if (event.keyCode == 68) { // "D" key
            roll_Control = 0;
        } else if (event.keyCode == 83) { // "S" key
            pitch_Control = 0;
        } else if (event.keyCode == 87) { // "W" key
            pitch_Control = 0;
        }
    }
);

var p = 3;
var i = 0;
var d = 0.15;
var rollPid = new PID(p, i, d);
var pitchPid = new PID(p, i, d);

var main = function() {
    if (power) {
        var roll = -rollPid.update(getTilt().x);
        var pitch = -pitchPid.update(getTilt().z);

        roll_Offset = roll + roll_Control;
        pitch_Offset = pitch + pitch_Control;

        motor_Power[0] = throttle - roll_Offset / 2 + pitch_Offset / 2;
        motor_Power[1] = throttle + roll_Offset / 2 + pitch_Offset / 2;
        motor_Power[2] = throttle + roll_Offset / 2 - pitch_Offset / 2;
        motor_Power[3] = throttle - roll_Offset / 2 - pitch_Offset / 2;

        for (var i = 0; i < motor_Power.length; i++) { // Keep motors within bounds
            if (motor_Power[i] < motor_Min) {
                motor_Power[i] = motor_Min;
            } else if (motor_Power[i] > motor_Max) {
                motor_Power[i] = motor_Max;
            }
        }

        impulseMotors();
    }

    safetySwitch();
    helperArrows(); // Update the helper arrows (for debugging purposes)
};
