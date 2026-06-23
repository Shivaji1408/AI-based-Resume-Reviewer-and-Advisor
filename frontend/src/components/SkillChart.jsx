import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

const COLORS = {
  matched: '#22d3ee',
  missing: '#f43f5e',
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card px-3 py-2 text-sm">
        <p className="font-semibold text-white">{payload[0].name}</p>
        <p className="text-slate-400">{payload[0].value} skills</p>
      </div>
    );
  }
  return null;
};

export function SkillPieChart({ matchedSkills = [], missingSkills = [] }) {
  const data = [
    { name: 'Matched Skills', value: matchedSkills.length || 0 },
    { name: 'Missing Skills', value: missingSkills.length || 0 },
  ].filter(d => d.value > 0);

  if (data.length === 0) return null;

  return (
    <div className="glass-card p-5">
      <h3 className="section-title mb-4">
        <span className="text-cyan-400">◈</span> Skill Match Overview
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={4}
            dataKey="value"
          >
            <Cell fill={COLORS.matched} stroke="transparent" />
            <Cell fill={COLORS.missing} stroke="transparent" />
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => (
              <span className="text-slate-400 text-xs">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SkillBarChart({ missingSkills = [] }) {
  const data = missingSkills.slice(0, 8).map((skill) => ({
    name: skill.length > 15 ? skill.substring(0, 13) + '...' : skill,
    fullName: skill,
    priority: Math.floor(Math.random() * 40) + 60, // Mock priority score
  }));

  if (data.length === 0) return null;

  return (
    <div className="glass-card p-5">
      <h3 className="section-title mb-4">
        <span className="text-rose-400">◈</span> Top Missing Skills
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={80}
          />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
            content={({ active, payload }) =>
              active && payload?.length ? (
                <div className="glass-card px-3 py-2 text-xs">
                  <p className="text-white font-semibold">{payload[0]?.payload?.fullName}</p>
                  <p className="text-rose-400">Priority: {payload[0]?.value}%</p>
                </div>
              ) : null
            }
          />
          <Bar dataKey="priority" fill="#f43f5e" radius={[0, 4, 4, 0]} maxBarSize={14} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
