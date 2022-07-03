---
post_id: multyplayer_game_0
---

In this new series we are going to make a multyplayer game from scratch using the Godot game engine. The final result will be that:

<video src="/assets/images/godot/multyplayer_game/0/final_result.webm" controls>
    Browser does not support webm embedded videos
</video>

<!--more-->

It will consist of 2 projects: the client and the server. The client will play the game, while the server will manage the connections and share data between the players. We will start with the client, making a very simple playable game.

So, let’s get started. Create a new project, chose the name and the location you want.

I will use the [Ghost Ship Platformer Asset Pack](https://gvituri.itch.io/ghost-ship){:target="_blank"} by [Gustavo Vituri](https://gvituri.itch.io/){:target="_blank"}. You can download it for free on itch.io. I put the assets in assets/images, but you can chose the location you want. The spritesheet of the characters have been extended with dead animations by Wekufu Studios. You can download this version from the [GitHub repository](https://github.com/MateuSai/Pirate-Multyplayer-Game-Tutorial){:target="_blank"}.

I will also use the [font pack](https://kenney.nl/assets/kenney-fonts){:target="_blank"} made by Kenney. You can download it for free from the [Kenney website](https://kenney.nl/){:target="_blank"}. I store the fonts under assets/fonts. As with the images, you can put them wherever you want.

![Assets folder](/assets/images/godot/multyplayer_game/0/assets_folder.jpg)

Now, let’s enter the project settings and tweek a few things. Let’s start with the window settings. The assets have a very low resolution, so the resolution of the game must be low too. 256x144 seems good to me. You can make the test window bigger to scale the game, a 256x144 window is too small. Also, change the mode to 2d and the aspect to keep to make the game always have the same aspect ratio.

![Window settings](/assets/images/godot/multyplayer_game/0/window_settings.jpg)

Go to “Layer Names” → “2d Physics”. Here, we can rename the layers we will use. For the moment only 3: one for the world, one for the platforms, and one for the players.

![Layers](/assets/images/godot/multyplayer_game/0/layers.jpg)

Create a new Node2D scene with the name “Game” and save it. That’s the scene where the gameplay will take place.

With that, we are ready to start making the basic playable game in the next tutorial. As I said, the game is very simple, it consists only of moving players that can kill each other. So, if you already have a playable game yourself, you can skip the next tutorials until the networking ones start.

> Just make sure your characters inherit from a scene with only the basics components: a collision shape, an animation player, and a Sprite.

![Game scene](/assets/images/godot/multyplayer_game/0/game_scene.jpg)