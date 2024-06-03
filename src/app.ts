import { createBot, createProvider, createFlow } from "@builderbot/bot";
import { MemoryDB as Database } from "@builderbot/bot";
import { BaileysProvider as Provider } from "@builderbot/provider-baileys";
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
        "/enviar-mensajes",
        handleCtx(async (bot, req, res) => {
            const { phones, ganador } = req.body;
            console.log(phones);
            console.log(ganador);

            if (!Array.isArray(phones) || phones.length === 0) {
                return res.status(400).send("Formato de datos incorrecto o sin contactos.");
            }

            try {
                const promises = phones.map(async (phone) => {

                    const message = `Hola ${phone.apellido}, te escribimos de la mutual de Gendarmería Nacional para informarte que el ganador del sorteo mensual es el cliente número ${ganador[0].cliente}, con el premio ${ganador[0].pre_pen}.`;
                    const numero = `549${phone.tel}`;

                    await bot.sendMessage(numero, message, {});

                });

                await Promise.all(promises);
                res.end("Mensajes enviados.");

            } catch (error) {
                console.error("Error al enviar mensajes:", error);
                res.status(500).send("Error al enviar mensajes");
            }
        })
    );

    httpServer(+PORT);
};

main()