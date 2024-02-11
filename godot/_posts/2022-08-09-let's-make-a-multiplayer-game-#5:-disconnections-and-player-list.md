---
post_id: multiplayer_game_5
tags: [Godot 3.x]
prev_tutorial: multiplayer_game_4
next_tutorial: multiplayer_game_6
discard_start: "Let's Make A Multiplayer Game #5:"

thumbnail: "/assets/images/godot/multiplayer_game/5/thumbnail.jpg"
---

In this tutorial we are going to implement the list of the players and handle the disconnections.

<!--more-->


## Register players

Let’s start with the server project. When a client connects we have to send all the information of the players to him and send the information of the new player to the other ones. To add a player to a room, we use the `_add_player_to_room` function, that’s the perfect place to send the information to the newly joined player.

{% highlight gdscript %}
# Server.gd

func _add_player_to_room(room_id: int, id: int, info: Dictionary) -> void:
    rooms[room_id].players[id] = info
    players_room[id] = room_id
    
    rpc_id(id, "update_room", room_id)
    
    for player_id in rooms[room_id].players:
        rpc_id(player_id, "register_player", id, info)
        
    for other_player_id in rooms[room_id].players:
        if other_player_id != id:
            rpc_id(id, "register_player", other_player_id, rooms[room_id].players[other_player_id])
{% endhighlight %}

After calling the update_room function of the client, iterate over the player information we have in the players array of the room where the player is. `player_id` takes the keys of the dictionary, the player ids. But the parameter of the function is called “player_id” too, let’s change it to “id”. So, call the register_player function of each of the connected clients, including the one who just joined. Send the id of the new player and his information as parameters. With this, all the clients will register the client who just joined. But we have to send the information of the other players to the new one too.

Iterate over the players dictionary again. **We don’t want to send the player information of the player who just joined to himself, since we already did it in the other for loop**. So, make sure the id of the player who owns the information is not the same as the one who just joined. Call the register_player function of the new player. Pass the id of the other player and his information as arguments. We can get the other player information using his id as key in the players dictionary of the room. After this, the newly joined player will have all the information of the players who were already in the room.


Now, go to the client project. Create a script for the player list VBoxContainer. Add the script to both containers: the one in the create dialog, and the one in the join dialog. Inside this script, we will define some functions to add and remove labels with the name of the players.

![Player lists with script](/assets/images/godot/multiplayer_game/5/player_lists.jpg)

Create a function called add_player with a `String` parameter that indicates the name of the player. Inside the function, create a new `Label`, change the text of the label to the name of the player, and, finally, add the label as a child of the player list.

{% highlight gdscript %}
# PlayerList.gd

func add_player(name: String) -> void:
    var label: Label = Label.new()
    label.text = name
    add_child(label)
{% endhighlight %}

Create another function with the name remove_player and a parameter with the index of the player who want to remove. Free the label in the position specified by the index.

{% highlight gdscript %}
# PlayerList.gd

func remove_player(index: int) -> void:
    get_child(index).queue_free()
{% endhighlight %}

Add another function, “remove_all”, that iterates over all the labels and frees them all. We will call this function if the client disconnects to delete all the players in the list.

{% highlight gdscript %}
# PlayerList.gd

func remove_all() -> void:
    for child in get_children():
        child.queue_free()
{% endhighlight %}


Next, open the menu script and add some functions to call the ones we made in the player list. Add a function called “add_player_to_ui” with a parameter that contains the name of the player. If the client is the creator of the room, call the add_player function of the player list in the create dialog. Otherwise call the add_player function of the player list in the join dialog. Pass the name of the player as argument.

> Remember that we made onready variables for the player lists in previous tutorials.

{% highlight gdscript %}
# Menu.gd

func add_player_to_ui(name: String) -> void:
    if Client.is_creator:
        create_dialog_player_list.add_player(name)
    else:
        join_player_list.add_player(name)
{% endhighlight %}

Create a function called “remove_player” with a parameter containing the index of the player we want to remove. Like in the previous function, check if the client is the creator of the room, and call the remove_player function of the corresponding player list.

{% highlight gdscript %}
# Menu.gd

