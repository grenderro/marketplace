// server/services/tokenDiscovery.ts

class TokenDiscoveryService {
  private readonly DEX_APIS = {
    xexchange: 'https://api.xexchange.com',
    onedex: 'https://api.onedex.app',
    ashswap: 'https://api.ashswap.io',
    jexchange: 'https://api.jexchange.io',
    hatom: 'https://api.hatom.com',
  };

  private async fetchAllDexData(): Promise<any[]> {
    const [xexchange, onedex, ashswap, jexchange, hatom] = await Promise.all([
      this.fetchXExchangeTokens(),
      this.fetchOneDexTokens(),
      this.fetchAshSwapTokens(),
      this.fetchJExchangeTokens(),
      this.fetchHatomTokens(),
    ]);

    // Merge all DEX data
    return this.mergeDexData(xexchange, onedex, ashswap, jexchange, hatom);
  }

  private async fetchJExchangeTokens(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.DEX_APIS.jexchange}/tokens`, {
        timeout: 5000,
      });
      return response.data?.tokens || [];
    } catch (e) {
      return [];
    }
  }

  private async fetchHatomTokens(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.DEX_APIS.hatom}/markets`, {
        timeout: 5000,
      });
      // Hatom uses money market format, transform to standard
      return (response.data?.markets || []).map((m: any) => ({
        identifier: m.underlyingTokenId,
        liquidityUsd: m.totalSupplyUsd,
        volume24hUsd: m.totalBorrowsUsd * 0.1, // Estimate
      }));
    } catch (e) {
      return [];
    }
  }

  private mergeDexData(...dexArrays: any[][]): any[] {
    const tokenMap = new Map<string, any>();

    dexArrays.flat().forEach((token) => {
      const id = token.identifier || token.id || token.address;
      if (!id) return;

      const existing = tokenMap.get(id);
      if (!existing) {
        tokenMap.set(id, {
          ...token,
          sources: [token.source || 'unknown'],
        });
      } else {
        // Aggregate liquidity across all DEXs
        tokenMap.set(id, {
          ...token,
          liquidityUsd: (existing.liquidityUsd || 0) + (token.liquidityUsd || 0),
          volume24hUsd: (existing.volume24hUsd || 0) + (token.volume24hUsd || 0),
          sources: [...existing.sources, token.source || 'unknown'],
        });
      }
    });

    return Array.from(tokenMap.values());
  }
}
