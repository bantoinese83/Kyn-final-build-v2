// Weather service with OpenWeather Maps API integration
// Implements real-time weather data with caching and error handling

import { logServiceError } from "../lib/logger";

// OpenWeather Maps API configuration
const OPENWEATHER_API_KEY =
  import.meta.env.VITE_OPENWEATHER_API_KEY || "your-api-key-here";
const OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5";
const DEFAULT_LOCATION = "Ocean City, MD";

// Weather data interface matching OpenWeather Maps response format
export interface WeatherData {
  temperature: number; // Current temperature in Celsius
  temperatureF: number; // Current temperature in Fahrenheit
  condition: string; // Weather condition description
  location: string; // City name
  high: number; // High temperature in Celsius
  highF: number; // High temperature in Fahrenheit
  low: number; // Low temperature in Celsius
  lowF: number; // Low temperature in Fahrenheit
  icon: string; // Weather icon code
  humidity: number; // Humidity percentage
  windSpeed: number; // Wind speed in m/s
  pressure: number; // Atmospheric pressure in hPa
  visibility: number; // Visibility in meters
  sunrise: string; // Sunrise time
  sunset: string; // Sunset time
  lastUpdated: string; // Last update timestamp
}

// OpenWeather Maps API response interface
interface OpenWeatherResponse {
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  wind: {
    speed: number;
    deg: number;
  };
  visibility: number;
  sys: {
    sunrise: number;
    sunset: number;
  };
  name: string;
  dt: number;
}

// Family quote interface
export interface FamilyQuote {
  text: string;
  author?: string;
}

// Cache configuration
const weatherCache = new Map<
  string,
  { data: WeatherData; timestamp: number }
>();
const CACHE_EXPIRATION = 30 * 60 * 1000; // 30 minutes

// Family quotes for daily inspiration
const familyQuotes: FamilyQuote[] = [
  {
    text: "Family is one of nature's masterpieces.",
    author: "George Santayana",
  },
  {
    text: "The love of family and the admiration of friends is much more important than wealth and privilege.",
    author: "Charles Kuralt",
  },
  {
    text: "Family is not an important thing, it's everything.",
    author: "Michael J. Fox",
  },
  {
    text: "In every conceivable manner, the family is link to our past, bridge to our future.",
    author: "Alex Haley",
  },
  {
    text: "Family means nobody gets left behind or forgotten.",
    author: "David Ogden Stiers",
  },
  {
    text: "The memories we make with our family is everything.",
    author: "Candace Cameron Bure",
  },
  { text: "Together is our favorite place to be.", author: "Unknown" },
  { text: "Family: where life begins and love never ends.", author: "Unknown" },
  {
    text: "The family is the test of freedom; because the family is the only thing that the free man makes for himself and by himself.",
    author: "G.K. Chesterton",
  },
  {
    text: "A happy family is but an earlier heaven.",
    author: "George Bernard Shaw",
  },
];

// Convert Kelvin to Celsius
function kelvinToCelsius(kelvin: number): number {
  return Math.round(kelvin - 273.15);
}

// Convert Celsius to Fahrenheit
function celsiusToFahrenheit(celsius: number): number {
  return Math.round((celsius * 9) / 5 + 32);
}

// Convert Kelvin to Fahrenheit
function kelvinToFahrenheit(kelvin: number): number {
  return celsiusToFahrenheit(kelvinToCelsius(kelvin));
}

// Format timestamp to readable time
function formatTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// Get weather icon based on OpenWeather icon code
function getWeatherIcon(iconCode: string): string {
  const iconMap: Record<string, string> = {
    "01d": "sun", // Clear sky day
    "01n": "moon", // Clear sky night
    "02d": "cloud-sun", // Few clouds day
    "02n": "cloud-moon", // Few clouds night
    "03d": "cloud", // Scattered clouds
    "03n": "cloud",
    "04d": "clouds", // Broken clouds
    "04n": "clouds",
    "09d": "cloud-rain", // Shower rain
    "09n": "cloud-rain",
    "10d": "cloud-rain", // Rain day
    "10n": "cloud-rain", // Rain night
    "11d": "cloud-lightning", // Thunderstorm day
    "11n": "cloud-lightning", // Thunderstorm night
    "13d": "snowflake", // Snow day
    "13n": "snowflake", // Snow night
    "50d": "cloud-fog", // Mist day
    "50n": "cloud-fog", // Mist night
  };

  return iconMap[iconCode] || "cloud";
}

