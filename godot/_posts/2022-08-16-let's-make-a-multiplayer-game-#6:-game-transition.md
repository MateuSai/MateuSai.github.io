---
post_id: multiplayer_game_6
prev_tutorial: multiplayer_game_5
next_tutorial: multiplayer_game_7
discard_start: "Let's Make A Multiplayer Game #6:"
---

In this tutorial we are going to make the transition to the game scene. But, first, I would like to fix a bug with the last tutorial.

<!--more-->


## Stop other clients when the creator disconnects

If there are other clients connected in addition to the creator, and the creator disconnects, the other clients will still be connected. But they cannot start the game, so, it does not make sense to keep them connected, let’s kick them off.

In the server project, go to the `_player_disconnected` function. Inside the else at the end, add an if that checks if the removed player is the creator. If it is, iterate over the players in the room and kick them out using the `disconnect_peer` function of the network peer. If the disconnected player is not the creator, execute the other for loop, the one that calls the remove_player function of the client.

{% highlight gdscript %}
# Server.gd

func _player_disconnected(id: int) -> void:
    # ...

    else:
        # ...
        
        if rooms[room_id].creator == id:
            for player_id in rooms[room_id].players:
                get_tree().network_peer.disconnect_peer(player_id)
        else:
            for player_id in rooms[room_id].players:
                rpc_id(player_id, "remove_player", id)
{% endhighlight %}

Now, go to the client project and call the stop function in the `_server_disconnected` function. This is the function that will be called when we kick out the players. Calling stop we remove all the players and we disconnect the network signals.

{% highlight gdscript %}
# Client.gd

func _server_disconnected() -> void:
    print("Server disconnected!")
    stop()
{% endhighlight %}

If the creator client disconnects now, all the other clients of the room will disconnect too. But we get an error. The error suggests to connect the signals using `CONNECT_DEFERRED`, so, that’s what we are going to do.

![Close all clients when creator disconnects](/assets/images/godot/multiplayer_game/6/close_all_clients_when_creator_disconnects.gif)
![Signal error](/assets/images/godot/multiplayer_game/6/signal_error.jpg)

Scroll up to the part where we connect the signals. Between the flags and the method name, there is an argument to pass extra arguments to the function. We don’t want to pass any extra arguments, so, use an empty array. Pass `CONNECT_DEFERRED` as the last argument. This flag emits the signals on idle frames. So, the signal won’t be emitted when we remove the network peer and we won’t get the error anymore.

{% highlight gdscript %}
# Client.gd

func connect_to_server(room_id: int = 0) -> void:
    # ...
    
    if get_tree().connect("connected_to_server", self, "_connected_ok", [], CONNECT_DEFERRED):
        printerr("Failed to connect connected_server")
    if get_tree().connect("connection_failed", self, "_connected_fail", [], CONNECT_DEFERRED):
        printerr("Failed to connect connection_failed")
    if get_tree().connect("server_disconnected", self, "_server_disconnected", [], CONNECT_DEFERRED):
        printerr("Failed to connect server_diconnected")
{% endhighlight %}

If we try to disconnect the creator client again, this time we don’t get any error.


## Transition to game scene

Now, it’s time to make the transition to the game scene. In the client script, create a function called “start_game”. Call the start_game function of the server.

{% highlight gdscript %}
# Client.gd

func start_game() -> void:
    rpc_id(1, "start_game")
{% endhighlight %}

We want to call this function when the creator clicks the ok button. So, connect the confirmed signal of the create dialog to the menu script. Inside the function, call the `start_game` function of the client. When the creator client presses the button, the `start_game` function of the server will be called. Let’s make that function.

{% highlight gdscript %}
# Menu.gd

func _on_CreateDialog_confirmed() -> void:
    Client.start_game()
{% endhighlight %}

<br>

Open the server project and create the `start_game` function. The function will be called remotely, so, don’t forget to add `remote` at the start. Get the id of the player who called the function using the `get_rpc_sender_id` function. Now, we need the room to access the rest of the players in it. Let’s make a simple function to get the room.

Create a new function with the name “_get_room” with a parameter that contains the id of a player. Return the room where the player is. We can get the room id using the id of the player as the key in the `players_room` dictionary. Use the room id we obtained to access the room of the rooms dictionary. The function returns a dictionary with the information of the room: the players array, the creator…

{% highlight gdscript %}
# Server.gd

func _get_room(player_id: int) -> Dictionary:
    return rooms[players_room[player_id]]
{% endhighlight %}

