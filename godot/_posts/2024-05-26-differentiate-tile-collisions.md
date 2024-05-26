---
post_id: differentiate_tile_collisions
tags: [Godot 4.x, GDScript]
---

I always use the signal `body_entered` to detect collisions. This signal has a parameter with the body of the collision. But here's the problem: if it collides with the shape of a tile it will always return the `TileMap` object, independently of which tile we collide with.

In my case I wanted to detect the house where the villager is, so his projectiles don't collide with it but can still collide with other tiles like trees:

![Projectile colliding with house tile](/assets/images/godot/differentiate_tile_collisions/window_villager_projectile_colliding_with_house.gif)

<!--more-->

The solution I found is to use the `body_shape_entered` signal instead of `body_entered`. `body_shape_entered` has a parameter with the `RID` of the body. As it turns out, **the `RID` is unique for each shape.**

Now we need a way to get the `RID` of the tile we want to avoid colliding with. We can do it attaching an `Area2D` to the window villager:

![Area2D that will detect house shape](/assets/images/godot/differentiate_tile_collisions/window_villager_with_house_shape_detector.png)

Make sure the `Area2D` mask has the only the bit of the tile shape you want it to collide with.

Then, in the script of the villager, we can connect the `body_shape_entered` signal in the `_ready` funcion and store the `RID` of the house on a variable for later use:

{% highlight gdscript %}
var house_rid: RID

func _ready() -> void:
	house_shape_detector.body_shape_entered.connect(func(body_rid: RID, body: Node2D, body_shape_index: int, local_shape_index: int) -> void:
		house_rid=body_rid
	)
{% endhighlight %}

And that's it, now we only need to make the projectile hitbox ignore this `RID`. In my case I created an array of rids to exclude on the hitbox script. Replace the `body_entered` signal of the hitbox for the `body_shape_entered` and just return if the `RID` of the body the hitbox collides with is in the exclude array:

{% highlight gdscript %}
var exclude_rid: Array[RID] = []

func _on_body_shape_entered(body_rid: RID, body: Node2D, body_shape_index: int, local_shape_index: int) -> void:
	if exclude_rid.has(body_rid):
		return

    # Deal damage to the body
{% endhighlight %}

When the villager throws the projectile, we add the house rid to the projectile `exclude_rid` array:

{% highlight gdscript %}
func _throw() -> void:
	var projectile: Projectile = POSSIBLE_SCENE.instantiate()
	projectile.exclude_rid.push_back(house_rid)
	get_tree().current_scene.add_child(projectile)
{% endhighlight %}

Here's the final result:

![Final result: proectile collides with trees but not with house](/assets/images/godot/differentiate_tile_collisions/final_result.gif)

The house and the tree are tiles that have the same collision layer. The projectile collides with the tree but not with the house. Nice!

## References
- [https://old.reddit.com/r/godot/comments/192p744/godot_4c_manually_handling_collisions_with/](https://old.reddit.com/r/godot/comments/192p744/godot_4c_manually_handling_collisions_with/)