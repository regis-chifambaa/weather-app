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
const tempToggle         = document.getElementById("tempToggle");
const geoBtn             = document.getElementById("geoBtn");
const offlineBanner      = document.getElementById("offlineBanner");

// STATE
let isCelsius = true;
let lastWeatherData = null;
let lastForecastData = null;

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

// TEMPERATURE TOGGLE
tempToggle.addEventListener("click", () => {
    isCelsius = !isCelsius;
    tempToggle.textContent = isCelsius ? "°F" : "°C";
    
    // Re-display with converted temperatures
    if (lastWeatherData) {
        displayWeather(lastWeatherData);
    }
    if (lastForecastData) {
        displayForecast(lastForecastData);
    }
});

// GEOLOCATION BUTTON
geoBtn.addEventListener("click", () => {
    if (navigator.geolocation) {
        geoBtn.disabled = true;
        showLoading();
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                fetchWeatherByCoords(latitude, longitude);
                geoBtn.disabled = false;
            },
            (error) => {
                showError("📍 Location access denied. Please search manually.");
                hideLoading();
                geoBtn.disabled = false;
            }
        );
    } else {
        showError("Geolocation is not supported by your browser.");
    }
});

// OFFLINE DETECTION
window.addEventListener("offline", () => {
    const cached = localStorage.getItem("lastWeatherData");
    if (cached) {
        offlineBanner.classList.remove("hidden");
        const data = JSON.parse(cached);
        displayWeather(data);
    }
});

window.addEventListener("online", () => {
    offlineBanner.classList.add("hidden");
});

// Check if currently offline
if (!navigator.onLine) {
    const cached = localStorage.getItem("lastWeatherData");
    if (cached) {
        offlineBanner.classList.remove("hidden");
    }
}

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

        // Save to localStorage
        localStorage.setItem("lastCity", city);
        localStorage.setItem("lastWeatherData", JSON.stringify(currentData));
        localStorage.setItem("lastForecastData", JSON.stringify(forecastData));

        offlineBanner.classList.add("hidden");

    } catch (error) {

        showError(error.message);

    } finally {

        hideLoading();
    }
}

// FETCH BY COORDINATES (Geolocation)
async function fetchWeatherByCoords(lat, lon) {

    showLoading();

    try {

        const [currentRes, forecastRes] = await Promise.all([
            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`),
            fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)
        ]);

        if (!currentRes.ok) throw new Error("Unable to fetch weather for your location.");

        const currentData  = await currentRes.json();
        const forecastData = await forecastRes.json();

        displayWeather(currentData);
        displayForecast(forecastData);

        // Update input and save
        cityInput.value = currentData.name;
        localStorage.setItem("lastCity", currentData.name);
        localStorage.setItem("lastWeatherData", JSON.stringify(currentData));
        localStorage.setItem("lastForecastData", JSON.stringify(forecastData));

        offlineBanner.classList.add("hidden");

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
    lastWeatherData = data;

    const { name, sys, main, weather, wind, visibility: vis } = data;

    // City & country
    cityName.textContent    = name;
    countryName.textContent = sys.country;

    // Description
    weatherDescription.textContent = weather[0].description;

    // Temperature (with conversion if needed)
    let temp = Math.round(main.temp);
    let feelsTemp = Math.round(main.feels_like);
    
    if (!isCelsius) {
        temp = Math.round((main.temp * 9/5) + 32);
        feelsTemp = Math.round((main.feels_like * 9/5) + 32);
    }
    
    const unit = isCelsius ? "°C" : "°F";
    temperature.textContent = `${temp}${unit}`;
    feelsLike.textContent   = `Feels like ${feelsTemp}${unit}`;

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
    lastForecastData = data;

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
        
        // Temperature conversion if needed
        let high = Math.round(day.main.temp_max);
        let low  = Math.round(day.main.temp_min);
        
        if (!isCelsius) {
            high = Math.round((day.main.temp_max * 9/5) + 32);
            low  = Math.round((day.main.temp_min * 9/5) + 32);
        }
        
        const unit      = isCelsius ? "°C" : "°F";
        const condition = day.weather[0].main;
        const icon      = getWeatherIcon(condition);

        const card = document.createElement("div");
        card.className = "forecast-card";
        card.style.animationDelay = `${i * 0.07}s`;
        card.innerHTML = `
            <p class="forecast-day">${dayName}</p>
            <span class="forecast-icon">${icon}</span>
            <p class="forecast-high">${high}${unit}</p>
            <p class="forecast-low">${low}${unit}</p>
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
    loadingMessage.classList.add("active");
    clearError();
}

function hideLoading() {
    loadingMessage.textContent = "";
    loadingMessage.classList.remove("active");
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
