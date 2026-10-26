// --- AUDIO Y SONIDOS SINTETIZADOS CON WEB AUDIO API (AUMENTO DE VOLUMEN) ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function sonar(tipo) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;

    if (tipo === 'click') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
        gain.gain.setValueAtTime(0.85, now); // Volumen incrementado
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.start(now); osc.stop(now + 0.08);
    } else if (tipo === 'acierto') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.1);
        osc.frequency.setValueAtTime(783.99, now + 0.2);
        gain.gain.setValueAtTime(0.95, now); // Volumen incrementado
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now); osc.stop(now + 0.4);
    } else if (tipo === 'victoria_fanfarria') {
        const notas = [523.25, 659.25, 783.99, 1046.50];
        const tiempos = [0, 0.15, 0.30, 0.50];
        const duraciones = [0.12, 0.12, 0.18, 0.60];

        notas.forEach((freq, idx) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            const t = now + tiempos[idx];
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.90, t); // Volumen incrementado
            gain.gain.exponentialRampToValueAtTime(0.001, t + duraciones[idx]);
            osc.start(t);
            osc.stop(t + duraciones[idx]);
        });
    }
}

// --- MÚSICA DE FONDO NIVELADA ---
let musicaSonando = false;
let intervaloMusica = null;

function alternarMusica() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    musicaSonando = !musicaSonando;
    const btn = document.getElementById('btn-musica');

    if (musicaSonando) {
        btn.innerText = "🎵 MÚSICA: ON";
        btn.classList.add('musica-activa');
        reproducirMelodiaInfantil();
    } else {
        btn.innerText = "🎵 MÚSICA: OFF";
        btn.classList.remove('musica-activa');
        if (intervaloMusica) clearInterval(intervaloMusica);
    }
}

function reproducirMelodiaInfantil() {
    const notas = [261.63, 329.63, 392.00, 440.00, 392.00, 329.63];
    let paso = 0;

    intervaloMusica = setInterval(() => {
        if (!musicaSonando) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        const now = audioCtx.currentTime;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(notas[paso % notas.length], now);
        gain.gain.setValueAtTime(0.12, now); // Volumen de música ajustado
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        
        osc.start(now);
        osc.stop(now + 0.8);
        paso++;
    }, 900);
}

// --- VOZ SINTÉTICA A MÁXIMO VOLUMEN Y PAUSADA ---
let vozFemenina = null;

function cargarVoces() {
    if (!('speechSynthesis' in window)) return;
    const voces = window.speechSynthesis.getVoices();
    
    vozFemenina = voces.find(v => v.lang.startsWith('es') && (
        v.name.includes('Google') || 
        v.name.includes('Monica') || 
        v.name.includes('Sabina') || 
        v.name.includes('Paulina') || 
        v.name.includes('Helena') || 
        v.name.includes('Laura') ||
        v.name.toLowerCase().includes('female')
    )) || voces.find(v => v.lang.startsWith('es'));
}

if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = cargarVoces;
    cargarVoces();
}

function hablarPausado(parte1, parte2) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const u1 = new SpeechSynthesisUtterance(parte1);
    if (vozFemenina) u1.voice = vozFemenina;
    u1.lang = "es-MX";
    u1.rate = 0.55;
    u1.pitch = 1.25;
    u1.volume = 1.0; // Volumen al 100%

    u1.onend = () => {
        setTimeout(() => {
            const u2 = new SpeechSynthesisUtterance(parte2);
            if (vozFemenina) u2.voice = vozFemenina;
            u2.lang = "es-MX";
            u2.rate = 0.55;
            u2.pitch = 1.25;
            u2.volume = 1.0; // Volumen al 100%
            window.speechSynthesis.speak(u2);
        }, 400);
    };

    window.speechSynthesis.speak(u1);
}

function hablarSencillo(texto) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const u = new SpeechSynthesisUtterance(texto);
    if (vozFemenina) u.voice = vozFemenina;
    u.lang = "es-MX";
    u.rate = 0.58;
    u.pitch = 1.25;
    u.volume = 1.0; // Volumen al 100%
    window.speechSynthesis.speak(u);
}

// --- ESTADO Y PERSISTENCIA ---
let estrellas = parseInt(localStorage.getItem('estrellasAprendeKids')) || 0;
let idxLetra = 0, idxNumero = 0, idxColor = 0;
let juegoActual = '';
let contadorAciertosRonda = 0;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('contador-estrellas').innerText = estrellas;
});

