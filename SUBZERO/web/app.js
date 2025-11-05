/* global React, ReactDOM, Recharts */
const { useEffect, useMemo, useState } = React;
const { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, CartesianGrid, ResponsiveContainer } = Recharts;

function ThreatStatsCard({ title, value, accent = 'blue' }) {
  const color = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
  }[accent] || 'bg-blue-500';
  return (
    React.createElement('div', { className: 'p-4 bg-white rounded-2xl shadow flex items-center gap-3' },
      React.createElement('div', { className: `${color} w-10 h-10 rounded-full` }),
      React.createElement('div', null,
        React.createElement('div', { className: 'text-sm text-gray-500' }, title),
        React.createElement('div', { className: 'text-2xl font-semibold' }, value)
      )
    )
  );
}

function ThreatTrendsChart({ trend }) {
  const data = trend || [];
  return (
    React.createElement('div', { className: 'p-4 bg-white rounded-2xl shadow' },
      React.createElement('h2', { className: 'text-lg font-semibold mb-2' }, 'Threat Trends (7 days)'),
      React.createElement('div', { className: 'w-full h-64' },
        React.createElement(ResponsiveContainer, { width: '100%', height: '100%' },
          React.createElement(LineChart, { data },
            React.createElement(CartesianGrid, { strokeDasharray: '3 3' }),
            React.createElement(XAxis, { dataKey: 'date' }),
            React.createElement(YAxis),
            React.createElement(Tooltip),
            React.createElement(Line, { type: 'monotone', dataKey: 'threats', stroke: '#ef4444', strokeWidth: 2 })
          )
        )
      )
    )
  );
}

function ModelAccuracyChart({ metrics }) {
  const data = useMemo(() => {
    if (!metrics) return [];
    return [
      { model: 'URL', precision: metrics.url?.precision ?? 0, recall: metrics.url?.recall ?? 0 },
      { model: 'Image', precision: metrics.image?.precision ?? 0, recall: metrics.image?.recall ?? 0 },
      { model: 'Video', precision: metrics.video?.precision ?? 0, recall: metrics.video?.recall ?? 0 },
      { model: 'Audio', precision: metrics.audio?.precision ?? 0, recall: metrics.audio?.recall ?? 0 },
    ];
  }, [metrics]);

  return (
    React.createElement('div', { className: 'p-4 bg-white rounded-2xl shadow' },
      React.createElement('h2', { className: 'text-lg font-semibold mb-2' }, 'Model Detection Accuracy'),
      React.createElement('div', { className: 'w-full h-64' },
        React.createElement(ResponsiveContainer, { width: '100%', height: '100%' },
          React.createElement(BarChart, { data },
            React.createElement(XAxis, { dataKey: 'model' }),
            React.createElement(YAxis, { domain: [0, 1] }),
            React.createElement(Tooltip),
            React.createElement(Legend),
            React.createElement(Bar, { dataKey: 'precision', fill: '#3b82f6' }),
            React.createElement(Bar, { dataKey: 'recall', fill: '#10b981' })
          )
        )
      )
    )
  );
}

function RecentReportsTable({ reports, onOpen }) {
  return (
    React.createElement('div', { className: 'p-4 bg-white rounded-2xl shadow' },
      React.createElement('h2', { className: 'text-lg font-semibold mb-2' }, 'Recent Reports'),
      React.createElement('div', { className: 'overflow-x-auto' },
        React.createElement('table', { className: 'min-w-full text-sm' },
          React.createElement('thead', null,
            React.createElement('tr', { className: 'text-left text-gray-500' },
              React.createElement('th', { className: 'py-2 pr-4' }, 'ID'),
              React.createElement('th', { className: 'py-2 pr-4' }, 'Verdict'),
              React.createElement('th', { className: 'py-2 pr-4' }, 'Confidence'),
              React.createElement('th', { className: 'py-2 pr-4' }, 'Risk'),
              React.createElement('th', { className: 'py-2 pr-4' }, 'Action')
            )
          ),
          React.createElement('tbody', null,
            (reports || []).map((r) => (
              React.createElement('tr', { key: r.id, className: 'border-t' },
                React.createElement('td', { className: 'py-2 pr-4 font-mono text-xs' }, r.id),
                React.createElement('td', { className: 'py-2 pr-4' }, r.verdict),
                React.createElement('td', { className: 'py-2 pr-4' }, (r.confidence ?? 0).toFixed(3)),
                React.createElement('td', { className: 'py-2 pr-4' }, r.risk_level || '—'),
                React.createElement('td', { className: 'py-2 pr-4' },
                  React.createElement('button', { className: 'px-3 py-1 rounded bg-blue-600 text-white', onClick: () => onOpen(r) }, 'Open')
                )
              )
            ))
          )
        )
      )
    )
  );
}

