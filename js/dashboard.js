// ============ ESTADO ============
const STORAGE_KEY = 'usitec_machines_v1';
const ENERGY_PRICE = 0.75; // R$ por kWh

const DEFAULT_MACHINES = [
    { id: 'CNC-01', name: 'Torno CNC Romi GL-240', model: 'Romi GL-240', energy: 12.5, unit: 'hora', capacity: 120, status: 'running', specs: 'Eixo X 500mm, rotação máx 4500 rpm', oee: 89, temp: 62, vib: 'Normal', prod: 128, maint: '12/10/2025' },
    { id: 'CNC-02', name: 'Centro Usinagem Haas VF-2', model: 'Haas VF-2', energy: 18.2, unit: 'hora', capacity: 110, status: 'running', specs: 'Curso 762x406x508mm, 8100 rpm', oee: 84, temp: 68, vib: 'Atenção', prod: 112, maint: '28/09/2025' },
    { id: 'CNC-03', name: 'Torno CNC Mazak QT-200', model: 'Mazak QT-200', energy: 10.8, unit: 'hora', capacity: 95, status: 'idle', specs: 'Fuso 4000 rpm, 12 ferramentas', oee: 61, temp: 45, vib: 'Normal', prod: 34, maint: '05/11/2025' },
    { id: 'CNC-04', name: 'Fresadora CNC DMG Mori', model: 'DMG Mori CMX 600', energy: 22.4, unit: 'hora', capacity: 140, status: 'running', specs: 'Curso 600x560x510mm', oee: 91, temp: 59, vib: 'Normal', prod: 140, maint: '18/10/2025' },
    { id: 'CNC-05', name: 'Centro Usinagem Okuma', model: 'Okuma Genos M460', energy: 16.9, unit: 'hora', capacity: 130, status: 'stopped', specs: 'Curso 460x410x460mm', oee: 0, temp: 32, vib: 'Parada', prod: 0, maint: '02/08/2025' },
    { id: 'CNC-06', name: 'Torno CNC Index C200', model: 'Index C200', energy: 14.3, unit: 'hora', capacity: 100, status: 'running', specs: 'Fuso 6300 rpm, 2 torres', oee: 78, temp: 71, vib: 'Atenção', prod: 96, maint: '20/10/2025' },
    { id: 'CNC-07', name: 'Fresadora CNC Bridgeport', model: 'Bridgeport V480', energy: 9.6, unit: 'hora', capacity: 80, status: 'maintenance', specs: 'Curso 480x400x380mm', oee: 0, temp: 28, vib: 'Manutenção', prod: 0, maint: 'Hoje' },
    { id: 'CNC-08', name: 'Centro Usinagem Mazak', model: 'Mazak VCN-530', energy: 19.7, unit: 'hora', capacity: 125, status: 'running', specs: 'Curso 1050x530x510mm, 12000 rpm', oee: 87, temp: 64, vib: 'Normal', prod: 118, maint: '10/11/2025' },
];

const alerts = [
    { icon: '🌡️', title: 'Temperatura elevada — CNC-06', desc: 'Sensor T3 registrou 71°C (limite: 70°C)', level: 'critical', time: 'há 3 min' },
    { icon: '📳', title: 'Vibração anormal — CNC-02', desc: 'Padrão de vibração fora da curva nas últimas 2h', level: 'warning', time: 'há 18 min' },
    { icon: '🛑', title: 'Parada não planejada — CNC-05', desc: 'Máquina parada há 42 min. Sem operador associado.', level: 'critical', time: 'há 42 min' },
    { icon: '🔧', title: 'Manutenção preventiva agendada — CNC-07', desc: 'Troca de rolamentos conforme plano de manutenção', level: 'info', time: 'há 1h' },
    { icon: '⚡', title: 'Pico de consumo energético', desc: 'Consumo 18% acima da média entre 14h e 15h', level: 'warning', time: 'há 2h' },
];

let machines = loadMachines();

const statusLabel = { running: 'Operando', idle: 'Ociosa', stopped: 'Parada', maintenance: 'Manutenção' };
const unitLabel = { hora: 'pçs/h', segundo: 'pçs/s' };

