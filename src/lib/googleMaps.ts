/**
 * Google Maps and Geocoding utility functions
 * Requires NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in environment variables
 */

interface GeocodeResult {
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    area?: string;
    lat?: number;
    lng?: number;
}

/**
 * Get location details from pincode using Google Geocoding API
 * @param pincode - Indian postal code
 * @returns Location details (city, state, etc.)
 */
export async function getLocationFromPincode(pincode: string): Promise<GeocodeResult> {
    try {
        const response = await fetch(`/api/geocode?type=pincode&pincode=${pincode}`);
        const data = await response.json();

        if (!response.ok) {
            console.error('Pincode geocoding error:', data);
            return {};
        }

        return data;
    } catch (error) {
        console.error('Pincode geocoding error:', error);
        return {};
    }
}

/**
 * Get address details from latitude/longitude using Reverse Geocoding
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns Complete address details
 */
export async function getAddressFromCoordinates(lat: number, lng: number): Promise<GeocodeResult> {
    try {
        const response = await fetch(`/api/geocode?type=coordinates&lat=${lat}&lng=${lng}`);
        const data = await response.json();

        if (!response.ok) {
            console.error('Reverse geocoding error:', data);
            return {};
        }

        return data;
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        return {};
    }
}

/**
 * Validate if pincode is likely an Indian pincode
 * @param pincode - Postal code to validate
 */
export function isValidIndianPincode(pincode: string): boolean {
    return /^[1-9][0-9]{5}$/.test(pincode);
}
