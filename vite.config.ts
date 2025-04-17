import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';

import * as zlib from 'zlib';
import vue from '@vitejs/plugin-vue';
import autoprefixer from 'autoprefixer';
import purgecss from '@fullhuman/postcss-purgecss';
import vueJsx from '@vitejs/plugin-vue-jsx';
import vueDevTools from 'vite-plugin-vue-devtools';
import cssnano from 'cssnano';
import combineSelectors from 'postcss-combine-duplicated-selectors';
import dotenv from 'dotenv';

import { compression } from 'vite-plugin-compression2';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { createHtmlPlugin } from 'vite-plugin-html';
import injectPreload from 'unplugin-inject-preload/vite';

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

export default defineConfig(({ mode }) => {
    const isProduction = mode === 'production';
    const isTest = mode === 'test';

    const VITE_API_ENDPOINT = process.env.VITE_API_ENDPOINT;
    const VITE_BASE_URL = process.env.VITE_BASE_URL;

    return {
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
            },
        },

        server: {
            port: 5173,
            open: true,
            headers: {
                'Content-Security-Policy':
                    !isProduction || !isTest
                        ? `default-src 'self'; ` + // Not covered cases by CSP Default policy
                          `style-src 'self' 'unsafe-inline';` +
                          `font-src 'self';` +
                          `img-src 'self' data: ${VITE_API_ENDPOINT} ${VITE_BASE_URL} blob: ; ` + // img only from self and localhost:8000
                          `script-src 'self' 'nonce-random123' 'unsafe-inline'  ${VITE_BASE_URL}; ` + // script from self, nonce, inline e dev server
                          `object-src 'none' ;` +
                          `frame-src 'self'; ` +
                          `base-uri 'self';` +
                          `form-action 'self'; ` +
                          `frame-ancestors 'none'; ` +
                          `connect-src 'self' ${VITE_API_ENDPOINT};` +
                          `report-uri ${VITE_API_ENDPOINT}/api/csp-violation;`
                        : //prod
                          `default-src 'self'; ` +
                          `script-src 'nonce-random123' 'self' ${VITE_BASE_URL};` +
                          `style-src 'self'; ` +
                          `img-src 'self' data:  ${VITE_BASE_URL} ${VITE_API_ENDPOINT} blob: ; ` +
                          `font-src 'self'; ` +
                          `object-src 'none'; ` +
                          `frame-src 'self'; ` +
                          `base-uri 'self'; ` +
                          `form-action 'self'; ` +
                          `frame-ancestors 'none'; ` +
                          `connect-src 'self' ${VITE_BASE_URL} ${VITE_API_ENDPOINT}; ` +
                          `report-uri ${VITE_API_ENDPOINT}/api/csp-violation;`,
            },
        },

        plugins: [
            vue({
                template: {
                    compilerOptions: {
                        /**
                         * Ignore custom elements in templates
                         *  @see ImagePlaceholder.vue
                         * @param tag - The tag to check
                         * @returns {boolean} - Whether the tag is a custom element
                         */
                        isCustomElement: (tag): boolean => tag.startsWith('sodipodi:namedview'),
                    },
                },
            }),
            vueJsx(),
            vueDevTools(),

            injectPreload({
                files: [
                    {
                        // Preload SVG logo image
                        entryMatch: /logo\.svg$/,
                        outputMatch: /logo\.[a-z0-9]+\.svg$/,
                        attributes: {
                            as: 'image',
                            type: 'image/svg+xml',
                            fetchPriority: 'high',
                        },
                    },
                    {
                        // Prelaod font file
                        entryMatch: /OpenSans-VariableFont_wdth,wght\.ttf$/,
                        outputMatch: /OpenSans-VariableFont_wdth,wght\.[a-z0-9]+\.ttf$/,
                        attributes: {
                            type: 'font/ttf',
                            as: 'font',
                            crossorigin: 'anonymous',
                        },
                    },
                ],
                injectTo: 'head-prepend',
            }),

            ViteImageOptimizer({
                test: /\.(jpe?g|png|gif|tiff|webp|svg|avif)$/i,
                exclude: undefined,
                include: undefined,
                includePublic: true,
                logStats: true,
                ansiColors: true,
                svg: {
                    multipass: true,
                    plugins: [
                        {
                            name: 'preset-default',
                            params: {
                                overrides: {
                                    cleanupNumericValues: false,
                                    removeViewBox: false,
                                    cleanupIds: {
                                        minify: false,
                                        remove: false,
                                    },
                                    convertPathData: false,
                                },
                            },
                        },
                        'sortAttrs',
                        {
                            name: 'addAttributesToSVGElement',
                            params: {
                                attributes: [{ xmlns: 'http://www.w3.org/2000/svg' }],
                            },
                        },
                    ],
                },
                png: {
                    quality: 100,
                },
                jpeg: {
                    quality: 100,
                },
                jpg: {
                    quality: 100,
                },
                tiff: {
                    quality: 100,
                },
                gif: {},
                webp: {
                    lossless: true,
                },
                avif: {
                    lossless: true,
                },
                cache: false,
                cacheLocation: undefined,
            }),

            createHtmlPlugin({
                minify: true,
            }),

            compression({
                include: /\.(html|xml|css|json|js|mjs|svg|yaml|yml|toml)$/,
                exclude: [],
                threshold: 10240,
                algorithm: 'brotliCompress',
                skipIfLargerOrEqual: true,
                deleteOriginalAssets: false,
                compressionOptions: {
                    params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 },
                },
            }),

            compression({
                include: /\.(html|xml|css|json|js|mjs|svg|yaml|yml|toml)$/,
                threshold: 10240,
                algorithm: 'gzip',
                skipIfLargerOrEqual: true,
                deleteOriginalAssets: false,
                compressionOptions: {
                    level: 9,
                },
            }),
        ],
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: "@use '@/styles/global.scss' as *;",
                },
            },
            postcss: {
                plugins: [
                    combineSelectors({ removeDuplicatedProperties: true }),
                    purgecss({
                        content: [
                            './public/**/*.html',
                            './src/**/*.vue',
                            './src/**/*.ts',
                            './src/styles/*.scss',
                        ],
                        safelist: {
                            standard: [/^v-/, /^el-/],
                        },
                        defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
                    }),
                    autoprefixer({
                        overrideBrowserslist: ['last 4 versions', 'not dead'],
                    }),
                    cssnano({ preset: 'default' }),
                ].filter(Boolean),
            },
        },

        build: {
            minify: 'terser',
            terserOptions: {
                compress: {
                    drop_console: true,
                    drop_debugger: true,
                    pure_funcs: ['console.info', 'console.debug', 'console.warn'],
                    passes: 4,
                },
                mangle: {
                    toplevel: true,
                },
                output: {
                    comments: false,
                    beautify: false,
                    max_line_len: 80,
                },
                keep_fnames: false,
                keep_classnames: false,
            },

            rollupOptions: {
                output: {
                    manualChunks(id) {
                        if (id.includes('node_modules')) {
                            if (id.includes('vue') || id.includes('pinia')) {
                                return 'vue-vendor';
                            }

                            if (id.includes('axios')) {
                                return 'axios-vendor';
                            }

                            // External libraries
                            if (id.includes('vue-draggable') || id.includes('vue-multiselect')) {
                                return 'extra-vendor';
                            }

                            // Remove unused empty libraries
                            const ignoredModules = ['birpc', 'hookable', 'perfect-debounce'];
                            const match = id.match(/node_modules\/([^\/]*)\//);
                            const moduleName = match ? match[1] : null;

                            if (moduleName && ignoredModules.includes(moduleName)) {
                                return null;
                            }

                            return moduleName ? `vendor-${moduleName}` : null;
                        }

                        return null;
                    },

                    chunkFileNames: 'static/js/[name]-[hash].js',
                    entryFileNames: 'static/js/[name]-[hash].js',
                    assetFileNames: 'static/assets/[name].[ext]',
                },
            },
            sourcemap: false,
            assetsInlineLimit: 4096,
            brotliSize: true,
            reportCompressedSize: true,
        },
    };
});
