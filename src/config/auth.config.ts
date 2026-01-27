export default () => ({
  MAX_SESSIONS: parseInt(process.env.MAX_SESSIONS || '5', 10),
  ACCESS_TTL_MIN: 15,
  REFRESH_TTL_DAYS: 30,
})
