const express = require("express");
const app = express();
require("dotenv").config();
const port = 3000;

const cors = require('cors');
const corsOptions = {
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
};
app.use(cors(corsOptions));

async function getCoordinates(city) {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${city}&key=${process.env.OpenCage_API_KEY}&pretty=1&no_annotations=1`;

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
        let response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,uv_index_max,daylight_duration&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,rain,weather_code,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,wind_gusts_10m,visibility,rain,pressure_msl,temperature_2m_max,temperature_2m_min,uv_index&forecast_days=14&timezone=auto`);
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

async function getAirData(lat, lon) {
    try {
        let response = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi,pm10,pm2_5,nitrogen_dioxide,ozone,carbon_monoxide,sulphur_dioxide&utm_source=chatgpt.com`);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const result = await response.json();
        // console.log(result);
        return result;
    }
    catch {

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
    const weatherCode = data;
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
    return (data.visibility) / 1000
}

async function getCurrentWeather(data, airData) {

    let cw_map = new Map();

    cw_map.set("cTime", `${await formatTime(data.current.time)}`);
    cw_map.set("cDate", `${await formatDate(data.current.time)}`);
    cw_map.set("cDayName", `${await formatday(data.current.time)}`);
    cw_map.set("cTemp", `${data.current.temperature_2m}`);
    cw_map.set("cHumidity", `${data.current.relative_humidity_2m}`);
    cw_map.set("cFeelslike", `${data.current.apparent_temperature}`);
    cw_map.set("cVisibility", `${await getVisibility(data.current)}`);
    cw_map.set("cPressure", `${data.current.pressure_msl}`);
    cw_map.set("cWeatherCondition", `${await getWeatherCondition(data.current.weather_code)}`);
    cw_map.set("cWeatherConditionTheme", `${await getWCTheme(data)}`);
    cw_map.set("todaysmaxTemp", `${data.daily.temperature_2m_max[0]}`);
    cw_map.set("todaysminTemp", `${data.daily.temperature_2m_min[0]}`);
    cw_map.set("cwWindSpeed", `${data.current.wind_speed_10m}`);
    cw_map.set("cwWindDirection", `${await getWDName(data)}`);
    cw_map.set("cwWindGusts", `${data.current.wind_gusts_10m}`);
    cw_map.set("cwPrecipitation", `${await getPrecipitation(data)}`);
    cw_map.set("cwCloudCover", `${data.current.cloud_cover}`);
    cw_map.set("cwUVIndex", `${data.current.uv_index}`);
    cw_map.set("cwUVIndexMax", `${data.daily.uv_index_max[0]}`);
    cw_map.set("cwSunrise", `${await getSunrise(data)}`);
    cw_map.set("cwSunset", `${await getSunset(data)}`);
    cw_map.set("cwDayLightDuration", `${await formatDuration(data.daily.daylight_duration[0])}`);
    cw_map.set("caqAQI", `${airData.current.european_aqi}`);
    cw_map.set("caqPM10", `${airData.current.pm10}`);
    cw_map.set("caqPM2_5", `${airData.current.pm2_5}`);
    cw_map.set("caqNO2", `${airData.current.nitrogen_dioxide}`);
    cw_map.set("caqO3", `${airData.current.ozone}`);
    cw_map.set("caqCO", `${airData.current.carbon_monoxide}`);
    cw_map.set("caqSO2", `${airData.current.sulphur_dioxide}`);

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

async function formatDate(date) {
    return new Date(date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

async function formatday(date) {
    return new Date(date).toLocaleDateString("en-US", {
        weekday: "long"
    });
}

async function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
}

async function getLocationName(response) {
    if (response.results[0].components.city) {
        // console.log(`${response.results[0].components.city}, ${response.results[0].components.state}`);
        return `${response.results[0].components.city}, ${response.results[0].components.state}`;
    }
    else if (!response.results[0].components.city) {
        return response.results[0].formatted;
    }
}

async function getHourlyDate(data) {
    let dates = [];

    data.hourly.time.forEach(async hourlyTime => {
        dates.push(`${await formatDate(hourlyTime)}`);
    });
    return dates;
}

async function getHourlyTime(data) {
    let timeList = [];

    data.hourly.time.forEach(async hourlyTime => {
        timeList.push(`${await formatTime(hourlyTime)}`);
    });
    return timeList;
}

async function getHourlyTemp(data) {
    let tempList = [];

    data.hourly.temperature_2m.forEach(async hourlyTemp => {
        tempList.push(`${hourlyTemp}`);
    });
    return tempList;
}

async function getHourlyHumidity(data) {
    let humidityList = [];

    data.hourly.relative_humidity_2m.forEach(async hourlyHumidity => {
        humidityList.push(hourlyHumidity);
    });
    return humidityList;
}

async function getHourlyApparentTemp(data) {
    let apparentTempList = [];

    data.hourly.apparent_temperature.forEach(async hourlyApparentTemp => {
        apparentTempList.push(hourlyApparentTemp);
    });
    return apparentTempList;
}

async function getHourlyPrecipitation(data) {
    let hourlyPrecipitationList = [];

    data.hourly.precipitation_probability.forEach(async hourlyPP => {
        hourlyPrecipitationList.push(hourlyPP);
    });
    return hourlyPrecipitationList;
}

async function getHourlyWeatherCondition(data) {
    let hourlyWCList = [];

    data.hourly.weather_code.forEach(async hourlyWC => {
        hourlyWCList.push(await getWeatherCondition(hourlyWC));
    });
    return hourlyWCList;
}

async function getHourlyWindGusts(data) {
    let hourlyWGList = [];

    data.hourly.wind_gusts_10m.forEach(async hourlyWG => {
        hourlyWGList.push(hourlyWG);
    });
    return hourlyWGList;
}

async function getHoulryData(data) {
    const hourlyDates = await getHourlyDate(data);
    const hourlyTime = await getHourlyTime(data);
    const hourlyTemp = await getHourlyTemp(data);
    const hourlyHumidity = await getHourlyHumidity(data);
    const hourlyApparentTemp = await getHourlyApparentTemp(data);
    const hourlyPrecipitation = await getHourlyPrecipitation(data);
    const hourlyWeatherCondition = await getHourlyWeatherCondition(data);
    const hourlyWindGusts = await getHourlyWindGusts(data);
    return {hourlyDates, hourlyTime, hourlyTemp, hourlyHumidity, hourlyApparentTemp, hourlyPrecipitation, hourlyWeatherCondition, hourlyWindGusts};
}


async function main(cityname) {
    const apiResponse = await getCoordinates(cityname);
    const lat = apiResponse.results[0].geometry.lat;
    const lon = apiResponse.results[0].geometry.lng;
    const locationName = {"CityName" : await getLocationName(apiResponse)};
    const weatherData = await getWeather(lat, lon);
    const AirQualityData = await getAirData(lat, lon);
    const cwData = await getCurrentWeather(weatherData, AirQualityData);
    const hourlyData = await getHoulryData(weatherData);
    return combined = {"Current": {...locationName, ...Object.fromEntries(cwData)}, hourlyData};
}

app.get("/city/:cityName", async (req,res) => {
    const cityName = req.params.cityName;
    console.log(cityName);
    const WeatherRes = await main(cityName);
    // console.log(WeatherRes);
    // console.log(WeatherRes);
    res.json(WeatherRes);
});


app.get("/", async (req,res) => {
    const cWeather = await main();
    res.json(cWeather);
});
app.listen(port);