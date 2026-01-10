import Swal from "sweetalert2";
import html2canvas from "html2canvas";
import { formatNumber } from "./formatNumber";
import type { Cotizacion, CotizacionPlan } from "../types/Cotizacion";
import { getCompaniaNombre } from "../companiasConfig";

// --------------------------------------------------
// Helpers
// --------------------------------------------------



const isMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

/**
 * Normaliza teléfonos para WhatsApp (Argentina).
 * Devuelve: 54911xxxxxxxx (sin +).
 * Soporta: +54 9..., 54..., 011..., 11..., con/ sin "15", etc.
 */
export const normalizeWhatsappPhoneAR = (rawPhone: string): string | null => {
    const raw = (rawPhone || "").trim();
    if (!raw) return null;

    let digits = raw.replace(/\D/g, "");
    if (!digits) return null;

    // Quitar prefijos típicos
    if (digits.startsWith("00")) digits = digits.slice(2);
    if (digits.startsWith("0")) digits = digits.slice(1);

    // Si viene con 54 (Argentina), asegurar 9 móvil
    if (digits.startsWith("54")) {
        if (digits.startsWith("549")) return digits;
        return `549${digits.slice(2)}`;
    }

    // Remover "15" (formato viejo) si aparece luego del código de área (2-4 dígitos)
    const tryRemove15 = (d: string) => {
        for (const areaLen of [2, 3, 4]) {
            if (d.length > areaLen + 2 && d.slice(areaLen, areaLen + 2) === "15") {
                const candidate = d.slice(0, areaLen) + d.slice(areaLen + 2);
                if (candidate.length >= 10 && candidate.length <= 11) return candidate;
            }
        }
        return d;
    };

    digits = tryRemove15(digits);

    // Validación mínima
    if (digits.length < 10) return null;

    // Asumimos AR móvil
    return `549${digits}`;
};

const openWhatsAppText = (telefono549: string, mensaje: string) => {
    const url = isMobile()
        ? `https://wa.me/${telefono549}?text=${encodeURIComponent(mensaje)}`
        : `https://web.whatsapp.com/send?phone=${telefono549}&text=${encodeURIComponent(mensaje)}`;

    window.open(url, "_blank");
};

// -----------------------
// Tipos
// -----------------------
export type VehiculoInfo = {
    marca?: string;
    modelo?: string;
    anio?: string | number;
};

const buildVehiculoLine = (vehiculo?: VehiculoInfo) => {
    if (!vehiculo) return "";
    const marca = (vehiculo.marca || "").trim();
    const modelo = (vehiculo.modelo || "").trim();
    const anio = vehiculo.anio ?? "";

    const nombre = `${marca} ${modelo}`.trim();
    if (!nombre && !anio) return "";

    // Ej: 🚙 *Vehículo:* Ford Fiesta (2018)
    return `🚙 *Vehículo:* ${nombre || "-"}${anio ? ` (${anio})` : ""}`;
};

type BuildMensajeOpts = {
    aseguradoraId?: string;
    extraTopLines?: string[];
    vehiculo?: VehiculoInfo;
};



