module.exports = function printRoutes(app) {
  const out = [];
  app._router.stack.forEach((m) => {
    if (m.name === 'router' && m.handle.stack) {
      m.handle.stack.forEach((h) => {
        if (h.route && h.route.path) {
          const methods = Object.keys(h.route.methods).map(x=>x.toUpperCase()).join(',');
          out.push(`${methods}  (mounted) ${h.route.path}`);
        }
      });
    } else if (m.route) {
      const methods = Object.keys(m.route.methods).map(x=>x.toUpperCase()).join(',');
      out.push(`${methods}  ${m.route.path}`);
    }
  });
  console.log('=== ROUTES ===\n' + out.join('\n'));
};
