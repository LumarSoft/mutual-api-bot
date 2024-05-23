import { createBot, createProvider, createFlow } from "@builderbot/bot";
import { MemoryDB as Database } from "@builderbot/bot";
import { BaileysProvider as Provider } from "@builderbot/provider-baileys";
import { Contact } from "./types/contact";
import { allFlows } from "./allflows";
import cors from "cors";

const PORT = process.env.PORT ?? 3008

const main = async () => {
    const adapterProvider = createProvider(Provider);
    const adapterDB = new Database();
    const adapterFlow = createFlow(allFlows);

    const { handleCtx, httpServer } = await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
      });

    adapterProvider.server.use(cors({ origin: "*", methods: ["GET", "POST"] }));
    adapterProvider.server.get("/funciona", (req, res) => res.end("Funciona"));

    adapterProvider.server.post(
        "/premio",
        handleCtx(async (bot, req, res) => {
            const contacts = req.body;
            try {
                const promises = contacts.map(async (contact: Contact) => {
                    const name = contact.name;
                    const phone = Number("549" + contact["tel"]);
                    const bono = contact.bono;

                    const message1 = `Hola ${name}, te informamos que el ganador del sorteo de este mes es el afiliado con numero de bono ${bono}.`;
                    await bot.sendMessage(phone.toString(), message1, {});
                });
                await Promise.all(promises);
            } catch (error) {
                console.error("Error al enviar mensajes:", error);
            }
            res.end("Mensajes enviados.");
        })
    );

    httpServer(+PORT);
};

main()