import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { exec } from 'node:child_process';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createPost() {
    console.log('\x1b[36m%s\x1b[0m', '🖋️  새로운 블로그 글 생성을 시작합니다.');

    const title = await question('제목 (Title): ');
    const description = await question('요약 (Description): ');
    const category = await question('카테고리 (daily/medical/dev/misc) [daily]: ') || 'daily';
    const content = await question('본문 초기 내용 (생략 가능): ');

    if (!title) {
        console.error('\x1b[31m%s\x1b[0m', '❌ 제목은 필수입니다.');
        process.exit(1);
    }

    const slug = title
        .toLowerCase()
        .trim()
        .replace(/ /g, '-')
        .replace(/[^\w\s-\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uAC00-\uD7AF\uD7B0-\uD7FF]/g, '');

    const date = new Date().toISOString().split('T')[0];
    const fileName = `${slug || 'unnamed-post'}.md`;
    const filePath = path.join(process.cwd(), 'src', 'content', 'blog', fileName);

    const template = `---
title: "${title.replace(/"/g, '\\"')}"
description: "${description.replace(/"/g, '\\"')}"
pubDate: "${date}"
category: "${category}"
---

${content || '이곳에 내용을 작성하세요.'}
`;

    if (fs.existsSync(filePath)) {
        console.error('\x1b[31m%s\x1b[0m', `❌ 이미 존재하는 파일명입니다: ${fileName}`);
        process.exit(1);
    }

    fs.writeFileSync(filePath, template, 'utf8');
    console.log('\x1b[32m%s\x1b[0m', `✅ 파일이 성공적으로 생성되었습니다: ${fileName}`);
    console.log('\x1b[34m%s\x1b[0m', `경로: ${filePath}`);

    // 자동으로 VS Code에서 파일 열기
    exec(`code "${filePath}"`, (err) => {
        if (err) {
            console.log('\x1b[33m%s\x1b[0m', '💡 파일을 수동으로 열어주세요.');
        } else {
            console.log('\x1b[32m%s\x1b[0m', '🚀 VS Code에서 파일을 열었습니다. 바로 작성을 시작하세요!');
        }
        rl.close();
    });
}

createPost();
