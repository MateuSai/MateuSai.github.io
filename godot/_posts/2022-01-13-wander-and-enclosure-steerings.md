---
layout: post
prev_tutorial: Arrival Steering
---

In this tutorial we are going to implement the wander and enclosure steerings. We will make the character move randomly inside a defined area. This steering is useful, for example, with characters that don’t have anything to do until the player approaches them.

Before starting coding, let me explain a little how the wander steering works. We create a circle in front of the character. Then, we add the radius of the circle with a random angle to the vector to the circle and we obtain the desired velocity. We will modify the angle a little every frame, so the character won’t change direction all of a sudden.

![wander vectors](/assets/images/godot/steering behaviours/wander vectors start.jpg)

With that said, it’s time to start coding.

Let’s start declaring a pair of constants. The WANDER_CIRCLE_RADIUS constant stores the radius of the circle, it will influence the turning speed of the character. Create another constant called WANDER_RANDOMNESS that stores the maximum amount of variation the angle of the wander radius can have every frame. The greater the randomness, the greater the direction variation the character will experience.

Now, create a variable with the name “wander_angle” to store the angle of the wander circle and initialise it to 0. Also, we will need a boolean variable to store whether the player is wandering or not. You can make it an export variable to change its value easily from the editor.

{% highlight gdscript %}
const WANDER_CIRCLE_RADIUS: int = 8
const WANDER_RANDOMNESS: float = 0.2
var wander_angle: float = 0
export(bool) var wandering: bool = true
{% endhighlight %}

Create the wander steering function. Firstly, set the value of the wander_angle variable using the rand_range function. The angle will be between the actual angle minus the randomness constant and the actual angle plus the randomness constant.

After that, we calculate the vector to the target multiplying the normalised velocity by the max speed and we store the result in a variable. In another variable, store the desired velocity: the vector to the circle plus the circle radius rotated by the wander angle. Note that I put the radius on the x component of the vector, this will cause the character to move to the right when the angle is 0.

And, at the end of the function, return the desired velocity minus the actual velocity.

{% highlight gdscript %}
func wander_steering() -> Vector2:
    wander_angle = rand_range(wander_angle - WANDER_RANDOMNESS, wander_angle + WANDER_RANDOMNESS)
	
    var vector_to_cicle: Vector2 = velocity.normalized() * max_speed
    var desired_velocity: Vector2 = vector_to_cicle + Vector2(WANDER_CIRCLE_RADIUS, 0).rotated(wander_angle)
	
    return desired_velocity - velocity
{% endhighlight %}

This function will randomise the direction of the bro using the wander angle. The wander angle will be the new direction of the bro, he will rotate his velocity vector to attempt to match the wander angle.

![wander vectors](/assets/images/godot/steering behaviours/wander vectors.jpg)

Go to the _physics_process function and add an if after declaring the steering variable. Check if the wandering variable is true. If so, add the wander steering, elsewise add the rest of the steering we did in the previous tutorials. This could be done with a state machine, but I don’t want to make it too complex.

{% highlight gdscript %}
func _physics_process(_delta: float) -> void:
    var steering: Vector2 = Vector2.ZERO
	
    if wandering:
        steering += wander_steering()
    else:
        var vector_to_target: Vector2 = get_global_mouse_position() - position
        if vector_to_target.length() > arrival_zone_radius:
            steering += seek_steering(vector_to_target)
        else:
            steering += arrival_steering(vector_to_target)
    # [...]
{% endhighlight %}

The wander steering is all ready, but the result of the rand_range function to determine the angle will always be the same, we have to randomise the seed to make it different every time we play the game. Add the randomise function at the _init function of the script of the root node of your game. Or wherever you want, but it should be called once at the start of the game.

{% highlight gdscript %}
# Game.gd
func _init() -> void:
    randomize()
{% endhighlight %}

Now, you can play the game and the character will move randomly around the map. But we have a problem, the bro can go beyond the camera limits, we must create a new steering to limit his movement area: the enclosure steering.

![wander steering](/assets/images/godot/steering behaviours/wander steering.gif)

So, back at the character script, add an export variable called “enclosure_zone” and store in it a Rect2 with the zone where you want the bro to wander. The Rect2 has two Vector2: the first one is the position where the zone starts, and the second one is the dimensions of the zone: the width and the height.

{% highlight gdscript %}
export(Rect2) var enclosure_zone: Rect2 = Rect2(16, 16, 480, 256)
{% endhighlight %}

Create a new function that returns a Vector2 for the enclosure steering. Inside the function declare a variable called “desired_velocity” and initialise it to zero vector. Now, for every direction, check if the character is out of the bounds. If so, increase the desired velocity by one in the opposite direction.

After checking every direction, normalise the desired velocity and multiply it by the maximum speed. If the desired velocity is not a zero vector, set the wander angle to the direction of the desired velocity to avoid the bro going in the exact same direction after entering again the zone limit. In that case, return the desired velocity minus the velocity. If the desired velocity is a zero vector, return a zero vector.

{% highlight gdscript %}
func enclosure_steering() -> Vector2:
    var desired_velocity: Vector2 = Vector2.ZERO
	
    if position.x < enclosure_zone.position.x:
        desired_velocity.x += 1
    elif position.x > enclosure_zone.position.x + enclosure_zone.size.x:
        desired_velocity.x -= 1
    if position.y < enclosure_zone.position.y:
        desired_velocity.y += 1
    elif position.y > enclosure_zone.position.y + enclosure_zone.size.y:
        desired_velocity.y -= 1
		
    desired_velocity = desired_velocity.normalized() * max_speed
    if desired_velocity != Vector2.ZERO:
        wander_angle = desired_velocity.angle()
        return desired_velocity - velocity

    return Vector2.ZERO
{% endhighlight %}

To summarise, if the bro oversteps the limits of the enclosure area, we create a force to make it turn inside the zone again.

![enclosure vectors](/assets/images/godot/steering behaviours/enclosure vectors.jpg)

To apply the steering, add the function we just implemented to the steering variable in the _physics_process function, above the line where we add the wander steering.

{% highlight gdscript %}
func _physics_process(_delta: float) -> void:
    var steering: Vector2 = Vector2.ZERO
	
    if wandering:
        steering += enclosure_steering()
        steering += wander_steering()
    # [...]
{% endhighlight %}

Play the game one last time. The bro wanders around the map, but cannot exit the limits of the enclosure zone. He also has the “avoid obstacles steering”, so he dodges the rocks too.

![enclosure steering](/assets/images/godot/steering behaviours/enclosure steering.gif)

<iframe src="https://www.youtube.com/embed/FmKJ9rnNMMc"></iframe>