Back at the start_game function, get the room using the function we just created. Since the game started, change the state of the room to STARTED. Iterate over all the players in the room and call the “pre_configure_game” function of each player.

{% highlight gdscript %}
# Server.gd

remote func start_game() -> void:
    var sender_id: int = get_tree().get_rpc_sender_id()
    
    var room: Dictionary = _get_room(sender_id)
    
    room.state = STARTED
    
    for player_id in room.players:
        rpc_id(player_id, "pre_configure_game")
{% endhighlight %}

<br>

Go back to the client project. Add the “pre_configure_game” function in the client script. Here is where we will change the scene and spawn the other players.

{% highlight gdscript %}
# Client.gd

remote func pre_configure_game() -> void:
    print("pre_configure_game called")
    
    get_tree().paused = true
    
    get_tree().current_scene.queue_free()
    var game: Node2D = preload("res://Game.tscn").instance()
    get_tree().root.add_child(game)
    get_tree().current_scene = game
    
    var my_player: KinematicBody2D = preload("res://characters/Player.tscn").instance()
    game.add_child(my_player)
    player_info[get_tree().get_network_unique_id()].instance = my_player
    
    for player_id in player_info:
        if player_id != get_tree().get_network_unique_id():
            var player: KinematicBody2D = preload("res://characters/BaseCharacter.tscn").instance()
            game.add_child(player)
            player_info[player_id].instance = player
            
    rpc_id(1, "done_preconfiguring")
{% endhighlight %}

First of all, pause the game. We will resume it when all the players are ready to start.

Next, queue_free the current scene, the menu. Store the game scene in a variable. Load the scene with the `preload` function and create a new instance with the instance function. Add the game as a child of the root node and set the current scene to the game scene. Why not change the scene using the `change_scene` function? Well, `change_scene` does not stop the function execution, so, after calling it, the following code would still see the menu as the current scene. Changing the scene manually, we make sure the current scene is the game scene before continuing with the rest of the function.

After that, spawn the player of the client. Store a new instance of the Player scene in a variable called “my_player”. Add the player as a child of the game scene, and assign it to the instance of the `player_info` that has his id.

To spawn the other players, iterate over the information in the `player_info` dictionary. We already spawned the player of the client, so, don’t spawn it again. Add an if to make sure the id is different than the client id. As before, create a new instance for the player and store it in a variable. But this time use the BaseCharacter scene instead of the Player scene.

> Since the other players won’t be controlled by this client, we don’t need all the functionality of the Player scene, only the basics.

Add the player in the game scene and change the instance of `player_info` that references the player.

Finally, at the end of the function, call the “done_preconfiguring” function of the server. We tell the server the client has finished loading the game.

<br>

Go back to the server project and add the `done_preconfiguring` function. First of all, get the id of the player who called the function. With this id, get the room of the player. Increase the players_done of the room by one. Check if all the players are done comparing the `player_done` with the size of the players dictionary. If they are, iterate over all the players and call the done_preconfiguring function of each one.

{% highlight gdscript %}
# Server.gd

remote func done_preconfiguring() -> void:
    var sender_id: int = get_tree().get_rpc_sender_id()
    
    var room: Dictionary = _get_room(sender_id)
    
    room.players_done += 1
    
    if room.players_done == room.players.size():
        for player_id in room.players:
            rpc_id(player_id, "done_preconfiguring")
{% endhighlight %}

<br>

Go to the client and create the `done_preconfiguring` function. Inside the function, unpause the game. This function will be called when all the players are ready, at this moment, the game will start.

{% highlight gdscript %}
# Client.gd

remote func done_preconfiguring() -> void:
    get_tree().paused = false
{% endhighlight %}

<br>

Let’s try it. If we try to start the game, nothing happens. In the output, we can see a message saying that the client disconnected from the server. That’s the print I put in the _server_disconnected function. We also get an error because we tried to use rpc_id when we are not connected.

![Disconnection error](/assets/images/godot/multiplayer_game/6/disconnection_error.jpg)

The problem is that we stop the server when a popup window is closed. When we change scene, even if we do not close the windows ourselves, the popup_hide signal is emitted anyway.

To fix it, create a boolean variable called “game_started” in the menu script and initialize it to false. Go to the `_on_popup_hide` function and make sure this variable is `false` before stopping the connection. The stop function will only be called when game_started is `false`. Now, we need a way to set `game_started` to true when the ok button is pressed.

