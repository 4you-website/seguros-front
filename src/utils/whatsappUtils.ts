import Swal from "sweetalert2";
import html2canvas from "html2canvas";
import { formatNumber } from "./formatNumber";
import type { Cotizacion, CotizacionPlan } from "../types/Cotizacion";

// Mapeo simple de id de aseguradora → etiqueta visible
const getCompaniaLabel = (id: string): string => {
    switch (id.toLowerCase()) {
        case "atm":
            return "ATM";
        case "provincia":
            return "Provincia Seguros";
        case "fedpat":
            return "Federación Patronal";
        case "sancor":
            return "Sancor";
        default:
            return id.toUpperCase();
    }
};

export const compartirPorWhatsApp = async (
    id: string,
    plan: CotizacionPlan,
    _promo: any,
    cotizacion: Cotizacion | null
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

            const close = (value: any) =>

                Swal.close({ isConfirmed: true, value });

            btnTexto?.addEventListener("click", () =>
                close({ tipo: "texto", numero: input?.value.trim() || "" })
            );
            btnImagen?.addEventListener("click", () =>
                close({ tipo: "imagen", numero: input?.value.trim() || "" })
            );
        },
    });

    if (!isConfirmed || !formValues?.numero) return;

    const numero = String(formValues.numero).replace(/\D/g, ""); // solo números
    const tipo = formValues.tipo;
    const telefono = `549${numero}`;

    // 2️⃣ Armar mensaje base usando el NUEVO modelo de plan
    const compania = getCompaniaLabel(plan.aseguradora);

    // Intentamos sacar metadata específica de esa aseguradora, si existe
    const rawAseguradora = cotizacion?.raw?.[plan.aseguradora];
    const fechaCotizacion =
        rawAseguradora?.fechaCotizacion || rawAseguradora?.fecha_cotizacion || "";
    const numeroCotizacion =
        rawAseguradora?.numeroCotizacion ||
        rawAseguradora?.id_cotizacion ||
        plan.idCotizacion ||
        "";

    const lineas: string[] = [
        `🚗 *Cotización ${compania}*`,
        "------------------------------------",
        `🏢 *Compañia:* ${plan.aseguradora.toUpperCase()}`,
        `💡 *Plan:* ${plan.plan}`,
        `🛡️ *Cobertura:* ${plan.cubre}`,
        `💰 *Cuota${plan.frecuencia ? ` (${plan.frecuencia})` : ""}:* $${formatNumber(
            plan.cuota
        )}`,        
        `🛡️ *Suma asegurada:* $${formatNumber(plan.sumaAsegurada)}`,
    ];

    if (plan.ajuste) {
        lineas.push(`⚙️ *Ajuste:* ${plan.ajuste}`);
    }

    if (fechaCotizacion) {
        lineas.push(`📅 *Fecha:* ${fechaCotizacion}`);
    }

    if (numeroCotizacion) {
        lineas.push(`🔢 *Nº Cotización:* ${numeroCotizacion}`);
    }

    const mensaje = lineas.join("\n");

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    // 3️⃣ Si elige o
    if (tipo === "texto") {
        const baseUrl = isMobile ? "https://wa.me" : "https://web.whatsapp.com/send";
        const url = `${baseUrl}?phone=${telefono}&text=${encodeURIComponent(mensaje)}`;
        window.open(url, "_blank");
        return;
    }

    // 4️⃣ Si elige compartir como imagen (screenshot de la card)
    const card = document.getElementById(id);
    if (!card) {
        Swal.fire("Error", "No se encontró la tarjeta a compartir.", "error");
        return;
    }

    // 🔹 Ocultamos temporalmente los bloques marcados con data-hide-on-share="true"
    const elementsToHide = Array.from(
        card.querySelectorAll<HTMLElement>('[data-hide-on-share="true"]')
    );
    const previousVisibility = elementsToHide.map((el) => el.style.visibility);

    elementsToHide.forEach((el) => {
        el.style.visibility = "hidden";
    });
    try {
        const canvas = await html2canvas(card, {
            backgroundColor: null,
            useCORS: true,
            scale: 2,
        });

        elementsToHide.forEach((el, idx) => {
            el.style.visibility = previousVisibility[idx];
        });
        const image = canvas.toDataURL("image/png");
        const blob = await (await fetch(image)).blob();
        const file = new File([blob], `cotizacion-${plan.plan}.png`, {
            type: "image/png",
        });

        if (isMobile && (navigator as any).canShare && (navigator as any).canShare({ files: [file] })) {
            // 📱 En móvil, compartir directo con WhatsApp
            await (navigator as any).share({
                title: `Cotización ${compania}`,
                text: mensaje,
                files: [file],
            });
        } else {
            // 💻 En desktop, descargar y abrir WhatsApp Web
            const link = document.createElement("a");
            link.href = image;
            link.download = `cotizacion-${plan.plan}.png`;
            link.click();

            const baseUrl = "https://web.whatsapp.com/send";
            const url = `${baseUrl}?phone=${telefono}&text=${encodeURIComponent(mensaje)}`;
            window.open(url, "_blank");

            Swal.fire({
                icon: "info",
                title: "Imagen descargada",
                text: "Se descargó la cotización. Pegala en el chat de WhatsApp Web.",
                timer: 4000,
                showConfirmButton: false,
            });
        }
    } catch (err) {
        // Restaurar por si falló antes
        elementsToHide.forEach((el, idx) => {
            el.style.visibility = previousVisibility[idx];
        });
        console.error(err);
        Swal.fire("Error", "No se pudo generar la imagen.", "error");
    }
};
