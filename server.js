const express = require("express");
const app = express();
const port = 3000;

const cors = require('cors');
const corsOptions = {
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
};
app.use(cors(corsOptions));


async function getCoordinates(city) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`;

    try{
        const response = await fetch(url);

        if(!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.error(error.message);
    }
}

async function getWeather(lat,lon) {
    try {
        let response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,uv_index_max,daylight_duration&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,rain,weather_code,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,wind_gusts_10m,visibility,rain,pressure_msl,temperature_2m_max,temperature_2m_min&forecast_days=14&timezone=auto`);
        if(!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const result = await response.json();
        // console.log(result);
        return result;
    }
    catch (error) {
        console.error(error.message);
    }
}

async function getWDName(data) {
    const DI = {0:"North", 1:"Northeast", 2:"East", 3:"Southeast", 4:"South", 5:"Southwest", 6:"West", 7:"Northwest"};
    let wdIndex = Math.trunc((data["current"]["wind_direction_10m"] + 22.5) / 45)
    return DI[wdIndex];
}

async function getPrecipitation(data) {
    return (data["current"]["precipitation"] * 100);
}

async function getWCTheme(data) {
    const weatherCode = data["current"]["weather_code"];
    if (weatherCode === 0) return "Clear Sky";
    if (weatherCode === 1) return "Partly Cloudy";
    if ([2, 3].includes(weatherCode)) return "Cloudy";
    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)) return "Rainy";
    if ([95, 96, 99].includes(weatherCode)) return "Thunderstorm";
    if ([45, 48].includes(weatherCode)) return "Fog";
    if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) return "Snow";
    return "Unknown";
}

async function getWeatherCondition(data) {
    const weatherCode = data["current"]["weather_code"];
    if (weatherCode === 0) return "Clear Sky";
    if ([1,2,3].includes(weatherCode)) return "Cloudy";
    if ([45,48].includes(weatherCode)) return "Fog";
    if ([51, 53, 55].includes(weatherCode)) return "Drizzle";
    if ([56, 57].includes(weatherCode)) return "Freezing drizzle";
    if ([61, 63, 65].includes(weatherCode)) return "Rain";
    if ([66, 67].includes(weatherCode)) return "Freezing rain";
    if ([71, 73, 75, 77].includes(weatherCode)) return "Snow";
    if ([80, 81, 82].includes(weatherCode)) return "Rain showers";
    if ([96, 99].includes(weatherCode)) return "Thunderstorm with hail";
    return "Unknown";
}

async function getVisibility(data) {
    return (data["current"]["visibility"]) / 1000
}

async function getCurrentWeather(data) {

    let cw_map = new Map();

    cw_map.set("cTime", `${await formatTime(data["current"]["time"])}`);
    cw_map.set("cTemp", `${data["current"]["temperature_2m"]}`);
    cw_map.set("cHumidity", `${data["current"]["relative_humidity_2m"]}`);
    cw_map.set("cFeelslike", `${data["current"]["apparent_temperature"]}`);
    cw_map.set("cVisibility", `${await getVisibility(data)}`);
    cw_map.set("cPressure", `${data["current"]["pressure_msl"]}`);
    cw_map.set("cWeatherCondition", `${await getWeatherCondition(data)}`);
    cw_map.set("cWeatherConditionTheme", `${await getWCTheme(data)}`);
    cw_map.set("cmaxTemp", `${data["current"]["temperature_2m_max"]}`);
    cw_map.set("cminTemp", `${data["current"]["temperature_2m_min"]}`);
    cw_map.set("cwWindSpeed", `${data["current"]["wind_speed_10m"]}`);
    cw_map.set("cwWindDirection", `${await getWDName(data)}`);
    cw_map.set("cwWindGusts", `${data["current"]["wind_gusts_10m"]}`);
    cw_map.set("cwPrecipitation", `${await getPrecipitation(data)}`);
    cw_map.set("cwCloudCover", `${data["current"]["cloud_cover"]}`);

    return cw_map;
}

async function getSunrise(data) {
    return await formatTime(data["daily"]["sunrise"][0]);
}

async function getSunset(data) {
    return await formatTime(data["daily"]["sunset"][0]);
}

async function formatTime(time) {
    return new Date(time).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    });
}

async function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
}

async function getWAG(data, cMap) {
    let wag_map = new Map();

    wag_map.set("wagHumidity", `${cMap.get("cHumidity")}`);
    wag_map.set("wagWindSpeed", `${cMap.get("cwWindSpeed")}`);
    wag_map.set("wagWindDirection", `${cMap.get("cwWindDirection")}`);
    wag_map.set("wagPrecipitation", `${cMap.get("cwPrecipitation")}`);
    wag_map.set("wagUVIndex", `${data["daily"]["uv_index_max"][0]}`);
    wag_map.set("wagVisibility", `${cMap.get("cVisibility")}`);
    wag_map.set("wagCloudCover", `${cMap.get("cwCloudCover")}`);
    wag_map.set("wagSunrise", `${await getSunrise(data)}`);
    wag_map.set("wagSunset", `${await getSunset(data)}`);
    wag_map.set("wagPressure", `${cMap.get("cPressure")}`);
    wag_map.set("wagDayLightDuration", `${await formatDuration(data["daily"]["daylight_duration"][0])}`);

    return wag_map;
}

async function main(cityname) {
    const apiResponse = await getCoordinates(cityname);
    const lat = apiResponse.results[0].latitude;
    const lon = apiResponse.results[0].longitude;
    const weatherData = await getWeather(lat, lon);
    const cwData = await getCurrentWeather(weatherData);
    const wagData = await getWAG(weatherData, cwData);
    // return weatherData["daily"];
    return combined = { ...Object.fromEntries(cwData), ...Object.fromEntries(wagData)};
    // return Object.fromEntries(cwData), Object.fromEntries(wagData);
}

app.get("/city/:cityName", async (req,res) => {
    const cityName = req.params.cityName;
    console.log(cityName);
    const WeatherRes = await main(cityName);
    console.log(WeatherRes);
    res.json(WeatherRes);
});


app.get("/", async (req,res) => {
    const cWeather = await main();
    res.json(cWeather);
});
app.listen(port);