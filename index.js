const ENV_API_KEY = "be0a6a3a601c3b46dcdeec9f46682f78";
//convert k to f
const convertFromKelvin = function (kTemp) {
  let fTemp = ((kTemp - 273.15) * 9) / 5 + 32;
  const tempObj = {
    fTemp,
    kTemp,
  };
  return tempObj;
};

const selectEls = function () {
  const submitBtn = document.querySelector(".form-btn");
  const cityInput = document.getElementById("city");
  const tempPar = document.querySelector(".current-temp");
  const currFeelsSpan =
    document.querySelector(".current-feels").firstElementChild;
  const currHumiditySpan =
    document.querySelector(".current-humidity").firstElementChild;
  const currWindSpan =
    document.querySelector(".current-wind").firstElementChild;
  const currPressureSpan = document.querySelector(
    ".current-precipitation"
  ).firstElementChild;
  const currCloudSpan =
    document.querySelector(".current-cloudy").firstElementChild;
  const dailyHighs = document.querySelectorAll(".day-card-high > span");
  const dailyLows = document.querySelectorAll(".day-card-low > span");
  const dailyPrecipitation = document.querySelectorAll(
    ".day-card-precipitation > span"
  );
  const dailyDescription = document.querySelectorAll(
    ".day-card-description > span"
  );
  const dateSpans = document.querySelectorAll(".day-card-date");
  const fieldBox = document.querySelector(".field-box");
  const errSpan = document.createElement("span");
  errSpan.classList.add("error-msg");
  errSpan.textContent = "City Not Found, please try again";
  return {
    submitBtn,
    cityInput,
    tempPar,
    currFeelsSpan,
    currHumiditySpan,
    currWindSpan,
    currPressureSpan,
    currCloudSpan,
    dailyHighs,
    dailyLows,
    dailyPrecipitation,
    dailyDescription,
    dateSpans,
    fieldBox,
    errSpan,
  };
};

const cityNotFound = function () {
  els.fieldBox.appendChild(els.errSpan);
};

const removeCityErr = function () {
  if (els.fieldBox.contains(els.errSpan)) {
    els.fieldBox.removeChild(els.errSpan);
  }
};

let els = selectEls();

const getCurrData = async function (location) {
  let response = await fetch(
    `http://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${ENV_API_KEY}`
  );
  let json = await response.json();
  return json;
};

const getMultiData = async function (location) {
  let response = await fetch(
    `http://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${ENV_API_KEY}`
  );
  let json = await response.json();
  return json;
};

const getDayObj = function (arr) {
  let max = 0;
  let min = 500;
  let total = 0;
  let num = arr.length;
  let index = arr.length / 2;
  let description = arr[index].weather[0].description;
  let dateArr = arr[index].dt_txt.split(" ");
  let date = dateArr[0];

  arr.forEach((obj) => {
    if (obj.main.temp < min) {
      min = obj.main.temp;
    }
    if (obj.main.temp > max) {
      max = obj.main.temp;
    }
    total = total + obj.pop;
  });

  let precipitation = ((total / num) * 100).toFixed(0);

  const dayObj = {
    min,
    max,
    precipitation,
    description,
    date,
  };

  return dayObj;
};

const processData = function (data) {
  const weatherObj = data.main;
  weatherObj.description = data.weather[0].description;
  weatherObj.wind = data.wind.speed;
  weatherObj.sunrise = data.sys.sunrise;
  weatherObj.sunset = data.sys.sunset;
  return weatherObj;
};

const processFiveData = function (data) {
  console.log(data);
  const weatherObj = {};
  const days = [];
  let start = 0;
  let end = 0;
  for (let i = 0; i < data.list.length / 8; i++) {
    start = i * (data.list.length / 5);
    end = (i + 1) * (data.list.length / 5);
    let day = data.list.slice(start, end);
    let dayObj = getDayObj(day);
    days.push(dayObj);
  }
  return days;
};

const getWeather = async function (e) {
  removeCityErr();
  let cityStr = els.cityInput.value;
  getCurrData(cityStr).then((val) => {
    console.log(val.message);
    if (val.message === "city not found") {
      cityNotFound();
    } else {
      let weatherObj = processData(val);
      updateWeatherPage(weatherObj);
    }
  });

  getMultiData(cityStr).then((val) => {
    if (val.message === "city not found") {
      cityNotFound();
    } else {
      let fiveDayObjList = processFiveData(val);
      updateFivePage(fiveDayObjList);
    }
  });
  e.preventDefault();
};

const updateFivePage = function (dayArr) {
  for (let i = 0; i < dayArr.length; i++) {
    els.dateSpans[i].textContent = dayArr[i].date;
    let highObj = convertFromKelvin(dayArr[i].max);
    els.dailyHighs[i].textContent = highObj.fTemp.toFixed(0);
    let lowObj = convertFromKelvin(dayArr[i].min);
    els.dailyLows[i].textContent = lowObj.fTemp.toFixed(0);
    els.dailyPrecipitation[i].textContent = `${dayArr[i].precipitation}%`;
    els.dailyDescription[i].textContent = dayArr[i].description;
  }
};

const updateWeatherPage = function (weatherObj) {
  let currTempObj = convertFromKelvin(weatherObj.temp);
  els.tempPar.textContent = `${currTempObj.fTemp.toFixed(0)} F`;
  let currFeelsObj = convertFromKelvin(weatherObj.feels_like);
  els.currFeelsSpan.textContent = `${currFeelsObj.fTemp.toFixed(0)} F`;
  els.currHumiditySpan.textContent = `${weatherObj.humidity.toFixed(0)}%`;
  els.currCloudSpan.textContent = weatherObj.description;
  els.currWindSpan.textContent = `${(weatherObj.wind * 3.6).toFixed(1)} km/hr`;
  els.currPressureSpan.textContent = `${weatherObj.pressure} h/Pa`;
};

els.submitBtn.addEventListener("click", getWeather);
