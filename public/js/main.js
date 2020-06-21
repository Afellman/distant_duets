const audioObj = {};
class AudioObj {
    constructor(obj = {}) {
        this._position = 0;
        this.context = obj.context;
        this.duration = obj.duration;
        this.audio = obj.audio;
        this.artists = obj.artists;
        this.title = obj.title;
        this.img = obj.img;
    }

    get position() {
        return this._position;
    }

    set position(val) {
        this._position = val;
        document.getElementById("time-passed-" + this.title).innerText = this.timePassed(val);
        document.getElementById("time-remain-" + this.title).innerText = this.timeLeft(val);
        this.moveBall();
    }

    onEnd(e) {
        console.log(e);
        setTimeout(() => {
            this.context.seek()
            this.position = 0;
            this.context.play();

        }, 2000); // Waiting 2 seconds before starting the track again. 
    }

    moveBall() {
        let position = Math.round(this.position);
        const ballElement = document.getElementById("track-ball-" + this.title);
        const duration = this.duration / 1000;
        const trackWidth = ballElement.parentElement.getBoundingClientRect().width;
        const currentX = mapNumbers(position, 0, duration, 0, trackWidth);
        ballElement.style.transform = `translateX(${Math.round(currentX)}px)`;
    }
    timeLeft(secondsPassed) {
        const secondsLeft = this.duration / 1000 - secondsPassed;
        return durationInMinutes(secondsLeft);
    }

    timePassed(secondsPassed) {
        const secondsLeft = secondsPassed;
        return durationInMinutes(secondsLeft);
    }

    onLoad() {
        this.startInterval();
        this.loaded = true;
        console.log('onload', this)
        document.getElementById("loading-gif-" + this.title).style.display = "none";
        document.getElementById("control-play-" + this.title).style.display = "flex";
    }

    startInterval() {
        this.interval = setInterval(() => {
            this.position++;
        }, 1000);
    }
}



$.get("/tracks").then((tracks) => {
    buildTrackElements(tracks);
    attachListeners();
}).catch((err) => {
    console.log(err);
});

function attachListeners() {
    $(".control-play").on("click", togglePlay);
    $(".control-begin").on("click", toggleBegin);
    $('.track-search')
        .mouseup(seek);
    // $('.track-ball').mousedown(dragBall)
    $('#logo').click(() => {
        location.href = "/"
    });
}

function buildTrackElements(tracks) {
    const reversedTracks = tracks.reverse();
    $("#boxDiv").append(reversedTracks.map(track => {
        audioObj[track.title] = new AudioObj(track);
        return (
            `
            <div class="col-md-6 track-wrapper">
                <img class="track-img" src="${track.img}"/>
                <div class="track-info">
                    <span class="track-title">${track.title}</span> 
                    <span class="track-artists">
                        <a target="_blank" href="${track.link1}">
                            ${track.artist1}
                        </a> + 
                        <a target="_blank" href="${track.link2}">
                            ${track.artist2}
                        </a>
                    </span>
                </div>
                <div class="row" style="clear:right">
                    <div class="col">
                        <div class="player">
                            <audio id="track-${track.title}" data-playing="false" src="${track.audio}"></audio>
                            <i id="control-begin-${track.title}" data-name="${track.title}" class="control-begin fas fa-step-backward"></i>
                            <button id="control-play-${track.title}" data-name="${track.title}" class="control-play">
                                <span data-name="${track.title}"></span>
                            </button>
                            <div class="loading-gif" style="display: none;" id="loading-gif-${track.title}"></div>
                            <div class="time-passed" id="time-passed-${track.title}"}>00:00</div>
                            <div class="track-progress">
                                <div class="track-search" data-title="${track.title}">
                                    <span id="track-ball-${track.title}" class="track-ball"></span>
                                </div>
                            </div>
                            <div class="time-remain" id="time-remain-${track.title}">${durationInMinutes(track.duration / 1000)}</div>
                        </div>
                    </div>
                </div>
            </div>
            `
        );
    }));
}

function durationInMinutes(seconds) {
    return new Date(seconds * 1000).toISOString().substr(14, 5)
}

function dragBall(e) {
    const func = () => {
        const pos = e.pageX - $(this).parent().offset().left
        this.style.transform = `translateX(${pos}px)`;
    };
    $(this).mousemove(func)
    $(this).mouseup(() => {
        $(this).off("mousemove", func)
    })


};

function seek(e) {
    // Moving Ball
    const ball = e.target.children[0];
    const trackName = e.target.dataset.title;
    const pos = e.pageX - $(this).offset().left
    ball.style.transform = `translateX(${pos}px)`;

    const context = audioObj[trackName].context;
    const duration = audioObj[trackName].duration / 1000;
    const trackWidth = e.target.getBoundingClientRect().width;

    const newPos = mapNumbers(pos, 0, trackWidth, 0, duration);
    context.seek(newPos)
    audioObj[trackName].position = newPos;
}

function togglePlay(e) {
    const trackName = e.target.dataset.name;
    const thisAudioObj = audioObj[trackName];
    const playButton = document.getElementById("control-play-" + trackName)

    const audioElement = document.getElementById("track-" + trackName);


    if (!thisAudioObj.loaded) {
        thisAudioObj.context = new Howl({
            src: [thisAudioObj.audio],
            onend: () => thisAudioObj.onEnd(),
            onload: () => {
                audioObj[thisAudioObj.title].onLoad();

            }
        });
        document.getElementById("loading-gif-" + trackName).style.display = "flex";
        document.getElementById("control-play-" + trackName).style.display = "none";


        const thisContext = thisAudioObj.context;
        thisContext.play();
        audioElement.dataset.playing = 'true';
        playButton.classList.add("playing");
    } else {
        if (audioElement.dataset.playing === "false") {
            const thisContext = thisAudioObj.context;
            thisContext.play();
            audioElement.dataset.playing = 'true';
            playButton.classList.add("playing");
            thisAudioObj.startInterval();
        } else {
            clearInterval(thisAudioObj.interval)
            const thisContext = thisAudioObj.context;
            thisContext.pause();
            audioElement.dataset.playing = 'false';
            stopTrackBall(trackName);
            playButton.classList.remove("playing")
        }
    }

}

function toggleBegin(e) {
    const trackName = e.target.dataset.name;
    audioObj[trackName].position = 0;
    audioObj[trackName].context.seek(0)
}

function stopTrackBall(trackName) {
    clearInterval(audioObj[trackName].interval);
}


function mapNumbers(n, start1, stop1, start2, stop2, withinBounds) {
    const newval = (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;
    if (!withinBounds) {
        return newval;
    }
    if (start2 < stop2) {
        return constrain(newval, start2, stop2);
    } else {
        return constrain(newval, stop2, start2);
    }
}


function constrain(n, low, high) {
    return Math.max(Math.min(n, high), low);
}