function ReportDetailsModal({ report, onClose }) {
  if (!report) return null;
  return (
    React.createElement('div', { className: 'fixed inset-0 bg-black/40 flex items-center justify-center z-50' },
      React.createElement('div', { className: 'w-[800px] max-w-[95vw] bg-white rounded-2xl shadow p-6' },
        React.createElement('div', { className: 'flex justify-between items-center mb-4' },
          React.createElement('h3', { className: 'text-xl font-semibold' }, 'Analysis Report'),
          React.createElement('button', { className: 'px-3 py-1 rounded bg-gray-200', onClick: onClose }, 'Close')
        ),
        React.createElement('div', { className: 'grid grid-cols-2 gap-4' },
          React.createElement('div', null,
            React.createElement('div', { className: 'text-sm text-gray-500' }, 'Metadata'),
            React.createElement('pre', { className: 'bg-gray-50 p-3 rounded overflow-auto text-xs' }, JSON.stringify(report.metadata, null, 2))
          ),
          React.createElement('div', null,
            React.createElement('div', { className: 'text-sm text-gray-500' }, 'Features'),
            React.createElement('pre', { className: 'bg-gray-50 p-3 rounded overflow-auto text-xs' }, JSON.stringify(report.features, null, 2))
          ),
          React.createElement('div', { className: 'col-span-2' },
            React.createElement('div', { className: 'text-sm text-gray-500' }, 'Explanation'),
            React.createElement('pre', { className: 'bg-gray-50 p-3 rounded overflow-auto text-xs' }, JSON.stringify(report.explanation, null, 2))
          )
        ),
        React.createElement('div', { className: 'mt-4 flex gap-2' },
          React.createElement('button', { className: 'px-3 py-1 rounded bg-green-600 text-white', onClick: () => window.print() }, 'Export as PDF')
        )
      )
    )
  );
}

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [reports, setReports] = useState([]);
  const [selected, setSelected] = useState(null);
  const [range, setRange] = useState('7d');
  const [type, setType] = useState('all');
  const [q, setQ] = useState('');

  useEffect(() => {
    let mounted = true;
    const fetchSummary = async () => {
      try {
        const res = await fetch('http://localhost:8001/api/dashboard/summary');
        if (!res.ok) throw new Error('backend unavailable');
        const data = await res.json();
        if (!mounted) return;
        setSummary(data);
        setReports((data.recent_reports || []).slice(0, 10));
      } catch (e) {
        console.warn('Falling back to mock summary:', e.message);
        try {
          const res = await fetch('./mock/dashboard_summary.json');
          const data = await res.json();
          if (!mounted) return;
          setSummary(data);
          setReports((data.recent_reports || []).slice(0, 10));
        } catch (err) {
          console.error(err);
        }
      }
    };
    fetchSummary();
    const id = setInterval(fetchSummary, 30000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  const filteredReports = useMemo(() => {
    return (reports || []).filter(r => {
      const matchesType = type === 'all' || (r.content_type === type);
      const matchesQ = !q || (r.id.includes(q) || (r.domain || '').includes(q) || (r.source || '').includes(q));
      return matchesType && matchesQ;
    });
  }, [reports, type, q]);

  return (
    React.createElement('div', { className: 'max-w-7xl mx-auto p-6' },
      React.createElement('h1', { className: 'text-2xl font-bold mb-4' }, 'Threat Intelligence Dashboard'),
      React.createElement('div', { className: 'flex gap-3 mb-4' },
        React.createElement('select', { className: 'px-3 py-2 rounded bg-white shadow', value: range, onChange: e => setRange(e.target.value) },
          React.createElement('option', { value: '24h' }, 'Last 24h'),
          React.createElement('option', { value: '7d' }, 'Last 7 days'),
          React.createElement('option', { value: '30d' }, 'Last 30 days')
        ),
        React.createElement('select', { className: 'px-3 py-2 rounded bg-white shadow', value: type, onChange: e => setType(e.target.value) },
          React.createElement('option', { value: 'all' }, 'All types'),
          React.createElement('option', { value: 'url' }, 'URL'),
          React.createElement('option', { value: 'image' }, 'Image'),
          React.createElement('option', { value: 'video' }, 'Video'),
          React.createElement('option', { value: 'audio' }, 'Audio'),
          React.createElement('option', { value: 'email' }, 'Email')
        ),
        React.createElement('input', { className: 'px-3 py-2 rounded bg-white shadow flex-1', placeholder: 'Search by URL/domain/ID', value: q, onChange: e => setQ(e.target.value) })
      ),

      summary ? React.createElement('div', { className: 'grid grid-cols-3 gap-4 mb-4' },
        React.createElement(ThreatStatsCard, { title: 'Total Scans', value: summary.total_scans, accent: 'blue' }),
        React.createElement(ThreatStatsCard, { title: 'Threats Today', value: summary.threats_today, accent: 'red' }),
        React.createElement(ThreatStatsCard, { title: 'Accuracy (URL)', value: Math.round((summary.accuracy_by_model?.url_model ?? 0) * 100) + '%', accent: 'green' })
      ) : null,

      React.createElement('div', { className: 'grid grid-cols-3 gap-4 mb-4' },
        React.createElement('div', { className: 'col-span-2' },
          React.createElement(ThreatTrendsChart, { trend: summary?.trend_7d })
        ),
        React.createElement('div', null,
          React.createElement('div', { className: 'p-4 bg-white rounded-2xl shadow' },
            React.createElement('h2', { className: 'text-lg font-semibold mb-2' }, 'Top Threat Domains'),
            React.createElement('ul', { className: 'text-sm list-disc pl-5' }, (summary?.recent_threat_domains || []).map(d => React.createElement('li', { key: d }, d)))
          )
        )
      ),

      React.createElement('div', { className: 'grid grid-cols-2 gap-4 mb-4' },
        React.createElement(ModelAccuracyChart, { metrics: {
          url: { precision: summary?.accuracy_by_model?.url_model ?? 0.98, recall: 0.94 },
          image: { precision: summary?.accuracy_by_model?.image_model ?? 0.94, recall: 0.90 },
          video: { precision: summary?.accuracy_by_model?.video_model ?? 0.93, recall: 0.88 },
          audio: { precision: summary?.accuracy_by_model?.audio_model ?? 0.95, recall: 0.92 },
        } })
      ),

      React.createElement(RecentReportsTable, { reports: filteredReports, onOpen: async (r) => {
        try {
          const res = await fetch(`http://localhost:8001/api/reports/${encodeURIComponent(r.id)}`);
          if (!res.ok) throw new Error('report fetch failed');
          const full = await res.json();
          setSelected(full);
        } catch (e) {
          console.warn('Falling back to shallow report in modal');
          setSelected({
            metadata: { id: r.id, source: r.content_type },
            features: {},
            explanation: {},
          });
        }
      } }),
      React.createElement(ReportDetailsModal, { report: selected, onClose: () => setSelected(null) })
    )
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(Dashboard));