function sumarEstrella() {
    estrellas++;
    localStorage.setItem('estrellasAprendeKids', estrellas);
    document.getElementById('contador-estrellas').innerText = estrellas;
    sonar('acierto');
    lanzarFelicitacion();
}

function reiniciarEstrellas() {
    if (confirm('¿Quieres reiniciar tus estrellas a 0?')) {
        estrellas = 0;
        localStorage.setItem('estrellasAprendeKids', 0);
        document.getElementById('contador-estrellas').innerText = 0;
        sonar('click');
    }
}

// --- DATOS EDUCATIVOS ---
const letras = [
    { letra: "A", palabra: "Árbol", emoji: "🌳" }, { letra: "B", palabra: "Barco", emoji: "⛵" },
    { letra: "C", palabra: "Casa", emoji: "🏠" }, { letra: "D", palabra: "Dado", emoji: "🎲" },
    { letra: "E", palabra: "Elefante", emoji: "🐘" }, { letra: "F", palabra: "Flor", emoji: "🌷" },
    { letra: "G", palabra: "Gato", emoji: "🐱" }, { letra: "H", palabra: "Helado", emoji: "🍦" },
    { letra: "I", palabra: "Iglesia", emoji: "⛪" }, { letra: "J", palabra: "Jirafa", emoji: "🦒" },
    { letra: "K", palabra: "Kiwi", emoji: "🥝" }, { letra: "L", palabra: "Luna", emoji: "🌙" },
    { letra: "M", palabra: "Manzana", emoji: "🍎" }, { letra: "N", palabra: "Nube", emoji: "☁️" },
    { letra: "Ñ", palabra: "Ñandú", emoji: "🐦" }, { letra: "O", palabra: "Oso", emoji: "🐻" },
    { letra: "P", palabra: "Pelota", emoji: "⚽" }, { letra: "Q", palabra: "Queso", emoji: "🧀" },
    { letra: "R", palabra: "Ratón", emoji: "🐭" }, { letra: "S", palabra: "Sol", emoji: "☀️" },
    { letra: "T", palabra: "Tortuga", emoji: "🐢" }, { letra: "U", palabra: "Uvas", emoji: "🍇" },
    { letra: "V", palabra: "Vaca", emoji: "🐮" }, { letra: "W", palabra: "Waffle", emoji: "🧇" },
    { letra: "X", palabra: "Xilófono", emoji: "🎼" }, { letra: "Y", palabra: "Yoyó", emoji: "🪀" },
    { letra: "Z", palabra: "Zanahoria", emoji: "🥕" }
];

const nombresNumerosPool = ["manzana", "estrella", "pelota", "gatito", "flor", "globo"];

const objetosNumeros = Array.from({ length: 50 }, (_, i) => {
    const num = i + 1;
    const obj = nombresNumerosPool[i % nombresNumerosPool.length];
    return { num: num, objeto: obj };
});

const colores = [
    { nombre: "Rojo", hex: "#FF595E" }, { nombre: "Azul", hex: "#4D96FF" },
    { nombre: "Amarillo", hex: "#FFD93D" }, { nombre: "Verde", hex: "#6BCB77" },
    { nombre: "Naranja", hex: "#FF922B" }, { nombre: "Morado", hex: "#B983FF" },
    { nombre: "Rosa", hex: "#FF8FAB" }, { nombre: "Celeste", hex: "#87CEEB" },
    { nombre: "Café", hex: "#8B5E3C" }, { nombre: "Negro", hex: "#252525" },
    { nombre: "Blanco", hex: "#FFFFFF" }, { nombre: "Gris", hex: "#A0A0A0" },
    { nombre: "Turquesa", hex: "#00F5D4" }, { nombre: "Violeta", hex: "#7B2CBF" },
    { nombre: "Dorado", hex: "#FFD700" }, { nombre: "Plateado", hex: "#C0C0C0" }
];

const poolEmojisGenerales = ["🍎", "⚽", "🐱", "🐶", "⭐", "🎈", "🐥", "🚗", "🌷", "🐝", "🍇", "🍓"];

