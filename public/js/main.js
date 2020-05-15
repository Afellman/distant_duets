const audioObj = {};

const today = new Date().getDate();
const release = 24;
$("#counter").text("Coming in " + (release - today) + " days")
$('#logo').click(() => {
    location.href = "/"
});

$.get("/tracks").then((tracks) => {
    buildTrackElements(tracks);
    attachListeners();
}).catch((err) => {
    console.log(err);
});

function buildTrackElements(tracks) {
    $("#boxDiv").append(tracks.map(track => {
        audioObj[track.title] = track; // Storing the track deets globally.
        audioObj[track.title].context = new Howl({
            src: [track.audio]
        });
        audioObj[track.title].context.onload = () => {
            // document.getElementById("") // Loading
        }
        audioObj[track.title].position = 0; // Storing the track deets globally.


        return (
            `<div class="col-md-6 track-wrapper"> 
                <div class="row">
                    <div class="col">
                        <img class="track-img" src="${track.img}"/>
                    </div>
                </div>
                ${track.artists} - ${track.title}
                <div class="row">
                    <div class="col">
                        <audio id="track-${track.title}" data-playing="false" src="${track.audio}"></audio>
                        <div>
                            <div class="track-search" data-title="${track.title}"><span id="track-ball-${track.title}" class="track-ball"></span></div>
                            <button name="${track.title}" class="control-play">></button>
                        </div>
                    </div>
                </div>
            </div>`
        );
    }));
}

function attachListeners() {
    $(".control-play").on("click", togglePlay);
    $('.track-search').on('click', seek);
    $('.track-ball').on('drag', dragStart);
    // $('.track-ball').on('dragstart', dragStart);
}

function dragStart(e) {
    const ball = e.target;
    const pos = e.pageX - $(this).parent().offset().left
    ball.style.transform = `translateX(${pos}px)`;
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
    const trackName = e.target.name;
    const thisContext = audioObj[trackName].context;
    const audioElement = document.getElementById("track-" + trackName);

    if (audioElement.dataset.playing === "false") {
        thisContext.play();
        audioElement.dataset.playing = 'true';
        moveTrackball(trackName);
        e.target.classList.add("playing")
        e.target.innerText = "||";
    } else {
        thisContext.pause();
        audioElement.dataset.playing = 'false';
        stopTrackBall(trackName);
        e.target.innerText = ">";
        e.target.classList.remove("playing")

    }
}

function stopTrackBall(trackName) {
    clearInterval(audioObj[trackName].interval);
}

function moveTrackball(trackName) {
    const ballElement = document.getElementById("track-ball-" + trackName);
    const duration = audioObj[trackName].duration / 1000;
    const trackWidth = ballElement.parentElement.getBoundingClientRect().width;
    audioObj[trackName].interval = setInterval(() => {
        let position = audioObj[trackName].position;
        const currentX = mapNumbers(position, 0, duration, 0, trackWidth);
        ballElement.style.transform = `translateX(${currentX}px)`;
        audioObj[trackName].position = position + 1;
    }, 1000);
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
};


function constrain(n, low, high) {
    return Math.max(Math.min(n, high), low);
};