{% highlight gdscript %}
# Menu.gd

var game_started: bool = false

func _on_popup_hide() -> void:
    if not game_started and get_tree().network_peer != null:
        Client.stop()
{% endhighlight %}

At the start of the `pre_configure_game` function, change `game_started` to true using the `set_deferred` function. I tried changing the variable in the function called when the confirmed signal is emitted, but it does not work. That’s the only way I found to change the variable to true before the popup_hide signal is emitted.

{% highlight gdscript %}
# Client.gd

remote func pre_configure_game() -> void:
    print("pre_configure_game called")
    
    get_tree().current_scene.set_deferred("game_started", true)

    # ...
{% endhighlight %}

If we play the game now, the result will be the same as before. That’s because we have to set ‘Hide On Ok’ of the create dialog to `false`. The window hides anyway, but it seems now the popup_hide signal is emitted after game_started is changed to true.

![Disable Hide On Ok](/assets/images/godot/multiplayer_game/6/disable_hide_on_ok.jpg)

<br>


If we try to start the game again, we will see that it switches scenes without problems now. We can move our player around the ship, but it does not get synchronized with the other clients yet, we will implement that in the future. Everything seems fine, except for a player standing at the corner. If we close one client, the game crashes. Let’s take a look at the remote view. There are 4 players when there should be only 2.

![Too many problems](/assets/images/godot/multiplayer_game/6/too_may_players.gif)
![Remote view  shows 4 players](/assets/images/godot/multiplayer_game/6/remote_view_too_may_players.jpg)

The problem is that we still have the two players we added in the game scene to test the movement in a previous tutorial. Since the players are now spawned with the `Client` script, we can remove these 2 players.

![Game scene without players](/assets/images/godot/multiplayer_game/6/game_scene_without_players.jpg)

There are not extra player now. There is still the player in the corner, but that’s the player of the other client. It will move in the future. If we check the remote view, we can see that there are only 2 players this time.

![Game with 2 clients](/assets/images/godot/multiplayer_game/6/game_with_2_clients.gif)
![Remote view with only 2 players](/assets/images/godot/multiplayer_game/6/remote_view_with_2_players.jpg)

Next, we are going to modify the `remove_player` function to remove players from the game too.


## Remove players from game

In the `remove_player` function, add an if that checks if the name of the current scene is “Menu”. If it is, execute the `remove_player` function of the menu. Otherwise, we are in the game scene. To remove a player from the game scene, we can simply queue_free his instance we have stored in the `player_info` array. This will remove the player from the scene tree.

{% highlight gdscript %}
# Client.gd

remote func remove_player(id: int) -> void:
    if get_tree().current_scene.name == "Menu":
        # Remove it from the UI
        get_tree().current_scene.remove_player(player_info.keys().find(id))
    else:
        # Remove his instance from the game
        player_info[id].instance.queue_free()

    # ...
{% endhighlight %}

Let’s do the same for the `_remove_all_players` function. If we are in the menu scene, call the remove_all_players of the menu script. If we are in the game scene, iterate over all the players in the `player_info` dictionary and queue_free them all.

{% highlight gdscript %}
# Client.gd

func _remove_all_players() -> void:
    if get_tree().current_scene.name == "Menu":
        # Remove all players from the UI
        get_tree().current_scene.remove_all_players()
    else:
        # We are in game, remove all player instances
        for player_id in player_info:
            player_info[player_id].instance.queue_free()
    
    player_info = {}
{% endhighlight %}

If you play the game, now, when we close a client, the game does not crash. And the player in the corner, the player of the client who disconnected, is removed.

![Player being removed](/assets/images/godot/multiplayer_game/6/player_being_removed.gif)

<br>


I made an image to summarize all the calls we made to start the game, take a look. The game is starting to take shape. In the next tutorial, we will make the players synchronize their position between all the clients.

![Game transition diagram](/assets/images/godot/multiplayer_game/6/multiplayer_game_transition_diagram.jpg)


## References
* [Godot docs](https://docs.godotengine.org/en/stable/tutorials/networking/high_level_multiplayer.html){:target="_blank"}
* [Exporting for dedicate servers](https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_dedicated_servers.html#doc-exporting-for-dedicated-servers){:target="_blank"}
* [Download headless version of Godot](https://godotengine.org/download/server){:target="_blank"}
* [Run headless server](https://godotengine.org/qa/11251/how-to-export-the-project-for-server){:target="_blank"}