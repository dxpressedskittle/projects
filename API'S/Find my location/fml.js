async function getLocation() {
  const url = "http://ip-api.com/json/?fields=continent,country,regionName,city,district,zip,lat,lon,timezone,currency,as,asname,reverse,query";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Location fetch failed: ${response.status}`);
    }

    const data = await response.json();
    displayData(data);
  } catch (error) {
    console.error("Error fetching location:", error.message);
    document.getElementById("info").innerText = "Failed to fetch location.";
  }
}

async function getIP() {
  const url = "https://api.ipify.org?format=json";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`IP fetch failed: ${response.status}`);
    }

    const data = await response.json();
    document.getElementById("ip").innerText = `Your IP: ${data.ip}`;
  } catch (error) {
    console.error("Error fetching IP:", error.message);
    document.getElementById("ip").innerText = "Failed to fetch IP.";
  }
}

function displayData(data) {
  const info = document.getElementById("info");
  info.innerHTML = `
    <strong>Continent:</strong> ${data.continent}<br>
    <strong>Country:</strong> ${data.country}<br>
    <strong>Region:</strong> ${data.regionName}<br>
    <strong>City:</strong> ${data.city}<br>
    <strong>District:</strong> ${data.district || 'N/A'}<br>
    <strong>ZIP Code:</strong> ${data.zip}<br>
    <strong>Latitude:</strong> ${data.lat}<br>
    <strong>Longitude:</strong> ${data.lon}<br>
    <strong>Timezone:</strong> ${data.timezone}<br>
    <strong>Currency:</strong> ${data.currency}<br>
    <strong>ISP:</strong> ${data.asname}<br>
    <strong>Reverse DNS:</strong> ${data.reverse}<br>
    <strong>Query IP:</strong> ${data.query}<br>
  `;
}

getLocation();
getIP();