export const buildMensajeCotizacionTexto = (
    plan: Partial<CotizacionPlan> & Record<string, any>,
    cotizacion: Cotizacion | null,
    opts?: BuildMensajeOpts
) => {
    const aseguradoraId = (opts?.aseguradoraId || plan.aseguradora || "").toString();
    const compania = (aseguradoraId);

    const rawAseguradora = aseguradoraId ? cotizacion?.raw?.[aseguradoraId] : undefined;

    const fechaCotizacion =
        rawAseguradora?.fechaCotizacion || rawAseguradora?.fecha_cotizacion || "";

    const numeroCotizacion =
        rawAseguradora?.numeroCotizacion ||
        rawAseguradora?.id_cotizacion ||
        plan.idCotizacion ||
        "";

    const header: string[] = [
        `🚗 *Cotización ${compania}*`,
        "------------------------------------",
    ];

    // ✅ Vehículo arriba (si existe)
    const vehiculoLine = buildVehiculoLine(opts?.vehiculo);
    if (vehiculoLine) header.push(vehiculoLine);

    const extra = (opts?.extraTopLines || []).filter(Boolean);
    if (extra.length) {
        header.push(...extra);
    }

    if (vehiculoLine || extra.length) {
        header.push("------------------------------------");
    }

    const suma =
        (plan as any).sumaAsegurada ??
        (plan as any).suma_asegurada ??
        0;

    const lineas: string[] = [
        ...header,
        `🏢 *Compañía:* ${aseguradoraId ? aseguradoraId.toUpperCase() : "-"}`,
        `💡 *Plan:* ${plan.plan ?? "-"}`,
        `🛡️ *Cobertura:* ${plan.cubre ?? "-"}`,
        `💰 *Cuota${plan.frecuencia ? ` (${plan.frecuencia})` : ""}:* $${formatNumber(plan.cuota ?? 0)}`,
        `🛡️ *Suma asegurada:* $${formatNumber(suma ?? 0)}`,
    ];

    if ((plan as any).ajuste) lineas.push(`⚙️ *Ajuste:* ${(plan as any).ajuste}`);
    if (fechaCotizacion) lineas.push(`📅 *Fecha:* ${fechaCotizacion}`);
    if (numeroCotizacion) lineas.push(`🔢 *Nº Cotización:* ${numeroCotizacion}`);

    return lineas.join("\n");
};


// --------------------------------------------------
// NUEVO: ClienteCotizaciones (solo texto, teléfono ya cargado)
// --------------------------------------------------

type CompartirTextoClienteArgs = {
    telefonoCliente: string | null | undefined;
    aseguradoraId: string; // key del objeto aseguradoras (atm/provincia/etc)
    plan: Record<string, any>; // el plan del modal (no necesariamente CotizacionPlan)
    cotizacion?: Cotizacion | null;  // por si tenés raw (si no, pasar null)
    extraTopLines?: string[];        // ej: cliente, vehículo, fecha, etc
    vehiculo?: VehiculoInfo;
};
export const compartirCotizacionTextoClientePorWhatsApp = (args: CompartirTextoClienteArgs) => {
    const telefono = normalizeWhatsappPhoneAR(args.telefonoCliente || "");

    if (!telefono) {
        Swal.fire({
            icon: "error",
            title: "Teléfono inválido",
            text: "El cliente no tiene un celular válido cargado. Editá el cliente y cargá su WhatsApp.",
        });
        return;
    }

    const mensaje = buildMensajeCotizacionTexto(args.plan, args.cotizacion ?? null, {
        aseguradoraId: args.aseguradoraId,
        extraTopLines: args.extraTopLines,
        vehiculo: args.vehiculo, // ✅
    });

    openWhatsAppText(telefono, mensaje);
};

type CompartirPlanesArgs = {
    planes: CotizacionPlan[];
    cotizacion: Cotizacion | null;
    telefonoPrefill?: string;
    extraTopLines?: string[];
    vehiculo?: VehiculoInfo; 
};

