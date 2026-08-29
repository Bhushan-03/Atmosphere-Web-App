let currentDynamicTheme = "dynamicThemeSunny";
let currentThemeMode = "Dynamic Mode";

async function getWeatherData(cityName = "Mumbai") {
    try {
        const response = await fetch(`http://localhost:3000/city/${encodeURIComponent(cityName)}`);
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } 
    catch (error) {
        console.error("Error:", error);
        return null;
    }
}

function getDynamicTheme(weatherCondition) {
    const themes = {
        "Clear Sky": "dynamicThemeSunny",
        "Partly Cloudy": "dynamicThemePartlyCloudy",
        "Cloudy": "dynamicThemeCloudy",
        "Rainy": "dynamicThemeRain",
        "Thunderstorm": "dynamicThemeThunderstorm",
        "Fog": "dynamicThemeFogMist",
        "Snow": "dynamicThemeSnow",
        "Clear Night": "dynamicThemeClearNight",
        "Cloudy Night": "dynamicThemeCloudyNight",
        "Sunrise": "dynamicThemeSunrise",
        "Sunset": "dynamicThemeSunset"
    };
    return themes[weatherCondition] || "dynamicThemeSunny";
}

function setTheme(themeName) {
    const screenContainer = document.querySelector(".screenContainer");
    if (!screenContainer) {
        return;
    }
    const currentTheme = screenContainer.dataset.themename;
    if (currentTheme) {
        screenContainer.classList.remove(currentTheme);
    }
    screenContainer.classList.add(themeName);
    screenContainer.dataset.themename = themeName;
}

function updateDynamicTheme(weatherCondition) {
    currentDynamicTheme = getDynamicTheme(weatherCondition);
    if (currentThemeMode === "Dynamic Mode") {
        setTheme(currentDynamicTheme);
    }
}

function themeSetter() {
    const selected = document.querySelector(".selected");
    if (!selected) {
        return;
    }
    currentThemeMode = selected.innerText;

    if (currentThemeMode === "Light Mode") {
        setTheme("lightTheme");
    }
    else if (currentThemeMode === "Dark Mode") {
        setTheme("darkTheme");
    }
    else if (currentThemeMode === "Dynamic Mode") {
        setTheme(currentDynamicTheme);
    }
}

function setWeatherCardBG(weatherCondition) {
    const weathercard = document.querySelector(".weather-Main-Card");
    const selected = document.querySelector(".selected");
    const conditions = {
        "Clear Sky": "ClearSky.png",
        "Partly Cloudy": "PartlyCloudy.png",
        "Cloudy": "Cloudy.png",
        "Rainy": "Rainy.png",
        "Thunderstorm": "Thunderstorm.png",
        "Fog": "Fog.png",
        "Snow": "Snow.png"
    };
    if (!selected) {
        return;
    }
    currentThemeMode = selected.innerText;
    if (currentThemeMode === "Light Mode" || currentThemeMode === "Dark Mode") {
        weathercard.style.backgroundImage = `url(/Assets/staticbg/${conditions[weatherCondition]})`;
    }
    else if (currentThemeMode === "Dynamic Mode") {
        weathercard.style.backgroundImage = `url(/Assets/dynamicbg/${conditions[weatherCondition]})`;
    }
}

function weatherOptions(weatherCondition) {
    const dropdown = document.querySelectorAll('.dropdown');

    dropdown.forEach(theme_option => {
        const select = theme_option.querySelector('.select');
        const caret = theme_option.querySelector('.caret');
        const menu = theme_option.querySelector('.menu');
        const options = theme_option.querySelectorAll('.menu li');
        const selected = theme_option.querySelector('.selected');
        
        select.addEventListener("click", () => {
            select.classList.toggle('selected-clicked');
            caret.classList.toggle('caret-rotate');
            menu.classList.toggle('menu-open');
        });

        options.forEach(option => {
            option.addEventListener("click", () => {
                selected.innerHTML = option.innerHTML;
                console.log(option.innerText);
                themeSetter();
                setWeatherCardBG(weatherCondition);
                select.classList.remove("selected-clicked");
                caret.classList.remove("caret-rotate");
                menu.classList.remove("menu-open");
                options.forEach(option => {
                    option.classList.remove("active");
                });
                option.classList.add("active");
                if (window.innerWidth < 1024) {
                    selected.childNodes[3]?.classList.toggle("hidden");
                } 
            });
        });
    });
}