// ============ PERSISTÊNCIA ============
function loadMachines() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length) return parsed;
        }
    } catch (e) { console.warn('Falha ao carregar máquinas', e); }
    return JSON.parse(JSON.stringify(DEFAULT_MACHINES));
}

function saveMachines() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(machines));
    } catch (e) { console.warn('Falha ao salvar máquinas', e); }
}

// ============ HELPERS ============
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function nowStr() { return new Date().toLocaleTimeString('pt-BR'); }

function capacityPerHour(m) {
    const cap = Number(m.capacity) || 0;
    return m.unit === 'segundo' ? Math.round(cap * 3600) : Math.round(cap);
}

function nextMachineId() {
    const nums = machines
        .map(m => parseInt((m.id || '').replace(/\D/g, ''), 10))
        .filter(n => !isNaN(n));
    const next = (nums.length ? Math.max(...nums) : 0) + 1;
    return 'CNC-' + String(next).padStart(2, '0');
}

// ============ KPIs ============
function updateKPIs() {
    const running = machines.filter(m => m.status === 'running');
    const withOee = machines.filter(m => m.oee > 0);
    const avgOee = withOee.length ? Math.round(withOee.reduce((s, m) => s + m.oee, 0) / withOee.length) : 0;
    const totalProd = machines.reduce((s, m) => s + (Number(m.prod) || 0), 0);
    const openAlerts = alerts.filter(a => a.level !== 'info').length;
    const totalEnergy = machines.reduce((s, m) => s + (Number(m.energy) || 0), 0);

    setText('kpiOee', avgOee + '%');
    setText('kpiProd', totalProd);
    setText('kpiMachines', running.length + '/' + machines.length);
    setText('kpiAlerts', openAlerts);
    setText('alertCount', openAlerts);
    setText('alertsChip', openAlerts + ' ativos');
    setText('alertsChipFull', openAlerts + ' ativos');

    // View energia
    setText('energyTotal', totalEnergy.toFixed(1) + ' kWh');
    setText('energyCost', 'R$ ' + (totalEnergy * ENERGY_PRICE).toFixed(2));
    setText('energyAvg', (totalEnergy / (machines.length || 1)).toFixed(1));
}

function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

// ============ TABELAS ============
function renderMachinesOverview() {
    const tbody = document.getElementById('machinesBody');
    if (!tbody) return;
    tbody.innerHTML = machines.map(m => {
        const color = m.oee >= 80 ? '#10b981' : m.oee >= 60 ? '#f59e0b' : '#ef4444';
        const prodDisplay = `${m.prod || 0} <small style="color:var(--muted)">${unitLabel[m.unit] || ''}</small>`;
        return `
            <tr>
                <td class="machine-name">
                    <strong>${m.id}</strong>
                    <small>${m.name}</small>
                </td>
                <td><span class="status-dot ${m.status}">${statusLabel[m.status] || m.status}</span></td>
                <td>
                    <strong>${m.oee || 0}%</strong>
                    <div class="mini-bar"><div style="width:${m.oee || 0}%; background:${color}"></div></div>
                </td>
                <td>${m.temp || 0}°C</td>
                <td>${m.vib || '—'}</td>
                <td>${prodDisplay}</td>
                <td>${(Number(m.energy) || 0).toFixed(1)} kWh</td>
            </tr>
        `;
    }).join('');
    setText('lastUpdate', 'Atualizado ' + nowStr());
}

function renderMachinesFull() {
    const tbody = document.getElementById('machinesFullBody');
    if (!tbody) return;
    if (!machines.length) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--muted); padding:32px;">Nenhuma máquina cadastrada. Clique em "+ Nova Máquina".</td></tr>`;
        return;
    }
    tbody.innerHTML = machines.map(m => `
        <tr>
            <td><strong>${m.id}</strong></td>
            <td>${m.name}</td>
            <td>${m.model || '—'}</td>
            <td>${(Number(m.energy) || 0).toFixed(1)} kWh</td>
            <td>${capacityPerHour(m)} pçs/h</td>
            <td><span class="status-dot ${m.status}">${statusLabel[m.status] || m.status}</span></td>
            <td>
                <button class="btn-icon edit" onclick="editMachine('${m.id}')" title="Editar">✏️</button>
                <button class="btn-icon" onclick="deleteMachine('${m.id}')" title="Excluir">🗑️</button>
            </td>
        </tr>
    `).join('');
}