func remove_player(index: int) -> void:
    if Client.is_creator:
        create_dialog_player_list.remove_player(index)
    else:
        join_player_list.remove_player(index)
{% endhighlight %}

Finally, add a function called “remove_all_players”. As the other 2, check if the client is the creator and call the remove_all function of the corresponding player list, but, this time, hide the corresponding window too. If we remove all the players, it means we disconnected from the server, we don’t want to keep the window open.

{% highlight gdscript %}
# Menu.gd

func remove_all_players() -> void:
    if Client.is_creator:
        create_dialog_player_list.remove_all()
        create_dialog.hide()
    else:
        join_player_list.remove_all()
        join_dialog.hide()
{% endhighlight %}

To summarize, we will call this functions from the client script without worrying if the player is the creator or not, the functions we created will handle that.


Open the client script and add, at last, the `register_player` function. Don’t forget to add remote. Add the 2 parameters corresponding to the arguments we passed in the server project: an integer for the id of the player, and a dictionary for his information. Inside the function, put the information of the player in the player_info dictionary, use the id of the player as the key. After that, call the `add_player_to_ui` function of the menu script. We will only register players in the menu scene, so, we can get the menu using `get_tree().current_scene`. Pass the name of the player as argument, it’s inside the info dictionary.

{% highlight gdscript %}
# Client.gd

remote func register_player(id: int, info: Dictionary) -> void:
    player_info[id] = info
    get_tree().current_scene.add_player_to_ui(info.name)
{% endhighlight %}


I opened 4 clients to test it. Create a room with one of the clients. As we can see, now the name of the player appears in the player list, below the room id. If we join with the other clients, their name will appear in the player list. Each one of the clients has a list with the name of the 4 players connected.

> Well, for the moment they all have the same name, we will be able to change it when we make the player creator.

![Add players](/assets/images/godot/multiplayer_game/5/add_players.gif)

Now, if we start to close the clients, we can see that the names of the disconnected players are still in the list. That is not what we want. We have to remove the label of the players that disconnect.

![Players are not removed](/assets/images/godot/multiplayer_game/5/players_are_not_removed.gif)


## Remove players

We have to notify the other players in the room when one disconnects. We can tell when a player disconnects thanks to the `_player_disconnected` function. But the `_player_disconnected` function only has a parameter and it indicates the player id, how do we know the room of the player? Well, we could iterate over all the rooms and search for the id, but that would be slow.

So, instead, create a new global variable called players_room and initialize it to an empty dictionary. This dictionary will associate the room id to the id of the player. At the cost of a little more memory, we will find the room of the player quickly.

{% highlight gdscript %}
# Server.gd

var players_room: Dictionary = {}
{% endhighlight %}

At the `_add_player_to_room` function, after assigning the player information in the players dictionary of the room, assign the id of the room to the `players_room` dictionary using the id of the player as key. Every time we add a player, it will be added at the players_room dictionary.

{% highlight gdscript %}
# Server.gd

func _add_player_to_room(room_id: int, id: int, info: Dictionary) -> void:
    rooms[room_id].players[id] = info
    players_room[id] = room_id
    
    # ...
{% endhighlight %}

In the `_player_disconnected` function, check if the player id is in the players_room. If it is not, return and print some message. If it is not in the players_room dictionary, it means it has not joined a room.

> This can happen when the player tries to join to a nonexistent room, we will handle this in the future.

After that assign the room id in a variable. We can get the room id using the id of the player as the key in the `players_room` dictionary.

The player left the room, so we have to remove his entries from the players dictionary in the room and from the `players_room` dictionary. We can do this with the `erase` function. This function returns false if the entry does not exist, in that case print an error message. If the player disconnects, it must be in the dictionaries.

Next, check if the room is empty after deleting the player entry. If so, print a message and remove the room from the rooms dictionary. As before, print an error message if the `erase` function does not find the room. Also, add the room id to the empty_rooms dictionary so we can reuse the room id. If there are still players, print a message too, they are good for debugging. Iterate over the players in the room and call the “remove_player” function of the players with the id of the removed player as argument.

