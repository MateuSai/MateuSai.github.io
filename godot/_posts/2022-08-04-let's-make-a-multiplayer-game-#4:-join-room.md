---
post_id: multiplayer_game_4
tags: [Godot 3.x]
prev_tutorial: multiplayer_game_3
next_tutorial: multiplayer_game_5
discard_start: "Let's Make A Multiplayer Game #4:"

thumbnail: "/assets/images/godot/multiplayer_game/4/thumbnail.jpg"
---

In the last tutorial we made the client create a room. In this one, we are going to make the clients able to join a room created by another client. Let’s get started.

<!--more-->


From now on, I won’t show the server when we run the client, but I will have it running in another workspace. When the player presses the create button, he will connect to the server. But, what happens if you close the popup window? We will still be connected and, if we try to connect again, we will get a bunch of errors. We want to disconnect when the window is closed. For that purpose, let’s make a function that stops the connections.

![Error when trying to connect more than one time](/assets/images/godot/multiplayer_game/4/error_connecting_more_than_one_time.gif)

Open the Client script and a new function called “stop”. As always print some message at the start of the function to see when the function is called. After that, disconnect all the signals: “connected_to_server”, “connection_failed”, and “server_disconnected”. With all the signals disconnected, change the network_peer to null to disconnect from the server.

{% highlight gdscript %}
# Client.gd

func stop() -> void:
    print("Disconnecting from server")
    
    get_tree().disconnect("connected_to_server", self, "_connected_ok")
    get_tree().disconnect("connection_failed", self, "_connected_fail")
    get_tree().disconnect("server_disconnected", self, "_server_disconnected")
    
    get_tree().network_peer = null
{% endhighlight %}

Let’s call this function in the menu script. We want to call it when the create dialog is closed, so, connect the popup_hide signal to the script. Remove the part with the node name of the signal name. Later, we will connect the same function of the join dialog and we will use the same signal name. This way, we don’t need to create 2 functions, only one. In the signal function, before calling stop(), make sure we are connected comparing the network_peer to null. We don’t need to stop the client if it has not even connected.

{% highlight gdscript %}
# Menu.gd

func _on_popup_hide() -> void:
    if get_tree().network_peer != null:
        Client.stop()
{% endhighlight %}

If we open and close the create dialog a few times, we won’t get errors anymore.


Let’s make the join dialog. Add a WindowDialog node in the menu scene. I use a WindowDialog instead of an AcceptDialog, like the create dialog, because I don’t want a confirmation button. Put some title to the window, like “Waiting for players…”. Check exclude if you don’t want the window to close when you press outside.

We will make the client able to choose a room id to join the room he wants. So, add a `VBoxContainer` and rename it to ConnectVBoxContainer. Make it fill the entire window changing the layout to ‘Full Rect’. Add a Label called ErrorLabel. We will use this Label to show an error message if the client tries to connect to an nonexistent room or the game already started. Hide the label, we will show it if necessary. Add a `SpinBox` to enter the room id. Change the alignement to ‘Center’ if you want to align the number in the center. Finally, add a button to connect. Put “ConnectButton” as the name and “Connect” in the Button text.

Now, let’s add a list of players and a label with the room id, as we did with the create dialog. As a child of the join dialog, add a `ScrollContainer`. Name it “WaitScrollContainer” and disable the horizontal scrolling, since we are not going to use it. Change the layout to ‘Full Rect’ to make it fill all the available space in the window. Add a VBoxContainer and, inside this container, add a label to display the room id and another VBoxContainer to show the list of players. We don’t want the list of players to be visible until we connect, so, hide the ScrollContainer.

In the last tutorial, I forgot to put a `VBoxContiner` as a child of the `ScrollContainer` in the create dialog. I don’t know if you noticed it, but we get a warning because the ScrollContainer expects only one child. Without the `VBoxContainer`, the label and the player list would appear one above the other. So, add the `VBoxContainer` and move the label and the player list inside it. We also need to update the paths of these nodes in the menu script.

![Join dialog](/assets/images/godot/multiplayer_game/4/join_dialog.jpg)

{% highlight gdscript %}
# Menu.gd

onready var create_dialog: AcceptDialog = get_node("CreateDialog")
onready var create_dialog_label: Label = create_dialog.get_node("ScrollContainer/VBoxContainer/Label")
onready var create_dialog_player_list: VBoxContainer = create_dialog.get_node("ScrollContainer/VBoxContainer/PlayerList")
{% endhighlight %}


Add 3 onready variables: one for the join dialog, another one for his label that displays the room id, and the last one for the player list.

{% highlight gdscript %}
# Menu.gd

onready var join_dialog: WindowDialog = get_node("JoinDialog")
onready var join_room_label: Label = join_dialog.get_node("WaitScrollContainer/VBoxContainer/Label")
onready var join_player_list: VBoxContainer = join_dialog.get_node("WaitScrollContainer/VBoxContainer/PlayerList")
{% endhighlight %}

Modify the update_room function. If the client is the room creator update the text of the label in the create dialog because this is the window he will have open. If it is not the creator, he will have the join window open, so, update the text of the label of the join dialog.

{% highlight gdscript %}
# Menu.gd

func update_room(room_id: int) -> void:
    if Client.is_creator:
        create_dialog_label.text = "Room id: " + str(room_id)
    else:
        join_room_label.text = "Room id: " + str(room_id)
{% endhighlight %}

We will come back later, now, create a script for the join dialog. We will need a bunch of onready variables, let’s declare them all:
* One for the ConnectVBoxContainer node
* One for his error label
* One for the SpinBox
* One for the connect Button
* One for the WaitScrollContainer, and, finally,
* One for the room label.

