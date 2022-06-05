import js.html.Element;
import js.html.IFrameElement;
import js.Browser;

enum TutorialVideo {
    Odysee;
    Youtube;
}

class PostPage {
    static var tutorialVideos:Element;

    static var firstVideoSrc:String;
    static var secondVideoSrc:String;

    static var currentVideo:TutorialVideo = Odysee;

    static function main() {
        tutorialVideos = Browser.document.getElementById("tutorial-videos");
        if (tutorialVideos == null) return;

        var firstVideo:IFrameElement = cast(tutorialVideos.firstElementChild, IFrameElement);
        firstVideoSrc = firstVideo.src;

        firstVideo.height = Std.string(tutorialVideos.parentElement.clientWidth * (9/16));

        var secondVideo:IFrameElement = cast(tutorialVideos.lastElementChild, IFrameElement);
        secondVideoSrc = secondVideo.src;

        secondVideo.remove();

        addButtons();
    }

    static function addButtons() {
        var button0 = Browser.document.createButtonElement();
        button0.innerText = "Odysee";
        button0.onclick = function() {
            addVideo(Odysee);
        }

        var button1 = Browser.document.createButtonElement();
        button1.innerText = "YouTube";
        button1.onclick = function() {
            addVideo(Youtube);
        }

        var div = Browser.document.createElement("div");
        div.id = "tutorial-videos-buttons";
        div.append(button0);
        div.append(button1);

        tutorialVideos.prepend(div);
    }

    static function addVideo(tutorialVideo:TutorialVideo) {
        if (tutorialVideo == currentVideo)
            return;

        currentVideo = tutorialVideo;

        tutorialVideos.lastElementChild.remove();

        var iframe = Browser.document.createIFrameElement();

        if (tutorialVideo == Odysee) {
            iframe.id = "odysee-iframe";
            iframe.src = firstVideoSrc;
            iframe.height = Std.string(tutorialVideos.parentElement.clientWidth * (9/16));
        } else {
            iframe.id = "youtube-iframe";
            iframe.src = secondVideoSrc;
            iframe.allowFullscreen = true;
        }

        tutorialVideos.appendChild(iframe);
    }
}