// --- PREGUNTAS DINÁMICAS ---
function generarPreguntaPalabra() {
    const item = letras[Math.floor(Math.random() * letras.length)];
    const pal = item.palabra.toUpperCase();
    const pos = Math.floor(Math.random() * pal.length);
    const falta = pal[pos];
    const incompleta = pal.substring(0, pos) + "_" + pal.substring(pos + 1);

    const opciones = [falta];
    const vocales = ["A", "E", "I", "O", "U"];
    while(opciones.length < 3) {
        const rnd = vocales[Math.floor(Math.random() * vocales.length)];
        if (!opciones.includes(rnd)) opciones.push(rnd);
    }

    return {
        palabra: incompleta,
        falta: falta,
        opciones: opciones.sort(() => Math.random() - 0.5),
        emoji: item.emoji
    };
}

function generarPreguntaConteo() {
    const cantidad = Math.floor(Math.random() * 8) + 1;
    const emoji = poolEmojisGenerales[Math.floor(Math.random() * poolEmojisGenerales.length)];

    const opciones = [cantidad];
    while(opciones.length < 3) {
        const rnd = Math.floor(Math.random() * 8) + 1;
        if (!opciones.includes(rnd)) opciones.push(rnd);
    }

    return {
        emoji: emoji,
        cantidad: cantidad,
        opciones: opciones.sort(() => Math.random() - 0.5)
    };
}

function generarPreguntaColor() {
    const item = colores[Math.floor(Math.random() * colores.length)];
    const opciones = [item.nombre];

    while(opciones.length < 3) {
        const rnd = colores[Math.floor(Math.random() * colores.length)].nombre;
        if (!opciones.includes(rnd)) opciones.push(rnd);
    }

    return {
        hex: item.hex,
        correcta: item.nombre,
        opciones: opciones.sort(() => Math.random() - 0.5)
    };
}

function generarPreguntaMayor() {
    let cantA = Math.floor(Math.random() * 7) + 1;
    let cantB = Math.floor(Math.random() * 7) + 1;
    while(cantA === cantB) { cantB = Math.floor(Math.random() * 7) + 1; }

    const emojiA = poolEmojisGenerales[Math.floor(Math.random() * poolEmojisGenerales.length)];
    let emojiB = poolEmojisGenerales[Math.floor(Math.random() * poolEmojisGenerales.length)];
    while(emojiA === emojiB) { emojiB = poolEmojisGenerales[Math.floor(Math.random() * poolEmojisGenerales.length)]; }

    return {
        cantA, cantB, emojiA, emojiB,
        ganador: cantA > cantB ? 'A' : 'B'
    };
}

// --- NAVEGACIÓN ---
function cambiarSeccion(nombreSeccion) {
    sonar('click');
    const panelSuperior = document.getElementById('panel-superior');
    const panelVolver = document.getElementById('panel-volver');

    if (nombreSeccion === 'inicio') {
        panelSuperior.classList.remove('oculta');
        panelVolver.classList.add('oculta');
    } else {
        panelSuperior.classList.add('oculta');
        panelVolver.classList.remove('oculta');
    }

    document.querySelectorAll('.seccion').forEach(sec => sec.classList.remove('activa'));
    document.getElementById(`seccion-${nombreSeccion}`).classList.add('activa');

    if (nombreSeccion === 'letras') mostrarLetra();
    if (nombreSeccion === 'numeros') mostrarNumero();
    if (nombreSeccion === 'colores') mostrarColor();
}

// --- APRENDIZAJE ---
function mostrarLetra() {
    const item = letras[idxLetra];
    document.getElementById('letra-gigante').innerText = item.letra;
    document.getElementById('letra-emoji').innerText = item.emoji;
    document.getElementById('letra-palabra').innerText = item.palabra;
    
    document.getElementById('btn-letra-prev').disabled = (idxLetra === 0);
    document.getElementById('btn-letra-next').disabled = (idxLetra === letras.length - 1);
    hablarLetra();
}
function hablarLetra() { 
    hablarPausado(`Letra ${letras[idxLetra].letra}`, letras[idxLetra].palabra); 
}
function siguienteLetra() { if(idxLetra < letras.length-1) { idxLetra++; mostrarLetra(); sonar('click'); } }
function anteriorLetra() { if(idxLetra > 0) { idxLetra--; mostrarLetra(); sonar('click'); } }