// Fetch weather data from OpenWeather Maps API
async function fetchWeatherFromAPI(location: string): Promise<WeatherData> {
  try {
    const url = `${OPENWEATHER_BASE_URL}/weather?q=${encodeURIComponent(location)}&appid=${OPENWEATHER_API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error(
          "Invalid API key. Please check your OpenWeather Maps API key.",
        );
      } else if (response.status === 404) {
        throw new Error(
          `Location "${location}" not found. Please check the spelling.`,
        );
      } else if (response.status === 429) {
        throw new Error("API rate limit exceeded. Please try again later.");
      } else {
        throw new Error(
          `Weather API error: ${response.status} ${response.statusText}`,
        );
      }
    }

    const data: OpenWeatherResponse = await response.json();

    // Transform OpenWeather response to our WeatherData format
    const weatherData: WeatherData = {
      temperature: kelvinToCelsius(data.main.temp),
      temperatureF: kelvinToFahrenheit(data.main.temp),
      condition: data.weather[0]?.description || "Unknown",
      location: data.name,
      high: kelvinToCelsius(data.main.temp_max),
      highF: kelvinToFahrenheit(data.main.temp_max),
      low: kelvinToCelsius(data.main.temp_min),
      lowF: kelvinToFahrenheit(data.main.temp_min),
      icon: getWeatherIcon(data.weather[0]?.icon || "01d"),
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      pressure: data.main.pressure,
      visibility: data.visibility,
      sunrise: formatTime(data.sys.sunrise),
      sunset: formatTime(data.sys.sunset),
      lastUpdated: new Date(data.dt * 1000).toLocaleString("en-US"),
    };

    return weatherData;
  } catch (error) {
    logServiceError("WeatherService", "fetchWeatherFromAPI", error as Error, {
      location,
    });
    throw error;
  }
}

// Get weather data with caching
export async function getWeatherData(location?: string): Promise<WeatherData> {
  try {
    const userLocation =
      location || localStorage.getItem("userLocation") || DEFAULT_LOCATION;
    const cacheKey = userLocation.toLowerCase();

    // Check cache first
    const cachedData = weatherCache.get(cacheKey);
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_EXPIRATION) {
      console.log("Returning cached weather data for:", userLocation);
      return cachedData.data;
    }

    // Fetch fresh data from API
    console.log("Fetching fresh weather data for:", userLocation);
    const weatherData = await fetchWeatherFromAPI(userLocation);

    // Update cache
    weatherCache.set(cacheKey, {
      data: weatherData,
      timestamp: Date.now(),
    });

    return weatherData;
  } catch (error) {
    // If API fails, try to return cached data even if expired
    const userLocation =
      location || localStorage.getItem("userLocation") || DEFAULT_LOCATION;
    const cacheKey = userLocation.toLowerCase();
    const cachedData = weatherCache.get(cacheKey);

    if (cachedData) {
      console.warn(
        "API failed, returning expired cached data for:",
        userLocation,
      );
      return cachedData.data;
    }

    // If no cached data available, throw the error
    throw error;
  }
}

// Get daily family quote
export function getDailyFamilyQuote(): FamilyQuote {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
      86400000,
  );
  const quoteIndex = dayOfYear % familyQuotes.length;

  return familyQuotes[quoteIndex];
}

// Update user location
export function updateUserLocation(location: string): void {
  localStorage.setItem("userLocation", location);

  // Clear cache for old location to force fresh data
  const oldLocation = localStorage.getItem("userLocation");
  if (oldLocation && oldLocation !== location) {
    weatherCache.delete(oldLocation.toLowerCase());
  }
}

// Clear weather cache (useful for testing or manual refresh)
export function clearWeatherCache(): void {
  weatherCache.clear();
  console.log("Weather cache cleared");
}

// Get cache status for debugging
export function getCacheStatus(): { size: number; locations: string[] } {
  return {
    size: weatherCache.size,
    locations: Array.from(weatherCache.keys()),
  };
}
