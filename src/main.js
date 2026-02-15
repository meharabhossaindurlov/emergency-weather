const app = document.querySelector("#app")

app.innerHTML = `
  <div class="w-full max-w-sm mx-auto p-6">
    <div class="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl shadow-xl p-6 text-center space-y-6">

      <div class="text-5xl animate-pulse">⛈️</div>

      <h1 class="text-xl font-semibold tracking-wide">
        Severe Storm Warning
      </h1>

      <p id="status" class="text-slate-300 text-sm">
        Tap below to view local radar
      </p>

      <button id="radarBtn"
        class="w-full bg-indigo-600 hover:bg-indigo-500 transition rounded-xl py-3 font-medium shadow-lg">
        View Live Radar
      </button>

      <div id="weather" class="hidden text-lg font-semibold"></div>

    </div>
  </div>
`

const radarBtn = document.getElementById("radarBtn")
const status = document.getElementById("status")
const weatherDiv = document.getElementById("weather")

radarBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    status.textContent = "Geolocation not supported in this browser."
    return
  }

  status.textContent = "Requesting location..."

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords

      status.textContent = "Fetching local weather..."

      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
        )

        const data = await response.json()

        const temperature = data.current_weather.temperature

        weatherDiv.innerHTML = `
          <div>Current Temperature: ${temperature}°C</div>
          <div class="text-sm font-normal text-slate-400 mt-1">
            Latitude: ${latitude.toFixed(4)} · Longitude: ${longitude.toFixed(4)}
          </div>
        `
        weatherDiv.classList.remove("hidden")

        status.textContent = "Opening live radar..."

        setTimeout(() => {
          window.location.href = `https://www.windy.com/${latitude}/${longitude}`
        }, 3000)

      } catch (error) {
        status.textContent = "Unable to fetch weather data."
      }
    },
    (error) => {
      status.textContent = "Location access required for local radar accuracy."
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  )
})
