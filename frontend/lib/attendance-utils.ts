import { Asistencia, Empleado } from "@/types";

// --- CONFIGURACIÓN ---
const HORA_ENTRADA_BASE = 9;
const MINUTOS_TOLERANCIA = 15;

// --- TIPOS EXPORTADOS ---
export interface ReporteFila {
  id: string;
  empleado: { nombre: string; rol: string };
  fecha: string;
  horaEntrada: Date | null;
  horaSalida: Date | null;
  inicioRefrigerio: Date | null;
  finRefrigerio: Date | null;
  tiempoRefrigerio: number; // milisegundos
  tiempoTrabajadoNeto: string; // "8h 30m"
  estado: "Puntual" | "Tarde" | "Falta Salida" | "Ausente";
  esTarde: boolean;
}

export type RangoFecha = "hoy" | "semana" | "mes";

// --- HELPER PRIVADO ---
const msToTime = (duration: number): string => {
  if (duration <= 0) return "0h 0m";
  const hours = Math.floor(duration / (1000 * 60 * 60));
  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
};

// --- FUNCIÓN PRINCIPAL ---
export function procesarReporte(
  data: Asistencia[],
  rango: RangoFecha
): ReporteFila[] {
  const reporte: Record<string, ReporteFila> = {};

  // 1. Filtro de Fechas
  const hoy = new Date();
  const inicioSemana = new Date(
    new Date().setDate(hoy.getDate() - hoy.getDay() + 1)
  );
  const inicioMes = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  );

  const dataFiltrada = data.filter((item) => {
    const fechaItem = new Date(item.fecha_registro);
    // Normalizamos a las 00:00:00 para comparar solo fechas
    fechaItem.setHours(0, 0, 0, 0);
    const fechaHoy = new Date();
    fechaHoy.setHours(0, 0, 0, 0);

    if (rango === "hoy") return fechaItem.getTime() === fechaHoy.getTime();
    if (rango === "semana") return fechaItem >= inicioSemana;
    if (rango === "mes") return fechaItem >= inicioMes;
    return true;
  });

  // 2. Procesamiento
  dataFiltrada.forEach((registro) => {
    // Verificación de tipo segura para 'empleado'
    // Asumimos que la API ya normalizó el objeto, pero TypeScript necesita confirmación
    const empData = registro.empleado as unknown as Empleado | null;

    if (!empData) return;

    const fechaSimple = new Date(registro.fecha_registro).toLocaleDateString(
      "es-PE"
    );
    // Usamos documentId o fallback a id
    const empId =
      empData.documentId || (empData.id ? String(empData.id) : "unknown");
    const key = `${empId}_${fechaSimple}`;

    if (!reporte[key]) {
      reporte[key] = {
        id: key,
        empleado: { nombre: empData.nombre, rol: empData.rol_operativo },
        fecha: fechaSimple,
        horaEntrada: null,
        horaSalida: null,
        inicioRefrigerio: null,
        finRefrigerio: null,
        tiempoRefrigerio: 0,
        tiempoTrabajadoNeto: "-",
        estado: "Falta Salida",
        esTarde: false,
      };
    }

    const current = reporte[key];
    const fechaReg = new Date(registro.fecha_registro);

    // Mapeo de eventos
    if (registro.tipo === "entrada") {
      current.horaEntrada = fechaReg;
      const hora = fechaReg.getHours();
      const min = fechaReg.getMinutes();
      if (
        hora > HORA_ENTRADA_BASE ||
        (hora === HORA_ENTRADA_BASE && min > MINUTOS_TOLERANCIA)
      ) {
        current.estado = "Tarde";
        current.esTarde = true;
      } else {
        current.estado = "Puntual";
      }
    } else if (registro.tipo === "salida") current.horaSalida = fechaReg;
    else if (registro.tipo === "inicio_refrigerio")
      current.inicioRefrigerio = fechaReg;
    else if (registro.tipo === "fin_refrigerio")
      current.finRefrigerio = fechaReg;
  });

  // 3. Cálculo Final
  return Object.values(reporte).map((fila) => {
    // Descuento de refrigerio
    if (fila.inicioRefrigerio && fila.finRefrigerio) {
      fila.tiempoRefrigerio =
        fila.finRefrigerio.getTime() - fila.inicioRefrigerio.getTime();
    }

    // Cálculo Neto
    if (fila.horaEntrada && fila.horaSalida) {
      const bruto = fila.horaSalida.getTime() - fila.horaEntrada.getTime();
      const neto = bruto - fila.tiempoRefrigerio;
      fila.tiempoTrabajadoNeto = msToTime(neto);

      // Si ya salió, actualizamos estado si estaba pendiente
      if (fila.estado === "Falta Salida") {
        // Aquí podrías agregar lógica si salió muy temprano, etc.
        fila.estado = fila.esTarde ? "Tarde" : "Puntual";
      }
    } else if (fila.horaEntrada && !fila.horaSalida) {
      fila.tiempoTrabajadoNeto = "En curso...";
    }

    return fila;
  });
}
// Agrega esta importación al principio del archivo junto con las otras
import * as XLSX from "xlsx";

// ... (El resto de tu código procesarReporte sigue igual) ...

// --- NUEVA FUNCIÓN: EXPORTAR A EXCEL ---
export function descargarExcel(data: ReporteFila[]) {
  // 1. Mapeamos los datos para que las columnas del Excel tengan nombres bonitos
  const datosExcel = data.map((fila) => ({
    Empleado: fila.empleado.nombre,
    Rol: fila.empleado.rol,
    Fecha: fila.fecha,
    "Hora Entrada": fila.horaEntrada
      ? fila.horaEntrada.toLocaleTimeString()
      : "-",
    "Hora Salida": fila.horaSalida ? fila.horaSalida.toLocaleTimeString() : "-",
    "Tiempo Refrigerio":
      fila.tiempoRefrigerio > 0
        ? `${Math.floor(fila.tiempoRefrigerio / 60000)} min`
        : "-",
    "Horas Netas": fila.tiempoTrabajadoNeto,
    Estado: fila.estado,
    Observación: fila.esTarde ? "LLEGADA TARDÍA" : "",
  }));

  // 2. Crear una Hoja de trabajo (Worksheet)
  const hoja = XLSX.utils.json_to_sheet(datosExcel);

  // 3. Ajustar ancho de columnas automáticamente (Opcional pero se ve Pro)
  const wscols = [
    { wch: 20 }, // Empleado
    { wch: 15 }, // Rol
    { wch: 12 }, // Fecha
    { wch: 15 }, // Entrada
    { wch: 15 }, // Salida
    { wch: 15 }, // Refrigerio
    { wch: 12 }, // Horas
    { wch: 15 }, // Estado
    { wch: 20 }, // Observación
  ];
  hoja["!cols"] = wscols;

  // 4. Crear el Libro (Workbook) y agregar la hoja
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, "Reporte Asistencia");

  // 5. Generar archivo y descargar
  const fechaHoy = new Date().toISOString().split("T")[0];
  XLSX.writeFile(libro, `Reporte_Asistencia_${fechaHoy}.xlsx`);
}