// ============ ALERTAS ============
function renderAlerts() {
    const html = alerts.map(a => `
        <li>
            <div class="alert-icon">${a.icon}</div>
            <div class="alert-body">
                <strong>${a.title}</strong>
                <small>${a.desc} • ${a.time}</small>
            </div>
            <span class="alert-level ${a.level}">${a.level.toUpperCase()}</span>
        </li>
    `).join('');
    ['alertsList', 'alertsListFull'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = html;
    });
}

// ============ GRÁFICOS ============
let oeeChart, energyChart, energyPerMachineChart;

const chartDefaults = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
        legend: { display: false }, 
        tooltip: { 
            backgroundColor: '#FFFFFF', 
            titleColor: '#0D1B2A',
            bodyColor: '#5B636A',
            borderColor: '#E2E8F0', 
            borderWidth: 1 
        } 
    },
    scales: {
        x: { 
            grid: { display: false }, 
            ticks: { color: '#5B636A', font: { size: 11, family: 'Montserrat' } } 
        },
        y: { 
            grid: { color: '#F1F5F9' }, 
            ticks: { color: '#5B636A', font: { size: 11, family: 'Montserrat' } }, 
            beginAtZero: false 
        }
    }
};

function initCharts() {
    const labels12 = ['08h','09h','10h','11h','12h','13h','14h','15h','16h','17h','18h','19h'];

    const oeeEl = document.getElementById('oeeChart');
    if (oeeEl) {
        oeeChart = new Chart(oeeEl.getContext('2d'), {
            type: 'line',
            data: {
                labels: labels12,
                datasets: [{
                data: [82, 85, 84, 88, 86, 83, 87, 90, 88, 85, 89, 87],
                borderColor: '#009B8E', // Ciano Usitec
                backgroundColor: 'rgba(0, 155, 142, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 3,
                pointBackgroundColor: '#009B8E',
            }]
            },
            options: { ...chartDefaults, scales: { ...chartDefaults.scales, y: { ...chartDefaults.scales.y, min: 70, max: 100, ticks: { callback: v => v + '%', color: '#94a3b8' } } } }
        });
    }

    const energyEl = document.getElementById('energyChart');
    if (energyEl) {
        energyChart = new Chart(energyEl.getContext('2d'), {
            type: 'bar',
            data: {
                labels: labels12,
                datasets: [{
                    data: [42, 45, 48, 51, 49, 52, 58, 55, 50, 47, 44, 41],
                    backgroundColor: 'rgba(0, 78, 94, 0.8)',
                    borderRadius: 6,
                }]
            },
            options: chartDefaults
        });
    }

    renderEnergyPerMachineChart();
}

function renderEnergyPerMachineChart() {
    const el = document.getElementById('energyPerMachineChart');
    if (!el) return;
    const labels = machines.map(m => m.id);
    const data = machines.map(m => Number(m.energy) || 0);

    if (energyPerMachineChart) energyPerMachineChart.destroy();
    energyPerMachineChart = new Chart(el.getContext('2d'), {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: data.map(v => v > 18 ? 'rgba(239,68,68,0.7)' : v > 12 ? 'rgba(245,158,11,0.7)' : 'rgba(16,185,129,0.7)'),
                borderRadius: 8,
            }]
        },
        options: {
            ...chartDefaults,
            scales: {
                ...chartDefaults.scales,
                y: { ...chartDefaults.scales.y, beginAtZero: true, ticks: { callback: v => v + ' kWh', color: '#94a3b8' } }
            }
        }
    });
}