const buildMensajePlanesTexto = (
    planes: CotizacionPlan[],
    cotizacion: Cotizacion | null,
    extraTopLines?: string[],
     vehiculo?: VehiculoInfo
) => {
    const header: string[] = [
        `🚗 *Cotización - Planes seleccionados*`,
        "------------------------------------",
    ];
    // ✅ Vehículo arriba (si existe)
    const vehiculoLine = buildVehiculoLine(vehiculo);
    if (vehiculoLine) header.push(vehiculoLine);

    const extra = (extraTopLines || []).filter(Boolean);
    if (extra.length) {
        header.push(...extra);
        header.push("------------------------------------");
    }

    // agrupar por aseguradora
    const grouped = planes.reduce((acc, p) => {
        const key = String((p as any).aseguradora || "").toLowerCase();
        if (!key) return acc;
        if (!acc[key]) acc[key] = [];
        acc[key].push(p);
        return acc;
    }, {} as Record<string, CotizacionPlan[]>);

    const body: string[] = [...header];

    Object.entries(grouped).forEach(([asegId, list]) => {
        const compania = getCompaniaNombre(asegId);

        // metadata por aseguradora (si existe)
        const rawAseguradora = cotizacion?.raw?.[asegId];
        const fechaCotizacion =
            rawAseguradora?.fechaCotizacion || rawAseguradora?.fecha_cotizacion || "";
        const numeroCotizacion =
            rawAseguradora?.numeroCotizacion || rawAseguradora?.id_cotizacion || "";

        body.push(`🏢 *${compania}*`);
        if (fechaCotizacion) body.push(`📅 *Fecha:* ${fechaCotizacion}`);
        if (numeroCotizacion) body.push(`🔢 *Nº Cotización:* ${numeroCotizacion}`);

        list.forEach((p, idx) => {
            body.push(
                `\n*${idx + 1}) ${p.plan ?? "-"}*`,
                `🛡️ Cobertura: ${p.cubre ?? "-"}`,
                `💰 Cuota${p.frecuencia ? ` (${p.frecuencia})` : ""}: $${formatNumber(p.cuota ?? 0)}`,
                `🧾 Suma asegurada: $${formatNumber((p as any).sumaAsegurada ?? 0)}`,
                p.ajuste ? `⚙️ Ajuste: ${p.ajuste}` : ""
            );
        });

        body.push("\n------------------------------------");
    });

    // limpiar líneas vacías extra
    return body.filter((l) => l !== "").join("\n");
};

export const compartirPlanesPorWhatsApp = async (args: CompartirPlanesArgs) => {
    if (!args.planes?.length) return;

    const { value: numero, isConfirmed } = await Swal.fire({
        title: `Enviar ${args.planes.length > 1 ? "planes" : "plan"} por WhatsApp`,
        input: "text",
        inputValue: args.telefonoPrefill || "",
        inputPlaceholder: "Ej: 1165543333",
        showCancelButton: true,
        confirmButtonText: "Enviar",
        cancelButtonText: "Cancelar",
        didOpen: () => {
            // por si está dentro de modales con z-index alto
            const container = Swal.getContainer();
            if (container) container.style.zIndex = "9999";
        },
    });

    if (!isConfirmed) return;

    const telefono = normalizeWhatsappPhoneAR(String(numero || ""));
    if (!telefono) {
        Swal.fire("Error", "Número inválido. Verificá el celular ingresado.", "error");
        return;
    }

    const mensaje = buildMensajePlanesTexto(
        args.planes,
        args.cotizacion,
        args.extraTopLines,
        args.vehiculo
    );  
    openWhatsAppText(telefono, mensaje);
};


// --------------------------------------------------
// ORIGINAL: Cotizador (modal + texto/imagen) - se mantiene
// -----------
// ---------------------------------------
type CompartirPorWhatsAppOpts = {
    vehiculo?: VehiculoInfo;
    extraTopLines?: string[];
};

