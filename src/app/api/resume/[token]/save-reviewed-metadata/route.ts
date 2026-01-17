import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
    throw new Error('Missing NEXT_PUBLIC_API_URL environment variable');
}

/**
 * API route to save reviewed resume metadata.
 * This route acts as a secure proxy to the backend service.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token: permanentToken } = await params;
    const body = await request.json();

    if (!permanentToken) {
      return NextResponse.json(
        { error: 'Permanent token is required' },
        { status: 400 }
      );
    }

    const headersList = await headers();
    const authHeader = headersList.get('authorization');

    if (!authHeader) {
        return NextResponse.json({ error: 'Authorization header is missing' }, { status: 401 });
    }

    // Step 1: Get the resume details to find the resume_id
    const resumeDetailsResponse = await fetch(`${API_URL}/pdf-resumes/details-by-token/${permanentToken}`, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    if (!resumeDetailsResponse.ok) {
      const errorData = await resumeDetailsResponse.json();
      return NextResponse.json(
        { error: 'Failed to retrieve resume details', details: errorData.detail },
        { status: resumeDetailsResponse.status }
      );
    }

    const resumeDetails = await resumeDetailsResponse.json();
    const resumeId = resumeDetails.resume_id;

    if (!resumeId) {
      return NextResponse.json(
        { error: 'Could not determine resume ID from token' },
        { status: 404 }
      );
    }

    // Step 2: Forward the request to the save-reviewed-metadata endpoint
    const saveResponse = await fetch(`${API_URL}/pdf-resumes/${resumeId}/save-reviewed-metadata`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!saveResponse.ok) {
      const errorData = await saveResponse.json();
      return NextResponse.json(
        { error: 'Failed to save reviewed metadata', details: errorData.detail },
        { status: saveResponse.status }
      );
    }

    const saveData = await saveResponse.json();

    return NextResponse.json(saveData);

  } catch (error) {
    console.error('Error in save-reviewed-metadata proxy:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred' },
      { status: 500 }
    );
  }
}
