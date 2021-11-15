let apiKey = "280e29c95499e87b3c88dd1a18a7ecfa";
let cityInput = document.querySelector("#city");
let cityForm = document.querySelector("#city-form");
let weatherContainer = document.querySelector("#weather-container");
let citySearch = document.querySelector("#city-search");
let forecast = document.querySelector("#forecast");
let image = document.createElement("img");
let cityLog = document.querySelector("#previous-city")
let cities = [];

function getCityWeather(city) {
    // create initial query 
    let queryURL = "http://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial&appid=" + apiKey;

    fetch(queryURL).then(function(response){
        response.json().then(function(data){
            if(response.ok) {
                displayCity(data, city);
            } else {
                alert("City not found");
                cityInput.value = "";
            }
        })
    });
};

function formSubmitHandler(event){
    event.preventDefault();
    let city = cityInput.value.trim();

    if(city){
        getCityWeather(city);
    } else {
        alert("Please enter a City");
    }
};

function displayCity(city, citySearched) {
    // clear previous input field text and display city name being forcasted
    cityInput.value = "";

    // check for previous data and clear if needed
    if(citySearch.textContent) {
        citySearch.textContent = "";
        weatherContainer.textContent = "";
    }

    // today's date in mm/dd/yyy format
    let today = new Date();
    let dd = String(today.getDate());
    let mm = String(today.getMonth() + 1).padStart(2,"0");
    let yyyy = today.getFullYear();
    today = mm + "/" + dd + "/" + yyyy;

    // get lon and lat from previous query data
    let lat = city.coord.lat;
    let lon = city.coord.lon;

    let secondQuery = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&units=imperial&appid=" + apiKey;

    // second query needed to get UV using lat + lon
    fetch(secondQuery).then(function(response) {
        response.json().then(function(data) {
            fiveDayForecast(data);
            citiesSearched(citySearched)
        })
    })

    let list = document.createElement("li");

    if (cities.length >= 5){
        document.querySelector("ul > li").remove();
        document.querySelector("#previous-city").appendChild(list);
        list.textContent = citySearched;
    } else {
        document.querySelector("#previous-city").appendChild(list);
        list.textContent = citySearched;
    }
    
    document.querySelector("#previous-city").appendChild(list);
    list.textContent = citySearched;

    // current temp
    let temp = document.createElement("p");
    let fahrenheit = city.main.temp;
    temp.textContent = "Temperature: " + fahrenheit.toFixed(2) + "°F";

    weatherContainer.appendChild(temp);

    // wind
    let wind = document.createElement("p");
    let speed = (city.wind.speed * 2.236936);
    wind.textContent = "Wind: " + speed.toFixed(1) + " MPH";

    weatherContainer.appendChild(wind);

    // humidity
    let humidity = document.createElement("p");
    humidity.textContent = "Humidity: " + city.main.humidity + " %";

    // weather icon
    image.src = "http://openweathermap.org/img/wn/" + city.weather[0].icon + "@2x.png";

    citySearch.textContent = city.name + " " + today;
    citySearch.appendChild(image);
    weatherContainer.appendChild(humidity);

};

function fiveDayForecast(data) {
    let newCardDeck = document.createElement("div");

    // UV index
    let uvIndex = document.createElement("p");
    let uvi = data.current.uvi
    uvIndex.textContent = "UV Index: " + uvi;

    if(parseFloat(uvi) <= 2){
        uvIndex.classList.add("bg-success", "text-white", "p-2");
    } else if(parseFloat(uvi) > 2 && parseFloat(uvi) <= 5) {
        uvIndex.classList.add("bg-warning", "text-white", "p-2")
    } if(parseFloat(uvi) > 5) {
        uvIndex.classList.add("bg-danger", "text-white", "p-2")
    }

    // create the 5-day forcast when entering city unless it already ran once
    if(!document.getElementById("five")){    
        let fiveDay = document.createElement("h3");
        fiveDay.id = "five"
        fiveDay.textContent = "5-Day Forecast: ";
        forecast.appendChild(fiveDay);
    }

    document.querySelector("#card-deck-holder").appendChild(newCardDeck);
    newCardDeck.classList.add("card-deck");

    // create the 5 day forcast cards here and populate with information
    for (let i = 0; i < 5; i++) {
        // check to see if there has been previous info added and clear
        if(document.getElementById(`${i}`)){
            document.querySelector(".card-deck").remove();
        }
        // create the card for each day
        let card = document.createElement("div");
        card.classList.add("card", "col-3");
        card.id = `${i}`;

        // convert the dt/unix time to mmddyyyy format
        let date = moment.unix(data.daily[i + 1].dt).format("MM/DD/YYYY");
        let cardHeader = document.createElement("div");
        cardHeader.textContent = date
        cardHeader.classList.add("card-header", "font-weight-bold");

        // create the icon for the date selected
        let cardImage = document.createElement("img");
        cardImage.src = "http://openweathermap.org/img/wn/" + data.daily[i].weather[0].icon + "@2x.png";

        // temperature
        let temp = document.createElement("p");
        temp.textContent = "Temp: " + data.daily[i].temp.day + "°F";
        temp.classList.add("card-text");
        

        // wind
        let wind = document.createElement("p");
        wind.textContent = "Wind: " + data.daily[i].wind_speed + " MPH";
        wind.classList.add("card-text");

        // humidity
        let humid = document.createElement("p");
        humid.textContent = "Humidity: " + data.daily[i].humidity + " %";

        card.appendChild(cardHeader);
        card.appendChild(cardImage);
        card.appendChild(temp);
        card.appendChild(wind);
        card.appendChild(humid)
        newCardDeck.appendChild(card);
    }

    weatherContainer.appendChild(uvIndex);
};

function citiesSearched(citySearched) {
    // add the last 5 cities searched into the array then save into local storage
    if(cities.length >= 5){
        cities.shift()
        cities.push({city: citySearched});
    } else {
        cities.push({city: citySearched});
    }

    localStorage.setItem("cities", JSON.stringify(cities));
};

function loadCities() {
    let citiesLoaded = JSON.parse(localStorage.getItem("cities"));
    cities = JSON.parse(localStorage.getItem("cities"));
    
    // check to see if anything was saved previously then load
    if(citiesLoaded.length){
            for(let i = 0; i < citiesLoaded.length; i++) {
            let loadedCity = document.createElement("li");
            
            document.querySelector("#previous-city").appendChild(loadedCity);
            loadedCity.textContent = citiesLoaded[i].city;
        }
    }
    
    
};


cityForm.addEventListener("submit", formSubmitHandler);
loadCities();