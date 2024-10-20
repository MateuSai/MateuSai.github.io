---
tags: [Godot 3.x]
prev_tutorial: seek-and-avoid-steerings
next_tutorial: wander-and-enclosure-steerings
---

In the last tutorial, we made the character follow the mouse and avoid rocks, but if we leave the mouse still, we can observe that the character doesn’t stop moving. He keeps moving like a pendulum.

![pendulum movement](/assets/images/godot/steering_behaviours/pendulum_movement.gif)

<!--more-->

In this tutorial we will make the character reduce his velocity as he approaches the mouse until completely stopping. We will implement the arrival steering.

First of all, let’s declare a new variable. Open your character script and add a global variable with the name “arrival_zone_radius”. This variable represents the radius of the zone where the character will start to slow down. I initialise it to 20, if you want to start reducing the velocity earlier, reduce it and, if you want to start reducing the velocity later, decrease it.

{% highlight gdscript %}
var arrival_zone_radius: int = 20
{% endhighlight %}

![arrival zone](/assets/images/godot/steering_behaviours/arrival_zone.jpg)

Create a new function called “arrival_steering” that returns a Vector2 containing the arrival steering. Add a Vector2 parameter with the name “vector_to_targe” that stores the vector to the target, in this case, the mouse.

Calculate the new speed, divide the distance to the target by the arrive zone radius and multiply the result by the max speed. This way, the speed of the character will decrease as he approaches the target. If the character just entered the arrival zone, his speed will be almost the maximum speed and, if his position equals the target position, the speed will be 0.

Now, calculate the desired velocity the same way we did with the seek steering, but with the speed we calculated: the direction to the target multiplied by the speed. Finally, return the arrival steering, the vector that goes from the current velocity to the desired velocity.

{% highlight gdscript %}
func arrival_steering(vector_to_target: Vector2) -> Vector2:
    var speed: float = (vector_to_target.length() / arrival_zone_radius) * max_speed
    var desired_velocity: Vector2 = vector_to_target.normalized() * speed
	
    return desired_velocity - velocity
{% endhighlight %}

![arrival desired velocity](/assets/images/godot/steering_behaviours/arrival_desired_velocity.jpg)

Scroll up to the physics_process function. Before calling the steering functions, add the “vector_to_target” variable, the vector that goes from the character position to the target position.

After that, check if the distance to the target is greater than the arrival zone radius. If so, call the seek steering function to make the character move at maximum speed. If not, call the new arrival steering function with the “vector_to_target” variable to make the character reduce his velocity.

{% highlight gdscript %}
func _physics_process(_delta: float) -> void:
    var steering: Vector2 = Vector2.ZERO

    var vector_to_target: Vector2 = get_global_mouse_position() - position
    if vector_to_target.length() > arrival_zone_radius:
        steering += seek_steering()
    else:
        steering += arrival_steering(vector_to_target)
    # [...]
{% endhighlight %}

Before testing the new steering, we can simplify the seek steering function using the new variable we created, “vector_to_target”. So, add a parameter in the seek steering function with the same name as the variable and replace the part where we calculate the vector to the target with the parameter. It’s always a good idea to simplify your code, we were calculating the vector to the target twice, one time is enough. Don’t forget to pass the “vector_to_target” variable as a parameter when you call it in the _physics_process function.

{% highlight gdscript %}
func seek_steering(vector_to_target: Vector2) -> Vector2:
    var desired_velocity: Vector2 = vector_to_target.normalized() * max_speed
	
    return desired_velocity - velocity
{% endhighlight %}
{% highlight gdscript %}
func _physics_process(_delta: float) -> void:
    # [...]
    if vector_to_target.length() > arrival_zone_radius:
        steering += seek_steering(vector_to_target)
    # [...]
{% endhighlight %}

This is the final result:

![arrival steering](/assets/images/godot/steering_behaviours/arrival_steering.gif)

<br>

<div id="tutorial-videos">
    <iframe id="odysee-iframe" width="560" height="315" src="https://odysee.com/$/embed/steering-behaviors-in-godot-arrival/6a1b56f1d2f44a01f2c7941b49c095ba8e138e94?r=5dDZJPgbdny6EiKLsWtNXNwnM936b7gf" allowfullscreen></iframe>
    <iframe id="youtube-iframe" src="https://www.youtube.com/embed/UauTCP933as" allowfullscreen></iframe>
</div>