function setHeroSectionData(data) {
    const cityDetails = document.querySelector(".cwCityName");
    const currentTemp = document.querySelector(".currentTemp");
    const cwCondition = document.querySelector(".currentWeatherCondition");
    cityDetails.innerText = `${data.CityName}, ${data.CityState}`;
    currentTemp.innerText = `${data.cTemp}`;
    cwCondition.innerText = `${data.cWeatherCondition}`;
}

async function handleCitySearch(cityName) {
    const data = await getWeatherData(cityName);
    if (!data) {
        return;
    }
    const weatherCondition = data.cWeatherConditionTheme;
    updateDynamicTheme(weatherCondition);
    setWeatherCardBG(weatherCondition);
    setHeroSectionData(data)
    console.log(weatherCondition);
    return data;
}

function getCityInput() {
    const cityInput = document.querySelector(".searchedCity");
    if (!cityInput) {
        return;
    }
    cityInput.addEventListener("keydown", async (event)=> {
        if (event.key !== "Enter") {
            return;
        }
        const cityName = cityInput.value.trim();
        if (!cityName) {
            return;
        }
        console.log(cityName);
        await handleCitySearch(cityName);
    });
}


async function main() {
    const data = await getWeatherData("Mumbai");
    console.log(data);
    if (!data) {
        return;
    }
    setHeroSectionData(data);
    updateDynamicTheme(data.cWeatherConditionTheme);
    setWeatherCardBG(data.cWeatherConditionTheme);
    currentThemeMode = "Dynamic Mode";
    weatherOptions(data.cWeatherConditionTheme);
    getCityInput(data);
}
main();



function showSideBar() {
    const hamBtn = document.querySelector(".hamburgurBtn");
    const crossBtn = document.querySelector(".crossBtn");
    const sideBar = document.querySelector(".sideBar");
    hamBtn.addEventListener("click", () => {
        sideBar.style.left = "0";
        sideBar.style.opacity = "100%";
        console.log("Hamburgur Clicked");
    });

    crossBtn.addEventListener("click", () => {
        sideBar.style.left = "-200px";
        sideBar.style.opacity = "0";
        console.log("Cross Clicked");
    });
}
showSideBar();



function caltempdiff(min, max) {
    let tempDiff = Number(max) - Number(min);
    if (tempDiff >= 9) {
        tempDiff = 9;
        return tempDiff;
    }
    return tempDiff + 1;
}

function setTempBar() {
    const tempBars = document.querySelectorAll(".tempBar");
    // const minTemp = document.querySelectorAll(".min-temp").innerHTML.split("°")[0];
    // const maxTemp = document.querySelectorAll(".max-temp").innerHTML.split("°")[0];
    const minTemps = document.querySelectorAll(".min-temp");
    const maxTemps = document.querySelectorAll(".max-temp");
    let index = 0;
    tempBars.forEach(tempbar => {
        // console.log(minTemps[index].innerHTML.split("°")[0]);
        // console.log(maxTemps[index].innerHTML.split("°")[0]);
        const tempdiff = caltempdiff(minTemps[index].innerHTML.split("°")[0], maxTemps[index].innerHTML.split("°")[0]);
        tempbar.style.width = `${tempdiff * 10}%`;
        index += 1;
    });
}
setTempBar();


function temo_ov_linegraph() {
    var chartOptions = {
        chart: {
            height: 400,
            type: 'line',
            fontFamily: 'Helvetica, Arial, sans-serif',
            foreColor: '#6E729B',
            toolbar: {
                show: false,
            },
        },
        colors: ['#FA7C16', '#567AFC'],
        stroke: {
            curve: 'smooth',
            width: 2,
        },
        series: [
            {
                name: 'Feels Like',
                data: [30, 31, 30, 29, 31, 32, 30, 31],
            },
            {
                name: 'Temperature',
                data: [25, 21, 24, 23, 24, 22, 23, 24],
            },
        ],
        markers: {
            size: 6,
            strokeWidth: 0,
            hover: {
                size: 9,
            },
        },
        grid: {
            show: true,
            padding: {
                bottom: 0,
            },
        },

        yaxis: {
            min: 20,
            max: 34,
            tickAmount: 14,
            labels: {
                style: {
                    color: '#6E729B',
                },
                formatter: function (value) {
                    return value;
                },
            },
        },

        //   labels: ['2018', '2019', '2020', '2021', '2022', '2023'],
        labels: ['12 PM', '3 PM', '6 PM', '9 PM', '12 AM', '3 AM', '6 AM', '9 AM'],
        xaxis: {
            tooltip: {
                enabled: false,
            },
        },
        legend: {
            position: 'top',
            horizontalAlign: 'left',
            offsetY: 5,
            labels: {
                colors: '#373d3f',
            },
        },
        grid: {
            borderColor: '#D9DBF3',
            xaxis: {
                lines: {
                    show: true,
                },
            },
        },
    };

    var lineChart = new ApexCharts(document.querySelector('.tov-line-chart'), chartOptions);
    lineChart.render();
}
temo_ov_linegraph();

