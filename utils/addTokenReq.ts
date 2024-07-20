export const addTokenToHeaders = (token: string) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
})