export const compartirPorWhatsApp = async (
    id: string,
    plan: CotizacionPlan,
    _promo: any,
    cotizacion: Cotizacion | null,
    options?: CompartirPorWhatsAppOpts
) => {
    // 1️⃣ Solicitar número y tipo de envío
    const { value: formValues, isConfirmed } = await Swal.fire({
        html: ` 
        <div class="flex flex-row items-center justify-center text-gray-950 mb-3 gap-2 ">
            <img src="/assets/images/whatsapp.png" alt="WhatsApp" width="32" height="auto" class="" />
            <span class="text-lg font-semibold">Compartir por WhatsApp</span>
        </div>
        <p class="text-sm mb-3 text-gray-600 dark:text-gray-300">
            Ingrese el número del cliente y elija el tipo de mensaje.
        </p>
        <input id="numeroCliente" type="text"
            class="swal2-input" placeholder="Ej: 1165543333">
        <div class="flex flex-col gap-2 mt-4">
            <button id="btnTexto" class="swal2-styled text-white w-3/4 self-center" style="background:#16a34a"> Compartir texto</button>
            <button id="btnImagen" class="swal2-styled text-white w-3/4 self-center" style="background:#2563eb"> Compartir imagen</button>
        </div>
        `,
        showConfirmButton: false,
        didOpen: () => {
            const input = document.getElementById("numeroCliente") as HTMLInputElement | null;
            const btnTexto = document.getElementById("btnTexto");
            const btnImagen = document.getElementById("btnImagen");

            const close = (value: any) => Swal.close({ isConfirmed: true, value });

            btnTexto?.addEventListener("click", () => close({ tipo: "texto", numero: input?.value.trim() || "" }));
            btnImagen?.addEventListener("click", () => close({ tipo: "imagen", numero: input?.value.trim() || "" }));
        },
    });

    if (!isConfirmed || !formValues?.numero) return;

    const tipo = formValues.tipo;
    const telefono = normalizeWhatsappPhoneAR(String(formValues.numero)) ?? null;

    if (!telefono) {
        Swal.fire("Error", "Número inválido. Verificá el celular ingresado.", "error");
        return;
    }

    const mensaje = buildMensajeCotizacionTexto(plan, cotizacion, {
        aseguradoraId: plan.aseguradora,
        vehiculo: options?.vehiculo,             // ✅
        extraTopLines: options?.extraTopLines,   // ✅
    });

    if (tipo === "texto") {
        openWhatsAppText(telefono, mensaje);
        return;
    }

    // 4️⃣ Si elige imagen (screenshot de la card)
    const card = document.getElementById(id);
    if (!card) {
        Swal.fire("Error", "No se encontró la tarjeta a compartir.", "error");
        return;
    }

    // 🔹 Ocultamos temporalmente los bloques marcados con data-hide-on-share="true"
    const elementsToHide = Array.from(card.querySelectorAll<HTMLElement>('[data-hide-on-share="true"]'));
    const previousVisibility = elementsToHide.map((el) => el.style.visibility);

    elementsToHide.forEach((el) => (el.style.visibility = "hidden"));



    try {
        const canvas = await html2canvas(card, {
            backgroundColor: null,
            useCORS: true,
            scale: 2,
        });

        elementsToHide.forEach((el, idx) => (el.style.visibility = previousVisibility[idx]));

        const image = canvas.toDataURL("image/png");
        const blob = await (await fetch(image)).blob();
        const file = new File([blob], `cotizacion-${plan.plan}.png`, { type: "image/png" });

        if (
            isMobile() &&
            (navigator as any).canShare &&
            (navigator as any).canShare({ files: [file] })
        ) {
            // 📱 En móvil, compartir directo
            await (navigator as any).share({
                title: `Cotización ${getCompaniaNombre(plan.aseguradora)}`,
                text: mensaje,
                files: [file],
            });
        } else {
            // 💻 En desktop, descargar y abrir WhatsApp Web
            const link = document.createElement("a");
            link.href = image;
            link.download = `cotizacion-${plan.plan}.png`;
            link.click();

            openWhatsAppText(telefono, mensaje);

            Swal.fire({
                icon: "info",
                title: "Imagen descargada",
                text: "Se descargó la cotización. Pegala en el chat de WhatsApp Web.",
                timer: 4000,
                showConfirmButton: false,
            });
        }
    } catch (err) {
        elementsToHide.forEach((el, idx) => (el.style.visibility = previousVisibility[idx]));
        console.error(err);
        Swal.fire("Error", "No se pudo generar la imagen.", "error");
    }
};
