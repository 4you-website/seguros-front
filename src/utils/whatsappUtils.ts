import Swal from "sweetalert2";
import html2canvas from "html2canvas";
import { formatNumber } from "./formatNumber";

// ---------------------------------------------------------
// 📤 Compartir por WhatsApp (texto o imagen)
// ---------------------------------------------------------
export const compartirPorWhatsApp = async (
    id: string,
    plan: any,
    promo: any,
    cotizacion: any
) => {
    // 1️⃣ Solicitar número y tipo de envío
    const { value: formValues, isConfirmed } = await Swal.fire({
        html: ` <div class="flex flex-row items-center justify-center text-gray-950 mb-3 gap-2 ">
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
            const input = document.getElementById("numeroCliente") as HTMLInputElement;
            const btnTexto = document.getElementById("btnTexto");
            const btnImagen = document.getElementById("btnImagen");

            const close = (value: any) => Swal.close({ isConfirmed: true, value });

            btnTexto?.addEventListener("click", () =>
                close({ tipo: "texto", numero: input.value.trim() })
            );
            btnImagen?.addEventListener("click", () =>
                close({ tipo: "imagen", numero: input.value.trim() })
            );
        },
    });

    if (!isConfirmed || !formValues?.numero) return;

    const numero = formValues.numero.replace(/\D/g, ""); // solo números
    const tipo = formValues.tipo;
    const telefono = `549${numero}`;

    // 2️⃣ Armar mensaje base
    const mensaje = `
🚗 *Cotización Provincia Seguros*
------------------------------------
💡 *Plan:* ${plan.descripcion.trim()}
💰 *Premio:* $${formatNumber(promo?.premio)}
🪙 *Comisión:* $${formatNumber(promo?.comision)}
📅 *Vigencia:* ${promo?.vigencia}
📄 *Prima comisionable:* $${formatNumber(promo?.primaComisionable)}
------------------------------------
📅 *Fecha:* ${cotizacion?.fechaCotizacion}
🔢 *Número:* ${cotizacion?.numeroCotizacion}
`.trim();

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    // 3️⃣ Si elige compartir texto
    if (tipo === "texto") {
        const baseUrl = isMobile ? "https://wa.me" : "https://web.whatsapp.com/send";
        const url = `${baseUrl}?phone=${telefono}&text=${encodeURIComponent(mensaje)}`;
        window.open(url, "_blank");
        return;
    }

    // 4️⃣ Si elige compartir como imagen
    const card = document.getElementById(id);
    if (!card) {
        Swal.fire("Error", "No se encontró la tarjeta a compartir.", "error");
        return;
    }

    try {
        const canvas = await html2canvas(card, { backgroundColor: null, useCORS: true, scale: 2 });
        const image = canvas.toDataURL("image/png");
        const blob = await (await fetch(image)).blob();
        const file = new File([blob], `cotizacion-${plan.plan}.png`, { type: "image/png" });

        if (isMobile && navigator.canShare && navigator.canShare({ files: [file] })) {
            // 📱 En móvil, compartir directo con WhatsApp
            await navigator.share({
                title: "Cotización Provincia Seguros",
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
        console.error(err);
        Swal.fire("Error", "No se pudo generar la imagen.", "error");
    }
};
