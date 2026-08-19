
function weatherOptions() {
    
    const dropdown = document.querySelectorAll('.dropdown');
    
    dropdown.forEach(theme_option => {
        const select = theme_option.querySelector('.select');
        const caret = theme_option.querySelector('.caret');
        const menu = theme_option.querySelector('.menu');
        const options = theme_option.querySelectorAll('.menu li');
        const selected = theme_option.querySelectorAll('.selected');
        
        select.addEventListener("click", ()=> {
            select.classList.toggle('selected-clicked');
            caret.classList.toggle('caret-rotate');
            menu.classList.toggle('menu-open');
        });
        
        options.forEach(option => {
            option.addEventListener("click", ()=> {
                console.log(selected[0].innerHTML);
                selected[0].innerHTML = option.innerHTML;
                select.classList.remove("select-clicked");
                caret.classList.remove("caret-rotate");
                menu.classList.remove("menu-open");
                options.forEach(option => {
                    option.classList.remove("active");
                });
                option.classList.toggle("active");
            });
        });
    });
}

weatherOptions();