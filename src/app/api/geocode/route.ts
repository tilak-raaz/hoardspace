import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const type = searchParams.get('type'); // 'pincode' or 'coordinates'
        const pincode = searchParams.get('pincode');
        const lat = searchParams.get('lat');
        const lng = searchParams.get('lng');

        // Use dedicated server-side API key (unrestricted or IP-restricted)
        const apiKey = process.env.GOOGLE_MAPS_SERVER_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: 'Server Google Maps API key (GOOGLE_MAPS_SERVER_API_KEY) not configured' },
                { status: 500 }
            );
        }

        let url = '';

        if (type === 'pincode' && pincode) {
            url = `https://maps.googleapis.com/maps/api/geocode/json?address=${pincode},India&key=${apiKey}`;
        } else if (type === 'coordinates' && lat && lng) {
            url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
        } else {
            return NextResponse.json(
                { error: 'Invalid parameters' },
                { status: 400 }
            );
        }

        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== 'OK') {
            console.error('Geocoding API error:', data);
            return NextResponse.json(
                {
                    error: data.error_message || `Geocoding failed: ${data.status}`,
                    status: data.status
                },
                { status: 400 }
            );
        }

        if (data.results.length === 0) {
            return NextResponse.json({ error: 'No results found' }, { status: 404 });
        }

        const result = data.results[0];
        const components = result.address_components;

        const location: any = {
            address: result.formatted_address,
        };

        if (lat && lng) {
            location.lat = parseFloat(lat);
            location.lng = parseFloat(lng);
        } else if (result.geometry?.location) {
            location.lat = result.geometry.location.lat;
            location.lng = result.geometry.location.lng;
        }

        // Extract location details
        components.forEach((component: any) => {
            const types = component.types;

            if (types.includes('locality') || types.includes('postal_town')) {
                location.city = component.long_name;
            }

            if (types.includes('administrative_area_level_1')) {
                location.state = component.long_name;
            }

            if (types.includes('sublocality') || types.includes('sublocality_level_1')) {
                location.area = component.long_name;
            }

            if (types.includes('postal_code')) {
                location.zipCode = component.long_name;
            }
        });

        // If no area found, try sublocality_level_2 or neighborhood
        if (!location.area) {
            components.forEach((component: any) => {
                const types = component.types;
                if (types.includes('sublocality_level_2') || types.includes('neighborhood')) {
                    location.area = component.long_name;
                }
            });
        }

        return NextResponse.json(location);
    } catch (error) {
        console.error('Geocoding API route error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