function windChart() {
    const canvas = document.getElementById("windGustChart");
    const labels = ["12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM", "12 AM", "1 AM", "2 AM", "3 AM", "4 AM", "5 AM", "6 AM", "7 AM", "8 AM", "9 AM"];
    const windGusts = [10, 17, 22, 19, 18, 24, 25, 23, 17, 18, 14, 10, 18, 20, 18, 17, 24, 25, 18, 16, 16, 23];
    const ctx = canvas.getContext("2d");

    // Blue gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);

    gradient.addColorStop(0, "rgba(59, 130, 246, 0.45)");
    gradient.addColorStop(0.6, "rgba(59, 130, 246, 0.15)");
    gradient.addColorStop(1, "rgba(59, 130, 246, 0)");

    new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: "Wind Gusts",
                    data: windGusts,
                    borderColor: "#3b82f6",
                    backgroundColor: gradient,
                    fill: true,
                    borderWidth: 3,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    pointHoverBackgroundColor: "#ffffff",
                    pointHoverBorderColor: "#3b82f6",
                    pointHoverBorderWidth: 3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: "index"
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    displayColors: false,
                    backgroundColor: "#0f172a",
                    titleColor: "#ffffff",
                    bodyColor: "#cbd5e1",
                    padding: 12,
                    cornerRadius: 10,
                    callbacks: {
                        label: function (context) {
                            return ` Wind gust: ${context.parsed.y} km/h`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    suggestedMax: 40,
                    ticks: {
                        color: "#64748b",
                        stepSize: 10,
                        padding: 10,
                        callback: function (value) {
                            return value;
                        }
                    }
                }
            }
        }
    });
}
windChart();

function getAQIInfo(aqi) {

    if (aqi <= 50) {
        return {
            status: "Good",
            color: "#16a34a"
        };
    }

    if (aqi <= 100) {
        return {
            status: "Moderate",
            color: "#eab308"
        };
    }

    if (aqi <= 150) {
        return {
            status: "Unhealthy for Sensitive Groups",
            color: "#f97316"
        };
    }

    if (aqi <= 200) {
        return {
            status: "Unhealthy",
            color: "#ef4444"
        };
    }

    if (aqi <= 300) {
        return {
            status: "Very Unhealthy",
            color: "#a855f7"
        };
    }

    return {
        status: "Hazardous",
        color: "#7e22ce"
    };
}

function updateAQI(aqi) {
    aqi = Math.max(0, Math.min(500, aqi));
    const info = getAQIInfo(aqi);

    // Update number
    document.getElementById("aqiValue").textContent = aqi;

    // Update status
    const status = document.getElementById("status");

    status.style.color = info.color;

    status.querySelector(".status-text").textContent =
        info.status;

    // Update pointer
    const pointer = document.getElementById("pointer");

    pointer.style.left = `${(aqi / 500) * 100}%`;
    pointer.style.setProperty("--pointer-color", info.color);
}
updateAQI(80);

function setGauge(value) {
    //Limit value between 0 & 11
    value = Math.max(0, Math.min(value, 11));

    //value to angle conversion
    const angle = 180 - (value / 11) * 180;

    const radians = angle * Math.PI / 180;

    //indicatoe length
    const length = 70;

    const centerX = 160;
    const centerY = 145;

    const endX = centerX + length * Math.cos(radians);
    const endY = centerX - length * Math.sin(radians);

    document.getElementById("indicator").setAttribute("x2", endX);
    document.getElementById("indicator").setAttribute("y2", endY);
}
setGauge(6.2);