// ============ CRUD ============
function saveMachine() {
    const id = document.getElementById('machineId').value;
    const machine = {
        name: document.getElementById('mName').value.trim(),
        model: document.getElementById('mModel').value.trim(),
        energy: parseFloat(document.getElementById('mEnergy').value) || 0,
        unit: document.getElementById('mUnit').value,
        capacity: parseFloat(document.getElementById('mCapacity').value) || 0,
        status: document.getElementById('mStatus').value,
        specs: document.getElementById('mSpecs').value.trim(),
    };

    if (!machine.name) { alert('Informe o nome da máquina.'); return; }

    if (id) {
        const idx = machines.findIndex(m => m.id === id);
        if (idx >= 0) {
            machines[idx] = { ...machines[idx], ...machine };
        }
    } else {
        machines.push({
            id: nextMachineId(),
            oee: machine.status === 'running' ? rand(70, 95) : 0,
            temp: machine.status === 'running' ? rand(50, 70) : 30,
            vib: machine.status === 'running' ? 'Normal' : '—',
            prod: 0,
            maint: new Date().toLocaleDateString('pt-BR'),
            ...machine,
        });
    }

    saveMachines();
    resetForm();
    refreshAll();
    switchView('machines');
    alert('Máquina salva com sucesso!');
}

function editMachine(id) {
    const m = machines.find(x => x.id === id);
    if (!m) return;
    document.getElementById('machineId').value = m.id;
    document.getElementById('mName').value = m.name;
    document.getElementById('mModel').value = m.model || '';
    document.getElementById('mEnergy').value = m.energy;
    document.getElementById('mUnit').value = m.unit || 'hora';
    document.getElementById('mCapacity').value = m.capacity;
    document.getElementById('mStatus').value = m.status;
    document.getElementById('mSpecs').value = m.specs || '';
    document.getElementById('formTitle').textContent = 'Editar Máquina — ' + m.id;
    switchView('register');
}

function deleteMachine(id) {
    if (!confirm('Excluir a máquina ' + id + '? Essa ação não pode ser desfeita.')) return;
    machines = machines.filter(m => m.id !== id);
    saveMachines();
    refreshAll();
}

function resetForm() {
    document.getElementById('machineForm').reset();
    document.getElementById('machineId').value = '';
    document.getElementById('formTitle').textContent = 'Cadastrar Nova Máquina';
}

// ============ NAVEGAÇÃO ============
const VIEW_TITLES = {
    overview: ['Visão Geral', 'Monitoramento em tempo real'],
    machines: ['Máquinas', 'Gerencie o parque de máquinas da Usitec'],
    register: ['Cadastrar Máquina', 'Adicione ou edite equipamentos'],
    alerts: ['Alertas', 'Ocorrências que requerem atenção'],
    energy: ['Energia', 'Consumo energético do parque'],
};

function switchView(view) {
    document.querySelectorAll('.menu a').forEach(a => {
        a.classList.toggle('active', a.dataset.view === view);
    });
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const target = document.getElementById('view-' + view);
    if (target) target.classList.add('active');

    const t = VIEW_TITLES[view] || ['Painel', ''];
    setText('pageTitle', t[0]);
    setText('pageSubtitle', t[1]);

    if (view === 'energy') renderEnergyPerMachineChart();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============ RELÓGIO ============
setInterval(() => setText('clock', nowStr()), 1000);

// ============ SIMULAÇÃO EM TEMPO REAL ============
setInterval(() => {
    machines.forEach(m => {
        if (m.status === 'running') {
            m.oee = Math.max(50, Math.min(99, (m.oee || 0) + rand(-2, 2)));
            m.temp = Math.max(35, Math.min(80, (m.temp || 50) + rand(-2, 2)));
            m.prod = Math.max(0, (m.prod || 0) + rand(-3, 5));
        }
    });

    if (oeeChart) {
        oeeChart.data.datasets[0].data = oeeChart.data.datasets[0].data.map(v => Math.max(70, Math.min(100, v + rand(-1, 1))));
        oeeChart.update('none');
    }
    if (energyChart) {
        energyChart.data.datasets[0].data = energyChart.data.datasets[0].data.map(v => Math.max(30, Math.min(70, v + rand(-2, 2))));
        energyChart.update('none');
    }

    renderMachinesOverview();
    updateKPIs();
    saveMachines();
}, 4000);

// ============ INIT ============
function refreshAll() {
    updateKPIs();
    renderMachinesOverview();
    renderMachinesFull();
    renderAlerts();
    renderEnergyPerMachineChart();
}

document.addEventListener('DOMContentLoaded', () => {
    initCharts();
    refreshAll();
    setText('clock', nowStr());

    document.querySelectorAll('.menu a').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            switchView(link.dataset.view);
        });
    });
});
