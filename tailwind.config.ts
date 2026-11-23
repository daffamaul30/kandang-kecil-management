import type { Config } from 'tailwindcss';
export default { content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'], theme: { extend: { colors: { brand: { 50:'#fff5ed',100:'#ffe6d2',300:'#efaa7b',500:'#c66b3d',600:'#ad542d',700:'#8d4024',900:'#49251a' }, warm: '#faf7f2' }, boxShadow: { soft: '0 8px 30px rgba(90,50,30,.07)' } } }, plugins: [] } satisfies Config;
