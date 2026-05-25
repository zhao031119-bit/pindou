module.exports = async () => {
  const react = (await import('@vitejs/plugin-react')).default;

  return {
    appType: 'spa',
    plugins: [react()],
    server: {
      host: '0.0.0.0'
    },
    preview: {
      host: '0.0.0.0'
    }
  };
};