function mostrarNumero() {
    const item = objetosNumeros[idxNumero];
    document.getElementById('numero-gigante').innerText = item.num;
    document.getElementById('numero-palabra').innerText = `${item.num} ${item.objeto}${item.num > 1 ? 's' : ''}`;
    
    document.getElementById('btn-num-prev').disabled = (idxNumero === 0);
    document.getElementById('btn-num-next').disabled = (idxNumero === objetosNumeros.length - 1);
    hablarNumero();
}
function hablarNumero() { 
    hablarPausado(`Número ${objetosNumeros[idxNumero].num}`, `${objetosNumeros[idxNumero].num} ${objetosNumeros[idxNumero].objeto}s`); 
}
function siguienteNumero() { if(idxNumero < objetosNumeros.length-1) { idxNumero++; mostrarNumero(); sonar('click'); } }
function anteriorNumero() { if(idxNumero > 0) { idxNumero--; mostrarNumero(); sonar('click'); } }

function mostrarColor() {
    const item = colores[idxColor];
    document.getElementById('muestra-color').style.backgroundColor = item.hex;
    document.getElementById('nombre-color').innerText = item.nombre;
    
    document.getElementById('btn-col-prev').disabled = (idxColor === 0);
    document.getElementById('btn-col-next').disabled = (idxColor === colores.length - 1);
    hablarColor();
}
function hablarColor() { hablarSencillo(`Color ${colores[idxColor].nombre}.`); }
function siguienteColor() { if(idxColor < colores.length-1) { idxColor++; mostrarColor(); sonar('click'); } }
function anteriorColor() { if(idxColor > 0) { idxColor--; mostrarColor(); sonar('click'); } }

// --- CELEBRACIÓN Y JUEGOS ---
function lanzarFelicitacion() {
    const contenedor = document.getElementById('efecto-celebracion');
    contenedor.className = 'celebracion-activa';
    
    const elementos = ['⭐', '🌟', '🎉', '✨', '🎈', '🏆', '🌈'];
    let html = '<div class="cartel-felicitacion">¡BIEN HECHO! 🌟</div>';
    
    for (let i = 0; i < 20; i++) {
        const item = elementos[Math.floor(Math.random() * elementos.length)];
        const posX = Math.random() * 92;
        const duracion = 1 + Math.random() * 1.5;
        const retraso = Math.random() * 0.3;
        html += `<div class="particula-confeti" style="left:${posX}vw; animation-duration:${duracion}s; animation-delay:${retraso}s;">${item}</div>`;
    }

    contenedor.innerHTML = html;

    setTimeout(() => {
        contenedor.className = 'celebracion-oculta';
        contenedor.innerHTML = '';
    }, 1200);
}

function finalizarJuegoModal() {
    sonar('victoria_fanfarria');
    hablarSencillo("¡Felicidades! ¡Lo lograste!");

    const modal = document.getElementById('modal-fin-juego');
    const btnRepetir = document.getElementById('btn-repetir-juego');
    
    btnRepetir.onclick = () => {
        modal.className = 'modal-oculto';
        iniciarJuego(juegoActual);
    };

    setTimeout(() => {
        modal.className = 'modal-activo';
    }, 600);
}

function iniciarJuego(juego) {
    sonar('click');
    juegoActual = juego;
    contadorAciertosRonda = 0;
    
    document.getElementById('modal-fin-juego').className = 'modal-oculto';
    document.getElementById('menu-juegos').classList.add('oculta');
    document.getElementById('pantalla-juego').classList.remove('oculta');

    if (juego === 'memoria') cargarMemoria24();
    if (juego === 'palabra') cargarJuegoPalabra();
    if (juego === 'conteo') cargarJuegoConteo();
    if (juego === 'color') cargarJuegoColor();
    if (juego === 'mayor') cargarJuegoMayor();
}

function volverAMenuJuegos() {
    sonar('click');
    document.getElementById('modal-fin-juego').className = 'modal-oculto';
    document.getElementById('pantalla-juego').classList.add('oculta');
    document.getElementById('menu-juegos').classList.remove('oculta');
}

