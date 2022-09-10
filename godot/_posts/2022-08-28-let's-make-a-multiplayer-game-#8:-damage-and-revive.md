---
post_id: multiplayer_game_8
prev_tutorial: multiplayer_game_7
next_tutorial: multiplayer_game_9
discard_start: "Let's Make A Multiplayer Game #8:"

thumbnail: "/assets/images/godot/multiplayer_game/8/thumbnail.jpg"
---

Today we will make the clients able to attack other clients. Currently, you can damage the other players, but the other players don’t know about it. Let’s start implementing the die function.

<!--more-->


## Damage other players

Let’s check the `BaseCharacter` script. In a previous tutorial we made a die function in this script. This function will be called when the `hp` of the character is less or equal than 0. Instead of implementing the die function here, we will override it in the `Player` script.

{% highlight gdscript %}
# BaseCharacter.gd

func die() -> void:
	pass


func set_hp(new_hp: int) -> void:
	hp = new_hp
	print("new hp is " + str(hp))
	if hp <= 0:
		die()
{% endhighlight %}

In the player script, override the `die` function and, inside it, set the state to `DEAD`. We have to do it in the player script because the `BaseCharacter` does not have state machine. Besides, it’s not necessary to make the `BaseCharacter` play the dead animation, it will be played automatically thanks to the `animation_changed` signal we made in the last tutorial.

{% highlight gdscript %}
# Player.gd

func die() -> void:
	state_machine.set_state(state_machine.DEAD)
{% endhighlight %}


Next, let’s tell the other players when we damage them. Add a signal called damage with 2 arguments: the id of the damaged player and the amount of damage. We will emit this signal from the hitbox script.

{% highlight gdscript %}
# Player.gd

signal damage(id, dam)
{% endhighlight %}

Open it, and, below the line where we damage the player, emit the damage signal we just created. To get the id of the damaged player, cast his name to `int`. As for the damage amount, type 1. I used the name of the character to get his id, but he does not have his id as name, we have to implement this before continuing.

But before, now that I think about it, we don’t need to call the `damage` function here. Each client will manage his own `hp`, we only have to tell them when we damage them, we don’t need to reduce the `hp` from his `BaseCharacter`.

{% highlight gdscript %}
# Hitbox.gd

func _on_Hitbox_body_entered(body: Node) -> void:
	if body != player:
		print(body.name + " entered hitbox")
		player.emit_signal("damage", int(body.name), 1)
{% endhighlight %}

<br>


Open the `BaseCharacter` script and add a function called `initialize` with 3 parameters:
* his id,
* his name, and 
* his character index.

Also, create an onready variable for the label name, we will need it in a moment. Inside the function, change the name of the character node to his id. The name of the node must be a `String`, that’s why we have to convert it.

Next, set the text of the label with the `name` parameter. This way, the label will show the real name of the player. This will make more sense when we implement the character creator and we can change the name.

{% highlight gdscript %}
# BaseCharacter.gd

func initialize(id: int, name: String, character_index: int) -> void:
	self.name = str(id)
	
	name_label.text = name
{% endhighlight %}

We have to call this function when we spawn the players. In the `pre_configure_game` function, after creating a new instance of our player, call his `initialize` function. I don’t remember why I used `call_deferred`, I think I was getting some error calling the function normally. We can get the id of the player with the `get_network_unique_id` function. The name and character index are in the `my_info` dictionary. The character index will be useful in the future.

Now, let’s do the same for the rest of the players. In the for loop, after creating a new instance of the `BaseCharacter` scene, call his `initialize` function. The id of the player is `player_id`. We can get the name and the character index from the `player_info` dictionary.

{% highlight gdscript %}
# Client.gd

