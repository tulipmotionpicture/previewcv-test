
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error('Missing NEXT_PUBLIC_API_URL environment variable');
}

/**
 * API route to get transformed resume data for GraphQL.
 * This route acts as a secure proxy to the backend service.
 * It retrieves the resume_id associated with the permanent_token
 * and then fetches the transformed data.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token: permanentToken } = await params;

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

    // Step 2: Fetch the transformed data using the resume_id
    const transformResponse = await fetch(`${API_URL}/pdf-resumes/${resumeId}/transform-for-graphql`, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    if (!transformResponse.ok) {
      const errorData = await transformResponse.json();
      return NextResponse.json(
        { error: 'Failed to fetch transformed data', details: errorData.detail },
        { status: transformResponse.status }
      );
    }

    const transformedData = await transformResponse.json();

    return NextResponse.json(transformedData);

  } catch (error) {
    console.error('Error in transform-for-graphql proxy:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred' },
      { status: 500 }
    );
  }
}
