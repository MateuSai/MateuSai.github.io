---
post_id: multiplayer_game_7
prev_tutorial: multiplayer_game_6
next_tutorial: multiplayer_game_8
discard_start: "Let's Make A Multiplayer Game #7:"

thumbnail: "/assets/images/godot/multiplayer_game/7/thumbnail.jpg"
---

In this tutorial, we are going to synchronize the player position, as well as his animation, between all the clients. We will also synchronize the flip_h property of the player, so when a client is facing the left, it will be facing the left in all the clients. Let’s get started.

<!--more-->


## Synchronize Position

To do it, we are going to use signals. Let’s start with the position. In the player script, define a signal called "position_changed" with an argument that will contain the new position. Emit this signal at the end of the `_physics_process` function, passing the current position of the player as argument. So, every physics frame, the signal `position_changed` will transmit the current position of the player. But where? We have to connect the signals.

{% highlight gdscript %}
# Player.gd

signal position_changed(new_pos)

# ...

func _physics_process(delta: float) -> void:

    # ...

    emit_signal("position_changed", position)
{% endhighlight %}

We will manage all the signals from the client script. Open it and, at the pre_configure_game function, after spawning the client player, connect the signal. Connect it to the `_on_position_changed` function and print an error message if the connection fails.

Now, create the `_on_position_changed` function. Inside this function, call the `change_player_pos` of the server, passing the new player position as argument. Note that, this time, I use the `rpc_unreliable_id` function instead of the `rpc_id` function I used the other times. Since the position of the player will update a lot of times every second, I don’t care if the data is lost a few times.

> `rpc_unreliable` does not make sure the data is delivered correctly, so, sometimes we can loss it.

{% highlight gdscript %}
# Client.gd

remote func pre_configure_game() -> void:

    # ...
    
    var my_player: KinematicBody2D = preload("res://characters/Player.tscn").instance()
    game.add_child(my_player)
    player_info[get_tree().get_network_unique_id()].instance = my_player
    
    if my_player.connect("position_changed", self, "_on_position_changed"):
        printerr("Error connecting position_changed signal")
    
    # ...
            
    rpc_id(1, "done_preconfiguring")


func _on_position_changed(new_pos: Vector2) -> void:
    rpc_unreliable_id(1, "change_player_pos", new_pos)
{% endhighlight %}

<br>


Go to the server project and add the `change_player_pos` function. Get the sender id using the `get_rpc_sender_id` function. With this id, get the room of the player who called the function. After that, iterate over all the players in the room. Add an if to make sure the player id of the player in the current iteration is not the one who called the function. We don’t need to update the position of the player who called the function, his player is already in the right position. Call the `update_player_pos` of the rest of the players. Pass the id of the player who changed position and his new position as arguments.

{% highlight gdscript %}
# Server.gd

remote func change_player_pos(new_pos: Vector2) -> void:
    var sender_id: int = get_tree().get_rpc_sender_id()
    
    var room: Dictionary = _get_room(sender_id)
    
    for player_id in room.players:
        if player_id != sender_id:
            rpc_unreliable_id(player_id, "update_player_pos", sender_id, new_pos)
{% endhighlight %}

> I also use rpc_unreliable here. Like before, losing information sometimes won’t affect the game much.

<br>


Back at the client project, add the `update_player_pos` function. Get the player information using the id as the key in the `player_info` dictionary. We have the player stored in the `instance` variable of this information. Update his position with the new one.

{% highlight gdscript %}
# Client.gd

remote func update_player_pos(id: int, pos: Vector2) -> void:
    player_info[id].instance.position = pos
{% endhighlight %}

<br>


Open 2 clients and start a game. As we can see, the player position gets synchronized between the clients. However, his facing direction and animations are not updated. Let’s synchronize them too.

![Position synchronized](/assets/images/godot/multiplayer_game/7/position%20synchronized.gif)


## Synchronize flip_h and animation

Go to the player script and add 2 new signals:
* `flip_h_changed` with an argument with the new value of the `flip_h` property
* `animation_changed` with an argument containing the name of the new animation.

{% highlight gdscript %}
# Player.gd

signal flip_h_changed(flip_h)
signal animation_changed(anim_name)
{% endhighlight %}

We want to emit the `flip_h_changed` signal when the facing direction of the player changes. That’s easy, we already have a function that is called when the player changes the facing direction, the `_flip` function. Emit the `flip_h_changed` signal at the end of the function, passing the value of the `flip_h` property of the `sprite` as the argument. We emit the signal after the `flip_h` property has been updated, so it will have the current value.

{% highlight gdscript %}
# Player.gd

func _flip() -> void:
    sprite.flip_h = not sprite.flip_h
    hitbox_col.position.x *= -1
    emit_signal("flip_h_changed", sprite.flip_h)
{% endhighlight %}

As for the `animation_changed` signal, the `AnimationPlayer` has a signal that will be emitted when the animation changes. Connect the `animation_started` signal to the script. Inside the function connected to the `animation_started` signal, emit our `animation_changed` signal. Pass the name of the new animation as argument.

> Don’t confuse the `animation_started` signal with the `animation_changed` signal. The last one is emitted when a queued animation plays, we don’t queue animations, so this signal will never be emitted.

{% highlight gdscript %}
# Player.gd

func _on_AnimationPlayer_animation_started(anim_name: String) -> void:
    emit_signal("animation_changed", anim_name)
{% endhighlight %}

<br>


Connect the signals in the client script, in the `pre_configure_game` function, below the line where we connect the `position_changed` signal. Let’s start with the `flip_h_changed` signal. Connect it to the `_on_flip_h_changed` function. Print an error message if the connection fails. Next, connect the `animation_changed` signal to the `_on_animation_changed` function. If the connection fails, print an error message too.

