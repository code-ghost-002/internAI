import { useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, Card, Button, Alert, Badge } from '../../components/common/UI';

export default function AIResume() {
  const { user, updateUser } = useAuth();
  const [resumeText, setResumeText] = useState(user?.resumeText || '');
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(user?.aiAnalysis?.score ? user.aiAnalysis : null);
  const [error, setError]       = useState('');

  const analyze = async () => {
    if (resumeText.trim().length < 50) { setError('Please enter at least 50 characters of resume text.'); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      const { data } = await api.post('/ai/analyze-resume', { resumeText });
      setResult(data);
      updateUser({ aiScore: data.score, resumeText, aiAnalysis: data });
    } catch (e) {
      setError(e.response?.data?.error || 'Analysis failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <PageHeader
        title="AI Resume Analyzer"
        subtitle="Paste your resume or LinkedIn summary — Claude AI will score and match you to roles."
      />

      <Alert type="error" message={error} />

      <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap' }}>
        {/* Input */}
        <div style={{ flex: 1, minWidth: 300 }}>
          <Card>
            <label style={{ fontSize: 13, color: 'var(--text-dim)', display: 'block', marginBottom: 8, fontWeight: 500 }}>
              Resume / Profile Text
            </label>
            <textarea
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
              placeholder={`Paste your full resume, LinkedIn About section, or skills summary here.\n\nExample:\nJane Doe — Computer Science student at UC Berkeley\nSkills: Python, React, Node.js, PostgreSQL, Docker\nExperience: Software Intern at Acme Corp...\nProjects: Built a real-time chat app with WebSockets...`}
              style={{ width: '100%', minHeight: 300, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 9, padding: '13px 14px', color: 'var(--text)', fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'Outfit,sans-serif', lineHeight: 1.6 }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{resumeText.length} characters</span>
              <Button variant="primary" size="lg" loading={loading} onClick={analyze}>
                {loading ? 'Analyzing…' : '✦ Analyze with AI'}
              </Button>
            </div>
          </Card>

          <Card style={{ marginTop: 16, borderColor: 'rgba(0,200,248,.2)', background: 'rgba(0,200,248,.04)' }}>
            <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: .5 }}>✦ What AI analyzes</div>
            {['Technical skill depth and relevance','Education and project quality','Career trajectory alignment','Keyword optimization for ATS systems','Recommended internship roles'].map(item => (
              <div key={item} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 6 }}>
                <span style={{ color: 'var(--green)', marginTop: 2 }}>✓</span>
                <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>{item}</span>
              </div>
            ))}
          </Card>
        </div>

        {/* Results */}
        <div style={{ flex: 1, minWidth: 300 }}>
          {!result && !loading && (
            <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, textAlign: 'center', borderStyle: 'dashed' }}>
              <div style={{ fontSize: 42, color: 'var(--text-muted)', marginBottom: 14 }}>✦</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-dim)', marginBottom: 6 }}>AI Results Appear Here</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Paste your resume on the left and click Analyze.</div>
            </Card>
          )}

          {loading && (
            <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, textAlign: 'center', borderColor: 'rgba(0,200,248,.3)' }}>
              <div style={{ width: 52, height: 52, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin .9s linear infinite', marginBottom: 18 }} />
              <div style={{ color: 'var(--accent)', fontWeight: 600, marginBottom: 6 }}>Claude is analyzing your profile…</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Matching against hundreds of internship roles</div>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </Card>
          )}

          {result && <AnalysisResult result={result} />}
        </div>
      </div>
    </div>
  );
}

function ScoreRing({ score }) {
  const color = score >= 80 ? 'var(--green)' : score >= 60 ? 'var(--accent)' : 'var(--amber)';
  const r = 46, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={110} height={110} viewBox="0 0 110 110">
        <circle cx={55} cy={55} r={r} fill="none" stroke="var(--border)" strokeWidth={8} />
        <circle cx={55} cy={55} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 55 55)"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        <text x="55" y="52" textAnchor="middle" fill={color} fontSize="22" fontWeight="700" fontFamily="DM Serif Display,serif">{score}</text>
        <text x="55" y="68" textAnchor="middle" fill="var(--text-muted)" fontSize="10">/100</text>
      </svg>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Profile Score</div>
    </div>
  );
}

function AnalysisResult({ result }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Score + summary */}
      <Card style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <ScoreRing score={result.score} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 8 }}>Summary</div>
          <p style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.6 }}>{result.summary}</p>
        </div>
      </Card>

      {/* Strengths + improvements */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <Card style={{ flex: 1, minWidth: 200, borderColor: 'rgba(0,229,160,.2)' }}>
          <div style={{ color: 'var(--green)', fontSize: 12, textTransform: 'uppercase', letterSpacing: .5, fontWeight: 600, marginBottom: 12 }}>✓ Strengths</div>
          {result.strengths?.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <span style={{ color: 'var(--green)', marginTop: 2, flexShrink: 0 }}>→</span>
              <span style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.5 }}>{s}</span>
            </div>
          ))}
        </Card>
        <Card style={{ flex: 1, minWidth: 200, borderColor: 'rgba(245,185,64,.2)' }}>
          <div style={{ color: 'var(--amber)', fontSize: 12, textTransform: 'uppercase', letterSpacing: .5, fontWeight: 600, marginBottom: 12 }}>↑ Improve</div>
          {result.improvements?.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <span style={{ color: 'var(--amber)', marginTop: 2, flexShrink: 0 }}>→</span>
              <span style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.5 }}>{s}</span>
            </div>
          ))}
        </Card>
      </div>

      {/* Recommended roles */}
      <Card>
        <div style={{ color: 'var(--purple)', fontSize: 12, textTransform: 'uppercase', letterSpacing: .5, fontWeight: 600, marginBottom: 12 }}>✦ Best-Fit Roles</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
          {result.topRoles?.map((r, i) => <Badge key={i} color="purple">{r}</Badge>)}
        </div>
        <div style={{ color: 'var(--accent)', fontSize: 12, textTransform: 'uppercase', letterSpacing: .5, fontWeight: 600, marginBottom: 10 }}>Keywords</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {result.keywords?.map((k, i) => <Badge key={i} color="accent">{k}</Badge>)}
        </div>
      </Card>
    </div>
  );
}
