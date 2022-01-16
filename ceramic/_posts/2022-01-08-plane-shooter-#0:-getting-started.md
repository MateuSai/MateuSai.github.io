---
post_id: plane_shooter_0
next_tutorial: plane_shooter_1
---

In this series of tutorials we will make a top-down shooter with planes using the [Ceramic framework](https://ceramic-engine.com){:target="_blank"}. Ceramic is a very recent 2d framework powered by the Haxe language. It seems very cool and has a lot of export platforms, so, let’s make a simple game with it!

<!--more-->

I won’t cover the installation, you can refer to the [official tutorial](https://ceramic-engine.com/guides/getting-started/install-ceramic/){:target="_blank"} if you don't have it installed.

To create a new project you only have to type {% highlight shell %}ceramic init --name "Plane Shooter"{% endhighlight %} in your terminal. But, again, there is an [offical tutorial](https://ceramic-engine.com/guides/getting-started/your-first-project/){:target="_blank"} in the Ceramic webpage.

I will use [VSCode](https://code.visualstudio.com){:target="_blank"}, with the [Ceramic extension](https://marketplace.visualstudio.com/items?itemName=jeremyfa.ceramic){:target="_blank"}, as the code editor. To run the code I will press Control + Shift + B, but you can also use commands to run the app if you want. For more information take a look at [this tutorial](https://ceramic-engine.com/guides/getting-started/editing-your-project/){:target="_blank"}. If you run the app now, it will appear the Ceramic logo by default:

![default app](/assets/images/plane_shooter/0/default app.png)

One last thing. I will use the [Kenney’s Pixel Shmup asset pack](https://www.kenney.nl/assets/pixel-shmup){:target="_blank"} to make the game. This bro, Kenney, has a lot of other free assets on [his webpage](https://www.kenney.nl){:target="_blank"}, so, go take a lot if you need some art for your games. Thanks for the asset pack bro!

After downloading the asset pack, move the extracted content inside the assets directory of the Ceramic project.

![asset pack inside assets directory](/assets/images/plane_shooter/0/asset pack inside assets directory.png)

With all that, we are ready to start creating our game! In the next tutorial we will make a basic top-down movement, I hope to see you there :)