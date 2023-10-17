document.addEventListener("DOMContentLoaded", function () {
    const authCookieInput = document.getElementById("authCookie");
    const refreshButton = document.getElementById("refreshButton");
    const resultElement = document.getElementById("result");
    const countdownElement = document.getElementById("countdown");

    refreshButton.addEventListener("click", function () {
        const authCookie = authCookieInput.value;
        refreshButton.disabled = true;
        resultElement.textContent = "Please wait, your cookie is generating.";
        let countdown = 7;
        const countdownInterval = setInterval(function () {
            countdownElement.textContent = `Refreshing in ${countdown} seconds...`;
            countdown--;
            if (countdown < 0) {
                clearInterval(countdownInterval);
                countdownElement.textContent = "";
            }
        }, 1000);
        setTimeout(function () {
            fetch("/refresh?cookie=" + encodeURIComponent(authCookie), {
                method: "GET",
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data && data.redemptionResult && data.redemptionResult.refreshedCookie) {
                        resultElement.textContent = data.redemptionResult.refreshedCookie;
                    } else {
                        resultElement.textContent = "Failed to refresh, try again!";
                    }
                })
                .catch((error) => {
                    console.error(error);
                    resultElement.textContent = "Error occurred while refreshing the cookie. Cookie is Probably Invalid.";
                })
                .finally(() => {
                    refreshButton.disabled = false;
                    const refreshButtonIcon = document.getElementById('refreshButtonIcon');
                    refreshButtonIcon.classList.remove('rotate-icon');
                });
        }, 7000);
    });

    const copyButton = document.getElementById("copyButton");
    copyButton.addEventListener("click", function () {
        const resultText = document.getElementById("result").textContent;
        const textarea = document.createElement("textarea");
        textarea.value = resultText;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "absolute";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        copyButton.textContent = "Copied!";
        setTimeout(function () {
            copyButton.textContent = "Copy";
        }, 1000);
    });
});

const refreshButton = document.getElementById('refreshButton');

refreshButton.addEventListener('click', () => {
    const refreshButtonIcon = document.getElementById('refreshButtonIcon');
    refreshButtonIcon.classList.toggle('rotate-icon');
});
