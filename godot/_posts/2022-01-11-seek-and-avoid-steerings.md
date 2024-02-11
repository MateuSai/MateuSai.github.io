---
post_id: seek_and_avoid
tags: [Godot 3.x]
next_tutorial: arrival
---

While I was making the roguelike series, I found a few problems with the pathfinding: the paths are weird, the enemies can’t detect other enemies and the movement doesn’t look natural. So, I will make some tutorials about steering behaviours, a way to make the characters aware of their surroundings. We will start implementing the seek and avoid obstacles behaviours.

<!--more-->

But before, I want to send special thanks to beasty for making [the art](https://senukahws.itch.io/grassanddirt){:target="_blank"}, thanks bro!

We will start with the seek behaviour, the most simple. We will apply a force to move the velocity vector to face the target position. Open your character script and add a new Vector2  variable called velocity and store the maximum velocity of the character in a variable with the name “max_speed”. Also, store the maximum steering in a variable too, it has to be small because we will be adding the steering to the velocity every frame.

{% highlight gdscript %}
extends KinematicBody2D

var velocity: Vector2

var max_speed: int = 70
var max_steering: float = 2.5
{% endhighlight %}

Create a function called “seek_steering” that returns a Vector2. First, we calculate the desired velocity: the direction to the target, in this case the mouse, multiplied by the maximum speed. We return the seek steering, the vector that goes from the velocity to the desired velocity.

{% highlight gdscript %}
func seek_steering() -> Vector2:
	var desired_velocity: Vector2 = (get_global_mouse_position() - position).normalized() * max_speed
	
	return desired_velocity - velocity
{% endhighlight %}
![seek vectors](/assets/images/godot/steering_behaviours/seek_vectors.jpg)

Now, in the _physics_process function, create a variable called “steering” and initialise it to a zero vector. We will add all the steering to this variable, for the moment, add the seek steering to it. After adding all the steerins, clamp the variable to the maximum steering defined earlier.

Add the steering to the velocity and clamp the velocity with the maximum speed variable. Finally, move the character using the move_and_slide function with the velocity.

{% highlight gdscript %}
func _physics_process(_delta: float) -> void:
	var steering: Vector2 = Vector2.ZERO

	steering += seek_steering(vector_to_target)

	steering = steering.clamped(max_steering)

	velocity += steering
	velocity = velocity.clamped(max_speed)
	
	velocity = move_and_slide(velocity)
{% endhighlight %}

Play the game. The character follows the mouse, but he doesn't change direction instantly, he does it smoothly.

![seek steering](/assets/images/godot/steering_behaviours/seek_steering.gif)

To dodge the rocks we have to implement another steering behaviour, the obstacle avoidance steering.

Add a Node2D in your character scene and instance a raycast as a child into it. Make it face the right and enable it. Add 2 more raycasts inside the node: one above, and one below. These raycasts will detect the obstacles, the distance between them determine the separation to the obstacle. The bigger the distance between raycasts, the bigger the separation.

![raycast nodes](/assets/images/godot/steering_behaviours/raycast_nodes.jpg)
![character with raycasts](/assets/images/godot/steering_behaviours/character_with_raycasts.png)

Back at the character script, create a variable called “avoid_force” to determine the tendency of the player to avoid obstacles. I want to give priority to avoid the obstacles, so, I initialise the variable to 1000. Also, add an onready variable for the Node2D that contains all the raycasts.

{% highlight gdscript %}
# [...]
var avoid_force: int = 1000

onready var raycasts: Node2D = get_node("Raycasts")
# [...]
{% endhighlight %}

Create a new function with the name “avoid_obstacles_steering” that returns a Vector2, this function will return the corresponding steering. First of all, rotate the raycasts container to face the same direction as the velocity.

Iterate over the raycasts and update his length to match the velocity vector. The length of the raycasts can be modified using the cast_to.x value of the raycast. If the raycast is colliding, store the object in a variable and return the normalised vector, multiplied by the avoid force, that goes from the obstacle to the velocity vector plus the character position. This way, the faster the character goes, the bigger the raycasts range. And, if the velocity is very high and the character is near an obstacle, his speed will decrease. If none of the raycasts collide, return a zero vector.

{% highlight gdscript %}
func avoid_obstacles_steering() -> Vector2:
	raycasts.rotation = velocity.angle()
	
	for raycast in raycasts.get_children():
		raycast.cast_to.x = velocity.length()
		if raycast.is_colliding():
			var obstacle: PhysicsBody2D = raycast.get_collider()
			return (position + velocity - obstacle.position).normalized() * avoid_force
			
	return Vector2.ZERO
{% endhighlight %}
![avoid vectors](/assets/images/godot/steering_behaviours/avoid_vectors_2.jpg)
![avoid vectors](/assets/images/godot/steering_behaviours/avoid_vectors.jpg)

To apply the new steering, just add it to the steering variable in the _physics_process function.

{% highlight gdscript %}
func _physics_process(_delta: float) -> void:
	var steering: Vector2 = Vector2.ZERO

	steering += seek_steering(vector_to_target)
	steering += avoid_obstacles_steering()

	steering = steering.clamped(max_steering)

	# [...]
{% endhighlight %}

Play the game again and take a look, now, the character dodges the obstacles.

![avoid steering](/assets/images/godot/steering_behaviours/avoid_steering.gif)

<br>

<div id="tutorial-videos">
	<iframe id="odysee-iframe" width="560" height="315" src="https://odysee.com/$/embed/steering-behaviors-in-godot-seek-and/f4bbc23760a3ff29e3fba9dc86f9c01eabeeb177?r=5dDZJPgbdny6EiKLsWtNXNwnM936b7gf" allowfullscreen></iframe>
	<iframe id="youtube-iframe" src="https://www.youtube.com/embed/71NIMTfaBKQ" allowfullscreen></iframe>
</div>