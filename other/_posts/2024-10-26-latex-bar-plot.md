---
tags: [Latex]
thumbnail: /assets/images/other/latex_bar_plot.png
---

<!--more-->

I have the data stored on the 2024-10-26_game_count.csv file:

{% highlight csv %}
Engine,Steam
Godot,1691
Unity,48066
GameMaker,5032
Unreal Engine,13891
Flax Engine,0
CRYENGINE,126
Construct,302
GDevelop,57
Bevy,0
Cocos,741
Defold,31
MonoGame,387
Love2D,146
libGDX,0
{% endhighlight %}

We can make the bar plot using:

{% highlight latex %}
\documentclass{article}

\usepackage{pgfplots}
\usepackage{pgfplotstable}

\pgfplotsset{compat=newest}

\begin{document}

\begin{figure}
  \begin{tikzpicture}
      \pgfplotstableread[col sep=comma]{2024-10-26_game_count.csv}\datatable

      \begin{axis}[
      ybar,
      xticklabels from table = {\datatable}{Engine},
      xtick = data,
      xticklabel style={rotate=90},
      ]
      \addplot table[x expr=\coordindex,y=Steam] {\datatable};
    \end{axis}
  \end{tikzpicture}
  \caption{Amount of games made with the engines on Steam}
\end{figure}

\end{document}
{% endhighlight %}

- We need the `pgfplots` and `pgfplotstable` packages. We must indicate the pgfplots version with `\pgfplotsset{compat=newest}`.

- With `\pgfplotstableread` we indicate how to read the file, using commas as separation, and we define the data as \datatable.

- To make the plot a bar plot, we use the `ybar` option of the axis.

- With `xticklabels from table = {\datatable}{Engine}` we configure the tick labels to be the same as the first column.

- `xtick = data` makes one tick for each data we have. Without this, pgfplots will reduce the number of ticks if there is much data.

- With `xticklabel style={rotate=90}` we rotate the tick labels 90 degrees so they aren't on top of each other.

- Finally, we create the plot with `\addplot table[x expr=\coordindex,y=Steam] {\datatable};`. We make the point x correspond to the coordinate index and we select the point y from the second column with header "Steam".

Here's the result:

![Bar plot](/assets/images/other/latex_bar_plot.png)

## References

- [https://tex.stackexchange.com/questions/290322/reading-xticklabels-from-a-csv](https://tex.stackexchange.com/questions/290322/reading-xticklabels-from-a-csv)
- [https://tex.stackexchange.com/questions/282929/tikz-picture-rotate-x-tick-labels](https://tex.stackexchange.com/questions/282929/tikz-picture-rotate-x-tick-labels)
- [https://latex-tutorial.com/tutorials/pgfplots/](https://latex-tutorial.com/tutorials/pgfplots/)