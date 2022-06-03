---
post_id: how_to_make_platforms
---

![Platforms](/assets/images/godot/how_to_make_platforms/platforms.png)

<br>

First of all, we need a layer only for the platforms, I already created it in the project configuration, I gave it the name “Platforms”.

<!--more-->

![Project settings](/assets/images/godot/how_to_make_platforms/project_settings.jpg)

In the scene containing the map, I added a TileMap node for the platforms. Don’t forget to change the collision layer only to the layer you use for the platforms. In my case, the second layer.

![Platforms TileMap](/assets/images/godot/how_to_make_platforms/platforms_tilemap.jpg)

![Platforms TileMap collision layer](/assets/images/godot/how_to_make_platforms/tilemap_collision_layer.jpg)

Now, open your tileset and add the platform collisions. **Enable one way collisions**. This way, the player will be able to ignore the collision if he enters the platform from below.

![Platform tiles](/assets/images/godot/how_to_make_platforms/platform_tiles.jpg)

To be able to collide with the platforms, the player must have the “Platforms” bit of his mask on.

![Player collision mask](/assets/images/godot/how_to_make_platforms/player_collision_mask.jpg)


With this, the player can jump from below to a platform and he will stay above it. But that’s not enough. Let’s make the player able to get down from the platform too.

![Test one way collisions](/assets/images/godot/how_to_make_platforms/test_one_way_collisions.gif)

<br>

Let’s take a look at the player script. In the get_input function, I have an if to make the player jump if he presses the jump action and is in the floor

{% highlight gdscript %}
func get_input() -> void:
    [...]
    if Input.is_action_just_pressed("ui_jump") and is_on_floor():
        velocity.y = jump_impulse
{% endhighlight %}

On top of that conditional, add another if. If we just pressed the jump button, the space in my case, and we were holding down the down button, the down arrow in my case, disable the “Platforms” mask bit. In that case, we don’t want the player to jump, so replace the if of the jump conditional with an elif to avoid executing it if the first if was executed first.

To enable the “Platforms” mask bit again, add an if at the end of the function to check if the jump button was just released. If so, set the bit to true.

Now, we have a little problem. With this code, we would be calling the set_collision_mask_bit function every time the player releases the jump button, even if we jumped “upwards”. To fix this, just make sure the bit is disabled with get_collision_mask before calling the function.

{% highlight gdscript %}
    if Input.is_action_just_pressed("ui_jump") and Input.is_action_pressed("ui_down"):
        set_collision_mask_bit(1, false)
    elif Input.is_action_just_pressed("ui_jump") and is_on_floor():
        velocity.y = jump_impulse
			
    if Input.is_action_just_released("ui_jump") and not get_collision_mask_bit(1):
        set_collision_mask_bit(1, true)
{% endhighlight %}

<br>

Let’s test it! Like before, the player can jump to a platform from below. But, if we are on top of a platform and we hold down the down button and we press the jump button, the player will come down. If we hold the jump button, we can come down from multiple platforms.

![Final result](/assets/images/godot/how_to_make_platforms/final_result.gif)

<br>

<iframe id="odysee-iframe" width="560" height="315" src="https://odysee.com/$/embed/how-to-make-platforms-in-godot/6dc72484a191c3287d0786094eecc590357ea60a?r=5dDZJPgbdny6EiKLsWtNXNwnM936b7gf" allowfullscreen></iframe>