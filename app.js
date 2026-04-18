const API_URL = "https://restcountries.com/v3.1/all";


const loader = document.getElementById("loader");
const grid = document.getElementById("countriesGrid");
const searchInput = document.getElementById("searchInput");
const regionFilter = document.getElementById("regionFilter");
const noResults = document.getElementById("noResults");


const modal = document.getElementById("modal");
const modalContent = document.getElementById("modalContent");
const closeModalBtn = document.getElementById("closeModalBtn");
const modalOverlay = document.getElementById("modalOverlay");


const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");


let countries = [];


async function fetchCountries() {
   try {
       loader.classList.remove("hidden");
       grid.innerHTML = "";


       const res = await fetch("https://restcountries.com/v3.1/all?fields=name,capital,region,population,flags,cca3,languages,currencies,maps");


       console.log("API Status:", res.status);


       if (!res.ok) {
           throw new Error("API failed with status " + res.status);
       }


       const data = await res.json();


       console.log("Countries loaded:", data.length);


       if (!Array.isArray(data) || data.length === 0) {
           throw new Error("No data received from API");
       }


       countries = data.sort((a, b) =>
           a.name.common.localeCompare(b.name.common)
       );


       loader.classList.add("hidden");
       displayCountries(countries);


   } catch (err) {
       console.error("Fetch error:", err);


       loader.innerHTML = `
           <div class="text-center text-red-500 font-bold">
               Failed to load countries.<br>
               Check internet or API status.
           </div>
       `;
   }
}
function displayCountries(data) {
   grid.innerHTML = "";


   if (!data.length) {
       noResults.classList.remove("hidden");
       return;
   }


   noResults.classList.add("hidden");


   const fragment = document.createDocumentFragment();


   data.forEach(country => {
       const flag = country.flags?.svg || "";
       const capital = country.capital?.[0] || "N/A";


       const card = document.createElement("div");
       card.className = "country-card bg-white dark:bg-gray-800 rounded-2xl shadow hover:shadow-lg cursor-pointer overflow-hidden";


       card.setAttribute("tabindex", "0");


       card.innerHTML = `
           <img loading="lazy" src="${flag}" class="w-full h-40 object-cover">
           <div class="p-4">
               <h2 class="font-bold text-lg mb-2">${country.name.common}</h2>
               <p class="text-sm text-gray-500">Capital: ${capital}</p>
               <p class="text-sm text-gray-500">Region: ${country.region}</p>
           </div>`;


       card.addEventListener("click", () => openModal(country));
       card.addEventListener("keypress", (e) => {
           if (e.key === "Enter") openModal(country);
       });


       fragment.appendChild(card);
   });


   grid.appendChild(fragment);
}


function filterCountries() {
   const search = searchInput.value.toLowerCase().trim();
   const region = regionFilter.value;


   let filtered = countries.filter(c =>
       c.name.common.toLowerCase().includes(search) ||
       (c.capital?.[0] || "").toLowerCase().includes(search)
   );


   if (region !== "all") {
       filtered = filtered.filter(c => c.region === region);
   }


   displayCountries(filtered);
}

searchInput.addEventListener("input", filterCountries);
regionFilter.addEventListener("change", filterCountries);


function openModal(country) {
   modal.classList.remove("hidden");
   document.body.classList.add("overflow-hidden");


   const languages = country.languages
       ? Object.values(country.languages).join(", ")
       : "N/A";


   const currencies = country.currencies
       ? Object.values(country.currencies).map(c => c.name).join(", ")
       : "N/A";


   modalContent.innerHTML = `
       <div class="md:w-1/2">
           <img src="${country.flags?.svg || ""}" class="w-full h-full object-cover">
       </div>
       <div class="p-6 md:w-1/2">
           <h2 class="text-2xl font-bold mb-4">${country.name.common}</h2>
           <p><strong>Official:</strong> ${country.name.official}</p>
           <p><strong>Capital:</strong> ${country.capital?.[0] || "N/A"}</p>
           <p><strong>Region:</strong> ${country.region}</p>
           <p><strong>Population:</strong> ${country.population.toLocaleString()}</p>
           <p><strong>Languages:</strong> ${languages}</p>
           <p><strong>Currency:</strong> ${currencies}</p>
           <a href="${country.maps?.googleMaps || "#"}" target="_blank"
              class="inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg">
              View on Map
           </a>
       </div>
   `;
}


function closeModal() {
   modal.classList.add("hidden");
   document.body.classList.remove("overflow-hidden");
}


closeModalBtn.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", closeModal);


function setTheme(isDark) {
   document.documentElement.classList.toggle("dark", isDark);
   themeIcon.classList.toggle("fa-moon", !isDark);
   themeIcon.classList.toggle("fa-sun", isDark);
   localStorage.setItem("theme", isDark ? "dark" : "light");
}


themeToggle.addEventListener("click", () => {
   const isDark = document.documentElement.classList.contains("dark");
   setTheme(!isDark);
});


(function () {
   const saved = localStorage.getItem("theme");
   setTheme(saved === "dark");
})();


fetchCountries();
