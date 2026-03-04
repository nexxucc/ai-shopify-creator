const express = require('express');
const https = require('https');

module.exports = function () {
    const router = express.Router();

    const domain = process.env.SHOPIFY_STORE_DOMAIN;
    const token = process.env.SHOPIFY_ACCESS_TOKEN;
    const headers = { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' };

    function shopifyGet(path) {
        return new Promise((resolve, reject) => {
            https.get({ hostname: domain, path, headers }, r => {
                let b = '';
                r.on('data', c => b += c);
                r.on('end', () => { try { resolve(JSON.parse(b)); } catch (e) { reject(e); } });
            }).on('error', reject);
        });
    }

    function shopifyPut(path, body) {
        return new Promise((resolve, reject) => {
            const data = JSON.stringify(body);
            const req = https.request({
                hostname: domain, path, method: 'PUT', headers: { ...headers, 'Content-Length': Buffer.byteLength(data) }
            }, r => {
                let b = '';
                r.on('data', c => b += c);
                r.on('end', () => { try { resolve(JSON.parse(b)); } catch (e) { resolve({ status: r.statusCode }); } });
            });
            req.on('error', reject);
            req.write(data);
            req.end();
        });
    }

    // POST /api/theme/customize
    router.post('/customize', async (req, res, next) => {
        try {
            const { storeName, tagline, colors, font, collections, brandVoice } = req.body;

            console.log('🎨 Customizing theme for:', storeName);

            // 1. Get active theme
            const themesResp = await shopifyGet('/admin/api/2024-01/themes.json');
            const mainTheme = themesResp.themes.find(t => t.role === 'main');

            if (!mainTheme) {
                return res.status(404).json({ error: 'No active theme found' });
            }

            const themeId = mainTheme.id;
            console.log('  Theme:', mainTheme.name, '(ID:', themeId, ')');

            // 2. Update theme settings (colors, fonts)
            try {
                const settingsResp = await shopifyGet(
                    `/admin/api/2024-01/themes/${themeId}/assets.json?asset[key]=config/settings_data.json`
                );

                const settings = JSON.parse(settingsResp.asset.value);
                const current = settings.current || {};

                // Apply AI-generated colors
                if (colors) {
                    if (colors.primary) current.colors_accent_1 = colors.primary;
                    if (colors.secondary) current.colors_accent_2 = colors.secondary;
                    if (colors.accent) current.colors_accent_2 = colors.accent;
                }

                settings.current = current;

                await shopifyPut(`/admin/api/2024-01/themes/${themeId}/assets.json`, {
                    asset: { key: 'config/settings_data.json', value: JSON.stringify(settings) }
                });
                console.log('  ✅ Colors updated');
            } catch (e) {
                console.warn('  ⚠️ Settings update failed:', e.message);
            }

            // 3. Customize homepage template
            try {
                // Get current template
                let indexTemplate;
                try {
                    const templateResp = await shopifyGet(
                        `/admin/api/2024-01/themes/${themeId}/assets.json?asset[key]=templates/index.json`
                    );
                    indexTemplate = JSON.parse(templateResp.asset.value);
                } catch (e) {
                    indexTemplate = { sections: {}, order: [] };
                }

                // Build custom homepage
                const firstCollection = (collections && collections[0]) ? collections[0].name : 'All Products';

                const newTemplate = {
                    sections: {
                        "hero": {
                            "type": "image-banner",
                            "settings": {
                                "image_overlay_opacity": 40,
                                "image_height": "medium",
                                "desktop_content_position": "middle-center",
                                "show_text_box": true,
                                "desktop_content_alignment": "center",
                                "color_scheme": "scheme-1",
                                "mobile_content_alignment": "center"
                            },
                            "blocks": {
                                "heading": {
                                    "type": "heading",
                                    "settings": {
                                        "heading": storeName || "Welcome to Our Store",
                                        "heading_size": "h0"
                                    }
                                },
                                "text": {
                                    "type": "text",
                                    "settings": {
                                        "text": tagline || "Discover our curated collection",
                                        "text_style": "subtitle"
                                    }
                                },
                                "button": {
                                    "type": "buttons",
                                    "settings": {
                                        "button_label_1": "Shop Now",
                                        "button_link_1": "/collections/all",
                                        "button_style_secondary_1": false,
                                        "button_label_2": "",
                                        "button_link_2": ""
                                    }
                                }
                            },
                            "block_order": ["heading", "text", "button"]
                        },
                        "featured-collection": {
                            "type": "featured-collection",
                            "settings": {
                                "title": "Featured Products",
                                "heading_size": "h2",
                                "collection": "",
                                "products_to_show": 8,
                                "columns_desktop": 4,
                                "show_secondary_image": true,
                                "show_vendor": false,
                                "show_rating": false,
                                "columns_mobile": "2",
                                "color_scheme": "scheme-1",
                                "image_ratio": "portrait"
                            }
                        },
                        "collection-list": {
                            "type": "collection-list",
                            "settings": {
                                "title": "Our Collections",
                                "heading_size": "h2",
                                "image_ratio": "square",
                                "columns_desktop": 3,
                                "color_scheme": "scheme-1",
                                "columns_mobile": "1"
                            },
                            "blocks": {}
                        },
                        "rich-text": {
                            "type": "rich-text",
                            "settings": {
                                "desktop_content_position": "center",
                                "color_scheme": "scheme-1"
                            },
                            "blocks": {
                                "heading": {
                                    "type": "heading",
                                    "settings": {
                                        "heading": `Why Choose ${storeName || 'Us'}?`,
                                        "heading_size": "h2"
                                    }
                                },
                                "text": {
                                    "type": "text",
                                    "settings": {
                                        "text": `<p>${tagline || 'We bring you the finest products, curated with care.'}</p>`
                                    }
                                }
                            },
                            "block_order": ["heading", "text"]
                        }
                    },
                    order: ["hero", "featured-collection", "collection-list", "rich-text"]
                };

                await shopifyPut(`/admin/api/2024-01/themes/${themeId}/assets.json`, {
                    asset: { key: 'templates/index.json', value: JSON.stringify(newTemplate) }
                });
                console.log('  ✅ Homepage customized');
            } catch (e) {
                console.warn('  ⚠️ Homepage update failed:', e.message);
            }

            res.json({
                success: true,
                themeId,
                message: 'Theme customized successfully'
            });

        } catch (err) {
            next(err);
        }
    });

    return router;
};
