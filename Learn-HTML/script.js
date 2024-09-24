function toast({
    title = "",
    message = "",
    type = "success",
    duration = 3000
}) {
    const main = document.getElementById("toast")
    if (main) {
        const toast = document.createElement('div');

        //auto remove 
        const autoRemoveId = setTimeout(function () {
            main.removeChild(toast);
        }, duration + 1000);

        //remove when click
        toast.onclick = function (e) {
            // console.log(e.target); //lấy event xem đã nhấn vào đâu trong toast
            if (e.target.closest(".toast__close")) {
                main.removeChild(toast);
                clearTimeout(autoRemoveId);
            }
        }

        const icons = {
            success: "fas fa-check-circle",
            info: "fas fa-info-circle",
            warning: "fas fa-exclamation-triangle",
            error: "fas fa-bug"
        };
        const icon = icons[type];
        const delay = (duration / 1000).toFixed(2);
        toast.classList.add("toast", `toast--${type}`);
        toast.style.animation = `slideFromRight ease 1s, fadeOut linear 1s ${delay}s forwards`;
        toast.innerHTML = `
                    <div class="toast__icon" >
                        <i class="${icon}"></i>
                    </div >
                    <div class="toast__body">
                        <h3 class="toast__title">${title}</h3>
                        <p class="toast__msg">
                            ${message}
                        </p>
                    </div>
                    <div class="toast__close">
                        <i class="fas fa-times"></i>
                    </div>
                `
        main.appendChild(toast);

    }
}
