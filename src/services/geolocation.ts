/**
 * Represents a geographical location with latitude and longitude coordinates.
 */
export interface Location {
  /**
   * The latitude of the location.
   */
  lat: number;
  /**
   * The longitude of the location.
   */
lng: number;
}

/**
 * Asynchronously retrieves the current GPS location.
 *
 * @returns A promise that resolves to a Location object containing latitude and longitude.
 */
export async function getCurrentLocation(): Promise<Location> {
  // TODO: Implement this by calling an API.

  return {
    lat: -23.5505,
    lng: -46.6333,
  };
}
