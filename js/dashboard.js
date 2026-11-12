// ============ ESTADO SIMULADO ============
const machines = [
    { id: 'CNC-01', name: 'Torno CNC Romi GL-240', status: 'running', oee: 89, temp: 62, vib: 'Normal', prod: 128, maint: '12/10/2025' },
    { id: 'CNC-02', name: 'Centro Usinagem Haas VF-2', status: 'running', oee: 84, temp: 68, vib: 'Atenção', prod: 112, maint: '28/09/2025' },
    { id: 'CNC-03', name: 'Torno CNC Mazak QT-200', status: 'idle', oee: 61, temp: 45, vib: 'Normal', prod: 34, maint: '05/11/2025' },
    { id: 'CNC-04', name: 'Fresadora CNC DMG Mori', status: 'running', oee: 91, temp: 59, vib: 'Normal', prod: 140, maint: '18/10/2025' },
    { id: 'CNC-05', name: 'Centro Usinagem Okuma', status: 'stopped', oee: 0, temp: 32, vib: 'Parada', prod: 0, maint: '02/08/2025' },
    { id: 'CNC-06', name: 'Torno CNC Index C200', status: 'running', oee: 78, temp: 71, vib: 'Atenção', prod: 96, maint: '20/10/2025' },
    { id: 'CNC-07', name: 'Fresadora CNC Bridgeport', status: 'maintenance', oee: 0, temp: 28, vib: 'Manutenção', prod: 0, maint: 'Hoje' },
    { id: 'CNC-08', name: 'Centro Usinagem Mazak', status: 'running', oee: 87, temp: 64, vib: 'Normal', prod: 118, maint: '10/11/2025' },
];

const alerts = [
    { icon: '🌡️', title: 'Temperatura elevada — CNC-06', desc: 'Sensor T3 registrou 71°C (limite: 70°C)', level: 'critical', time: 'há 3 min' },
    { icon: '📳', title: 'Vibração anormal — CNC-02', desc: 'Padrão de vibração fora da curva nas últimas 2h', level: 'warning', time: 'há 18 min' },
    { icon: '🛑', title: 'Parada não planejada — CNC-05', desc: 'Máquina parada há 42 min. Sem operador associado.', level: 'critical', time: 'há 42 min' },
    { icon: '🔧', title: 'Manutenção preventiva agendada — CNC-07', desc: 'Troca de rolamentos conforme plano de manutenção', level: 'info', time: 'há 1h' },
    { icon: '⚡', title: 'Pico de consumo energético', desc: 'Consumo 18% acima da média entre 14h e 15h', level: 'warning', time: 'há 2h' },
];

// ============ HELPERS ============
const statusLabel = { running: 'Operando', idle: 'Ociosa', stopped: 'Parada', maintenance: 'Manutenção' };

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function now() {
    const d = new Date();
    return d.toLocaleTimeString('pt-BR');
}

// ============ KPIs ============
function updateKPIs() {
    const active = machines.filter(m => m.status === 'running').length;
    const avgOee = Math.round(machines.filter(m => m.oee > 0).reduce((s, m) => s + m.oee, 0) / machines.filter(m => m.oee > 0).length);
    const totalProd = machines.reduce((s, m) => s + m.prod, 0);
    const openAlerts = alerts.filter(a => a.level !== 'info').length;

    document.getElementById('kpiOee').textContent = avgOee + '%';
    document.getElementById('kpiProd').textContent = totalProd;
    document.getElementById('kpiMachines').textContent = active;
    document.getElementById('kpiAlerts').textContent = openAlerts;
    document.getElementById('alertCount').textContent = openAlerts;
    document.getElementById('alertsChip').textContent = openAlerts + ' ativos';
}

// ============ TABELA ============
function renderMachines() {
    const tbody = document.getElementById('machinesBody');
    tbody.innerHTML = machines.map(m => {
        const color = m.oee >= 80 ? '#10b981' : m.oee >= 60 ? '#f59e0b' : '#ef4444';
        return `
            <tr>
                <td><strong>${m.id}</strong><br><small style="color:#94a3b8">${m.name}</small></td>
                <td><span class="status-dot ${m.status}">${statusLabel[m.status]}</span></td>
                <td>
                    <strong>${m.oee}%</strong>
                    <div class="mini-bar"><div style="width:${m.oee}%; background:${color}"></div></div>
                </td>
                <td>${m.temp}°C</td>
                <td>${m.vib}</td>
                <td>${m.prod}</td>
                <td>${m.maint}</td>
            </tr>
        `;
    }).join('');
    document.getElementById('lastUpdate').textContent = 'Atualizado ' + now();
}

