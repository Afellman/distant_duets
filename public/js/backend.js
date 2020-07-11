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
        artist1: $("#artist1-name").val(),
        artist2: $("#artist2-name").val(),
        link1: $("#artist1-link").val(),
        link2: $("#artist2-link").val(),
        img: img.name,
        audio: audio.name
    };

    if (!textObj.link1.includes("http")) {
        textObj.link1 = "http://" + textObj.link1;
    }

    if (!textObj.link2.includes("http")) {
        textObj.link2 = "http://" + textObj.link2;
    }

    $.post("/api/newSongText", textObj).then((res) => {
        console.log(res)
    });

    const audioForm = new FormData();
    audioForm.append('audio', audio);

    $.ajax({
        method: "POST",
        url: "/api/newSongAudio",
        data: audioForm,
        contentType: false,
        processData: false,
        success: (res) => {
            console.log(res);
        },
        error: (res) => {
            console.log(res);
        }
    })

    let quality = 0.8;
    if (img.size > 2000000) {
        quality = 0.6;
    }
    new Compressor(img, {
        quality: quality,
        convertSize: 1000000,
        success(result) {
            const imgForm = new FormData();
            imgForm.append('img', result, result.name);
            $.ajax({
                method: "POST",
                url: "/api/newSongImg",
                data: imgForm,
                contentType: false,
                processData: false,
                success: (res) => {
                    console.log(res);
                },
                error: (res) => {
                    console.log(res);
                }
            })
        }
    });
});