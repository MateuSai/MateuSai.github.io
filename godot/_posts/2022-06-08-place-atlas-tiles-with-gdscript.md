---
tags: [Godot 3.x]
last_updated: 2024-02-11
---

I have this atlas:

![My atlas](/assets/images/godot/place_autotile_tiles_with_gdscript/autotile.jpg)

Now, I want to set cells of the TileMap with tiles that are inside the atlas. The index of my atlas is 0. You can see the index at the side of the tile name:

<!--more-->

![Atlas index](/assets/images/godot/place_autotile_tiles_with_gdscript/autotile_index.jpg)

If we try to use

{% highlight gdscript %}
set_cell(5, 5, 0)
{% endhighlight %}

the first subtile of the atlas will appear by default:

![Bag of coins tile](/assets/images/godot/place_autotile_tiles_with_gdscript/basic_set_cell.jpg)

How can we select a specific subtile? With the last argument of the set_cell function. The last parameter is a Vector2 with a default value of (0, 0). To select the tile of the atlas we want to set, we can just specify the subtile coordinates in the this last argument. The coordinates of the subtiles of the atlas are:

![Atlas coordinates](/assets/images/godot/place_autotile_tiles_with_gdscript/autotile_with_coordinates.jpg)

So, if we use

{% highlight gdscript %}
set_cell(5, 5, 0, false, false, false, Vector2(5, 0))
{% endhighlight %}

we get:

![Key tile](/assets/images/godot/place_autotile_tiles_with_gdscript/key_tile.jpg)

- The first two arguments specify the position of the tile we want to change. In my case, I change the tile at the position (5, 5) of the TileMap

- The third argument is the index of the tile, as we have seen earlier, it’s 0 in my case.

- The next 3 argumets are used for flipping the tile or/and transposing it. I left the default values because I don’t want to do any of these thing.

- Finally, the last argument, selects the subtile of the atlas we want to place. In this case, the tile in the x position 6 and y position 0.

<br>

## Other examples

We can try with other subtiles too:

{% highlight gdscript %}
set_cell(5, 5, 0, false, false, false, Vector2(1, 3))
{% endhighlight %}

![Stairs tile](/assets/images/godot/place_autotile_tiles_with_gdscript/stairs_tile.jpg)

{% highlight gdscript %}
set_cell(5, 5, 0, false, false, false, Vector2(4, 1))
{% endhighlight %}

![Skeleton tile](/assets/images/godot/place_autotile_tiles_with_gdscript/skeleton_tile.jpg)