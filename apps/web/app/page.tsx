"use client";

import { useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { analyseMatch } from "@analyser/matching-engine";

const sampleResume = `MAYA PATEL\nSenior Frontend Engineer · 6 years experience\n\nSUMMARY\nProduct-minded engineer building accessible, high-performance web experiences. I enjoy turning complex problems into simple products and collaborating closely with design and product teams.\n\nEXPERIENCE\nSenior Frontend Engineer · Northstar Labs · 2022–Present\n• Led a cross-functional team of 5 to ship a redesigned customer dashboard in React and TypeScript, increasing activation by 18%.\n• Built a reusable design system with accessible components, responsive layouts, and automated visual checks.\n• Improved Core Web Vitals by 35% through code splitting, caching, and performance monitoring.\n• Partnered with product managers on roadmapping, user research, and A/B testing.\n\nFrontend Engineer · Fieldnote · 2019–2022\n• Developed Next.js applications backed by REST APIs and GraphQL services.\n• Introduced CI/CD workflows and collaborated with backend engineers using Node.js and PostgreSQL.\n\nSKILLS\nReact · TypeScript · JavaScript · Next.js · HTML · CSS · Accessibility · Figma · Agile · Mentoring · Analytics · AWS`;

const sampleJob = `Senior Product Engineer, Web Platform\n\nWe are looking for a product-minded engineer to help build the next generation of our customer platform. You will work with design, product, and backend teams to deliver fast, reliable experiences to millions of users.\n\nWhat you'll do\n• Build and maintain accessible, responsive web applications using React, TypeScript, and Next.js.\n• Design reusable components and evolve our design system.\n• Improve performance and reliability through monitoring, testing, and thoughtful architecture.\n• Collaborate with product managers on user research, roadmapping, and experimentation.\n• Mentor engineers and contribute to a healthy, inclusive team culture.\n\nWhat we're looking for\n• 5+ years building production web applications.\n• Strong experience with React, TypeScript, JavaScript, HTML, and CSS.\n• Familiarity with REST APIs, GraphQL, Node.js, and PostgreSQL.\n• Experience with accessibility, CI/CD, AWS, and performance optimization.\n• Clear communication and a track record of cross-functional collaboration.\n• Bonus: experience with analytics, A/B testing, and design tools like Figma.`;

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const paths: Record<string, ReactNode> = {
    spark: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z"/><path d="m19 14 1 2.5 2.5 1-2.5 1L19 21l-1-2.5-2.5-1 2.5-1L19 14Z"/></>,
    file: <><path d="M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10z"/><path d="M13 3v7h7M8 14h8M8 17h6"/></>,
    briefcase: <><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2"/></>,
    arrow: <><path d="M7 17 17 7M7 7h10v10"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    upload: <><path d="M12 16V4m-4 4 4-4 4 4"/><path d="M20 16.5v2A1.5 1.5 0 0 1 18.5 20h-13A1.5 1.5 0 0 1 4 18.5v-2"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

export default function Home() {
  const [resume, setResume] = useState(sampleResume);
  const [job, setJob] = useState(sampleJob);
  const [submittedResume, setSubmittedResume] = useState(sampleResume);
  const [submittedJob, setSubmittedJob] = useState(sampleJob);
  const [analysed, setAnalysed] = useState(true);
  const [activeTab, setActiveTab] = useState("Overview");
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState("");
  const [isReadingFile, setIsReadingFile] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const result = useMemo(() => analyseMatch(submittedResume, submittedJob), [submittedResume, submittedJob]);
  const scoreColor = result.score >= 70 ? "#208768" : result.score >= 45 ? "#b27b23" : "#cb615d";

  function handleFile(file?: File) {
    if (!file) return;
    setFileError("");
    const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
    const isText = file.type.startsWith("text/") || /\.(txt|md)$/i.test(file.name);
    if (!isPdf && !isText) {
      setFileError("Choose a PDF, TXT, or MD file.");
      setIsReadingFile(false);
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setFileError("Choose a file smaller than 15 MB.");
      return;
    }
    setFileName(file.name);
    setIsReadingFile(true);
    if (isPdf) {
      void extractPdfText(file).then((text) => {
        if (!text.trim()) setFileError("No selectable text found. Scanned PDFs need OCR; you can paste the résumé text instead.");
        else { setResume(text); setAnalysed(false); }
      }).catch(() => setFileError("Couldn’t read this PDF. Try another PDF or paste the résumé text."))
        .finally(() => setIsReadingFile(false));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => { setResume(String(reader.result ?? "")); setAnalysed(false); setIsReadingFile(false); };
    reader.onerror = () => { setFileError("Couldn’t read this file."); setIsReadingFile(false); };
    reader.readAsText(file);
  }

  async function extractPdfText(file: File) {
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.mjs", import.meta.url).toString();
    const loadingTask = pdfjs.getDocument({ data: await file.arrayBuffer() });
    const pdf = await loadingTask.promise;
    const pages: string[] = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      pages.push(content.items.map((item) => ("str" in item ? item.str : "")).join(" "));
    }
    await loadingTask.destroy();
    return pages.join("\n").replace(/[ \t]+/g, " ").trim();
  }

  function runAnalysis() {
    if (resume.trim() && job.trim()) {
      setSubmittedResume(resume);
      setSubmittedJob(job);
      setAnalysed(true);
    }
  }

  return <main className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="#"><span className="brand-mark"><Icon name="spark" size={20}/></span><span>matchwork<span className="brand-dot">.</span></span></a>
      <div className="workspace-label">WORKSPACE</div>
      <nav className="nav-list">
        <button className="nav-item selected"><span className="nav-icon"><Icon name="spark"/></span>Match analyser</button>
        <button className="nav-item" onClick={() => setActiveTab("Saved matches")}><span className="nav-icon"><Icon name="file"/></span>Saved matches<span className="nav-count">2</span></button>
        <button className="nav-item" onClick={() => setActiveTab("Resume library")}><span className="nav-icon"><Icon name="briefcase"/></span>Resume library</button>
      </nav>
      <div className="sidebar-bottom"><div className="plan-card"><div className="plan-icon"><Icon name="spark" size={16}/></div><div><strong>Your career toolkit</strong><span>Make every application count.</span></div><Icon name="arrow" size={15}/></div><button className="profile"><span className="avatar">MP</span><span className="profile-copy"><strong>Maya Patel</strong><small>Free plan</small></span><span className="more">···</span></button></div>
    </aside>

    <section className="main-area">
      <header className="topbar"><div className="breadcrumbs"><span>Workspace</span><Icon name="chevron" size={14}/><strong>{activeTab === "Overview" ? "Match analyser" : activeTab}</strong></div><div className="top-actions"><span className="saved-state"><span className="saved-dot"/>Private on this device</span><button className="help-button">?</button></div></header>
      <div className="content-wrap">
        <div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-icon"><Icon name="spark" size={13}/></span>YOUR NEXT MOVE, MADE CLEAR</div><h1>Find your <em>fit.</em></h1><p className="subtitle">See how your experience maps to the role, and what to strengthen next.</p></div><button className="history-button"><Icon name="clock" size={16}/>Recent analyses<Icon name="chevron" size={15}/></button></div>

        <div className="workspace-grid">
          <div className="input-column">
            <section className="input-card resume-card"><div className="card-heading"><div className="card-title-wrap"><span className="step-number">01</span><div><h2>Your résumé</h2><p>Start with the experience you bring.</p></div></div><button className="text-button" onClick={() => fileRef.current?.click()}><Icon name="upload" size={15}/>{isReadingFile ? "Reading file…" : "Upload file"}</button><input ref={fileRef} className="hidden" type="file" accept=".pdf,.txt,.md,application/pdf,text/plain" onChange={(e) => handleFile(e.target.files?.[0])}/></div><textarea aria-label="Résumé text" value={resume} onChange={(e) => { setResume(e.target.value); setAnalysed(false); }} /><div className="card-footer"><span className={fileError ? "file-error" : ""}>{fileError || (fileName ? <><span className="file-dot"/>{fileName}</> : <><span className="file-dot"/>PDF, TXT, or MD · stays on this device</>)}</span><span>{resume.trim().split(/\s+/).filter(Boolean).length} words</span></div></section>

            <section className="input-card job-card"><div className="card-heading"><div className="card-title-wrap"><span className="step-number step-two">02</span><div><h2>Job description</h2><p>Paste the role you have in mind.</p></div></div><button className="clear-button" onClick={() => { setJob(""); setAnalysed(false); }}>Clear</button></div><textarea aria-label="Job description" value={job} onChange={(e) => { setJob(e.target.value); setAnalysed(false); }} /><div className="card-footer"><span><span className="file-dot lavender"/>Role details are analysed privately</span><span>{job.trim().split(/\s+/).filter(Boolean).length} words</span></div></section>

            <div className="analyze-row"><span className="privacy-note"><span className="lock-icon">♧</span>Your text is never stored or shared.</span><button className="analyze-button" onClick={runAnalysis} disabled={!resume.trim() || !job.trim()}><Icon name="spark" size={17}/>{analysed ? "Refresh analysis" : "Analyse my match"}<Icon name="arrow" size={15}/></button></div>
          </div>

          <aside className="results-column">
            <section className="score-card"><div className="score-topline"><span className="section-kicker">YOUR MATCH SNAPSHOT</span><button aria-label="More options" className="dots-button">···</button></div><div className="score-main"><div className="score-ring" style={{ "--score": `${result.score}%`, "--score-color": scoreColor } as CSSProperties}><div className="score-inner"><strong>{result.score}<small>%</small></strong><span>match</span></div></div><div className="score-copy"><span className="score-caption">ROLE ALIGNMENT</span><h3>{result.score >= 75 ? "Strong alignment" : result.score >= 50 ? "Good potential" : "Room to grow"}</h3><p>{result.matched.length} of {result.matched.length + result.missing.length} role keywords found in your résumé.</p></div></div><div className="score-divider"/><div className="score-stats"><div><span className="stat-icon green"><Icon name="check" size={14}/></span><strong>{result.skillMatched.length}</strong><span>skills matched</span></div><div><span className="stat-icon amber"><Icon name="spark" size={13}/></span><strong>{result.skillMissing.length}</strong><span>to highlight</span></div></div><div className="score-footnote">A helpful guide, not a hiring prediction.</div></section>

            <section className="insight-card"><div className="insight-heading"><div><span className="section-kicker">THE GOOD STUFF</span><h3>Your strengths</h3></div><span className="count-pill">{result.skillMatched.length}</span></div><p className="insight-description">Experience that already speaks their language.</p><div className="tag-list">{result.skillMatched.length ? result.skillMatched.slice(0, 8).map((item) => <span className="skill-tag matched" key={item}><Icon name="check" size={12}/>{item}</span>) : <span className="empty-inline">Add résumé and role details to see your overlap.</span>}</div><button className="subtle-link" onClick={() => setActiveTab("Strengths")}>Explore matched skills <Icon name="arrow" size={14}/></button></section>

            <section className="insight-card gap-card"><div className="insight-heading"><div><span className="section-kicker">YOUR NEXT OPPORTUNITY</span><h3>Skills to highlight</h3></div><span className="count-pill warm">{result.skillMissing.length}</span></div><p className="insight-description">Mention these if they’re part of your experience.</p><div className="tag-list">{result.skillMissing.length ? result.skillMissing.slice(0, 8).map((item) => <span className="skill-tag missing" key={item}>{item}</span>) : <span className="empty-inline">No obvious gaps found. Nice work.</span>}</div><div className="tip-box"><span className="tip-spark"><Icon name="spark" size={14}/></span><p><strong>Make it count.</strong> Add evidence and outcomes where you can. Specific examples help your experience stand out.</p></div></section>

            <div className="method-note"><span className="method-icon">✳</span><span>Skills are identified from the text you provide. Always review the result in context.</span></div>
          </aside>
        </div>
        <footer className="page-footer"><span>Made for the work you want.</span><div><a href="#">How matching works</a><span className="footer-sep">·</span><a href="#">Privacy</a></div></footer>
      </div>
    </section>
  </main>;
}
