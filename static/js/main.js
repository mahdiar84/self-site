const form = document.getElementById("contact-form");

if(form){

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        const formData = new FormData(form);

        const response = await fetch("/contact", {
            method: "POST",
            body: formData
        });

        const result = await response.json();

        document.getElementById("response-message").innerText =
            result.message;

        form.reset();

    });

}