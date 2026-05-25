// React Native has WebSocket built-in globally. This shim replaces the
// Node.js `ws` package which @supabase/realtime-js conditionally requires
// but never actually uses in a React Native environment.
const WS = global.WebSocket;
module.exports = WS;
module.exports.WebSocket = WS;
