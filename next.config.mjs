/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove the output: 'export' line if you want to use API routes and server-side features
  // output: 'export',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   output: 'export',
//   basePath: '/foodventory',
//   assetPrefix: '/foodventory/',
//   images: {
//     unoptimized: true,
//   },
// };

// export default nextConfig;