const API_URL = "KLUCZ API WLASNY";
const API_KEY = "rc_live_4b7c9b5c9c2b48c0b48069ae0491af36";

const form = document.getElementById("capital-form");
const input = document.getElementById("capital-input");
const errorMessage = document.getElementById("error-message");
const tbody = document.getElementById("country-tbody");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const query = input.value.trim();
  if (!query) return;

  clearError();
  tbody.innerHTML = "";

  try {
    const countries = await fetchCountries(query);

    if (countries.length === 0) {
      showError(`Nie znaleziono wyników dla: "${query}".`);
      return;
    }

    countries.forEach(renderRow);
  } catch (err) {
    showError(err.message || "Wystąpił nieoczekiwany błąd.");
  }
});

async function fetchCountries(query) {
  const params = new URLSearchParams({
    q: query,
    
    response_fields: "names.common,capitals,population,region,subregion",
  });

  const response = await fetch(`${API_URL}?${params}`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });

  let json = null;
  try {
    json = await response.json();
  } catch {
    
  }

  if (!response.ok || !json || json.success === false) {
    const apiMessage = json?.errors?.[0]?.message;
    throw new Error(apiMessage || `Błąd serwera (HTTP ${response.status}).`);
  }

  return json.data?.objects ?? [];
}

function renderRow(country) {
  const capitals = (country.capitals ?? []).map((c) => c.name).join(", ");

  const values = [
    country.names?.common,
    capitals,
    country.population != null
      ? country.population.toLocaleString("pl-PL")
      : null,
    country.region,
    country.subregion,
  ];

  const tr = document.createElement("tr");
  values.forEach((value) => {
    const td = document.createElement("td");
    td.textContent = value || "—";
    tr.appendChild(td);
  });
  tbody.appendChild(tr);
}

function showError(message) {
  errorMessage.textContent = message;
}

function clearError() {
  errorMessage.textContent = "";
}