{% highlight gdscript %}
# JoinDialog.gd

extends WindowDialog

onready var connect_container: VBoxContainer = get_node("ConnectVBoxContainer")
onready var error_label: Label = get_node("ConnectVBoxContainer/ErrorLabel")
onready var spin_box: SpinBox = connect_container.get_node("SpinBox")
onready var connect_button: Button = connect_container.get_node("ConnectButton")

onready var wait_container: ScrollContainer = get_node("WaitScrollContainer")
onready var room_label: Label = wait_container.get_node("VBoxContainer/Label")
{% endhighlight %}

Connect the pressed signal of the ConnectButton to the script. Inside the function, disable the button to prevent the player from connecting more than one time. To connect to the server, call the connect_to_server function of the client. If you remember from the last video, this function has an optional parameter that indicates the room id. Pass the value in the SpinBox as the argument. The value in the SpinBox contains the id of the room the player wants to join. Here you will get a warning because the function expects an integer and the value of the SpinBox is a float. The step of the SpinBox is one, so we will never have a decimal value, let’s just ignore the error.

{% highlight gdscript %}
# JoinDialog.gd

func _on_ConnectButton_pressed() -> void:
    connect_button.disabled = true
    
    # warning-ignore:narrowing_conversion
    Client.connect_to_server(spin_box.value)
{% endhighlight %}

Create a new function called connected_ok. We will call this function when we connect successfully to the server. In this function, hide the connect container, we don’t need it anymore since we already connected. Enable back the connect button, this way, if we would want to disconnect and connect again, the button will be enabled. Finally, show the wait container. This is the container with the room id and the list of players. So, when the connection is successfully, we will change the window content to show the room id and the list of players.

{% highlight gdscript %}
# JoinDialog.gd

func connected_ok() -> void:
    connect_container.hide()
    connect_button.disabled = false
    
    wait_container.show()
{% endhighlight %}

Go back to the menu script and call the connected_ok function in the update_room function, after updating the room label text. Call the function only when the client is not the creator of the room, otherwise it’s not necessary since we don’t have the join window open.

{% highlight gdscript %}
# Menu.gd

func update_room(room_id: int) -> void:
    if Client.is_creator:
        create_dialog_label.text = "Room id: " + str(room_id)
    else:
        join_room_label.text = "Room id: " + str(room_id)
        join_dialog.connected_ok() # NEW
{% endhighlight %}

Finally, connect the pressed signal of the join dialog to the script. When the client clicks the join button, show the join dialog.

{% highlight gdscript %}
# Menu.gd

func _on_JoinButton_pressed() -> void:
    join_dialog.popup_centered()
{% endhighlight %}


Let’s try it. Open 2 clients. In the first one, create a room, and in the second one, try to join the created room. As we can see, the join dialog never changes the content, it should show the room id when it connects. The origin of the problem is in the _connected_ok function in the client script. If the client is not the creator, we are not sending our information to the server and he does not send back the room id.

![Join dialog content does not change when connected](/assets/images/godot/multiplayer_game/4/join_content_does_not_change.png)


To fix it, we have to tell the server we want to join a room. So, here, in the _connected_ok function, if the client is not the creator of the room, call the join_room function. Pass the room variable that contains the id of the room the client wants to join, and pass the information of the player too.

{% highlight gdscript %}
# Client.gd

func _connected_ok() -> void:
    print("Connected to server!")
    if is_creator:
        rpc_id(1, "create_room", my_info)
    else:
        rpc_id(1, "join_room", room, my_info)
{% endhighlight %}

Open the server project and create the join_room function. Inside the function, get the id of the player who called the function using the get_tree().get_rpc_sender_id() function. Then, call the _add_player_to_room function. Remember, the first argument is the room id, the second one is the id of the player, and the last one is the information of the player. The _add_player_to_room function will call the update_room function of the client who wants to join and the join dialog will update showing the room id.

> Don't forget to add the remote keyword before func

{% highlight gdscript %}
# Server.gd

remote func join_room(room_id: int, info: Dictionary) -> void:
    var sender_id: int = get_tree().get_rpc_sender_id()
    
    _add_player_to_room(room_id, sender_id, info)
{% endhighlight %}

Try to join a room one last time. It works now. The client who wants to join calls the join_room function of the server, and, in return, the server calls the update_room function of the client, updating the join dialog content.

![Joined succesfully](/assets/images/godot/multiplayer_game/4/joined_succesfully.gif)


That’s all for today. In the next tutorial we will handle the disconnections and maybe start displaying information about the connected players.

## References
* [Godot docs](https://docs.godotengine.org/en/stable/tutorials/networking/high_level_multiplayer.html){:target="_blank"}
* [Exporting for dedicate servers](https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_dedicated_servers.html#doc-exporting-for-dedicated-servers){:target="_blank"}
* [Download headless version of Godot](https://godotengine.org/download/server){:target="_blank"}
* [Run headless server](https://godotengine.org/qa/11251/how-to-export-the-project-for-server){:target="_blank"}


<div id="tutorial-videos">
    <iframe id="odysee-iframe" src="https://odysee.com/$/embed/let%27s-make-a-godot-multiplayer-game-4/6b780b2deb112b828ffb42af79a555658aec9971?r=5dDZJPgbdny6EiKLsWtNXNwnM936b7gf" allowfullscreen></iframe>
    <iframe id="youtube-iframe" src="https://www.youtube.com/embed/1YppgViOEvs" allowfullscreen></iframe>
</div>