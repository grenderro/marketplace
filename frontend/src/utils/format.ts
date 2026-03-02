export const formatAmount = (amount: string, decimals = 18) => {
  return (parseInt(amount) / 10 ** decimals).toFixed(4);
};

export const formatDate = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleDateString();
};
