---
---

To exit the game and close the window, you only have to call the exit function available in the System class of the hxd package:

{% highlight haxe %}
hxd.System.exit();
{% endhighlight %}

<!--more-->

For example, you can call it when the user presses the escape key:

{% highlight haxe %}
override function update(dt:Float) {
    if (Key.isDown(Key.ESCAPE))
        hxd.System.exit();
}
{% endhighlight %}