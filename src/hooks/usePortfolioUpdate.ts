import { useState } from 'react';
import type { UpdatePortfolioInput } from '@/types/resume-parser';

export function usePortfolioUpdate() {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePortfolio = async (
    portfolioId: string,
    input: UpdatePortfolioInput
  ) => {
    setUpdating(true);
    setError(null);

    try {
      const query = `
        mutation UpdatePortfolio($id: ID!, $input: PortfolioUpdateInput!) {
          updatePortfolio(id: $id, input: $input) {
            success
            errors
            portfolio {
              id
              first_name
              last_name
              email
              phone
              current_title
              city
              state
              country
            }
          }
        }
      `;

      const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'https://letsmakecv.tulip-software.com/graphql';
      
      const response = await fetch(
        graphqlUrl,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          },
          body: JSON.stringify({
            query,
            variables: { id: portfolioId, input },
          }),
        }
      );

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      if (!result.data.updatePortfolio.success) {
        throw new Error(
          result.data.updatePortfolio.errors?.[0] || 'Update failed'
        );
      }

      return result.data.updatePortfolio.portfolio;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  return { updating, error, updatePortfolio };
}
