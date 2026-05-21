// API KEY — replace with your key
const API_KEY = "YOUR_API_KEY_HERE";

// DOM ELEMENTS
const cityInput          = document.getElementById("cityInput");
const searchBtn          = document.getElementById("searchBtn");
const cityName           = document.getElementById("cityName");
const countryName        = document.getElementById("countryName");
const weatherDescription = document.getElementById("weatherDescription");
const temperature        = document.getElementById("temperature");
const feelsLike          = document.getElementById("feelsLike");
const humidity           = document.getElementById("humidity");
const windSpeed          = document.getElementById("windSpeed");
const pressure           = document.getElementById("pressure");
const visibility         = document.getElementById("visibility");
const weatherIcon        = document.getElementById("weatherIcon");
const weatherContent     = document.getElementById("weatherContent");
const errorMessage       = document.getElementById("errorMessage");
const loadingMessage     = document.getElementById("loadingMessage");
const lastUpdated        = document.getElementById("lastUpdated");
const forecastCards      = document.getElementById("forecastCards");

// SEARCH BUTTON EVENT
searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (city) fetchWeatherAndForecast(city);
});

// ENTER KEY SUPPORT
cityInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        const city = cityInput.value.trim();
        if (city) fetchWeatherAndForecast(city);
    }
});

// FETCH CURRENT WEATHER + FORECAST
async function fetchWeatherAndForecast(city) {

    showLoading();

    try {

        // Fetch both APIs in parallel
        const [currentRes, forecastRes] = await Promise.all([
            fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`),
            fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`)
        ]);

        if (!currentRes.ok) throw new Error("City not found. Please check the spelling and try again.");

        const currentData  = await currentRes.json();
        const forecastData = await forecastRes.json();

        displayWeather(currentData);
        displayForecast(forecastData);

        // Save last searched city to localStorage
        localStorage.setItem("lastCity", city);

    } catch (error) {

        showError(error.message);

    } finally {

        hideLoading();
    }
}

// DISPLAY CURRENT WEATHER
function displayWeather(data) {

    clearError();
    weatherContent.classList.remove("hidden");

    const { name, sys, main, weather, wind, visibility: vis } = data;

    // City & country
    cityName.textContent    = name;
    countryName.textContent = sys.country;

    // Description
    weatherDescription.textContent = weather[0].description;

    // Temperature
    temperature.textContent = `${Math.round(main.temp)}°C`;
    feelsLike.textContent   = `Feels like ${Math.round(main.feels_like)}°C`;

    // Details
    humidity.textContent  = `${main.humidity}%`;

    // FIX: API returns m/s — convert to km/h
    windSpeed.textContent = `${Math.round(wind.speed * 3.6)} km/h`;

    pressure.textContent   = `${main.pressure} hPa`;
    visibility.textContent = `${(vis / 1000).toFixed(1)} km`;

    // Icon
    updateWeatherIcon(weather[0].main);

    // Last updated timestamp
    const now = new Date();
    lastUpdated.textContent = `Updated ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

// DISPLAY 5-DAY FORECAST
function displayForecast(data) {

    forecastCards.innerHTML = "";

    // The forecast API returns readings every 3 hours.
    // We pick one reading per day (around midday) for 5 days.
    const daily = {};

    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dateKey = date.toDateString();
        const hour = date.getHours();

        // Prefer the reading closest to noon each day
        if (!daily[dateKey] || Math.abs(hour - 12) < Math.abs(new Date(daily[dateKey].dt * 1000).getHours() - 12)) {
            daily[dateKey] = item;
        }
    });

    // Skip today, take next 5 days
    const days = Object.values(daily).slice(1, 6);

    days.forEach((day, i) => {
        const date      = new Date(day.dt * 1000);
        const dayName   = date.toLocaleDateString("en-GB", { weekday: "short" });
        const high      = Math.round(day.main.temp_max);
        const low       = Math.round(day.main.temp_min);
        const condition = day.weather[0].main;
        const icon      = getWeatherIcon(condition);

        const card = document.createElement("div");
        card.className = "forecast-card";
        card.style.animationDelay = `${i * 0.07}s`;
        card.innerHTML = `
            <p class="forecast-day">${dayName}</p>
            <span class="forecast-icon">${icon}</span>
            <p class="forecast-high">${high}°C</p>
            <p class="forecast-low">${low}°C</p>
        `;

        forecastCards.appendChild(card);
    });
}

// WEATHER ICONS
function getWeatherIcon(condition) {
    const icons = {
        Clear:        "☀️",
        Clouds:       "☁️",
        Rain:         "🌧️",
        Thunderstorm: "⛈️",
        Drizzle:      "🌦️",
        Snow:         "❄️",
        Mist:         "🌫️",
        Haze:         "🌫️",
        Fog:          "🌫️",
        Dust:         "🌪️",
        Sand:         "🌪️",
        Tornado:      "🌪️",
    };
    return icons[condition] || "🌍";
}

function updateWeatherIcon(condition) {
    weatherIcon.textContent = getWeatherIcon(condition);
}

// UI STATE HELPERS
function showLoading() {
    loadingMessage.textContent = "Fetching weather data...";
    clearError();
}

function hideLoading() {
    loadingMessage.textContent = "";
}

function showError(message) {
    errorMessage.textContent = message;
    weatherContent.classList.add("hidden");
}

function clearError() {
    errorMessage.textContent = "";
}

// STARTUP — load last searched city
// or default to Harare
const startCity = localStorage.getItem("lastCity") || "Harare";
cityInput.value = startCity;
fetchWeatherAndForecast(startCity);
