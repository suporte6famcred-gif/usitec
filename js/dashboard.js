// ============ ESTADO ============
const STORAGE_KEY = 'techmill_machines_v1';

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
    { icon: '🔧', title: 'Manutenção preventiva agendada — CNC-07', desc: 'Troca de rolamentos conforme plano de manutenção', level