remote func pre_configure_game() -> void:
    # ...

    var my_player: KinematicBody2D = preload("res://characters/Player.tscn").instance()
	my_player.call_deferred("initialize", get_tree().get_network_unique_id(), my_info.name, my_info.character_index)
	game.add_child(my_player)
	player_info[get_tree().get_network_unique_id()].instance = my_player
	
	# ...
	
	for player_id in player_info:
		if player_id != get_tree().get_network_unique_id():
			var player: KinematicBody2D = preload("res://characters/BaseCharacter.tscn").instance()
			player.call_deferred("initialize", player_id, player_info[player_id].name, player_info[player_id].character_index)
			game.add_child(player)
			player_info[player_id].instance = player

    # ...
{% endhighlight %}

<br>


If we play the game now, the name of the players will be the default name we defined in the `my_info` dictionary instead of the default text of the `Label`. It will be “Elizabeth” instead of “Hasegawa”.

![Players with player_info name](/assets/images/godot/multiplayer_game/8/players_with_player_info_name.png)

<br>


With that done, let’s continue with the `damage` signal. Like the other player signals, connect it at the `pre_configure_game` function. Use `_on_player_damaged` as the target function, and print an error message if the connection fails.

{% highlight gdscript %}
# Client.gd

remote func pre_configure_game() -> void:
    # ...

    if my_player.connect("position_changed", self, "_on_position_changed"):
		printerr("Error connecting position_changed signal")
	if my_player.connect("flip_h_changed", self, "_on_flip_h_changed"):
		printerr("Error connecting flip_h_changed signal")
	if my_player.connect("animation_changed", self, "_on_animation_changed"):
		printerr("Error connecting animation_changed signal")
	if my_player.connect("damage", self, "_on_player_damaged"):
		printerr("Error connecting damage signal")

    # ...
{% endhighlight %}

Create the _on_player_damaged function. Inside the function, call the damage_player function of the server. Don’t forget to pass the function parameters as arguments.

{% highlight gdscript %}
# Client.gd

func _on_player_damaged(id: int, dam: int) -> void:
	rpc_id(1, "damage_player", id, dam)
{% endhighlight %}

<br>


In the server project, add the `damage_player` function. This one is different of the ones we implemented in the last video. Instead of telling all the player in the room that a player has been damaged, we will only tell the one who has been damaged. Since there is no visual representation of the health, the other players don’t need to know that we damaged the player.

So, inside the function, call the `damage` function of the player who has been damaged. Pass only the `damage` as argument.

{% highlight gdscript %}
# Server.gd

func _on_player_damaged(id: int, dam: int) -> void:
	rpc_id(1, "damage_player", id, dam)
{% endhighlight %}

<br>


Finally, in the client script, add the `damage` function. Call the `damage` function of our player, passing the `damage` parameter as argument. You can get the player of the client using the `get_network_unique_id` function as the key of the `player_info` dictionary.

{% highlight gdscript %}
# Client.gd

remote func damage(dam: int) -> void:
	player_info[get_tree().get_network_unique_id()].instance.damage(dam)
{% endhighlight %}


Let’s open some clients to test it.

> By the way, to open multiple clients, I execute godot in the project directory.
>
> ![Open game instance](/assets/images/godot/multiplayer_game/8/open_game_instance.jpg)

Now, when we attack the other player, the damage function of his client script is executed and his life is reduced. When it reaches 0, he dies. Thanks to the `can_move` variable we made in a previous video, he cannot move after dying.

![Damage player](/assets/images/godot/multiplayer_game/8/damage_player.gif)

After playing the game, we get 2 warnings:

![Warnings](/assets/images/godot/multiplayer_game/8/warnings.jpg)

The first one is because we are not using the character index parameter in the `initialize` function. We will use it in a later tutorial, just ignore the warning for the moment. We also get a warning because we are not emitting the `damage` signal from the `Player` script. Since we are emitting the signal from the hitbox script, we don’t care about the warning, we can remove it clicking on ignore. This warning will not bother us anymore.

![Ignore button](/assets/images/godot/multiplayer_game/8/ignore_button.jpg)
{% highlight gdscript %}
# Player.gd

