import { config, fields, collection } from '@keystatic/core';

export default config({
    storage: {
        kind: 'local',
    },
    collections: {
        posts: collection({
            label: 'Posts',
            slugField: 'title',
            path: 'src/content/blog/*',
            format: { contentField: 'content' },
            schema: {
                title: fields.slug({ name: { label: 'Title' } }),
                description: fields.text({ label: 'Description' }),
                pubDate: fields.date({ label: 'Published Date' }),
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
                content: fields.markdoc({
                    label: 'Content',
                }),
            },
        }),
    },
});