{% highlight gdscript %}
# Server.gd

func _player_disconnected(id: int) -> void:
    print("Player with id " + str(id) + " disconnected")
    
    if not players_room.keys().has(id):
        print("Player was not in any room yet")
        return
        
    var room_id: int = players_room[id]
    
    if not rooms[room_id].players.erase(id) or not players_room.erase(id):
        printerr("This key does not exist")
        
    if rooms[room_id].players.size() == 0:
        print("Closing room " + str(room_id))
        
        if not rooms.erase(room_id):
            printerr("Error removing room")
        empty_rooms.push_back(room_id)
    else:
        print("Notifying the other players in the room...")
        
        for player_id in rooms[room_id].players:
            rpc_id(player_id, "remove_player", id)
{% endhighlight %}


Nice, the server is ready, go to the client project now. Open the client script and add the remove_player function. Call the remove_player function of the menu to remove the player from the player list. This functions expects the index of the player. We can get it using the find function in the array of keys of the player_info dictionary. The find function will return the index of the first entry it finds where the key is the same as the id of the player.

Next, remove the entry of the removed player from the player_info dictionary. Print an error message if erase doesn’t find the entry.

{% highlight gdscript %}
# Client.gd

remote func remove_player(id: int) -> void:
    get_tree().current_scene.remove_player(player_info.keys().find(id))
    
    if not player_info.erase(id):
        printerr("Error removing player from dictionary")
{% endhighlight %}


I opened 2 clients to test it.  As we can see, the label with the name of the other player is not deleted when he disconnects. We have other problems too. If we reopen the closed client, the previous label names will still be there and it should ask the room id of the room we want to join. The same happens with the creator, if we close and reopen it, the labels are not cleared. Let’s fix all that.

![Problems](/assets/images/godot/multiplayer_game/5/problems.gif)


First of all, the client is not stopped when the join dialog is closed, so, connect the popup_hide signal to the menu script. It will be stopped now.

{% highlight gdscript %}
# Menu.gd

func _on_popup_hide() -> void:
    if get_tree().network_peer != null:
        Client.stop()
{% endhighlight %}

Connect the signal to the join dialog script too. If the window is hidden, we want to reset his initial state. Hide the wait container and show the connect container so we can specify the room id again.

{% highlight gdscript %}
# JoinDialog.gd

func _on_JoinDialog_popup_hide() -> void:
    wait_container.hide()
    connect_container.show()
{% endhighlight %}

In the client script, add a new function called “_remove_all_players”. Inside the function, call the `remove_all_players` of the menu. After that, set the `player_info` dictionary to an empty dictionary, since we have removed all the players.

{% highlight gdscript %}
# Client.gd

func _remove_all_players() -> void:
    get_tree().current_scene.remove_all_players()
    
    player_info = {}
{% endhighlight %}


Call the function at the end of the `stop` function. It will be called when we close the connection.

{% highlight gdscript %}
# Client.gd

func stop() -> void:
    # ...
    
    _remove_all_players()
{% endhighlight %}


It all works now. In the next tutorial we will make the transition to the game scene.

![Final result](/assets/images/godot/multiplayer_game/5/final_result.gif)

## References
* [Godot docs](https://docs.godotengine.org/en/stable/tutorials/networking/high_level_multiplayer.html){:target="_blank"}
* [Exporting for dedicate servers](https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_dedicated_servers.html#doc-exporting-for-dedicated-servers){:target="_blank"}
* [Download headless version of Godot](https://godotengine.org/download/server){:target="_blank"}
* [Run headless server](https://godotengine.org/qa/11251/how-to-export-the-project-for-server){:target="_blank"}


<div id="tutorial-videos">
    <iframe id="odysee-iframe" src="https://odysee.com/$/embed/let%27s-make-a-godot-multiplayer-game-5/d381b6c656707e67633d06adaff6d787bc7d8857?r=5dDZJPgbdny6EiKLsWtNXNwnM936b7gf" allowfullscreen></iframe>
    <iframe id="youtube-iframe" src="https://www.youtube.com/embed/QX0gsMcMmmo" allowfullscreen></iframe>
</div>