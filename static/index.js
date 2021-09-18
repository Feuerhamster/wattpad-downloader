/*
* Navbar
* */
function toggleMobileNav(event) {
    event.preventDefault();
    document.querySelector("#nav").classList.toggle("active");
}

/*
* Home
* */
let searchform = document.querySelector("#searchform");

if(searchform) {

    searchform.addEventListener("submit", (event) => {

        event.preventDefault();
        let url = event.target[0].value;

        let id = /\/?((story)\/)?(\d+)/i.exec(url);

        if(id && id[3]){

            if(id[2] === "story"){
                window.location.href = window.location.href + "b-" + id[3];
            }else{
                window.location.href = window.location.href + id[3];
            }

        }else{
            document.querySelector("#error-result").innerHTML = "We can not parse your entered value.<br/> Please provide a wattpad link to a story or an ID.";
            setTimeout(() => {
                document.querySelector("#error-result").innerHTML = "";
            }, 5000);
        }

    });

}

/*
* Download a book
* */
let hasRecaptcha = document.querySelector('head > script[src*="recaptcha"]');

function download(id, type, captchaToken) {
    document.querySelector("#loading-modal").classList.toggle("active");

    axios({
        url: `${window.location.origin}/api/${id}/download/${type}?token=${captchaToken}`,
        method: "GET",
        responseType: "blob", // important
    }).then((response) => {

        const url = window.URL.createObjectURL(new Blob([response.data]));

        let filename = /filename=(.+)/i.exec(response.headers["content-disposition"]);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename[1] ? filename[1] : "book." + type);


        document.body.appendChild(link);
        link.click();

        document.querySelector("#loading-modal").classList.toggle("active");

        if(hasRecaptcha) grecaptcha.reset();

    }).catch((e) => {
        console.log(e);
        document.querySelector("#loading-modal").classList.toggle("active");
        window.location.href = window.location.origin + "/error/" + e.response.status;
    });
}

let downloadParams = null;

document.querySelectorAll(".download-button").forEach((button) => {
    button.addEventListener("click", (event) => {
        downloadParams = event.target.dataset;

        if(hasRecaptcha) {
            document.querySelector("#captcha-modal").classList.toggle("active");
        } else {
            download(downloadParams.bookId, downloadParams.bookFormat, null);
        }
    });
});

function captchaCallback(token) {
    document.querySelector("#captcha-modal").classList.toggle("active");

    download(downloadParams.bookId, downloadParams.bookFormat, token);
}