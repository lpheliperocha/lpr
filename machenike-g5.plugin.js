// machenike-g5.plugin.js

// 1️⃣ Identificação do dispositivo
export function Name()         { return "Machenike G5"; }
export function VendorId()     { return 0x2345; }
export function ProductId()    { return 0xe02f; }  // ajuste para 0xE02F se necessário
export function Publisher()    { return "Phelipe"; }
export function Documentation(){ return "https://github.com/lpheliperocha/lpr/blob/main/machenike-g5.plugin.js"; }

// 2️⃣ Grid de Preview (12 LEDs em linha)
export function Size()            { return [12, 1]; }
export function DefaultPosition() { return [0, 0]; }
export function DefaultScale()    { return 1.0; }

// 3️⃣ Parâmetros configuráveis
export function ControllableParameters() {
  return [
    { property: "LightingMode",  group: "lighting", label: "Lighting Mode",  type: "combobox", values: ["Canvas","Forced"], default: "Canvas" },
    { property: "forcedColor",   group: "lighting", label: "Forced Color",   type: "color",     default: "ffffff" },
    { property: "shutdownColor", group: "lighting", label: "Shutdown Color", type: "color",     default: "000000" }
  ];
}

// 4️⃣ Mapeamento de 12 LEDs sequenciais
const vLedNames     = Array.from({ length: 12 }, (_, i) => `LED${i+1}`);
const vLedPositions = Array.from({ length: 12 }, (_, i) => [i, 0]);

export function LedNames()     { return vLedNames; }
export function LedPositions() { return vLedPositions; }

// 5️⃣ Renderização e Shutdown
export function Render()   { sendColors(false); }
export function Shutdown(){ sendColors(true); }

function sendColors(shutdown = false) {
  const rgb = grabColors(shutdown);
  const packet = [0x08, 0x0A, 0x7A, 0x01, 0, 0, 0, 0].concat(rgb);
  device.send_report(packet, packet.length);
}

function grabColors(shutdown) {
  const out = [];
  for (let i = 0; i < vLedPositions.length; i++) {
    const [x, y] = vLedPositions[i];
    let col;
    if (shutdown)                    col = hexToRgb(shutdownColor);
    else if (LightingMode === "Forced") col = hexToRgb(forcedColor);
    else                             col = device.color(x, y);
    out.push(col[0], col[1], col[2]);
  }
  return out;
}

function hexToRgb(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return [parseInt(m[1],16), parseInt(m[2],16), parseInt(m[3],16)];
}

// 6️⃣ Validação: só o canal de iluminação RGB (interface 1)
export function validate(endpoint) {
  return endpoint.vendorId   === VendorId()
      && endpoint.productId  === ProductId()
      && endpoint.interface  === 1
      && endpoint.usage      === 0x0001
      && endpoint.usage_page === 0xFF00;
}

// 7️⃣ Ícone do plugin
export function Image() {
  return "https://raw.githubusercontent.com/lpheliperocha/lpr/9dcfeef81c5028e9548afdde37dcefd2e125c526/Screenshot_4-removebg-preview.png";
}
