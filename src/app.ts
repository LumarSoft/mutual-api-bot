import { createBot, createProvider, createFlow } from "@builderbot/bot";
import { MemoryDB as Database } from "@builderbot/bot";
import { BaileysProvider as Provider } from "@builderbot/provider-baileys";
import { allFlows } from "./allflows";
import cors from "cors";
import multer from "multer";
import path, { join } from "path";
import fs from "fs";

const PORT = process.env.PORT ?? 3008;

const main = async () => {
  const adapterProvider = createProvider(Provider);
  const adapterDB = new Database();
  const adapterFlow = createFlow(allFlows);

  const { handleCtx, httpServer } = await createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  });

  const upload = multer({ storage });

  adapterProvider.server.use(cors({ origin: "*", methods: ["GET", "POST"] }));
  adapterProvider.server.get("/funciona", (req, res) => res.end("Funciona"));

  adapterProvider.server.post(
    "/enviar-mensajes",
    upload.single("file"),
    handleCtx(async (bot, req, res) => {
      try {
        const { phones: phonesString, message: messageString } = req.body;
        const file = req.file;

        if (!phonesString) {
          res.end("Faltaron los numeros de telefono");
          return;
        }

        let phones;
        try {
          phones = JSON.parse(phonesString);
        } catch (error) {
          console.error("Error al parsear 'phones':", error);
          res.end("Formato de 'phones' inválido");
          return;
        }

        if (!Array.isArray(phones)) {
          res.end("'phones' debe ser un array");
          return;
        }

        const promises = phones.map(async (phone) => {
          const numero = `549${phone.tel}`;
          const message = messageString;

          if (file) {
            const pathLocal = join("uploads/", file.originalname);

            if (message !== "") {
              // En caso que haya mensaje se envia el mensaje y el archivo
              await bot.sendMessage(numero, message, {});
              await bot.sendMessage(numero, message, { media: pathLocal });
            } else {
              //  En caso que no haya mensaje se envia solo el archivo
              await bot.sendMessage(numero, message, { media: pathLocal });
            }

            // En caso que no haya archivo se envia solo el mensaje
          } else {
            await bot.sendMessage(numero, message, {});
          }
        });

        await Promise.all(promises);
        res.end("Mensajes enviados");
      } catch (error) {
        console.error("Error en el manejo del mensaje:", error);
        res.end("Error interno del servidor");
      }
    })
  );

  httpServer(+PORT);
};

main();
