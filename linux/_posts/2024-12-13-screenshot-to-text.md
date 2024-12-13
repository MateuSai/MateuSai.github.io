---
tags: ["Shell scripting", "OCR"]
references:
  [
    "https://askubuntu.com/questions/280475/how-can-instantaneously-extract-text-from-a-screen-area-using-ocr-tools",
    "https://stackoverflow.com/questions/5130968/how-can-i-copy-the-output-of-a-command-directly-into-my-clipboard",
  ]
---

If you are learning a language with a LOT of characters like japanese and you find some text that can't be copied, if you don't know the characters, you are fucked, how do you know what that word means?

![Japanese text on KDE configuration](/assets/images/linux/screenshot_to_text/japanese_text.png)

To get the characters on text format, we can use a OCR tool to transform a screenshot to text. I'm going to use [tesseract](https://github.com/tesseract-ocr/tesseract).

<!--more-->

On Fedora, tesseract can be installed with:

```
sudo dnf install tesseract
```

It will automatically install the language package for your system language.

We can pass an image to tesseract and print the output to stdout, specifying the language with the '-l' option:

```
mateus@fedora:~$ tesseract Pictures/nihongo_no_kan.png stdout -l jpn
Hours じかん        Days にち (かん optional)      Weeks しゅう  ]
yo なんじかん?          なんにちゃ                    なんしゅうかん?

1    いちじかん           いちにち (never add かん)       いっしゅうかん

2    にじかん             ふつか                      にしゅうかん

3    さんじかん            みっか                       さんしゅうかん

4    よじかん             よっか                       よんしゅうかん
...
```

But this is a pain in the ass. Every time I want to get to get the text of some part of the screen I have to do a screenshot, save it somewhere and then pass it to tesseract on the command line.

There must be a more confortable way.

## Combining screenshot and tesseract on a script

We can make a screenshot, save it on the tmp folder (so it is removed when you power off the computer), and pass it to tesseract, all in a single script:

```sh
#!/bin/sh

IMAGE_PATH=/tmp/tesseract.png

QT_QPA_PLATFORM=xcb flameshot gui --raw > $IMAGE_PATH

tesseract $IMAGE_PATH stdout -l jpn
```

I used flameshot to make the screenshot, but other screenshot tools can be used. `QT_QPA_PLATFORM=xcb` before flameshot is to avoid a bug that happens on a multi-monitor setup on wayland, you might not need it.

To make the script accessible from the command line without specifying the complete path, you can put it on '~/.local/bin'.

<video controls>
    <source src="/assets/images/linux/screenshot_to_text/testing_script.webm">
</video>

Now, we could just copy the output and paste it to a dictionary, but it is still inconvenient to open the terminal every time I want to get some text on screen.

## Removing the need to use the terminal

To remove the need to use the terminal, we must do 2 things:

### Redirecting the output to the clipboard

Since we don't want to use the terminal, instead of printing the output to the terminal, we can redirect it to the clipboard:

```sh
#!/bin/sh

IMAGE_PATH=/tmp/tesseract.png

QT_QPA_PLATFORM=xcb flameshot gui --raw > $IMAGE_PATH

tesseract $IMAGE_PATH stdout -l jpn | xclip -selection clipboard

```

### Adding shortcut

Now we only need to add a shortcut. To do that, on KDE, we can go to the keyboard configuration and to shortcuts. We add a new command pointing to the script and the key combination you prefer:

![Configuring the shortcut for the script](/assets/images/linux/screenshot_to_text/configuring_shortcut_for_the_script.png)

## Final test

And that's it. Now if we press the key combination we specified, we will be able to take a screenshot of the screen and the image's text will be copied to the clipboard:

<video controls>
    <source src="/assets/images/linux/screenshot_to_text/final_test.webm">
</video>