# warning-ignore:unused_signal
signal damage(id, dam)
{% endhighlight %}


## Revive players

Now, let’s make the player resurrect with a timer. In the `Player` scene, add a new `Timer` node and change his name to “ReviveTimer”. The wait time of the timer is the time it will take to revive the player. I am going to use 7, so we don’t have to wait much. We don’t want the timer to loop, so, check one shot.

![ReviveTimer node](/assets/images/godot/multiplayer_game/8/revive_timer_node.jpg)
![ReviveTimer properties](/assets/images/godot/multiplayer_game/8/revive_timer_properties.jpg)

Actually, the dead animation is very long, I’m going to cut it to 5 seconds, so the player does not revive before the dead animation finishes.

![dead animation](/assets/images/godot/multiplayer_game/8/dead_animation.jpg)


Enter the state machine script and add an onready variable for the `ReviveTimer`.

{% highlight gdscript %}
# StateMachine.gd

onready var revive_timer: Timer = player.get_node("ReviveTimer")
{% endhighlight %}

When the player enters the `DEAD` state, start the timer.

{% highlight gdscript %}
# StateMachine.gd

func _enter_state(new_state: int) -> void:
	match new_state:
		# ...

		DEAD:
			player.can_move = false
			player.animation_player.play("dead")
			revive_timer.start()
{% endhighlight %}

Now, we need a way to go back to `IDLE` when the timer ends. In the `_get_transition` function, add a `DEAD` case. If the `ReviveTimer` is stopped, return `IDLE`.

{% highlight gdscript %}
# StateMachine.gd

func _get_transition() -> int:
	match state:
		# ...

		DEAD:
			if revive_timer.is_stopped():
				return IDLE
				
	return -1
{% endhighlight %}

So, after 7 seconds, the player will change the state back to `IDLE`. But he will still have 0 `hp` and `can_move` will still be `false`, we have to change them when we exit the `DEAD` state.

Create a new function called `_exit_state` with a parameter containing the state we exited. If the state exited is `DEAD`, change the `hp` back to 2 and `can_move` to `true`. In the `set_state` function, call the `_exit_state` function after making sure the new state is different, before updating the value. Pass `state` as argument. At this point, `state` still have the previous value because it has not been updated yet.

{% highlight gdscript %}
# StateMachine.gd

func _exit_state(state_exited: int) -> void:
	match state_exited:
		DEAD:
			player.hp = 2
			player.can_move = true
			
			
func set_state(new_state: int) -> void:
	if state != new_state:
		_exit_state(state)
		state = new_state
		_enter_state(new_state)
{% endhighlight %}


If we play the game now, the players should revive 7 seconds after dying. As we can see, they are indeed, resurrecting 7 seconds after dying.

![Final result](/assets/images/godot/multiplayer_game/8/final_result.gif)


That’s all for today. At this point we already have a playable game, but all the players have the same character and name. In the next tutorial, we will make a character creator.


## References
* [Godot docs](https://docs.godotengine.org/en/stable/tutorials/networking/high_level_multiplayer.html){:target="_blank"}
* [Exporting for dedicate servers](https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_dedicated_servers.html#doc-exporting-for-dedicated-servers){:target="_blank"}
* [Download headless version of Godot](https://godotengine.org/download/server){:target="_blank"}
* [Run headless server](https://godotengine.org/qa/11251/how-to-export-the-project-for-server){:target="_blank"}


<div id="tutorial-videos">
    <iframe id="odysee-iframe" src="https://odysee.com/$/embed/let%27s-make-a-godot-multiplayer-game-8/018aaacb8573968f754ecc2be66329e782782c50?r=5dDZJPgbdny6EiKLsWtNXNwnM936b7gf" allowfullscreen></iframe>
    <iframe id="youtube-iframe" src="https://www.youtube.com/embed/pygWv2kzscc" allowfullscreen></iframe>
</div>