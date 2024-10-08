const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const weatherCardsDiv = document.querySelector(".weather-cards");
const currentWeatherDiv = document.querySelector(".current-weather");
const errorMessageSpan = document.querySelector('.error-message'); // Select the error message span

const API_KEY = "eb25bb98e70091ae7787a643b17b1686";  // API key for OpenWeatherMap API 

const createWeatherCard = (cityName, weatherItem, index) => {
    if (index === 0) {
        return `<div class="details">
                    <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h4>Temperature : ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                    <h4>Wind Speed : ${weatherItem.wind.speed} M/s</h4>
                    <h4>Humidity :  ${weatherItem.main.humidity} %</h4>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
                    <h4>${weatherItem.weather[0].description}</h4>
                </div>`;
    } else {
        return `<li class="card">
                    <h3>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h3>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
                    <h4>Desc : ${weatherItem.weather[0].description}</h4>
                    <h4>Temperature : ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                    <h4>Wind Speed : ${weatherItem.wind.speed} M/s</h4>
                    <h4>Humidity :  ${weatherItem.main.humidity} %</h4>
                </li>`;
    }
}

const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL).then(res => res.json()).then(data => {
        const uniqueForecastDays = [];
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if (!uniqueForecastDays.includes(forecastDate)) {
                return uniqueForecastDays.push(forecastDate);
            }
        });

        cityInput.value = "";
        currentWeatherDiv.innerHTML = "";
        weatherCardsDiv.innerHTML = "";

        fiveDaysForecast.forEach((weatherItem, index) => {
            if (index === 0) {
                currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
            } else {
                weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
            }
        });

    }).catch(() => {
        errorMessageSpan.textContent = "An Error Occurred while Fetching the Weather Forecast!";
        errorMessageSpan.style.display = "block"; // Show error message
    });
}

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    const validCityNamePattern = /^[a-zA-Z\s]+$/; // Only allows alphabets and spaces

    if (!cityName || !validCityNamePattern.test(cityName)) {
        errorMessageSpan.textContent = "Please enter a valid city name!"; // Set error message
        errorMessageSpan.style.display = "block"; // Show error message
        return;
    } else {
        errorMessageSpan.style.display = "none"; // Hide error message if input is valid
    }

    const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
    
    fetch(GEOCODING_API_URL)
        .then(res => res.json())
        .then(data => {
            if (!data.length) {
                errorMessageSpan.textContent = `No coordinates found for ${cityName}.`; // Set error message
                errorMessageSpan.style.display = "block"; // Show error message
                return;
            }
            errorMessageSpan.style.display = "none"; // Hide error message if input is valid
            const { name, lat, lon } = data[0];
            getWeatherDetails(name, lat, lon);
        })
        .catch(() => {
            errorMessageSpan.textContent = "An error occurred while fetching the coordinates!"; // Set error message
            errorMessageSpan.style.display = "block"; // Show error message
        });
};

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            const REVERSE_GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            fetch(REVERSE_GEOCODING_URL).then(res => res.json()).then(data => {
                const { name } = data[0];
                getWeatherDetails(name, latitude, longitude);
            }).catch(() => {
                errorMessageSpan.textContent = "An Error Occurred while Fetching the City!";
                errorMessageSpan.style.display = "block"; // Show error message
            });
        },
        error => {
            if (error.code === error.PERMISSION_DENIED) {
                errorMessageSpan.textContent = "Geolocation request denied. Please reset location permission to grant access again...";
                errorMessageSpan.style.display = "block"; // Show error message
            }
        }
    );
}

searchButton.addEventListener("click", getCityCoordinates);
locationButton.addEventListener("click", getUserCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());
