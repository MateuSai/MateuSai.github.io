---
post_id: add-app-to-application-menu
---

Today I installed [Waterfox](https://www.waterfox.net/){:target="_blank"}. It comes inside a tar archive, so it doesn’t appear at the application menu, we have to add it manually. The process is the same if you want to add any other application.

We have to go to /usr/share/applications/. In this location there is plenty of .desktop files for all the apps we already have in the application menu.

<!--more-->

> If you want to make the application available only for your user, go to ~/.local/share/applications/ instead. In my case, I don’t care because I’m the only user in my pc.

Now, create a .desktop file with the name of the application you want to add. You can use gedit, nano, or the text editor you prefer. Firstly, we have to add [Desktop Entry] at the top of the file. Then, we have to add a series of keys with values:

- Type=Application indicates that we want to add an application.

- Name is the name the application will have in the application menu.

- Exec is the path to the executable. You can also use Path to specify the directory where the executable is and Exec to only specify the name of the executable. In my case, the executable is in the downloads folder, inside the extracted Waterfox tar archive.

- Icon is the icon of the application. In my case, it gets the icon automatically with the name of the program only. If your system doesn’t do it or you want to use a custom icon, you can specify the path to it.

{% highlight properties %}
[Desktop Entry]
Type=Application
Name=Waterfox
Exec=/home/mateus/Downloads/waterfox-G4.1.2.en-US.linux-x86_64/waterfox/waterfox %u
Icon=waterfox
{% endhighlight %}

> I use %u after the executable path to indicate that a URL can be passed as a parameter. This %u is very important because it allows to open links with the browser. For example, from the mail app

There a lot of other keys, but this is all what I needed. You can check a list with all the keys [here](https://specifications.freedesktop.org/desktop-entry-spec/desktop-entry-spec-latest.html#recognized-keys){:target="_blank"}.

And that's all! If you check you app menu, the new app should be there:

![Waterfox in app menu](/assets/images/other/waterfox_in_app_menu.jpg)

<br>


## References

- [https://stackoverflow.com/questions/13632385/adding-menu-items-to-gnome-menu-or-unity](https://stackoverflow.com/questions/13632385/adding-menu-items-to-gnome-menu-or-unity){:target="_blank"}

- [https://www.maketecheasier.com/create-desktop-file-linux/](https://www.maketecheasier.com/create-desktop-file-linux/){:target="_blank"}

- [https://wiki.archlinux.org/title/Desktop_entries](https://wiki.archlinux.org/title/Desktop_entries){:target="_blank"}