{% highlight gdscript %}
# Client.gd

remote func pre_configure_game() -> void:
    
    # ...
    
    var my_player: KinematicBody2D = preload("res://characters/Player.tscn").instance()
    game.add_child(my_player)
    player_info[get_tree().get_network_unique_id()].instance = my_player
    
    if my_player.connect("position_changed", self, "_on_position_changed"):
        printerr("Error connecting position_changed signal")
    if my_player.connect("flip_h_changed", self, "_on_flip_h_changed"):
        printerr("Error connecting flip_h_changed signal")
    if my_player.connect("animation_changed", self, "_on_animation_changed"):
        printerr("Error connecting animation_changed signal")
    
    # ...
            
    rpc_id(1, "done_preconfiguring")
{% endhighlight %}

Create the `_on_flip_h_changed` function. Call the `change_player_flip_h` function of the server, passing the `flip_h` value as argument. This time, I don’t use `rpc_unreliable` because we can’t lose any packet. This signal will only be emitted once when the `flip_h` property changes, if the server does not receive the information, the players could end facing the wrong direction.

{% highlight gdscript %}
# Client.gd

func _on_flip_h_changed(flip_h: bool) -> void:
    rpc_id(1, "change_player_flip_h", flip_h)
{% endhighlight %}

Create the `_on_animation_changed` function. Call the `change_player_anim` function of the server. Pass the name of the animation. Like the previous function, I don’t use `rpc_unreliable` because it’s important that the server receives all the calls. It’s not like the position that is sent a lot of times every second, the animation signal is only emitted when the animation changes.

{% highlight gdscript %}
# Client.gd

func _on_animation_changed(anim_name: String) -> void:
    rpc_id(1, "change_player_anim", anim_name)
{% endhighlight %}

<br>


Go to the server project to add the 2 new functions we are calling from the client. The structure is the same as the `change_player_pos` function, they tell the other clients in the room about the change.

Add the `change_player_flip_h` function. Get the id of the caller and get the room with this id. Iterate over all the players in the room, excluding the caller, and call their `update_player_flip_h` function, passing the id of the caller and the new `flip_h` value as arguments.

{% highlight gdscript %}
# Server.gd

remote func change_player_flip_h(flip_h: bool) -> void:
    var sender_id: int = get_tree().get_rpc_sender_id()
    
    var room: Dictionary = _get_room(sender_id)
    
    for player_id in room.players:
        if player_id != sender_id:
            rpc_id(player_id, "update_player_flip_h", sender_id, flip_h)
{% endhighlight %}

Add the `change_player_anim` function too. Get the id of the client who called the function. With the id, get the room. Call the `update_player_anim` of all the other players in the room. Pass the id of the player that changed animation and the name of the new animation as arguments.

{% highlight gdscript %}
# Server.gd

remote func change_player_anim(anim_name: String) -> void:
    var sender_id: int = get_tree().get_rpc_sender_id()
    
    var room: Dictionary = _get_room(sender_id)
    
    for player_id in room.players:
        if sender_id != player_id:
            rpc_id(player_id, "update_player_anim", sender_id, anim_name)
{% endhighlight %}

<br>


Go to the client project. Create the `update_player_flip_h` function. Change the `flip_h` property of the `sprite` of the player specified by the id parameter. The player is stored in the `instance` variable of `player_info`.

{% highlight gdscript %}
# Client.gd

remote func update_player_flip_h(id: int, flip_h: bool) -> void:
    player_info[id].instance.sprite.flip_h = flip_h
{% endhighlight %}

Add the `update_player_anim` function. Get the `instance` of the player specified by the `id` parameter, and use his `AnimationPlayer` to play the new animation, the one in the second parameter.

{% highlight gdscript %}
# Client.gd

remote func update_player_anim(id: int, anim_name: String) -> void:
    player_info[id].instance.animation_player.play(anim_name)
{% endhighlight %}

<br>


Open 2 clients and test it. The game crashes. It says that `animation_player` is null.

![animation_player error](/assets/images/godot/multiplayer_game/7/animation_player_error.jpg)

The problem is that the onready variable containing the `AnimationPlayer` is in the Player script. But we need to change the animation of the other players too, the ones controlled by the other clients and represented by base characters. So, move the onready variable to the BaseCharacter script. This way, both of them have access to the `AnimationPlayer`.

{% highlight gdscript %}
# Player.gd

onready var state_machine: Node = get_node("StateMachine")
# onready var animation_player: AnimationPlayer = get_node("AnimationPlayer")  <--  Remove this line
onready var hitbox_col: CollisionShape2D = get_node("Hitbox/CollisionShape2D")
{% endhighlight %}

{% highlight gdscript %}
# BaseCharacter.gd

onready var sprite: Sprite = get_node("Sprite")
onready var animation_player: AnimationPlayer = get_node("AnimationPlayer") #  <--  Add this line
{% endhighlight %}

<br>


Open some clients and test it. Now, the `flip_h` property and the animations are synchronized too.

![Final result](/assets/images/godot/multiplayer_game/7/final_result.gif)

<br>

In the next tutorial, we will make the players able to attack other players, and we will make them resurrect a few seconds after dying.

## References
* [Godot docs](https://docs.godotengine.org/en/stable/tutorials/networking/high_level_multiplayer.html){:target="_blank"}
* [Exporting for dedicate servers](https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_dedicated_servers.html#doc-exporting-for-dedicated-servers){:target="_blank"}
* [Download headless version of Godot](https://godotengine.org/download/server){:target="_blank"}
* [Run headless server](https://godotengine.org/qa/11251/how-to-export-the-project-for-server){:target="_blank"}