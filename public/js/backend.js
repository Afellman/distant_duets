let img;
let audio;

$("#pass-button").click(() => {
    const pass = $("#pass").val();

    if (pass === "mr f") {
        $("#backend-wrapper").show();
    } else {
        alert("WRONG!")
    }

});

$("#img").on("change", (e) => {
    img = e.target.files[0];
});

$("#audio").on("change", (e) => {
    audio = e.target.files[0];
});


$("#save-new").click((e) => {
    const textObj = {
        title: $("#title").val(),
        artist1Name: $("#artist1-name").val(),
        artist1Link: $("#artist1-link").val(),
        artist2Name: $("#artist2-name").val(),
        artist2Link: $("#artist2-link").val(),
    };

    $.post("/api/newSongText", textObj).then((res) => {
        console.log(res)
    })

    const audioForm = new FormData();
    audioForm.append('audio', audio);

    $.post("/api/newSongAudio", audioForm).then((res) => {
        console.log(res)
    });


    const imgForm = new FormData();
    imgForm.append('img', img);

    $.post("/api/newSongImg", imgForm).then((res) => {
        console.log(res)
    })
});