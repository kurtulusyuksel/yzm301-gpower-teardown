import fs from 'node:fs';
import {createHash} from 'node:crypto';
const raw=fs.readFileSync('evidence/rea-doctor-submission.json');
const report=JSON.parse(raw.toString('utf8').replace(/^\uFEFF/,''));
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
fs.writeFileSync('evidence/rea-health.html',`<!doctype html><meta charset="utf-8"><title>REA Ghidra verification report</title>
<style>body{background:#101722;color:#edf2f7;font:20px system-ui;padding:32px;max-width:1150px}h1{color:#69dfc2}td{padding:6px 18px;border-bottom:1px solid #334155}code{font-size:14px;overflow-wrap:anywhere}small{color:#aeb8c7}</style>
<h1>REA / Ghidra verification report</h1><p>Question: Are REA and the Ghidra provider available for the selected G*Power binary?</p>
<p><strong>Recorded result: healthy = ${escape(report.healthy)}</strong></p><p>Scope: Ghidra provider + existing Antigravity agent registration + selected binary.</p>
<table>${report.scope_checks.map(c=>`<tr><td>${escape(c.name)}</td><td>${c.ok?'PASS':'FAIL'}</td></tr>`).join('')}</table>
<p><small>This page displays actual REA doctor output; it is not a screenshot of an agent conversation. Other optional providers are outside this scope.</small></p>
<p>Source: evidence/rea-doctor-submission.json<br><code>SHA-256: ${createHash('sha256').update(raw).digest('hex')}</code></p>`);
console.log('Wrote actual REA health report page.');
