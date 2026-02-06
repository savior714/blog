import { config, fields, collection } from '@keystatic/core';

export default config({
    storage: {
        kind: 'local',
    },
    collections: {
        blog: collection({
            label: 'Blog Posts',
            slugField: 'title',
            path: 'src/content/blog/*',
            format: { contentField: 'content' },
            schema: {
                title: fields.slug({ name: { label: 'Title' } }),
                description: fields.text({ label: 'Description', multiline: true }),
                pubDate: fields.date({ label: 'Publication Date' }),
                category: fields.select({
                    label: 'Category',
                    options: [
                        { label: 'Daily', value: 'daily' },
                        { label: 'Medical', value: 'medical' },
                        { label: 'Dev', value: 'dev' },
                        { label: 'Misc', value: 'misc' },
                    ],
                    defaultValue: 'daily',
                }),
                heroImage: fields.image({
                    label: 'Hero Image',
                    directory: 'src/assets/blog/',
                    publicPath: '../../assets/blog/',
                }),
                content: fields.markdoc({
                    label: 'Content',
                }),
            },
        }),
    },
});
