# 🌦️ Weather Dashboard

A clean, responsive weather app built with vanilla HTML, CSS, and JavaScript. Fetches real-time weather and a 5-day forecast using the OpenWeatherMap API.

## 🔗 Live Demo

> [Add your GitHub Pages link here once deployed]

---

## ✨ Features

- 🔍 Search any city worldwide
- ⌨️ Press **Enter** or click **Search** to look up weather
- 🌡️ Current temperature, feels like, humidity, wind speed, pressure, visibility
- 📅 **5-day forecast** with daily high/low temperatures
- 💾 Remembers your **last searched city** via localStorage
- ⚠️ Friendly error messages for invalid cities
- ⏱️ Shows the time weather data was last updated
- 📱 Fully **responsive** — mobile and desktop
- 🎨 Glassmorphism UI with smooth animations

---

## 🛠️ Tech Stack

| Layer      | Technology               |
|------------|--------------------------|
| Structure  | HTML5                    |
| Styling    | CSS3 (glassmorphism, CSS variables) |
| Logic      | Vanilla JavaScript (ES6+, async/await) |
| Data       | OpenWeatherMap API       |
| Storage    | Browser localStorage     |

---

## 🚀 Getting Started

### 1. Get a free API key

- Sign up at [openweathermap.org](https://openweathermap.org)
- Go to **API Keys** in your dashboard
- Copy your key (activates within ~10 minutes)

### 2. Clone and configure

```bash
git clone https://github.com/regis-chifambaa/weather-app.git
cd weather-app
```

Open `script.js` and replace:

```javascript
const API_KEY = "YOUR_API_KEY_HERE";
```

with your actual key.

### 3. Open in browser

```bash
open index.html   # or double-click in your file explorer
```

---

## 📁 Project Structure

```
weather-app/
├── index.html   # App structure & layout
├── style.css    # Glassmorphism styling & animations
├── script.js    # API calls, DOM updates, localStorage
└── README.md    # You're reading it
```

---

## 🌍 API Used

**OpenWeatherMap** — [openweathermap.org/api](https://openweathermap.org/api)

- `GET /data/2.5/weather` — current weather
- `GET /data/2.5/forecast` — 5-day / 3-hour forecast

Both endpoints use the free tier (no credit card required).

---

## 💡 What I Learned

- Making **API calls** with `fetch` and `async/await`
- Handling API **errors gracefully** with try/catch/finally
- Running **parallel requests** with `Promise.all`
- Parsing and transforming **JSON data** from a real API
- Converting units (m/s → km/h for wind speed)
- Persisting user preferences with **localStorage**
- Building a responsive UI with **CSS Grid and Flexbox**

---

## 🔮 Possible Future Improvements

- [ ] Toggle between °C and °F
- [ ] Hourly forecast view
- [ ] Location detection via browser Geolocation API
- [ ] Weather background that changes with conditions
- [ ] Search history dropdown

---

## 👤 Author

**Regis Tanaka Chifamba**
- GitHub: [@regis-chifambaa] (https://github.com/regis-chifambaa)

---

*Built as Project #3 in my web development journey.*
