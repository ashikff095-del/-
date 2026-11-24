import makeWASocket, { useMultiFileAuthState } from '@whiskeysockets/baileys';
import pino from 'pino';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ask = (q) => new Promise(resolve => rl.question(q, resolve));

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth');

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false
  });

  sock.ev.on('creds.update', saveCreds);

  if (!state.creds.registered) {
    const number = await ask('Enter WhatsApp number (country code): ');
    const code = await sock.requestPairingCode(number.trim());
    console.log('\nYour Pairing Code:', code);
    console.log('\nWhatsApp > Linked devices > Link a device > Link with phone number');
  }

  sock.ev.on('connection.update', ({ connection }) => {
    if (connection === 'open') {
      console.log('\nWhatsApp Connected Successfully! 🎉');
      rl.close();
    }
  });
}

start().catch(console.error);
