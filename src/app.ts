import { createProvider } from "@bot-whatsapp/bot";
import { BaileysProvider, handleCtx } from "@bot-whatsapp/provider-baileys";
import cors from "cors";
import { Contact } from "./interfaces/contact";

const PORT = process.env.PORT ?? 3008

const main = async () => {
    const provider = createProvider(BaileysProvider);

    provider.initHttpServer(3002);

    provider.http?.server.use(
        cors({
            origin: "*",
            methods: "POST",
        })
    );

    provider.http?.server.get("/funciona", (req, res) => {
        res.end("Funciona.");
    });

    provider.http?.server.post(
        "/rechazos",
        handleCtx(async (bot, req, res) => {
            const contacts = req.body;
            try {
                const promises = contacts.map(async (contact: Contact) => {
                    const name = contact.Nombre;
                    const phone = Number("549" + contact["Tel. Celular"]);
                    const premio = contact.Premio;
                    const ganador = contact.Ganador;

                    const message1 = `Hola ${name}, te escribimos desde la mutual para informarte que el premio ${premio} lo gano el afiliado ${ganador}. Gracias por participar.`;
                    await bot.sendMessage(phone, message1, {});
                });
                await Promise.all(promises);
            } catch (error) {
                console.error("Error al enviar mensajes:", error);
            }
            res.end("Mensajes enviados.");
        })
    );

    // para cuando se desconecta
    provider.on("disconnect", () => {
        console.log("Se desconectó el bot.");
    });
}

main()
