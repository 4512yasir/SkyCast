const apiKey = "aebffadb8cd6ac85fa994e8e48c0562e"; 
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const cityInput = document.getElementById("cityInput");
const weatherInfo = document.getElementById("weatherInfo");
const errorMsg = document.getElementById("error");

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city !== "") {
    fetchWeather(city);
  } else {
    errorMsg.textContent = "Please enter a city name.";
  }
});

locationBtn.addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showGeoError);
  } else {
    errorMsg.textContent = "Geolocation is not supported by this browser.";
  }
});

function showPosition(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;
  fetchWeatherByCoords(lat, lon);
}

function showGeoError(error) {
  errorMsg.textContent = "Unable to retrieve your location.";
  weatherInfo.innerHTML = "";
}

function fetchWeather(city) {
  const apiURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  weatherInfo.innerHTML = "Loading...";
  errorMsg.textContent = "";

  fetch(apiURL)
    .then(res => {
      if (!res.ok) throw new Error("City not found");
      return res.json();
    })
    .then(data => {
      showWeather(data);
      fetchForecast(city);
    })
    .catch(err => {
      weatherInfo.innerHTML = "";
      errorMsg.textContent = err.message;
    });
}

async function fetchWeatherByCoords(lat, lon) {
  const apiURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  try {
    errorMsg.textContent = "";
    weatherInfo.innerHTML = "Loading...";

    const response = await fetch(apiURL);
    if (!response.ok) throw new Error("Failed to fetch weather for your location.");

    const data = await response.json();
    showWeather(data);
    fetchForecast(data.name);
  } catch (error) {
    weatherInfo.innerHTML = "";
    errorMsg.textContent = error.message;
  }
}

function showWeather(data) {
  const iconCode = data.weather[0].icon;
  const iconURL = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  weatherInfo.innerHTML = `
    <h2>${data.name}, ${data.sys.country}</h2>
    <img src="${iconURL}" alt="${data.weather[0].description}">
    <p><strong>${Math.round(data.main.temp)}°C</strong> | ${data.weather[0].main}</p>
    <p>Humidity: ${data.main.humidity}%</p>
    <p>Wind Speed: ${data.wind.speed} m/s</p>
  `;
}

async function fetchForecast(city) {
  const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
  try {
    const response = await fetch(forecastURL);
    const data = await response.json();
    displayForecast(data);
  } catch (error) {
    console.log("Forecast error:", error);
  }
}

function displayForecast(data) {
  const forecastContainer = document.getElementById("forecastContainer");
  forecastContainer.innerHTML = "";

  const dailyForecast = data.list.filter(item => item.dt_txt.includes("12:00:00"));

  dailyForecast.forEach(day => {
    const date = new Date(day.dt_txt);
    const options = { weekday: 'short' };
    const weekday = date.toLocaleDateString(undefined, options);
    const icon = `https://openweathermap.org/img/wn/${day.weather[0].icon}.png`;

    const forecastCard = document.createElement("div");
    forecastCard.classList.add("forecast-card");
    forecastCard.innerHTML = `
      <strong>${weekday}</strong>
      <img src="${icon}" alt="${day.weather[0].description}" />
      <div>${Math.round(day.main.temp)}°C</div>
    `;
    forecastContainer.appendChild(forecastCard);
  });
}
