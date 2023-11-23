<template>
  <div class="mx-4 my-8 md:m-12">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-12">
      <div>
        <div class="text-5xl">Location Tracker</div>
        <p class="text-sm">Created using Vue 3 and Tailwind CSS</p>

        <div class="my-8 flex flex-col w-full md:w-3/4">
          <label for="locationInput" class="my-1">Search Location:</label>
          <div class="border rounded-xl p-2 flex justify-between items-center">
            <input
              id="locationInput"
              v-model="searchQuery"
              @keyup.enter="searchLocation"
              placeholder="Enter location name"
              class="flex-grow p-1 outline-none"
            />
            <div @click="getLocation" class="cursor-pointer mx-2">
              <img
                src="../assets/images/current-location.svg"
                alt="current-location"
                width="24"
              />
            </div>
          </div>
          <button
            @click="searchLocation"
            class="my-3 px-4 py-2 bg-blue-500 rounded-xl text-white"
          >
            Search
          </button>
        </div>
        <div>
          <h3 class="text-2xl my-2">Google Maps</h3>
          <div id="map" style="height: 400px"></div>
        </div>
      </div>

      <div>
        <h3 class="text-2xl my-2">Searched Locations History</h3>
        <div class="overflow-x-auto" v-if="locationsHistory.length > 0">
          <div class="flex justify-end my-4">
            <div
              class="flex items-center gap-2 border px-3 py-2 rounded-xl cursor-pointer bg-red-200 hover:bg-red-100"
              @click="handleDelete"
            >
              <img src="../assets/images/trash.svg" alt="map-logo" width="24" />
              Delete
            </div>
          </div>
          <table class="min-w-full table-auto divide-y">
            <thead>
              <tr>
                <th class="py-4 px-2"></th>
                <th class="py-4 px-2 text-left">Location Name</th>
                <th class="py-4 px-2 text-right">Latitude</th>
                <th class="py-4 px-2 text-right">Longitude</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(location, index) in paginatedLocations"
                :key="index"
                :class="{ 'bg-gray-100': index % 2 === 0 }"
              >
                <td class="py-4 px-2">
                  <input
                    type="checkbox"
                    v-model="selectedIndices"
                    :value="location.latitude"
                  />
                </td>
                <td class="py-4 px-2">{{ location.name }}</td>
                <td class="py-4 px-2 text-right">{{ location.latitude }}</td>
                <td class="py-4 px-2 text-right">{{ location.longitude }}</td>
              </tr>
            </tbody>
          </table>

          <div class="flex justify-end items-center my-4">
            <div v-if="locationsHistory.length === 1">
              {{ locationsHistory.length }} location
            </div>
            <div v-else>
              {{ locationsHistory.length }} locations
            </div>
            <button
              @click="currentPage > 1 ? currentPage-- : null"
              class="px-3 py-2 rounded-md"
            >
              <img
                src="../assets/images/chevron-left.svg"
                alt="map-logo"
                width="24"
              />
            </button>
            <div class="flex items-center">
              <button
                v-for="page in totalPages"
                :key="page"
                @click="currentPage = page"
                :class="{
                  'bg-gray-100': currentPage === page,
                  'px-3 py-2 rounded-md cursor-pointer': true,
                }"
              >
                {{ page }}
              </button>
            </div>
            <button
              @click="currentPage < totalPages ? currentPage++ : null"
              class="px-3 py-2 rounded-md"
            >
              <img
                src="../assets/images/chevron-right.svg"
                alt="map-logo"
                width="24"
              />
            </button>
          </div>
        </div>
        <div
          v-else
          class="text-center my-8 md:my-28 flex mx-auto flex-col justify-center items-items gap-4 text-gray-700"
        >
          <img
            src="../assets/images/map.svg"
            alt="map-logo"
            width="70"
            class="mx-auto"
          />
          There are no recent searches.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useToast } from "vue-toastification";

const itemsPerPage = 10;
const currentPage = ref(1);

const totalPages = computed(() =>
  Math.ceil(locationsHistory.value.length / itemsPerPage)
);

const paginatedLocations = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return locationsHistory.value.slice(startIndex, endIndex);
});

const toast = useToast();
const searchQuery = ref("");
const locationData = ref({
  isSelected: {
    type: Boolean,
    required: true,
  },
  place: {
    type: String,
    required: true,
  },
  latitude: {
    type: String,
    requred: true,
  },
  longitude: {
    type: String,
    requred: true,
  },
});
const locationsHistory = ref([]);
const selectedIndices = ref([]);

const getLocation = () => {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      showMap(latitude, longitude);
    });
    toast.success("Successfully got current location");
  } else {
    toast.error("Geolocation is not supported by your browser");
  }
};

const searchLocation = () => {
  if (searchQuery.value.trim() === "") {
    toast.warning("Please enter a location.");
    return;
  }

  if (locationData.value) {
    showMap(locationData.value.latitude, locationData.value.longitude);
    locationsHistory.value.push({ ...locationData.value });
  }

  searchQuery.value = locationData.value.name;
  toast.success("Location added to search history.");
};

const showMap = (latitude, longitude) => {
  const mapOptions = {
    center: { lat: latitude, lng: longitude },
    zoom: 12,
  };

  const map = new window.google.maps.Map(
    document.getElementById("map"),
    mapOptions
  );

  // Add a marker for the current location
  new window.google.maps.Marker({
    position: { lat: latitude, lng: longitude },
    map: map,
    title: "Current Location",
  });

  // Add red markers for each searched location
  locationsHistory.value.forEach((location) => {
    new window.google.maps.Marker({
      position: { lat: parseFloat(location.latitude), lng: parseFloat(location.longitude) },
      map: map,
      title: location.name,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        fillColor: 'red',
        fillOpacity: 0.8,
        scale: 8,
        strokeColor: 'white',
        strokeWeight: 2,
      },
    });
  });
};


const handleDelete = () => {
  if (selectedIndices.value.length === 0) {
    toast.error('No selected item to be deleted.');
    return;
  }

  locationsHistory.value = locationsHistory.value.filter((location) => {
    return !selectedIndices.value.includes(location.latitude);
  });

  toast.success("Location has been deleted.");
  selectedIndices.value = [];
};

onMounted(() => {
  const autocomplete = new window.google.maps.places.Autocomplete(
    document.getElementById("locationInput")
  );

  // Show initial map of Toronto
  showMap(43.653226, -79.3831843);

  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    if (place.geometry) {
      const latitude = place.geometry.location.lat();
      const longitude = place.geometry.location.lng();

      locationData.value.name = place.name;
      locationData.value.latitude = latitude;
      locationData.value.longitude = longitude;
    }
  });
});
</script>