// 1. MEMORIA DE 24 CARTAS
function cargarMemoria24() {
    const emojisDisponibles = [...poolEmojisGenerales, "🦁", "🐘", "🍦", "🌙", "🦒", "🧀", "🐢"].sort(() => Math.random() - 0.5);
    const seleccion12 = emojisDisponibles.slice(0, 12);
    let cartas = [...seleccion12, ...seleccion12].sort(() => Math.random() - 0.5);
    let seleccionadas = [];
    let parejasEncontradas = 0;

    let html = '<h3>🧠 Encuentra las 12 Parejas</h3><div class="grid-memoria-24">';
    cartas.forEach((e, i) => {
        html += `<button class="carta-memoria-24" id="c-${i}" onclick="voltearCarta(this, '${e}')">❓</button>`;
    });
    html += '</div>';
    document.getElementById('contenido-juego').innerHTML = html;

    window.voltearCarta = function(btn, emoji) {
        if (seleccionadas.length < 2 && btn.innerText === '❓') {
            sonar('click');
            btn.innerText = emoji;
            seleccionadas.push({ btn, emoji });

            if (seleccionadas.length === 2) {
                if (seleccionadas[0].emoji === seleccionadas[1].emoji) {
                    sumarEstrella();
                    parejasEncontradas++;
                    seleccionadas = [];

                    if (parejasEncontradas === 12) {
                        setTimeout(finalizarJuegoModal, 800);
                    }
                } else {
                    setTimeout(() => {
                        seleccionadas[0].btn.innerText = '❓';
                        seleccionadas[1].btn.innerText = '❓';
                        seleccionadas = [];
                    }, 1000);
                }
            }
        }
    };
}

// 2. COMPLETA LA PALABRA
function cargarJuegoPalabra() {
    const q = generarPreguntaPalabra();
    let html = `
        <div class="tarjeta-educativa">
            <div class="emoji-gigante">${q.emoji}</div>
            <div class="simbolo-gigante">${q.palabra}</div>
            <div class="grid-opciones">
    `;
    q.opciones.forEach(opc => {
        html += `<button onclick="validarRespuesta('${opc}', '${q.falta}', 'palabra')">${opc}</button>`;
    });
    html += '</div></div>';
    document.getElementById('contenido-juego').innerHTML = html;
}

// 3. CONTEO RÁPIDO
function cargarJuegoConteo() {
    const q = generarPreguntaConteo();
    let html = `
        <div class="tarjeta-educativa">
            <h2>¿Cuántos objetos hay?</h2>
            <div class="grid-conteo">${q.emoji.repeat(q.cantidad)}</div>
            <div class="grid-opciones">
    `;
    q.opciones.forEach(opc => {
        html += `<button onclick="validarRespuesta(${opc}, ${q.cantidad}, 'conteo')">${opc}</button>`;
    });
    html += '</div></div>';
    document.getElementById('contenido-juego').innerHTML = html;
}

// 4. ADIVINA EL COLOR
function cargarJuegoColor() {
    const q = generarPreguntaColor();
    let html = `
        <div class="tarjeta-educativa">
            <div class="cuadro-color" style="background-color: ${q.hex};"></div>
            <h2>¿Qué color es este?</h2>
            <div class="grid-opciones">
    `;
    q.opciones.forEach(opc => {
        html += `<button onclick="validarRespuesta('${opc}', '${q.correcta}', 'color')">${opc}</button>`;
    });
    html += '</div></div>';
    document.getElementById('contenido-juego').innerHTML = html;
}

// 5. ¿CUÁL ES MAYOR?
function cargarJuegoMayor() {
    const q = generarPreguntaMayor();
    let html = `
        <div class="tarjeta-educativa">
            <h2>Toca el cuadro que tenga MÁS objetos ⚖️</h2>
            <div class="grid-comparacion">
                <div class="caja-comparacion" onclick="validarRespuesta('A', '${q.ganador}', 'mayor')">
                    <div class="contenido-emojis-caja">${q.emojiA.repeat(q.cantA)}</div>
                    <p style="margin-top:10px; font-weight:bold; color:#7055C7;">GRUPO A</p>
                </div>
                <div class="caja-comparacion" onclick="validarRespuesta('B', '${q.ganador}', 'mayor')">
                    <div class="contenido-emojis-caja">${q.emojiB.repeat(q.cantB)}</div>
                    <p style="margin-top:10px; font-weight:bold; color:#7055C7;">GRUPO B</p>
                </div>
            </div>
        </div>
    `;
    document.getElementById('contenido-juego').innerHTML = html;
}

function validarRespuesta(elegido, correcto, tipoJuego) {
    if (elegido === correcto) {
        sumarEstrella();
        contadorAciertosRonda++;

        if (contadorAciertosRonda >= 5) {
            setTimeout(finalizarJuegoModal, 800);
            return;
        }

        if (tipoJuego === 'palabra') cargarJuegoPalabra();
        if (tipoJuego === 'conteo') cargarJuegoConteo();
        if (tipoJuego === 'color') cargarJuegoColor();
        if (tipoJuego === 'mayor') cargarJuegoMayor();
    } else {
        sonar('click');
    }
}