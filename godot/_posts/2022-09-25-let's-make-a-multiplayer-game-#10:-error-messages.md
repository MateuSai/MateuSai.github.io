---
post_id: multiplayer_game_10
prev_tutorial: multiplayer_game_9
next_tutorial: multiplayer_game_11
discard_start: "Let's Make A Multiplayer Game #10:"

thumbnail: "/assets/images/godot/multiplayer_game/10/thumbnail.jpg"
---


In this tutorial, we will show error messages when a client tries to connect to an invalid room or the game of the room already started.

<!--more-->


In the `JoinDialog` script, create a new function called “show_error” with a parameter that will contain the text of the error. Inside the function, put the error message in the label and show it.

{% highlight gdscript %}
# JoinDialog.gd

func show_error(msg: String) -> void:
	error_label.text = msg
	error_label.show()
{% endhighlight %}

Open the `Client` script and create a function with the same name and the same parameter. Add `remote`, since we are going to call this function from the server. Call the `show_error` function of the `JoinDialog`, passing the message as argument.

{% highlight gdscript %}
# Client.gd

remote func show_error(msg: String) -> void:
	get_tree().current_scene.join_dialog.show_error(msg)
{% endhighlight %}

<br>


Now, open the server project and create 2 constants with the error messages:
* one in case of connecting to a room that does not exist,
* and the other for connecting to a room where the game started.

{% highlight gdscript %}
# Server.gd

const ERROR_INEXISTENT_ROOM: String = "There is no room with such id"
const ERROR_GAME_ALREADY_STARTED: String = "Game already started"
{% endhighlight %}

Go to the `join_room` function. Let’s add some conditionals. If there is no room with the id specified by the client, call the `show_error` function, passing the corresponding error message. Disconnect the player with the `disconnect_peer` function.

If the state of the room is `STARTED`, it means the game already started, call the `show_error` function and pass the error message. Like before, disconnect the player.

If none of these 2 conditions are true, execute the `_add_player_to_room` function to add the player to the room.

{% highlight gdscript %}
# Server.gd

remote func join_room(room_id: int, info: Dictionary) -> void:
	var sender_id: int = get_tree().get_rpc_sender_id()
	
	if not rooms.keys().has(room_id):
		rpc_id(sender_id, "show_error", ERROR_INEXISTENT_ROOM)
		get_tree().network_peer.disconnect_peer(sender_id)
	elif rooms[room_id].state == STARTED:
		rpc_id(sender_id, "show_error", ERROR_GAME_ALREADY_STARTED)
		get_tree().network_peer.disconnect_peer(sender_id)
	else:
		_add_player_to_room(room_id, sender_id, info)
{% endhighlight %}

<br>

Let's try it:

![Join dialog closing](/assets/images/godot/multiplayer_game/10/join_dialog_closing.gif)


It works. But we have a problem, the join dialog is closed and we can’t see the message. We have to find a way of not hiding it.

<br>


We can do it adding a variable in the `Menu` script. In the `show_error` function of the `Client` script, change the `keep_join_dialog_open` variable of the `Menu` scrip to `true`.

{% highlight gdscript %}
# Client.gd

remote func show_error(msg: String) -> void:
	get_tree().current_scene.keep_join_dialog_open = true
	get_tree().current_scene.join_dialog.show_error(msg)
{% endhighlight %}

But we have not declared this variable yet. So, go to the menu script and declare it. Initialize it to `false`, since we want to close the dialog by default.

{% highlight gdscript %}
# Menu.gd

var keep_join_dialog_open: bool = false
{% endhighlight %}

The function that closes the join dialog is the `remove_all_players` function. Scroll down until you find it and add an if before hiding the join dialog. If `keep_join_dialog_open` is `true`, change the value of the variable to `false`, so the next time the popup will be closed. Add an else, so the join dialog is hided only if `keep_join_dialog_open` is `false`.

{% highlight gdscript %}
# Menu.gd

func remove_all_players() -> void:
	if Client.is_creator:
		create_dialog_player_list.remove_all()
		create_dialog.hide()
	else:
		join_player_list.remove_all()
		if keep_join_dialog_open:
			keep_join_dialog_open = false
		else:
			join_dialog.hide()
{% endhighlight %}

So, if `keep_join_dialog_open` is `true`, the join dialog will not be closed, because we are not calling his `hide` function. If `keep_join_dialog_open` is `false`, we call his `hide` function like before.

It works now. When the player tries to join a room that does not exist, a message appears.

![Error message](/assets/images/godot/multiplayer_game/10/error_message.gif)



## Make the message beautiful

Let’s make some improvements to the message.


Since it’s an error message, change his color to red using the `modulate` property of the label. To avoid the text overflow, let’s add another font, one that is smaller.

![Modulate to red](/assets/images/godot/multiplayer_game/10/modulate_to_red.jpg)

The error message looks better now.


## Other error

Let’s try to reproduce the other error, the one that shows up when a player wants to join a game that already started. I opened 2 clients. If I start a game in the room 0 with the first client and I try to join this room with the second client, the error message will appear.

![Other error](/assets/images/godot/multiplayer_game/10/other_error.gif)


That’s all. I hope you liked the series and learned as much as I did.


## References
* [Godot docs](https://docs.godotengine.org/en/stable/tutorials/networking/high_level_multiplayer.html){:target="_blank"}
* [Exporting for dedicate servers](https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_dedicated_servers.html#doc-exporting-for-dedicated-servers){:target="_blank"}
* [Download headless version of Godot](https://godotengine.org/download/server){:target="_blank"}
* [Run headless server](https://godotengine.org/qa/11251/how-to-export-the-project-for-server){:target="_blank"}