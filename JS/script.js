let currentDynamicTheme = "dynamicThemeSunny";
let currentThemeMode = "Dynamic Mode";

// function showSkeletonLoader(isLoading){
//     document.querySelector(".mainScreen").classList.toggle("animate-skeleton-loading-dark", isLoading);
//     document.querySelector(".weather-Main-Card").classList.toggle("animate-skeleton-loading", isLoading);
// }
// function hideSkeletonLoader(isLoading){
//     document.querySelector(".mainScreen").classList.remove("animate-skeleton-loading-dark", isLoading);
//     document.querySelector(".weather-Main-Card").classList.remove("animate-skeleton-loading", isLoading);
//     document.querySelector(".cwLocationIcon").classList.remove("hidden", isLoading);
// }

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
    const cldt = document.querySelector(".cl-dt");
    const cwminTemp = document.querySelector(".cw-ltemp");
    const cwmaxTemp = document.querySelector(".cw-htemp");
    const cw_Humidity = document.querySelector(".cw-Humidity");
    const cw_WSpeed = document.querySelector(".cw-WSpeed");
    const cw_Pressure = document.querySelector(".cw-Pressure");
    const cw_Visibility = document.querySelector(".cw-Visibility");
    cityDetails.innerText = `${data.CityName}`;
    currentTemp.innerText = `${data.cTemp}°`;
    cwCondition.innerText = `${data.cWeatherCondition}`;
    cldt.innerHTML = `<p class="cwl-dayName">${data.cDayName}</p>
                            <p>•</p>
                            <p class="cwl-date">${data.cDate}</p>
                            <p>•</p>
                            <p class="cwl-time">${data.cTime}</p>`;
    cwminTemp.innerText = `${data.todaysminTemp}°`;
    cwmaxTemp.innerText = `${data.todaysmaxTemp}°`;
    cw_Humidity.innerText = `${data.cHumidity}%`;
    cw_WSpeed.innerText = `${data.cwWindSpeed} ${data.cwWindDirection}`;
    cw_Pressure.innerText = `${data.cPressure} hPa`;
    cw_Visibility.innerText = `${data.cVisibility} km`; 
}

function setWAGData(data) {
    const wag_Humidity = document.querySelector(".wag-Humidity");
    const wag_windSpeed = document.querySelector(".wag-windSpeed");
    const wag_windDirection = document.querySelector(".wag-windDirection");
    const wag_Precipitation = document.querySelector(".wag-Precipitation");
    const wag_uvIndex = document.querySelector(".wag-uvIndex");
    const wag_Visibility = document.querySelector(".wag-Visibility");
    const wag_CloudCover = document.querySelector(".wag-CloudCover");
    const wag_Sunrise = document.querySelector(".wag-Sunrise");
    const wag_Sunset = document.querySelector(".wag-Sunset");
    const wag_Pressure = document.querySelector(".wag-Pressure");

    wag_Humidity.innerText = `${data.cHumidity}%`;
    wag_windSpeed.innerText = `${data.cwWindSpeed} km/h`;
    wag_windDirection.innerText = `${data.cwWindDirection}`;
    wag_Precipitation.innerText = `${data.cwPrecipitation}%`;
    wag_uvIndex.innerText = `${data.cwUVIndex}`;
    wag_Visibility.innerText = `${data.cVisibility} km`;
    wag_CloudCover.innerText = `${data.cwCloudCover}%`;
    wag_Sunrise.innerText = `${data.cwSunrise}`;
    wag_Sunset.innerText = `${data.cwSunset}`;
    wag_Pressure.innerText = `${data.cPressure} hPa`;
}

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


function setUIData(data) {
    const cw_uvIndex = document.querySelector(".cw-uvIndex");
    const cw_uvIndex_max = document.querySelector(".cw-uvIndex-Max");
    const today_sunrise = document.querySelector(".today-sunrise");
    const today_sunset = document.querySelector(".today-sunset");
    const today_dlduration = document.querySelector(".today-dlduration");
    const cw_wSpeed = document.querySelector(".cw-wSpeed");
    const cw_wDirection = document.querySelector(".cw-wDirection");
    const cw_wGusts = document.querySelector(".cw-wGusts");
    setGauge(data.cwUVIndex);
    setWindDirection(data.cwWindDirection);
    setAQIData(data);
    cw_uvIndex.innerText = `${data.cwUVIndex}`;
    cw_uvIndex_max.innerText = `${data.cwUVIndexMax}`;
    today_sunrise.innerText = `${data.cwSunrise}`;
    today_sunset.innerText = `${data.cwSunset}`;
    today_dlduration.innerText = `${data.cwDayLightDuration}`;
    cw_wSpeed.innerText = `${data.cwWindSpeed}`;
    cw_wDirection.innerText = `${data.cwWindDirection}`;
    cw_wGusts.innerText = `${data.cwWindGusts}`;
}