// ============ ALERTAS ============
function renderAlerts() {
    const list = document.getElementById('alertsList');
    list.innerHTML = alerts.map(a => `
        <li>
            <div class="alert-icon">${a.icon}</div>
            <div class="alert-body">
                <strong>${a.title}</strong>
                <small>${a.desc} • ${a.time}</small>
            </div>
            <span class="alert-level ${a.level}">${a.level.toUpperCase()}</span>
        </li>
    `).join('');
}

// ============ GRÁFICOS ============
const oeeCtx = document.getElementById('oeeChart').getContext('2d');
const energyCtx = document.getElementById('energyChart').getContext('2d');

const labels12 = ['08h','09h','10h','11h','12h','13h','14h','15h','16h','17h','18h','19h'];
const oeeData = [82, 85, 84, 88, 86, 83, 87, 90, 88, 85, 89, 87];
const energyData = [42, 45, 48, 51, 49, 52, 58, 55, 50, 47, 44, 41];

const chartDefaults = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
        x: { grid: { color: '#1f2d4a' }, ticks: { color: '#94a3b8', font: { size: 11 } } },
        y: { grid: { color: '#1f2d4a' }, ticks: { color: '#94a3b8', font: { size: 11 } }, beginAtZero: false }
    }
};

const oeeChart = new Chart(oeeCtx, {
    type: 'line',
    data: {
        labels: labels12,
        datasets: [{
            data: oeeData,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59,130,246,0.15)',
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointBackgroundColor: '#3b82f6',
        }]
    },
    options: { ...chartDefaults, scales: { ...chartDefaults.scales, y: { ...chartDefaults.scales.y, min: 70, max: 100, ticks: { callback: v => v + '%', color: '#94a3b8' } } } }
});

const energyChart = new Chart(energyCtx, {
    type: 'bar',
    data: {
        labels: labels12,
        datasets: [{
            data: energyData,
            backgroundColor: 'rgba(245,158,11,0.6)',
            borderRadius: 6,
        }]
    },
    options: chartDefaults
});

// ============ RELÓGIO ============
setInterval(() => {
    document.getElementById('clock').textContent = now();
}, 1000);

// ============ SIMULAÇÃO EM TEMPO REAL ============
setInterval(() => {
    machines.forEach(m => {
        if (m.status === 'running') {
            m.oee = Math.max(50, Math.min(99, m.oee + rand(-2, 2)));
            m.temp = Math.max(35, Math.min(80, m.temp + rand(-2, 2)));
            m.prod = Math.max(0, m.prod + rand(-3, 5));
        }
    });
    // Atualiza gráficos com pequena variação
    oeeChart.data.datasets[0].data = oeeChart.data.datasets[0].data.map(v => Math.max(70, Math.min(100, v + rand(-1, 1))));
    oeeChart.update('none');
    energyChart.data.datasets[0].data = energyChart.data.datasets[0].data.map(v => Math.max(30, Math.min(70, v + rand(-2, 2))));
    energyChart.update('none');

    renderMachines();
    updateKPIs();
}, 4000);

// ============ NAVEGAÇÃO ============
document.querySelectorAll('.menu a').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        document.querySelectorAll('.menu a').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        const view = link.dataset.view;
        const titles = {
            overview: ['Visão Geral', 'Monitoramento em tempo real • Atualizado agora'],
            machines: ['Máquinas', 'Detalhes e status de cada máquina'],
            alerts: ['Alertas', 'Ocorrências que requerem atenção'],
            production: ['Produção', 'Indicadores de produção'],
            energy: ['Energia', 'Consumo energético das máquinas'],
        };
        document.getElementById('pageTitle').textContent = titles[view][0];
        document.getElementById('pageSubtitle').textContent = titles[view][1];
        // Scroll ao topo
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

// ============ INIT ============
updateKPIs();
renderMachines();
renderAlerts();
document.getElementById('clock').textContent = now();
