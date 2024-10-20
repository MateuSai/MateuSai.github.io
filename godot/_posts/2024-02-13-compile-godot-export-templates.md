---
tags: ["Godot 4.x"]
---

The basic command to compile an export template is:

{% highlight console %}
scons platform=linuxbsd target=template_release
{% endhighlight %}

Where platform could also be `windows`, `android`... instead of `linuxbsd`. Both templates can be compiled at the same time using `template_debug/template_release`.

<!--more-->

This generates a 70MB executable. To use this template we have to add it to desired export preset:

![Add template to export preset](/assets/images/godot/compile_godot_export_templates/adding_template_to_export_preset.png)


## Optimizing the template

To reduce the executable size, we can add some more options:

{% highlight console %}
scons platform=linuxbsd target=template_release tools=no lto=full production=yes
{% endhighlight %}

Now the executable size is 64MB


## Using a build profile

From the Godot editor, we can create a build profile to remove features that we don't want the engine to have. For example, because my game is in 2d, I don't want the 3d nodes:

![Creating build profile](/assets/images/godot/compile_godot_export_templates/creating_build_profile.png)

When we compile the template, we have to add the build_profile parameter and specify the path to it:

{% highlight console %}
scons platform=linuxbsd target=template_release tools=no lto=full production=yes build_profile=path/to/build_profile
{% endhighlight %}


## Encryption

To allow the encryption of the project, so when it's exported nobody that does not know the key can see our files, add `SCRIPT_AES256_ENCRYPTION_KEY=your_key` before `scons`:

{% highlight console %}
SCRIPT_AES256_ENCRYPTION_KEY=your_key scons platform=linuxbsd target=template_release tools=no lto=full production=yes build_profile=path/to/build_profile
{% endhighlight %}


## References
- [Compiling for Linux](https://docs.godotengine.org/en/4.2/contributing/development/compiling/compiling_for_linuxbsd.html)
- [How do I use “Build Configuration Profiles” in Godot 4?](https://forum.godotengine.org/t/how-do-i-use-build-configuration-profiles-in-godot-4/2671)
- [Compiling with PCK encryption key](https://docs.godotengine.org/en/4.2/contributing/development/compiling/compiling_with_script_encryption_key.html)
- [Protecting Your Godot Project from Decompilation](https://godot.community/topic/35/protecting-your-godot-project-from-decompilation)