async function handleCitySearch(cityName) {
    const data = await getWeatherData(cityName);
    if (!data) {
        return;
    }
    const weatherCondition = data.Current.cWeatherConditionTheme;
    updateDynamicTheme(weatherCondition);
    setWeatherCardBG(weatherCondition);
    setHeroSectionData(data.Current);
    setWAGData(data.Current);
    setUIData(data.Current);
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

function setWindDirection(direction) {
    const rotations = {
        North: 0,
        Northeast: 45,
        East: 90,
        Southeast: 135,
        South: 180,
        Southwest: 225,
        West: 270,
        Northwest: 315
    };

    const arrow = document.getElementById("direction-arrow");

    if (!arrow) return;

    const rotation = rotations[direction];

    if (rotation === undefined) {
        console.warn(`Invalid wind direction: ${direction}`);
        return;
    }

    arrow.setAttribute("transform", `rotate(${rotation} 184 163)`);
}


function setAQIData(data) {
    const aqiValue = document.querySelector(".caqi-value");
    const aqiPM2_5 = document.querySelector(".caqiPM2_5");
    const aqiPM10 = document.querySelector(".caqiPM10");
    const aqiNO2 = document.querySelector(".caqiNO2");
    const aqiO3 = document.querySelector(".caqiO3");
    const aqiCO = document.querySelector(".caqiCO");
    const aqiSO2 = document.querySelector(".caqiSO2");
    updateAQI(data.caqAQI);
    setInterval(() => {updateSunPosition(data.cwSunrise, data.cwSunset)}, 1000);
    aqiValue.innerText = `${data.caqAQI}`;
    aqiPM2_5.innerText = `${data.caqPM2_5}`;
    aqiPM10.innerText = `${data.caqPM10}`;
    aqiNO2.innerText = `${data.caqNO2}`;
    aqiO3.innerText = `${data.caqO3}`;
    aqiCO.innerText = `${data.caqCO}`;
    aqiSO2.innerText = `${data.caqSO2}`;

    const aq_status = document.querySelectorAll(".aq-status");
    aq_status.forEach(aqs => {
        console.log(aqs);
    });
}



async function main() {

    // showSkeletonLoader(true);

    const data = await getWeatherData("Mumbai");
    console.log(data);
    if (!data) {
        return;
    }

    // hideSkeletonLoader(false);

    setHeroSectionData(data.Current);
    setWAGData(data.Current);
    // setGauge(data.Current.cwUVIndex);
    setUIData(data.Current);
    updateDynamicTheme(data.Current.cWeatherConditionTheme);
    setWeatherCardBG(data.Current.cWeatherConditionTheme);
    currentThemeMode = "Dynamic Mode";
    weatherOptions(data.Current.cWeatherConditionTheme);
    getCityInput();
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


function timeToMinutes(time) {
    const [timePart, period] = time.trim().split(" ");
    let [hours, minutes] = timePart.split(":").map(Number);
    if (period === "PM" && hours !== 12) {
        hours += 12;
    }
    if (period === "AM" && hours === 12) {
        hours = 0;
    }
    return hours * 60 + minutes;
}


function updateSunPosition(sunriseText, sunsetText) {

    const sunrise = timeToMinutes(sunriseText);
    const sunset = timeToMinutes(sunsetText);

    const now = new Date();

    const currentTime =
        now.getHours() * 60 +
        now.getMinutes() +
        now.getSeconds() / 60;

    // Calculate progress from sunrise → sunset
    let progress =
        (currentTime - sunrise) /
        (sunset - sunrise);

    // Keep it between 0 and 1
    progress = Math.max(0, Math.min(1, progress));

    // SVG arc dimensions
    const centerX = 160;
    const centerY = 150;
    const radius = 125;

    // Convert progress to angle
    const angle = Math.PI * (1 - progress);

    // Calculate X/Y on the semicircle
    const x = centerX + radius * Math.cos(angle);

    const y = centerY - radius * Math.sin(angle);

    // Move existing sun
    document.getElementById("sunIcon").setAttribute("transform",`translate(${x} ${y}) scale(0.12) translate(-256 -256)`);
}



